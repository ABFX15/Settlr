/**
 * POST /api/affiliates/pay — wallet-authenticated instant USDC payouts.
 *
 * Powers the dashboard "Affiliate Payouts" + "Instant Cashout" flows: pay one
 * or many recipients in USDC by email. Each gets a claim link (and email);
 * they claim with any wallet. Same rails as the SDK payout API, but authed by
 * the operator's connected wallet instead of an API key.
 *
 * Body: { wallet, type?, payouts: [{ email, amount, memo? }] }
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createPayout } from "@/lib/db";
import { sendPayoutClaimEmail } from "@/lib/email";
import { requireMerchantSession } from "@/lib/merchant-auth";

interface PayoutInput {
    email?: string;
    amount?: number;
    memo?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Auth: the operator must be signed in. The merchant whose treasury is
        // charged comes from the verified session — NOT a request param — so a
        // caller cannot pay out of another merchant's balance.
        const session = await requireMerchantSession(request);
        if (!session) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { payouts, type } = body as {
            payouts?: PayoutInput[];
            type?: string;
        };

        if (!Array.isArray(payouts) || payouts.length === 0) {
            return NextResponse.json(
                { error: "payouts array is required" },
                { status: 400 },
            );
        }
        if (payouts.length > 500) {
            return NextResponse.json(
                { error: "Max 500 payouts per request" },
                { status: 400 },
            );
        }

        const merchant = {
            id: session.merchantId,
            name: session.merchantName,
        };
        const wallet = session.merchantWallet;
        const kind = type === "cashout" ? "cashout" : "affiliate";

        const results = [];
        for (const p of payouts) {
            const email = (p.email || "").trim();
            const amount = Number(p.amount);
            if (
                !email.includes("@") ||
                !Number.isFinite(amount) ||
                amount <= 0 ||
                amount > 100_000
            ) {
                results.push({
                    email,
                    amount: p.amount,
                    ok: false,
                    error: "Invalid email or amount (max $100,000)",
                });
                continue;
            }
            try {
                const payout = await createPayout({
                    merchantId: merchant.id,
                    merchantWallet: wallet,
                    email,
                    amount,
                    currency: "USDC",
                    memo: p.memo || undefined,
                    metadata: { type: kind },
                });
                // Notify the recipient (best-effort).
                sendPayoutClaimEmail({
                    to: email,
                    amount,
                    currency: "USDC",
                    memo: p.memo,
                    claimUrl: payout.claimUrl,
                    merchantName: merchant.name,
                    expiresAt: payout.expiresAt,
                }).catch(() => {});
                results.push({
                    email,
                    amount,
                    ok: true,
                    id: payout.id,
                    claimUrl: payout.claimUrl,
                });
            } catch (err) {
                logger.error("[affiliates/pay] create failed:", err);
                results.push({
                    email,
                    amount,
                    ok: false,
                    error: err instanceof Error ? err.message : "Payout failed",
                });
            }
        }

        const paid = results.filter((r) => r.ok).length;
        const total = results
            .filter((r) => r.ok)
            .reduce((s, r) => s + (r.amount as number), 0);
        return NextResponse.json({ results, paid, total });
    } catch (err) {
        logger.error("[affiliates/pay] error:", err);
        return NextResponse.json(
            { error: "Failed to send payouts" },
            { status: 500 },
        );
    }
}
