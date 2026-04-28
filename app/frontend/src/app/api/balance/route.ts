/**
 * GET /api/balance — Shorthand for /api/treasury/balance
 *
 * Returns the merchant's USDC balance.
 *
 * Authentication: settlr_session cookie (wallet sign-in)
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateMerchantBalance, calculatePayoutFee } from "@/lib/db";
import { requireMerchantSession } from "@/lib/merchant-auth";
import { corsHeadersFor } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeadersFor(request, { requireOrigin: true, methods: "GET, OPTIONS" }),
    });
}

export async function GET(request: NextRequest) {
    const headers = corsHeadersFor(request, { requireOrigin: true, methods: "GET, OPTIONS" });
    try {
        const auth = await requireMerchantSession(request);
        if (!auth) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers }
            );
        }

        const balance = await getOrCreateMerchantBalance(auth.merchantId);

        return NextResponse.json(
            {
                wallet: auth.merchantWallet || null,
                usdc: balance.available,
                pending: balance.pending,
                reserved: balance.reserved,
                total: balance.available + balance.pending + balance.reserved,
                currency: "USDC",
                feeRate: "1%",
                feeMinimum: calculatePayoutFee(1),
            },
            { headers }
        );
    } catch (error) {
        console.error("[balance] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance" },
            { status: 500, headers }
        );
    }
}
