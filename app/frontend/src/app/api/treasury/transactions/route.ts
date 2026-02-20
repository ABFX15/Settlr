/**
 * GET /api/treasury/transactions — Get treasury transaction history
 *
 * Query params:
 *   ?type=deposit|payout_reserved|payout_released|payout_refund|fee_deducted|withdrawal
 *   ?limit=20
 *   ?offset=0
 *   ?wallet=<pubkey> — authenticate by wallet address (dashboard)
 *
 * Authentication: X-API-Key header OR ?wallet= query param
 */

import { NextRequest, NextResponse } from "next/server";
import {
    validateApiKey,
    getOrCreateMerchantByWallet,
    getTreasuryTransactions,
    type TreasuryTransactionType,
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

        const type = searchParams.get("type") as TreasuryTransactionType | null;
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
        const offset = parseInt(searchParams.get("offset") || "0");

        const transactions = await getTreasuryTransactions(
            merchantId!,
            {
                type: type || undefined,
                limit,
                offset,
            }
        );

        return NextResponse.json({
            data: transactions.map((t) => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                currency: t.currency,
                payoutId: t.payoutId,
                txSignature: t.txSignature,
                description: t.description,
                balanceAfter: t.balanceAfter,
                createdAt: t.createdAt.toISOString(),
            })),
            count: transactions.length,
            limit,
            offset,
        });
    } catch (error) {
        console.error("[treasury/transactions] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
