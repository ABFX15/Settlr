/**
 * Privy Server-Side SDK Utilities
 *
 * Used for gasless transactions with Privy's managed wallets as fee payers.
 * Based on Privy + Helius gasless pattern.
 * 
 * Required env vars:
 * - NEXT_PUBLIC_PRIVY_APP_ID
 * - PRIVY_APP_SECRET
 * - PRIVY_FEE_PAYER_WALLET_ID (managed wallet created in Privy dashboard)
 * - PRIVY_FEE_PAYER_ADDRESS (public address of the fee payer wallet)
 */

import { PrivyClient } from "@privy-io/server-auth";
import { VersionedTransaction, Transaction } from "@solana/web3.js";

// Environment validation
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

// Fee payer wallet - created in Privy dashboard as a managed wallet
const FEE_PAYER_WALLET_ID = process.env.PRIVY_FEE_PAYER_WALLET_ID;
const FEE_PAYER_ADDRESS = process.env.PRIVY_FEE_PAYER_ADDRESS;

// RPC endpoint
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

// CAIP-2 chain IDs
const SOLANA_DEVNET_CAIP2 = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1" as const;
const SOLANA_MAINNET_CAIP2 = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;

let privyClient: PrivyClient | null = null;

/**
 * Get or create the Privy server client
 */
export function getPrivyClient(): PrivyClient {
    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
        throw new Error(
            "Privy server not configured. Set PRIVY_APP_ID and PRIVY_APP_SECRET."
        );
    }

    if (!privyClient) {
        privyClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
    }

    return privyClient;
}

/**
 * Check if Privy gasless is enabled
 */
export function isPrivyGaslessEnabled(): boolean {
    return !!(PRIVY_APP_ID && PRIVY_APP_SECRET && FEE_PAYER_WALLET_ID && FEE_PAYER_ADDRESS);
}

/**
 * Get the fee payer wallet ID
 */
export function getFeePayerWalletId(): string | undefined {
    return FEE_PAYER_WALLET_ID;
}

/**
 * Get the fee payer public address (for client to set as feePayer)
 */
export function getFeePayerAddress(): string | undefined {
    return FEE_PAYER_ADDRESS;
}

/**
 * Sign and send a partially-signed transaction using the fee payer wallet
 * 
 * This is the Privy + Helius gasless pattern:
 * 1. Client builds tx with fee payer as payerKey
 * 2. User signs their portion
 * 3. Server signs as fee payer and broadcasts
 * 
 * @param serializedTransaction - Base64 encoded partially-signed transaction
 * @param isMainnet - Whether to use mainnet (default: false for devnet)
 */
export async function sponsorAndSendTransaction({
    serializedTransaction,
    isMainnet = false,
}: {
    serializedTransaction: string;
    isMainnet?: boolean;
}): Promise<{ hash: string }> {
    if (!FEE_PAYER_WALLET_ID) {
        throw new Error("Fee payer wallet not configured. Set PRIVY_FEE_PAYER_WALLET_ID.");
    }

    const client = getPrivyClient();

    // Deserialize the transaction from base64
    const txBuffer = Buffer.from(serializedTransaction, "base64");
    let transaction: Transaction | VersionedTransaction;
    try {
        transaction = VersionedTransaction.deserialize(txBuffer);
    } catch {
        transaction = Transaction.from(txBuffer);
    }

    // Sign and send the transaction using walletId (for managed/server wallets)
    // The transaction already has the user's signature, we're adding the fee payer signature
    const result = await client.walletApi.solana.signAndSendTransaction({
        walletId: FEE_PAYER_WALLET_ID, // Use walletId for managed wallets, not address
        transaction,
        caip2: isMainnet ? SOLANA_MAINNET_CAIP2 : SOLANA_DEVNET_CAIP2,
    });

    return { hash: result.hash };
}

/**
 * Create a managed wallet for use as fee payer
 * Run this once to create the wallet, then save the ID and address to env vars
 */
export async function createFeePayerWallet(): Promise<{ id: string; address: string }> {
    const client = getPrivyClient();

    const wallet = await client.walletApi.create({
        chainType: "solana",
    });

    console.log(`Created fee payer wallet:`);
    console.log(`  ID: ${wallet.id}`);
    console.log(`  Address: ${wallet.address}`);
    console.log(`\nAdd these to your .env.local:`);
    console.log(`PRIVY_FEE_PAYER_WALLET_ID=${wallet.id}`);
    console.log(`PRIVY_FEE_PAYER_ADDRESS=${wallet.address}`);

    return { id: wallet.id, address: wallet.address };
}

/**
 * Get wallet info from the API
 */
export async function getWallet(walletId: string) {
    const client = getPrivyClient();
    return client.walletApi.getWallet({ id: walletId });
}
