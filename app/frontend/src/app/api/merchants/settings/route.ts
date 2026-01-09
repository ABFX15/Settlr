import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/merchants/settings?wallet=xxx
 * Get merchant settings including KYC configuration
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
        return NextResponse.json(
            { error: "wallet parameter required" },
            { status: 400 }
        );
    }

    if (!isSupabaseConfigured()) {
        // Return defaults if no database
        return NextResponse.json({
            kycEnabled: false,
            kycLevel: "basic-kyc-level",
        });
    }

    try {
        const { data, error } = await supabase
            .from("merchants")
            .select("kyc_enabled, kyc_level")
            .eq("wallet_address", wallet)
            .single();

        if (error || !data) {
            return NextResponse.json({
                kycEnabled: false,
                kycLevel: "basic-kyc-level",
            });
        }

        return NextResponse.json({
            kycEnabled: data.kyc_enabled || false,
            kycLevel: data.kyc_level || "basic-kyc-level",
        });
    } catch (err) {
        console.error("Error fetching merchant settings:", err);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/merchants/settings
 * Update merchant settings
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, kycEnabled, kycLevel } = body;

        if (!wallet) {
            return NextResponse.json(
                { error: "wallet is required" },
                { status: 400 }
            );
        }

        if (!isSupabaseConfigured()) {
            // Just return success if no database
            return NextResponse.json({ success: true });
        }

        const { error } = await supabase
            .from("merchants")
            .update({
                kyc_enabled: kycEnabled,
                kyc_level: kycLevel,
                updated_at: new Date().toISOString(),
            })
            .eq("wallet_address", wallet);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error updating merchant settings:", err);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
