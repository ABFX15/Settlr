/**
 * Squads Protocol v4 — Vault utilities for Offbank.
 *
 * Every merchant gets a Squads Smart Account (multisig vault).
 * This module handles vault creation, member management, and
 * reading vault state.
 */
import { logger } from "@/lib/logger";
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
 * @param creator   The merchant's wallet public key (becomes sole member)
 * @param connection  Solana connection (for blockhash)
 * @param feePayer  Optional sponsor that pays rent + fees instead of the
 *                  creator. Used for gasless onboarding so a brand-new
 *                  wallet with 0 SOL can still create its vault. The sponsor
 *                  must co-sign the returned transaction. Defaults to creator.
 * @returns          The unsigned transaction + derived addresses
 */
export async function buildCreateVaultTransaction(
    creator: PublicKey,
    connection: Connection,
    feePayer?: PublicKey
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
        memo: "Offbank merchant vault",
        programId: SQUADS_PROGRAM_ID,
    });

    // Build the transaction
    const tx = new Transaction();
    tx.add(ix);
    // The sponsor (if any) pays rent + fees; otherwise the creator does.
    tx.feePayer = feePayer ?? creator;

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
        logger.error("Failed to fetch vault info:", err);
        return null;
    }
}

// ─── Add Member (proposal flow) ────────────────────────────

/**
 * Result of building an add-member proposal — caller signs and sends each
 * transaction in order. For a 1-of-1 vault, the existing member can do
 * all four steps in sequence and the change executes immediately.
 *
 * For higher-threshold vaults, only the `create` and `approve`
 * transactions are returned and the proposal must wait for additional
 * approvals before `execute` can be called.
 */
export interface AddMemberProposalResult {
    transactionIndex: bigint;
    /**
     * Ordered list of transactions to sign and send. Each one MUST be
     * confirmed before sending the next, since later steps depend on
     * earlier on-chain state (the proposal account, the vote tally).
     */
    transactions: { label: string; transaction: Transaction }[];
    /** True if `execute` was included (only when proposing member can also execute). */
    canExecuteImmediately: boolean;
}

/**
 * Build the four-instruction proposal flow that adds a new signer and
 * updates the threshold on a Squads v4 multisig whose configAuthority
 * is null (i.e. members govern themselves — the default for Offbank
 * vaults).
 *
 * Steps:
 *   1. configTransactionCreate   — defines the AddMember + ChangeThreshold actions
 *   2. proposalCreate            — opens the proposal for voting
 *   3. proposalApprove           — proposer casts their vote
 *   4. configTransactionExecute  — applies the changes (only valid once
 *                                  the threshold of approvals is met)
 *
 * For a 1-of-1 vault, all four are returned. For a k-of-n vault with
 * k > 1, step 4 is omitted and other members must call proposalApprove
 * separately before someone can execute.
 */
