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
} from "../lib/offramp";
import {
    resolveProviderChain,
    initiateOfframpPayout,
} from "../lib/offramp-providers";

const SECRET = "offramp_secret_xyz";

function sign(body: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

function seed() {
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
        const req = seed();
        expect(req.status).to.equal("pending");
        // Wait well past the old fake 10s timer window (scaled down) to prove
        // nothing flips it on its own.
        await new Promise((r) => setTimeout(r, 50));
        expect(getOfframpRequest(req.id)?.status).to.equal("pending");
    });

    it("only completes when the partner confirms", () => {
        const req = seed();
        updateOfframpStatus(req.id, "completed", { providerRef: "ach_trace_99" });
        const after = getOfframpRequest(req.id);
        expect(after?.status).to.equal("completed");
        expect(after?.providerRef).to.equal("ach_trace_99");
    });

    it("records failures with a reason", () => {
        const req = seed();
        updateOfframpStatus(req.id, "failed", { failureReason: "account_closed" });
        expect(getOfframpRequest(req.id)?.failureReason).to.equal("account_closed");
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
            // No Cybrid creds → cybrid is filtered out.
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
        function seedWithLicense(amount: number) {
            const r = seed();
            r.licenseNumber = "C11-0000123-LIC";
            r.riskScore = 5;
            r.amount = amount;
            return r;
        }

        it("batches selected pending payouts and moves them to processing", () => {
            const a = seedWithLicense(3000);
            const b = seedWithLicense(2000);
            const batch = createOfframpBatch([a.id, b.id]);
            expect(batch).to.not.equal(null);
            expect(batch!.totalAmount).to.equal(5000);
            expect(batch!.requestIds).to.have.members([a.id, b.id]);
            expect(getOfframpRequest(a.id)?.status).to.equal("processing");
        });

        it("exports a compliance CSV with license + amount + destination", () => {
            const a = seedWithLicense(1234);
            const csv = buildOtcExportCsv([getOfframpRequest(a.id)!]);
            const [header, row] = csv.split("\n");
            expect(header).to.contain("license_number");
            expect(header).to.contain("amount_usdc");
            expect(row).to.contain("C11-0000123-LIC");
            expect(row).to.contain("1234");
        });

        it("settles every payout in the batch with the wire reference", () => {
            const a = seedWithLicense(1000);
            const b = seedWithLicense(1500);
            const batch = createOfframpBatch([a.id, b.id])!;
            const res = settleOfframpBatch(batch.id, "WIRE-REF-001");
            expect(res).to.not.equal(null);
            expect(res!.settled.length).to.equal(2);
            expect(getOfframpRequest(a.id)?.status).to.equal("completed");
            expect(getOfframpRequest(a.id)?.providerRef).to.equal("WIRE-REF-001");
            // Idempotent — a second settle is a no-op.
            expect(settleOfframpBatch(batch.id, "WIRE-REF-001")).to.equal(null);
        });
    });
});
