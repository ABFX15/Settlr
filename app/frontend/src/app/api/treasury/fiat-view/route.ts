/**
 * GET /api/treasury/fiat-view?wallet=<pubkey>
 *
 * The "virtual ledger" — presents the merchant's money as a plain USD balance,
 * hiding USDC / wallets / chains entirely. The dashboard renders this so a
 * cannabis operator sees a seamless USD payout tool; the blockchain is just
 * the routing rail underneath.
 *
 * USDC is treated 1:1 with USD. Composes the treasury balance with off-ramp
 * request state so "pending settlements" reflects payouts actually in flight.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateMerchantBalance } from "@/lib/db";
import { listOfframpRequests } from "@/lib/offramp";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await requireMerchantSession(request);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const merchant = { id: session.merchantId };
        const balance = await getOrCreateMerchantBalance(merchant.id);
        const offramps = await listOfframpRequests(merchant.id);

        // Payouts the user has requested that haven't settled to their bank yet.
        const inFlight = offramps.filter(
            (r) => r.status === "pending" || r.status === "processing",
        );
        const settledToBank = offramps.filter((r) => r.status === "completed");

        const pendingWithdrawals = inFlight.reduce((s, r) => s + r.amount, 0);
        const settledLifetime = settledToBank.reduce((s, r) => s + r.amount, 0);

        return NextResponse.json({
            currency: "USD",
            // Spendable USD, less anything already requested for withdrawal.
            availableUSD: Math.max(0, balance.available - pendingWithdrawals),
            // Money on its way in (deposits still confirming).
            incomingUSD: balance.pending,
            // Withdrawals requested and clearing to the bank.
            pendingSettlements: pendingWithdrawals,
            pendingSettlementCount: inFlight.length,
            // Total ever paid out to a bank account.
            settledToBankLifetime: settledLifetime,
        });
    } catch (err) {
        logger.error("[treasury/fiat-view] error:", err);
        return NextResponse.json(
            { error: "Failed to load balance" },
            { status: 500 },
        );
    }
}
