/**
 * GET  /api/admin/offramp        — OTC ops queue: pending payouts + batches.
 * POST /api/admin/offramp        — Create a batch from pending payouts and
 *                                  return the compliance CSV for the OTC desk.
 *
 * Admin-only (wallet session or legacy secret). This is the operator console
 * for the compliance-first off-ramp: aggregate pending payouts, hand the
 * licensing/settlement data to the OTC desk, then settle when USD wires.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
    listOfframpsByStatus,
    listOfframpBatches,
    createOfframpBatch,
    buildOtcExportCsv,
    getOfframpRequest,
} from "@/lib/offramp";
import { assembleCompliancePayload } from "@/lib/compliance-payload";

export async function GET(request: NextRequest) {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    const pending = await listOfframpsByStatus("pending");
    const processing = await listOfframpsByStatus("processing");
    return NextResponse.json({
        pending,
        processing,
        batches: await listOfframpBatches(),
        pendingTotal: pending.reduce((s, r) => s + r.amount, 0),
    });
}

export async function POST(request: NextRequest) {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    let requestIds: string[] | undefined;
    try {
        const body = await request.json().catch(() => ({}));
        if (Array.isArray(body.requestIds)) requestIds = body.requestIds;
    } catch {
        /* no body = batch all pending */
    }

    const batch = await createOfframpBatch(requestIds);
    if (!batch) {
        return NextResponse.json(
            { error: "no_pending_requests", message: "No pending payouts to batch." },
            { status: 400 },
        );
    }

    const reqs = (
        await Promise.all(batch.requestIds.map((id) => getOfframpRequest(id)))
    ).filter((r): r is NonNullable<typeof r> => !!r);
    const csv = buildOtcExportCsv(reqs);

    // Per-payout compliance bundles (license + provenance) the bank auto-clears on.
    const compliance = await Promise.all(reqs.map((r) => assembleCompliancePayload(r)));

    logger.info(
        `[offramp] OTC batch ${batch.id}: ${reqs.length} payouts, ${batch.totalAmount} ${batch.currency}`,
    );

    return NextResponse.json({ batch, csv, compliance });
}
