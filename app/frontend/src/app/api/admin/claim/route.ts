/**
 * POST /api/admin/claim
 *
 * Builds a claim_platform_fees transaction for the caller to sign.
 *
 * Two modes, auto-selected based on whether the on-chain
 * `Platform.authority` is a regular wallet OR a Squads vault PDA:
 *
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │ SINGLE-SIG MODE (default — env PLATFORM_MULTISIG_PDA unset)    │
 *   │   Body: { authority: string }                                  │
 *   │   Returns: { mode: "single", transaction, amount }             │
 *   │   The connected wallet IS the platform authority and signs     │
 *   │   the claim ix directly.                                       │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ MULTISIG MODE (env PLATFORM_MULTISIG_PDA set)                  │
 *   │   Body: { authority: string }   // proposer wallet (a member)  │
 *   │   Returns: { mode: "multisig", transaction,                    │
 *   │              transactionIndex, vaultPda, multisigPda, amount } │
 *   │   The wallet creates a Squads vault-tx proposal that wraps the │
 *   │   claim ix. Other members approve via client-side SDK calls;   │
 *   │   anyone executes once threshold is met.                       │
 *   └────────────────────────────────────────────────────────────────┘
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair } from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createAssociatedTokenAccountIdempotentInstruction,
} from "@solana/spl-token";
import { requireAdmin } from "@/lib/admin-auth";
import { USDC_MINT as USDC_MINT_CONST, SOLANA_RPC_URL } from "@/lib/constants";
import {
    buildVaultTransactionProposal,
    getVaultInfo,
    SQUADS_PROGRAM_ID,
} from "@/lib/squads";
import * as multisig from "@sqds/multisig";

const PROGRAM_ID = new PublicKey(
    "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5"
);
const USDC_MINT = USDC_MINT_CONST;
const RPC_URL = SOLANA_RPC_URL;

function getPlatformConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
    );
}
function getPlatformTreasuryPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID
    );
}

function getMultisigPdaFromEnv(): PublicKey | null {
    const raw =
        process.env.PLATFORM_MULTISIG_PDA ||
        process.env.NEXT_PUBLIC_PLATFORM_MULTISIG_PDA ||
        "";
    if (!raw.trim()) return null;
    try {
        return new PublicKey(raw.trim());
    } catch {
        logger.warn("Invalid PLATFORM_MULTISIG_PDA env value:", raw);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = requireAdmin(request);
        if (!auth.ok) return auth.response;

        const body = await request.json();
        const { authority } = body;

        if (!authority) {
            return NextResponse.json(
                { error: "Missing authority wallet address" },
                { status: 400 }
            );
        }
        if (auth.via === "wallet" && auth.wallet && auth.wallet !== authority) {
            return NextResponse.json(
                { error: "authority must match the signed-in wallet" },
                { status: 400 }
            );
        }

        const callerPubkey = new PublicKey(authority);
        const connection = new Connection(RPC_URL, "confirmed");

        const [platformConfigPDA] = getPlatformConfigPDA();
        const [platformTreasuryPDA] = getPlatformTreasuryPDA();

        const dummyWallet = new NodeWallet(Keypair.generate());
        const provider = new AnchorProvider(connection, dummyWallet, {
            commitment: "confirmed",
        });
        const idlModule = await import("@/anchor/x402_hack_payment.json");
        const idl = idlModule.default || idlModule;
        const program = new Program(idl as any, provider);

        const config = await (program.account as any).platform.fetch(
            platformConfigPDA
        );
        const onChainAuthority = (config as any).authority as PublicKey;

        // ── Treasury balance check (same for both modes) ─────────
        let treasuryBalance = 0;
        try {
            const balanceInfo =
                await connection.getTokenAccountBalance(platformTreasuryPDA);
            treasuryBalance = parseFloat(
                balanceInfo.value.uiAmountString || "0"
            );
        } catch {
            return NextResponse.json(
                { error: "Treasury account not found — no fees collected yet" },
                { status: 404 }
            );
        }
        if (treasuryBalance === 0) {
            return NextResponse.json(
                { error: "Treasury is empty — no fees to claim" },
                { status: 400 }
            );
        }

        // ── Decide single-sig vs multisig ─────────────────────────
        const configuredMultisig = getMultisigPdaFromEnv();
        let useMultisig = false;
        let vaultPda: PublicKey | null = null;
        let multisigPda: PublicKey | null = null;

        if (configuredMultisig) {
            const [derivedVault] = multisig.getVaultPda({
                multisigPda: configuredMultisig,
                index: 0,
                programId: SQUADS_PROGRAM_ID,
            });
            // Only use multisig mode if the on-chain authority actually
            // equals the configured vault. If not, fall back to single-sig
            // (e.g. authority migration not yet executed) and warn.
            if (onChainAuthority.equals(derivedVault)) {
                useMultisig = true;
                vaultPda = derivedVault;
                multisigPda = configuredMultisig;
            } else {
                logger.warn(
                    "PLATFORM_MULTISIG_PDA set but on-chain authority does not match its vault PDA — falling back to single-sig.",
                    {
                        onChainAuthority: onChainAuthority.toBase58(),
                        expectedVault: derivedVault.toBase58(),
                    }
                );
            }
        }

        if (useMultisig && vaultPda && multisigPda) {
            // ── MULTISIG MODE: build a Squads vault-tx proposal ───
            const info = await getVaultInfo(connection, multisigPda);
            if (!info) {
                return NextResponse.json(
                    { error: "Multisig account not found at configured PDA" },
                    { status: 500 }
                );
            }
            // Caller must be a member with Initiate permission
            const isMember = info.members.some((m) =>
                m.key.equals(callerPubkey)
            );
            if (!isMember) {
                return NextResponse.json(
                    {
                        error: "Connected wallet is not a member of the platform multisig",
                        members: info.members.map((m) => m.key.toBase58()),
                    },
                    { status: 403 }
                );
            }

            const vaultUsdcAta = getAssociatedTokenAddressSync(
                USDC_MINT,
                vaultPda,
                true // allowOwnerOffCurve — vault PDA is a PDA
            );

            // Inner instructions executed by the vault PDA:
            //   1. idempotent create-ATA (payer = vault) — safe if exists
            //   2. claim_platform_fees (authority = vault)
            const innerIxs: TransactionInstruction[] = [];
            innerIxs.push(
                createAssociatedTokenAccountIdempotentInstruction(
                    vaultPda,
                    vaultUsdcAta,
                    vaultPda,
                    USDC_MINT
                )
            );

            const claimIx = await program.methods
                .claimPlatformFees()
                .accounts({
                    authority: vaultPda,
                    platformConfig: platformConfigPDA,
                    platformTreasuryUsdc: platformTreasuryPDA,
                    authorityUsdc: vaultUsdcAta,
                    usdcMint: USDC_MINT,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                } as any)
                .instruction();
            innerIxs.push(claimIx);

            const proposal = await buildVaultTransactionProposal({
                connection,
                multisigPda,
                creator: callerPubkey,
                instructions: innerIxs,
                memo: `Claim platform fees (~${treasuryBalance.toFixed(2)} USDC)`,
            });

            const serializedTx = proposal.setupTransaction
                .serialize({ requireAllSignatures: false })
                .toString("base64");

            return NextResponse.json({
                mode: "multisig",
                transaction: serializedTx,
                transactionIndex: proposal.transactionIndex.toString(),
                multisigPda: multisigPda.toBase58(),
                vaultPda: vaultPda.toBase58(),
                vaultUsdcAta: vaultUsdcAta.toBase58(),
                threshold: info.threshold,
                memberCount: info.members.length,
                canExecuteImmediately: proposal.canExecuteImmediately,
                amount: treasuryBalance,
            });
        }

        // ── SINGLE-SIG MODE (legacy / pre-migration) ──────────────
        if (!onChainAuthority.equals(callerPubkey)) {
            return NextResponse.json(
                {
                    error: "Unauthorized: connected wallet is not the platform authority",
                    expected: onChainAuthority.toBase58(),
                    provided: callerPubkey.toBase58(),
                    hint: configuredMultisig
                        ? "PLATFORM_MULTISIG_PDA is set but its vault PDA doesn't match the on-chain authority. Run the multisig setup script."
                        : undefined,
                },
                { status: 403 }
            );
        }

        const authorityAta = getAssociatedTokenAddressSync(
            USDC_MINT,
            callerPubkey
        );
        const instructions: TransactionInstruction[] = [];
        try {
            await connection.getTokenAccountBalance(authorityAta);
        } catch {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    callerPubkey,
                    authorityAta,
                    callerPubkey,
                    USDC_MINT
                )
            );
        }

        const claimIx = await program.methods
            .claimPlatformFees()
            .accounts({
                authority: callerPubkey,
                platformConfig: platformConfigPDA,
                platformTreasuryUsdc: platformTreasuryPDA,
                authorityUsdc: authorityAta,
                usdcMint: USDC_MINT,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            } as any)
            .instruction();
        instructions.push(claimIx);

        const tx = new Transaction();
        tx.add(...instructions);
        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = callerPubkey;

        const serializedTx = tx
            .serialize({ requireAllSignatures: false })
            .toString("base64");

        return NextResponse.json({
            mode: "single",
            transaction: serializedTx,
            amount: treasuryBalance,
            blockhash,
            lastValidBlockHeight,
        });
    } catch (error: any) {
        logger.error("Admin claim API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to build claim transaction" },
            { status: 500 }
        );
    }
}
