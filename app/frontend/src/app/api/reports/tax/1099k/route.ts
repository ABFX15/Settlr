/**
 * GET /api/reports/tax/1099k — 1099-K-style merchant summary
 *
 * Aggregates a merchant's settlements per calendar year, broken down by
 * counterparty (customer wallet) AND per-month gross totals (boxes 5a–5l
 * on the IRS 1099-K). Offbank is non-custodial and is NOT a Payment
 * Settlement Entity for IRS purposes — we do NOT issue 1099-Ks. This
 * report is provided so the merchant (or their CPA) can use the figures
 * in their own tax filings.
 *
 * Query params:
 *   ?year=YYYY (defaults to last calendar year)
 *   ?format=json | csv (defaults to json)
 */

import { NextRequest, NextResponse } from "next/server";
import { getPaymentsByMerchantWallet } from "@/lib/db";
import { requireMerchantSession } from "@/lib/merchant-auth";

const PLATFORM_FEE_BPS = 100; // 1%

function csvEscape(v: string): string {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
        return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
}

interface CounterpartyRow {
    customerWallet: string;
    transactionCount: number;
    grossAmount: number;
    platformFees: number;
    netAmount: number;
    refundedAmount: number;
}

export async function GET(request: NextRequest) {
    try {
        const auth = await requireMerchantSession(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get("year");
        const year = yearParam
            ? parseInt(yearParam, 10)
            : new Date().getUTCFullYear() - 1;
        if (!Number.isFinite(year) || year < 2020 || year > 2100) {
            return NextResponse.json({ error: "Invalid year" }, { status: 400 });
        }
        const format = (searchParams.get("format") || "json").toLowerCase();

        const yearStart = Date.UTC(year, 0, 1);
        const yearEnd = Date.UTC(year + 1, 0, 1);

        const all = await getPaymentsByMerchantWallet(auth.merchantWallet);
        const inYear = all.filter((p) => {
            const ts = p.completedAt || p.createdAt;
            return ts >= yearStart && ts < yearEnd;
        });

        // Per-counterparty aggregation
        const byCounterparty = new Map<string, CounterpartyRow>();
        // Per-month totals (1099-K boxes 5a–5l)
        const monthly: number[] = new Array(12).fill(0);

        let totalGross = 0;
        let totalFees = 0;
        let totalNet = 0;
        let totalRefunded = 0;
        let totalCount = 0;

        for (const p of inYear) {
            const ts = p.completedAt || p.createdAt;
            const gross = p.amount;
            const fee = +(gross * (PLATFORM_FEE_BPS / 10000)).toFixed(6);
            const net = +(gross - fee).toFixed(6);
            const refunded = p.refundedAmount || 0;

            const m = new Date(ts).getUTCMonth();
            monthly[m] += gross;

            totalGross += gross;
            totalFees += fee;
            totalNet += net;
            totalRefunded += refunded;
            totalCount += 1;

            const wallet = p.customerWallet || "unknown";
            const existing = byCounterparty.get(wallet) || {
                customerWallet: wallet,
                transactionCount: 0,
                grossAmount: 0,
                platformFees: 0,
                netAmount: 0,
                refundedAmount: 0,
            };
            existing.transactionCount += 1;
            existing.grossAmount += gross;
            existing.platformFees += fee;
            existing.netAmount += net;
            existing.refundedAmount += refunded;
            byCounterparty.set(wallet, existing);
        }

        const counterparties = Array.from(byCounterparty.values())
            .map((r) => ({
                ...r,
                grossAmount: +r.grossAmount.toFixed(2),
                platformFees: +r.platformFees.toFixed(2),
                netAmount: +r.netAmount.toFixed(2),
                refundedAmount: +r.refundedAmount.toFixed(2),
            }))
            .sort((a, b) => b.grossAmount - a.grossAmount);

        const summary = {
            merchantWallet: auth.merchantWallet,
            year,
            transactionCount: totalCount,
            grossAmount: +totalGross.toFixed(2),
            platformFees: +totalFees.toFixed(2),
            netAmount: +totalNet.toFixed(2),
            refundedAmount: +totalRefunded.toFixed(2),
            uniqueCounterparties: counterparties.length,
            monthlyGross: monthly.map((v) => +v.toFixed(2)),
            // IRS de-minimis thresholds for context:
            // 2024+: $5,000 / no minimum tx count (gradually phasing to $600)
            crossesIrsThreshold2025: totalGross >= 2500,
            crossesIrsThreshold2026: totalGross >= 600,
            disclaimer:
                "Offbank is a non-custodial settlement protocol and is NOT a Payment Settlement Entity (PSE) under IRC §6050W. This report is for the merchant's own records and tax preparation. Offbank does not file 1099-K forms with the IRS on the merchant's behalf.",
        };

        if (format === "json") {
            return NextResponse.json({ summary, counterparties });
        }

        // CSV
        const headers = [
            "Customer Wallet",
            "Transaction Count",
            "Gross",
            "Platform Fees",
            "Net",
            "Refunded",
        ];
        const csvRows = counterparties.map((r) =>
            [
                csvEscape(r.customerWallet),
                r.transactionCount.toString(),
                r.grossAmount.toFixed(2),
                r.platformFees.toFixed(2),
                r.netAmount.toFixed(2),
                r.refundedAmount.toFixed(2),
            ].join(","),
        );

        csvRows.push("");
        csvRows.push("MONTHLY GROSS (1099-K Boxes 5a-5l)");
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        monthly.forEach((v, i) => {
            csvRows.push(`${monthNames[i]} ${year},${v.toFixed(2)}`);
        });

        csvRows.push("");
        csvRows.push("YEAR SUMMARY");
        csvRows.push(`Total Transactions,${summary.transactionCount}`);
        csvRows.push(`Gross,${summary.grossAmount.toFixed(2)}`);
        csvRows.push(`Platform Fees,${summary.platformFees.toFixed(2)}`);
        csvRows.push(`Net,${summary.netAmount.toFixed(2)}`);
        csvRows.push(`Refunded,${summary.refundedAmount.toFixed(2)}`);
        csvRows.push(`Unique Counterparties,${summary.uniqueCounterparties}`);
        csvRows.push("");
        csvRows.push(`# ${summary.disclaimer}`);

        const csv = [headers.join(","), ...csvRows].join("\n");
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="offbank-1099k-summary-${year}.csv"`,
            },
        });
    } catch (err) {
        console.error("[reports/tax/1099k] error", err);
        return NextResponse.json(
            { error: "Failed to build 1099-K summary" },
            { status: 500 },
        );
    }
}
