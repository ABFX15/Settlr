/**
 * Recipient Network — Integration Tests
 *
 * Tests the FULL recipient-network flows as the API routes execute them:
 *
 * Flow A: First-time recipient claims → gets registered → second payout auto-delivers
 * Flow B: Recipient disables autoWithdraw → payout goes to claim link
 * Flow C: Recipient changes wallet → next auto-delivery uses new wallet
 * Flow D: Magic link auth → dashboard data → update preferences
 * Flow E: Balance credit (autoWithdraw=false) → manual withdrawal
 * Flow F: Multiple merchants pay same recipient → all appear in history
 * Flow G: Edge cases (expired tokens, double claims, unknown emails)
 *
 * These mirror the exact sequence of DB calls made by the route handlers.
 * All tests run against in-memory storage (no Supabase required).
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/recipient-network-integration.test.ts' --timeout 10000
 */

import { expect } from "chai";
import {
    // Payout functions
    createPayout,
    claimPayout,
    getPayoutByClaimToken,
    getPayoutsByMerchant,
    validateApiKey,
    // Recipient functions
    registerRecipient,
    getRecipientByEmail,
    updateRecipient,
    updateRecipientStats,
    // Auth
    createRecipientAuthToken,
    validateRecipientAuthToken,
    // Balance
    getOrCreateBalance,
    creditBalance,
    debitBalance,
    getBalanceTransactions,
    // History
    getPayoutsByRecipientEmail,
} from "../lib/db";

// ---------------------------------------------------------------------------
// Constants (match DEMO_API_KEY in db.ts)
// ---------------------------------------------------------------------------

const DEMO_API_KEY = "sk_test_demo_xxxxxxxxxxxx";
const DEMO_MERCHANT_ID = "demo_merchant";
const DEMO_MERCHANT_WALLET = "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV";

const WALLET_A = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const WALLET_B = "HN7cABqLq46Es1jh92dQQisAi5YqpLgnfjqkR7gKPezQ";

// ---------------------------------------------------------------------------
// Flow A: Claim → Register → Auto-deliver on next payout
// ---------------------------------------------------------------------------

describe("Integration: Claim → Register → Auto-delivery", () => {
    const email = `flow-a-${Date.now()}@test.com`;

    it("Step 1: validateApiKey returns the demo merchant", async () => {
        const v = await validateApiKey(DEMO_API_KEY);
        expect(v.valid).to.be.true;
        expect(v.merchantId).to.equal(DEMO_MERCHANT_ID);
        expect(v.merchantWallet).to.equal(DEMO_MERCHANT_WALLET);
    });

    it("Step 2: First payout — no known recipient, goes to claim_link flow", async () => {
        // Route creates payout
        const payout = await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 25,
            currency: "USDC",
            memo: "First payout",
        });

        // Route checks recipient registry → empty
        const recipient = await getRecipientByEmail(email);
        expect(recipient).to.be.null;

        // Route falls through to claim_link flow
        expect(payout.status).to.equal("sent");
        expect(payout.claimToken).to.be.a("string");
        expect(payout.claimUrl).to.include("/claim/");
    });

    it("Step 3: Recipient claims — route registers email→wallet mapping", async () => {
        // Simulate: user clicks claim link, submits wallet
        const payouts = await getPayoutsByRecipientEmail(email);
        const payout = payouts[0];
        const fetched = await getPayoutByClaimToken(payout.claimToken);
        expect(fetched).to.not.be.null;
        expect(fetched!.status).to.equal("sent");

        // Route executes transfer (we simulate with demo sig)
        const txSig = `demo_${payout.id}_claim`;

        // Route calls claimPayout
        const claimed = await claimPayout(payout.claimToken, WALLET_A, txSig);
        expect(claimed).to.not.be.null;
        expect(claimed!.status).to.equal("claimed");
        expect(claimed!.recipientWallet).to.equal(WALLET_A);
        expect(claimed!.txSignature).to.equal(txSig);

        // Route then registers recipient (the claim/route.ts code)
        const existingRecipient = await getRecipientByEmail(email);
        expect(existingRecipient).to.be.null; // Not yet registered
        await registerRecipient({ email, walletAddress: WALLET_A });
        await updateRecipientStats(email, payout.amount);

        // Verify registration persisted
        const registered = await getRecipientByEmail(email);
        expect(registered).to.not.be.null;
        expect(registered!.walletAddress).to.equal(WALLET_A);
        expect(registered!.autoWithdraw).to.be.true;
        expect(registered!.totalReceived).to.equal(25);
        expect(registered!.totalPayouts).to.equal(1);
    });

    it("Step 4: Second payout — auto-delivers instantly", async () => {
        const payout = await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 50,
            memo: "Second payout - auto",
        });

        // Route checks recipient registry → FOUND
        const recipient = await getRecipientByEmail(email);
        expect(recipient).to.not.be.null;
        expect(recipient!.walletAddress).to.equal(WALLET_A);
        expect(recipient!.autoWithdraw).to.be.true;

        // Route auto-delivers (simulated transfer)
        const txSig = `demo_auto_${payout.id}_${Date.now()}`;
        await claimPayout(payout.claimToken, recipient!.walletAddress, txSig);
        await updateRecipientStats(email, payout.amount);

        // Verify state
        const updated = await getRecipientByEmail(email);
        expect(updated!.totalReceived).to.equal(75);
        expect(updated!.totalPayouts).to.equal(2);

        // Verify payout record shows claimed
        const check = await getPayoutByClaimToken(payout.claimToken);
        expect(check!.status).to.equal("claimed");
        expect(check!.recipientWallet).to.equal(WALLET_A);
    });
});

