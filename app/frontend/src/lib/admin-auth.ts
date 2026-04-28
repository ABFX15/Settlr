/**
 * Admin authorization — wallet-gated.
 *
 * Replaces the legacy shared-secret model (`ADMIN_SECRET` Bearer header).
 * Admin status is now determined by the *signed-in wallet* matching the
 * `ADMIN_WALLETS` env list. This means:
 *
 *   - There is no shared password to leak / rotate.
 *   - Every admin action is implicitly attributable: the caller proved
 *     control of a specific wallet via the wallet-session cookie flow.
 *   - Adding/removing admins is a single env-var change (or future:
 *     promote to a Squads multisig with rotating membership).
 *
 * For destructive on-chain actions (claim fees, update platform fee,
 * pause program), we additionally check that the wallet matches the
 * platform `authority` PDA — that's what the on-chain program enforces
 * anyway, so the env list is just a convenience read-gate for the UI.
 *
 * Env: ADMIN_WALLETS=pubkey1,pubkey2,pubkey3   (comma-separated, trimmed)
 *
 * Backwards compatibility: if `ADMIN_SECRET` is set AND the request
 * carries a matching `Authorization: Bearer <secret>` header, we still
 * accept it. This lets server-to-server scripts (cron, deploy hooks)
 * keep working during the migration window. Plan to remove after the
 * UI is fully migrated and any external callers are updated.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionWallet } from "./wallet-session";

function parseAdminWallets(): Set<string> {
    const raw = process.env.ADMIN_WALLETS || "";
    return new Set(
        raw
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
    );
}

export interface AdminAuthOk {
    ok: true;
    wallet: string | null; // null when authed via legacy secret
    via: "wallet" | "legacy_secret";
}
export interface AdminAuthErr {
    ok: false;
    response: NextResponse;
}
export type AdminAuthResult = AdminAuthOk | AdminAuthErr;

/**
 * Returns the authenticated admin's wallet (preferred) or null + via=legacy
 * if the caller used ADMIN_SECRET. Returns an error response otherwise.
 *
 * Usage in a route handler:
 *
 *   const auth = requireAdmin(request);
 *   if (!auth.ok) return auth.response;
 *   // proceed; auth.wallet is the verified admin pubkey
 */
export function requireAdmin(request: NextRequest): AdminAuthResult {
    // Prefer wallet session
    const sessionWallet = getSessionWallet(request);
    if (sessionWallet) {
        const allowed = parseAdminWallets();
        if (allowed.has(sessionWallet)) {
            return { ok: true, wallet: sessionWallet, via: "wallet" };
        }
        // Authenticated but not an admin
        return {
            ok: false,
            response: NextResponse.json(
                {
                    error: "forbidden",
                    message: "This wallet is not on the platform admin list.",
                },
                { status: 403 },
            ),
        };
    }

    // Legacy fallback — server-to-server scripts only
    const adminSecret = process.env.ADMIN_SECRET;
    const auth = request.headers.get("authorization");
    if (adminSecret && auth) {
        const token = auth.replace("Bearer ", "");
        const a = Buffer.from(token);
        const b = Buffer.from(adminSecret);
        if (a.length === b.length) {
            try {
                if (crypto.timingSafeEqual(a, b)) {
                    return { ok: true, wallet: null, via: "legacy_secret" };
                }
            } catch {
                /* fall through */
            }
        }
    }

    return {
        ok: false,
        response: NextResponse.json(
            {
                error: "unauthenticated",
                message:
                    "Sign in with an admin wallet (ADMIN_WALLETS env list) to access this endpoint.",
            },
            { status: 401 },
        ),
    };
}

/**
 * Public — for the client to ask "is the currently signed-in wallet an
 * admin?" without trying every endpoint and parsing 401/403 responses.
 */
export function isAdminWallet(wallet: string | null): boolean {
    if (!wallet) return false;
    return parseAdminWallets().has(wallet);
}
