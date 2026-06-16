/**
 * Compliance payload assembler tests.
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/compliance-payload.test.ts'
 */

import { expect } from "chai";
import { assembleCompliancePayload } from "../lib/compliance-payload";
import { getOrCreateMerchantByWallet, createPayment } from "../lib/db";
import { createOfframpRequest } from "../lib/offramp";

const WALLET = "Wa11etProvenance1111111111111111111111111111";

describe("Compliance payload", () => {
    it("bundles license + business + funding provenance for a payout", async () => {
        const merchant = await getOrCreateMerchantByWallet(WALLET);

        // Two completed payments that fund the balance.
        const now = Date.now();
        await createPayment({
            sessionId: "s1",
            merchantId: merchant.id,
            merchantName: merchant.name,
            merchantWallet: WALLET,
            customerWallet: "buyer1",
            amount: 1200,
            currency: "USDC",
            description: "Invoice A",
            txSignature: "sigA",
            explorerUrl: "",
            createdAt: now - 2000,
            completedAt: now - 2000,
            status: "completed",
        });
        await createPayment({
            sessionId: "s2",
            merchantId: merchant.id,
            merchantName: merchant.name,
            merchantWallet: WALLET,
            customerWallet: "buyer2",
            amount: 800,
            currency: "USDC",
            description: "Invoice B",
            txSignature: "sigB",
            explorerUrl: "",
            createdAt: now - 1000,
            completedAt: now - 1000,
            status: "completed",
        });

        const req = await createOfframpRequest({
            merchantId: merchant.id,
            wallet: WALLET,
            method: "ach",
            region: "US",
            currency: "USD",
            amount: 1500,
            localAmount: 1500,
            accountInfo: "****9876",
            licenseNumber: "C11-0000777-LIC",
            riskScore: 3,
        });

        const payload = await assembleCompliancePayload(req);

        expect(payload.licenseNumber).to.equal("C11-0000777-LIC");
        expect(payload.amount).to.equal(1500);
        expect(payload.destinationAccount).to.equal("****9876");
        // Funding provenance should cover the payout amount.
        expect(payload.fundingSources.length).to.be.greaterThan(0);
        expect(payload.fundingCovered).to.be.greaterThan(payload.amount - 1);
        expect(payload.fundingSources[0].txSignature).to.be.a("string");
    });

    it("still produces a bundle when there is no funding history", async () => {
        const req = await createOfframpRequest({
            merchantId: "m_empty",
            wallet: "Wa11etEmpty111111111111111111111111111111111",
            method: "wire",
            region: "US",
            currency: "USD",
            amount: 500,
            localAmount: 500,
            accountInfo: "****0000",
        });
        const payload = await assembleCompliancePayload(req);
        expect(payload.fundingSources).to.deep.equal([]);
        expect(payload.fundingCovered).to.equal(0);
        expect(payload.amount).to.equal(500);
    });
});
