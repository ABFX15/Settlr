/**
 * GET /api/reports/reconciliation — Invoice↔Payment reconciliation
 *
 * Returns every invoice matched (or unmatched) to its payment,
 * plus every payment matched (or unmatched) to its invoice.
 *
 * Query params:
 *   ?format=json (default) | csv
 *   ?from=ISO_DATE  &  ?to=ISO_DATE
 *   ?status=all | matched | unmatched | overdue
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
    getInvoicesByMerchant,
    getPaymentsByMerchantWallet,
    getOrderStats,
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
            return {
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

interface ReconciledRow {
    invoiceId: string | null;
    invoiceNumber: string | null;
    orderId: string | null;
    orderNumber: string | null;
    buyerName: string;
    buyerEmail: string;
    buyerCompany: string | null;
    invoiceAmount: number | null;
    paymentAmount: number | null;
    variance: number;
    invoiceStatus: string | null;
    paymentStatus: string | null;
    paymentSignature: string | null;
    invoiceDate: string | null;
    dueDate: string | null;
    paidDate: string | null;
    daysToPayment: number | null;
    matchStatus: "matched" | "unmatched_invoice" | "unmatched_payment" | "overdue";
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
        const statusFilter = searchParams.get("status") || "all";

        // Fetch all data in parallel
        const [invoices, payments, orders] = await Promise.all([
            getInvoicesByMerchant(auth.merchantId, { limit: 10000 }),
            getPaymentsByMerchantWallet(auth.merchantWallet),
            getPurchaseOrdersByMerchant(auth.merchantId, { limit: 10000 }),
        ]);

        const now = new Date();

        // Build order lookup by invoiceId
        const orderByInvoice = new Map<string, PurchaseOrder>();
        for (const order of orders) {
            if (order.invoiceId) {
                orderByInvoice.set(order.invoiceId, order);
            }
        }

        // Build payment lookup by signature
        const paymentBySig = new Map<string, Payment>();
        const matchedPaymentSigs = new Set<string>();
        for (const p of payments) {
            paymentBySig.set(p.txSignature, p);
        }

        const rows: ReconciledRow[] = [];

        // 1. Match invoices → payments
        for (const inv of invoices) {
            if (inv.status === "draft" || inv.status === "cancelled") continue;

            // Date filter
            if (fromDate && new Date(inv.createdAt) < new Date(fromDate)) continue;
            if (toDate && new Date(inv.createdAt) > new Date(toDate)) continue;

            const order = orderByInvoice.get(inv.id);
            const hasPayment = inv.status === "paid" && inv.paymentSignature;

            let matchStatus: ReconciledRow["matchStatus"];
            if (hasPayment) {
                matchStatus = "matched";
                if (inv.paymentSignature) matchedPaymentSigs.add(inv.paymentSignature);
            } else if (inv.dueDate < now) {
                matchStatus = "overdue";
            } else {
                matchStatus = "unmatched_invoice";
            }

            const payment = inv.paymentSignature ? paymentBySig.get(inv.paymentSignature) : null;
            const paymentAmount = payment?.amount ?? null;
            const variance = paymentAmount !== null ? paymentAmount - inv.total : 0;

            const daysToPayment = inv.paidAt
                ? Math.max(0, Math.floor((inv.paidAt.getTime() - inv.createdAt.getTime()) / 86400000))
                : null;

            rows.push({
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                orderId: order?.id ?? null,
                orderNumber: order?.orderNumber ?? null,
                buyerName: inv.buyerName,
                buyerEmail: inv.buyerEmail,
                buyerCompany: inv.buyerCompany ?? null,
                invoiceAmount: inv.total,
                paymentAmount,
                variance,
                invoiceStatus: inv.status,
                paymentStatus: payment?.status ?? null,
                paymentSignature: inv.paymentSignature ?? null,
                invoiceDate: inv.createdAt.toISOString().split("T")[0],
                dueDate: inv.dueDate.toISOString().split("T")[0],
                paidDate: inv.paidAt?.toISOString().split("T")[0] ?? null,
                daysToPayment,
                matchStatus,
            });
        }

        // 2. Unmatched payments (payment exists but no invoice linked)
        for (const p of payments) {
            if (matchedPaymentSigs.has(p.txSignature)) continue;
            if (fromDate && new Date(p.completedAt) < new Date(fromDate)) continue;
            if (toDate && new Date(p.completedAt) > new Date(toDate)) continue;

            rows.push({
                invoiceId: null,
                invoiceNumber: null,
                orderId: null,
                orderNumber: null,
                buyerName: p.customerWallet?.slice(0, 8) + "..." || "Unknown",
                buyerEmail: "",
                buyerCompany: null,
                invoiceAmount: null,
                paymentAmount: p.amount,
                variance: 0,
                invoiceStatus: null,
                paymentStatus: p.status,
                paymentSignature: p.txSignature,
                invoiceDate: null,
                dueDate: null,
                paidDate: new Date(p.completedAt).toISOString().split("T")[0],
                daysToPayment: null,
                matchStatus: "unmatched_payment",
            });
        }

        // Filter by status
        const filtered = statusFilter === "all"
            ? rows
            : rows.filter((r) => r.matchStatus === statusFilter);

        // Summary stats
        const matched = rows.filter((r) => r.matchStatus === "matched");
        const unmatchedInvoices = rows.filter((r) => r.matchStatus === "unmatched_invoice");
        const unmatchedPayments = rows.filter((r) => r.matchStatus === "unmatched_payment");
        const overdueRows = rows.filter((r) => r.matchStatus === "overdue");

        const summary = {
            totalRows: rows.length,
            matched: matched.length,
            matchedAmount: matched.reduce((s, r) => s + (r.invoiceAmount || 0), 0),
            unmatchedInvoices: unmatchedInvoices.length,
            unmatchedInvoiceAmount: unmatchedInvoices.reduce((s, r) => s + (r.invoiceAmount || 0), 0),
            unmatchedPayments: unmatchedPayments.length,
            unmatchedPaymentAmount: unmatchedPayments.reduce((s, r) => s + (r.paymentAmount || 0), 0),
            overdue: overdueRows.length,
            overdueAmount: overdueRows.reduce((s, r) => s + (r.invoiceAmount || 0), 0),
            avgDaysToPayment: matched.length > 0
                ? Math.round(matched.reduce((s, r) => s + (r.daysToPayment || 0), 0) / matched.length)
                : 0,
            matchRate: rows.length > 0
                ? Math.round((matched.length / rows.length) * 100)
                : 100,
        };

        // CSV export
        if (format === "csv") {
            const csvHeaders = [
                "Match Status",
                "Invoice #",
                "Order #",
                "Buyer",
                "Company",
                "Email",
                "Invoice Amount",
                "Payment Amount",
                "Variance",
                "Invoice Status",
                "Payment Status",
                "Tx Signature",
                "Invoice Date",
                "Due Date",
                "Paid Date",
                "Days to Payment",
            ];

            const csvRows = filtered.map((r) =>
                [
                    r.matchStatus,
                    r.invoiceNumber || "",
                    r.orderNumber || "",
                    `"${r.buyerName.replace(/"/g, '""')}"`,
                    `"${(r.buyerCompany || "").replace(/"/g, '""')}"`,
                    r.buyerEmail,
                    r.invoiceAmount?.toFixed(2) || "",
                    r.paymentAmount?.toFixed(2) || "",
                    r.variance.toFixed(2),
                    r.invoiceStatus || "",
                    r.paymentStatus || "",
                    r.paymentSignature || "",
                    r.invoiceDate || "",
                    r.dueDate || "",
                    r.paidDate || "",
                    r.daysToPayment?.toString() || "",
                ].join(",")
            );

            // Add summary
            csvRows.push("");
            csvRows.push(`RECONCILIATION SUMMARY`);
            csvRows.push(`Matched,${summary.matched},$${summary.matchedAmount.toFixed(2)}`);
            csvRows.push(`Unmatched Invoices,${summary.unmatchedInvoices},$${summary.unmatchedInvoiceAmount.toFixed(2)}`);
            csvRows.push(`Unmatched Payments,${summary.unmatchedPayments},$${summary.unmatchedPaymentAmount.toFixed(2)}`);
            csvRows.push(`Overdue,${summary.overdue},$${summary.overdueAmount.toFixed(2)}`);
            csvRows.push(`Match Rate,${summary.matchRate}%`);
            csvRows.push(`Avg Days to Payment,${summary.avgDaysToPayment}`);

            const csv = [csvHeaders.join(","), ...csvRows].join("\n");
            const dateStr = new Date().toISOString().split("T")[0];

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="settlr-reconciliation-${dateStr}.csv"`,
                },
            });
        }

        return NextResponse.json({ summary, rows: filtered });
    } catch (err) {
        console.error("[api/reports/reconciliation] error:", err);
        return NextResponse.json({ error: "Failed to generate reconciliation" }, { status: 500 });
    }
}
