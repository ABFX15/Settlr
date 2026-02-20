/**
 * POST /api/payouts/batch — Create multiple payouts at once
 */

import { NextRequest, NextResponse } from "next/server";
import { createPayoutBatch, validateApiKey, getOrCreateMerchantBalance, reservePayoutFunds, calculatePayoutFee } from "@/lib/db";
import { sendPayoutClaimEmail } from "@/lib/email";
import { dispatchWebhookEvent } from "@/lib/webhooks";

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

        // ── Pre-flight: check total balance for entire batch ──
        const totalAmount = payouts.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
        const totalFees = payouts.reduce((sum: number, p: { amount: number }) => sum + calculatePayoutFee(p.amount), 0);
        const totalRequired = totalAmount + totalFees;

        const balance = await getOrCreateMerchantBalance(validation.merchantId);
        if (balance.available < totalRequired) {
            return NextResponse.json(
                {
                    error: "Insufficient balance for batch",
                    details: `Required: $${totalRequired.toFixed(2)} (payouts: $${totalAmount.toFixed(2)} + fees: $${totalFees.toFixed(2)}). Available: $${balance.available.toFixed(2)}`,
                    balance: { available: balance.available, required: totalRequired },
                    fundingUrl: "/api/treasury/deposit",
                },
                { status: 402 }
            );
        }

        // Reserve funds for each payout individually
        for (const p of payouts) {
            const fee = calculatePayoutFee(p.amount);
            const reservation = await reservePayoutFunds(
                validation.merchantId,
                p.amount,
                fee,
                `batch_pre_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            );
            if (!reservation.success) {
                return NextResponse.json(
                    { error: "Insufficient balance during batch reservation", details: reservation.error },
                    { status: 402 }
                );
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

        // Dispatch batch.created webhook (non-blocking)
        dispatchWebhookEvent(validation.merchantId, "batch.created", {
            batchId: result.batch.id,
            totalAmount: result.batch.totalAmount,
            count: result.batch.count,
            payoutIds: result.payouts.map((p: { id: string }) => p.id),
            createdAt: result.batch.createdAt.toISOString(),
        }).catch((err) => console.error("[webhooks] dispatch error:", err));

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
