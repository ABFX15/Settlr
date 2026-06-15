/**
 * GET /api/reports/tax/transactions — Year-end transaction CSV export
 *
 * Returns every completed payment (settlement) for the merchant in the
 * given year, with gross / fee / net / counterparty / tx signature.
 * The 1% platform fee is computed in-line from the gross.
 *
 * Query params:
 *   ?year=YYYY (defaults to last calendar year)
 *   ?format=json | csv (defaults to csv)
 */

import { logger } from "@/lib/logger";
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
            return ts >= yearStart && ts < yearEnd;
        });

        const rows = inYear.map((p) => {
            const gross = p.amount;
            const fee = +(gross * (PLATFORM_FEE_BPS / 10000)).toFixed(6);
            const net = +(gross - fee).toFixed(6);
            const refunded = p.refundedAmount || 0;
            return {
                date: new Date(p.completedAt || p.createdAt).toISOString(),
                paymentId: p.id,
                txSignature: p.txSignature,
                explorerUrl: p.explorerUrl,
                customerWallet: p.customerWallet,
                description: p.description || "",
                currency: p.currency || "USDC",
                gross,
                platformFee: fee,
                net,
                refundedAmount: refunded,
                refundSignature: p.refundSignature || "",
                status: p.status,
            };
        });

        const totals = rows.reduce(
            (acc, r) => {
                acc.gross += r.gross;
                acc.fee += r.platformFee;
                acc.net += r.net;
                acc.refunded += r.refundedAmount;
                acc.count += 1;
                return acc;
            },
            { gross: 0, fee: 0, net: 0, refunded: 0, count: 0 },
        );

        if (format === "json") {
            return NextResponse.json({
                merchantWallet: auth.merchantWallet,
                year,
                totals,
                rows,
            });
        }

        const headers = [
            "Date (UTC)",
            "Payment ID",
            "Tx Signature",
            "Explorer URL",
            "Customer Wallet",
            "Description",
            "Currency",
            "Gross",
            "Platform Fee (1%)",
            "Net to Merchant",
            "Refunded",
            "Refund Tx",
            "Status",
        ];
        const csvRows = rows.map((r) =>
            [
                r.date,
                r.paymentId,
                r.txSignature,
                r.explorerUrl,
                r.customerWallet,
                csvEscape(r.description),
                r.currency,
                r.gross.toFixed(2),
                r.platformFee.toFixed(2),
                r.net.toFixed(2),
                r.refundedAmount.toFixed(2),
                r.refundSignature,
                r.status,
            ].join(","),
        );
        csvRows.push("");
        csvRows.push("YEAR-END TOTALS");
        csvRows.push(`Settlements,${totals.count}`);
        csvRows.push(`Gross,${totals.gross.toFixed(2)}`);
        csvRows.push(`Platform Fees,${totals.fee.toFixed(2)}`);
        csvRows.push(`Net,${totals.net.toFixed(2)}`);
        csvRows.push(`Refunded,${totals.refunded.toFixed(2)}`);

        const csv = [headers.join(","), ...csvRows].join("\n");

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="offbank-transactions-${year}.csv"`,
            },
        });
    } catch (err) {
        logger.error("[reports/tax/transactions] error", err);
        return NextResponse.json(
            { error: "Failed to build transactions report" },
            { status: 500 },
        );
    }
}
