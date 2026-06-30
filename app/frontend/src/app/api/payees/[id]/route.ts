/**
 * DELETE /api/payees/[id]?wallet=<pubkey> — Remove a saved supplier.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { deletePayee } from "@/lib/payees";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await requireMerchantSession(request);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const { id } = await params;
        const ok = await deletePayee(session.merchantId, id);
        if (!ok) {
            return NextResponse.json({ error: "Payee not found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (err) {
        logger.error("[payees] DELETE error:", err);
        return NextResponse.json({ error: "Failed to delete payee" }, { status: 500 });
    }
}
