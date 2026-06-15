/**
 * Merchant receipt-encryption pubkey API.
 *
 * GET  ?wallet=<merchantWallet>  → public-fetch the merchant's X25519
 *                                  receipt-encryption pubkey so a customer
 *                                  can encrypt a private receipt against
 *                                  it at checkout. Returns 404 if the
 *                                  merchant hasn't published one.
 *
 * POST { receiptPubkey }         → publish/update the authenticated
 *                                  merchant's pubkey. Caller must be
 *                                  signed in via the wallet-session cookie
 *                                  flow. The pubkey is base58 X25519 (32 bytes).
 *                                  Idempotent — sending the same pubkey is a no-op.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
    getMerchantByWallet,
    getMerchantBySignerWallet,
} from "@/lib/db";
import { getSessionWallet, isValidSolanaAddress } from "@/lib/wallet-session";
import bs58 from "bs58";

export async function GET(request: NextRequest) {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet || !isValidSolanaAddress(wallet)) {
        return NextResponse.json(
            { error: "wallet query param required (base58 Solana address)" },
            { status: 400 }
        );
    }

    const merchant = await getMerchantByWallet(wallet);
    if (!merchant) {
        return NextResponse.json({ error: "merchant not found" }, { status: 404 });
    }
    if (!merchant.receiptPubkey) {
        return NextResponse.json(
            {
                error: "no_receipt_key",
                message:
                    "Merchant has not yet published a receipt-encryption pubkey. Encryption disabled until the merchant signs in once on the dashboard.",
            },
            { status: 404 }
        );
    }
    return NextResponse.json({
        merchantWallet: merchant.walletAddress,
        receiptPubkey: merchant.receiptPubkey,
    });
}

export async function POST(request: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json(
            { error: "supabase_not_configured" },
            { status: 503 }
        );
    }

    const sessionWallet = getSessionWallet(request);
    if (!sessionWallet) {
        return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    let body: { receiptPubkey?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { receiptPubkey } = body;
    if (!receiptPubkey || typeof receiptPubkey !== "string") {
        return NextResponse.json(
            { error: "receiptPubkey required" },
            { status: 400 }
        );
    }
    // Validate base58 + length
    let decoded: Uint8Array;
    try {
        decoded = bs58.decode(receiptPubkey);
    } catch {
        return NextResponse.json(
            { error: "receiptPubkey must be base58 encoded" },
            { status: 400 }
        );
    }
    if (decoded.length !== 32) {
        return NextResponse.json(
            { error: "receiptPubkey must be 32 bytes" },
            { status: 400 }
        );
    }

    // Find the merchant row that belongs to this signed-in wallet.
    // Prefer signer_wallet match; fall back to wallet_address (for legacy
    // single-wallet merchants).
    const merchant =
        (await getMerchantBySignerWallet(sessionWallet)) ||
        (await getMerchantByWallet(sessionWallet));
    if (!merchant) {
        return NextResponse.json(
            {
                error: "merchant_not_found",
                message: "Sign-in wallet has no merchant record. Complete onboarding first.",
            },
            { status: 404 }
        );
    }

    // Idempotent
    if (merchant.receiptPubkey === receiptPubkey) {
        return NextResponse.json({
            ok: true,
            unchanged: true,
            merchantId: merchant.id,
            receiptPubkey,
        });
    }

    const { error } = await supabase
        .from("merchants")
        .update({
            receipt_pubkey: receiptPubkey,
            receipt_pubkey_set_at: new Date().toISOString(),
        })
        .eq("id", merchant.id);

    if (error) {
        logger.error("[receipt-key] update failed:", error);
        return NextResponse.json(
            { error: "update_failed", detail: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        ok: true,
        merchantId: merchant.id,
        receiptPubkey,
    });
}
