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
import {
    getSyncByInvoiceId,
    updateSync,
    getConfig,
} from "@/lib/leaflink/db";
import { LeafLinkClient } from "@/lib/leaflink/client";

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

        // 1. Find the sync record
        const sync = await getSyncByInvoiceId(invoice_id);
        if (!sync) {
            logger.info(`[leaflink] No sync found for invoice ${invoice_id}, ignoring`);
            return NextResponse.json({ received: true, matched: false });
        }

        // 2. Mark as paid
        await updateSync(sync.id, {
            status: "paid",
            tx_signature,
        });

        logger.info(
            `[leaflink] Sync ${sync.id} marked paid — order ${sync.leaflink_order_number}`,
        );

        // 3. Push payment proof back to LeafLink
        const config = await getConfig(sync.merchant_id);
        if (!config) {
            logger.warn(
                `[leaflink] No config for merchant ${sync.merchant_id}, skipping LL sync`,
            );
            return NextResponse.json({
                received: true,
                paid: true,
                synced: false,
                reason: "no_config",
            });
        }

        try {
            const ll = new LeafLinkClient({
                apiKey: config.leaflink_api_key,
                companyId: config.leaflink_company_id,
            });

            await ll.setExternalPaymentRef(sync.leaflink_order_id, {
                tx_signature,
                settlr_invoice_id: invoice_id,
                settled_at: paid_at || new Date().toISOString(),
                amount_usdc: amount || sync.amount,
            });

            // 4. Mark as fully synced
            await updateSync(sync.id, { status: "synced" });

            logger.info(
                `[leaflink] Order ${sync.leaflink_order_number} synced back to LeafLink ✓`,
            );

            return NextResponse.json({
                received: true,
                paid: true,
                synced: true,
                leaflink_order: sync.leaflink_order_number,
            });

        } catch (llError) {
            // Payment is confirmed but LL sync failed — don't lose the tx
            logger.error(
                `[leaflink] LeafLink API sync failed for order ${sync.leaflink_order_number}:`,
                llError,
            );

            await updateSync(sync.id, {
                status: "paid", // Keep as paid, not synced
                error: llError instanceof Error ? llError.message : "LeafLink sync failed",
            });

            return NextResponse.json({
                received: true,
                paid: true,
                synced: false,
                error: "LeafLink API sync failed — payment is confirmed, will retry",
            });
        }

    } catch (error) {
        logger.error("[leaflink] Callback error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
