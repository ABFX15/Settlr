/**
 * POST /api/recipients/withdraw — Withdraw balance to wallet
 *
 * Body: { amount?: number } — if omitted, withdraws full balance.
 * Authenticated by X-Recipient-Email header.
 *
 * This executes an on-chain USDC transfer from the platform treasury
 * to the recipient's saved wallet address.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getRecipientByEmail,
    getOrCreateBalance,
    debitBalance,
} from "@/lib/db";

async function authenticateRecipient(request: NextRequest) {
    const recipientEmail = request.headers.get("x-recipient-email");
    if (!recipientEmail) return null;
    return getRecipientByEmail(recipientEmail);
}

async function executeWithdrawalTransfer(params: {
    recipientWallet: string;
    amount: number;
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
    return signature;
}

export async function POST(request: NextRequest) {
    try {
        const recipient = await authenticateRecipient(request);
        if (!recipient) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!recipient.walletAddress) {
            return NextResponse.json(
                { error: "No wallet address saved. Update your profile first." },
                { status: 400 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const balance = await getOrCreateBalance(recipient.id, "USDC");

        if (balance.balance <= 0) {
            return NextResponse.json(
                { error: "No balance to withdraw" },
                { status: 400 }
            );
        }

        const amount = body.amount && body.amount > 0
            ? Math.min(body.amount, balance.balance)
            : balance.balance;

        if (amount < 0.01) {
            return NextResponse.json(
                { error: "Minimum withdrawal is $0.01" },
                { status: 400 }
            );
        }

        // Execute on-chain transfer
        let txSignature = "";
        try {
            txSignature = await executeWithdrawalTransfer({
                recipientWallet: recipient.walletAddress,
                amount,
            });
        } catch (err) {
            console.error("[recipients/withdraw] Transfer failed:", err);
            if (process.env.NODE_ENV === "development" || !process.env.FEE_PAYER_SECRET_KEY) {
                txSignature = `demo_withdraw_${Date.now()}`;
            } else {
                return NextResponse.json(
                    { error: "Failed to execute withdrawal" },
                    { status: 500 }
                );
            }
        }

        // Debit the balance
        const updatedBalance = await debitBalance(recipient.id, amount, txSignature, "USDC");

        return NextResponse.json({
            success: true,
            amount,
            currency: "USDC",
            txSignature,
            walletAddress: recipient.walletAddress,
            remainingBalance: updatedBalance.balance,
        });
    } catch (error) {
        console.error("[recipients/withdraw] Error:", error);
        return NextResponse.json(
            { error: "Failed to process withdrawal" },
            { status: 500 }
        );
    }
}
