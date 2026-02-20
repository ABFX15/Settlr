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

import { NextRequest, NextResponse } from "next/server";
import {
    validateApiKey,
    getOrCreateMerchantBalance,
    getOrCreateMerchantByWallet,
    getTreasuryTransactions,
    calculatePayoutFee,
} from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Authenticate — wallet param (dashboard) or API key (SDK)
        let merchantId: string | undefined;

        const wallet = searchParams.get("wallet");
        if (wallet && wallet.length >= 32) {
            // Dashboard auth: resolve wallet address to merchant UUID
            const merchant = await getOrCreateMerchantByWallet(wallet);
            merchantId = merchant.id;
        } else {
            const apiKey =
                request.headers.get("x-api-key") ||
                request.headers.get("authorization")?.replace("Bearer ", "");
            if (!apiKey) {
                return NextResponse.json({ error: "Missing API key or wallet" }, { status: 401 });
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
        console.error("[treasury/balance] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance" },
            { status: 500 }
        );
    }
}
