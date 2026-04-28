/**
 * POST /api/auth/wallet/verify
 * Body: { wallet: string, signature: string (base58) }
 *
 * Verifies the Ed25519 signature against the message bound to the
 * wallet's nonce cookie, then issues a 7-day session cookie that
 * downstream routes use to identify the merchant.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    buildSignInMessage,
    clearNonceCookie,
    isValidSolanaAddress,
    issueSession,
    readNonceCookie,
    setSessionCookie,
    verifyWalletSignature,
} from "@/lib/wallet-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    const rateLimited = await checkRateLimit(`auth-verify:${getClientIp(request)}`);
    if (rateLimited) return rateLimited;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const wallet = typeof body?.wallet === "string" ? body.wallet.trim() : "";
    const signature = typeof body?.signature === "string" ? body.signature.trim() : "";

    if (!isValidSolanaAddress(wallet) || !signature) {
        return NextResponse.json(
            { error: "wallet and signature are required" },
            { status: 400 },
        );
    }

    const cookie = readNonceCookie(request);
    if (!cookie) {
        return NextResponse.json(
            { error: "Nonce missing or expired — request a new nonce" },
            { status: 401 },
        );
    }
    if (cookie.wallet !== wallet) {
        return NextResponse.json(
            { error: "Wallet does not match issued nonce" },
            { status: 401 },
        );
    }

    // Reconstruct the exact message the client was asked to sign. We must
    // re-derive it from the cookie's nonce (not from any client-supplied
    // value) so the signature can't be replayed against a different message.
    // We trust the nonce cookie's expiresAt indirectly: readNonceCookie
    // already rejected expired cookies, but we also need the exact expiresAt
    // bound into the message. Since the cookie expires with the same TTL,
    // we re-issue the message using cookie.expiresAt; we encode it back into
    // the cookie for retrieval.
    // → Simpler: include expiresAt in the cookie payload itself.
    // For now, re-derive the message using a stable Expires field that
    // matches what nonce route returned.
    // (Implementation note: nonce cookie token = nonce.exp.wallet.sig — exp
    // is parsed back here.)
    const expiresAtMatch = request.cookies.get("settlr_nonce")?.value?.split(".")[1];
    const expiresAt = expiresAtMatch ? Number(expiresAtMatch) : NaN;
    if (!Number.isFinite(expiresAt)) {
        return NextResponse.json({ error: "Malformed nonce cookie" }, { status: 401 });
    }

    const message = buildSignInMessage(wallet, cookie.nonce, expiresAt);
    const ok = verifyWalletSignature({ wallet, message, signatureBase58: signature });
    if (!ok) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const session = issueSession(wallet);
    const res = NextResponse.json({
        wallet,
        expiresAt: session.expiresAt,
    });
    setSessionCookie(res, session.token, session.expiresAt);
    clearNonceCookie(res); // single-use
    return res;
}
