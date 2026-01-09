import { NextRequest, NextResponse } from "next/server";
import { getApplicantByExternalId, isUserVerified } from "@/lib/sumsub";

/**
 * GET /api/kyc/status?userId=xxx
 * 
 * Check KYC verification status for a user
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        // Check if Sumsub is configured
        if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
            // If not configured, treat everyone as verified (KYC disabled)
            return NextResponse.json({
                verified: true,
                status: "disabled",
                message: "KYC service not configured",
            });
        }

        const verified = await isUserVerified(userId);
        const applicant = await getApplicantByExternalId(userId);

        return NextResponse.json({
            verified,
            status: applicant?.review?.reviewStatus || "not_started",
            applicantId: applicant?.id || null,
        });
    } catch (error) {
        console.error("Error checking KYC status:", error);
        return NextResponse.json(
            { error: "Failed to check KYC status" },
            { status: 500 }
        );
    }
}
