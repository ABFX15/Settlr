/**
 * GET /api/balance — Shorthand for /api/treasury/balance
 *
 * Returns the merchant's USDC balance. Used by integrations (Slack bot, etc.)
 * for quick balance checks.
 *
 * Authentication: X-API-Key header
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, getOrCreateMerchantBalance, calculatePayoutFee } from "@/lib/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        const apiKey =
            request.headers.get("x-api-key") ||
            request.headers.get("authorization")?.replace("Bearer ", "");

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing API key" },
                { status: 401, headers: corsHeaders }
            );
        }

        const validation = await validateApiKey(apiKey);
        if (!validation.valid || !validation.merchantId) {
            return NextResponse.json(
                { error: validation.error || "Invalid API key" },
                { status: 401, headers: corsHeaders }
            );
        }

        const balance = await getOrCreateMerchantBalance(validation.merchantId);

        return NextResponse.json(
            {
                wallet: validation.merchantWallet || null,
                usdc: balance.available,
                pending: balance.pending,
                reserved: balance.reserved,
                total: balance.available + balance.pending + balance.reserved,
                currency: "USDC",
                feeRate: "1%",
                feeMinimum: calculatePayoutFee(1),
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("[balance] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance" },
            { status: 500, headers: corsHeaders }
        );
    }
}
