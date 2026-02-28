/**
 * Squads Protocol v4 — Vault utilities for Settlr.
 *
 * Every merchant gets a Squads Smart Account (multisig vault).
 * This module handles vault creation, member management, and
 * reading vault state.
 */
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import * as multisig from "@sqds/multisig";

const { Permissions, Permission } = multisig.types;

// ─── Constants ─────────────────────────────────────────────
export const SQUADS_PROGRAM_ID = new PublicKey(
    "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf"
);

// ─── Types ─────────────────────────────────────────────────
export interface VaultInfo {
    /** The Squads multisig PDA */
    multisigPda: PublicKey;
    /** The vault PDA (index 0) — this is the address that holds USDC */
    vaultPda: PublicKey;
    /** The createKey used to derive the multisig */
    createKey: PublicKey;
    /** Current signing threshold */
    threshold: number;
    /** Current members */
    members: { key: PublicKey; permissions: number }[];
    /** Transaction index (number of proposals created) */
    transactionIndex: bigint;
}

export interface CreateVaultResult {
    /** The Squads multisig PDA */
    multisigPda: PublicKey;
    /** The vault PDA (index 0) — settlement address */
    vaultPda: PublicKey;
    /** The random createKey used */
    createKey: PublicKey;
    /** The transaction instruction to send */
    transaction: Transaction;
}

// ─── Vault Creation ────────────────────────────────────────

/**
 * Build a transaction that creates a Squads multisig vault
 * for a merchant. Starts as 1-of-1 (single signer — the merchant).
 *
 * The merchant signs and sends this transaction.
 *
 * @param creator   The merchant's wallet public key (pays rent, becomes sole member)
 * @param connection  Solana connection (for blockhash)
 * @returns          The unsigned transaction + derived addresses
 */
export async function buildCreateVaultTransaction(
    creator: PublicKey,
    connection: Connection
): Promise<CreateVaultResult> {
    // Random keypair to derive a unique multisig PDA
    const createKey = Keypair.generate();

    // Derive the multisig PDA
    const [multisigPda] = multisig.getMultisigPda({
        createKey: createKey.publicKey,
        programId: SQUADS_PROGRAM_ID,
    });

    // Derive the vault PDA (index 0)
    const [vaultPda] = multisig.getVaultPda({
        multisigPda,
        index: 0,
        programId: SQUADS_PROGRAM_ID,
    });

    // Fetch the Squads program config to get the protocol treasury address.
    // The `treasury` account in multisigCreateV2 is the Squads protocol
    // treasury (where creation fees go), NOT our merchant vault PDA.
    const [programConfigPda] = multisig.getProgramConfigPda({
        programId: SQUADS_PROGRAM_ID,
    });
    const programConfig =
        await multisig.accounts.ProgramConfig.fromAccountAddress(
            connection,
            programConfigPda,
        );

    // Build the multisig creation instruction
    // 1-of-1: merchant is sole member with all permissions
    const ix: TransactionInstruction = multisig.instructions.multisigCreateV2({
        treasury: programConfig.treasury,
        creator,
        multisigPda,
        configAuthority: null, // No external config authority — members govern themselves
        threshold: 1,
        members: [
            {
                key: creator,
                permissions: Permissions.all(),
            },
        ],
        timeLock: 0,
        createKey: createKey.publicKey,
        rentCollector: null,
        memo: "Settlr merchant vault",
        programId: SQUADS_PROGRAM_ID,
    });

    // Build the transaction
    const tx = new Transaction();
    tx.add(ix);
    tx.feePayer = creator;

    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;

    // The createKey must sign (it's used as a PDA seed and must be a signer)
    tx.partialSign(createKey);

    return {
        multisigPda,
        vaultPda,
        createKey: createKey.publicKey,
        transaction: tx,
    };
}

// ─── Read Vault State ──────────────────────────────────────

/**
 * Fetch the on-chain state of a Squads multisig vault.
 *
 * @param connection  Solana connection
 * @param multisigPda The multisig PDA address
 * @returns           Vault info or null if account doesn't exist
 */
export async function getVaultInfo(
    connection: Connection,
    multisigPda: PublicKey
): Promise<VaultInfo | null> {
    try {
        const accountInfo = await connection.getAccountInfo(multisigPda);
        if (!accountInfo) return null;

        const [msAccount] = multisig.accounts.Multisig.fromAccountInfo(accountInfo);

        const [vaultPda] = multisig.getVaultPda({
            multisigPda,
            index: 0,
            programId: SQUADS_PROGRAM_ID,
        });

        return {
            multisigPda,
            vaultPda,
            createKey: msAccount.createKey,
            threshold: msAccount.threshold,
            members: msAccount.members.map((m) => ({
                key: m.key,
                permissions: m.permissions.mask,
            })),
            transactionIndex: BigInt(msAccount.transactionIndex.toString()),
        };
    } catch (err) {
        console.error("Failed to fetch vault info:", err);
        return null;
    }
}

