/**
 * POST /api/integrations/leaflink/retry
 *
 * Retries failed or partially-synced LeafLink orders.
 * Finds sync records in "paid" status (payment confirmed but LeafLink
 * not yet updated) and re-attempts the LeafLink API sync.
 *
 * Can be called:
 *   - Manually from the dashboard
 *   - Via a Vercel cron job (vercel.json)
 *   - Via external scheduler
 *
 * Authentication: Internal secret or merchant API key
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/db";
import { listSyncs, updateSync, getConfig } from "@/lib/leaflink/db";
import { LeafLinkClient } from "@/lib/leaflink/client";

const RETRY_SECRET =
    process.env.LEAFLINK_RETRY_SECRET || process.env.CRON_SECRET || "";

export async function POST(request: NextRequest) {
    try {
        // Auth: either internal cron secret or merchant API key
        const authHeader = request.headers.get("authorization") ?? "";
        const apiKey =
            request.headers.get("x-api-key") ||
            authHeader.replace("Bearer ", "");

        let merchantId: string | null = null;

        // Check if it's the cron secret (processes all merchants)
        const isCron = RETRY_SECRET && apiKey === RETRY_SECRET;

        if (!isCron) {
            // Validate as merchant API key
            if (!apiKey) {
                return NextResponse.json(
                    { error: "Missing authentication" },
                    { status: 401 },
                );
            }

            const validation = await validateApiKey(apiKey);
            if (!validation.valid || !validation.merchantId) {
                return NextResponse.json(
                    { error: validation.error || "Invalid API key" },
                    { status: 401 },
                );
            }
            merchantId = validation.merchantId;
        }

        // Find records that need retry
        // "paid" = payment confirmed but LeafLink not yet updated
        let retryTargets;
        if (merchantId) {
            retryTargets = await listSyncs(merchantId, {
                status: "paid",
                limit: 50,
            });
        } else {
            // Cron mode: we need to query across all merchants
            // For now, get all configs and process each
            const { getAllConfigs } = await import("@/lib/leaflink/db");
            const configs = await getAllConfigs();
            retryTargets = [];
            for (const config of configs) {
                const syncs = await listSyncs(config.merchant_id, {
                    status: "paid",
                    limit: 20,
                });
                retryTargets.push(...syncs);
            }
        }

        if (retryTargets.length === 0) {
            return NextResponse.json({
                retried: 0,
                message: "No records need retry",
            });
        }

        console.log(
            `[leaflink] Retrying ${retryTargets.length} paid-but-unsynced records`,
        );

        let succeeded = 0;
        let failed = 0;
        const errors: Array<{ sync_id: string; error: string }> = [];

        for (const sync of retryTargets) {
            try {
                const config = await getConfig(sync.merchant_id);
                if (!config) {
                    errors.push({
                        sync_id: sync.id,
                        error: "No integration config found",
                    });
                    failed++;
                    continue;
                }

                if (!sync.tx_signature || !sync.settlr_invoice_id) {
                    errors.push({
                        sync_id: sync.id,
                        error: "Missing tx_signature or invoice_id",
                    });
                    failed++;
                    continue;
                }

                const ll = new LeafLinkClient({
                    apiKey: config.leaflink_api_key,
                    companyId: config.leaflink_company_id,
                });

                await ll.setExternalPaymentRef(sync.leaflink_order_id, {
                    tx_signature: sync.tx_signature,
                    settlr_invoice_id: sync.settlr_invoice_id,
                    settled_at: sync.updated_at,
                    amount_usdc: sync.amount,
                });

                await updateSync(sync.id, { status: "synced", error: undefined });
                succeeded++;

                console.log(
                    `[leaflink] Retry succeeded: order ${sync.leaflink_order_number}`,
                );
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                await updateSync(sync.id, { error: `Retry failed: ${msg}` });
                errors.push({ sync_id: sync.id, error: msg });
                failed++;

                console.error(
                    `[leaflink] Retry failed: order ${sync.leaflink_order_number} — ${msg}`,
                );
            }
        }

        return NextResponse.json({
            retried: retryTargets.length,
            succeeded,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("[leaflink] Retry error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
