/**
 * GET /api/payouts/[id] — Get a payout by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayoutById, validateApiKey } from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Authenticate
        const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 401 });
        }

        const validation = await validateApiKey(apiKey);
        if (!validation.valid || !validation.merchantId) {
            return NextResponse.json({ error: validation.error || "Invalid API key" }, { status: 401 });
        }

        const payout = await getPayoutById(id);
        if (!payout) {
            return NextResponse.json({ error: "Payout not found" }, { status: 404 });
        }

        // Ensure the payout belongs to this merchant
        if (payout.merchantId !== validation.merchantId) {
            return NextResponse.json({ error: "Payout not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: payout.id,
            email: payout.email,
            amount: payout.amount,
            currency: payout.currency,
            memo: payout.memo,
            metadata: payout.metadata,
            status: payout.status,
            recipientWallet: payout.recipientWallet,
            txSignature: payout.txSignature,
            claimUrl: payout.claimUrl,
            batchId: payout.batchId,
            createdAt: payout.createdAt.toISOString(),
            fundedAt: payout.fundedAt?.toISOString(),
            claimedAt: payout.claimedAt?.toISOString(),
            expiresAt: payout.expiresAt.toISOString(),
        });
    } catch (error) {
        console.error("[payouts] Error fetching payout:", error);
        return NextResponse.json(
            { error: "Failed to fetch payout" },
            { status: 500 }
        );
    }
}
