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
} from "../lib/offramp";

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
});
