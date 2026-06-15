import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/sumsub";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Sumsub Webhook Payload Types
 */
interface SumsubWebhookPayload {
    applicantId: string;
    inspectionId: string;
    correlationId: string;
    externalUserId: string;
    levelName: string;
    type: "applicantReviewed" | "applicantActionPending" | "applicantActivated";
    reviewStatus: string;
    reviewResult?: {
        reviewAnswer: "GREEN" | "RED";
        rejectLabels?: string[];
        moderationComment?: string;
    };
    createdAtMs: string;
    applicantType?: string;
    sandboxMode?: boolean;
    clientId?: string;
    // For applicantActionPending
    applicantActionId?: string;
    externalApplicantActionId?: string;
}

/**
 * POST /api/kyc/webhook
 * 
 * Handle Sumsub webhook callbacks
 * Configure this URL in Sumsub dashboard: https://offbankpay.com/api/kyc/webhook
 * 
 * Events to subscribe to:
 * - applicantReviewed: Verification completed (GREEN/RED)
 * - applicantActionPending: Action is pending review
 * - applicantActivated: Applicant activated
 */
export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get("x-payload-digest") || "";
        const payload = await request.text();

        // Verify webhook signature
        if (process.env.SUMSUB_SECRET_KEY) {
            const isValid = verifyWebhookSignature(payload, signature);
            if (!isValid) {
                logger.error("[KYC Webhook] Invalid signature");
                return NextResponse.json(
                    { error: "Invalid signature" },
                    { status: 401 }
                );
            }
        }

        const data: SumsubWebhookPayload = JSON.parse(payload);

        logger.info("[KYC Webhook] Received:", {
            type: data.type,
            applicantId: data.applicantId,
            externalUserId: data.externalUserId,
            levelName: data.levelName,
            reviewStatus: data.reviewStatus,
            reviewResult: data.reviewResult,
        });

        // Handle different webhook events
        switch (data.type) {
            case "applicantReviewed":
                await handleApplicantReviewed(data);
                break;

            case "applicantActionPending":
                await handleApplicantActionPending(data);
                break;

            case "applicantActivated":
                await handleApplicantActivated(data);
                break;

            default:
                logger.info(`[KYC Webhook] Unhandled type: ${data.type}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("[KYC Webhook] Error:", error);
        return NextResponse.json(
            { error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}

/**
 * applicantReviewed - Verification completed
 * reviewAnswer: GREEN = approved, RED = rejected
 */
async function handleApplicantReviewed(data: SumsubWebhookPayload) {
    const { applicantId, externalUserId, reviewResult, levelName } = data;

    if (reviewResult?.reviewAnswer === "GREEN") {
        logger.info(`[KYC] ✅ User ${externalUserId} APPROVED`, {
            applicantId,
            levelName,
        });

        if (isSupabaseConfigured()) {
            const { error } = await supabase
                .from("customer_kyc")
                .upsert({
                    external_user_id: externalUserId,
                    sumsub_applicant_id: applicantId,
                    status: "verified",
                    verified_at: new Date().toISOString(),
                }, { onConflict: "external_user_id" });
            if (error) logger.error("[KYC Webhook] DB error (approved):", error);
        }

    } else if (reviewResult?.reviewAnswer === "RED") {
        logger.info(`[KYC] ❌ User ${externalUserId} REJECTED`, {
            applicantId,
            levelName,
            rejectLabels: reviewResult.rejectLabels,
            comment: reviewResult.moderationComment,
        });

        if (isSupabaseConfigured()) {
            const { error } = await supabase
                .from("customer_kyc")
                .upsert({
                    external_user_id: externalUserId,
                    sumsub_applicant_id: applicantId,
                    status: "rejected",
                    reject_reasons: reviewResult.rejectLabels || [],
                }, { onConflict: "external_user_id" });
            if (error) logger.error("[KYC Webhook] DB error (rejected):", error);
        }
    }
}

/**
 * applicantActionPending - Action submitted, awaiting review
 */
async function handleApplicantActionPending(data: SumsubWebhookPayload) {
    const { applicantId, externalUserId, applicantActionId } = data;

    logger.info(`[KYC] ⏳ User ${externalUserId} action pending`, {
        applicantId,
        applicantActionId,
    });

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("customer_kyc")
            .upsert({
                external_user_id: externalUserId,
                sumsub_applicant_id: applicantId,
                status: "pending",
            }, { onConflict: "external_user_id" });
        if (error) logger.error("[KYC Webhook] DB error (pending):", error);
    }
}

/**
 * applicantActivated - Applicant created and activated
 */
async function handleApplicantActivated(data: SumsubWebhookPayload) {
    const { applicantId, externalUserId, levelName, sandboxMode } = data;

    logger.info(`[KYC] 🆕 Applicant ${externalUserId} activated`, {
        applicantId,
        levelName,
        sandboxMode,
    });

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("customer_kyc")
            .upsert({
                external_user_id: externalUserId,
                sumsub_applicant_id: applicantId,
                status: "not_started",
            }, { onConflict: "external_user_id" });
        if (error) logger.error("[KYC Webhook] DB error (activated):", error);
    }
}
