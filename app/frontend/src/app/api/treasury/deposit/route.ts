/**
 * POST /api/treasury/deposit — Generate deposit instructions or record a deposit
 *
 * Body: { amount?: number, txSignature?: string, wallet?: string }
 *
 * Two modes:
 * 1. No txSignature: Returns deposit address + instructions for the merchant to send USDC
 * 2. With txSignature: Records a confirmed deposit and credits the merchant balance
 *
 * Authentication: X-API-Key header OR wallet field in body (dashboard)
 */

import { NextRequest, NextResponse } from "next/server";
import {
    validateApiKey,
    getOrCreateMerchantBalance,
    getOrCreateMerchantByWallet,
    creditMerchantBalance,
} from "@/lib/db";
import { dispatchWebhookEvent } from "@/lib/webhooks";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Authenticate — wallet field (dashboard) or API key (SDK)
        let merchantId: string | undefined;

        if (body.wallet && typeof body.wallet === "string" && body.wallet.length >= 32) {
            // Dashboard auth: resolve wallet address to merchant UUID
            const merchant = await getOrCreateMerchantByWallet(body.wallet);
            merchantId = merchant.id;
        } else {
            const apiKey =
                request.headers.get("x-api-key") ||
                request.headers.get("authorization")?.replace("Bearer ", "");
            if (!apiKey) {
                return NextResponse.json({ error: "Missing API key or wallet" }, { status: 401 });
            }

            const validation = await validateApiKey(apiKey);
            if (!validation.valid || !validation.merchantId) {
                return NextResponse.json(
                    { error: validation.error || "Invalid API key" },
                    { status: 401 }
                );
            }
            merchantId = validation.merchantId;
        }

        const { amount, txSignature } = body;

        // Mode 1: Generate deposit instructions
        if (!txSignature) {
            const balance = await getOrCreateMerchantBalance(merchantId!);

            // The deposit address is the merchant's own wallet address.
            // Users fund their treasury by sending USDC to their connected wallet.
            const depositAddress = body.wallet || "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV";

            const usdcMint =
                process.env.USDC_MINT ||
                "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

            return NextResponse.json({
                depositAddress,
                usdcMint,
                network: "solana",
                cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet",
                currency: "USDC",
                currentBalance: {
                    available: balance.available,
                    pending: balance.pending,
                    reserved: balance.reserved,
                },
                instructions: `Send USDC (SPL Token) to ${depositAddress} on Solana ${process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet"}. After sending, call this endpoint again with the txSignature to confirm.`,
            });
        }

        // Mode 2: Record a confirmed deposit
        if (typeof txSignature !== "string" || txSignature.length < 10) {
            return NextResponse.json(
                { error: "Valid txSignature is required" },
                { status: 400 }
            );
        }

        // Validate amount
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be a positive number" },
                { status: 400 }
            );
        }

        if (amount > 1_000_000) {
            return NextResponse.json(
                { error: "Maximum single deposit is $1,000,000" },
                { status: 400 }
            );
        }

        // In production, we would verify the transaction on-chain:
        // 1. Fetch the transaction by signature
        // 2. Verify it's a USDC transfer to our deposit address
        // 3. Verify the amount matches
        // 4. Verify it's confirmed/finalized
        // For now, we trust the reported amount (dev mode)

        let verified = false;
        let verifiedAmount = amount;

        try {
            // Attempt on-chain verification
            const { Connection } = await import("@solana/web3.js");
            const rpcUrl =
                process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
                "https://api.devnet.solana.com";
            const connection = new Connection(rpcUrl, "confirmed");

            const tx = await connection.getTransaction(txSignature, {
                maxSupportedTransactionVersion: 0,
            });

            if (tx && tx.meta && !tx.meta.err) {
                verified = true;
                // In production: parse token transfer amounts from tx.meta.postTokenBalances
                // For now, trust the reported amount
            }
        } catch (err) {
            console.warn("[treasury/deposit] On-chain verification failed, using reported amount:", err);
            // In dev/demo mode, accept without verification
            if (process.env.NODE_ENV === "development" || !process.env.FEE_PAYER_SECRET_KEY) {
                verified = true;
            }
        }

        if (!verified) {
            return NextResponse.json(
                { error: "Could not verify transaction. Ensure it is confirmed on-chain." },
                { status: 400 }
            );
        }

        // Credit the merchant balance
        const updatedBalance = await creditMerchantBalance(
            merchantId!,
            verifiedAmount,
            {
                txSignature,
                description: `Deposit of ${verifiedAmount} USDC (tx: ${txSignature.slice(0, 12)}...)`,
            }
        );

        // Dispatch deposit.confirmed webhook
        dispatchWebhookEvent(merchantId!, "deposit.confirmed", {
            amount: verifiedAmount,
            currency: "USDC",
            txSignature,
            balanceAfter: updatedBalance.available,
            totalDeposited: updatedBalance.totalDeposited,
        }).catch((err) => console.error("[webhooks] dispatch error:", err));

        return NextResponse.json({
            status: "credited",
            amount: verifiedAmount,
            currency: "USDC",
            txSignature,
            balance: {
                available: updatedBalance.available,
                pending: updatedBalance.pending,
                reserved: updatedBalance.reserved,
                totalDeposited: updatedBalance.totalDeposited,
            },
        });
    } catch (error) {
        console.error("[treasury/deposit] Error:", error);
        return NextResponse.json(
            { error: "Failed to process deposit" },
            { status: 500 }
        );
    }
}
