/**
 * GET /api/reports/buyers — Payment history grouped by buyer
 *
 * Returns per-buyer stats: total invoiced, total paid, outstanding,
 * overdue, avg days to pay, last payment date, invoice list.
 *
 * Query params:
 *   ?format=json (default) | csv
 *   ?buyer=email (optional, single buyer detail)
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
    getInvoicesByMerchant,
} from "@/lib/db";

async function authenticate(request: NextRequest) {
    const walletAddress = request.headers.get("x-merchant-wallet");
    if (walletAddress && walletAddress.length >= 32) {
        try {
            const merchant = await getOrCreateMerchantByWallet(walletAddress);
            return { merchantId: merchant.id };
        } catch {
            return null;
        }
    }
    return null;
}

interface BuyerSummary {
    name: string;
    company: string | null;
    email: string;
    totalInvoiced: number;
    totalPaid: number;
    outstanding: number;
    overdueAmount: number;
    invoiceCount: number;
    paidCount: number;
    overdueCount: number;
    avgDaysToPay: number | null;
    firstInvoice: string;
    lastInvoice: string;
    lastPayment: string | null;
    invoices: {
        id: string;
        invoiceNumber: string;
        total: number;
        status: string;
        dueDate: string;
        paidAt: string | null;
        paymentSignature: string | null;
    }[];
}

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const format = searchParams.get("format") || "json";
        const buyerFilter = searchParams.get("buyer");

        const invoices = await getInvoicesByMerchant(auth.merchantId, { limit: 10000 });
        const now = new Date();

        // Group by buyer email
        const buyerMap = new Map<string, BuyerSummary>();

        for (const inv of invoices) {
            if (inv.status === "draft") continue;

            const key = inv.buyerEmail.toLowerCase();
            if (buyerFilter && key !== buyerFilter.toLowerCase()) continue;

            if (!buyerMap.has(key)) {
                buyerMap.set(key, {
                    name: inv.buyerName,
                    company: inv.buyerCompany ?? null,
                    email: inv.buyerEmail,
                    totalInvoiced: 0,
                    totalPaid: 0,
                    outstanding: 0,
                    overdueAmount: 0,
                    invoiceCount: 0,
                    paidCount: 0,
                    overdueCount: 0,
                    avgDaysToPay: null,
                    firstInvoice: inv.createdAt.toISOString(),
                    lastInvoice: inv.createdAt.toISOString(),
                    lastPayment: null,
                    invoices: [],
                });
            }

            const buyer = buyerMap.get(key)!;
            buyer.invoiceCount++;
            buyer.totalInvoiced += inv.total;

            if (inv.createdAt.toISOString() < buyer.firstInvoice) {
                buyer.firstInvoice = inv.createdAt.toISOString();
            }
            if (inv.createdAt.toISOString() > buyer.lastInvoice) {
                buyer.lastInvoice = inv.createdAt.toISOString();
            }

            if (inv.status === "paid" && inv.paidAt) {
                buyer.paidCount++;
                buyer.totalPaid += inv.total;
                const paidIso = inv.paidAt.toISOString();
                if (!buyer.lastPayment || paidIso > buyer.lastPayment) {
                    buyer.lastPayment = paidIso;
                }
            } else if (inv.status !== "cancelled") {
                buyer.outstanding += inv.total;
                if (inv.dueDate < now) {
                    buyer.overdueCount++;
                    buyer.overdueAmount += inv.total;
                }
            }

            buyer.invoices.push({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                total: inv.total,
                status: inv.status,
                dueDate: inv.dueDate.toISOString().split("T")[0],
                paidAt: inv.paidAt?.toISOString().split("T")[0] ?? null,
                paymentSignature: inv.paymentSignature ?? null,
            });
        }

        // Calculate avg days to pay
        for (const buyer of buyerMap.values()) {
            const paidInvoices = buyer.invoices.filter((i) => i.paidAt);
            if (paidInvoices.length > 0) {
                // We need the original data for days calc, so re-derive
                const relevantInvs = invoices.filter(
                    (inv) => inv.buyerEmail.toLowerCase() === buyer.email.toLowerCase() && inv.paidAt
                );
                const totalDays = relevantInvs.reduce((sum, inv) => {
                    return sum + Math.max(0, Math.floor((inv.paidAt!.getTime() - inv.createdAt.getTime()) / 86400000));
                }, 0);
                buyer.avgDaysToPay = Math.round(totalDays / relevantInvs.length);
            }
        }

        const buyers = Array.from(buyerMap.values())
            .sort((a, b) => b.totalInvoiced - a.totalInvoiced);

        if (format === "csv") {
            const headers = [
                "Buyer Name", "Company", "Email", "Total Invoiced", "Total Paid",
                "Outstanding", "Overdue", "Invoice Count", "Paid Count",
                "Overdue Count", "Avg Days to Pay", "First Invoice", "Last Invoice", "Last Payment",
            ];

            const csvRows = buyers.map((b) =>
                [
                    `"${b.name.replace(/"/g, '""')}"`,
                    `"${(b.company || "").replace(/"/g, '""')}"`,
                    b.email,
                    b.totalInvoiced.toFixed(2),
                    b.totalPaid.toFixed(2),
                    b.outstanding.toFixed(2),
                    b.overdueAmount.toFixed(2),
                    b.invoiceCount,
                    b.paidCount,
                    b.overdueCount,
                    b.avgDaysToPay?.toString() || "",
                    b.firstInvoice.split("T")[0],
                    b.lastInvoice.split("T")[0],
                    b.lastPayment?.split("T")[0] || "",
                ].join(",")
            );

            const csv = [headers.join(","), ...csvRows].join("\n");
            const dateStr = new Date().toISOString().split("T")[0];

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="settlr-buyer-history-${dateStr}.csv"`,
                },
            });
        }

        return NextResponse.json({
            totalBuyers: buyers.length,
            buyers: buyerFilter ? buyers : buyers.map(({ invoices, ...rest }) => rest),
            // Include invoices only for single-buyer detail
            ...(buyerFilter && buyers[0] ? { invoices: buyers[0].invoices } : {}),
        });
    } catch (err) {
        console.error("[api/reports/buyers] error:", err);
        return NextResponse.json({ error: "Failed to generate buyer report" }, { status: 500 });
    }
}
