/**
 * POST /api/invoices/view/[token]/pay — Record a buyer payment
 *
 * Called by the buyer-facing invoice page after a successful on-chain
 * USDC transfer. Marks the invoice as "paid", records the tx signature,
 * credits the merchant's treasury balance, and creates a payment record
 * so it appears in the transactions page and CSV export.
 *
 * No API-key auth required — the view token itself is the secret.
 * In production you'd verify the on-chain tx against expected amount.
 */

import { NextRequest, NextResponse } from "next/server";
import { explorerUrl } from "@/lib/constants";
import {
    getInvoiceByViewToken,
    updateInvoiceStatus,
    creditMerchantBalance,
    getOrCreateMerchantByWallet,
    createPayment,
} from "@/lib/db";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const invoice = await getInvoiceByViewToken(token);

        if (!invoice) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        if (invoice.status === "paid") {
            return NextResponse.json(
                { error: "Invoice already paid" },
                { status: 400 }
            );
        }

        if (invoice.status === "cancelled") {
            return NextResponse.json(
                { error: "Invoice has been cancelled" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { paymentSignature, payerWallet } = body;

        if (!paymentSignature || typeof paymentSignature !== "string") {
            return NextResponse.json(
                { error: "paymentSignature is required" },
                { status: 400 }
            );
        }

        // 1. Mark invoice as paid
        const updated = await updateInvoiceStatus(invoice.id, "paid", {
            paymentSignature,
            payerWallet: payerWallet || undefined,
            paidAt: new Date(),
        });

        // 2. Credit the merchant's treasury balance
        try {
            const merchant = await getOrCreateMerchantByWallet(invoice.merchantWallet);
            await creditMerchantBalance(merchant.id, invoice.total, {
                txSignature: paymentSignature,
                description: `Invoice ${invoice.invoiceNumber} paid by ${invoice.buyerName}`,
            });

            // 3. Create a payment record (shows in transactions page + CSV export)
            const now = Date.now();
            await createPayment({
                sessionId: `inv_${invoice.id}`,
                merchantId: merchant.id,
                merchantName: invoice.merchantName || merchant.name,
                merchantWallet: invoice.merchantWallet,
                customerWallet: payerWallet || "unknown",
                amount: invoice.total,
                currency: invoice.currency || "USDC",
                description: `Invoice #${invoice.invoiceNumber} — ${invoice.buyerName}`,
                txSignature: paymentSignature,
                explorerUrl: explorerUrl(paymentSignature),
                createdAt: now,
                completedAt: now,
                status: "completed",
            });
        } catch (err) {
            // Don't fail the overall request if treasury/payment recording fails
            // The invoice is already marked paid and the on-chain tx is confirmed
            console.error("[invoices/pay] Error crediting treasury or recording payment:", err);
        }

        return NextResponse.json({
            status: updated?.status || "paid",
            paymentSignature,
        });
    } catch (error) {
        console.error("[invoices/pay] Error recording payment:", error);
        return NextResponse.json(
            { error: "Failed to record payment" },
            { status: 500 }
        );
    }
}
