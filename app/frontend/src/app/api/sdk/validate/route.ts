import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, checkRateLimit } from "@/lib/db";

// CORS headers for SDK requests from any origin
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

/**
 * OPTIONS /api/sdk/validate
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/**
 * POST /api/sdk/validate
 * Validates an API key and checks rate limits
 */
export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get("X-API-Key");

        if (!apiKey) {
            return NextResponse.json(
                { valid: false, error: "API key required" },
                { status: 401, headers: corsHeaders }
            );
        }

        // Check rate limit first
        const rateLimit = await checkRateLimit(apiKey);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    valid: false,
                    error: "Rate limit exceeded",
                    retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
                },
                {
                    status: 429,
                    headers: {
                        ...corsHeaders,
                        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                        "X-RateLimit-Reset": rateLimit.resetAt.toString(),
                        "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
                    },
                }
            );
        }

        // Validate the API key
        const validation = await validateApiKey(apiKey);

        if (!validation.valid) {
            return NextResponse.json(
                { valid: false, error: validation.error || "Invalid API key" },
                { status: 401, headers: corsHeaders }
            );
        }

        // Return validation result with rate limit headers
        return NextResponse.json(
            {
                valid: true,
                merchantId: validation.merchantId,
                merchantWallet: validation.merchantWallet,
                merchantName: validation.merchantName,
                tier: validation.tier,
                rateLimit: validation.rateLimit,
            },
            {
                headers: {
                    ...corsHeaders,
                    "X-RateLimit-Limit": (validation.rateLimit || 60).toString(),
                    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
                    "X-RateLimit-Reset": rateLimit.resetAt.toString(),
                },
            }
        );
    } catch (error) {
        console.error("API key validation error:", error);
        return NextResponse.json(
            { valid: false, error: "Validation failed" },
            { status: 500, headers: corsHeaders }
        );
    }
}
