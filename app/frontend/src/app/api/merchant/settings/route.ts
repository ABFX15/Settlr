import { NextRequest, NextResponse } from "next/server";

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
            notifications: {
                emailOnPayment: true,
                emailOnOfframp: true,
            },
        });
    }

    return NextResponse.json(stored);
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

        settingsStore.set(body.wallet, body);

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
