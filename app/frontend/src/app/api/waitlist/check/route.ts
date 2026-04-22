import { NextRequest, NextResponse } from "next/server";
import { checkWaitlistAccess, getWaitlistByWallet } from "@/lib/db";

/**
 * GET /api/waitlist/check?wallet=xxx
 * Check if a wallet has been approved for access (status = "invited" or "active").
 * Also returns whether they have a pending waitlist entry.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get("wallet");

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

        // 2. No entry for this wallet
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
