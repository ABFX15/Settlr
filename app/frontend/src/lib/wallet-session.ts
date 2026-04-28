/**
 * Wallet-session authentication.
 *
 * Replaces the legacy `x-merchant-wallet` header (which any caller could
 * forge) with a sign-in flow:
 *
 *   1. Client GETs /api/auth/wallet/nonce → server returns a one-time
 *      nonce + the exact message to sign, and sets a short-lived signed
 *      `settlr_nonce` cookie containing that nonce.
 *   2. Client signs the message with their wallet (Ed25519).
 *   3. Client POSTs /api/auth/wallet/verify with {wallet, signature}.
 *      Server verifies the nonce cookie + the Ed25519 signature, then
 *      sets a 7-day `settlr_session` cookie binding the verified wallet.
 *
 * Server routes call `getSessionWallet(request)` to read the verified
 * wallet — never trusting client-supplied wallet headers/bodies for auth.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";

const SESSION_COOKIE = "settlr_session";
const NONCE_COOKIE = "settlr_nonce";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getSecret(): string {
    const s = process.env.SESSION_SECRET;
    if (!s || s.length < 32) {
        if (process.env.NODE_ENV === "production") {
            throw new Error(
                "[wallet-session] FATAL: SESSION_SECRET must be set (>= 32 chars) in production",
            );
        }
        // Stable dev fallback so cookies survive HMR. Do not rely on this in prod.
        return "dev-only-session-secret-do-not-use-in-production-xxxxxxxxxxxxxx";
    }
    return s;
}

function hmac(payload: string): string {
    return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function timingSafeEq(a: string, b: string): boolean {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    try {
        return crypto.timingSafeEqual(aBuf, bBuf);
    } catch {
        return false;
    }
}

const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolanaAddress(s: unknown): s is string {
    return typeof s === "string" && SOLANA_ADDRESS_RE.test(s);
}

/* ── Nonce ─────────────────────────────────────────────── */

export interface IssuedNonce {
    nonce: string;
    message: string;
    expiresAt: number;
}

export function buildSignInMessage(wallet: string, nonce: string, expiresAt: number): string {
    return [
        "Settlr sign-in",
        "",
        `Wallet: ${wallet}`,
        `Nonce: ${nonce}`,
        `Expires: ${new Date(expiresAt).toISOString()}`,
        "",
        "Signing this message proves wallet ownership. It is not a transaction and costs nothing.",
    ].join("\n");
}

export function issueNonce(wallet: string): { token: string; nonce: string; expiresAt: number; message: string } {
    const nonce = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + NONCE_TTL_MS;
    const payload = `${nonce}.${expiresAt}.${wallet}`;
    const token = `${payload}.${hmac(payload)}`;
    return {
        token,
        nonce,
        expiresAt,
        message: buildSignInMessage(wallet, nonce, expiresAt),
    };
}

export function readNonceCookie(request: NextRequest): { nonce: string; wallet: string } | null {
    const token = request.cookies.get(NONCE_COOKIE)?.value;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 4) return null;
    const [nonce, expStr, wallet, sig] = parts;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;
    const expected = hmac(`${nonce}.${expStr}.${wallet}`);
    if (!timingSafeEq(sig, expected)) return null;
    if (!isValidSolanaAddress(wallet)) return null;
    return { nonce, wallet };
}

export function setNonceCookie(res: NextResponse, token: string, expiresAt: number) {
    res.cookies.set(NONCE_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(expiresAt),
    });
}

export function clearNonceCookie(res: NextResponse) {
    res.cookies.set(NONCE_COOKIE, "", { path: "/", maxAge: 0 });
}

/* ── Session ───────────────────────────────────────────── */

export function issueSession(wallet: string): { token: string; expiresAt: number } {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const payload = `${wallet}.${expiresAt}`;
    const token = `${payload}.${hmac(payload)}`;
    return { token, expiresAt };
}

export function setSessionCookie(res: NextResponse, token: string, expiresAt: number) {
    res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(expiresAt),
    });
}

export function clearSessionCookie(res: NextResponse) {
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

/**
 * Extract the verified wallet address from the session cookie, or null
 * if the cookie is missing/expired/tampered.
 */
export function getSessionWallet(request: NextRequest): string | null {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [wallet, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;
    const expected = hmac(`${wallet}.${expStr}`);
    if (!timingSafeEq(sig, expected)) return null;
    if (!isValidSolanaAddress(wallet)) return null;
    return wallet;
}

/* ── Signature verification ────────────────────────────── */

export function verifyWalletSignature(args: {
    wallet: string;
    message: string;
    signatureBase58: string;
}): boolean {
    try {
        const pubkey = bs58.decode(args.wallet);
        const signature = bs58.decode(args.signatureBase58);
        const messageBytes = new TextEncoder().encode(args.message);
        if (pubkey.length !== 32 || signature.length !== 64) return false;
        return nacl.sign.detached.verify(messageBytes, signature, pubkey);
    } catch {
        return false;
    }
}
