/**
 * POST /api/collections/send — Process and send due reminders
 *
 * Finds all scheduled reminders whose scheduledFor <= now,
 * checks if the invoice is still unpaid, sends the email,
 * and marks the reminder as sent or failed.
 *
 * Also: POST with ?action=schedule&invoiceId=xxx to schedule
 *       reminders for a specific invoice.
 *       POST with ?action=cancel&invoiceId=xxx to cancel
 *       reminders for a paid/cancelled invoice.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
    getInvoice,
    getDueReminders,
    updateReminderStatus,
    createRemindersForInvoice,
    cancelRemindersForInvoice,
} from "@/lib/db";
import { sendCollectionReminderEmail } from "@/lib/email";

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

export async function POST(request: NextRequest) {
    const auth = await authenticate(request);
    if (!auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "send";

    /* ── Schedule reminders for an invoice ── */
    if (action === "schedule") {
        const invoiceId = searchParams.get("invoiceId");
        if (!invoiceId) {
            return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
        }

        const invoice = await getInvoice(invoiceId);
        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }
        if (invoice.merchantId !== auth.merchantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        if (invoice.status === "paid" || invoice.status === "cancelled") {
            return NextResponse.json({ error: "Invoice is already paid or cancelled" }, { status: 400 });
        }

        const created = await createRemindersForInvoice(invoice, auth.merchantId);
        return NextResponse.json({
            scheduled: created.length,
            reminders: created.map((r) => ({
                id: r.id,
                type: r.type,
                scheduledFor: r.scheduledFor.toISOString(),
            })),
        });
    }

    /* ── Cancel reminders for an invoice ── */
    if (action === "cancel") {
        const invoiceId = searchParams.get("invoiceId");
        if (!invoiceId) {
            return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
        }
        const cancelled = await cancelRemindersForInvoice(invoiceId);
        return NextResponse.json({ cancelled });
    }

    /* ── Send due reminders (default action) ── */
    const dueReminders = await getDueReminders(auth.merchantId);

    let sent = 0;
    let skipped = 0;
    let failed = 0;
    const results: { id: string; invoiceNumber: string; type: string; status: string; error?: string }[] = [];

    for (const reminder of dueReminders) {
        // Check if invoice is still unpaid
        const invoice = await getInvoice(reminder.invoiceId);
        if (!invoice) {
            await updateReminderStatus(reminder.id, "skipped");
            skipped++;
            results.push({ id: reminder.id, invoiceNumber: reminder.invoiceNumber, type: reminder.type, status: "skipped", error: "Invoice not found" });
            continue;
        }

        if (invoice.status === "paid" || invoice.status === "cancelled") {
            await updateReminderStatus(reminder.id, "skipped");
            skipped++;
            results.push({ id: reminder.id, invoiceNumber: reminder.invoiceNumber, type: reminder.type, status: "skipped", error: `Invoice is ${invoice.status}` });
            continue;
        }

        // Calculate days overdue
        const now = new Date();
        const daysOverdue = Math.max(
            0,
            Math.ceil((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Build invoice URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "https://settlr.dev";
        const invoiceUrl = `${baseUrl}/invoice/${invoice.viewToken}`;

        try {
            const emailSent = await sendCollectionReminderEmail({
                to: reminder.buyerEmail,
                type: reminder.type,
                invoiceNumber: reminder.invoiceNumber,
                amount: invoice.total,
                currency: invoice.currency,
                buyerName: reminder.buyerName,
                merchantName: auth.merchantName,
                dueDate: invoice.dueDate,
                invoiceUrl,
                daysOverdue,
            });

            if (emailSent) {
                await updateReminderStatus(reminder.id, "sent", { sentAt: new Date() });
                sent++;
                results.push({ id: reminder.id, invoiceNumber: reminder.invoiceNumber, type: reminder.type, status: "sent" });
            } else {
                await updateReminderStatus(reminder.id, "failed", { failedReason: "Email send failed" });
                failed++;
                results.push({ id: reminder.id, invoiceNumber: reminder.invoiceNumber, type: reminder.type, status: "failed", error: "Email send failed" });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unknown error";
            await updateReminderStatus(reminder.id, "failed", { failedReason: msg });
            failed++;
            results.push({ id: reminder.id, invoiceNumber: reminder.invoiceNumber, type: reminder.type, status: "failed", error: msg });
        }
    }

    return NextResponse.json({
        processed: dueReminders.length,
        sent,
        skipped,
        failed,
        results,
    });
}
