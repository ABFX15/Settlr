import { NextRequest, NextResponse } from "next/server";
import { claimInviteForWallet } from "@/lib/db";

/**
 * POST /api/waitlist/claim-invite
 * Body: { token: string, wallet: string }
 *
 * Securely binds an invite token to a wallet so future access checks are wallet-only.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = String(body?.token || "").trim();
        const wallet = String(body?.wallet || "").trim();

        if (!token || !wallet) {
            return NextResponse.json(
                { error: "token and wallet are required" },
                { status: 400 }
            );
        }

        if (!/^[a-f0-9]{64}$/.test(token)) {
            return NextResponse.json(
                { error: "Invalid token format" },
                { status: 400 }
            );
        }

        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        if (!solanaAddressRegex.test(wallet)) {
            return NextResponse.json(
                { error: "Invalid wallet address" },
                { status: 400 }
            );
        }

        const result = await claimInviteForWallet(token, wallet);

        if (!result.ok) {
            const status = result.reason === "not_found" ? 404 : 409;
            return NextResponse.json(
                { error: result.message || "Failed to claim invite" },
                { status }
            );
        }

        return NextResponse.json({
            success: true,
            email: result.email,
            wallet,
        });
    } catch (error) {
        console.error("[waitlist/claim-invite] error:", error);
        return NextResponse.json(
            { error: "Failed to claim invite" },
            { status: 500 }
        );
    }
}
