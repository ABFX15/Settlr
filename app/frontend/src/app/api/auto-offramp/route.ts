import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auto-offramp — Trigger automatic off-ramp after a payment
 *
 * Supports two modes:
 *   1. Instant: Off-ramp each payment immediately (good for small/medium)
 *   2. Batch:   Accumulate payments and off-ramp when threshold is reached
 *               (saves fees for frequent payments, better for large merchants)
 *
 * Body:
 *   merchantWallet: string   — The merchant who received payment
 *   amount: number           — USDC amount to off-ramp
 *   txSignature: string      — On-chain payment signature (proof)
 */

async function getMerchantSettings(wallet: string) {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(
            `${baseUrl}/api/merchant/settings?wallet=${wallet}`,
        );
        if (res.ok) return res.json();
        return null;
    } catch {
        return null;
    }
}

interface OfframpResult {
    id: string;
    status: "initiated" | "pending" | "batched" | "failed";
    provider: string;
    amount: number;
    currency: string;
    method: string;
    estimatedArrival: string;
    batchInfo?: {
        accumulated: number;
        threshold: number;
        paymentCount: number;
        willTriggerAt: number;
    };
}

// In-memory log of off-ramp events
const offrampLog: {
    id: string;
    merchantWallet: string;
    amount: number;
    currency: string;
    provider: string;
    method: string;
    txSignature: string;
    status: "initiated" | "batched" | "processing" | "completed" | "failed";
    batchId?: string;
    createdAt: string;
}[] = [];

// In-memory batch accumulator per merchant
const batchAccumulator: Map<
    string,
    { total: number; payments: { amount: number; txSignature: string }[] }
> = new Map();

