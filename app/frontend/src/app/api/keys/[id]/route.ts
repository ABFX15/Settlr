/**
 * DELETE /api/keys/:id?wallet=...  → revoke (deactivate) an API key.
 * Scoped to the owning merchant so one merchant can't revoke another's key.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getOrCreateMerchantByWallet, revokeApiKey } from "@/lib/db";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const wallet = request.nextUrl.searchParams.get("wallet");
        if (!wallet) {
            return NextResponse.json(
                { error: "wallet is required" },
                { status: 400 },
            );
        }
        const merchant = await getOrCreateMerchantByWallet(wallet);
        const ok = await revokeApiKey(merchant.id, id);
        return NextResponse.json({ success: ok });
    } catch (err) {
        logger.error("[keys] revoke failed:", err);
        return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
    }
}
