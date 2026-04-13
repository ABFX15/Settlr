/**
 * POST /api/orders — Create a new purchase order
 * GET  /api/orders — List orders for authenticated merchant
 */

import { NextRequest, NextResponse } from "next/server";
import {
    createPurchaseOrder,
    getPurchaseOrdersByMerchant,
    getOrderStats,
    getOrCreateMerchantByWallet,
} from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { emitEvent } from "@/lib/pipeline";

async function authenticate(request: NextRequest) {
    const walletAddress = request.headers.get("x-merchant-wallet");
    if (walletAddress && walletAddress.length >= 32) {
        try {
            const merchant = await getOrCreateMerchantByWallet(walletAddress);
            return {
                valid: true,
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
    try {
        const rateLimited = await checkRateLimit(`orders:${getClientIp(request)}`);
        if (rateLimited) return rateLimited;

        const auth = await authenticate(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            buyerName,
            buyerEmail,
            buyerCompany,
            buyerWallet,
            lineItems,
            taxRate,
            notes,
            terms,
            expectedDate,
        } = body;

        if (!buyerName || !buyerEmail || !lineItems?.length) {
            return NextResponse.json(
                { error: "buyerName, buyerEmail, and lineItems are required" },
                { status: 400 }
            );
        }

        const order = await createPurchaseOrder({
            merchantId: auth.merchantId,
            merchantWallet: auth.merchantWallet,
            buyerName,
            buyerEmail,
            buyerCompany,
            buyerWallet,
            lineItems: lineItems.map((li: any) => ({
                description: li.description,
                sku: li.sku,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                amount: li.quantity * li.unitPrice,
            })),
            taxRate: taxRate ? parseFloat(taxRate) : undefined,
            notes,
            terms,
            expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        });

        emitEvent("order.created", "order", order.id, auth.merchantId, {
            amount: order.total, orderNumber: order.orderNumber, buyerEmail,
        }).catch((err) => console.error("[pipeline] emit error:", err));

        return NextResponse.json({
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.status,
        });
    } catch (err) {
        console.error("[api/orders] POST error:", err);
        return NextResponse.json(
            { error: "Failed to create order" },
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

        const url = new URL(request.url);

        // Stats mode
        if (url.searchParams.get("stats") === "true") {
            const stats = await getOrderStats(auth.merchantId);
            return NextResponse.json(stats);
        }

        const status = url.searchParams.get("status") || undefined;
        const limit = parseInt(url.searchParams.get("limit") || "100");

        const orders = await getPurchaseOrdersByMerchant(auth.merchantId, {
            status,
            limit,
        });

        return NextResponse.json({
            orders: orders.map((o) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                buyerName: o.buyerName,
                buyerEmail: o.buyerEmail,
                buyerCompany: o.buyerCompany,
                total: o.total,
                currency: o.currency,
                status: o.status,
                invoiceId: o.invoiceId,
                txSignature: o.txSignature,
                paidAt: o.paidAt?.toISOString(),
                expectedDate: o.expectedDate?.toISOString(),
                createdAt: o.createdAt.toISOString(),
            })),
            count: orders.length,
        });
    } catch (err) {
        console.error("[api/orders] GET error:", err);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
