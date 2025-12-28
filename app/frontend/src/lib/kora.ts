/**
 * Kora Gasless Transaction Integration
 * 
 * Kora is the official Solana Foundation gasless solution that enables
 * users to pay transaction fees with SPL tokens instead of SOL.
 * 
 * Docs: https://launch.solana.com/docs/kora
 * SDK: @solana/kora
 */

import { KoraClient } from "@solana/kora";
import {
    Transaction,
    VersionedTransaction,
    PublicKey,
    Connection
} from "@solana/web3.js";

// Configuration
export interface KoraConfig {
    /** Kora RPC endpoint URL */
    rpcUrl: string;
    /** Optional API key for authenticated endpoints */
    apiKey?: string;
    /** Optional HMAC secret for request signing */
    hmacSecret?: string;
}

// Response types
export interface KoraSignerInfo {
    signerAddress: string;
    paymentDestination?: string;
}

export interface KoraFeeEstimate {
    lamports: number;
    tokenAmount: number;
    tokenMint: string;
}

export interface KoraSponsorResult {
    success: boolean;
    signature?: string;
    signedTransaction?: string;
    error?: string;
}

// Default Kora endpoint (can be self-hosted or use a public endpoint)
const DEFAULT_KORA_RPC = process.env.NEXT_PUBLIC_KORA_RPC_URL || "http://localhost:8080";

let koraClient: KoraClient | null = null;

/**
 * Get or create the Kora client instance
 */
export function getKoraClient(config?: Partial<KoraConfig>): KoraClient {
    if (!koraClient) {
        koraClient = new KoraClient({
            rpcUrl: config?.rpcUrl || DEFAULT_KORA_RPC,
            apiKey: config?.apiKey || process.env.KORA_API_KEY,
            hmacSecret: config?.hmacSecret || process.env.KORA_HMAC_SECRET,
        });
    }
    return koraClient;
}

/**
 * Check if Kora gasless is enabled
 */
export function isKoraEnabled(): boolean {
    return !!process.env.NEXT_PUBLIC_KORA_RPC_URL || !!process.env.KORA_RPC_URL;
}

/**
 * Get Kora signer information (fee payer address)
 */
export async function getKoraSigner(client?: KoraClient): Promise<KoraSignerInfo> {
    const kora = client || getKoraClient();
    const { signer_address, payment_address } = await kora.getPayerSigner();

    return {
        signerAddress: signer_address,
        paymentDestination: payment_address,
    };
}

/**
 * Get supported tokens for fee payment
 */
export async function getSupportedTokens(client?: KoraClient): Promise<string[]> {
    const kora = client || getKoraClient();
    const config = await kora.getConfig();
    return config.validation_config.allowed_spl_paid_tokens || [];
}

/**
 * Get the current blockhash from Kora's connected Solana RPC
 */
export async function getBlockhash(client?: KoraClient): Promise<{ blockhash: string }> {
    const kora = client || getKoraClient();
    const result = await kora.getBlockhash();
    return {
        blockhash: result.blockhash,
    };
}

/**
 * Estimate transaction fee in both SOL and token
 */
export async function estimateTransactionFee(
    transaction: string, // Base64 encoded transaction
    feeToken: string,
    client?: KoraClient
): Promise<KoraFeeEstimate> {
    const kora = client || getKoraClient();

    const estimate = await kora.estimateTransactionFee({
        transaction,
        fee_token: feeToken,
    });

    return {
        lamports: estimate.fee_in_lamports,
        tokenAmount: estimate.fee_in_token,
        tokenMint: feeToken,
    };
}

/**
 * Get payment instruction for a transaction
 * 
 * This creates an instruction that transfers the fee amount from the user
 * to the Kora operator in exchange for fee sponsorship.
 */
export async function getPaymentInstruction(
    transaction: string, // Base64 encoded transaction
    feeToken: string,
    sourceWallet: string,
    client?: KoraClient
) {
    const kora = client || getKoraClient();

    const result = await kora.getPaymentInstruction({
        transaction,
        fee_token: feeToken,
        source_wallet: sourceWallet,
    });

    return result.payment_instruction;
}

/**
 * Create a gasless token transfer transaction
 * 
 * Uses Kora's transferTransaction helper to build a transfer
 * where Kora acts as the fee payer.
 */
