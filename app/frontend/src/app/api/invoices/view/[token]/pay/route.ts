/**
 * POST /api/invoices/view/[token]/pay — Record a buyer payment
 *
 * Called by the buyer-facing invoice page after a successful on-chain
 * USDC transfer. Marks the invoice as "paid" and records the tx
 * signature + payer wallet.
 *
 * No API-key auth required — the view token itself is the secret.
 * In production you'd verify the on-chain tx against expected amount.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getInvoiceByViewToken,
    updateInvoiceStatus,
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

        const updated = await updateInvoiceStatus(invoice.id, "paid", {
            paymentSignature,
            payerWallet: payerWallet || undefined,
            paidAt: new Date(),
        });

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
