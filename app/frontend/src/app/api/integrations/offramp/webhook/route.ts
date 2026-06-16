/**
 * POST /api/integrations/offramp/webhook
 *
 * Called by the cannabis-compliant settlement partner (or the ops tool that
 * fronts them) when a USDC→USD payout actually settles or fails. This is the
 * ONLY thing that moves an off-ramp request to "completed" — there is no
 * fake auto-completion.
 *
 * Security: the partner signs the raw body with OFFRAMP_WEBHOOK_SECRET
 * (HMAC-SHA256, `x-offramp-signature` header). A forged body can't mark a
 * payout completed.
 *
 * Body: { requestId, status: "processing"|"completed"|"failed",
 *         providerRef?, failureReason? }
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { emitEvent } from "@/lib/pipeline";
import {
    getOfframpRequest,
    updateOfframpStatus,
    verifyOfframpWebhook,
    type OfframpStatus,
} from "@/lib/offramp";

const ALLOWED: OfframpStatus[] = ["processing", "completed", "failed"];

export async function POST(request: NextRequest) {
    try {
        const secret = process.env.OFFRAMP_WEBHOOK_SECRET;
        if (!secret) {
            logger.error("[offramp] OFFRAMP_WEBHOOK_SECRET not configured");
            return NextResponse.json({ error: "not_configured" }, { status: 503 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get("x-offramp-signature") ?? "";
        if (!verifyOfframpWebhook(rawBody, signature, secret)) {
            logger.warn("[offramp] Invalid settlement webhook signature");
            return NextResponse.json({ error: "invalid signature" }, { status: 401 });
        }

        let body: {
            requestId?: string;
            status?: OfframpStatus;
            providerRef?: string;
            failureReason?: string;
        };
        try {
            body = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
        }

        const { requestId, status, providerRef, failureReason } = body;
        if (!requestId || !status || !ALLOWED.includes(status)) {
            return NextResponse.json(
                { error: "requestId and a valid status are required" },
                { status: 400 },
            );
        }

        const existing = await getOfframpRequest(requestId);
        if (!existing) {
            logger.warn(`[offramp] Settlement for unknown request ${requestId}`);
            return NextResponse.json({ received: true, matched: false });
        }
        if (existing.status === "completed") {
            return NextResponse.json({ received: true, duplicate: true });
        }

        const updated = await updateOfframpStatus(requestId, status, {
            providerRef,
            failureReason,
        });

        logger.info(
            `[offramp] Request ${requestId} → ${status}${providerRef ? ` (ref ${providerRef})` : ""}`,
        );

        if (status === "completed") {
            emitEvent(
                "withdrawal.completed",
                "merchant",
                existing.merchantId,
                existing.merchantId,
                {
                    requestId,
                    amount: existing.amount,
                    currency: existing.currency,
                    method: existing.method,
                    providerRef,
                },
            ).catch((err) => logger.error("[pipeline] emit error:", err));
        }

        return NextResponse.json({ received: true, request: updated });
    } catch (error) {
        logger.error("[offramp] Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
