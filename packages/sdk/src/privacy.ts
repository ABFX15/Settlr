/**
 * MagicBlock Private Ephemeral Rollup (PER) Privacy Module
 *
 * Private payments powered by MagicBlock's TEE (Intel TDX) infrastructure.
 * Payment data is hidden inside a Private Ephemeral Rollup — only permissioned
 * members (merchant + customer) can observe state. Observers on the base layer
 * see nothing until settlement.
 *
 * Flow:
 *   1. Create private payment session (on base layer)
 *   2. Delegate the account to a PER (data moves into TEE)
 *   3. Process payment inside the TEE (hidden from observers)
 *   4. Settle — commit final state back to Solana
 */

import { PublicKey, SystemProgram, Connection, Keypair } from '@solana/web3.js';

// ─── Program IDs ────────────────────────────────────────────────────────────

/** Settlr program */
export const SETTLR_PROGRAM_ID = new PublicKey(
    '339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5'
);

/** MagicBlock Delegation Program */
export const DELEGATION_PROGRAM_ID = new PublicKey(
    'DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh'
);

/** MagicBlock Permission Program */
export const PERMISSION_PROGRAM_ID = new PublicKey(
    'ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1'
);

// ─── MagicBlock Endpoints ───────────────────────────────────────────────────

/** Devnet TEE endpoint — Private Ephemeral Rollup */
export const PER_ENDPOINT = 'https://tee.magicblock.app';
export const PER_WS_ENDPOINT = 'wss://tee.magicblock.app';

/** Devnet ER endpoint (non-private) */
export const ER_ENDPOINTS = {
    asia: 'https://devnet-as.magicblock.app',
    eu: 'https://devnet-eu.magicblock.app',
    us: 'https://devnet-us.magicblock.app',
} as const;

/** Magic Router (devnet) — routes to nearest ER */
export const MAGIC_ROUTER_DEVNET = 'https://devnet-router.magicblock.app';

/** TEE Validator pubkey */
export const TEE_VALIDATOR = new PublicKey(
    'FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA'
);

// ─── PDA Derivations ────────────────────────────────────────────────────────

/**
 * Derive the private receipt PDA for a given payment ID
 */
export function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('private_receipt'), Buffer.from(paymentId)],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Derive the delegation buffer PDA for a given account
 */
export function findDelegationBufferPda(
    accountPda: PublicKey
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('buffer'), accountPda.toBuffer()],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Derive the delegation record PDA
 */
export function findDelegationRecordPda(
    accountPda: PublicKey
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('delegation_record'), accountPda.toBuffer()],
        DELEGATION_PROGRAM_ID
    );
}

/**
 * Derive the delegation metadata PDA
 */
export function findDelegationMetadataPda(
    accountPda: PublicKey
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('delegation_metadata'), accountPda.toBuffer()],
        DELEGATION_PROGRAM_ID
    );
}

// ─── Configuration Types ────────────────────────────────────────────────────

/** Session status enum (mirrors on-chain SessionStatus) */
export enum SessionStatus {
    Pending = 0,
    Active = 1,
    Processed = 2,
    Settled = 3,
}

/**
 * Configuration for creating a private payment session
 */
export interface PrivatePaymentConfig {
    /** Payment ID (must be unique) */
    paymentId: string;
    /** Amount in USDC (will be converted to lamports) */
    amount: number;
    /** Fee amount in USDC */
    feeAmount?: number;
    /** Customer wallet (payer + signer) */
    customer: PublicKey;
    /** Merchant wallet */
    merchant: PublicKey;
    /** Optional memo / order reference */
    memo?: string;
}

/**
 * Build accounts for creating a private payment session
 */
export async function buildPrivatePaymentAccounts(config: PrivatePaymentConfig) {
    const [privateReceiptPda] = findPrivateReceiptPda(config.paymentId);

    return {
        customer: config.customer,
        merchant: config.merchant,
        privateReceipt: privateReceiptPda,
        systemProgram: SystemProgram.programId,
    };
}

/**
 * Build accounts for delegating a private payment to PER
 */
