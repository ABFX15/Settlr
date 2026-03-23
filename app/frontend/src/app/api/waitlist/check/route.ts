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

        const { approved } = await checkWaitlistAccess(wallet);

        // Also check if they have a pending entry
        const entry = await getWaitlistByWallet(wallet);
        const pending = entry ? entry.status === "pending" : false;

        return NextResponse.json({
            approved,
            pending,
            hasEntry: !!entry,
        });
    } catch (error) {
        console.error("Waitlist check error:", error);
        return NextResponse.json(
            { error: "Failed to check access" },
            { status: 500 }
        );
    }
}