export async function buildAddMemberTransactions(
    connection: Connection,
    multisigPda: PublicKey,
    currentMember: PublicKey,
    newMember: PublicKey,
    newThreshold: number
): Promise<AddMemberProposalResult> {
    const info = await getVaultInfo(connection, multisigPda);
    if (!info) throw new Error("Multisig not found");

    if (newThreshold < 1 || newThreshold > info.members.length + 1) {
        throw new Error(
            `New threshold ${newThreshold} out of range for ${info.members.length + 1} members`,
        );
    }
    if (info.members.some((m) => m.key.equals(newMember))) {
        throw new Error("Member already exists in this multisig");
    }

    const transactionIndex = info.transactionIndex + BigInt(1);

    // 1. Config transaction: define add-member + change-threshold actions
    const createIx = multisig.instructions.configTransactionCreate({
        multisigPda,
        transactionIndex,
        creator: currentMember,
        rentPayer: currentMember,
        actions: [
            {
                __kind: "AddMember",
                newMember: {
                    key: newMember,
                    permissions: Permissions.all(),
                },
            },
            {
                __kind: "ChangeThreshold",
                newThreshold,
            },
        ],
        memo: "Add signer + update threshold",
        programId: SQUADS_PROGRAM_ID,
    });

    // 2. Open the proposal
    const proposalIx = multisig.instructions.proposalCreate({
        multisigPda,
        transactionIndex,
        creator: currentMember,
        rentPayer: currentMember,
        programId: SQUADS_PROGRAM_ID,
    });

    // 3. Proposer's approval vote
    const approveIx = multisig.instructions.proposalApprove({
        multisigPda,
        transactionIndex,
        member: currentMember,
        memo: "Self-approve add-signer proposal",
        programId: SQUADS_PROGRAM_ID,
    });

    // 4. Execute — only safe if proposer's single vote is enough to clear
    // the *current* threshold. Otherwise other members need to approve first.
    const canExecuteImmediately = info.threshold <= 1;

    const buildTx = (instructions: TransactionInstruction[]) => {
        const tx = new Transaction();
        for (const ix of instructions) tx.add(ix);
        tx.feePayer = currentMember;
        return tx;
    };

    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

    const transactions: { label: string; transaction: Transaction }[] = [];

    // Bundle create + open + approve into one tx (saves the user 2 signatures
    // + 2 confirmations). If they fit; if not we'd split. They do fit.
    const setupTx = buildTx([createIx, proposalIx, approveIx]);
    setupTx.recentBlockhash = blockhash;
    setupTx.lastValidBlockHeight = lastValidBlockHeight;
    transactions.push({ label: "Create + open + approve proposal", transaction: setupTx });

    if (canExecuteImmediately) {
        const executeIx = multisig.instructions.configTransactionExecute({
            multisigPda,
            transactionIndex,
            member: currentMember,
            rentPayer: currentMember,
            programId: SQUADS_PROGRAM_ID,
        });
        const execTx = buildTx([executeIx]);
        // Execute must be sent AFTER setup confirms. The frontend will fetch
        // a fresh blockhash before sending, but we set one here for parity.
        execTx.recentBlockhash = blockhash;
        execTx.lastValidBlockHeight = lastValidBlockHeight;
        transactions.push({ label: "Execute config change", transaction: execTx });
    }

    return {
        transactionIndex,
        transactions,
        canExecuteImmediately,
    };
}

/**
 * Build a standalone execute transaction for an existing approved proposal.
 * Used when a higher-threshold vault has accumulated enough approvals and
 * any member wants to apply the change.
 */
export async function buildExecuteProposalTransaction(
    connection: Connection,
    multisigPda: PublicKey,
    member: PublicKey,
    transactionIndex: bigint,
): Promise<Transaction> {
    const ix = multisig.instructions.configTransactionExecute({
        multisigPda,
        transactionIndex,
        member,
        rentPayer: member,
        programId: SQUADS_PROGRAM_ID,
    });
    const tx = new Transaction();
    tx.add(ix);
    tx.feePayer = member;
    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    return tx;
}

/**
 * Approve an existing proposal. Used by additional signers in a k-of-n
 * vault to vote on an open add/remove-member proposal.
 */
export async function buildApproveProposalTransaction(
    connection: Connection,
    multisigPda: PublicKey,
    member: PublicKey,
    transactionIndex: bigint,
): Promise<Transaction> {
    const ix = multisig.instructions.proposalApprove({
        multisigPda,
        transactionIndex,
        member,
        memo: "Approve config change",
        programId: SQUADS_PROGRAM_ID,
    });
    const tx = new Transaction();
    tx.add(ix);
    tx.feePayer = member;
    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    return tx;
}

// ─── Remove Member (proposal flow) ─────────────────────────

/**
 * Build a remove-member proposal using the same config-transaction flow as
 * `buildAddMemberTransactions`. The new threshold must be ≤ remaining
 * member count.
 */
