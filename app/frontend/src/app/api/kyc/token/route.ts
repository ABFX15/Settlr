import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, KYC_LEVELS, KYCLevel } from "@/lib/sumsub";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/kyc/token
 * 
 * Generate a Sumsub access token for the WebSDK
 * 
 * Body:
 *   - userId: string (wallet address or email)
 *   - customerId: string (alternative to userId - wallet address)
 *   - merchantId: string (used with customerId to create unique ID)
 *   - level/levelName: KYCLevel (default: basic)
 */
export async function POST(request: NextRequest) {
    try {
        const rateLimited = await checkRateLimit(`kyc:${getClientIp(request)}`);
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const { userId, customerId, merchantId, level, levelName, kyb } = body;

        // Support both userId and customerId:merchantId formats
        const externalUserId = userId || (customerId && merchantId ? `${customerId}:${merchantId}` : customerId);

        if (!externalUserId) {
            return NextResponse.json(
                { error: "userId or customerId is required" },
                { status: 400 }
            );
        }

        // Business verification (merchant verifying their own company) uses the
        // KYB level regardless of any client-supplied level — the client can't
        // know the env-configured level name. Otherwise validate level if given.
        const requestedLevel = levelName || level;
        const kycLevel: KYCLevel = kyb
            ? KYC_LEVELS.KYB
            : requestedLevel && Object.values(KYC_LEVELS).includes(requestedLevel)
                ? requestedLevel
                : KYC_LEVELS.BASIC;

        // Check if Sumsub is configured
        if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
            return NextResponse.json(
                { error: "KYC service not configured" },
                { status: 503 }
            );
        }

        logger.info(`[KYC Token] Generating token for ${externalUserId} with level ${kycLevel}`);

        const result = await generateAccessToken(externalUserId, kycLevel);

        logger.info(`[KYC Token] Token generated successfully for ${result.userId}`);

        return NextResponse.json({
            token: result.token,
            userId: result.userId,
            applicantId: result.userId, // For compatibility
        });
    } catch (error) {
        logger.error("[KYC Token] Error generating token:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to generate KYC token", details: message },
            { status: 500 }
        );
    }
}