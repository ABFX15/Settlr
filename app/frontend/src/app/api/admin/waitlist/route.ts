import { NextRequest, NextResponse } from "next/server";
import { getWaitlist, updateWaitlistStatus } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";

function isAuthorized(request: NextRequest): boolean {
    const auth = request.headers.get("authorization");
    if (!auth) return false;
    const token = auth.replace("Bearer ", "");
    return !!ADMIN_SECRET && token === ADMIN_SECRET;
}

/**
 * GET /api/admin/waitlist — List all waitlist entries
 */
export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const entries = await getWaitlist();
        return NextResponse.json({ entries, total: entries.length });
    } catch (error) {
        console.error("Admin waitlist list error:", error);
        return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/waitlist — Approve or update a waitlist entry
 * Body: { email: string, status: "invited" | "active" | "pending" }
 */
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, status } = body;

        if (!email || !status) {
            return NextResponse.json({ error: "email and status are required" }, { status: 400 });
        }

        if (!["pending", "invited", "active"].includes(status)) {
            return NextResponse.json({ error: "status must be pending, invited, or active" }, { status: 400 });
        }

        const updated = await updateWaitlistStatus(email, status);
        if (!updated) {
            return NextResponse.json({ error: "Entry not found" }, { status: 404 });
        }

        // Send invite email when approving
        if (status === "invited" || status === "active") {
            const loginUrl = `${APP_URL}/dashboard`;
            await sendEmail({
                to: email,
                subject: "You're approved — welcome to Settlr",
                html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="background: #1B6B4A; color: #fff; width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px;">✓</div>
                        <h1 style="color: #0C1829; font-size: 24px; margin: 0;">You're in.</h1>
                    </div>
                    <p style="color: #3B4963; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                        Your access to Settlr has been approved. You can now sign in and set up your non-custodial settlement account.
                    </p>
                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${loginUrl}" style="display: inline-block; background: #1B6B4A; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                            Sign in to Settlr →
                        </a>
                    </div>
                    <p style="color: #7C8A9E; font-size: 13px; line-height: 1.5;">
                        Use the same email you applied with to sign in. We'll walk you through connecting a wallet and creating your settlement vault.
                    </p>
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
                    <p style="color: #7C8A9E; font-size: 12px; text-align: center;">
                        Settlr — Non-custodial USDC settlement for high-risk industries
                    </p>
                </div>`,
                text: `You're approved for Settlr! Sign in at ${loginUrl} using the same email you applied with.`,
            });
        }

        return NextResponse.json({ success: true, email, status });
    } catch (error) {
        console.error("Admin waitlist update error:", error);
        return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }
}
