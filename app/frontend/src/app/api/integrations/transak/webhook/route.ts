/**
 * POST /api/integrations/transak/webhook
 *
 * Transak calls this when a fiat→USDC on-ramp order changes state. On a
 * COMPLETED order (USDC delivered to the merchant's wallet) we verify the
 * signature, match the order to its invoice via partnerOrderId (the invoice
 * view token), sanity-check the amount/destination, and mark the invoice
 * paid — the same settlement path as an on-chain payment, including the
 * LeafLink sync-back.
 *
 * Security: the order is delivered as a JWT signed with TRANSAK_WEBHOOK_SECRET,
 * so a forged request can't settle an invoice. Non-completed statuses are
 * acknowledged (200) without side effects.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { explorerUrl } from "@/lib/constants";
import { emitEvent } from "@/lib/pipeline";
import { syncPaymentToLeafLink } from "@/lib/leaflink/sync";
import {
    getInvoiceByViewToken,
    updateInvoiceStatus,
    creditMerchantBalance,
    getOrCreateMerchantByWallet,
    createPayment,
} from "@/lib/db";
import {
    verifyTransakWebhook,
    isOrderCompleted,
} from "@/lib/transak";

// USDC base-unit tolerance: accept if delivered within $0.50 of the total
// (on-ramp quotes drift slightly between widget open and settlement).
const AMOUNT_TOLERANCE_USD = 0.5;

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();

        const secret = process.env.TRANSAK_WEBHOOK_SECRET;
        if (!secret) {
            logger.error("[transak] TRANSAK_WEBHOOK_SECRET not configured");
            return NextResponse.json(
                { error: "webhook_not_configured" },
                { status: 503 },
            );
        }

        const event = verifyTransakWebhook(rawBody, secret);
        if (!event) {
            logger.warn("[transak] Webhook signature verification failed");
            return NextResponse.json({ error: "invalid signature" }, { status: 401 });
        }

        const order = event.webhookData;
        logger.info(
            `[transak] Webhook ${event.eventID} — order ${order.id} status ${order.status}`,
        );

        // Only completed orders settle an invoice.
        if (!isOrderCompleted(event)) {
            return NextResponse.json({ received: true, settled: false });
        }

        const token = order.partnerOrderId;
        if (!token) {
            logger.warn("[transak] Completed order has no partnerOrderId");
            return NextResponse.json({ received: true, matched: false });
        }

        const invoice = await getInvoiceByViewToken(token);
        if (!invoice) {
            logger.warn(`[transak] No invoice for partnerOrderId ${token}`);
            return NextResponse.json({ received: true, matched: false });
        }

        // Idempotency — Transak may retry, and the order may also be settled
        // on-chain elsewhere.
        if (invoice.status === "paid") {
            return NextResponse.json({ received: true, duplicate: true });
        }
        if (invoice.status === "cancelled") {
            return NextResponse.json({ received: true, cancelled: true });
        }

        // Sanity: right asset, right destination, right amount.
        if (order.cryptoCurrency && order.cryptoCurrency.toUpperCase() !== "USDC") {
            logger.warn(`[transak] Order ${order.id} not USDC (${order.cryptoCurrency})`);
            return NextResponse.json({ received: true, settled: false });
        }
        if (
            order.walletAddress &&
            order.walletAddress !== invoice.merchantWallet
        ) {
            logger.error(
                `[transak] Order ${order.id} destination ${order.walletAddress} != merchant ${invoice.merchantWallet}; refusing to settle`,
            );
            return NextResponse.json({ received: true, settled: false });
        }
        const paidAmount = order.cryptoAmount ?? order.fiatAmount ?? 0;
        if (paidAmount + AMOUNT_TOLERANCE_USD < invoice.total) {
            logger.error(
                `[transak] Order ${order.id} amount ${paidAmount} < invoice total ${invoice.total}; refusing to settle`,
            );
            return NextResponse.json({ received: true, settled: false });
        }

        const txSignature = order.transactionHash || `transak_${order.id}`;

        // ── Settle (mirrors the on-chain invoice-pay route) ──────
        await updateInvoiceStatus(invoice.id, "paid", {
            paymentSignature: txSignature,
            paidAt: new Date(),
        });

        try {
            const merchant = await getOrCreateMerchantByWallet(invoice.merchantWallet);
            await creditMerchantBalance(merchant.id, invoice.total, {
                txSignature,
                description: `Invoice ${invoice.invoiceNumber} paid via Transak (USD on-ramp)`,
            });
            const now = Date.now();
            await createPayment({
                sessionId: `inv_${invoice.id}`,
                merchantId: merchant.id,
                merchantName: invoice.merchantName || merchant.name,
                merchantWallet: invoice.merchantWallet,
                customerWallet: "transak",
                amount: invoice.total,
                currency: invoice.currency || "USDC",
                description: `Invoice #${invoice.invoiceNumber} — paid in USD via Transak`,
                txSignature,
                explorerUrl: order.transactionHash ? explorerUrl(txSignature) : "",
                createdAt: now,
                completedAt: now,
                status: "completed",
            });
        } catch (err) {
            logger.error("[transak] Error crediting/recording payment:", err);
        }

        emitEvent("invoice.paid", "invoice", invoice.id, invoice.merchantId || "", {
            amount: invoice.total,
            invoiceNumber: invoice.invoiceNumber,
            paymentSignature: txSignature,
            source: "transak",
        }).catch((err) => logger.error("[pipeline] emit error:", err));

        // If this invoice came from a LeafLink order, sync the payment back.
        syncPaymentToLeafLink({
            invoiceId: invoice.id,
            txSignature,
            amount: invoice.total,
            paidAt: new Date().toISOString(),
        }).catch((err) => logger.error("[leaflink] sync-back error:", err));

        logger.info(
            `[transak] Invoice ${invoice.invoiceNumber} settled via Transak order ${order.id}`,
        );

        return NextResponse.json({ received: true, settled: true });
    } catch (error) {
        logger.error("[transak] Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