function initiateOfframp(
    offrampId: string,
    amount: number,
    autoOfframp: {
        provider: string;
        currency: string;
        method: string;
    },
): OfframpResult {
    switch (autoOfframp.provider) {
        case "sphere": {
            return {
                id: offrampId,
                status: "initiated",
                provider: "sphere",
                amount,
                currency: autoOfframp.currency,
                method: autoOfframp.method,
                estimatedArrival:
                    autoOfframp.method === "ach"
                        ? "1-2 business days"
                        : autoOfframp.method === "wire"
                            ? "Same day"
                            : "Instant",
            };
        }
        case "moonpay": {
            return {
                id: offrampId,
                status: "initiated",
                provider: "moonpay",
                amount,
                currency: autoOfframp.currency,
                method: autoOfframp.method,
                estimatedArrival: "1-3 business days",
            };
        }
        case "manual":
        default: {
            return {
                id: offrampId,
                status: "pending",
                provider: "manual",
                amount,
                currency: autoOfframp.currency,
                method: autoOfframp.method,
                estimatedArrival: "Manual processing",
            };
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { merchantWallet, amount, txSignature } = body;

        if (
            !merchantWallet ||
            typeof merchantWallet !== "string" ||
            merchantWallet.length < 32
        ) {
            return NextResponse.json(
                { error: "Valid merchantWallet required" },
                { status: 400 },
            );
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be positive" },
                { status: 400 },
            );
        }
        if (!txSignature || typeof txSignature !== "string") {
            return NextResponse.json(
                { error: "Transaction signature required" },
                { status: 400 },
            );
        }

        const settings = await getMerchantSettings(merchantWallet);
        if (!settings || !settings.autoOfframp?.enabled) {
            return NextResponse.json({
                triggered: false,
                reason: "Auto off-ramp not enabled for this merchant",
            });
        }

        const { autoOfframp } = settings;
        const offrampId = `ofr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // ── Batch mode ──
        // If the merchant has a batchThreshold set and this payment alone
        // doesn't exceed it, accumulate until the threshold is reached.
        const batchThreshold = autoOfframp.batchThreshold || 0;

        if (batchThreshold > 0 && amount < batchThreshold) {
            const existing = batchAccumulator.get(merchantWallet) || {
                total: 0,
                payments: [],
            };
            existing.total += amount;
            existing.payments.push({ amount, txSignature });
            batchAccumulator.set(merchantWallet, existing);

            // Log as batched
            offrampLog.push({
                id: offrampId,
                merchantWallet,
                amount,
                currency: autoOfframp.currency,
                provider: autoOfframp.provider,
                method: autoOfframp.method,
                txSignature,
                status: "batched",
                createdAt: new Date().toISOString(),
            });

            // Check if accumulated total now exceeds threshold
            if (existing.total >= batchThreshold) {
                // Flush the batch — initiate one large off-ramp
                const batchAmount = existing.total;
                const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                const result = initiateOfframp(batchId, batchAmount, autoOfframp);

                // Log the batch flush
                offrampLog.push({
                    id: batchId,
                    merchantWallet,
                    amount: batchAmount,
                    currency: autoOfframp.currency,
                    provider: autoOfframp.provider,
                    method: autoOfframp.method,
                    txSignature: `batch:${existing.payments.length} payments`,
                    status: "initiated",
                    batchId,
                    createdAt: new Date().toISOString(),
                });

                // Clear the accumulator
                batchAccumulator.delete(merchantWallet);

                console.log(
                    `[auto-offramp] Batch flushed: $${batchAmount} (${existing.payments.length} payments) via ${autoOfframp.provider} for ${merchantWallet.slice(0, 8)}…`,
                );

                return NextResponse.json({
                    triggered: true,
                    mode: "batch-flush",
                    offramp: result,
                });
            }

            console.log(
                `[auto-offramp] Batched: +$${amount} → $${existing.total}/$${batchThreshold} for ${merchantWallet.slice(0, 8)}…`,
            );

            return NextResponse.json({
                triggered: false,
                mode: "batch-accumulating",
                batchInfo: {
                    accumulated: existing.total,
                    threshold: batchThreshold,
                    paymentCount: existing.payments.length,
                    remaining: batchThreshold - existing.total,
                },
            });
        }

        // ── Instant mode ──
        // Check minimum amount threshold
        if (amount < (autoOfframp.minAmount || 0)) {
            return NextResponse.json({
                triggered: false,
                reason: `Amount $${amount} below minimum threshold $${autoOfframp.minAmount}`,
            });
        }

        const result = initiateOfframp(offrampId, amount, autoOfframp);

        offrampLog.push({
            id: offrampId,
            merchantWallet,
            amount,
            currency: autoOfframp.currency,
            provider: autoOfframp.provider,
            method: autoOfframp.method,
            txSignature,
            status: "initiated",
            createdAt: new Date().toISOString(),
        });

        console.log(
            `[auto-offramp] Initiated: $${amount} USDC → ${autoOfframp.currency} via ${autoOfframp.provider} (${autoOfframp.method}) for ${merchantWallet.slice(0, 8)}…`,
        );

        return NextResponse.json({
            triggered: true,
            mode: "instant",
            offramp: result,
        });
    } catch (err) {
        console.error("[auto-offramp] POST error:", err);
        return NextResponse.json(
            { error: "Failed to trigger auto off-ramp" },
            { status: 500 },
        );
    }
}

/** GET /api/auto-offramp?wallet=xxx — List off-ramp events + batch status */
export async function GET(request: NextRequest) {
    const wallet = request.nextUrl.searchParams.get("wallet");
    if (!wallet || wallet.length < 32) {
        return NextResponse.json(
            { error: "Missing wallet parameter" },
            { status: 400 },
        );
    }

    const events = offrampLog.filter((e) => e.merchantWallet === wallet);
    const batch = batchAccumulator.get(wallet);

    return NextResponse.json({
        events,
        total: events.length,
        pendingBatch: batch
            ? {
                accumulated: batch.total,
                paymentCount: batch.payments.length,
            }
            : null,
    });
}