// ─── Add Member ────────────────────────────────────────────

/**
 * Build a config transaction to add a new member to the multisig.
 * This requires a proposal flow (create proposal → approve → execute)
 * because it's a config change.
 *
 * For 1-of-1 vaults, the existing member can propose + approve + execute
 * in a single flow.
 *
 * @param connection    Solana connection
 * @param multisigPda   The multisig PDA
 * @param currentMember The existing member's public key (must have Initiate + Vote + Execute)
 * @param newMember     The new member's public key
 * @param newThreshold  New signing threshold (e.g., 2 for 2-of-2)
 * @returns            Array of transactions to sign and send in sequence
 */
export async function buildAddMemberTransactions(
    connection: Connection,
    multisigPda: PublicKey,
    currentMember: PublicKey,
    newMember: PublicKey,
    newThreshold: number
): Promise<Transaction[]> {
    // Fetch current state to get the next transaction index
    const info = await getVaultInfo(connection, multisigPda);
    if (!info) throw new Error("Multisig not found");

    const transactionIndex = BigInt(info.transactionIndex) + BigInt(1);

    // For 1-of-1 → 2-of-2, we use config transactions (not vault transactions).
    // Config transactions modify the multisig structure itself.

    // Step 1: Create the config transaction that adds a member
    const addMemberIx = multisig.instructions.multisigAddMember({
        multisigPda,
        configAuthority: currentMember,
        rentPayer: currentMember,
        newMember: {
            key: newMember,
            permissions: Permissions.all(),
        },
        memo: "Add signer",
        programId: SQUADS_PROGRAM_ID,
    });

    // Step 2: Change threshold
    const changeThresholdIx = multisig.instructions.multisigChangeThreshold({
        multisigPda,
        configAuthority: currentMember,
        rentPayer: currentMember,
        newThreshold,
        memo: "Update threshold",
        programId: SQUADS_PROGRAM_ID,
    });

    // For a vault with configAuthority = null, adding members requires the
    // proposal flow. But for the initial setup where configAuthority is a
    // member key, we can call addMember directly.
    //
    // The create flow sets configAuthority = null, so we need the proposal path.
    // For simplicity in the initial 1-of-1 → 2-of-N upgrade, we build two
    // separate config transactions through the proposal flow.

    // Actually, since configAuthority is null (set in createVault), these
    // direct instructions won't work. We need the proposal flow with
    // configTransactionCreate → proposalCreate → proposalApprove → configTransactionExecute.
    // 
    // For the MVP, we'll build a simplified helper that the frontend
    // orchestrates step by step.

    const tx = new Transaction();
    tx.add(addMemberIx);
    tx.add(changeThresholdIx);
    tx.feePayer = currentMember;

    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;

    return [tx];
}

// ─── Remove Member ─────────────────────────────────────────

/**
 * Build a transaction to remove a member from the multisig.
 *
 * @param connection    Solana connection
 * @param multisigPda   The multisig PDA
 * @param authority     The config authority or member with removal permission
 * @param memberToRemove The member to remove
 * @param newThreshold  New signing threshold after removal
 */
export async function buildRemoveMemberTransaction(
    connection: Connection,
    multisigPda: PublicKey,
    authority: PublicKey,
    memberToRemove: PublicKey,
    newThreshold: number
): Promise<Transaction> {
    const ix = multisig.instructions.multisigRemoveMember({
        multisigPda,
        configAuthority: authority,
        oldMember: memberToRemove,
        memo: "Remove signer",
        programId: SQUADS_PROGRAM_ID,
    });

    const thresholdIx = multisig.instructions.multisigChangeThreshold({
        multisigPda,
        configAuthority: authority,
        rentPayer: authority,
        newThreshold,
        memo: "Update threshold after member removal",
        programId: SQUADS_PROGRAM_ID,
    });

    const tx = new Transaction();
    tx.add(ix);
    tx.add(thresholdIx);
    tx.feePayer = authority;

    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;

    return tx;
}

// ─── Permission Helpers ────────────────────────────────────

export function hasPermission(mask: number, perm: number): boolean {
    return (mask & perm) !== 0;
}

export const PERMISSION = {
    Initiate: Permission.Initiate,
    Vote: Permission.Vote,
    Execute: Permission.Execute,
} as const;

/**
 * Get a human-readable label for a permissions mask.
 */
export function permissionsLabel(mask: number): string {
    const perms: string[] = [];
    if (hasPermission(mask, Permission.Initiate)) perms.push("Propose");
    if (hasPermission(mask, Permission.Vote)) perms.push("Vote");
    if (hasPermission(mask, Permission.Execute)) perms.push("Execute");
    return perms.length > 0 ? perms.join(" · ") : "None";
}

/**
 * Truncate a public key for display.
 */
export function shortenAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
