/**
 * GET /api/auth/wallet/nonce?wallet=<base58>
 *
 * Returns a one-time nonce + the exact message to sign.
 * Stores an HMAC-signed nonce cookie that the verify endpoint will check.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    isValidSolanaAddress,
    issueNonce,
    setNonceCookie,
} from "@/lib/wallet-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    const rateLimited = await checkRateLimit(`auth-nonce:${getClientIp(request)}`);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet")?.trim() || "";

    if (!isValidSolanaAddress(wallet)) {
        return NextResponse.json(
            { error: "Invalid or missing wallet parameter" },
            { status: 400 },
        );
    }

    const issued = issueNonce(wallet);
    const res = NextResponse.json({
        nonce: issued.nonce,
        message: issued.message,
        expiresAt: issued.expiresAt,
    });
    setNonceCookie(res, issued.token, issued.expiresAt);
    return res;
}
