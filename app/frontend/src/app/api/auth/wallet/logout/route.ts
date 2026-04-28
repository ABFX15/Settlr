/**
 * POST /api/auth/wallet/logout — clears the wallet session cookie.
 * GET  /api/auth/wallet/logout — same, for convenience.
 */

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/wallet-session";

function logout() {
    const res = NextResponse.json({ ok: true });
    clearSessionCookie(res);
    return res;
}

export async function POST() {
    return logout();
}

export async function GET() {
    return logout();
}
