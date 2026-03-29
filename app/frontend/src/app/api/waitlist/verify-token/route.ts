import { NextRequest, NextResponse } from "next/server";
import { verifyInviteToken } from "@/lib/db";

/**
 * GET /api/waitlist/verify-token?token=xxx
 * Verifies an invite token from the approval email.
 * Returns { valid: true, email } if the token is valid and the user is approved.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token || token.length < 32) {
            return NextResponse.json(
                { valid: false, error: "Invalid token" },
                { status: 400 }
            );
        }

        // Only allow hex characters (crypto.randomBytes output)
        if (!/^[a-f0-9]{64}$/.test(token)) {
            return NextResponse.json(
                { valid: false, error: "Invalid token format" },
                { status: 400 }
            );
        }

        const { valid, email } = await verifyInviteToken(token);

        if (!valid) {
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({ valid: true, email });
    } catch (error) {
        console.error("Token verification error:", error);
        return NextResponse.json(
            { valid: false, error: "Verification failed" },
            { status: 500 }
        );
    }
}
