/**
 * POST /api/invoices — Create a new invoice
 * GET  /api/invoices — List invoices for authenticated merchant
 */

import { NextRequest, NextResponse } from "next/server";
import {
    createInvoice,
    getInvoicesByMerchant,
    getInvoiceStats,
    validateApiKey,
    updateInvoiceStatus,
    getInvoice,
    getOrCreateMerchantByWallet,
} from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/email";

// ─── Auth helper ───
// Supports two modes:
//  1. API key (x-api-key header) — for programmatic / SDK access
//  2. Wallet address (x-merchant-wallet header) — for dashboard use
async function authenticate(request: NextRequest) {
    // Mode 1: API key
    const apiKey =
        request.headers.get("x-api-key") ||
        request.headers.get("authorization")?.replace("Bearer ", "");
    if (apiKey) {
        const v = await validateApiKey(apiKey);
        if (v.valid && v.merchantId && v.merchantWallet) return v;
    }

    // Mode 2: Connected wallet from dashboard
    const walletAddress = request.headers.get("x-merchant-wallet");
    if (walletAddress && walletAddress.length >= 32) {
        try {
            const merchant = await getOrCreateMerchantByWallet(walletAddress);
            return {
                valid: true,
                merchantId: merchant.id,
                merchantWallet: merchant.walletAddress,
                merchantName: merchant.name,
                tier: "free" as const,
                rateLimit: 60,
            };
        } catch {
            return null;
        }
    }

    return null;
}

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            buyerName,
            buyerEmail,
            buyerCompany,
            lineItems,
            taxRate,
            memo,
            terms,
            dueDate,
            invoiceNumber,
            sendEmail,
        } = body;

        // Validate required fields
        if (!buyerName || typeof buyerName !== "string") {
            return NextResponse.json(
                { error: "buyerName is required" },
                { status: 400 }
            );
        }
        if (
            !buyerEmail ||
            typeof buyerEmail !== "string" ||
            !buyerEmail.includes("@")
        ) {
            return NextResponse.json(
                { error: "Valid buyerEmail is required" },
                { status: 400 }
            );
        }
        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            return NextResponse.json(
                { error: "At least one line item is required" },
                { status: 400 }
            );
        }
        for (let i = 0; i < lineItems.length; i++) {
            const li = lineItems[i];
            if (!li.description || typeof li.quantity !== "number" || typeof li.unitPrice !== "number") {
                return NextResponse.json(
                    { error: `Invalid line item at index ${i}` },
                    { status: 400 }
                );
            }
            // Auto-calculate amount
            li.amount = li.quantity * li.unitPrice;
        }
        if (!dueDate) {
            return NextResponse.json(
                { error: "dueDate is required" },
                { status: 400 }
            );
        }

        const invoice = await createInvoice({
            merchantId: auth.merchantId!,
            merchantName: auth.merchantName || "Merchant",
            merchantWallet: auth.merchantWallet!,
            invoiceNumber,
            buyerName,
            buyerEmail,
            buyerCompany,
            lineItems,
            taxRate: taxRate ? Number(taxRate) : undefined,
            memo,
            terms,
            dueDate: new Date(dueDate),
        });

        // Optionally send email immediately
        if (sendEmail !== false) {
            const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev"}/invoice/${invoice.viewToken}`;
            await updateInvoiceStatus(invoice.id, "sent", {
                sentAt: new Date(),
            });
            invoice.status = "sent";

            sendInvoiceEmail({
                to: buyerEmail,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total,
                currency: invoice.currency,
                buyerName,
                merchantName: auth.merchantName || "Merchant",
                dueDate: new Date(dueDate),
                invoiceUrl,
                memo,
            }).catch((err) =>
                console.error("[invoices] Failed to send email:", err)
            );
        }

        return NextResponse.json(
            {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                status: invoice.status,
                total: invoice.total,
                buyerEmail: invoice.buyerEmail,
                viewToken: invoice.viewToken,
                invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev"}/invoice/${invoice.viewToken}`,
                createdAt: invoice.createdAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[invoices] Error creating invoice:", error);
        return NextResponse.json(
            { error: "Failed to create invoice" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as
            | "draft"
            | "sent"
            | "viewed"
            | "paid"
            | "overdue"
            | "cancelled"
            | null;
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const statsOnly = searchParams.get("stats") === "true";

        if (statsOnly) {
            const stats = await getInvoiceStats(auth.merchantId!);
            return NextResponse.json(stats);
        }

        const invoices = await getInvoicesByMerchant(auth.merchantId!, {
            status: status || undefined,
            limit,
            offset,
        });

        return NextResponse.json({
            invoices: invoices.map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                buyerName: inv.buyerName,
                buyerEmail: inv.buyerEmail,
                buyerCompany: inv.buyerCompany,
                total: inv.total,
                currency: inv.currency,
                status: inv.status,
                dueDate: inv.dueDate.toISOString(),
                paidAt: inv.paidAt?.toISOString(),
                createdAt: inv.createdAt.toISOString(),
            })),
            count: invoices.length,
        });
    } catch (error) {
        console.error("[invoices] Error listing invoices:", error);
        return NextResponse.json(
            { error: "Failed to list invoices" },
            { status: 500 }
        );
    }
}
