/**
 * Merchant compliance dossier tests.
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/compliance-report.test.ts'
 */

import { expect } from "chai";
import { assembleMerchantComplianceReport } from "../lib/compliance-report";
import { getOrCreateMerchantByWallet, createPayment } from "../lib/db";
import { createOfframpRequest } from "../lib/offramp";

const WALLET = "Wa11etDossier11111111111111111111111111111111";

describe("Merchant compliance dossier", () => {
    it("aggregates identity, KYB, AML, volume and off-ramp history", async () => {
        const merchant = await getOrCreateMerchantByWallet(WALLET);
        const now = Date.now();

        await createPayment({
            sessionId: "d1",
            merchantId: merchant.id,
            merchantName: merchant.name,
            merchantWallet: WALLET,
            customerWallet: "buyer",
            amount: 4200,
            currency: "USDC",
            description: "Wholesale order",
            txSignature: "sigD1",
            explorerUrl: "",
            createdAt: now - 5000,
            completedAt: now - 5000,
            status: "completed",
        });

        const off = await createOfframpRequest({
            merchantId: merchant.id,
            wallet: WALLET,
            method: "ach",
            region: "US",
            currency: "USD",
            amount: 1000,
            localAmount: 1000,
            accountInfo: "****1",
        });

        const report = await assembleMerchantComplianceReport(WALLET);

        expect(report.business.wallet).to.equal(WALLET);
        expect(report.kyb.provider).to.equal("sumsub");
        expect(report.aml.provider).to.equal("range");
        expect(report.aml.riskScore).to.be.a("number");
        expect(report.activity.completedPayments).to.be.greaterThan(0);
        expect(report.activity.totalVolumeUSDC).to.be.greaterThan(0);
        // The off-ramp is still pending (never auto-settles), so it shows pending.
        expect(report.offramp.pendingCount).to.be.greaterThan(0);
        expect(report.generatedAt).to.be.a("string");
        expect(off.status).to.equal("pending");
    });

    it("produces a report even for an unknown merchant", async () => {
        const report = await assembleMerchantComplianceReport(
            "Wa11etUnknown1111111111111111111111111111111",
        );
        expect(report.kyb.verified).to.equal(false);
        expect(report.activity.completedPayments).to.equal(0);
        expect(report.offramp.settledCount).to.equal(0);
    });
});
