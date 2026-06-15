import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getWaitlist, updateWaitlistStatus } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import { requireAdmin } from "@/lib/admin-auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://offbankpay.com";

/**
 * GET /api/admin/waitlist — List all waitlist entries
 */
export async function GET(request: NextRequest) {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    try {
        const entries = await getWaitlist();
        return NextResponse.json({ entries, total: entries.length });
    } catch (error) {
        logger.error("Admin waitlist list error:", error);
        return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/waitlist — Approve or update a waitlist entry
 * Body: { email: string, status: "invited" | "active" | "pending" }
 */
export async function PATCH(request: NextRequest) {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    try {
        const body = await request.json();
        const { email, status, walletAddress } = body;

        if (!email || !status) {
            return NextResponse.json({ error: "email and status are required" }, { status: 400 });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        if (walletAddress) {
            const wallet = String(walletAddress).trim();
            const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
            if (!solanaAddressRegex.test(wallet)) {
                return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
            }
        }

        if (!["pending", "invited", "active"].includes(status)) {
            return NextResponse.json({ error: "status must be pending, invited, or active" }, { status: 400 });
        }

        const updated = await updateWaitlistStatus(normalizedEmail, status);
        if (!updated) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        // Optionally bind wallet at approval time for stronger access control.
        if (walletAddress) {
            const { linkWalletToWaitlist } = await import("@/lib/db");
            await linkWalletToWaitlist(normalizedEmail, String(walletAddress).trim());
        }

        // Send invite email when approving
        if (status === "invited" || status === "active") {
            // Generate a unique invite token for the magic link
            const inviteToken = crypto.randomBytes(32).toString("hex");
            await updateWaitlistStatus(normalizedEmail, status, inviteToken);

            const loginUrl = `${APP_URL}/onboarding?token=${inviteToken}`;
            const emailSent = await sendEmail({
                to: email,
                subject: "You're approved — welcome to Offbank",
                html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="background: #34c759; color: #fff; width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px;">✓</div>
                        <h1 style="color: #212121; font-size: 24px; margin: 0;">You're in.</h1>
                    </div>
                    <p style="color: #5c5c5c; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                        Your access to Offbank has been approved. Click below to set up your non-custodial settlement account.
                    </p>
                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${loginUrl}" style="display: inline-block; background: #34c759; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                            Sign in to Offbank →
                        </a>
                    </div>
                    <p style="color: #8a8a8a; font-size: 13px; line-height: 1.5;">
                        This link is unique to you. You'll connect a Solana wallet (Phantom or Solflare) and create your settlement vault.
                    </p>
                    <hr style="border: none; border-top: 1px solid #d3d3d3; margin: 32px 0;" />
                    <p style="color: #8a8a8a; font-size: 12px; text-align: center;">
                        Offbank — Non-custodial USDC settlement for high-risk industries
                    </p>
                </div>`,
                text: `You're approved for Offbank! Sign in at ${loginUrl} — this link is unique to you.`,
            });
            if (!emailSent) {
                logger.error(`[admin] Email failed for ${normalizedEmail}. RESEND_API_KEY set: ${!!process.env.RESEND_API_KEY}`);
            }
            return NextResponse.json({ success: true, email: normalizedEmail, status, emailSent, walletAddress: walletAddress || null });
        }

        return NextResponse.json({ success: true, email: normalizedEmail, status, walletAddress: walletAddress || null });
    } catch (error) {
        logger.error("Admin waitlist update error:", error);
        return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }
}
