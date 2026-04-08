/**
 * GET /api/reports/audit-log — Full audit trail export
 *
 * Returns chronological event log: invoices created/sent/paid,
 * payments received, orders created/converted, all with timestamps.
 *
 * Query params:
 *   ?format=json (default) | csv
 *   ?from=ISO_DATE  &  ?to=ISO_DATE
 *   ?type=all | invoice | payment | order
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
    getInvoicesByMerchant,
    getPaymentsByMerchantWallet,
    getPurchaseOrdersByMerchant,
    type Invoice,
    type Payment,
    type PurchaseOrder,
} from "@/lib/db";

async function authenticate(request: NextRequest) {
    const walletAddress = request.headers.get("x-merchant-wallet");
    if (walletAddress && walletAddress.length >= 32) {
        try {
            const merchant = await getOrCreateMerchantByWallet(walletAddress);
            return { merchantId: merchant.id, merchantWallet: merchant.walletAddress, merchantName: merchant.name };
        } catch {
            return null;
        }
    }
    return null;
}

interface AuditEvent {
    timestamp: string;
    type: "invoice" | "payment" | "order";
    action: string;
    reference: string;
    counterparty: string;
    amount: number | null;
    currency: string;
    txSignature: string | null;
    details: string;
}

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "json";
        const fromDate = searchParams.get("from");
        const toDate = searchParams.get("to");
        const typeFilter = searchParams.get("type") || "all";

        const [invoices, payments, orders] = await Promise.all([
            getInvoicesByMerchant(auth.merchantId, { limit: 10000 }),
            getPaymentsByMerchantWallet(auth.merchantWallet),
            getPurchaseOrdersByMerchant(auth.merchantId, { limit: 10000 }),
        ]);

        const events: AuditEvent[] = [];

        // Invoice events
        for (const inv of invoices) {
            // Created
            events.push({
                timestamp: inv.createdAt.toISOString(),
                type: "invoice",
                action: "created",
                reference: inv.invoiceNumber,
                counterparty: inv.buyerName,
                amount: inv.total,
                currency: inv.currency,
                txSignature: null,
                details: `Invoice created for ${inv.buyerCompany || inv.buyerName}`,
            });

            // Sent
            if (inv.sentAt) {
                events.push({
                    timestamp: inv.sentAt.toISOString(),
                    type: "invoice",
                    action: "sent",
                    reference: inv.invoiceNumber,
                    counterparty: inv.buyerName,
                    amount: inv.total,
                    currency: inv.currency,
                    txSignature: null,
                    details: `Email sent to ${inv.buyerEmail}`,
                });
            }

            // Paid
            if (inv.paidAt && inv.paymentSignature) {
                events.push({
                    timestamp: inv.paidAt.toISOString(),
                    type: "invoice",
                    action: "paid",
                    reference: inv.invoiceNumber,
                    counterparty: inv.buyerName,
                    amount: inv.total,
                    currency: inv.currency,
                    txSignature: inv.paymentSignature,
                    details: `Payment received from ${inv.payerWallet?.slice(0, 8)}...`,
                });
            }

            // Cancelled
            if (inv.status === "cancelled") {
                events.push({
                    timestamp: inv.updatedAt.toISOString(),
                    type: "invoice",
                    action: "cancelled",
                    reference: inv.invoiceNumber,
                    counterparty: inv.buyerName,
                    amount: inv.total,
                    currency: inv.currency,
                    txSignature: null,
                    details: "Invoice cancelled",
                });
            }
        }

        // Payment events (non-invoice payments)
        for (const p of payments) {
            events.push({
                timestamp: new Date(p.completedAt).toISOString(),
                type: "payment",
                action: p.status === "refunded" ? "refunded" : "received",
                reference: p.id.slice(0, 12),
                counterparty: p.customerWallet?.slice(0, 8) + "..." || "Unknown",
                amount: p.amount,
                currency: p.currency,
                txSignature: p.txSignature,
                details: p.description || "Direct payment",
            });
        }

        // Order events
        for (const order of orders) {
            events.push({
                timestamp: order.createdAt.toISOString(),
                type: "order",
                action: "created",
                reference: order.orderNumber,
                counterparty: order.buyerName,
                amount: order.total,
                currency: order.currency,
                txSignature: null,
                details: `Purchase order (${order.status})`,
            });

            if (order.invoiceId) {
                events.push({
                    timestamp: order.updatedAt.toISOString(),
                    type: "order",
                    action: "converted",
                    reference: order.orderNumber,
                    counterparty: order.buyerName,
                    amount: order.total,
                    currency: order.currency,
                    txSignature: null,
                    details: "Converted to invoice",
                });
            }
        }

        // Sort by timestamp descending
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Date filter
        let filtered = events;
        if (fromDate) {
            const from = new Date(fromDate).getTime();
            filtered = filtered.filter((e) => new Date(e.timestamp).getTime() >= from);
        }
        if (toDate) {
            const to = new Date(toDate).getTime();
            filtered = filtered.filter((e) => new Date(e.timestamp).getTime() <= to);
        }
        if (typeFilter !== "all") {
            filtered = filtered.filter((e) => e.type === typeFilter);
        }

        if (format === "csv") {
            const headers = ["Timestamp", "Type", "Action", "Reference", "Counterparty", "Amount", "Currency", "Tx Signature", "Details"];
            const csvRows = filtered.map((e) =>
                [
                    e.timestamp,
                    e.type,
                    e.action,
                    e.reference,
                    `"${e.counterparty.replace(/"/g, '""')}"`,
                    e.amount?.toFixed(2) || "",
                    e.currency,
                    e.txSignature || "",
                    `"${e.details.replace(/"/g, '""')}"`,
                ].join(",")
            );

            const csv = [headers.join(","), ...csvRows].join("\n");
            const dateStr = new Date().toISOString().split("T")[0];

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="settlr-audit-log-${dateStr}.csv"`,
                },
            });
        }

        return NextResponse.json({
            totalEvents: filtered.length,
            events: filtered,
        });
    } catch (err) {
        console.error("[api/reports/audit-log] error:", err);
        return NextResponse.json({ error: "Failed to generate audit log" }, { status: 500 });
    }
}
