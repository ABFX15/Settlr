/**
 * Off-ramp settlement tests.
 *
 * The key property: a request NEVER completes on its own — only a valid,
 * signature-verified partner webhook can mark it completed. No fake timers.
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/offramp.test.ts'
 */

import { expect } from "chai";
import crypto from "crypto";
import {
    createOfframpRequest,
    getOfframpRequest,
    updateOfframpStatus,
    verifyOfframpWebhook,
    createOfframpBatch,
    settleOfframpBatch,
    buildOtcExportCsv,
    type OfframpRequest,
} from "../lib/offramp";
import {
    resolveProviderChain,
    initiateOfframpPayout,
} from "../lib/offramp-providers";

const SECRET = "offramp_secret_xyz";

function sign(body: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

function seed(): Promise<OfframpRequest> {
    return createOfframpRequest({
        merchantId: "m_1",
        wallet: "Wa11et1111111111111111111111111111111111111",
        method: "ach",
        region: "US",
        currency: "USD",
        amount: 5000,
        localAmount: 5000,
        accountInfo: "****1234",
    });
}

describe("Off-ramp settlement", () => {
    it("new requests start pending and never auto-complete", async () => {
        const req = await seed();
        expect(req.status).to.equal("pending");
        await new Promise((r) => setTimeout(r, 50));
        expect((await getOfframpRequest(req.id))?.status).to.equal("pending");
    });

    it("only completes when the partner confirms", async () => {
        const req = await seed();
        await updateOfframpStatus(req.id, "completed", { providerRef: "ach_trace_99" });
        const after = await getOfframpRequest(req.id);
        expect(after?.status).to.equal("completed");
        expect(after?.providerRef).to.equal("ach_trace_99");
    });

    it("records failures with a reason", async () => {
        const req = await seed();
        await updateOfframpStatus(req.id, "failed", { failureReason: "account_closed" });
        expect((await getOfframpRequest(req.id))?.failureReason).to.equal("account_closed");
    });

    describe("webhook signature", () => {
        const body = JSON.stringify({ requestId: "ofr_x", status: "completed" });

        it("accepts a correctly signed body", () => {
            expect(verifyOfframpWebhook(body, sign(body, SECRET), SECRET)).to.equal(true);
        });

        it("rejects a wrong signature", () => {
            expect(verifyOfframpWebhook(body, sign(body, "attacker"), SECRET)).to.equal(false);
        });

        it("rejects a tampered body", () => {
            const evil = JSON.stringify({ requestId: "ofr_x", status: "completed", amount: 999 });
            expect(verifyOfframpWebhook(evil, sign(body, SECRET), SECRET)).to.equal(false);
        });

        it("rejects when no secret is set", () => {
            expect(verifyOfframpWebhook(body, sign(body, SECRET), "")).to.equal(false);
        });
    });

    describe("provider chain", () => {
        afterEach(() => {
            delete process.env.OFFBANK_OFFRAMP_PROVIDER;
            delete process.env.CYBRID_CLIENT_ID;
            delete process.env.CYBRID_CLIENT_SECRET;
            delete process.env.CYBRID_BANK_GUID;
        });

        it("defaults to the manual provider", () => {
            const chain = resolveProviderChain().map((p) => p.name);
            expect(chain).to.deep.equal(["manual"]);
        });

        it("drops an unconfigured provider but keeps manual as fallback", () => {
            process.env.OFFBANK_OFFRAMP_PROVIDER = "cybrid,manual";
            expect(resolveProviderChain().map((p) => p.name)).to.deep.equal(["manual"]);
        });

        it("includes a configured provider ahead of manual", () => {
            process.env.OFFBANK_OFFRAMP_PROVIDER = "cybrid,manual";
            process.env.CYBRID_CLIENT_ID = "id";
            process.env.CYBRID_CLIENT_SECRET = "secret";
            process.env.CYBRID_BANK_GUID = "bank_guid";
            expect(resolveProviderChain().map((p) => p.name)).to.deep.equal([
                "cybrid",
                "manual",
            ]);
        });

        it("manual initiation yields a pending payout (never auto-settles)", async () => {
            const res = await initiateOfframpPayout({
                requestId: "ofr_test",
                amount: 1000,
                currency: "USD",
                method: "ach",
                accountInfo: "****1",
                merchantWallet: "W",
            });
            expect(res.provider).to.equal("manual");
            expect(res.status).to.equal("pending");
        });
    });

    describe("OTC batch", () => {
        async function seedWithLicense(amount: number): Promise<OfframpRequest> {
            const r = await seed();
            r.licenseNumber = "C11-0000123-LIC";
            r.riskScore = 5;
            r.amount = amount;
            return r;
        }

        it("batches selected pending payouts and moves them to processing", async () => {
            const a = await seedWithLicense(3000);
            const b = await seedWithLicense(2000);
            const batch = await createOfframpBatch([a.id, b.id]);
            expect(batch).to.not.equal(null);
            expect(batch!.totalAmount).to.equal(5000);
            expect(batch!.requestIds).to.have.members([a.id, b.id]);
            expect((await getOfframpRequest(a.id))?.status).to.equal("processing");
        });

        it("exports a compliance CSV with license + amount + destination", async () => {
            const a = await seedWithLicense(1234);
            const csv = buildOtcExportCsv([(await getOfframpRequest(a.id))!]);
            const [header, row] = csv.split("\n");
            expect(header).to.contain("license_number");
            expect(header).to.contain("amount_usdc");
            expect(row).to.contain("C11-0000123-LIC");
            expect(row).to.contain("1234");
        });

        it("settles every payout in the batch with the wire reference", async () => {
            const a = await seedWithLicense(1000);
            const b = await seedWithLicense(1500);
            const batch = (await createOfframpBatch([a.id, b.id]))!;
            const res = await settleOfframpBatch(batch.id, "WIRE-REF-001");
            expect(res).to.not.equal(null);
            expect(res!.settled.length).to.equal(2);
            expect((await getOfframpRequest(a.id))?.status).to.equal("completed");
            expect((await getOfframpRequest(a.id))?.providerRef).to.equal("WIRE-REF-001");
            // Idempotent — a second settle is a no-op.
            expect(await settleOfframpBatch(batch.id, "WIRE-REF-001")).to.equal(null);
        });
    });
});
