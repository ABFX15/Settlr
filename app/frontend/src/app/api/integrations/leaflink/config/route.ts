/**
 * GET  /api/integrations/leaflink/config — Get merchant's LeafLink config
 * POST /api/integrations/leaflink/config — Create/update LeafLink integration
 *
 * Authentication: X-API-Key header (validated against merchant API keys)
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/db";
import { getConfig, upsertConfig } from "@/lib/leaflink/db";
import { LeafLinkClient } from "@/lib/leaflink/client";
import type { LeafLinkIntegrationConfig } from "@/lib/leaflink/types";

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

        const config = await getConfig(validation.merchantId);
        if (!config) {
            return NextResponse.json({ configured: false });
        }

        // Don't expose the full API key
        return NextResponse.json({
            configured: true,
            leaflink_company_id: config.leaflink_company_id,
            auto_create_invoice: config.auto_create_invoice,
            auto_send_link: config.auto_send_link,
            metrc_sync: config.metrc_sync,
            has_webhook_secret: Boolean(config.webhook_secret),
            api_key_last4: config.leaflink_api_key.slice(-4),
            updated_at: config.updated_at,
        });
    } catch (error) {
        console.error("[leaflink] Config GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            leaflink_api_key,
            leaflink_company_id,
            auto_create_invoice = true,
            auto_send_link = true,
            webhook_secret,
            metrc_sync = true,
        } = body;

        // Validate required fields
        if (!leaflink_api_key || typeof leaflink_api_key !== "string") {
            return NextResponse.json(
                { error: "leaflink_api_key is required" },
                { status: 400 },
            );
        }
        if (!leaflink_company_id || typeof leaflink_company_id !== "number") {
            return NextResponse.json(
                { error: "leaflink_company_id is required (number)" },
                { status: 400 },
            );
        }

        // Verify the LeafLink API key works
        try {
            const ll = new LeafLinkClient({
                apiKey: leaflink_api_key,
                companyId: leaflink_company_id,
            });
            const company = await ll.getCompany();
            console.log(
                `[leaflink] Verified API key for company: ${company.name} (${company.state})`,
            );
        } catch (llError) {
            return NextResponse.json(
                {
                    error: "Failed to verify LeafLink API key",
                    detail:
                        llError instanceof Error ? llError.message : "Unknown error",
                },
                { status: 400 },
            );
        }

        const now = new Date().toISOString();
        const config: LeafLinkIntegrationConfig = {
            merchant_id: validation.merchantId,
            leaflink_api_key,
            leaflink_company_id,
            auto_create_invoice,
            auto_send_link,
            webhook_secret: webhook_secret || undefined,
            metrc_sync,
            created_at: now,
            updated_at: now,
        };

        const saved = await upsertConfig(config);

        // Build the webhook URL for the merchant to configure in LeafLink
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";
        const webhookUrl = `${baseUrl}/api/integrations/leaflink/webhook`;

        return NextResponse.json({
            success: true,
            config: {
                leaflink_company_id: saved.leaflink_company_id,
                auto_create_invoice: saved.auto_create_invoice,
                auto_send_link: saved.auto_send_link,
                metrc_sync: saved.metrc_sync,
            },
            setup: {
                webhook_url: webhookUrl,
                instructions:
                    "Add this webhook URL in your LeafLink account settings under Integrations → Webhooks. " +
                    "Subscribe to order.created and order.cancelled events.",
            },
        });
    } catch (error) {
        console.error("[leaflink] Config POST error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
