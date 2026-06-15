/**
 * LeafLink ↔ Offbank — payment settle-back.
 *
 * Shared "an Offbank invoice linked to a LeafLink order got paid → push the
 * payment proof back to LeafLink" logic. Used by both the invoice-pay route
 * (in-process, fire-and-forget) and the internal callback endpoint, so the
 * external_id + payment note land on the LeafLink order exactly once.
 *
 * Safe to call for *every* invoice payment: if the invoice isn't linked to a
 * LeafLink order, it returns `{ matched: false }` and does nothing.
 */

import { logger } from "@/lib/logger";
import { getSyncByInvoiceId, updateSync, getConfig } from "./db";
import { LeafLinkClient } from "./client";

export interface SyncPaymentResult {
    /** Was this invoice linked to a LeafLink order? */
    matched: boolean;
    /** Did we successfully push the payment proof back to LeafLink? */
    synced: boolean;
    /** Why we didn't sync (e.g. "no_config", "already_synced"). */
    reason?: string;
    /** Error message if the LeafLink API call failed. */
    error?: string;
    /** The LeafLink order number, when matched. */
    orderNumber?: string;
}

/**
 * Mark a LeafLink-linked invoice as paid and sync the payment back to LeafLink.
 *
 * Idempotent: a sync already in `synced` status is a no-op. On LeafLink API
 * failure the sync is left in `paid` with the error recorded, so the
 * `/retry` endpoint can re-push it without losing the confirmed payment.
 */
export async function syncPaymentToLeafLink(args: {
    invoiceId: string;
    txSignature: string;
    amount?: number;
    paidAt?: string;
}): Promise<SyncPaymentResult> {
    const { invoiceId, txSignature, amount, paidAt } = args;

    const sync = await getSyncByInvoiceId(invoiceId);
    if (!sync) {
        return { matched: false, synced: false, reason: "not_a_leaflink_invoice" };
    }

    if (sync.status === "synced") {
        return {
            matched: true,
            synced: true,
            reason: "already_synced",
            orderNumber: sync.leaflink_order_number,
        };
    }

    // Record the payment on the sync record first, so a later API failure
    // still leaves us with the tx signature to retry from.
    await updateSync(sync.id, { status: "paid", tx_signature: txSignature });

    const config = await getConfig(sync.merchant_id);
    if (!config) {
        logger.warn(
            `[leaflink] No config for merchant ${sync.merchant_id}; payment recorded but not synced back`,
        );
        return {
            matched: true,
            synced: false,
            reason: "no_config",
            orderNumber: sync.leaflink_order_number,
        };
    }

    try {
        const ll = new LeafLinkClient({
            apiKey: config.leaflink_api_key,
            companyId: config.leaflink_company_id,
        });

        await ll.setExternalPaymentRef(sync.leaflink_order_id, {
            tx_signature: txSignature,
            settlr_invoice_id: invoiceId,
            settled_at: paidAt || new Date().toISOString(),
            amount_usdc: amount ?? sync.amount,
        });

        await updateSync(sync.id, { status: "synced", error: undefined });

        logger.info(
            `[leaflink] Order ${sync.leaflink_order_number} synced back to LeafLink ✓`,
        );

        return {
            matched: true,
            synced: true,
            orderNumber: sync.leaflink_order_number,
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : "LeafLink sync failed";
        logger.error(
            `[leaflink] Sync-back failed for order ${sync.leaflink_order_number}: ${msg}`,
        );
        // Keep status "paid" (the payment is confirmed) and record the error;
        // POST /api/integrations/leaflink/retry will re-attempt the push.
        await updateSync(sync.id, { status: "paid", error: msg });
        return {
            matched: true,
            synced: false,
            error: msg,
            orderNumber: sync.leaflink_order_number,
        };
    }
}