export async function buildRemoveMemberTransaction(
    connection: Connection,
    multisigPda: PublicKey,
    currentMember: PublicKey,
    memberToRemove: PublicKey,
    newThreshold: number
): Promise<AddMemberProposalResult> {
    const info = await getVaultInfo(connection, multisigPda);
    if (!info) throw new Error("Multisig not found");
    if (!info.members.some((m) => m.key.equals(memberToRemove))) {
        throw new Error("Member not found in this multisig");
    }
    const remaining = info.members.length - 1;
    if (newThreshold < 1 || newThreshold > remaining) {
        throw new Error(
            `New threshold ${newThreshold} out of range for ${remaining} remaining members`,
        );
    }

    const transactionIndex = info.transactionIndex + BigInt(1);

    const createIx = multisig.instructions.configTransactionCreate({
        multisigPda,
        transactionIndex,
        creator: currentMember,
        rentPayer: currentMember,
        actions: [
            { __kind: "RemoveMember", oldMember: memberToRemove },
            { __kind: "ChangeThreshold", newThreshold },
        ],
        memo: "Remove signer + update threshold",
        programId: SQUADS_PROGRAM_ID,
    });
    const proposalIx = multisig.instructions.proposalCreate({
        multisigPda,
        transactionIndex,
        creator: currentMember,
        rentPayer: currentMember,
        programId: SQUADS_PROGRAM_ID,
    });
    const approveIx = multisig.instructions.proposalApprove({
        multisigPda,
        transactionIndex,
        member: currentMember,
        memo: "Self-approve remove-signer proposal",
        programId: SQUADS_PROGRAM_ID,
    });

    const canExecuteImmediately = info.threshold <= 1;

    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

    const setupTx = new Transaction().add(createIx, proposalIx, approveIx);
    setupTx.feePayer = currentMember;
    setupTx.recentBlockhash = blockhash;
    setupTx.lastValidBlockHeight = lastValidBlockHeight;
    const transactions = [{ label: "Create + open + approve proposal", transaction: setupTx }];

    if (canExecuteImmediately) {
        const executeIx = multisig.instructions.configTransactionExecute({
            multisigPda,
            transactionIndex,
            member: currentMember,
            rentPayer: currentMember,
            programId: SQUADS_PROGRAM_ID,
        });
        const execTx = new Transaction().add(executeIx);
        execTx.feePayer = currentMember;
        execTx.recentBlockhash = blockhash;
        execTx.lastValidBlockHeight = lastValidBlockHeight;
        transactions.push({ label: "Execute config change", transaction: execTx });
    }

    return { transactionIndex, transactions, canExecuteImmediately };
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

// ─── Vault Transactions (arbitrary instructions, e.g. claim fees) ─────────
//
// Squads v4 lets a vault execute any arbitrary instructions via:
//   1. vaultTransactionCreate  — stores the inner TransactionMessage on chain
//   2. proposalCreate          — opens it for voting
//   3. proposalApprove         — each member votes (k votes needed)
//   4. vaultTransactionExecute — once threshold met, anyone executes
//
// We use this to gate `claim_platform_fees` behind the platform multisig.

import { TransactionMessage } from "@solana/web3.js";

export interface VaultProposalResult {
    transactionIndex: bigint;
    /** Tx that creates the vault tx, opens proposal, and casts proposer's vote. */
    setupTransaction: Transaction;
    /** True if the proposer's single vote already meets threshold. */
    canExecuteImmediately: boolean;
}

/**
 * Build a Squads vault-transaction proposal that, when approved & executed,
 * runs `instructions` from the vault PDA.
 *
 * The caller (proposer) signs and sends `setupTransaction`. After the
 * threshold of approvals is reached, any member calls
 * `buildVaultTransactionExecute` to apply the inner instructions.
 *
 * @param vaultIndex Defaults to 0 (the standard vault PDA).
 */
export async function buildVaultTransactionProposal(args: {
    connection: Connection;
    multisigPda: PublicKey;
    creator: PublicKey;
    instructions: TransactionInstruction[];
    memo?: string;
    vaultIndex?: number;
}): Promise<VaultProposalResult> {
    const {
        connection,
        multisigPda,
        creator,
        instructions,
        memo,
        vaultIndex = 0,
    } = args;

    const info = await getVaultInfo(connection, multisigPda);
    if (!info) throw new Error("Multisig not found");

    const [vaultPda] = multisig.getVaultPda({
        multisigPda,
        index: vaultIndex,
        programId: SQUADS_PROGRAM_ID,
    });

    const transactionIndex = info.transactionIndex + BigInt(1);

    // Build the inner TransactionMessage that the vault will execute.
    // Blockhash is irrelevant for the inner message (Squads strips it),
    // so we use the latest one to keep validators happy.
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    const innerMessage = new TransactionMessage({
        payerKey: vaultPda,
        recentBlockhash: blockhash,
        instructions,
    });

    // 1. Store the inner message
    const createIx = multisig.instructions.vaultTransactionCreate({
        multisigPda,
        transactionIndex,
        creator,
        rentPayer: creator,
        vaultIndex,
        ephemeralSigners: 0,
        transactionMessage: innerMessage,
        memo,
        programId: SQUADS_PROGRAM_ID,
    });

    // 2. Open proposal
    const proposalIx = multisig.instructions.proposalCreate({
        multisigPda,
        transactionIndex,
        creator,
        rentPayer: creator,
        programId: SQUADS_PROGRAM_ID,
    });

    // 3. Proposer's approval
    const approveIx = multisig.instructions.proposalApprove({
        multisigPda,
        transactionIndex,
        member: creator,
        memo: memo ? `Self-approve: ${memo}` : "Self-approve",
        programId: SQUADS_PROGRAM_ID,
    });

    const setupTx = new Transaction().add(createIx, proposalIx, approveIx);
    setupTx.feePayer = creator;
    const { blockhash: setupBh, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    setupTx.recentBlockhash = setupBh;
    setupTx.lastValidBlockHeight = lastValidBlockHeight;

    return {
        transactionIndex,
        setupTransaction: setupTx,
        canExecuteImmediately: info.threshold <= 1,
    };
}

/**
 * Build an approval-vote tx for an existing vault-transaction proposal.
 * Used by additional members in a k-of-n vault.
 */
export async function buildVaultTransactionApprove(args: {
    connection: Connection;
    multisigPda: PublicKey;
    member: PublicKey;
    transactionIndex: bigint;
    memo?: string;
}): Promise<Transaction> {
    const { connection, multisigPda, member, transactionIndex, memo } = args;
    const ix = multisig.instructions.proposalApprove({
        multisigPda,
        transactionIndex,
        member,
        memo: memo ?? "Approve vault tx",
        programId: SQUADS_PROGRAM_ID,
    });
    const tx = new Transaction().add(ix);
    tx.feePayer = member;
    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    return tx;
}

/**
 * Build the execute tx that runs the inner instructions of an approved
 * vault-transaction proposal. Squads SDK auto-loads the stored inner
 * message and resolves the required remaining accounts.
 */
export async function buildVaultTransactionExecute(args: {
    connection: Connection;
    multisigPda: PublicKey;
    executor: PublicKey;
    transactionIndex: bigint;
}): Promise<Transaction> {
    const { connection, multisigPda, executor, transactionIndex } = args;
    const { instruction } = await multisig.instructions.vaultTransactionExecute({
        connection,
        multisigPda,
        transactionIndex,
        member: executor,
        programId: SQUADS_PROGRAM_ID,
    });
    const tx = new Transaction().add(instruction);
    tx.feePayer = executor;
    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    return tx;
}

// ─── Proposal Inspection ───────────────────────────────────

export interface ProposalSummary {
    transactionIndex: bigint;
    /** Status: "draft" | "active" | "approved" | "rejected" | "executed" | "cancelled" */
    status: string;
    approvers: PublicKey[];
    rejectors: PublicKey[];
    cancellers: PublicKey[];
}

/**
 * Fetch the current state of a single proposal.
 * Returns null if the proposal account doesn't exist (yet).
 */
export async function getProposal(
    connection: Connection,
    multisigPda: PublicKey,
    transactionIndex: bigint,
): Promise<ProposalSummary | null> {
    try {
        const [proposalPda] = multisig.getProposalPda({
            multisigPda,
            transactionIndex,
            programId: SQUADS_PROGRAM_ID,
        });
        const accountInfo = await connection.getAccountInfo(proposalPda);
        if (!accountInfo) return null;
        const [proposal] = multisig.accounts.Proposal.fromAccountInfo(accountInfo);
        const statusKind = (proposal.status as { __kind: string }).__kind;
        return {
            transactionIndex,
            status: statusKind.toLowerCase(),
            approvers: proposal.approved,
            rejectors: proposal.rejected,
            cancellers: proposal.cancelled,
        };
    } catch (err) {
        logger.error("Failed to fetch proposal:", err);
        return null;
    }
}

/**
 * List the most recent N pending proposals (status "active" or "approved")
 * by walking back from the multisig's current transactionIndex.
 */
export async function listPendingProposals(
    connection: Connection,
    multisigPda: PublicKey,
    lookback = 20,
): Promise<ProposalSummary[]> {
    const info = await getVaultInfo(connection, multisigPda);
    if (!info) return [];
    const start = info.transactionIndex;
    if (start === BigInt(0)) return [];

    const out: ProposalSummary[] = [];
    const end = start > BigInt(lookback) ? start - BigInt(lookback) + BigInt(1) : BigInt(1);

    // Fetch in parallel
    const indices: bigint[] = [];
    for (let i = start; i >= end; i = i - BigInt(1)) indices.push(i);

    const proposals = await Promise.all(
        indices.map((idx) => getProposal(connection, multisigPda, idx)),
    );
    for (const p of proposals) {
        if (p && (p.status === "active" || p.status === "approved")) out.push(p);
    }
    return out;
}
