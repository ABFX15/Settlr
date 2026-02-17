/**
 * POST /api/payouts — Create a new payout
 * GET  /api/payouts — List payouts for the authenticated merchant
 *
 * Authentication: X-API-Key header (validated against merchant API keys)
 */

import { NextRequest, NextResponse } from "next/server";
import {
    createPayout,
    getPayoutsByMerchant,
    validateApiKey,
    type PayoutStatus,
} from "@/lib/db";
import { sendPayoutClaimEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        // Authenticate
        const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 401 });
        }

        const validation = await validateApiKey(apiKey);
        if (!validation.valid || !validation.merchantId || !validation.merchantWallet) {
            return NextResponse.json({ error: validation.error || "Invalid API key" }, { status: 401 });
        }

        const body = await request.json();
        const { email, amount, currency, memo, metadata } = body;

        // Validate required fields
        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
        }
        if (amount < 0.01) {
            return NextResponse.json({ error: "Minimum payout amount is $0.01" }, { status: 400 });
        }
        if (amount > 100_000) {
            return NextResponse.json({ error: "Maximum payout amount is $100,000" }, { status: 400 });
        }

        // Create the payout record
        const payout = await createPayout({
            merchantId: validation.merchantId,
            merchantWallet: validation.merchantWallet,
            email,
            amount,
            currency: currency || "USDC",
            memo,
            metadata,
        });

        // Send claim email (non-blocking — don't fail the request if email fails)
        sendPayoutClaimEmail({
            to: payout.email,
            amount: payout.amount,
            currency: payout.currency,
            memo: payout.memo,
            claimUrl: payout.claimUrl,
            merchantName: validation.merchantName,
            expiresAt: payout.expiresAt,
        }).catch((err) => {
            console.error("[payouts] Failed to send claim email:", err);
        });

        return NextResponse.json({
            id: payout.id,
            email: payout.email,
            amount: payout.amount,
            currency: payout.currency,
            memo: payout.memo,
            status: payout.status,
            claimUrl: payout.claimUrl,
            createdAt: payout.createdAt.toISOString(),
            expiresAt: payout.expiresAt.toISOString(),
        }, { status: 201 });
    } catch (error) {
        console.error("[payouts] Error creating payout:", error);
        return NextResponse.json(
            { error: "Failed to create payout" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 401 });
        }

        const validation = await validateApiKey(apiKey);
        if (!validation.valid || !validation.merchantId) {
            return NextResponse.json({ error: validation.error || "Invalid API key" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as PayoutStatus | null;
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
        const offset = parseInt(searchParams.get("offset") || "0");

        const payouts = await getPayoutsByMerchant(validation.merchantId, {
            status: status || undefined,
            limit,
            offset,
        });

        return NextResponse.json({
            data: payouts.map(p => ({
                id: p.id,
                email: p.email,
                amount: p.amount,
                currency: p.currency,
                memo: p.memo,
                status: p.status,
                recipientWallet: p.recipientWallet,
                txSignature: p.txSignature,
                claimUrl: p.claimUrl,
                createdAt: p.createdAt.toISOString(),
                claimedAt: p.claimedAt?.toISOString(),
                expiresAt: p.expiresAt.toISOString(),
            })),
            count: payouts.length,
            limit,
            offset,
        });
    } catch (error) {
        console.error("[payouts] Error listing payouts:", error);
        return NextResponse.json(
            { error: "Failed to list payouts", data: [] },
            { status: 500 }
        );
    }
}
