/**
 * Shared helper for routes that authenticate a merchant via the
 * `settlr_session` cookie set by /api/auth/wallet/verify.
 *
 * Replaces the previous pattern of trusting the `x-merchant-wallet`
 * request header (which any caller could forge to impersonate any
 * merchant in the database).
 *
 * Backwards-compatible escape hatch: when ALLOW_HEADER_AUTH=true (dev
 * only — must NEVER be set in production), the helper falls back to
 * the legacy header so the dashboard can still be exercised before the
 * client-side wallet sign-in flow lands.
 */

import { NextRequest } from "next/server";
import { getSessionWallet, isValidSolanaAddress } from "@/lib/wallet-session";
import { getOrCreateMerchantByWallet } from "@/lib/db";

export interface MerchantSession {
    valid: true;
    merchantId: string;
    merchantWallet: string;
    merchantName: string;
}

export async function requireMerchantSession(
    request: NextRequest,
): Promise<MerchantSession | null> {
    let wallet = getSessionWallet(request);

    // Dev-only: allow the legacy header until all clients migrate.
    // Production builds must not set this env var.
    if (
        !wallet &&
        process.env.NODE_ENV !== "production" &&
        process.env.ALLOW_HEADER_AUTH === "true"
    ) {
        const headerWallet = request.headers.get("x-merchant-wallet");
        if (headerWallet && isValidSolanaAddress(headerWallet)) {
            wallet = headerWallet;
        }
    }

    if (!wallet) return null;

    try {
        const merchant = await getOrCreateMerchantByWallet(wallet);
        return {
            valid: true,
            merchantId: merchant.id,
            merchantWallet: merchant.walletAddress || wallet,
            merchantName: merchant.name,
        };
    } catch {
        return null;
    }
}
