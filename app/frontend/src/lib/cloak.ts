/**
 * Cloak (ZK shielded payments) wrapper for Settlr.
 *
 * Cloak gives Settlr a *production* privacy rail on top of Solana:
 *   • Payers can settle invoices through a shielded UTXO pool, hiding
 *     amount + counterparty from the public ledger.
 *   • Merchants get a *viewing key* (`nk`) they publish openly so payers
 *     can encrypt chain notes for them. The merchant scans those notes
 *     to reconstruct an audit-grade history of incoming private payments.
 *   • Tax exports (1099-K, 8949) and batch payouts can opt into the
 *     shielded rail without changing the merchant UX.
 *
 * Trust model
 * -----------
 * The Cloak spend secret is derived deterministically from a wallet
 * signature (same pattern as `receiptKeys`). Settlr's server NEVER
 * stores the secret — only the publishable `nk`. Every operation that
 * needs the spend key asks the wallet to sign `SIGN_IN_MESSAGE` again.
 *
 * Network
 * -------
 * Cloak is mainnet-first but ships a devnet relay. Override via
 * `NEXT_PUBLIC_CLOAK_RELAY_URL` (and `NEXT_PUBLIC_CLOAK_PROGRAM_ID` if
 * targeting a non-default deployment).
 */

import {
    CLOAK_PROGRAM_ID,
    SIGN_IN_MESSAGE,
    generateCloakKeys,
    generateMasterSeed,
    deriveSpendKey,
    deriveUtxoKeypairFromSpendKey,
    getNkFromUtxoPrivateKey,
    registerViewingKey,
    transact,
    fullWithdraw,
    scanTransactions,
    toComplianceReport,
    formatComplianceCsv,
    createUtxo,
    createZeroUtxo,
    bytesToHex,
    hexToBytes,
    type CloakKeyPair,
    type ScanResult,
    type ComplianceReport,
    type Utxo,
    type UtxoKeypair,
} from "@cloak.dev/sdk";
import { Connection, PublicKey, type VersionedTransaction, type Transaction } from "@solana/web3.js";

// ─── Config ────────────────────────────────────────────────────────────

export interface CloakConfig {
    programId: PublicKey;
    relayUrl: string;
}

/**
 * Read Cloak network config from env. Safe to call from both server
 * (Node) and client (browser) — only NEXT_PUBLIC_* vars are read.
 */
export function getCloakConfig(): CloakConfig {
    const programIdStr = process.env.NEXT_PUBLIC_CLOAK_PROGRAM_ID;
    const programId = programIdStr ? new PublicKey(programIdStr) : CLOAK_PROGRAM_ID;
    const relayUrl = process.env.NEXT_PUBLIC_CLOAK_RELAY_URL || "https://api.cloak.ag";
    return { programId, relayUrl };
}

// ─── Key derivation ────────────────────────────────────────────────────

/**
 * Settlr extends Cloak's standard `SIGN_IN_MESSAGE` with a fixed
 * suffix so the resulting spend key is domain-separated from a
 * generic Cloak app sign-in. This keeps a leaked-elsewhere Cloak
 * sign-in signature from unlocking Settlr funds.
 */
const SETTLR_SIGN_IN_MESSAGE =
    SIGN_IN_MESSAGE +
    "\n\nApp: Settlr (settlr.app)\nPurpose: Derive shielded payment keys.";

export function getSettlrSignInMessage(): Uint8Array {
    return new TextEncoder().encode(SETTLR_SIGN_IN_MESSAGE);
}

export interface MerchantCloakKeys {
    /** Full Cloak keypair (master + spend + view). Holds the secret. */
    cloak: CloakKeyPair;
    /** UTXO keypair used as recipient pubkey in shielded transfers. */
    utxoKeypair: UtxoKeypair;
    /** 32-byte viewing key — publishable. */
    nk: Uint8Array;
    /** Hex form of `nk` for storage / URL embedding. */
    nkHex: string;
}

/**
 * Deterministically derive a merchant's Cloak keys from a wallet
 * signature over `SETTLR_SIGN_IN_MESSAGE`.
 *
 * The signature is hashed (via `deriveSpendKey`) into a 32-byte
 * spend seed; everything else (UTXO keypair, viewing key) is then
 * derived from that seed. Same wallet → same Cloak identity, every
 * time, with no server-side secret.
 */
