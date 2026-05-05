/**
 * Merchant Cloak viewing-key API.
 *
 * GET  ?wallet=<merchantWallet>  → public lookup of the merchant's
 *                                  Cloak viewing key (`nk`, hex). A payer
 *                                  needs this to encrypt the chain note
 *                                  for the merchant when paying privately.
 *
 * POST { cloakViewingNk }        → publish/update the authenticated
 *                                  merchant's nk. Must be signed in via
 *                                  the wallet-session cookie. Idempotent.
 *
 * Note: `nk` is publishable by design — it is an *encryption target*,
 * not the spend key. The spend key never leaves the merchant's wallet
 * (it is derived on-demand from a signed message, see lib/cloak.ts).
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
    getMerchantByWallet,
    getMerchantBySignerWallet,
} from "@/lib/db";
import { getSessionWallet, isValidSolanaAddress } from "@/lib/wallet-session";

function isValidHex32(s: string): boolean {
    const cleaned = s.startsWith("0x") ? s.slice(2) : s;
    return /^[0-9a-fA-F]{64}$/.test(cleaned);
}

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
    if (!merchant.cloakViewingNk) {
        return NextResponse.json(
            {
                error: "no_cloak_key",
                message:
                    "Merchant has not yet published a Cloak viewing key. Private payments disabled until the merchant enables Cloak from the dashboard.",
            },
            { status: 404 }
        );
    }
    return NextResponse.json({
        merchantWallet: merchant.walletAddress,
        cloakViewingNk: merchant.cloakViewingNk,
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

    let body: { cloakViewingNk?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const raw = body.cloakViewingNk;
    if (!raw || typeof raw !== "string") {
        return NextResponse.json(
            { error: "cloakViewingNk required (32-byte hex)" },
            { status: 400 }
        );
    }
    if (!isValidHex32(raw)) {
        return NextResponse.json(
            { error: "cloakViewingNk must be 64 hex chars (32 bytes)" },
            { status: 400 }
        );
    }
    const normalised = (raw.startsWith("0x") ? raw.slice(2) : raw).toLowerCase();

    const merchant =
        (await getMerchantBySignerWallet(sessionWallet)) ||
        (await getMerchantByWallet(sessionWallet));
    if (!merchant) {
        return NextResponse.json(
            {
                error: "merchant_not_found",
                message:
                    "Sign-in wallet has no merchant record. Complete onboarding first.",
            },
            { status: 404 }
        );
    }

    if (merchant.cloakViewingNk === normalised) {
        return NextResponse.json({
            ok: true,
            unchanged: true,
            merchantId: merchant.id,
            cloakViewingNk: normalised,
        });
    }

    const { error } = await supabase
        .from("merchants")
        .update({
            cloak_viewing_nk: normalised,
            cloak_set_at: new Date().toISOString(),
        })
        .eq("id", merchant.id);

    if (error) {
        console.error("[cloak-key] update failed:", error);
        return NextResponse.json(
            { error: "update_failed", detail: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        ok: true,
        merchantId: merchant.id,
        cloakViewingNk: normalised,
    });
}
