/**
 * GET /api/treasury/balance — Get merchant's treasury balance and transaction history
 *
 * Query params:
 *   ?history=true — include recent transactions
 *   ?limit=20 — number of transactions to return
 *   ?wallet=<pubkey> — authenticate by wallet address (dashboard)
 *
 * Authentication: X-API-Key header OR ?wallet= query param
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import {
    validateApiKey,
    getOrCreateMerchantBalance,
    getTreasuryTransactions,
    calculatePayoutFee,
} from "@/lib/db";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Authenticate — signed merchant session (dashboard) or API key (SDK).
        // The merchant is never read from an unauthenticated param.
        let merchantId: string | undefined;

        const session = await requireMerchantSession(request);
        if (session) {
            merchantId = session.merchantId;
        } else {
            const apiKey =
                request.headers.get("x-api-key") ||
                request.headers.get("authorization")?.replace("Bearer ", "");
            if (!apiKey) {
                return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
            }

            const validation = await validateApiKey(apiKey);
            if (!validation.valid || !validation.merchantId) {
                return NextResponse.json(
                    { error: validation.error || "Invalid API key" },
                    { status: 401 }
                );
            }
            merchantId = validation.merchantId;
        }

        const includeHistory = searchParams.get("history") === "true";
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

        const balance = await getOrCreateMerchantBalance(merchantId!);

        const response: Record<string, unknown> = {
            merchantId,
            currency: balance.currency,
            balance: {
                available: balance.available,
                pending: balance.pending,
                reserved: balance.reserved,
                total: balance.available + balance.pending + balance.reserved,
            },
            lifetime: {
                totalDeposited: balance.totalDeposited,
                totalPayouts: balance.totalPayouts,
                totalFees: balance.totalFees,
                totalWithdrawn: balance.totalWithdrawn,
            },
            // Show how much a sample payout would cost
            feeSchedule: {
                rate: "1%",
                minimum: "$0.25",
                example: {
                    payoutAmount: 100,
                    fee: calculatePayoutFee(100),
                    totalCost: 100 + calculatePayoutFee(100),
                },
            },
        };

        if (includeHistory) {
            const transactions = await getTreasuryTransactions(
                merchantId!,
                { limit }
            );

            response.transactions = transactions.map((t) => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                currency: t.currency,
                payoutId: t.payoutId,
                txSignature: t.txSignature,
                description: t.description,
                balanceAfter: t.balanceAfter,
                createdAt: t.createdAt.toISOString(),
            }));
        }

        return NextResponse.json(response);
    } catch (error) {
        logger.error("[treasury/balance] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance" },
            { status: 500 }
        );
    }
}
