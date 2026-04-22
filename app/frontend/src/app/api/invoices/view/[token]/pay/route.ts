/**
 * POST /api/invoices/view/[token]/pay — Record a buyer payment
 *
 * Called by the buyer-facing invoice page after a successful on-chain
 * USDC transfer. Marks the invoice as "paid", records the tx signature,
 * credits the merchant's treasury balance, and creates a payment record
 * so it appears in the transactions page and CSV export.
 *
 * No API-key auth required — the view token itself is the secret.
 * In production you'd verify the on-chain tx against expected amount.
 */

import { NextRequest, NextResponse } from "next/server";
import { explorerUrl, SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";
import { emitEvent } from "@/lib/pipeline";
import {
    getInvoiceByViewToken,
    updateInvoiceStatus,
    creditMerchantBalance,
    getOrCreateMerchantByWallet,
    createPayment,
} from "@/lib/db";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

function extractRawAmountFromParsedInstruction(ix: any): bigint {
    const info = ix?.parsed?.info;
    if (!info) return BigInt(0);

    if (typeof info.amount === "string") {
        return BigInt(info.amount);
    }

    if (info.tokenAmount?.amount && typeof info.tokenAmount.amount === "string") {
        return BigInt(info.tokenAmount.amount);
    }

    return BigInt(0);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const invoice = await getInvoiceByViewToken(token);

        if (!invoice) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        if (invoice.status === "paid") {
            return NextResponse.json(
                { error: "Invoice already paid" },
                { status: 400 }
            );
        }

        if (invoice.status === "cancelled") {
            return NextResponse.json(
                { error: "Invoice has been cancelled" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { paymentSignature, payerWallet } = body;

        if (!paymentSignature || typeof paymentSignature !== "string") {
            return NextResponse.json(
                { error: "paymentSignature is required" },
                { status: 400 }
            );
        }

        // Verify on-chain transaction includes both merchant transfer and platform fee transfer.
        const connection = new Connection(SOLANA_RPC_URL, "confirmed");
        const parsedTx = await connection.getParsedTransaction(paymentSignature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });

        if (!parsedTx || parsedTx.meta?.err) {
            return NextResponse.json(
                { error: "Invalid or failed on-chain transaction" },
                { status: 400 }
            );
        }

        const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
        const merchantWalletPk = new PublicKey(invoice.merchantWallet);
        const merchantAta = await getAssociatedTokenAddress(usdcMint, merchantWalletPk, true);
        const [treasuryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("platform_treasury")],
            PROGRAM_ID,
        );

        const totalLamports = BigInt(Math.round(invoice.total * 1_000_000));
        const platformFee = (totalLamports * BigInt(100)) / BigInt(10000);
        const merchantAmount = totalLamports - platformFee;

        const topLevelTransferIxs = parsedTx.transaction.message.instructions.filter((ix: any) => {
            return (
                ix?.program === "spl-token" &&
                ix?.parsed?.type &&
                (ix.parsed.type === "transfer" || ix.parsed.type === "transferChecked")
            );
        });

        const merchantTransfer = topLevelTransferIxs.find((ix: any) => {
            const destination = ix?.parsed?.info?.destination;
            if (destination !== merchantAta.toBase58()) return false;
            const amount = extractRawAmountFromParsedInstruction(ix);
            return amount >= merchantAmount;
        });

        const treasuryTransfer = topLevelTransferIxs.find((ix: any) => {
            const destination = ix?.parsed?.info?.destination;
            if (destination !== treasuryPDA.toBase58()) return false;
            const amount = extractRawAmountFromParsedInstruction(ix);
            return amount >= platformFee;
        });

        if (!merchantTransfer || !treasuryTransfer) {
            return NextResponse.json(
                {
                    error:
                        "Payment transaction does not include required merchant + platform fee transfers",
                },
                { status: 400 }
            );
        }

        // 1. Mark invoice as paid
        const updated = await updateInvoiceStatus(invoice.id, "paid", {
            paymentSignature,
            payerWallet: payerWallet || undefined,
            paidAt: new Date(),
        });

        // 2. Credit the merchant's treasury balance
        try {
            const merchant = await getOrCreateMerchantByWallet(invoice.merchantWallet);
            await creditMerchantBalance(merchant.id, invoice.total, {
                txSignature: paymentSignature,
                description: `Invoice ${invoice.invoiceNumber} paid by ${invoice.buyerName}`,
            });

            // 3. Create a payment record (shows in transactions page + CSV export)
            const now = Date.now();
            await createPayment({
                sessionId: `inv_${invoice.id}`,
                merchantId: merchant.id,
                merchantName: invoice.merchantName || merchant.name,
                merchantWallet: invoice.merchantWallet,
                customerWallet: payerWallet || "unknown",
                amount: invoice.total,
                currency: invoice.currency || "USDC",
                description: `Invoice #${invoice.invoiceNumber} — ${invoice.buyerName}`,
                txSignature: paymentSignature,
                explorerUrl: explorerUrl(paymentSignature),
                createdAt: now,
                completedAt: now,
                status: "completed",
            });
        } catch (err) {
            // Don't fail the overall request if treasury/payment recording fails
            // The invoice is already marked paid and the on-chain tx is confirmed
            console.error("[invoices/pay] Error crediting treasury or recording payment:", err);
        }

        emitEvent("invoice.paid", "invoice", invoice.id, invoice.merchantId || "", {
            amount: invoice.total, invoiceNumber: invoice.invoiceNumber, paymentSignature, payerWallet,
        }).catch((err) => console.error("[pipeline] emit error:", err));

        return NextResponse.json({
            status: updated?.status || "paid",
            paymentSignature,
        });
    } catch (error) {
        console.error("[invoices/pay] Error recording payment:", error);
        return NextResponse.json(
            { error: "Failed to record payment" },
            { status: 500 }
        );
    }
}
