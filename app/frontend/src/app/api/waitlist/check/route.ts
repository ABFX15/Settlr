import { NextRequest, NextResponse } from "next/server";
import { checkWaitlistAccess, getWaitlistByWallet, checkWaitlistByEmail, linkWalletToWaitlist } from "@/lib/db";

/**
 * GET /api/waitlist/check?wallet=xxx&email=yyy
 * Check if a wallet has been approved for access (status = "invited" or "active").
 * If email is provided and wallet has no entry, auto-links wallet to the email's waitlist entry.
 * Also returns whether they have a pending waitlist entry.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get("wallet");
        const email = searchParams.get("email");

        if (!wallet) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            );
        }

        // Validate wallet format
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        if (!solanaAddressRegex.test(wallet)) {
            return NextResponse.json(
                { error: "Invalid wallet address" },
                { status: 400 }
            );
        }

        // 1. Check by wallet first
        const { approved } = await checkWaitlistAccess(wallet);
        const entry = await getWaitlistByWallet(wallet);

        if (entry) {
            // Wallet already linked — return status directly
            const pending = entry.status === "pending";
            return NextResponse.json({ approved, pending, hasEntry: true });
        }

        // 2. No wallet entry — try linking via email if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(email)) {
                const { approved: emailApproved, entry: emailEntry } = await checkWaitlistByEmail(email);

                if (emailEntry && !emailEntry.walletAddress) {
                    // Auto-link wallet to existing email entry
                    await linkWalletToWaitlist(email, wallet);

                    return NextResponse.json({
                        approved: emailApproved,
                        pending: emailEntry.status === "pending",
                        hasEntry: true,
                    });
                }

                if (emailEntry) {
                    // Entry exists but wallet already set (different wallet)
                    return NextResponse.json({
                        approved: emailApproved,
                        pending: emailEntry.status === "pending",
                        hasEntry: true,
                    });
                }
            }
        }

        // 3. No entry by wallet or email
        return NextResponse.json({
            approved: false,
            pending: false,
            hasEntry: false,
        });
    } catch (error) {
        console.error("Waitlist check error:", error);
        return NextResponse.json(
            { error: "Failed to check access" },
            { status: 500 }
        );
    }
}
