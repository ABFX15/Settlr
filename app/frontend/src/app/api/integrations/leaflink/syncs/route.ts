/**
 * GET /api/integrations/leaflink/syncs — List LeafLink ↔ Settlr sync records
 *
 * Query params:
 *   ?status=pending|link_sent|paid|synced|failed|cancelled
 *   ?limit=50
 *
 * Authentication: X-API-Key header
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/db";
import { listSyncs } from "@/lib/leaflink/db";
import type { SyncStatus } from "@/lib/leaflink/types";

const VALID_STATUSES: SyncStatus[] = [
    "pending",
    "link_sent",
    "paid",
    "synced",
    "failed",
    "cancelled",
];

export async function GET(request: NextRequest) {
    try {
        const apiKey =
            request.headers.get("x-api-key") ||
            request.headers.get("authorization")?.replace("Bearer ", "");

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 401 });
        }

        const validation = await validateApiKey(apiKey);
        if (!validation.valid || !validation.merchantId) {
            return NextResponse.json(
                { error: validation.error || "Invalid API key" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get("status");
        const limitParam = searchParams.get("limit");

        const status =
            statusParam && VALID_STATUSES.includes(statusParam as SyncStatus)
                ? (statusParam as SyncStatus)
                : undefined;

        const limit = limitParam ? Math.min(parseInt(limitParam, 10), 200) : 50;

        const syncs = await listSyncs(validation.merchantId, { status, limit });

        return NextResponse.json({
            count: syncs.length,
            syncs: syncs.map((s) => ({
                id: s.id,
                leaflink_order_id: s.leaflink_order_id,
                leaflink_order_number: s.leaflink_order_number,
                buyer_company: s.buyer_company,
                buyer_email: s.buyer_email,
                amount: s.amount,
                status: s.status,
                settlr_invoice_id: s.settlr_invoice_id,
                payment_link: s.settlr_payment_link,
                tx_signature: s.tx_signature,
                error: s.error,
                created_at: s.created_at,
                updated_at: s.updated_at,
            })),
        });
    } catch (error) {
        console.error("[leaflink] Syncs GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
