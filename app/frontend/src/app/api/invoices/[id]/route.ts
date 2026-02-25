/**
 * GET    /api/invoices/[id] — Get invoice details
 * PATCH  /api/invoices/[id] — Update invoice status (send, cancel, mark paid)
 */

import { NextRequest, NextResponse } from "next/server";
import { getInvoice, updateInvoiceStatus, validateApiKey, getOrCreateMerchantByWallet } from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/email";

async function authenticate(request: NextRequest) {
    // API key auth
    const apiKey =
        request.headers.get("x-api-key") ||
        request.headers.get("authorization")?.replace("Bearer ", "");
    if (apiKey) {
        const v = await validateApiKey(apiKey);
        if (v.valid && v.merchantId && v.merchantWallet) return v;
    }
    // Wallet-based auth from dashboard
    const walletAddress = request.headers.get("x-merchant-wallet");
    if (walletAddress && walletAddress.length >= 32) {
        try {
            const merchant = await getOrCreateMerchantByWallet(walletAddress);
            return {
                valid: true,
                merchantId: merchant.id,
                merchantWallet: merchant.walletAddress,
                merchantName: merchant.name,
                tier: "free" as const,
                rateLimit: 60,
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
        // Allow unauthenticated access by view token (for buyer view)
        const { id } = await params;
        const invoice = await getInvoice(id);
        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // If not authenticated, only return limited info
        const auth = await authenticate(request);
        const isMerchant = auth?.merchantId === invoice.merchantId;

        return NextResponse.json({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            merchantName: invoice.merchantName,
            merchantWallet: invoice.merchantWallet,
            buyerName: invoice.buyerName,
            buyerEmail: isMerchant ? invoice.buyerEmail : undefined,
            buyerCompany: invoice.buyerCompany,
            lineItems: invoice.lineItems,
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            taxAmount: invoice.taxAmount,
            total: invoice.total,
            currency: invoice.currency,
            memo: invoice.memo,
            terms: invoice.terms,
            dueDate: invoice.dueDate.toISOString(),
            status: invoice.status,
            paymentSignature: invoice.paymentSignature,
            paidAt: invoice.paidAt?.toISOString(),
            viewCount: isMerchant ? invoice.viewCount : undefined,
            createdAt: invoice.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("[invoices] Error getting invoice:", error);
        return NextResponse.json(
            { error: "Failed to get invoice" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const invoice = await getInvoice(id);
        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }
        if (invoice.merchantId !== auth.merchantId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { action, paymentSignature, payerWallet } = body;

        if (action === "send") {
            const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev"}/invoice/${invoice.viewToken}`;
            const updated = await updateInvoiceStatus(id, "sent", {
                sentAt: new Date(),
            });

            sendInvoiceEmail({
                to: invoice.buyerEmail,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total,
                currency: invoice.currency,
                buyerName: invoice.buyerName,
                merchantName: invoice.merchantName,
                dueDate: invoice.dueDate,
                invoiceUrl,
                memo: invoice.memo,
            }).catch((err) =>
                console.error("[invoices] Failed to send email:", err)
            );

            return NextResponse.json({ status: updated?.status || "sent" });
        }

        if (action === "cancel") {
            const updated = await updateInvoiceStatus(id, "cancelled");
            return NextResponse.json({ status: updated?.status || "cancelled" });
        }

        if (action === "mark_paid") {
            const updated = await updateInvoiceStatus(id, "paid", {
                paymentSignature,
                payerWallet,
                paidAt: new Date(),
            });
            return NextResponse.json({ status: updated?.status || "paid" });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        console.error("[invoices] Error updating invoice:", error);
        return NextResponse.json(
            { error: "Failed to update invoice" },
            { status: 500 }
        );
    }
}
