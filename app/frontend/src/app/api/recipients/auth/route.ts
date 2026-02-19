/**
 * POST /api/recipients/auth — Request a magic link for recipient dashboard
 * GET  /api/recipients/auth?token=xxx — Validate magic link and return session
 *
 * No API key required — public endpoint for recipients.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getRecipientByEmail,
    createRecipientAuthToken,
    validateRecipientAuthToken,
} from "@/lib/db";
import { sendAuthLinkEmail } from "@/lib/email";

const CLAIM_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";

/**
 * POST /api/recipients/auth
 * Body: { email: string }
 * Sends a magic link to the recipient's email.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 }
            );
        }

        // Check if this email is a known recipient
        const recipient = await getRecipientByEmail(email);
        if (!recipient) {
            // Don't reveal whether the email exists — always return success
            return NextResponse.json({ ok: true, message: "If you have received payouts, check your email for a sign-in link." });
        }

        // Generate magic link token
        const token = await createRecipientAuthToken(email);
        if (!token) {
            return NextResponse.json(
                { error: "Failed to generate auth link" },
                { status: 500 }
            );
        }

        const authUrl = `${CLAIM_BASE_URL}/me?token=${token}`;

        // Send magic link email
        await sendAuthLinkEmail({ to: email, authUrl });

        return NextResponse.json({
            ok: true,
            message: "If you have received payouts, check your email for a sign-in link.",
        });
    } catch (error) {
        console.error("[recipients/auth] Error:", error);
        return NextResponse.json(
            { error: "Failed to send auth link" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/recipients/auth?token=xxx
 * Validates the magic link token and returns recipient info.
 * The frontend stores the recipientId as a session identifier.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        const recipient = await validateRecipientAuthToken(token);
        if (!recipient) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            id: recipient.id,
            email: recipient.email,
            walletAddress: recipient.walletAddress,
            displayName: recipient.displayName,
            notificationsEnabled: recipient.notificationsEnabled,
            autoWithdraw: recipient.autoWithdraw,
            totalReceived: recipient.totalReceived,
            totalPayouts: recipient.totalPayouts,
            createdAt: recipient.createdAt.toISOString(),
            lastPayoutAt: recipient.lastPayoutAt?.toISOString(),
        });
    } catch (error) {
        console.error("[recipients/auth] Error validating token:", error);
        return NextResponse.json(
            { error: "Failed to validate token" },
            { status: 500 }
        );
    }
}
