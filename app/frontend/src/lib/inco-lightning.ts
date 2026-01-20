/**
 * Inco Lightning SDK Integration
 * 
 * Provides FHE (Fully Homomorphic Encryption) for private receipts on Solana.
 * Uses the official @inco/solana-sdk for client-side encryption and TEE-based decryption.
 * 
 * Flow:
 * 1. Client encrypts amount using encryptValue() - produces ciphertext
 * 2. Ciphertext sent to on-chain program via issuePrivateReceipt
 * 3. Program calls Inco Lightning CPI to create encrypted handle
 * 4. Only authorized parties (merchant + customer) can decrypt via attested-decrypt
 * 
 * @see https://docs.inco.org/getting-started/solana-quickstart
 */

import { PublicKey, TransactionInstruction, Connection } from '@solana/web3.js';
import { encryptValue, EncryptionError } from '@inco/solana-sdk/encryption';
import { decrypt as attestedDecrypt, type AttestedDecryptResult } from '@inco/solana-sdk/attested-decrypt';

// Inco Lightning program ID on Solana
export const INCO_LIGHTNING_PROGRAM_ID = new PublicKey('5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj');

// Settlr program ID
export const SETTLR_PROGRAM_ID = new PublicKey('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');

// Private receipt PDA seed
const PRIVATE_RECEIPT_SEED = Buffer.from('private_receipt');

/**
 * Encrypt a payment amount for on-chain storage
 * 
 * @param amount - Amount in smallest units (e.g., 50000 for $0.05 USDC with 6 decimals)
 * @returns Hex-encoded ciphertext for the on-chain program
 * 
 * @example
 * ```typescript
 * // Encrypt $10.00 USDC (6 decimals)
 * const ciphertext = await encryptAmount(10_000_000n);
 * ```
 */
export async function encryptAmount(amount: bigint | number): Promise<string> {
    const amountBigInt = typeof amount === 'number' ? BigInt(Math.floor(amount)) : amount;

    try {
        const encryptedHex = await encryptValue(amountBigInt);
        console.log('[Inco] Amount encrypted successfully');
        return encryptedHex;
    } catch (error) {
        if (error instanceof EncryptionError) {
            console.error('[Inco] Encryption failed:', error.message, error.cause);
        }
        throw error;
    }
}

/**
 * Encrypt a memo/message for private receipts
 * 
 * @param memo - The memo text to encrypt
 * @returns Hex-encoded ciphertext
 */
export async function encryptMemo(memo: string): Promise<string> {
    // Convert memo to a numeric representation (first 16 bytes as u128)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(memo.slice(0, 16)); // Max 16 chars for u128

    let value = BigInt(0);
    for (let i = 0; i < Math.min(bytes.length, 16); i++) {
        value = value | (BigInt(bytes[i]) << BigInt(i * 8));
    }

    return encryptValue(value);
}

/**
 * Decrypt payment amounts using attested decryption
 * Requires wallet signature for TEE access verification
 * 
 * @param handles - Array of encrypted handles to decrypt
 * @param wallet - Wallet with signMessage capability
 * @returns Decryption result with plaintexts and Ed25519 instructions
 */
export async function decryptAmounts(
    handles: string[],
    wallet: {
        publicKey: PublicKey;
        signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    }
): Promise<AttestedDecryptResult> {
    return attestedDecrypt(handles, {
        address: wallet.publicKey,
        signMessage: wallet.signMessage,
    });
}

/**
 * Find the Private Receipt PDA for a payment
 * 
 * @param paymentId - Unique payment identifier (e.g., tx signature)
 * @returns [PDA address, bump seed]
 */
export function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
    // PDA seeds have max 32 bytes - truncate long payment IDs
    let paymentIdSeed: Buffer;
    if (paymentId.length > 32) {
        paymentIdSeed = Buffer.from(paymentId.slice(0, 32));
    } else {
        paymentIdSeed = Buffer.from(paymentId);
    }

    return PublicKey.findProgramAddressSync(
        [PRIVATE_RECEIPT_SEED, paymentIdSeed],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Find the Allowance PDA for decryption access
 * 
 * @param handle - The encrypted handle (as bigint)
 * @param allowedAddress - The address being granted access
 * @returns [PDA address, bump seed]
 */
export function findAllowancePda(handle: bigint, allowedAddress: PublicKey): [PublicKey, number] {
    // Convert handle to 16-byte little-endian buffer
    const handleBuffer = Buffer.alloc(16);
    let h = handle;
    for (let i = 0; i < 16; i++) {
        handleBuffer[i] = Number(h & BigInt(0xff));
        h = h >> BigInt(8);
    }

    return PublicKey.findProgramAddressSync(
        [handleBuffer, allowedAddress.toBuffer()],
        INCO_LIGHTNING_PROGRAM_ID
    );
}

/**
 * Convert USDC amount to micro-units for encryption
 * 
 * @param usdcAmount - Amount in USDC (e.g., 10.50)
 * @returns BigInt in micro-USDC (e.g., 10500000n)
 */
export function usdcToMicroUnits(usdcAmount: number): bigint {
    return BigInt(Math.floor(usdcAmount * 1_000_000));
}

/**
 * Convert micro-units back to USDC
 * 
 * @param microUnits - Amount in micro-USDC
 * @returns Number in USDC
 */
export function microUnitsToUsdc(microUnits: bigint): number {
    return Number(microUnits) / 1_000_000;
}

/**
 * Build issuePrivateReceipt instruction data
 * This is the ciphertext that gets passed to the on-chain program
 */
export function buildReceiptCiphertext(encryptedHex: string): Buffer {
    // Remove '0x' prefix if present
    const hex = encryptedHex.startsWith('0x') ? encryptedHex.slice(2) : encryptedHex;
    return Buffer.from(hex, 'hex');
}

// Re-export for convenience
export { EncryptionError } from '@inco/solana-sdk/encryption';
export type { AttestedDecryptResult } from '@inco/solana-sdk/attested-decrypt';
