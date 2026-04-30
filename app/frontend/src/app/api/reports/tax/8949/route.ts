/**
 * GET /api/reports/tax/8949 — Form 8949 (cost-basis) export for USDC
 * dispositions.
 *
 * Every USDC settlement received is technically a disposition of property
 * under IRS Notice 2014-21. For USDC (a USD-pegged stablecoin) the
 * proceeds and cost basis are both ~$1.00 per token, so the realised
 * gain/loss is generally $0.00 — but the IRS still expects the
 * transactions to be reported on Form 8949 / Schedule D.
 *
 * For non-USDC settlements (rare on Offbank today, but supported), we
 * mark the cost basis as "unknown" and leave it to the merchant's CPA.
 *
 * Query params:
 *   ?year=YYYY (defaults to last calendar year)
 *   ?format=json | csv (defaults to csv)
 */

import { NextRequest, NextResponse } from "next/server";
import { getPaymentsByMerchantWallet, type Payment } from "@/lib/db";
import { requireMerchantSession } from "@/lib/merchant-auth";

function csvEscape(v: string): string {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
        return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
}

interface Form8949Row {
    /** (a) Description of property */
    description: string;
    /** (b) Date acquired */
    dateAcquired: string;
    /** (c) Date sold or disposed */
    dateDisposed: string;
    /** (d) Proceeds (USD) */
    proceeds: number;
    /** (e) Cost basis (USD) */
    costBasis: number;
    /** (f) Code(s), if any */
    code: string;
    /** (g) Adjustments */
    adjustment: number;
    /** (h) Gain or loss */
    gainLoss: number;
    /** Reference (Offbank payment + tx) */
    reference: string;
}

function rowFromPayment(p: Payment): Form8949Row {
    const ts = p.completedAt || p.createdAt;
    const date = new Date(ts).toISOString().slice(0, 10);
    const isUsdc = (p.currency || "USDC").toUpperCase() === "USDC";

    // For a USD-pegged stablecoin received and held, IRS treats it as
    // property whose acquisition basis = fair-market-value at receipt.
    // Same-day acquisition + disposition (settlement → operator wallet)
    // results in zero realised gain/loss. We model proceeds = gross
    // amount, basis = same. CPAs adjust if needed.
    const proceeds = isUsdc ? p.amount : p.amount;
    const costBasis = isUsdc ? p.amount : 0;
    const gainLoss = +(proceeds - costBasis).toFixed(2);

    return {
        description: `${p.amount.toFixed(2)} ${p.currency || "USDC"}`,
        dateAcquired: date,
        dateDisposed: date,
        proceeds: +proceeds.toFixed(2),
        costBasis: +costBasis.toFixed(2),
        code: isUsdc ? "" : "B", // Code B = basis not reported to IRS
        adjustment: 0,
        gainLoss,
        reference: `${p.id} | ${p.txSignature}`,
    };
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
        const format = (searchParams.get("format") || "csv").toLowerCase();

        const yearStart = Date.UTC(year, 0, 1);
        const yearEnd = Date.UTC(year + 1, 0, 1);

        const all = await getPaymentsByMerchantWallet(auth.merchantWallet);
        const inYear = all.filter((p) => {
            const ts = p.completedAt || p.createdAt;
            return ts >= yearStart && ts < yearEnd && p.status === "completed";
        });

        const rows = inYear.map(rowFromPayment);

        const totals = rows.reduce(
            (acc, r) => {
                acc.proceeds += r.proceeds;
                acc.costBasis += r.costBasis;
                acc.gainLoss += r.gainLoss;
                acc.count += 1;
                return acc;
            },
            { proceeds: 0, costBasis: 0, gainLoss: 0, count: 0 },
        );

        const summary = {
            merchantWallet: auth.merchantWallet,
            year,
            transactionCount: totals.count,
            totalProceeds: +totals.proceeds.toFixed(2),
            totalCostBasis: +totals.costBasis.toFixed(2),
            totalGainLoss: +totals.gainLoss.toFixed(2),
            disclaimer:
                "Form 8949 dispositions for USDC stablecoin settlements. USDC is a USD-pegged stablecoin; FMV at receipt ≈ FMV at disposal, so realised gain/loss is typically $0. Consult a tax professional. Offbank does not provide tax advice.",
        };

        if (format === "json") {
            return NextResponse.json({ summary, rows });
        }

        const headers = [
            "(a) Description",
            "(b) Date Acquired",
            "(c) Date Disposed",
            "(d) Proceeds",
            "(e) Cost Basis",
            "(f) Code",
            "(g) Adjustment",
            "(h) Gain/Loss",
            "Offbank Reference",
        ];
        const csvRows = rows.map((r) =>
            [
                csvEscape(r.description),
                r.dateAcquired,
                r.dateDisposed,
                r.proceeds.toFixed(2),
                r.costBasis.toFixed(2),
                r.code,
                r.adjustment.toFixed(2),
                r.gainLoss.toFixed(2),
                csvEscape(r.reference),
            ].join(","),
        );
        csvRows.push("");
        csvRows.push("FORM 8949 TOTALS");
        csvRows.push(`Dispositions,${summary.transactionCount}`);
        csvRows.push(`Total Proceeds,${summary.totalProceeds.toFixed(2)}`);
        csvRows.push(`Total Cost Basis,${summary.totalCostBasis.toFixed(2)}`);
        csvRows.push(`Total Gain/Loss,${summary.totalGainLoss.toFixed(2)}`);
        csvRows.push("");
        csvRows.push(`# ${summary.disclaimer}`);

        const csv = [headers.join(","), ...csvRows].join("\n");
        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="offbank-form-8949-${year}.csv"`,
            },
        });
    } catch (err) {
        console.error("[reports/tax/8949] error", err);
        return NextResponse.json(
            { error: "Failed to build Form 8949 export" },
            { status: 500 },
        );
    }
}
