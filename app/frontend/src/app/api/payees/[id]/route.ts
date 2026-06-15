/**
 * DELETE /api/payees/[id]?wallet=<pubkey> — Remove a saved supplier.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateMerchantByWallet } from "@/lib/db";
import { deletePayee } from "@/lib/payees";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const wallet = new URL(request.url).searchParams.get("wallet");
        if (!wallet || wallet.length < 32) {
            return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
        }
        const merchant = await getOrCreateMerchantByWallet(wallet);
        const ok = deletePayee(merchant.id, id);
        if (!ok) {
            return NextResponse.json({ error: "Payee not found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (err) {
        logger.error("[payees] DELETE error:", err);
        return NextResponse.json({ error: "Failed to delete payee" }, { status: 500 });
    }
}