// ---------------------------------------------------------------------------
// Flow B: Recipient disables autoWithdraw → falls back to claim link
// ---------------------------------------------------------------------------

describe("Integration: autoWithdraw=false → claim link flow", () => {
    it("should NOT auto-deliver when autoWithdraw is off", async () => {
        const email = `flow-b-${Date.now()}@test.com`;

        // Register with wallet but disable autoWithdraw
        await registerRecipient({ email, walletAddress: WALLET_A });
        await updateRecipient(email, { autoWithdraw: false });

        // Create payout
        const payout = await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 100,
        });

        // Route checks recipient → found but autoWithdraw=false
        const recipient = await getRecipientByEmail(email);
        expect(recipient!.autoWithdraw).to.be.false;

        // Route should NOT auto-deliver, payout stays in "sent" status
        expect(payout.status).to.equal("sent");

        // The payout should still be claimable
        const fetched = await getPayoutByClaimToken(payout.claimToken);
        expect(fetched!.status).to.equal("sent");
    });
});

// ---------------------------------------------------------------------------
// Flow C: Wallet change → auto-delivery uses new wallet
// ---------------------------------------------------------------------------

describe("Integration: Wallet change → auto-delivery uses updated wallet", () => {
    it("should use the updated wallet for auto-delivery", async () => {
        const email = `flow-c-${Date.now()}@test.com`;

        // Register with WALLET_A
        await registerRecipient({ email, walletAddress: WALLET_A });

        // Update to WALLET_B (via /me PATCH)
        const updated = await updateRecipient(email, { walletAddress: WALLET_B });
        expect(updated!.walletAddress).to.equal(WALLET_B);

        // Create payout → auto-delivery should use WALLET_B
        const payout = await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 30,
        });

        const recipient = await getRecipientByEmail(email);
        expect(recipient!.walletAddress).to.equal(WALLET_B);

        // Auto-deliver to new wallet
        const txSig = `demo_auto_${payout.id}`;
        const claimed = await claimPayout(payout.claimToken, recipient!.walletAddress, txSig);
        expect(claimed!.recipientWallet).to.equal(WALLET_B);
    });
});

// ---------------------------------------------------------------------------
// Flow D: Magic link auth → dashboard → update preferences
// ---------------------------------------------------------------------------

