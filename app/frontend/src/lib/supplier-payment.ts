/**
 * Build a non-custodial, gasless USDC payment from one merchant to a supplier.
 *
 * The merchant pays from their OWN wallet (they sign — we never custody the
 * funds), and the platform fee-payer sponsors the network fee + any ATA rent
 * so the payer needs zero SOL. Returns a partially-signed (fee-payer) base64
 * transaction for the merchant to add their signature and submit — same
 * pattern as sponsored vault creation.
 */

import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    getAccount,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
} from "@solana/spl-token";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";

export interface SupplierPaymentBuild {
    /** Base64 transaction, fee-payer-signed; the payer adds their signature. */
    transaction: string;
    feePayer: string;
    payeeWallet: string;
    amount: number;
}

export async function buildSupplierPaymentTransaction(args: {
    payerWallet: string;
    payeeWallet: string;
    amount: number;
}): Promise<SupplierPaymentBuild> {
    const { payerWallet, payeeWallet, amount } = args;

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("amount must be a positive number");
    }

    const payer = new PublicKey(payerWallet);
    const payee = new PublicKey(payeeWallet);
    if (payer.equals(payee)) throw new Error("payer and payee are the same wallet");

    const feePayerSecret = process.env.FEE_PAYER_SECRET_KEY;
    if (!feePayerSecret) throw new Error("FEE_PAYER_SECRET_KEY not configured");
    const feePayer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(feePayerSecret)));

    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const usdcMint = new PublicKey(USDC_MINT_ADDRESS);

    const payerAta = await getAssociatedTokenAddress(usdcMint, payer);
    const payeeAta = await getAssociatedTokenAddress(usdcMint, payee);

    const tx = new Transaction();

    // Create the supplier's USDC account if they've never received USDC
    // (fee-payer pays the rent — keeps the payer gasless).
    try {
        await getAccount(connection, payeeAta);
    } catch {
        tx.add(
            createAssociatedTokenAccountInstruction(
                feePayer.publicKey,
                payeeAta,
                payee,
                usdcMint,
            ),
        );
    }

    // The payer is the transfer authority — only their signature moves funds.
    tx.add(
        createTransferInstruction(
            payerAta,
            payeeAta,
            payer,
            BigInt(Math.round(amount * 1_000_000)),
        ),
    );

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = feePayer.publicKey;
    tx.partialSign(feePayer);

    return {
        transaction: tx
            .serialize({ requireAllSignatures: false, verifySignatures: false })
            .toString("base64"),
        feePayer: feePayer.publicKey.toBase58(),
        payeeWallet,
        amount,
    };
}