export async function buildDelegateAccounts(
    paymentId: string,
    payer: PublicKey
) {
    const [privateReceiptPda] = findPrivateReceiptPda(paymentId);
    const [buffer] = findDelegationBufferPda(privateReceiptPda);
    const [delegationRecord] = findDelegationRecordPda(privateReceiptPda);
    const [delegationMetadata] = findDelegationMetadataPda(privateReceiptPda);

    return {
        payer,
        privateReceipt: privateReceiptPda,
        ownerProgram: SETTLR_PROGRAM_ID,
        buffer,
        delegationRecord,
        delegationMetadata,
        delegationProgram: DELEGATION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    };
}

// ─── PER Connection Helper ──────────────────────────────────────────────────

/**
 * Create a connection to the Private Ephemeral Rollup (TEE)
 *
 * Transactions sent through this connection execute inside Intel TDX.
 * State is hidden from base-layer observers.
 */
export function createPERConnection(): Connection {
    return new Connection(PER_ENDPOINT, {
        commitment: 'confirmed',
        wsEndpoint: PER_WS_ENDPOINT,
    });
}

/**
 * Create a connection to the base-layer Solana devnet
 */
export function createBaseConnection(): Connection {
    return new Connection('https://api.devnet.solana.com', 'confirmed');
}

// ─── Privacy Features ───────────────────────────────────────────────────────

/**
 * Privacy-preserving payment features powered by MagicBlock PER
 */
export const PrivacyFeatures = {
    /** Payment data hidden inside TEE during processing */
    TEE_ENCRYPTED_STATE: true,

    /** Permission-based access: only merchant + customer can observe */
    PERMISSION_ACCESS_CONTROL: true,

    /** Sub-10ms latency inside PER, gasless transactions */
    REALTIME_EXECUTION: true,

    /** Final state committed back to base layer for accounting */
    SETTLEMENT_VISIBILITY: true,

    /** Intel TDX hardware enclave — hardware root of trust */
    HARDWARE_SECURITY: true,
} as const;

// ─── Permission Flags (mirror SDK constants) ────────────────────────────────

export const AUTHORITY_FLAG = 1;
export const TX_LOGS_FLAG = 2;
export const TX_BALANCES_FLAG = 4;
export const TX_MESSAGE_FLAG = 8;
export const ACCOUNT_SIGNATURES_FLAG = 16;

/**
 * Member permission configuration
 */
export interface MemberPermission {
    pubkey: PublicKey;
    flags: number;
}

/**
 * Build permission member list for a private payment
 * The customer gets full visibility; merchants get balance + log view.
 */
export function buildPaymentPermissions(
    customer: PublicKey,
    merchant: PublicKey
): MemberPermission[] {
    return [
        {
            pubkey: customer,
            flags: AUTHORITY_FLAG | TX_LOGS_FLAG | TX_BALANCES_FLAG | TX_MESSAGE_FLAG,
        },
        {
            pubkey: merchant,
            flags: TX_LOGS_FLAG | TX_BALANCES_FLAG,
        },
    ];
}

// ─── Full Flow Helper ───────────────────────────────────────────────────────

/**
 * Full private payment flow result
 */
export interface PrivatePaymentResult {
    sessionId: string;
    privateReceiptPda: PublicKey;
    status: SessionStatus;
    createSignature?: string;
    delegateSignature?: string;
    processSignature?: string;
    settleSignature?: string;
}

/**
 * Privacy mode options for merchant dashboard
 */
export interface PrivacyModeConfig {
    /** When true, individual transaction amounts are hidden */
    hideIndividualAmounts: boolean;
    /** When true, only show aggregate totals */
    aggregatesOnly: boolean;
    /** Allow on-demand access for specific transactions */
    allowSelectiveAccess: boolean;
}

/**
 * Default privacy mode (maximum privacy)
 */
export const DEFAULT_PRIVACY_MODE: PrivacyModeConfig = {
    hideIndividualAmounts: true,
    aggregatesOnly: true,
    allowSelectiveAccess: true,
};

// ─── Utility ────────────────────────────────────────────────────────────────

/**
 * Generate a unique payment session ID
 */
export function generateSessionId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'priv_';
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

/**
 * Generate a unique payout ID
 */
export function generatePayoutId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'payout_';
    for (let i = 0; i < 12; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

/**
 * Subscription billing cycle presets
 */
export const BillingCycles = {
    WEEKLY: 7 * 24 * 60 * 60,
    BIWEEKLY: 14 * 24 * 60 * 60,
    MONTHLY: 30 * 24 * 60 * 60,
    QUARTERLY: 90 * 24 * 60 * 60,
    YEARLY: 365 * 24 * 60 * 60,
} as const;
