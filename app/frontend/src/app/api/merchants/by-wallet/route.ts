/**
 * GET /api/merchants/by-wallet?wallet=<pubkey>
 *
 * Lightweight endpoint for routing decisions. Returns whether the wallet
 * is already registered as a merchant, and (if so) the minimum info
 * needed to route the user to the dashboard.
 *
 * Public: this only confirms account existence for a wallet you supply.
 * No PII, no balances. Used by /login and /onboarding to decide whether
 * to send the user to /dashboard or /onboarding.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getMerchantByWallet } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const wallet = request.nextUrl.searchParams.get("wallet")?.trim();
    if (!wallet) {
        return NextResponse.json(
            { error: "missing_wallet" },
            { status: 400 },
        );
    }

    try {
        const merchant = await getMerchantByWallet(wallet);
        if (!merchant) {
            return NextResponse.json({ exists: false });
        }
        return NextResponse.json({
            exists: true,
            merchant: {
                id: merchant.id,
                name: merchant.name,
                walletAddress: merchant.walletAddress,
                signerWallet: merchant.signerWallet ?? null,
                multisigPda: (merchant as any).multisigPda ?? null,
            },
        });
    } catch (err) {
        logger.error("[merchants/by-wallet] error:", err);
        return NextResponse.json(
            { error: "lookup_failed" },
            { status: 500 },
        );
    }
}
