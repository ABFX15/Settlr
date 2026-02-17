/**
 * POST /api/payouts/batch — Create multiple payouts at once
 */

import { NextRequest, NextResponse } from "next/server";
import { createPayoutBatch, validateApiKey } from "@/lib/db";
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
        const { payouts } = body;

        if (!Array.isArray(payouts) || payouts.length === 0) {
            return NextResponse.json({ error: "payouts must be a non-empty array" }, { status: 400 });
        }
        if (payouts.length > 500) {
            return NextResponse.json({ error: "Maximum 500 payouts per batch" }, { status: 400 });
        }

        // Validate each payout
        for (let i = 0; i < payouts.length; i++) {
            const p = payouts[i];
            if (!p.email || typeof p.email !== "string" || !p.email.includes("@")) {
                return NextResponse.json({ error: `Invalid email at index ${i}` }, { status: 400 });
            }
            if (!p.amount || typeof p.amount !== "number" || p.amount <= 0) {
                return NextResponse.json({ error: `Invalid amount at index ${i}` }, { status: 400 });
            }
        }

        const result = await createPayoutBatch(
            validation.merchantId,
            payouts,
            validation.merchantWallet
        );

        // Send claim emails (non-blocking)
        for (const payout of result.payouts) {
            sendPayoutClaimEmail({
                to: payout.email,
                amount: payout.amount,
                currency: payout.currency,
                memo: payout.memo,
                claimUrl: payout.claimUrl,
                merchantName: validation.merchantName,
                expiresAt: payout.expiresAt,
            }).catch((err) => {
                console.error(`[payouts] Failed to send email for ${payout.id}:`, err);
            });
        }

        return NextResponse.json({
            id: result.batch.id,
            status: result.batch.status,
            total: result.batch.totalAmount,
            count: result.batch.count,
            payouts: result.payouts.map(p => ({
                id: p.id,
                email: p.email,
                amount: p.amount,
                status: p.status,
                claimUrl: p.claimUrl,
            })),
            createdAt: result.batch.createdAt.toISOString(),
        }, { status: 201 });
    } catch (error) {
        console.error("[payouts] Error creating batch:", error);
        return NextResponse.json(
            { error: "Failed to create batch" },
            { status: 500 }
        );
    }
}
