/**
 * GET  /api/orders/[id] — Get a single purchase order
 * PATCH /api/orders/[id] — Update order status / link invoice
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getPurchaseOrder,
    updatePurchaseOrder,
    getInvoice,
    getOrCreateMerchantByWallet,
    createInvoice,
    updateInvoiceStatus,
    type InvoiceLineItem,
} from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/email";

async function authenticate(request: NextRequest) {
    const walletAddress = request.headers.get("x-merchant-wallet");
    if (walletAddress && walletAddress.length >= 32) {
        try {
            const merchant = await getOrCreateMerchantByWallet(walletAddress);
            return {
                valid: true,
                merchantId: merchant.id,
                merchantWallet: merchant.walletAddress,
                merchantName: merchant.name,
            };
        } catch {
            return null;
        }
    }
    return null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const order = await getPurchaseOrder(id);
        if (!order || order.merchantId !== auth.merchantId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // If invoiced/paid, fetch linked invoice
        let invoice = null;
        if (order.invoiceId) {
            invoice = await getInvoice(order.invoiceId);
        }

        return NextResponse.json({
            ...order,
            expectedDate: order.expectedDate?.toISOString(),
            paidAt: order.paidAt?.toISOString(),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            invoice: invoice
                ? {
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    status: invoice.status,
                    total: invoice.total,
                    viewToken: invoice.viewToken,
                    paymentSignature: invoice.paymentSignature,
                    paidAt: invoice.paidAt?.toISOString(),
                }
                : null,
        });
    } catch (err) {
        console.error("[api/orders/[id]] GET error:", err);
        return NextResponse.json(
            { error: "Failed to fetch order" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const order = await getPurchaseOrder(id);
        if (!order || order.merchantId !== auth.merchantId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const body = await request.json();
        const { action } = body;

        // Action: convert PO → Invoice and send
        if (action === "convert_to_invoice") {
            if (order.invoiceId) {
                return NextResponse.json(
                    { error: "Order already has an invoice" },
                    { status: 400 }
                );
            }

            const dueDate = order.expectedDate || new Date(Date.now() + 30 * 86400000);

            const invoiceLineItems: InvoiceLineItem[] = order.lineItems.map((li) => ({
                description: li.description,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                amount: li.quantity * li.unitPrice,
            }));

            const invoice = await createInvoice({
                merchantId: auth.merchantId,
                merchantName: auth.merchantName,
                merchantWallet: auth.merchantWallet,
                buyerName: order.buyerName,
                buyerEmail: order.buyerEmail,
                buyerCompany: order.buyerCompany,
                lineItems: invoiceLineItems,
                taxRate: order.taxRate,
                memo: order.notes
                    ? `Re: ${order.orderNumber} — ${order.notes}`
                    : `Re: ${order.orderNumber}`,
                terms: order.terms || "Due on Receipt",
                dueDate,
            });

            // Send email
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";
            try {
                await sendInvoiceEmail({
                    to: order.buyerEmail,
                    invoiceNumber: invoice.invoiceNumber,
                    buyerName: order.buyerName,
                    merchantName: auth.merchantName,
                    amount: invoice.total,
                    currency: invoice.currency,
                    dueDate,
                    invoiceUrl: `${appUrl}/invoice/${invoice.viewToken}`,
                });
                await updateInvoiceStatus(invoice.id, "sent", {
                    sentAt: new Date(),
                });
            } catch (emailErr) {
                console.error("[orders] Email send failed:", emailErr);
            }

            // Link invoice to order
            await updatePurchaseOrder(id, {
                status: "invoiced",
                invoiceId: invoice.id,
            });

            return NextResponse.json({
                success: true,
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                viewToken: invoice.viewToken,
            });
        }

        // Action: update status
        if (action === "update_status" && body.status) {
            const validTransitions: Record<string, string[]> = {
                draft: ["submitted", "cancelled"],
                submitted: ["accepted", "cancelled"],
                accepted: ["invoiced", "cancelled"],
            };
            const allowed = validTransitions[order.status] || [];
            if (!allowed.includes(body.status)) {
                return NextResponse.json(
                    { error: `Cannot transition from ${order.status} to ${body.status}` },
                    { status: 400 }
                );
            }
            const updated = await updatePurchaseOrder(id, { status: body.status });
            return NextResponse.json({ success: true, status: updated?.status });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        console.error("[api/orders/[id]] PATCH error:", err);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
