import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, KYC_LEVELS, KYCLevel } from "@/lib/sumsub";

/**
 * POST /api/kyc/token
 * 
 * Generate a Sumsub access token for the WebSDK
 * 
 * Body:
 *   - userId: string (wallet address or email)
 *   - level?: KYCLevel (default: basic)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, level } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        // Validate level if provided
        const kycLevel: KYCLevel = level && Object.values(KYC_LEVELS).includes(level)
            ? level
            : KYC_LEVELS.BASIC;

        // Check if Sumsub is configured
        if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
            return NextResponse.json(
                { error: "KYC service not configured" },
                { status: 503 }
            );
        }

        const result = await generateAccessToken(userId, kycLevel);

        return NextResponse.json({
            token: result.token,
            userId: result.userId,
        });
    } catch (error) {
        console.error("Error generating KYC token:", error);
        return NextResponse.json(
            { error: "Failed to generate KYC token" },
            { status: 500 }
        );
    }
}
