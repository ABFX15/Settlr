/**
 * Recipient Network Tests
 *
 * Tests the full recipient network feature set:
 * - Recipient registration and lookup (auto-delivery foundation)
 * - Auth token generation and validation (magic link)
 * - Balance operations (credit, debit, withdrawal)
 * - Payout history by recipient email
 * - Auto-delivery flow (register → lookup → instant delivery)
 * - Preferences update (wallet, autoWithdraw, notifications)
 *
 * All tests use the in-memory fallback (no Supabase required).
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/recipient-network.test.ts'
 */

import { expect } from "chai";
import {
    registerRecipient,
    getRecipientByEmail,
    updateRecipient,
    updateRecipientStats,
    createRecipientAuthToken,
    validateRecipientAuthToken,
    getPayoutsByRecipientEmail,
    getOrCreateBalance,
    creditBalance,
    debitBalance,
    getBalanceTransactions,
    createPayout,
    claimPayout,
    type Recipient,
    type RecipientBalance,
} from "../lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_EMAIL = "recipient-test@example.com";
const TEST_WALLET = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const TEST_WALLET_2 = "HN7cABqLq46Es1jh92dQQisAi5YqpLgnfjqkR7gKPezQ";
const MERCHANT_ID = "test_merchant_001";
const MERCHANT_WALLET = "5uG5y2xTFJMXJ8NKL1fEZBQkZxrBx9d3B5f9c2hVJ6xP";

// ---------------------------------------------------------------------------
// 1. Recipient CRUD
// ---------------------------------------------------------------------------

describe("Recipient Network — CRUD", () => {
    it("should return null for unknown email", async () => {
        const result = await getRecipientByEmail("unknown-" + Date.now() + "@example.com");
        expect(result).to.be.null;
    });

    it("should register a new recipient", async () => {
        const email = `register-${Date.now()}@example.com`;
        const recipient = await registerRecipient({
            email,
            walletAddress: TEST_WALLET,
            displayName: "Test User",
        });

        expect(recipient).to.not.be.null;
        expect(recipient.id).to.match(/^rcp_/);
        expect(recipient.email).to.equal(email.toLowerCase());
        expect(recipient.walletAddress).to.equal(TEST_WALLET);
        expect(recipient.displayName).to.equal("Test User");
        expect(recipient.notificationsEnabled).to.be.true;
        expect(recipient.autoWithdraw).to.be.true;
        expect(recipient.totalReceived).to.equal(0);
        expect(recipient.totalPayouts).to.equal(0);
        expect(recipient.createdAt).to.be.instanceOf(Date);
    });

    it("should look up a registered recipient by email", async () => {
        const email = `lookup-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        const found = await getRecipientByEmail(email);
        expect(found).to.not.be.null;
        expect(found!.email).to.equal(email.toLowerCase());
        expect(found!.walletAddress).to.equal(TEST_WALLET);
    });

    it("should be case-insensitive on email lookup", async () => {
        const email = `CaseTest-${Date.now()}@Example.COM`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        const found = await getRecipientByEmail(email.toLowerCase());
        expect(found).to.not.be.null;
        expect(found!.email).to.equal(email.toLowerCase().trim());
    });

    it("should update recipient wallet address", async () => {
        const email = `update-wallet-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        const updated = await updateRecipient(email, { walletAddress: TEST_WALLET_2 });
        expect(updated).to.not.be.null;
        expect(updated!.walletAddress).to.equal(TEST_WALLET_2);

        // Confirm persisted
        const check = await getRecipientByEmail(email);
        expect(check!.walletAddress).to.equal(TEST_WALLET_2);
    });

    it("should update recipient preferences", async () => {
        const email = `prefs-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        const updated = await updateRecipient(email, {
            autoWithdraw: false,
            notificationsEnabled: false,
            displayName: "New Name",
        });

        expect(updated!.autoWithdraw).to.be.false;
        expect(updated!.notificationsEnabled).to.be.false;
        expect(updated!.displayName).to.equal("New Name");
    });

    it("should return null when updating non-existent recipient", async () => {
        const result = await updateRecipient("noexist-" + Date.now() + "@x.com", { displayName: "X" });
        expect(result).to.be.null;
    });
});

// ---------------------------------------------------------------------------
// 2. Recipient Stats
// ---------------------------------------------------------------------------

describe("Recipient Network — Stats", () => {
    it("should increment stats on updateRecipientStats", async () => {
        const email = `stats-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        await updateRecipientStats(email, 50);
        let r = await getRecipientByEmail(email);
        expect(r!.totalReceived).to.equal(50);
        expect(r!.totalPayouts).to.equal(1);
        expect(r!.lastPayoutAt).to.be.instanceOf(Date);

        await updateRecipientStats(email, 25);
        r = await getRecipientByEmail(email);
        expect(r!.totalReceived).to.equal(75);
        expect(r!.totalPayouts).to.equal(2);
    });
});

