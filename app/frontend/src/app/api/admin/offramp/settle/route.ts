/**
 * POST /api/admin/offramp/settle — Settle an OTC batch once USD has wired.
 *
 * The operator confirms the OTC desk wired USD to the cannabis-compliant bank
 * by providing the batch id + wire reference. Marks every payout in the batch
 * "completed" and emits a withdrawal.completed event per payout.
 *
 * Admin-only.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/pipeline";
import { settleOfframpBatch } from "@/lib/offramp";

export async function POST(request: NextRequest) {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => ({}));
    const { batchId, wireRef } = body as { batchId?: string; wireRef?: string };

    if (!batchId || !wireRef) {
        return NextResponse.json(
            { error: "batchId and wireRef are required" },
            { status: 400 },
        );
    }

    const result = settleOfframpBatch(batchId, wireRef);
    if (!result) {
        return NextResponse.json(
            { error: "not_found_or_already_settled" },
            { status: 404 },
        );
    }

    for (const r of result.settled) {
        emitEvent("withdrawal.completed", "merchant", r.merchantId, r.merchantId, {
            requestId: r.id,
            amount: r.amount,
            currency: r.currency,
            method: r.method,
            providerRef: wireRef,
            batchId,
        }).catch((err) => logger.error("[pipeline] emit error:", err));
    }

    logger.info(
        `[offramp] Batch ${batchId} settled (${result.settled.length} payouts, wire ${wireRef})`,
    );

    return NextResponse.json({ batch: result.batch, settled: result.settled.length });
}
