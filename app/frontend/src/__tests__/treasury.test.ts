/**
 * Merchant Treasury Tests
 *
 * Tests the full treasury / merchant balance system:
 * - Balance creation and lookup
 * - Deposit crediting
 * - Reserve / release / refund lifecycle
 * - Fee calculation
 * - Transaction ledger queries
 * - Insufficient‑balance rejection
 * - Full payout lifecycle (deposit → reserve → release)
 * - Full refund lifecycle  (deposit → reserve → refund)
 *
 * All tests use the in-memory fallback (no Supabase required).
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/treasury.test.ts'
 */

import { expect } from "chai";
import {
    getOrCreateMerchantBalance,
    getMerchantBalance,
    creditMerchantBalance,
    reservePayoutFunds,
    releasePayoutFunds,
    refundReservedFunds,
    getTreasuryTransactions,
    calculatePayoutFee,
    type MerchantBalance,
} from "../lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a unique merchant id per test to avoid state collisions. */
const uid = () => `test_merchant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// 1. Balance Creation & Lookup
// ---------------------------------------------------------------------------

describe("Treasury — Balance Creation", () => {
    it("should create a zero balance for a new merchant", async () => {
        const mid = uid();
        const bal = await getOrCreateMerchantBalance(mid);

        expect(bal).to.not.be.null;
        expect(bal.id).to.match(/^mbal_/);
        expect(bal.merchantId).to.equal(mid);
        expect(bal.currency).to.equal("USDC");
        expect(bal.available).to.equal(0);
        expect(bal.pending).to.equal(0);
        expect(bal.reserved).to.equal(0);
        expect(bal.totalDeposited).to.equal(0);
        expect(bal.totalPayouts).to.equal(0);
        expect(bal.totalFees).to.equal(0);
        expect(bal.createdAt).to.be.instanceOf(Date);
    });

    it("should return same balance on repeated calls", async () => {
        const mid = uid();
        const b1 = await getOrCreateMerchantBalance(mid);
        const b2 = await getOrCreateMerchantBalance(mid);
        expect(b1.id).to.equal(b2.id);
    });

    it("getMerchantBalance returns null for unknown merchant", async () => {
        const result = await getMerchantBalance("nonexistent_" + Date.now());
        expect(result).to.be.null;
    });

    it("getMerchantBalance returns existing balance", async () => {
        const mid = uid();
        await getOrCreateMerchantBalance(mid);
        const bal = await getMerchantBalance(mid);
        expect(bal).to.not.be.null;
        expect(bal!.merchantId).to.equal(mid);
    });
});

// ---------------------------------------------------------------------------
// 2. Deposit / Credit
// ---------------------------------------------------------------------------

describe("Treasury — Deposit", () => {
    it("should credit the available balance", async () => {
        const mid = uid();
        const bal = await creditMerchantBalance(mid, 500, {
            txSignature: "sig_test_001",
            description: "Test deposit",
        });

        expect(bal.available).to.equal(500);
        expect(bal.totalDeposited).to.equal(500);
        expect(bal.pending).to.equal(0);
    });

    it("should accumulate multiple deposits", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 100);
        const bal = await creditMerchantBalance(mid, 250);
        expect(bal.available).to.equal(350);
        expect(bal.totalDeposited).to.equal(350);
    });

    it("should record a deposit transaction", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 100, { txSignature: "sig_dep_001" });

        const txs = await getTreasuryTransactions(mid, { type: "deposit" });
        expect(txs.length).to.be.greaterThanOrEqual(1);
        expect(txs[0].amount).to.equal(100);
        expect(txs[0].txSignature).to.equal("sig_dep_001");
        expect(txs[0].type).to.equal("deposit");
    });
});

// ---------------------------------------------------------------------------
// 3. Fee Calculation
// ---------------------------------------------------------------------------

describe("Treasury — Fee Calculation", () => {
    it("should be 1% for amounts >= $25", () => {
        expect(calculatePayoutFee(100)).to.equal(1);
        expect(calculatePayoutFee(1000)).to.equal(10);
        expect(calculatePayoutFee(50)).to.equal(0.5);
    });

    it("should have a $0.25 minimum fee", () => {
        expect(calculatePayoutFee(1)).to.equal(0.25);
        expect(calculatePayoutFee(10)).to.equal(0.25);
        expect(calculatePayoutFee(24)).to.equal(0.25);
    });

    it("should return $0.25 for $25 exactly", () => {
        // 25 * 0.01 = 0.25, same as minimum
        expect(calculatePayoutFee(25)).to.equal(0.25);
    });
});

// ---------------------------------------------------------------------------
// 4. Reserve Payout Funds
// ---------------------------------------------------------------------------

describe("Treasury — Reserve Funds", () => {
    it("should move funds from available to reserved", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);

        const fee = calculatePayoutFee(100);
        const result = await reservePayoutFunds(mid, 100, fee, "pay_test_001");

        expect(result.success).to.be.true;
        expect(result.balance!.available).to.equal(1000 - 100 - fee);
        expect(result.balance!.reserved).to.equal(100 + fee);
    });

    it("should reject reservation when insufficient balance", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 10);

        const fee = calculatePayoutFee(500);
        const result = await reservePayoutFunds(mid, 500, fee, "pay_test_002");

        expect(result.success).to.be.false;
        expect(result.error).to.include("Insufficient balance");
    });

    it("should record a payout_reserved transaction", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);

        await reservePayoutFunds(mid, 100, 1, "pay_tx_test");
        const txs = await getTreasuryTransactions(mid, { type: "payout_reserved" });
        expect(txs.length).to.be.greaterThanOrEqual(1);
        expect(txs[0].payoutId).to.equal("pay_tx_test");
    });
});

// ---------------------------------------------------------------------------
// 5. Release Funds (payout completed)
// ---------------------------------------------------------------------------

describe("Treasury — Release Funds", () => {
    it("should reduce reserved and record payout + fee totals", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);

        const payoutAmount = 100;
        const fee = calculatePayoutFee(payoutAmount);
        await reservePayoutFunds(mid, payoutAmount, fee, "pay_release_001");

        const bal = await releasePayoutFunds(mid, payoutAmount, fee, "pay_release_001");
        expect(bal.reserved).to.equal(0);
        expect(bal.totalPayouts).to.equal(payoutAmount);
        expect(bal.totalFees).to.equal(fee);
    });

    it("should record payout_released and fee_deducted transactions", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);
        await reservePayoutFunds(mid, 200, 2, "pay_release_002");
        await releasePayoutFunds(mid, 200, 2, "pay_release_002");

        const releaseTxs = await getTreasuryTransactions(mid, { type: "payout_released" });
        const feeTxs = await getTreasuryTransactions(mid, { type: "fee_deducted" });

        expect(releaseTxs.length).to.be.greaterThanOrEqual(1);
        expect(feeTxs.length).to.be.greaterThanOrEqual(1);
        expect(releaseTxs[0].amount).to.equal(200);
        expect(feeTxs[0].amount).to.equal(2);
    });
});

// ---------------------------------------------------------------------------
// 6. Refund Reserved Funds (payout expired/failed)
// ---------------------------------------------------------------------------

describe("Treasury — Refund Funds", () => {
    it("should move reserved back to available", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);

        const fee = calculatePayoutFee(100);
        await reservePayoutFunds(mid, 100, fee, "pay_refund_001");

        const bal = await refundReservedFunds(mid, 100, fee, "pay_refund_001");
        expect(bal.reserved).to.equal(0);
        expect(bal.available).to.equal(1000); // fully restored
    });

    it("should record a payout_refund transaction", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);
        await reservePayoutFunds(mid, 50, 0.5, "pay_refund_002");
        await refundReservedFunds(mid, 50, 0.5, "pay_refund_002");

        const txs = await getTreasuryTransactions(mid, { type: "payout_refund" });
        expect(txs.length).to.be.greaterThanOrEqual(1);
        expect(txs[0].payoutId).to.equal("pay_refund_002");
    });
});

// ---------------------------------------------------------------------------
// 7. Transaction Ledger
// ---------------------------------------------------------------------------

describe("Treasury — Transaction Ledger", () => {
    it("should return transactions in reverse chronological order", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 100);
        await creditMerchantBalance(mid, 200);

        const txs = await getTreasuryTransactions(mid);
        expect(txs.length).to.be.greaterThanOrEqual(2);
        expect(txs[0].createdAt.getTime()).to.be.greaterThanOrEqual(txs[1].createdAt.getTime());
    });

    it("should filter by type", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);
        await reservePayoutFunds(mid, 100, 1, "pay_filter_001");

        const deposits = await getTreasuryTransactions(mid, { type: "deposit" });
        const reserves = await getTreasuryTransactions(mid, { type: "payout_reserved" });

        expect(deposits.every((t) => t.type === "deposit")).to.be.true;
        expect(reserves.every((t) => t.type === "payout_reserved")).to.be.true;
    });

    it("should respect limit", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 10);
        await creditMerchantBalance(mid, 20);
        await creditMerchantBalance(mid, 30);

        const txs = await getTreasuryTransactions(mid, { limit: 2 });
        expect(txs.length).to.equal(2);
    });
});

// ---------------------------------------------------------------------------
// 8. Full Lifecycle — Deposit → Reserve → Release
// ---------------------------------------------------------------------------

describe("Treasury — Full Payout Lifecycle", () => {
    it("deposit → reserve → release leaves correct balances", async () => {
        const mid = uid();

        // 1. Deposit $500
        let bal = await creditMerchantBalance(mid, 500);
        expect(bal.available).to.equal(500);

        // 2. Reserve payout of $200 + fee
        const fee = calculatePayoutFee(200); // $2
        const res = await reservePayoutFunds(mid, 200, fee, "pay_lifecycle_001");
        expect(res.success).to.be.true;
        expect(res.balance!.available).to.equal(500 - 200 - fee);
        expect(res.balance!.reserved).to.equal(200 + fee);

        // 3. Release (payout delivered)
        bal = await releasePayoutFunds(mid, 200, fee, "pay_lifecycle_001");
        expect(bal.reserved).to.equal(0);
        expect(bal.available).to.equal(500 - 200 - fee); // unchanged from reserve
        expect(bal.totalPayouts).to.equal(200);
        expect(bal.totalFees).to.equal(fee);

        // 4. Verify transaction count
        const txs = await getTreasuryTransactions(mid);
        // deposit + reserve + release + fee = 4 transactions
        expect(txs.length).to.equal(4);
    });
});

// ---------------------------------------------------------------------------
// 9. Full Lifecycle — Deposit → Reserve → Refund
// ---------------------------------------------------------------------------

describe("Treasury — Full Refund Lifecycle", () => {
    it("deposit → reserve → refund restores original available", async () => {
        const mid = uid();

        await creditMerchantBalance(mid, 300);

        const fee = calculatePayoutFee(100); // $1
        const res = await reservePayoutFunds(mid, 100, fee, "pay_refund_life_001");
        expect(res.success).to.be.true;

        const bal = await refundReservedFunds(mid, 100, fee, "pay_refund_life_001");
        expect(bal.available).to.equal(300);
        expect(bal.reserved).to.equal(0);
        expect(bal.totalPayouts).to.equal(0);
        expect(bal.totalFees).to.equal(0);
    });
});

// ---------------------------------------------------------------------------
// 10. Edge Cases
// ---------------------------------------------------------------------------

describe("Treasury — Edge Cases", () => {
    it("should handle zero-amount deposit gracefully", async () => {
        const mid = uid();
        const bal = await creditMerchantBalance(mid, 0);
        expect(bal.available).to.equal(0);
    });

    it("should handle multiple payouts reserving and releasing", async () => {
        const mid = uid();
        await creditMerchantBalance(mid, 1000);

        // Reserve two payouts
        const fee1 = calculatePayoutFee(100); // 1
        const fee2 = calculatePayoutFee(200); // 2
        await reservePayoutFunds(mid, 100, fee1, "pay_multi_001");
        await reservePayoutFunds(mid, 200, fee2, "pay_multi_002");

        // Check balance: available = 1000 - 101 - 202 = 697
        const bal = await getMerchantBalance(mid);
        expect(bal!.available).to.equal(1000 - (100 + fee1) - (200 + fee2));
        expect(bal!.reserved).to.equal((100 + fee1) + (200 + fee2));

        // Release first, refund second
        await releasePayoutFunds(mid, 100, fee1, "pay_multi_001");
        await refundReservedFunds(mid, 200, fee2, "pay_multi_002");

        const finalBal = await getMerchantBalance(mid);
        expect(finalBal!.reserved).to.equal(0);
        expect(finalBal!.available).to.equal(1000 - (100 + fee1)); // only first payout spent
        expect(finalBal!.totalPayouts).to.equal(100);
        expect(finalBal!.totalFees).to.equal(fee1);
    });
});