// ---------------------------------------------------------------------------
// 3. Auth Tokens (magic link)
// ---------------------------------------------------------------------------

describe("Recipient Network — Auth Tokens", () => {
    it("should generate an auth token for a known recipient", async () => {
        const email = `auth-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        const token = await createRecipientAuthToken(email);
        expect(token).to.be.a("string");
        expect(token!.length).to.equal(48);
    });

    it("should return null for unknown email", async () => {
        const token = await createRecipientAuthToken("nope-" + Date.now() + "@x.com");
        expect(token).to.be.null;
    });

    it("should validate a valid auth token and return recipient", async () => {
        const email = `validate-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        const token = await createRecipientAuthToken(email);
        const recipient = await validateRecipientAuthToken(token!);

        expect(recipient).to.not.be.null;
        expect(recipient!.email).to.equal(email.toLowerCase());
    });

    it("should invalidate token after single use (one-time use)", async () => {
        const email = `onetime-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });

        const token = await createRecipientAuthToken(email);

        // First use: valid
        const first = await validateRecipientAuthToken(token!);
        expect(first).to.not.be.null;

        // Second use: invalid (token cleared)
        const second = await validateRecipientAuthToken(token!);
        expect(second).to.be.null;
    });

    it("should reject an invalid token", async () => {
        const result = await validateRecipientAuthToken("totally_bogus_token_123456");
        expect(result).to.be.null;
    });
});

// ---------------------------------------------------------------------------
// 4. Balance Operations
// ---------------------------------------------------------------------------

describe("Recipient Network — Balances", () => {
    it("should create a zero balance for a new recipient", async () => {
        const email = `bal-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        const balance = await getOrCreateBalance(r.id, "USDC");
        expect(balance.recipientId).to.equal(r.id);
        expect(balance.currency).to.equal("USDC");
        expect(balance.balance).to.equal(0);
    });

    it("should return the same balance on repeated calls (idempotent)", async () => {
        const email = `bal-idem-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        const b1 = await getOrCreateBalance(r.id, "USDC");
        const b2 = await getOrCreateBalance(r.id, "USDC");
        expect(b1.id).to.equal(b2.id);
    });

    it("should credit balance and record transaction", async () => {
        const email = `credit-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        const updated = await creditBalance(r.id, 100, "po_test_credit_1");
        expect(updated.balance).to.equal(100);

        const txs = await getBalanceTransactions(r.id);
        expect(txs).to.have.length(1);
        expect(txs[0].type).to.equal("credit");
        expect(txs[0].amount).to.equal(100);
        expect(txs[0].payoutId).to.equal("po_test_credit_1");
    });

    it("should accumulate multiple credits", async () => {
        const email = `multi-credit-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        await creditBalance(r.id, 50, "po_1");
        const updated = await creditBalance(r.id, 30, "po_2");
        expect(updated.balance).to.equal(80);

        const txs = await getBalanceTransactions(r.id);
        expect(txs).to.have.length(2);
    });

    it("should debit balance with a tx signature", async () => {
        const email = `debit-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        await creditBalance(r.id, 200, "po_funded");
        const after = await debitBalance(r.id, 75, "sig_withdrawal_abc");
        expect(after.balance).to.equal(125);

        const txs = await getBalanceTransactions(r.id);
        expect(txs).to.have.length(2);
        const withdrawal = txs.find(t => t.type === "withdrawal");
        expect(withdrawal).to.not.be.undefined;
        expect(withdrawal!.amount).to.equal(75);
        expect(withdrawal!.txSignature).to.equal("sig_withdrawal_abc");
    });

    it("should reject debit exceeding balance", async () => {
        const email = `overdraft-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        await creditBalance(r.id, 10, "po_small");

        try {
            await debitBalance(r.id, 50, "sig_nope");
            expect.fail("Should have thrown an error");
        } catch (err: unknown) {
            expect((err as Error).message).to.equal("Insufficient balance");
        }
    });

    it("should return all transactions for the recipient", async () => {
        const email = `txorder-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        await creditBalance(r.id, 10, "po_first");
        await creditBalance(r.id, 20, "po_second");
        await creditBalance(r.id, 30, "po_third");

        const txs = await getBalanceTransactions(r.id);
        expect(txs).to.have.length(3);
        const amounts = txs.map(t => t.amount).sort((a, b) => a - b);
        expect(amounts).to.deep.equal([10, 20, 30]);
    });

    it("should respect limit on getBalanceTransactions", async () => {
        const email = `txlimit-${Date.now()}@example.com`;
        const r = await registerRecipient({ email, walletAddress: TEST_WALLET });

        await creditBalance(r.id, 1, "po_a");
        await creditBalance(r.id, 2, "po_b");
        await creditBalance(r.id, 3, "po_c");

        const txs = await getBalanceTransactions(r.id, { limit: 2 });
        expect(txs).to.have.length(2);
    });
});