export async function deriveMerchantCloakKeys(
    signature: Uint8Array
): Promise<MerchantCloakKeys> {
    if (!(signature instanceof Uint8Array) || signature.length === 0) {
        throw new Error("deriveMerchantCloakKeys: signature is required");
    }
    // Cloak's `deriveSpendKey` accepts arbitrary entropy and hashes
    // it into a valid 32-byte field-bounded spend key.
    const spendKey = deriveSpendKey(signature);
    const utxoKeypair = await deriveUtxoKeypairFromSpendKey(spendKey.sk_spend);
    const nk = getNkFromUtxoPrivateKey(utxoKeypair.privateKey);
    // Build a CloakKeyPair-shaped object so callers that already
    // expect that interface (relay layer, etc.) keep working. We
    // synthesise a master seed from the same signature for parity.
    const masterSeed = signature.slice(0, 32);
    const masterSeed32 =
        masterSeed.length === 32
            ? masterSeed
            : (() => {
                const padded = new Uint8Array(32);
                padded.set(masterSeed);
                return padded;
            })();
    const cloak = generateCloakKeys(masterSeed32);
    // Override view + spend with the deterministically-derived ones
    // so the publishable nk matches what scanners will use.
    cloak.spend = spendKey;
    return { cloak, utxoKeypair, nk, nkHex: bytesToHex(nk) };
}

/** Parse a hex-encoded nk back into bytes. Throws on bad input. */
export function nkFromHex(hex: string): Uint8Array {
    if (!hex || typeof hex !== "string") {
        throw new Error("nkFromHex: hex string required");
    }
    const cleaned = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (cleaned.length !== 64) {
        throw new Error(`nkFromHex: expected 64 hex chars, got ${cleaned.length}`);
    }
    return hexToBytes(cleaned);
}

// ─── Viewing-key registration ──────────────────────────────────────────

/**
 * Register the merchant's viewing key with the Cloak relay. Required
 * once per merchant before they (or anyone paying them) can transact.
 *
 * The relay uses the registered nk to know which encrypted notes to
 * surface back to the merchant on scan, and to gate compliance access.
 */
export async function registerMerchantViewingKey(params: {
    walletPublicKey: PublicKey;
    nk: Uint8Array;
    signMessage: (msg: Uint8Array) => Promise<Uint8Array>;
    relayUrl?: string;
}): Promise<void> {
    const { walletPublicKey, nk, signMessage } = params;
    const relayUrl = params.relayUrl ?? getCloakConfig().relayUrl;
    await registerViewingKey(relayUrl, walletPublicKey, nk, signMessage);
}

// ─── Private payment ──────────────────────────────────────────────────

export interface PayInvoicePrivatelyParams {
    connection: Connection;
    /** Payer wallet public key. */
    payerPublicKey: PublicKey;
    /** Wallet adapter sign function (handles legacy + V0). */
    signTransaction: <T extends Transaction | VersionedTransaction>(
        tx: T
    ) => Promise<T>;
    /** Wallet adapter sign-message — required for one-time VK registration. */
    signMessage: (msg: Uint8Array) => Promise<Uint8Array>;
    /** Final recipient (merchant's normal wallet — they don't need Cloak). */
    merchantRecipient: PublicKey;
    /** Merchant's published nk (hex) so the chain note is encrypted to them. */
    merchantNkHex: string;
    /** Token mint being paid (USDC, etc.). */
    mint: PublicKey;
    /** Amount in base units (e.g. USDC has 6 decimals). */
    amountBaseUnits: bigint;
    /** Optional progress callback for UI. */
    onProgress?: (status: string) => void;
}

export interface PayInvoicePrivatelyResult {
    /** Cloak transact (deposit) signature. */
    depositSignature: string;
    /** Final withdrawal signature landing funds in merchant ATA. */
    withdrawSignature: string;
    /** Hex of the encrypted chain-note hash (for DB lookup). */
    chainNoteHashHex?: string;
}

