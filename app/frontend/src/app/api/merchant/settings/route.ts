import { NextRequest, NextResponse } from "next/server";
import { upsertConfig as upsertLeafLinkConfig } from "@/lib/leaflink/db";
import { LeafLinkClient } from "@/lib/leaflink/client";

/**
 * GET  /api/merchant/settings?wallet=xxx — Load merchant settings
 * PUT  /api/merchant/settings             — Save merchant settings
 *
 * In-memory store for now. Replace with Supabase in production.
 */

interface MerchantSettings {
    wallet: string;
    businessName: string;
    autoOfframp: {
        enabled: boolean;
        provider: "sphere" | "moonpay" | "manual";
        method: string;
        currency: string;
        accountLabel: string;
        minAmount: number;
        batchMode: boolean;
        batchThreshold: number;
    };
    leaflink?: {
        enabled: boolean;
        apiKey: string;          // stored masked in GET responses
        companyId: number | null;
        autoCreateInvoice: boolean;
        autoSendLink: boolean;
        metrcSync: boolean;
        webhookSecret: string;
        connected: boolean;       // true once first webhook validated
        lastSyncAt: string | null;
    };
    notifications: {
        emailOnPayment: boolean;
        emailOnOfframp: boolean;
    };
}

// In-memory store (replace with DB in production)
const settingsStore = new Map<string, MerchantSettings>();

export async function GET(request: NextRequest) {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet || wallet.length < 32) {
        return NextResponse.json(
            { error: "Missing or invalid wallet parameter" },
            { status: 400 },
        );
    }

    const stored = settingsStore.get(wallet);
    if (!stored) {
        // Return defaults
        return NextResponse.json({
            wallet,
            businessName: "",
            autoOfframp: {
                enabled: false,
                provider: "sphere",
                method: "ach",
                currency: "USD",
                accountLabel: "",
                minAmount: 100,
                batchMode: false,
                batchThreshold: 5000,
            },
            leaflink: {
                enabled: false,
                apiKey: "",
                companyId: null,
                autoCreateInvoice: true,
                autoSendLink: true,
                metrcSync: true,
                webhookSecret: "",
                connected: false,
                lastSyncAt: null,
            },
            notifications: {
                emailOnPayment: true,
                emailOnOfframp: true,
            },
        });
    }

    // Mask the LeafLink API key in responses (last 4 chars only)
    const safe = { ...stored };
    if (safe.leaflink && safe.leaflink.apiKey) {
        const k = safe.leaflink.apiKey;
        safe.leaflink = {
            ...safe.leaflink,
            apiKey: k.length > 4 ? `••••${k.slice(-4)}` : k,
        };
    }
    return NextResponse.json(safe);
}

export async function PUT(request: NextRequest) {
    try {
        const body: MerchantSettings = await request.json();

        if (!body.wallet || typeof body.wallet !== "string" || body.wallet.length < 32) {
            return NextResponse.json(
                { error: "Valid wallet address required" },
                { status: 400 },
            );
        }

        // Validate auto-offramp settings
        if (body.autoOfframp) {
            if (body.autoOfframp.minAmount < 1) {
                return NextResponse.json(
                    { error: "Minimum off-ramp amount must be at least $1" },
                    { status: 400 },
                );
            }
            const validProviders = ["sphere", "moonpay", "manual"];
            if (!validProviders.includes(body.autoOfframp.provider)) {
                return NextResponse.json(
                    { error: "Invalid off-ramp provider" },
                    { status: 400 },
                );
            }
        }

        // Validate LeafLink config if enabled
        if (body.leaflink?.enabled) {
            if (!body.leaflink.apiKey || body.leaflink.apiKey.startsWith("••••")) {
                // If user submitted masked key, preserve the existing real key
                const existing = settingsStore.get(body.wallet);
                if (existing?.leaflink?.apiKey && !existing.leaflink.apiKey.startsWith("••••")) {
                    body.leaflink.apiKey = existing.leaflink.apiKey;
                } else {
                    return NextResponse.json(
                        { error: "LeafLink API key required when integration is enabled" },
                        { status: 400 },
                    );
                }
            }
            if (!body.leaflink.companyId || body.leaflink.companyId < 1) {
                return NextResponse.json(
                    { error: "LeafLink company ID required" },
                    { status: 400 },
                );
            }

            // Verify the LeafLink API key actually works before saving.
            try {
                const ll = new LeafLinkClient({
                    apiKey: body.leaflink.apiKey,
                    companyId: body.leaflink.companyId,
                });
                await ll.getCompany();
            } catch (llError) {
                return NextResponse.json(
                    {
                        error: "Failed to verify LeafLink API key",
                        detail: llError instanceof Error ? llError.message : "Unknown error",
                    },
                    { status: 400 },
                );
            }
        }

        settingsStore.set(body.wallet, body);

        // Bridge: also persist into the LeafLink integration store keyed by wallet,
        // so the X-API-Key webhook handlers can find this merchant's config.
        if (body.leaflink?.enabled) {
            try {
                const now = new Date().toISOString();
                await upsertLeafLinkConfig({
                    merchant_id: body.wallet,
                    leaflink_api_key: body.leaflink.apiKey,
                    leaflink_company_id: body.leaflink.companyId!,
                    auto_create_invoice: body.leaflink.autoCreateInvoice,
                    auto_send_link: body.leaflink.autoSendLink,
                    metrc_sync: body.leaflink.metrcSync,
                    webhook_secret: body.leaflink.webhookSecret || undefined,
                    created_at: now,
                    updated_at: now,
                });
            } catch (bridgeErr) {
                console.error("[merchant/settings] LeafLink bridge upsert failed:", bridgeErr);
                // Don't fail the whole save — settings were stored, integration just
                // won't be reachable from webhook until the next save retries.
            }
        }

        console.log(
            `[merchant/settings] Saved settings for ${body.wallet.slice(0, 8)}… — auto-offramp: ${body.autoOfframp?.enabled ? "ON" : "OFF"}`,
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[merchant/settings] PUT error:", err);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 },
        );
    }
}
