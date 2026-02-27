/**
 * POST /api/integrations/leaflink/webhook
 *
 * Receives webhooks from LeafLink when purchase orders are created,
 * accepted, shipped, delivered, or cancelled.
 *
 * On `order.created` or `order.accepted`:
 *   1. Creates a Settlr invoice for the order total
 *   2. Generates a USDC payment link
 *   3. Emails the payment link to the buyer
 *   4. Stores a sync record to track the lifecycle
 *
 * On `order.cancelled`:
 *   1. Marks the sync record as cancelled
 *
 * Security: LeafLink signs webhooks with HMAC-SHA256.
 * The shared secret is stored per-merchant in leaflink_configs.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
    createSync,
    updateSync,
    getSyncByOrderId,
    getAllConfigs,
} from "@/lib/leaflink/db";
import type {
    LeafLinkWebhookPayload,
    LeafLinkIntegrationConfig,
} from "@/lib/leaflink/types";

/* ── Helpers ─────────────────────────────────────────── */

/**
 * Verify HMAC-SHA256 signature from LeafLink.
 */
function verifySignature(
    rawBody: string,
    signature: string,
    secret: string,
): boolean {
    const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected),
        );
    } catch {
        return false;
    }
}

/**
 * Build METRC metadata from line items if available.
 */
function extractMetrcTags(
    order: LeafLinkWebhookPayload["data"]["order"],
): Record<string, string> {
    const tags: Record<string, string> = {};
    const metrcTags = order.line_items
        .filter((li) => li.metrc_tag)
        .map((li) => li.metrc_tag!);

    if (metrcTags.length > 0) {
        tags.metrc_tags = metrcTags.join(",");
    }
    if (order.seller.license_number) {
        tags.seller_license = order.seller.license_number;
    }
    if (order.buyer.license_number) {
        tags.buyer_license = order.buyer.license_number;
    }
    return tags;
}

/**
 * Create a Settlr invoice for the LeafLink order.
 * Uses the internal /api/invoices endpoint.
 */
async function createSettlrInvoice(
    order: LeafLinkWebhookPayload["data"]["order"],
    config: LeafLinkIntegrationConfig,
    merchantWallet: string,
    merchantName: string,
): Promise<{
    invoiceId: string;
    paymentLink: string;
}> {
    const lineItems = order.line_items.map((li) => ({
        description: li.product_name,
        quantity: li.quantity,
        unit_price: li.unit_price,
        amount: li.total,
    }));

    const metrcMeta = extractMetrcTags(order);
    const memo = [
        `LeafLink ${order.number}`,
        metrcMeta.metrc_tags ? `METRC: ${metrcMeta.metrc_tags}` : null,
    ]
        .filter(Boolean)
        .join(" · ");

    // Calculate due date: delivery_date or 7 days from now
    const dueDate = order.delivery_date
        ? new Date(order.delivery_date)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invoicePayload = {
        merchant_id: config.merchant_id,
        merchant_name: merchantName,
        merchant_wallet: merchantWallet,
        invoice_number: `LL-${order.number}`,
        buyer_name: order.buyer.company_name,
        buyer_email: order.buyer.email,
        buyer_company: order.buyer.company_name,
        line_items: lineItems,
        subtotal: order.subtotal,
        tax_rate: order.tax > 0 ? (order.tax / order.subtotal) * 100 : 0,
        tax_amount: order.tax,
        total: order.total,
        currency: "USDC",
        memo,
        terms: `Auto-generated from LeafLink order ${order.number}. Payment in USDC settles instantly.`,
        due_date: dueDate.toISOString(),
        metadata: {
            source: "leaflink",
            leaflink_order_id: String(order.id),
            leaflink_order_number: order.number,
            ...metrcMeta,
        },
    };

    // Use internal API to create invoice
    if (isSupabaseConfigured()) {
        const viewToken = `ll_${crypto.randomBytes(16).toString("hex")}`;
        const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const { error } = await supabase.from("invoices").insert({
            id: invoiceId,
            ...invoicePayload,
            status: "sent",
            view_token: viewToken,
            view_count: 0,
            sent_at: new Date().toISOString(),
        });

        if (error) {
            console.error("[leaflink] Invoice insert error:", error);
            throw new Error(`Failed to create invoice: ${error.message}`);
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";
        const paymentLink = `${baseUrl}/invoice/${viewToken}`;

        return { invoiceId, paymentLink };
    }

    // In-memory fallback
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const viewToken = `ll_${crypto.randomBytes(16).toString("hex")}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";

    return {
        invoiceId,
        paymentLink: `${baseUrl}/invoice/${viewToken}`,
    };
}

/**
 * Send payment link email to the buyer.
 */
async function sendPaymentLinkEmail(
    buyerEmail: string,
    buyerCompany: string,
    sellerCompany: string,
    orderNumber: string,
    amount: number,
    paymentLink: string,
): Promise<void> {
    // Use Resend if configured, otherwise log
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        console.log(
            `[leaflink] Email skipped (no RESEND_API_KEY). Would send to ${buyerEmail}:`,
            { orderNumber, amount, paymentLink },
        );
        return;
    }

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || "payments@settlr.dev",
                to: buyerEmail,
                subject: `Payment Request: ${orderNumber} — $${amount.toFixed(2)} USDC`,
                html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto;">
            <div style="background: #0A0F1E; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #FFFFFF; font-size: 20px; margin: 0;">Payment Request</h1>
            </div>
            <div style="background: #FFFFFF; padding: 32px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 16px 16px;">
              <p style="color: #4A5568; font-size: 15px; line-height: 1.6;">
                <strong>${sellerCompany}</strong> has requested payment for LeafLink order
                <strong>${orderNumber}</strong>.
              </p>
              <div style="background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">Amount Due</p>
                <p style="color: #0A0F1E; font-size: 32px; font-weight: 700; margin: 0;">$${amount.toFixed(2)}</p>
                <p style="color: #94A3B8; font-size: 13px; margin: 4px 0 0;">USDC · Settles instantly</p>
              </div>
              <a href="${paymentLink}" style="display: block; background: linear-gradient(135deg, #10B981, #059669); color: #FFFFFF; text-align: center; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Pay Now with USDC
              </a>
              <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 16px;">
                Powered by <a href="https://settlr.dev" style="color: #10B981; text-decoration: none;">Settlr</a> · Non-custodial settlement on Solana
              </p>
            </div>
          </div>
        `,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("[leaflink] Resend error:", err);
        } else {
            console.log(`[leaflink] Payment link emailed to ${buyerEmail} for ${orderNumber}`);
        }
    } catch (err) {
        console.error("[leaflink] Email send error:", err);
    }
}