/**
 * Settle an invoice through Cloak in one user-visible operation.
 *
 * Flow:
 *   1. Generate an ephemeral payer UTXO keypair (no persistent state
 *      on the payer side — they're a one-shot anonymous depositor).
 *   2. Deposit `amountBaseUnits` of `mint` into the shielded pool.
 *   3. Immediately fullWithdraw to the merchant's ATA, embedding an
 *      encrypted chain note for the merchant's `nk` so they can see
 *      the receipt when they scan.
 *
 * The merchant doesn't need a Cloak account to *receive* — funds land
 * in their normal token account. They only need their viewing key to
 * see the private audit trail.
 */
export async function payInvoicePrivately(
    params: PayInvoicePrivatelyParams
): Promise<PayInvoicePrivatelyResult> {
    const {
        connection,
        payerPublicKey,
        signTransaction,
        signMessage,
        merchantRecipient,
        merchantNkHex,
        mint,
        amountBaseUnits,
        onProgress,
    } = params;

    const { programId, relayUrl } = getCloakConfig();
    const merchantNk = nkFromHex(merchantNkHex);

    onProgress?.("Generating shielded keys…");
    // Ephemeral payer keypair — never persisted. Each private payment
    // is unlinkable on-chain.
    const ephemeralKeypair = await import("@cloak.dev/sdk").then((m) =>
        m.generateUtxoKeypair()
    );

    // Build a single output UTXO holding the full deposit amount.
    const outputUtxo = await createUtxo(
        amountBaseUnits,
        ephemeralKeypair,
        mint
    );
    const dummyOutput = await createZeroUtxo(mint);

    onProgress?.("Depositing into shielded pool…");
    const depositResult = await transact(
        {
            inputUtxos: [],
            outputUtxos: [outputUtxo, dummyOutput],
            externalAmount: amountBaseUnits,
            depositor: payerPublicKey,
        },
        {
            connection,
            programId,
            relayUrl,
            signTransaction,
            signMessage,
            depositorPublicKey: payerPublicKey,
            walletPublicKey: payerPublicKey,
            chainNoteViewingKeyNk: merchantNk,
            onProgress,
        }
    );

    onProgress?.("Withdrawing to merchant…");
    const withdrawResult = await fullWithdraw(
        depositResult.outputUtxos.filter((u: Utxo) => u.amount > BigInt(0)),
        merchantRecipient,
        {
            connection,
            programId,
            relayUrl,
            signTransaction,
            signMessage,
            walletPublicKey: payerPublicKey,
            chainNoteViewingKeyNk: merchantNk,
            onProgress,
        }
    );

    return {
        depositSignature: depositResult.signature,
        withdrawSignature: withdrawResult.signature,
    };
}

// ─── Merchant scan / inbox ─────────────────────────────────────────────

export interface ScanMerchantInboxParams {
    connection: Connection;
    merchantNk: Uint8Array;
    merchantWalletBase58?: string;
    /** Resume scanning after this signature (cache key). */
    untilSignature?: string;
    limit?: number;
    onProgress?: (processed: number, total: number) => void;
}

/**
 * Scan the on-chain Cloak program for chain notes encrypted to the
 * merchant's viewing key, returning a decrypted, sorted list.
 *
 * This is the read-side of "Cloak inbox" — the merchant's audit trail
 * of incoming private payments.
 */
export async function scanMerchantInbox(
    params: ScanMerchantInboxParams
): Promise<ScanResult> {
    const { connection, merchantNk, untilSignature, limit, onProgress } = params;
    const { programId } = getCloakConfig();
    return await scanTransactions({
        connection,
        programId,
        viewingKeyNk: merchantNk,
        untilSignature,
        limit,
        onProgress,
        walletPublicKey: params.merchantWalletBase58,
    });
}

// ─── Compliance / tax export ───────────────────────────────────────────

/** Convert a scan result into a JSON-serialisable compliance report. */
export function buildComplianceReport(scan: ScanResult): ComplianceReport {
    return toComplianceReport(scan);
}

/** Produce a CSV blob of the compliance report (1099-K / 8949 input). */
export function buildComplianceCsv(report: ComplianceReport): string {
    return formatComplianceCsv(report);
}

// ─── Re-exports for convenience ────────────────────────────────────────
export { CLOAK_PROGRAM_ID, SIGN_IN_MESSAGE, generateMasterSeed };
export type { CloakKeyPair, ScanResult, ComplianceReport };
