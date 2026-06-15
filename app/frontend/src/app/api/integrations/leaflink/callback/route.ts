/**
 * POST /api/integrations/leaflink/callback
 *
 * Called by Offbank's internal webhook system when an invoice linked to
 * a LeafLink order gets paid.
 *
 * Flow:
 *   1. Offbank fires `payment.completed` for the invoice
 *   2. Internal webhook dispatcher calls this endpoint
 *   3. We update the sync record → "paid"
 *   4. We push the payment proof back to LeafLink via their API
 *   5. We update the sync record → "synced"
 *
 * This endpoint is internal-only — protected by a shared secret.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { syncPaymentToLeafLink } from "@/lib/leaflink/sync";

const CALLBACK_SECRET = process.env.LEAFLINK_CALLBACK_SECRET || "ll_callback_dev_secret";

/* ── Payload from Offbank webhook dispatcher ──────────── */
interface CallbackPayload {
    event: "invoice.paid";
    invoice_id: string;
    tx_signature: string;
    payer_wallet: string;
    amount: number;
    paid_at: string;
}

export async function POST(request: NextRequest) {
    try {
        // Verify internal secret
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace("Bearer ", "");

        if (!token || !crypto.timingSafeEqual(
            Buffer.from(token),
            Buffer.from(CALLBACK_SECRET),
        )) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = (await request.json()) as CallbackPayload;
        const { invoice_id, tx_signature, payer_wallet, amount, paid_at } = body;

        if (!invoice_id || !tx_signature) {
            return NextResponse.json(
                { error: "Missing invoice_id or tx_signature" },
                { status: 400 },
            );
        }

        logger.info(
            `[leaflink] Callback: invoice ${invoice_id} paid — tx ${tx_signature}`,
        );

        const result = await syncPaymentToLeafLink({
            invoiceId: invoice_id,
            txSignature: tx_signature,
            amount,
            paidAt: paid_at,
        });

        if (!result.matched) {
            logger.info(`[leaflink] No sync found for invoice ${invoice_id}, ignoring`);
            return NextResponse.json({ received: true, matched: false });
        }

        return NextResponse.json({
            received: true,
            paid: true,
            synced: result.synced,
            leaflink_order: result.orderNumber,
            ...(result.reason ? { reason: result.reason } : {}),
            ...(result.error
                ? { error: "LeafLink API sync failed — payment is confirmed, will retry" }
                : {}),
        });

    } catch (error) {
        logger.error("[leaflink] Callback error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