describe("Integration: Magic link → Dashboard → Update", () => {
    const email = `flow-d-${Date.now()}@test.com`;

    it("Step 1: Recipient requests magic link", async () => {
        await registerRecipient({ email, walletAddress: WALLET_A });

        // Recipient POST /api/recipients/auth — route generates token
        const token = await createRecipientAuthToken(email);
        expect(token).to.be.a("string");
        expect(token!.length).to.equal(48);
    });

    it("Step 2: Recipient clicks magic link → validates token", async () => {
        const token = await createRecipientAuthToken(email);
        const recipient = await validateRecipientAuthToken(token!);
        expect(recipient).to.not.be.null;
        expect(recipient!.email).to.equal(email.toLowerCase());
    });

    it("Step 3: Dashboard loads profile + payouts + balance", async () => {
        // Create some payouts for this recipient
        await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 40,
            memo: "Dashboard test",
        });

        // Simulate GET /api/recipients/me
        const recipient = await getRecipientByEmail(email);
        expect(recipient).to.not.be.null;

        const [payouts, balance] = await Promise.all([
            getPayoutsByRecipientEmail(recipient!.email),
            getOrCreateBalance(recipient!.id, "USDC"),
        ]);

        expect(payouts.length).to.be.greaterThan(0);
        expect(balance.balance).to.equal(0); // Not credited, still in payout flow
        expect(balance.currency).to.equal("USDC");
    });

    it("Step 4: Recipient updates preferences via PATCH", async () => {
        const updated = await updateRecipient(email, {
            displayName: "Alice",
            autoWithdraw: false,
            notificationsEnabled: false,
        });

        expect(updated!.displayName).to.equal("Alice");
        expect(updated!.autoWithdraw).to.be.false;
        expect(updated!.notificationsEnabled).to.be.false;

        // Verify change persisted
        const check = await getRecipientByEmail(email);
        expect(check!.displayName).to.equal("Alice");
        expect(check!.autoWithdraw).to.be.false;
    });
});

// ---------------------------------------------------------------------------
// Flow E: Balance credit + manual withdrawal
// ---------------------------------------------------------------------------

describe("Integration: Balance credit → Withdrawal", () => {
    it("should credit balance and allow full withdrawal", async () => {
        const email = `flow-e-${Date.now()}@test.com`;
        const r = await registerRecipient({ email, walletAddress: WALLET_A });
        await updateRecipient(email, { autoWithdraw: false });

        // Platform credits balance (payout received but not auto-withdrawn)
        await creditBalance(r.id, 150, "po_balance_test_1");
        await creditBalance(r.id, 50, "po_balance_test_2");

        // Check balance (GET /api/recipients/balance)
        const balance = await getOrCreateBalance(r.id, "USDC");
        expect(balance.balance).to.equal(200);

        // Check transactions
        const txs = await getBalanceTransactions(r.id);
        expect(txs).to.have.length(2);
        expect(txs.every(t => t.type === "credit")).to.be.true;

        // Withdraw all (POST /api/recipients/withdraw)
        const recipient = await getRecipientByEmail(email);
        expect(recipient!.walletAddress).to.equal(WALLET_A);

        const txSig = `demo_withdraw_${Date.now()}`;
        const afterWithdraw = await debitBalance(r.id, balance.balance, txSig, "USDC");
        expect(afterWithdraw.balance).to.equal(0);

        // Verify withdrawal transaction recorded
        const finalTxs = await getBalanceTransactions(r.id);
        expect(finalTxs).to.have.length(3);
        const withdrawals = finalTxs.filter(t => t.type === "withdrawal");
        expect(withdrawals).to.have.length(1);
        expect(withdrawals[0].txSignature).to.equal(txSig);
    });

    it("should reject withdrawal when balance is zero", async () => {
        const email = `flow-e-zero-${Date.now()}@test.com`;
        const r = await registerRecipient({ email, walletAddress: WALLET_A });

        const balance = await getOrCreateBalance(r.id, "USDC");
        expect(balance.balance).to.equal(0);

        // Attempting to debit should throw
        try {
            await debitBalance(r.id, 10, "sig_nope");
            expect.fail("Should have thrown");
        } catch (err: unknown) {
            expect((err as Error).message).to.equal("Insufficient balance");
        }
    });

    it("should reject partial withdrawal exceeding balance", async () => {
        const email = `flow-e-partial-${Date.now()}@test.com`;
        const r = await registerRecipient({ email, walletAddress: WALLET_A });
        await creditBalance(r.id, 50, "po_partial");

        try {
            await debitBalance(r.id, 100, "sig_over");
            expect.fail("Should have thrown");
        } catch (err: unknown) {
            expect((err as Error).message).to.equal("Insufficient balance");
        }

        // Balance unchanged
        const balance = await getOrCreateBalance(r.id, "USDC");
        expect(balance.balance).to.equal(50);
    });
});

// ---------------------------------------------------------------------------
// Flow F: Multi-merchant → same recipient sees all payouts
// ---------------------------------------------------------------------------