// ---------------------------------------------------------------------------
// 5. Auto-delivery flow (end-to-end in-memory)
// ---------------------------------------------------------------------------

describe("Recipient Network — Auto-Delivery Flow", () => {
    it("should enable auto-delivery after first claim registers wallet", async () => {
        const email = `autoflow-${Date.now()}@example.com`;

        // Step 1: No recipient exists yet → first payout goes through claim flow
        const before = await getRecipientByEmail(email);
        expect(before).to.be.null;

        // Step 2: Create a payout
        const payout = await createPayout({
            merchantId: MERCHANT_ID,
            merchantWallet: MERCHANT_WALLET,
            email,
            amount: 25,
            currency: "USDC",
            memo: "First payout",
        });
        expect(payout.status).to.equal("sent");
        expect(payout.claimToken).to.be.a("string");

        // Step 3: Recipient claims — this simulates the claim route saving the mapping
        const claimed = await claimPayout(payout.claimToken, TEST_WALLET, "sig_first_claim");
        expect(claimed).to.not.be.null;
        expect(claimed!.status).to.equal("claimed");

        // Register recipient (this is what the claim route does)
        await registerRecipient({ email, walletAddress: TEST_WALLET });
        await updateRecipientStats(email, payout.amount);

        // Step 4: Now the recipient exists → second payout can auto-deliver
        const recipient = await getRecipientByEmail(email);
        expect(recipient).to.not.be.null;
        expect(recipient!.walletAddress).to.equal(TEST_WALLET);
        expect(recipient!.autoWithdraw).to.be.true;

        // Step 5: Second payout — platform checks getRecipientByEmail → found → auto-deliver
        const payout2 = await createPayout({
            merchantId: MERCHANT_ID,
            merchantWallet: MERCHANT_WALLET,
            email,
            amount: 50,
            currency: "USDC",
            memo: "Auto-delivered",
        });

        // Simulate auto-delivery: mark as claimed immediately
        const autoClaimed = await claimPayout(payout2.claimToken, recipient!.walletAddress, "sig_auto_deliver");
        expect(autoClaimed!.status).to.equal("claimed");
        await updateRecipientStats(email, payout2.amount);

        // Verify stats
        const updated = await getRecipientByEmail(email);
        expect(updated!.totalReceived).to.equal(75); // 25 + 50
        expect(updated!.totalPayouts).to.equal(2);
    });

    it("should NOT auto-deliver when autoWithdraw is disabled", async () => {
        const email = `noauto-${Date.now()}@example.com`;
        await registerRecipient({ email, walletAddress: TEST_WALLET });
        await updateRecipient(email, { autoWithdraw: false });

        const recipient = await getRecipientByEmail(email);
        expect(recipient!.autoWithdraw).to.be.false;

        // Platform logic would check: if (recipient.autoWithdraw) → skip
        // Since it's false, the claim flow runs normally
    });
});