export async function createGaslessTransfer(params: {
    amount: number; // In smallest units (e.g., 1_000_000 for 1 USDC)
    token: string; // Token mint address
    source: string; // Sender wallet address
    destination: string; // Recipient wallet address
}, client?: KoraClient) {
    const kora = client || getKoraClient();

    const result = await kora.transferTransaction({
        amount: params.amount,
        token: params.token,
        source: params.source,
        destination: params.destination,
    });

    return result;
}

/**
 * Sign a transaction with Kora (fee payer signature)
 * 
 * The transaction must include a valid payment instruction to the Kora operator.
 * Returns the fully signed transaction.
 */
export async function signWithKora(
    transaction: string, // Base64 encoded, user-signed transaction
    signerKey?: string, // Optional specific signer key
    client?: KoraClient
): Promise<KoraSponsorResult> {
    const kora = client || getKoraClient();

    try {
        // Get the signer address if not provided
        const signerAddress = signerKey || (await getKoraSigner(kora)).signerAddress;

        const result = await kora.signTransaction({
            transaction,
            signer_key: signerAddress,
        });

        return {
            success: true,
            signedTransaction: result.signed_transaction,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to sign with Kora",
        };
    }
}

/**
 * Sign and send a transaction in one call
 * 
 * Kora signs the transaction and immediately broadcasts it to Solana.
 */
export async function signAndSendWithKora(
    transaction: string, // Base64 encoded, user-signed transaction
    signerKey?: string,
    client?: KoraClient
): Promise<KoraSponsorResult> {
    const kora = client || getKoraClient();

    try {
        const signerAddress = signerKey || (await getKoraSigner(kora)).signerAddress;

        const result = await kora.signAndSendTransaction({
            transaction,
            signer_key: signerAddress,
        });

        // The SDK types show signed_transaction, but the API may also return signature
        // when the transaction is broadcast. Cast to access potential additional fields.
        const response = result as unknown as {
            signed_transaction: string;
            signer_pubkey: string;
            signature?: string;
        };

        return {
            success: true,
            signature: response.signature,
            signedTransaction: response.signed_transaction,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to sign and send",
        };
    }
}

/**
 * Helper: Serialize a legacy Transaction to base64
 */
export function serializeTransaction(transaction: Transaction): string {
    const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
    });
    return Buffer.from(serialized).toString("base64");
}

/**
 * Helper: Serialize a VersionedTransaction to base64
 */
export function serializeVersionedTransaction(transaction: VersionedTransaction): string {
    const serialized = transaction.serialize();
    return Buffer.from(serialized).toString("base64");
}

// =============================================================================
// High-Level Checkout Integration
// =============================================================================

/**
 * Process a gasless USDC payment through Kora
 * 
 * This is the main function to use in the checkout flow:
 * 1. Builds the transfer transaction
 * 2. Gets payment instruction for fees
 * 3. User signs the combined transaction
 * 4. Kora co-signs and submits
 * 
 * @param params Payment parameters
 * @param signCallback Callback to sign the transaction with user's wallet
 */
export async function processGaslessPayment(params: {
    from: string; // User's wallet address
    to: string; // Merchant wallet address
    amount: number; // USDC amount in dollars (e.g., 10.50)
    usdcMint: string; // USDC token mint
}, signCallback: (transaction: string) => Promise<string>): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
}> {
    try {
        const kora = getKoraClient();

        // Convert to atomic units (USDC has 6 decimals)
        const atomicAmount = Math.floor(params.amount * 1_000_000);

        // Step 1: Create the transfer transaction
        const transferResult = await createGaslessTransfer({
            amount: atomicAmount,
            token: params.usdcMint,
            source: params.from,
            destination: params.to,
        }, kora);

        // Step 2: Get a fresh blockhash
        const { blockhash } = await getBlockhash(kora);

        // Step 3: Build estimate transaction and get payment instruction
        // The user will pay a small fee in USDC to Kora for sponsorship
        const supportedTokens = await getSupportedTokens(kora);
        const paymentToken = supportedTokens.includes(params.usdcMint)
            ? params.usdcMint
            : supportedTokens[0];

        if (!paymentToken) {
            return { success: false, error: "No payment tokens configured on Kora" };
        }

        // Step 4: User signs the transaction
        // The signCallback should use the user's wallet (Privy/Phantom) to sign
        const userSignedTx = await signCallback(transferResult.transaction);

        // Step 5: Send to Kora for co-signing and submission
        const result = await signAndSendWithKora(userSignedTx, undefined, kora);

        return result;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Gasless payment failed",
        };
    }
}
