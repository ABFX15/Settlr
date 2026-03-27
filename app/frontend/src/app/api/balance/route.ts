/**
 * GET /api/balance — Shorthand for /api/treasury/balance
 *
 * Returns the merchant's USDC balance.
 *
 * Authentication: x-merchant-wallet header (wallet address)
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateMerchantByWallet, getOrCreateMerchantBalance, calculatePayoutFee } from "@/lib/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Merchant-Wallet",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        const walletAddress = request.headers.get("x-merchant-wallet");

        if (!walletAddress || walletAddress.length < 32) {
            return NextResponse.json(
                { error: "Missing wallet address" },
                { status: 401, headers: corsHeaders }
            );
        }

        const merchant = await getOrCreateMerchantByWallet(walletAddress);
        if (!merchant) {
            return NextResponse.json(
                { error: "Merchant not found" },
                { status: 401, headers: corsHeaders }
            );
        }

        const balance = await getOrCreateMerchantBalance(merchant.id);

        return NextResponse.json(
            {
                wallet: merchant.walletAddress || null,
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
