/**
 * Merchant API key management (for the SDK / payout + checkout APIs).
 *
 *   GET  /api/keys   → list this merchant's keys (metadata only)
 *   POST /api/keys   → issue a new key (raw secret returned ONCE)
 *
 * Authenticated by the signed merchant session (offbank_session cookie) — the
 * merchant is derived from the verified session, never from a request param,
 * so a caller can't mint or list keys for another merchant's wallet.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createApiKey, listApiKeys } from "@/lib/db";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(request: NextRequest) {
    const session = await requireMerchantSession(request);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    try {
        const keys = await listApiKeys(session.merchantId);
        return NextResponse.json({ keys });
    } catch (err) {
        logger.error("[keys] list failed:", err);
        return NextResponse.json({ error: "Failed to list keys" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await requireMerchantSession(request);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    try {
        const { name } = await request.json().catch(() => ({}));
        const created = await createApiKey(
            session.merchantId,
            (name || "API key").toString().slice(0, 80),
        );
        return NextResponse.json(created);
    } catch (err) {
        logger.error("[keys] create failed:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error ? err.message : "Failed to create API key",
            },
            { status: 500 },
        );
    }
}
