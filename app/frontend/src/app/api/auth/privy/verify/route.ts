/**
 * POST /api/auth/privy/verify
 * Body: { accessToken: string }
 *
 * Verifies a Privy-issued access token, extracts the user's Solana
 * wallet address (embedded or linked external), and issues the same
 * 7-day `offbank_session` cookie that the wallet-adapter sign-in flow
 * uses. Downstream API routes don't need to know which auth method
 * was used — they just check `getSessionWallet(req)`.
 */

import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import {
    isValidSolanaAddress,
    issueSession,
    setSessionCookie,
} from "@/lib/wallet-session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const APP_SECRET = process.env.PRIVY_APP_SECRET;

let _client: PrivyClient | null = null;
function getClient(): PrivyClient | null {
    if (!APP_ID || !APP_SECRET) return null;
    if (!_client) _client = new PrivyClient(APP_ID, APP_SECRET);
    return _client;
}

export async function POST(request: NextRequest) {
    const rateLimited = await checkRateLimit(`privy-verify:${getClientIp(request)}`);
    if (rateLimited) return rateLimited;

    const client = getClient();
    if (!client) {
        return NextResponse.json(
            { error: "Privy not configured on this server" },
            { status: 501 },
        );
    }

    let body: { accessToken?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
    if (!accessToken) {
        return NextResponse.json(
            { error: "accessToken required" },
            { status: 400 },
        );
    }

    // Verify the token signature against Privy's JWKS.
    let claims;
    try {
        claims = await client.verifyAuthToken(accessToken);
    } catch {
        return NextResponse.json(
            { error: "Invalid Privy access token" },
            { status: 401 },
        );
    }

    // Pull the full user record so we can find their Solana wallet.
    const user = await client.getUser(claims.userId);

    // Prefer the embedded Solana wallet (created by Privy on first
    // sign-in). Fall back to the first linked external Solana wallet.
    type LinkedAccount = {
        type?: string;
        chainType?: string;
        address?: string;
        walletClientType?: string;
    };
    const accounts = (user.linkedAccounts ?? []) as LinkedAccount[];
    const solanaWallets = accounts.filter(
        (a) => a.type === "wallet" && a.chainType === "solana" && a.address,
    );
    if (solanaWallets.length === 0) {
        return NextResponse.json(
            { error: "No Solana wallet on Privy user — embedded wallet provisioning failed" },
            { status: 422 },
        );
    }
    const embedded = solanaWallets.find((a) => a.walletClientType === "privy");
    const wallet = (embedded ?? solanaWallets[0]).address!;

    if (!isValidSolanaAddress(wallet)) {
        return NextResponse.json(
            { error: "Privy returned an invalid Solana address" },
            { status: 500 },
        );
    }

    const session = issueSession(wallet);
    const res = NextResponse.json({
        wallet,
        privyUserId: claims.userId,
        expiresAt: session.expiresAt,
    });
    setSessionCookie(res, session.token, session.expiresAt);
    return res;
}