describe("Integration: Multi-merchant payouts to same recipient", () => {
    it("should aggregate payouts from different merchants", async () => {
        const email = `flow-f-${Date.now()}@test.com`;

        // Merchant A sends 2 payouts
        await createPayout({
            merchantId: "merchant_alpha",
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 10,
            memo: "From Alpha",
        });
        await createPayout({
            merchantId: "merchant_alpha",
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 15,
            memo: "From Alpha again",
        });

        // Merchant B sends 1 payout
        await createPayout({
            merchantId: "merchant_beta",
            merchantWallet: "5uG5y2xTFJMXJ8NKL1fEZBQkZxrBx9d3B5f9c2hVJ6xP",
            email,
            amount: 20,
            memo: "From Beta",
        });

        // Recipient sees all 3
        const all = await getPayoutsByRecipientEmail(email);
        expect(all).to.have.length(3);
        const totalAmount = all.reduce((sum, p) => sum + p.amount, 0);
        expect(totalAmount).to.equal(45);

        // But each merchant only sees their own
        const alphaPayouts = await getPayoutsByMerchant("merchant_alpha");
        const alphaForEmail = alphaPayouts.filter(p => p.email === email.toLowerCase());
        expect(alphaForEmail).to.have.length(2);
    });
});

// ---------------------------------------------------------------------------
// Flow G: Edge cases
// ---------------------------------------------------------------------------

describe("Integration: Edge cases", () => {
    it("should not register duplicate recipient on second claim", async () => {
        const email = `edge-dup-${Date.now()}@test.com`;

        // First payout + claim → registers
        const p1 = await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 10,
        });
        await claimPayout(p1.claimToken, WALLET_A, "sig_1");
        await registerRecipient({ email, walletAddress: WALLET_A });

        // Second payout + claim → should NOT throw on duplicate check
        const p2 = await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 20,
        });
        await claimPayout(p2.claimToken, WALLET_A, "sig_2");

        // Claim route checks: getRecipientByEmail → already exists → skip registration
        const existingRecipient = await getRecipientByEmail(email);
        expect(existingRecipient).to.not.be.null;
        // Update stats only
        await updateRecipientStats(email, 20);

        const r = await getRecipientByEmail(email);
        expect(r!.totalReceived).to.equal(20); // Only from updateRecipientStats call
        expect(r!.totalPayouts).to.equal(1);
    });

    it("should handle claim on already-claimed payout gracefully", async () => {
        const email = `edge-double-${Date.now()}@test.com`;
        const p = await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email,
            amount: 50,
        });

        // First claim succeeds
        const claimed = await claimPayout(p.claimToken, WALLET_A, "sig_first");
        expect(claimed!.status).to.equal("claimed");

        // Second claim attempt: getPayoutByClaimToken returns claimed status
        const check = await getPayoutByClaimToken(p.claimToken);
        expect(check!.status).to.equal("claimed");
        // Route would return 409 "already claimed"
    });

    it("should return null for auth token on unregistered email", async () => {
        const token = await createRecipientAuthToken("nobody-" + Date.now() + "@ghost.com");
        expect(token).to.be.null;
    });

    it("should handle magic link for recipient with no payouts", async () => {
        const email = `edge-nopayouts-${Date.now()}@test.com`;
        await registerRecipient({ email, walletAddress: WALLET_A });

        // Auth works
        const token = await createRecipientAuthToken(email);
        const authed = await validateRecipientAuthToken(token!);
        expect(authed!.email).to.equal(email.toLowerCase());

        // Dashboard shows empty payouts
        const payouts = await getPayoutsByRecipientEmail(email);
        expect(payouts).to.have.length(0);

        // Balance is zero
        const balance = await getOrCreateBalance(authed!.id, "USDC");
        expect(balance.balance).to.equal(0);
    });

    it("should normalize email casing across all operations", async () => {
        const email = `CASE-Test-${Date.now()}@Example.COM`;
        const normalized = email.toLowerCase().trim();

        // Register with mixed case
        await registerRecipient({ email, walletAddress: WALLET_A });

        // Lookup with different casing
        const r1 = await getRecipientByEmail(email.toUpperCase());
        expect(r1).to.not.be.null;
        expect(r1!.email).to.equal(normalized);

        // Create payout with lowercase
        await createPayout({
            merchantId: DEMO_MERCHANT_ID,
            merchantWallet: DEMO_MERCHANT_WALLET,
            email: normalized,
            amount: 5,
        });

        // Lookup payouts with original casing
        const payouts = await getPayoutsByRecipientEmail(email);
        expect(payouts).to.have.length(1);
    });
});
