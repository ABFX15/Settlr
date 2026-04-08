/**
 * GET /api/receivables — Accounts Receivable analytics
 *
 * Returns:
 *   - outstanding invoices (by age bucket)
 *   - due today / overdue
 *   - average days to payment
 *   - counterparties ranked by risk (overdue %)
 *   - collected this week
 *   - cash unlocked by instant settlement (vs Net 30 baseline)
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
    getInvoicesByMerchant,
    type Invoice,
} from "@/lib/db";

async function authenticate(request: NextRequest) {
    const walletAddress = request.headers.get("x-merchant-wallet");
    if (walletAddress && walletAddress.length >= 32) {
        try {
            const merchant = await getOrCreateMerchantByWallet(walletAddress);
            return { merchantId: merchant.id, merchantWallet: merchant.walletAddress };
        } catch {
            return null;
        }
    }
    return null;
}

// Bucket helper
function ageBucket(daysOverdue: number): string {
    if (daysOverdue <= 0) return "current";
    if (daysOverdue <= 30) return "1-30";
    if (daysOverdue <= 60) return "31-60";
    if (daysOverdue <= 90) return "61-90";
    return "90+";
}

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invoices = await getInvoicesByMerchant(auth.merchantId, { limit: 10000 });
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        // ── Outstanding invoices by age bucket ──
        const agingBuckets: Record<string, { count: number; amount: number }> = {
            current: { count: 0, amount: 0 },
            "1-30": { count: 0, amount: 0 },
            "31-60": { count: 0, amount: 0 },
            "61-90": { count: 0, amount: 0 },
            "90+": { count: 0, amount: 0 },
        };

        // ── Counters ──
        let dueToday = 0;
        let dueTodayAmount = 0;
        let overdueCount = 0;
        let overdueAmount = 0;
        let collectedThisWeek = 0;
        let collectedThisWeekCount = 0;
        let totalOutstanding = 0;
        let totalOutstandingAmount = 0;

        // ── For avg time to payment ──
        const paymentDaysList: number[] = [];

        // ── Counterparty tracking ──
        const counterparties: Record<
            string,
            { name: string; company?: string; email: string; totalInvoiced: number; totalPaid: number; overdueCount: number; totalCount: number; avgDaysToPay: number; daysSum: number; paidCount: number }
        > = {};

        // ── Cash unlocked calc (instant vs Net-30 baseline) ──
        let cashUnlocked = 0; // $ that would still be waiting under Net 30

        const todayStr = now.toISOString().slice(0, 10);

        for (const inv of invoices) {
            // ── Counterparty accumulation ──
            const key = inv.buyerEmail.toLowerCase();
            if (!counterparties[key]) {
                counterparties[key] = {
                    name: inv.buyerName,
                    company: inv.buyerCompany,
                    email: inv.buyerEmail,
                    totalInvoiced: 0,
                    totalPaid: 0,
                    overdueCount: 0,
                    totalCount: 0,
                    avgDaysToPay: 0,
                    daysSum: 0,
                    paidCount: 0,
                };
            }
            const cp = counterparties[key];
            cp.totalCount++;
            cp.totalInvoiced += inv.total;

            if (inv.status === "paid" && inv.paidAt) {
                cp.totalPaid += inv.total;
                const daysToPay = Math.max(0, Math.floor((inv.paidAt.getTime() - inv.createdAt.getTime()) / 86400000));
                paymentDaysList.push(daysToPay);
                cp.daysSum += daysToPay;
                cp.paidCount++;

                // Collected this week?
                if (inv.paidAt >= startOfWeek) {
                    collectedThisWeek += inv.total;
                    collectedThisWeekCount++;
                }

                // Cash unlocked: if paid in < 30 days, the delta is "unlocked"
                if (daysToPay < 30) {
                    // They would have waited 30 days traditionally. We got it in `daysToPay`.
                    // The "unlocked" amount = total that was paid early
                    cashUnlocked += inv.total;
                }
            } else if (inv.status !== "cancelled" && inv.status !== "draft") {
                // Outstanding
                totalOutstanding++;
                totalOutstandingAmount += inv.total;

                const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000);
                const bucket = ageBucket(daysOverdue);
                agingBuckets[bucket].count++;
                agingBuckets[bucket].amount += inv.total;

                // Due today?
                const dueDateStr = inv.dueDate.toISOString().slice(0, 10);
                if (dueDateStr === todayStr) {
                    dueToday++;
                    dueTodayAmount += inv.total;
                }

                // Overdue?
                if (inv.dueDate < now) {
                    overdueCount++;
                    overdueAmount += inv.total;
                    cp.overdueCount++;
                }
            }
        }

        // ── Avg days to payment ──
        const avgDaysToPayment = paymentDaysList.length > 0
            ? Math.round(paymentDaysList.reduce((a, b) => a + b, 0) / paymentDaysList.length)
            : 0;

        // ── Counterparties by risk ──
        const counterpartyList = Object.values(counterparties)
            .filter((cp) => cp.totalCount >= 1)
            .map((cp) => ({
                name: cp.name,
                company: cp.company,
                email: cp.email,
                totalInvoiced: cp.totalInvoiced,
                totalPaid: cp.totalPaid,
                outstanding: cp.totalInvoiced - cp.totalPaid,
                overdueCount: cp.overdueCount,
                totalCount: cp.totalCount,
                avgDaysToPay: cp.paidCount > 0 ? Math.round(cp.daysSum / cp.paidCount) : null,
                riskScore: cp.totalCount > 0
                    ? Math.round((cp.overdueCount / cp.totalCount) * 100)
                    : 0,
            }))
            .sort((a, b) => b.riskScore - a.riskScore || b.outstanding - a.outstanding);

        // ── Outstanding invoices detail (most recent 20) ──
        const outstandingInvoices = invoices
            .filter((inv) => !["paid", "cancelled", "draft"].includes(inv.status))
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .slice(0, 20)
            .map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                buyerName: inv.buyerName,
                buyerCompany: inv.buyerCompany,
                total: inv.total,
                status: inv.status,
                dueDate: inv.dueDate.toISOString(),
                daysOverdue: Math.max(0, Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000)),
                viewToken: inv.viewToken,
            }));

        return NextResponse.json({
            summary: {
                totalOutstanding,
                totalOutstandingAmount,
                dueToday,
                dueTodayAmount,
                overdueCount,
                overdueAmount,
                avgDaysToPayment,
                collectedThisWeek,
                collectedThisWeekCount,
                cashUnlocked,
                totalInvoices: invoices.length,
                totalPaid: invoices.filter((i) => i.status === "paid").length,
            },
            agingBuckets,
            counterparties: counterpartyList.slice(0, 20),
            outstandingInvoices,
        });
    } catch (err) {
        console.error("[api/receivables] GET error:", err);
        return NextResponse.json({ error: "Failed to compute receivables" }, { status: 500 });
    }
}
