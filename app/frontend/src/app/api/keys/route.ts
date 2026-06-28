/**
 * Merchant API key management (for the SDK / payout + checkout APIs).
 *
 *   GET  /api/keys?wallet=...   → list this merchant's keys (metadata only)
 *   POST /api/keys              → issue a new key (raw secret returned ONCE)
 *
 * Authenticated by the merchant's connected wallet, consistent with the other
 * dashboard routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
    getOrCreateMerchantByWallet,
    createApiKey,
    listApiKeys,
} from "@/lib/db";

export async function GET(request: NextRequest) {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet) {
        return NextResponse.json({ error: "wallet is required" }, { status: 400 });
    }
    try {
        const merchant = await getOrCreateMerchantByWallet(wallet);
        const keys = await listApiKeys(merchant.id);
        return NextResponse.json({ keys });
    } catch (err) {
        logger.error("[keys] list failed:", err);
        return NextResponse.json({ error: "Failed to list keys" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { wallet, name } = await request.json();
        if (!wallet) {
            return NextResponse.json(
                { error: "wallet is required" },
                { status: 400 },
            );
        }
        const merchant = await getOrCreateMerchantByWallet(wallet);
        const created = await createApiKey(merchant.id, name || "API key");
        return NextResponse.json(created);
    } catch (err) {
        logger.error("[keys] create failed:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error ? err.message : "Failed to create API key",
            },
            { status: 500 },
        );
    }
}
