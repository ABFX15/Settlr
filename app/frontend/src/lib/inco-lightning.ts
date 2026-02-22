/**
 * MagicBlock Private Ephemeral Rollups (PER) Integration
 * 
 * Provides TEE-based private payments on Solana using MagicBlock's
 * Private Ephemeral Rollups. Payment amounts are hidden from base-layer
 * observers while being processed inside a Trusted Execution Environment.
 * 
 * Flow:
 * 1. Client creates a private payment session on base layer
 * 2. Session account is delegated to MagicBlock's TEE validator
 * 3. Payment is processed privately inside the TEE (hidden from observers)
 * 4. State is committed back to base layer after settlement
 * 
 * @see https://docs.magicblock.gg/Forever/Ephemeral/private-ephemeral-rollup
 */

import { PublicKey, Connection } from '@solana/web3.js';

// MagicBlock Delegation Program
export const DELEGATION_PROGRAM_ID = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');

// MagicBlock Permission Program  
export const PERMISSION_PROGRAM_ID = new PublicKey('ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1');

// Settlr program ID
export const SETTLR_PROGRAM_ID = new PublicKey('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');

// MagicBlock TEE Validator
export const TEE_VALIDATOR = new PublicKey('FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA');

// PER endpoints
export const PER_ENDPOINT = 'https://tee.magicblock.app';
export const PER_WS_ENDPOINT = 'wss://tee.magicblock.app';
export const MAGIC_ROUTER_DEVNET = 'https://devnet-router.magicblock.app';

// PDA seeds
const PRIVATE_RECEIPT_SEED = Buffer.from('private_receipt');

/** Session status enum matching on-chain state */
export enum SessionStatus {
    Pending = 0,
    Active = 1,
    Processed = 2,
    Settled = 3,
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
    [SessionStatus.Pending]: 'Pending',
    [SessionStatus.Active]: 'Delegated to TEE',
    [SessionStatus.Processed]: 'Processed in TEE',
    [SessionStatus.Settled]: 'Settled on Base Layer',
};

/**
 * Find the Private Receipt PDA for a payment
 * 
 * @param paymentId - Unique payment identifier (e.g., tx signature)
 * @returns [PDA address, bump seed]
 */
export function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
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
 * Find the Delegation Record PDA for a delegated account
 * 
 * @param delegatedAccount - The account that has been delegated to TEE
 * @returns [PDA address, bump seed]
 */
export function findDelegationRecordPda(delegatedAccount: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('delegation'), delegatedAccount.toBuffer()],
        DELEGATION_PROGRAM_ID
    );
}

/**
 * Find the Delegation Metadata PDA
 * 
 * @param delegatedAccount - The delegated account
 * @returns [PDA address, bump seed]
 */
export function findDelegationMetadataPda(delegatedAccount: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('delegation_metadata'), delegatedAccount.toBuffer()],
        DELEGATION_PROGRAM_ID
    );
}

/**
 * Check if an account is currently delegated to the TEE
 * 
 * @param connection - Solana connection
 * @param account - Account to check
 * @returns true if delegated
 */
export async function isDelegatedToTee(
    connection: Connection,
    account: PublicKey
): Promise<boolean> {
    const [delegationRecord] = findDelegationRecordPda(account);
    const info = await connection.getAccountInfo(delegationRecord);
    return info !== null;
}

/**
 * Create a connection to the MagicBlock TEE validator
 * 
 * @returns Connection to PER endpoint
 */
export function createTeeConnection(): Connection {
    return new Connection(PER_ENDPOINT, 'confirmed');
}

/**
 * Convert USDC amount to micro-units
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
 * Generate a session hash for display purposes
 * Uses SHA-256 to create a deterministic identifier
 */
export async function generateSessionHash(
    paymentId: string,
    amount: number,
    customer: string,
    merchant: string
): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${paymentId}:${amount}:${customer}:${merchant}:${Date.now()}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Determine privacy visibility based on session status
 * In PER, data is hidden while inside the TEE and revealed on settlement
 */
export function getPrivacyVisibility(status: SessionStatus): {
    amountVisible: boolean;
    label: string;
    description: string;
} {
    switch (status) {
        case SessionStatus.Pending:
            return {
                amountVisible: false,
                label: 'Pending',
                description: 'Session created. Amount visible until delegation.',
            };
        case SessionStatus.Active:
            return {
                amountVisible: false,
                label: 'Private (TEE)',
                description: 'Account delegated to TEE. Amount hidden from base-layer observers.',
            };
        case SessionStatus.Processed:
            return {
                amountVisible: false,
                label: 'Processed (TEE)',
                description: 'Payment processed inside TEE. Amount still hidden.',
            };
        case SessionStatus.Settled:
            return {
                amountVisible: true,
                label: 'Settled',
                description: 'State committed back to base layer. Amount now visible.',
            };
    }
}
