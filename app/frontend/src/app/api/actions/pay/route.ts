/**
 * Solana Actions endpoint – Settlr Pay Links as Blinks
 *
 * GET  /api/actions/pay?invoice=<viewToken>  → Action metadata (title, icon, label)
 * POST /api/actions/pay?invoice=<viewToken>  → Unsigned USDC transfer transaction
 * OPTIONS /api/actions/pay                   → CORS preflight
 *
 * When a Blinks-compatible client (Phantom, Backpack, Dialect, Twitter)
 * encounters this URL, it renders a payment card. The buyer clicks "Pay",
 * signs the transaction in their wallet, and USDC settles instantly.
 *
 * Reference: https://solana.com/docs/advanced/actions
 */

import { NextRequest } from "next/server";
import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddressSync,
    createTransferInstruction,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getInvoiceByViewToken, updateInvoiceStatus } from "@/lib/db";
import { actionsResponse, actionsOptions } from "./helpers";

/* ─── Config ─── */
const RPC_ENDPOINT =
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_MINT = new PublicKey(
    process.env.USDC_MINT_ADDRESS ||
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
const USDC_DECIMALS = 6;
const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";

/* ─── Memo program (for on-chain invoice reference) ─── */
const MEMO_PROGRAM_ID = new PublicKey(
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

/* ─── Helpers ─── */
function formatUSD(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(amount);
}

function getInvoiceToken(request: NextRequest): string | null {
    return new URL(request.url).searchParams.get("invoice");
}

/* ═════════════════════════════════════════════════════════════════════
 * OPTIONS — CORS preflight
 * ═════════════════════════════════════════════════════════════════════ */
export async function OPTIONS() {
    return actionsOptions();
}

/* ═════════════════════════════════════════════════════════════════════
 * GET — Return action metadata so Blinks clients can render the card
 * ═════════════════════════════════════════════════════════════════════ */
export async function GET(request: NextRequest) {
    const token = getInvoiceToken(request);
    if (!token) {
        return actionsResponse(
            {
                type: "action",
                icon: `${APP_URL}/settlr-logo.png`,
                title: "Settlr — Instant Business Payments",
                description:
                    "This payment link is missing an invoice reference. Ask the sender for a valid link.",
                label: "Invalid Link",
                disabled: true,
                error: { message: "Missing invoice parameter" },
            },
            400
        );
    }

    const invoice = await getInvoiceByViewToken(token);
    if (!invoice) {
        return actionsResponse(
            {
                type: "action",
                icon: `${APP_URL}/settlr-logo.png`,
                title: "Invoice Not Found",
                description: "This invoice does not exist or has expired.",
                label: "Not Found",
                disabled: true,
                error: { message: "Invoice not found" },
            },
            404
        );
    }

    if (invoice.status === "paid") {
        return actionsResponse({
            type: "action",
            icon: `${APP_URL}/settlr-logo.png`,
            title: `Invoice ${invoice.invoiceNumber} — Already Paid`,
            description: `This invoice from ${invoice.merchantName} has already been paid.`,
            label: "Already Paid",
            disabled: true,
        });
    }

    if (invoice.status === "cancelled") {
        return actionsResponse({
            type: "action",
            icon: `${APP_URL}/settlr-logo.png`,
            title: `Invoice ${invoice.invoiceNumber} — Cancelled`,
            description: `This invoice from ${invoice.merchantName} has been cancelled.`,
            label: "Cancelled",
            disabled: true,
        });
    }

    // Build the action metadata
    const amount = formatUSD(invoice.total);
    return actionsResponse({
        type: "action",
        icon: `${APP_URL}/settlr-logo.png`,
        title: `Pay ${amount} to ${invoice.merchantName}`,
        description: [
            `Invoice ${invoice.invoiceNumber}`,
            invoice.buyerCompany ? `for ${invoice.buyerCompany}` : "",
            invoice.memo ? `— ${invoice.memo}` : "",
            "• Settles instantly",
        ]
            .filter(Boolean)
            .join(" "),
        label: `Pay ${amount}`,
        links: {
            actions: [
                {
                    type: "transaction",
                    label: `Pay ${amount}`,
                    href: `${APP_URL}/api/actions/pay?invoice=${token}`,
                },
            ],
        },
    });
}

/* ═════════════════════════════════════════════════════════════════════
 * POST — Build and return an unsigned USDC transfer transaction
 * ═════════════════════════════════════════════════════════════════════ */
export async function POST(request: NextRequest) {
    const token = getInvoiceToken(request);
    if (!token) {
        return actionsResponse(
            { error: "Missing invoice parameter" },
            400
        );
    }

    // Parse buyer's wallet from the request body
    let account: string;
    try {
        const body = await request.json();
        account = body.account;
        if (!account || typeof account !== "string") {
            return actionsResponse({ error: "Missing account field" }, 400);
        }
    } catch {
        return actionsResponse({ error: "Invalid request body" }, 400);
    }

    // Validate the public key
    let buyerPubkey: PublicKey;
    try {
        buyerPubkey = new PublicKey(account);
        if (!PublicKey.isOnCurve(buyerPubkey)) {
            throw new Error("Off-curve key");
        }
    } catch {
        return actionsResponse({ error: "Invalid Solana wallet address" }, 400);
    }

    // Look up the invoice
    const invoice = await getInvoiceByViewToken(token);
    if (!invoice) {
        return actionsResponse({ error: "Invoice not found" }, 404);
    }
    if (invoice.status === "paid") {
        return actionsResponse({ error: "Invoice already paid" }, 400);
    }
    if (invoice.status === "cancelled") {
        return actionsResponse({ error: "Invoice cancelled" }, 400);
    }

    try {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const merchantPubkey = new PublicKey(invoice.merchantWallet);

        // Derive Associated Token Accounts
        const buyerAta = getAssociatedTokenAddressSync(USDC_MINT, buyerPubkey);
        const merchantAta = getAssociatedTokenAddressSync(
            USDC_MINT,
            merchantPubkey
        );

        const amountLamports = BigInt(
            Math.round(invoice.total * Math.pow(10, USDC_DECIMALS))
        );

        const transaction = new Transaction();

        // If merchant ATA doesn't exist yet, create it (buyer pays rent)
        const merchantAtaInfo = await connection.getAccountInfo(merchantAta);
        if (!merchantAtaInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    buyerPubkey,
                    merchantAta,
                    merchantPubkey,
                    USDC_MINT,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            );
        }

        // USDC transfer: buyer → merchant
        transaction.add(
            createTransferInstruction(
                buyerAta,
                merchantAta,
                buyerPubkey,
                amountLamports
            )
        );

        // Memo with invoice reference (for on-chain traceability)
        transaction.add(
            new TransactionInstruction({
                programId: MEMO_PROGRAM_ID,
                keys: [{ pubkey: buyerPubkey, isSigner: true, isWritable: false }],
                data: Buffer.from(
                    `settlr:${invoice.invoiceNumber}:${invoice.id}`,
                    "utf-8"
                ),
            })
        );

        // Set blockhash and fee payer
        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash("confirmed");
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = buyerPubkey;

        // Serialize (unsigned — the buyer's wallet will sign)
        const serialized = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });

        const amount = formatUSD(invoice.total);

        return actionsResponse({
            type: "transaction",
            transaction: Buffer.from(serialized).toString("base64"),
            message: `Payment of ${amount} USDC to ${invoice.merchantName} via Settlr`,
        });
    } catch (err) {
        console.error("[actions/pay] Error building transaction:", err);
        return actionsResponse(
            { error: "Failed to build payment transaction" },
            500
        );
    }
}
