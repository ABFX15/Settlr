/**
 * GET /api/invoices/view/[token] — Public: fetch invoice by view token
 *
 * Updates status from "sent" → "viewed" on first access and increments
 * viewCount each time. No authentication required — this is the link
 * emailed to the buyer.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getInvoiceByViewToken,
    updateInvoiceStatus,
} from "@/lib/db";

export async function GET(
    _request: NextRequest,
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

        // If first view after being sent, mark as viewed
        if (invoice.status === "sent") {
            await updateInvoiceStatus(invoice.id, "viewed");
        }

        return NextResponse.json({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            merchantName: invoice.merchantName,
            merchantWallet: invoice.merchantWallet,
            buyerName: invoice.buyerName,
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
            status: invoice.status === "sent" ? "viewed" : invoice.status,
            paymentSignature: invoice.paymentSignature,
            paidAt: invoice.paidAt?.toISOString(),
            createdAt: invoice.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("[invoices/view] Error fetching invoice:", error);
        return NextResponse.json(
            { error: "Failed to load invoice" },
            { status: 500 }
        );
    }
}
