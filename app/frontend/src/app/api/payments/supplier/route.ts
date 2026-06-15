/**
 * POST /api/payments/supplier — Build a USDC payment to a saved supplier.
 *
 * Non-custodial + gasless: returns a fee-payer-sponsored transaction that the
 * merchant signs with their own wallet (they pay from their own USDC; we never
 * custody it; they spend no SOL). The supplier's wallet is AML-screened first.
 *
 * Body: { wallet (payer), payeeId, amount }  → { transaction, payeeWallet, ... }
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateMerchantByWallet } from "@/lib/db";
import { getPayee } from "@/lib/payees";
import { screenWallet } from "@/lib/range";
import { buildSupplierPaymentTransaction } from "@/lib/supplier-payment";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, payeeId, amount } = body as {
            wallet?: string;
            payeeId?: string;
            amount?: number;
        };

        if (!wallet || wallet.length < 32) {
            return NextResponse.json({ error: "Missing payer wallet" }, { status: 400 });
        }
        if (!payeeId) {
            return NextResponse.json({ error: "payeeId is required" }, { status: 400 });
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "amount must be positive" }, { status: 400 });
        }

        const merchant = await getOrCreateMerchantByWallet(wallet);
        const payee = getPayee(payeeId);
        if (!payee || payee.merchantId !== merchant.id) {
            return NextResponse.json({ error: "Payee not found" }, { status: 404 });
        }

        // AML: screen the recipient before moving funds (mock-safe without a key).
        const screen = await screenWallet(payee.walletAddress);
        if (screen.shouldBlock) {
            logger.warn(
                `[payments/supplier] Blocked recipient ${payee.walletAddress.slice(0, 8)}… (risk ${screen.riskScore})`,
            );
            return NextResponse.json(
                {
                    error: "recipient_blocked",
                    message:
                        "This supplier's wallet was flagged by compliance screening.",
                },
                { status: 403 },
            );
        }

        let build;
        try {
            build = await buildSupplierPaymentTransaction({
                payerWallet: wallet,
                payeeWallet: payee.walletAddress,
                amount,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "build failed";
            if (msg.includes("FEE_PAYER_SECRET_KEY")) {
                return NextResponse.json(
                    { error: "sponsorship_unavailable" },
                    { status: 503 },
                );
            }
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        return NextResponse.json({
            ...build,
            payeeName: payee.name,
        });
    } catch (err) {
        logger.error("[payments/supplier] error:", err);
        return NextResponse.json({ error: "Failed to build payment" }, { status: 500 });
    }
}