/* ── Route handler ───────────────────────────────────── */

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        let payload: LeafLinkWebhookPayload;

        try {
            payload = JSON.parse(rawBody) as LeafLinkWebhookPayload;
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON" },
                { status: 400 },
            );
        }

        const { event, data } = payload;
        const order = data?.order;

        if (!order || !order.id) {
            return NextResponse.json(
                { error: "Missing order data" },
                { status: 400 },
            );
        }

        console.log(
            `[leaflink] Webhook received: ${event} for order ${order.number} ($${order.total})`,
        );

        // Find the matching merchant config by seller company ID.
        // In production, LeafLink sends webhooks to a per-company URL,
        // but we support a shared endpoint with company routing.
        const configs = await getAllConfigs();
        const config = configs.find(
            (c) => c.leaflink_company_id === order.seller.id,
        );

        if (!config) {
            console.warn(
                `[leaflink] No integration config for seller company ${order.seller.id} (${order.seller.company_name})`,
            );
            // Return 200 so LeafLink doesn't retry
            return NextResponse.json({ received: true, matched: false });
        }

        // Verify signature if secret is configured
        const signature = request.headers.get("x-leaflink-signature") ?? "";
        if (config.webhook_secret) {
            if (!verifySignature(rawBody, signature, config.webhook_secret)) {
                console.warn("[leaflink] Invalid webhook signature");
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 401 },
                );
            }
        }

        // Look up merchant wallet
        let merchantWallet = "";
        let merchantName = order.seller.company_name;

        if (isSupabaseConfigured()) {
            const { data: merchant } = await supabase
                .from("merchants")
                .select("wallet_address, name")
                .eq("id", config.merchant_id)
                .single();

            if (merchant) {
                merchantWallet = merchant.wallet_address;
                merchantName = merchant.name || merchantName;
            }
        }

        /* ── Handle event types ───────────────────────────── */

        if (event === "order.created" || event === "order.accepted") {
            // Check for duplicate
            const existing = await getSyncByOrderId(order.id);
            if (existing && existing.status !== "failed") {
                console.log(
                    `[leaflink] Order ${order.number} already synced (${existing.status}), skipping`,
                );
                return NextResponse.json({ received: true, duplicate: true });
            }

            // 1. Create Settlr invoice
            const { invoiceId, paymentLink } = await createSettlrInvoice(
                order,
                config,
                merchantWallet,
                merchantName,
            );

            // 2. Create sync record
            const metrcMeta = extractMetrcTags(order);
            const sync = await createSync({
                merchant_id: config.merchant_id,
                leaflink_order_id: order.id,
                leaflink_order_number: order.number,
                seller_email: order.seller.email,
                buyer_email: order.buyer.email,
                buyer_company: order.buyer.company_name,
                amount: order.total,
                settlr_invoice_id: invoiceId,
                settlr_payment_link: paymentLink,
                status: "pending",
                metadata: {
                    source: "leaflink",
                    event,
                    ...metrcMeta,
                },
            });

            console.log(
                `[leaflink] Sync created: ${sync.id} — invoice ${invoiceId} for $${order.total}`,
            );

            // 3. Auto-send payment link if configured
            if (config.auto_send_link) {
                await sendPaymentLinkEmail(
                    order.buyer.email,
                    order.buyer.company_name,
                    order.seller.company_name,
                    order.number,
                    order.total,
                    paymentLink,
                );

                await updateSync(sync.id, { status: "link_sent" });
            }

            return NextResponse.json({
                received: true,
                sync_id: sync.id,
                invoice_id: invoiceId,
                payment_link: paymentLink,
            });
        }

        if (event === "order.cancelled") {
            const existing = await getSyncByOrderId(order.id);
            if (existing) {
                await updateSync(existing.id, { status: "cancelled" });
                console.log(
                    `[leaflink] Order ${order.number} cancelled, sync ${existing.id} updated`,
                );
            }
            return NextResponse.json({ received: true, cancelled: true });
        }

        // For other events (shipped, delivered), just acknowledge
        console.log(`[leaflink] Event ${event} acknowledged for order ${order.number}`);
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("[leaflink] Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
