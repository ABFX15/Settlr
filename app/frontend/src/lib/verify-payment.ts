/**
 * Server-side verification of an on-chain Offbank payment.
 *
 * Confirms the parsed Solana transaction contains:
 *   - a successful spl-token transfer of `merchantAmount` (USDC base units)
 *     into the merchant's USDC ATA, AND
 *   - a successful spl-token transfer of `platformFee` into the platform
 *     treasury PDA owned by the Offbank program.
 *
 * Used by every server route that records or trusts a buyer-supplied tx
 * signature (invoice payments, SDK redirect recording, etc.) so callers
 * cannot forge "completed" payments by submitting arbitrary signatures.
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";

const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");
const PLATFORM_FEE_BPS = 100; // 1%

function extractRawAmountFromParsedInstruction(ix: any): bigint {
    const info = ix?.parsed?.info;
    if (!info) return BigInt(0);
    if (typeof info.amount === "string") return BigInt(info.amount);
    if (info.tokenAmount?.amount && typeof info.tokenAmount.amount === "string") {
        return BigInt(info.tokenAmount.amount);
    }
    return BigInt(0);
}

export interface VerifyPaymentArgs {
    /** Transaction signature from the buyer-side client. */
    signature: string;
    /** Merchant's owner wallet address (base58). */
    merchantWallet: string;
    /** Total payment amount, denominated in whole USDC (e.g. 12.34 = $12.34). */
    totalUsdc: number;
}

export interface VerifyPaymentResult {
    ok: boolean;
    error?: string;
    merchantAmountBase?: bigint;
    platformFeeBase?: bigint;
}

export async function verifyOnChainPayment(
    args: VerifyPaymentArgs,
): Promise<VerifyPaymentResult> {
    const { signature, merchantWallet, totalUsdc } = args;

    if (!signature || typeof signature !== "string") {
        return { ok: false, error: "signature required" };
    }
    if (!merchantWallet || typeof merchantWallet !== "string") {
        return { ok: false, error: "merchantWallet required" };
    }
    if (!Number.isFinite(totalUsdc) || totalUsdc <= 0) {
        return { ok: false, error: "totalUsdc must be a positive number" };
    }

    let merchantPk: PublicKey;
    try {
        merchantPk = new PublicKey(merchantWallet);
    } catch {
        return { ok: false, error: "invalid merchantWallet" };
    }

    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const parsedTx = await connection.getParsedTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
    });

    if (!parsedTx) {
        return { ok: false, error: "transaction not found on-chain" };
    }
    if (parsedTx.meta?.err) {
        return { ok: false, error: "on-chain transaction failed" };
    }

    const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
    const merchantAta = await getAssociatedTokenAddress(
        usdcMint,
        merchantPk,
        true,
    );
    const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID,
    );

    const totalBase = BigInt(Math.round(totalUsdc * 1_000_000));
    const platformFee = (totalBase * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
    const merchantAmount = totalBase - platformFee;

    const transferIxs = parsedTx.transaction.message.instructions.filter(
        (ix: any) =>
            ix?.program === "spl-token" &&
            ix?.parsed?.type &&
            (ix.parsed.type === "transfer" ||
                ix.parsed.type === "transferChecked"),
    );

    const merchantTransfer = transferIxs.find((ix: any) => {
        if (ix?.parsed?.info?.destination !== merchantAta.toBase58()) return false;
        return extractRawAmountFromParsedInstruction(ix) >= merchantAmount;
    });

    const treasuryTransfer = transferIxs.find((ix: any) => {
        if (ix?.parsed?.info?.destination !== treasuryPDA.toBase58()) return false;
        return extractRawAmountFromParsedInstruction(ix) >= platformFee;
    });

    if (!merchantTransfer || !treasuryTransfer) {
        return {
            ok: false,
            error:
                "transaction does not include required merchant + platform fee transfers",
        };
    }

    return {
        ok: true,
        merchantAmountBase: merchantAmount,
        platformFeeBase: platformFee,
    };
}
