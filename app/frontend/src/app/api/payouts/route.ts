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
    getRecipientByEmail,
    claimPayout,
    updateRecipientStats,
    validateApiKey,
    reservePayoutFunds,
    releasePayoutFunds,
    refundReservedFunds,
    calculatePayoutFee,
    type PayoutStatus,
} from "@/lib/db";
import { sendPayoutClaimEmail, sendInstantPayoutEmail } from "@/lib/email";
import { dispatchWebhookEvent } from "@/lib/webhooks";

/**
 * Execute an on-chain USDC transfer for auto-delivery.
 * Extracted so both payout creation (auto) and claim (manual) can use it.
 */
async function executePayoutTransfer(params: {
    recipientWallet: string;
    amount: number;
    payoutId: string;
}): Promise<string> {
    const { Connection, PublicKey, Keypair, Transaction } = await import("@solana/web3.js");
    const {
        getAssociatedTokenAddress,
        createAssociatedTokenAccountInstruction,
        createTransferInstruction,
        getAccount,
    } = await import("@solana/spl-token");

    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    const feePayerSecret = process.env.FEE_PAYER_SECRET_KEY;
    if (!feePayerSecret) throw new Error("FEE_PAYER_SECRET_KEY not configured");

    const feePayerKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(feePayerSecret)));
    const usdcMint = new PublicKey(process.env.USDC_MINT || "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
    const recipientPubkey = new PublicKey(params.recipientWallet);

    const sourceAta = await getAssociatedTokenAddress(usdcMint, feePayerKeypair.publicKey);
    const recipientAta = await getAssociatedTokenAddress(usdcMint, recipientPubkey);

    const tx = new Transaction();
    try {
        await getAccount(connection, recipientAta);
    } catch {
        tx.add(createAssociatedTokenAccountInstruction(feePayerKeypair.publicKey, recipientAta, recipientPubkey, usdcMint));
    }

    tx.add(createTransferInstruction(sourceAta, recipientAta, feePayerKeypair.publicKey, BigInt(Math.round(params.amount * 1_000_000))));

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = feePayerKeypair.publicKey;
    tx.sign(feePayerKeypair);

    const signature = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
    await connection.confirmTransaction(signature, "confirmed");
    console.log(`[payouts] Transfer for ${params.payoutId} executed: ${signature}`);
    return signature;
}

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

        // ── Pre-flight balance check: reserve funds from merchant treasury ──
        const fee = calculatePayoutFee(amount);
        const reservation = await reservePayoutFunds(
            validation.merchantId,
            amount,
            fee,
            `pre_${Date.now()}`, // temporary ID, updated after payout creation
        );

        if (!reservation.success) {
            return NextResponse.json(
                {
                    error: "Insufficient balance",
                    details: reservation.error,
                    balance: reservation.balance ? {
                        available: reservation.balance.available,
                        required: amount + fee,
                        fee,
                    } : undefined,
                    fundingUrl: "/api/treasury/deposit",
                },
                { status: 402 } // Payment Required
            );
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

        // ── Auto-delivery: check if this recipient has a saved wallet ──
        const recipient = await getRecipientByEmail(email);
        if (recipient?.walletAddress && recipient.autoWithdraw) {
            console.log(`[payouts] Auto-delivery: ${email} → ${recipient.walletAddress}`);

            let txSignature = "";
            try {
                txSignature = await executePayoutTransfer({
                    recipientWallet: recipient.walletAddress,
                    amount: payout.amount,
                    payoutId: payout.id,
                });
            } catch (err) {
                console.error("[payouts] Auto-delivery transfer failed:", err);
                // Fallback: dev/demo mode
                if (process.env.NODE_ENV === "development" || !process.env.FEE_PAYER_SECRET_KEY) {
                    txSignature = `demo_auto_${payout.id}_${Date.now()}`;
                }
            }

            if (txSignature) {
                // Mark claimed instantly
                await claimPayout(payout.claimToken, recipient.walletAddress, txSignature);
                await updateRecipientStats(email, payout.amount);

                // Release reserved funds (payout completed)
                await releasePayoutFunds(
                    validation.merchantId,
                    payout.amount,
                    fee,
                    payout.id,
                );

                // Notify recipient
                sendInstantPayoutEmail({
                    to: email,
                    amount: payout.amount,
                    currency: payout.currency,
                    memo: payout.memo,
                    walletAddress: recipient.walletAddress,
                    txSignature,
                    merchantName: validation.merchantName,
                }).catch((err) => console.error("[payouts] Failed to send instant payout email:", err));

                // Dispatch webhook: payout.claimed (auto-delivery)
                dispatchWebhookEvent(validation.merchantId, "payout.claimed", {
                    payoutId: payout.id,
                    email: payout.email,
                    amount: payout.amount,
                    currency: payout.currency,
                    recipientWallet: recipient.walletAddress,
                    txSignature,
                    delivery: "instant",
                    claimedAt: new Date().toISOString(),
                }).catch((err) => console.error("[webhooks] dispatch error:", err));

                return NextResponse.json({
                    id: payout.id,
                    email: payout.email,
                    amount: payout.amount,
                    currency: payout.currency,
                    memo: payout.memo,
                    fee,
                    status: "claimed",
                    delivery: "instant",
                    recipientWallet: recipient.walletAddress,
                    txSignature,
                    createdAt: payout.createdAt.toISOString(),
                    claimedAt: new Date().toISOString(),
                }, { status: 201 });
            }
        }

        // ── Standard flow: send claim email ──
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

        // Dispatch webhook: payout.created
        dispatchWebhookEvent(validation.merchantId, "payout.created", {
            payoutId: payout.id,
            email: payout.email,
            amount: payout.amount,
            currency: payout.currency,
            memo: payout.memo,
            fee,
            status: "sent",
            delivery: "claim_link",
            claimUrl: payout.claimUrl,
            createdAt: payout.createdAt.toISOString(),
            expiresAt: payout.expiresAt.toISOString(),
        }).catch((err) => console.error("[webhooks] dispatch error:", err));

        return NextResponse.json({
            id: payout.id,
            email: payout.email,
            amount: payout.amount,
            currency: payout.currency,
            memo: payout.memo,
            fee,
            status: payout.status,
            delivery: "claim_link",
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
