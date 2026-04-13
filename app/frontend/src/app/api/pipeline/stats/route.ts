/**
 * GET /api/pipeline/stats — Merchant analytics & platform stats
 *
 * Query params:
 *   merchant   — Merchant ID (required for merchant stats)
 *   scope      — "merchant" | "platform" (default: "merchant")
 *   dateFrom   — Start date (YYYY-MM-DD)
 *   dateTo     — End date (YYYY-MM-DD)
 *   days       — Shortcut: last N days (default: 30)
 */

import { NextRequest, NextResponse } from "next/server";
import { getMerchantStats, getPlatformStats } from "@/lib/pipeline";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    const rateLimited = await checkRateLimit(`pipeline-stats:${getClientIp(request)}`);
    if (rateLimited) return rateLimited;

    const params = request.nextUrl.searchParams;
    const scope = params.get("scope") || "merchant";
    const merchantId = params.get("merchant");
    const days = parseInt(params.get("days") || "30", 10);
    const dateFrom = params.get("dateFrom") || daysAgo(days);
    const dateTo = params.get("dateTo") || today();

    try {
        if (scope === "platform") {
            const stats = await getPlatformStats({ dateFrom, dateTo, limit: days });
            return NextResponse.json({
                scope: "platform",
                dateRange: { from: dateFrom, to: dateTo },
                days: stats.length,
                stats,
                totals: aggregatePlatformTotals(stats),
            });
        }

        if (!merchantId) {
            return NextResponse.json(
                { error: "Missing 'merchant' query parameter" },
                { status: 400 },
            );
        }

        const stats = await getMerchantStats(merchantId, { dateFrom, dateTo, limit: days });
        return NextResponse.json({
            scope: "merchant",
            merchantId,
            dateRange: { from: dateFrom, to: dateTo },
            days: stats.length,
            stats,
            totals: aggregateMerchantTotals(stats),
        });
    } catch (error) {
        console.error("[Pipeline] Stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 },
        );
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function today(): string {
    return new Date().toISOString().substring(0, 10);
}

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().substring(0, 10);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function aggregateMerchantTotals(stats: any[]) {
    return stats.reduce(
        (acc, s) => ({
            paymentsCount: acc.paymentsCount + (s.paymentsCount || 0),
            paymentsVolume: acc.paymentsVolume + (s.paymentsVolume || 0),
            invoicesCreated: acc.invoicesCreated + (s.invoicesCreated || 0),
            invoicesPaid: acc.invoicesPaid + (s.invoicesPaid || 0),
            invoicesPaidVolume: acc.invoicesPaidVolume + (s.invoicesPaidVolume || 0),
            payoutsCount: acc.payoutsCount + (s.payoutsCount || 0),
            payoutsVolume: acc.payoutsVolume + (s.payoutsVolume || 0),
            feesCollected: acc.feesCollected + (s.feesCollected || 0),
            ordersCreated: acc.ordersCreated + (s.ordersCreated || 0),
            ordersPaidVolume: acc.ordersPaidVolume + (s.ordersPaidVolume || 0),
            subscriptionRevenue: acc.subscriptionRevenue + (s.subscriptionRevenue || 0),
            newRecipients: acc.newRecipients + (s.newRecipients || 0),
        }),
        {
            paymentsCount: 0,
            paymentsVolume: 0,
            invoicesCreated: 0,
            invoicesPaid: 0,
            invoicesPaidVolume: 0,
            payoutsCount: 0,
            payoutsVolume: 0,
            feesCollected: 0,
            ordersCreated: 0,
            ordersPaidVolume: 0,
            subscriptionRevenue: 0,
            newRecipients: 0,
        },
    );
}

function aggregatePlatformTotals(stats: any[]) {
    return stats.reduce(
        (acc, s) => ({
            paymentsCount: acc.paymentsCount + (s.paymentsCount || 0),
            paymentsVolume: acc.paymentsVolume + (s.paymentsVolume || 0),
            invoicesCreated: acc.invoicesCreated + (s.invoicesCreated || 0),
            invoicesPaid: acc.invoicesPaid + (s.invoicesPaid || 0),
            payoutsCount: acc.payoutsCount + (s.payoutsCount || 0),
            payoutsVolume: acc.payoutsVolume + (s.payoutsVolume || 0),
            feesCollected: acc.feesCollected + (s.feesCollected || 0),
            newMerchants: acc.newMerchants + (s.newMerchants || 0),
            newRecipients: acc.newRecipients + (s.newRecipients || 0),
            peakActiveMerchants: Math.max(acc.peakActiveMerchants, s.activeMerchants || 0),
        }),
        {
            paymentsCount: 0,
            paymentsVolume: 0,
            invoicesCreated: 0,
            invoicesPaid: 0,
            payoutsCount: 0,
            payoutsVolume: 0,
            feesCollected: 0,
            newMerchants: 0,
            newRecipients: 0,
            peakActiveMerchants: 0,
        },
    );
}
