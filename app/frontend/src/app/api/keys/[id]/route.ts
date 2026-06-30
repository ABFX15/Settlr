/**
 * DELETE /api/keys/:id  → revoke (deactivate) an API key.
 * Scoped to the signed-in merchant (from the session) so one merchant can't
 * revoke another's key.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { revokeApiKey } from "@/lib/db";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireMerchantSession(request);
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const ok = await revokeApiKey(session.merchantId, id);
        return NextResponse.json({ success: ok });
    } catch (err) {
        logger.error("[keys] revoke failed:", err);
        return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
    }
}