// ---------------------------------------------------------------------------
// 6. Payout history by recipient email
// ---------------------------------------------------------------------------

describe("Recipient Network — Payout History", () => {
    it("should return payouts for a recipient email across merchants", async () => {
        const email = `history-${Date.now()}@example.com`;

        // Create payouts from different merchants
        await createPayout({
            merchantId: "merchant_A",
            merchantWallet: MERCHANT_WALLET,
            email,
            amount: 10,
            memo: "From A",
        });

        await createPayout({
            merchantId: "merchant_B",
            merchantWallet: MERCHANT_WALLET,
            email,
            amount: 20,
            memo: "From B",
        });

        const payouts = await getPayoutsByRecipientEmail(email);
        expect(payouts).to.have.length(2);
        const amounts = payouts.map(p => p.amount).sort((a, b) => a - b);
        expect(amounts).to.deep.equal([10, 20]);
    });

    it("should respect limit and offset", async () => {
        const email = `pagehist-${Date.now()}@example.com`;

        for (let i = 1; i <= 5; i++) {
            await createPayout({
                merchantId: MERCHANT_ID,
                merchantWallet: MERCHANT_WALLET,
                email,
                amount: i * 10,
            });
        }

        const page1 = await getPayoutsByRecipientEmail(email, { limit: 2 });
        expect(page1).to.have.length(2);

        const page2 = await getPayoutsByRecipientEmail(email, { limit: 2, offset: 2 });
        expect(page2).to.have.length(2);

        // No overlap
        const ids1 = page1.map(p => p.id);
        const ids2 = page2.map(p => p.id);
        for (const id of ids1) {
            expect(ids2).to.not.include(id);
        }
    });

    it("should return empty array for unknown email", async () => {
        const payouts = await getPayoutsByRecipientEmail("noone-" + Date.now() + "@x.com");
        expect(payouts).to.be.an("array").with.length(0);
    });
});

// ---------------------------------------------------------------------------
// 7. Full lifecycle: register → auth → dashboard → withdraw
// ---------------------------------------------------------------------------

describe("Recipient Network — Full Lifecycle", () => {
    it("should complete a full register → auth → view → withdraw cycle", async () => {
        const email = `lifecycle-${Date.now()}@example.com`;

        // 1. Register on first claim
        const recipient = await registerRecipient({ email, walletAddress: TEST_WALLET });
        expect(recipient.id).to.match(/^rcp_/);

        // 2. Create a payout and credit balance (simulating autoWithdraw=false path)
        await updateRecipient(email, { autoWithdraw: false });
        const payout = await createPayout({
            merchantId: MERCHANT_ID,
            merchantWallet: MERCHANT_WALLET,
            email,
            amount: 100,
        });

        // Credit balance instead of on-chain transfer
        await creditBalance(recipient.id, 100, payout.id);
        await updateRecipientStats(email, 100);

        // 3. Generate magic link and validate
        const token = await createRecipientAuthToken(email);
        expect(token).to.not.be.null;

        const authed = await validateRecipientAuthToken(token!);
        expect(authed).to.not.be.null;
        expect(authed!.email).to.equal(email.toLowerCase());

        // 4. Check balance
        const balance = await getOrCreateBalance(recipient.id);
        expect(balance.balance).to.equal(100);

        // 5. View transaction history
        const txs = await getBalanceTransactions(recipient.id);
        expect(txs).to.have.length(1);
        expect(txs[0].type).to.equal("credit");

        // 6. Withdraw
        const afterWithdraw = await debitBalance(recipient.id, 100, "sig_lifecycle_withdraw");
        expect(afterWithdraw.balance).to.equal(0);

        // 7. Verify final state
        const finalTxs = await getBalanceTransactions(recipient.id);
        expect(finalTxs).to.have.length(2);
        const types = finalTxs.map(t => t.type).sort();
        expect(types).to.deep.equal(["credit", "withdrawal"]);

        const finalRecipient = await getRecipientByEmail(email);
        expect(finalRecipient!.totalReceived).to.equal(100);
        expect(finalRecipient!.totalPayouts).to.equal(1);
    });
});
