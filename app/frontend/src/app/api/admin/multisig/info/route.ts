/**
 * GET /api/admin/multisig/info
 *
 * Returns the current Squads multisig state for the platform fee treasury,
 * including pending claim proposals.
 *
 * Response shape:
 *   { enabled: false }                                 — multisig not configured
 *   { enabled: true, multisigPda, vaultPda, threshold,
 *     members: [{ key, permissions }],
 *     authorityMatches: bool,                          — vault PDA == on-chain authority
 *     pendingProposals: [{ transactionIndex, status,
 *                          approvers, rejectors }] }
 *
 * Auth: requires admin wallet (read-only — but we still gate to prevent
 * arbitrary public probing of the multisig membership).
 */

import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair } from "@solana/web3.js";
import { requireAdmin } from "@/lib/admin-auth";
import { SOLANA_RPC_URL } from "@/lib/constants";
import {
    getVaultInfo,
    listPendingProposals,
    SQUADS_PROGRAM_ID,
} from "@/lib/squads";
import * as multisig from "@sqds/multisig";

const PROGRAM_ID = new PublicKey(
    "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5"
);

function getPlatformConfigPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
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
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const auth = requireAdmin(request);
        if (!auth.ok) return auth.response;

        const configuredMultisig = getMultisigPdaFromEnv();
        if (!configuredMultisig) {
            return NextResponse.json({ enabled: false });
        }

        const connection = new Connection(SOLANA_RPC_URL, "confirmed");

        const info = await getVaultInfo(connection, configuredMultisig);
        if (!info) {
            return NextResponse.json({
                enabled: true,
                error: "Multisig PDA configured but account not found on-chain",
                multisigPda: configuredMultisig.toBase58(),
            });
        }

        const [vaultPda] = multisig.getVaultPda({
            multisigPda: configuredMultisig,
            index: 0,
            programId: SQUADS_PROGRAM_ID,
        });

        // Cross-check: does on-chain Platform.authority == this vault?
        let authorityMatches = false;
        let onChainAuthority = "";
        try {
            const dummyWallet = new NodeWallet(Keypair.generate());
            const provider = new AnchorProvider(connection, dummyWallet, {
                commitment: "confirmed",
            });
            const idlModule = await import(
                "@/anchor/x402_hack_payment.json"
            );
            const idl = idlModule.default || idlModule;
            const program = new Program(idl as any, provider);
            const [platformConfigPDA] = getPlatformConfigPDA();
            const config = await (program.account as any).platform.fetch(
                platformConfigPDA
            );
            const auth = (config as any).authority as PublicKey;
            onChainAuthority = auth.toBase58();
            authorityMatches = auth.equals(vaultPda);
        } catch (err) {
            console.warn("Failed to fetch platform config:", err);
        }

        const pending = await listPendingProposals(
            connection,
            configuredMultisig,
            20
        );

        return NextResponse.json({
            enabled: true,
            multisigPda: configuredMultisig.toBase58(),
            vaultPda: vaultPda.toBase58(),
            threshold: info.threshold,
            members: info.members.map((m) => ({
                key: m.key.toBase58(),
                permissions: m.permissions,
            })),
            transactionIndex: info.transactionIndex.toString(),
            onChainAuthority,
            authorityMatches,
            pendingProposals: pending.map((p) => ({
                transactionIndex: p.transactionIndex.toString(),
                status: p.status,
                approvers: p.approvers.map((k) => k.toBase58()),
                rejectors: p.rejectors.map((k) => k.toBase58()),
            })),
        });
    } catch (error: any) {
        console.error("multisig/info error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to load multisig info" },
            { status: 500 }
        );
    }
}
