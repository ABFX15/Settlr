/**
 * GET /api/collections — Collections & reminders dashboard data
 *
 * Returns:
 *   - stats: collection performance metrics
 *   - reminders: list of all reminders (with filters)
 *   - overdueInvoices: invoices past due and not yet paid
 *
 * Query params:
 *   ?status=all|scheduled|sent|failed|skipped
 *   ?limit=50
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
    getInvoicesByMerchant,
    getRemindersByMerchant,
    getCollectionStats,
    type Invoice,
    type ReminderStatus,
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

export async function GET(request: NextRequest) {
    const auth = await authenticate(request);
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10), 1000);

    // Fetch data in parallel
    const [stats, reminders, allInvoices] = await Promise.all([
        getCollectionStats(auth.merchantId),
        getRemindersByMerchant(auth.merchantId, {
            status: statusFilter !== "all" ? (statusFilter as ReminderStatus) : undefined,
            limit,
        }),
        getInvoicesByMerchant(auth.merchantId, { limit: 10000 }),
    ]);

    // Build overdue invoices list
    const now = new Date();
    const overdueInvoices = allInvoices
        .filter((inv) => {
            if (inv.status === "paid" || inv.status === "cancelled" || inv.status === "draft") return false;
            return inv.dueDate < now;
        })
        .map((inv) => {
            const daysOverdue = Math.ceil(
                (now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                buyerName: inv.buyerName,
                buyerEmail: inv.buyerEmail,
                buyerCompany: inv.buyerCompany || null,
                total: inv.total,
                currency: inv.currency,
                dueDate: inv.dueDate.toISOString().split("T")[0],
                daysOverdue,
                status: inv.status,
                viewCount: inv.viewCount,
                lastViewedAt: inv.lastViewedAt?.toISOString() || null,
                sentAt: inv.sentAt?.toISOString() || null,
            };
        })
        .sort((a, b) => b.daysOverdue - a.daysOverdue);

    // Build upcoming (due soon but not overdue)
    const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dueSoon = allInvoices
        .filter((inv) => {
            if (inv.status === "paid" || inv.status === "cancelled" || inv.status === "draft") return false;
            return inv.dueDate >= now && inv.dueDate <= threeDaysOut;
        })
        .map((inv) => {
            const daysUntilDue = Math.ceil(
                (inv.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                buyerName: inv.buyerName,
                buyerEmail: inv.buyerEmail,
                buyerCompany: inv.buyerCompany || null,
                total: inv.total,
                currency: inv.currency,
                dueDate: inv.dueDate.toISOString().split("T")[0],
                daysUntilDue,
                status: inv.status,
            };
        })
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    // Format reminders for response
    const formattedReminders = reminders.map((r) => ({
        id: r.id,
        invoiceId: r.invoiceId,
        invoiceNumber: r.invoiceNumber,
        buyerEmail: r.buyerEmail,
        buyerName: r.buyerName,
        type: r.type,
        status: r.status,
        scheduledFor: r.scheduledFor.toISOString(),
        sentAt: r.sentAt?.toISOString() || null,
        failedReason: r.failedReason || null,
    }));

    return NextResponse.json({
        stats,
        reminders: formattedReminders,
        overdueInvoices,
        dueSoon,
    });
}
