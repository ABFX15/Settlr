import { Keypair, Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createTransferInstruction,
    getAccount,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { getConfig, type TokenConfig } from './config';

// Fee payer keypair (loaded from environment)
let feePayerKeypair: Keypair | null = null;

export function getFeePayerKeypair(): Keypair {
    if (!feePayerKeypair) {
        const secret = process.env.FEE_PAYER_SECRET;
        if (!secret) {
            throw new Error('FEE_PAYER_SECRET environment variable not set');
        }

        try {
            // Try as base58
            const decoded = bs58.decode(secret);
            feePayerKeypair = Keypair.fromSecretKey(decoded);
        } catch {
            // Try as JSON array
            const parsed = JSON.parse(secret);
            feePayerKeypair = Keypair.fromSecretKey(Uint8Array.from(parsed));
        }
    }

    return feePayerKeypair;
}

export function getConnection(): Connection {
    const config = getConfig();
    return new Connection(config.rpcEndpoint, 'confirmed');
}

/**
 * Validate that a transaction contains a valid fee transfer to the fee payer
 */
export async function validateTransaction(
    transaction: Transaction,
    tokenConfig: TokenConfig
): Promise<{ valid: boolean; error?: string }> {
    const feePayer = getFeePayerKeypair().publicKey;
    const feePayerAta = await getAssociatedTokenAddress(
        new PublicKey(tokenConfig.mint),
        feePayer
    );

    // Find a transfer instruction to the fee payer's ATA
    let feeTransferFound = false;
    let feeAmount = BigInt(0);

    for (const instruction of transaction.instructions) {
        // Check if this is a token transfer instruction
        // SPL Token transfer instruction has 1 byte discriminator + data
        if (instruction.data.length >= 9) {
            const discriminator = instruction.data[0];

            // Transfer = 3, TransferChecked = 12
            if (discriminator === 3 || discriminator === 12) {
                // Get destination account (index 1 for Transfer, index 2 for TransferChecked)
                const destIndex = discriminator === 3 ? 1 : 2;
                const destAccount = instruction.keys[destIndex]?.pubkey;

                if (destAccount?.equals(feePayerAta)) {
                    // Parse amount (little-endian u64)
                    const amountOffset = discriminator === 3 ? 1 : 1;
                    const amountBytes = instruction.data.slice(amountOffset, amountOffset + 8);
                    const amount = amountBytes.reduce(
                        (acc, byte, i) => acc + BigInt(byte) * BigInt(256 ** i),
                        BigInt(0)
                    );

                    feeAmount += amount;
                    feeTransferFound = true;
                }
            }
        }
    }

    if (!feeTransferFound) {
        return { valid: false, error: 'No fee transfer to relay found' };
    }

    if (feeAmount < BigInt(tokenConfig.fee)) {
        return {
            valid: false,
            error: `Insufficient fee. Expected ${tokenConfig.fee}, got ${feeAmount}`
        };
    }

    // Validate fee payer has enough SOL
    const connection = getConnection();
    const balance = await connection.getBalance(feePayer);
    const estimatedFee = 5000; // ~0.000005 SOL per signature

    if (balance < estimatedFee * 2) {
        return { valid: false, error: 'Relay temporarily unavailable (low SOL)' };
    }

    return { valid: true };
}

/**
 * Sign a transaction as the fee payer
 */
export function signAsFeePlayer(transaction: Transaction): Transaction {
    const feePayer = getFeePayerKeypair();
    transaction.partialSign(feePayer);
    return transaction;
}

/**
 * Submit a transaction to the network
 */
export async function submitTransaction(
    transaction: Transaction
): Promise<{ signature: string }> {
    const connection = getConnection();

    const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        }
    );

    // Wait for confirmation
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
    });

    return { signature };
}

/**
 * Get fee payer's SOL balance
 */
export async function getFeePayerBalance(): Promise<number> {
    const connection = getConnection();
    const feePayer = getFeePayerKeypair().publicKey;
    const balance = await connection.getBalance(feePayer);
    return balance / 1e9; // Convert lamports to SOL
}

/**
 * Get fee payer's token balance
 */
export async function getFeePayerTokenBalance(mint: string): Promise<number> {
    const connection = getConnection();
    const feePayer = getFeePayerKeypair().publicKey;

    try {
        const ata = await getAssociatedTokenAddress(
            new PublicKey(mint),
            feePayer
        );
        const account = await getAccount(connection, ata);
        return Number(account.amount);
    } catch {
        return 0;
    }
}
