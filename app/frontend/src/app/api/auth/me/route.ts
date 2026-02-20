/**
 * GET /api/auth/me — Returns the authenticated merchant profile.
 *
 * Used by integrations (Zapier, Slack, etc.) to validate an API key
 * and retrieve merchant details in a simple format.
 *
 * Authentication: X-API-Key header
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        const apiKey =
            request.headers.get("x-api-key") ||
            request.headers.get("authorization")?.replace("Bearer ", "");

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing API key" },
                { status: 401, headers: corsHeaders }
            );
        }

        const validation = await validateApiKey(apiKey);
        if (!validation.valid || !validation.merchantId) {
            return NextResponse.json(
                { error: validation.error || "Invalid API key" },
                { status: 401, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            {
                id: validation.merchantId,
                email: validation.merchantName || null,
                name: validation.merchantName || null,
                wallet: validation.merchantWallet || null,
                tier: validation.tier || "free",
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("[auth/me] Error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500, headers: corsHeaders }
        );
    }
}
