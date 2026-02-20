/**
 * POST /api/admin/claim — Build an unsigned claim_platform_fees transaction
 *
 * Body: { authority: string }  (the wallet pubkey that will sign)
 *
 * Returns a base64-encoded serialized transaction for the client to sign.
 * The connected wallet MUST be the platform authority.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair } from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

const PROGRAM_ID = new PublicKey(
    "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5"
);
const USDC_MINT = new PublicKey(
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
const RPC_URL =
    process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { authority } = body;

        if (!authority) {
            return NextResponse.json(
                { error: "Missing authority wallet address" },
                { status: 400 }
            );
        }

        const authorityPubkey = new PublicKey(authority);
        const connection = new Connection(RPC_URL, "confirmed");

        // Verify this wallet is actually the platform authority
        const [platformConfigPDA] = getPlatformConfigPDA();
        const [platformTreasuryPDA] = getPlatformTreasuryPDA();

        // Read-only provider to fetch config
        const dummyWallet = new NodeWallet(Keypair.generate());
        const provider = new AnchorProvider(connection, dummyWallet, {
            commitment: "confirmed",
        });

        const idlModule = await import("@/anchor/x402_hack_payment.json");
        const idl = idlModule.default || idlModule;
        const program = new Program(idl as any, provider);

        // Fetch platform config to verify authority
        const config = await (program.account as any).platform.fetch(
            platformConfigPDA
        );
        const onChainAuthority = (config as any).authority as PublicKey;

        if (!onChainAuthority.equals(authorityPubkey)) {
            return NextResponse.json(
                {
                    error: "Unauthorized: connected wallet is not the platform authority",
                    expected: onChainAuthority.toBase58(),
                    provided: authorityPubkey.toBase58(),
                },
                { status: 403 }
            );
        }

        // Check treasury balance first
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

        // Build the claim_platform_fees instruction
        const authorityAta = getAssociatedTokenAddressSync(
            USDC_MINT,
            authorityPubkey
        );

        // Check if authority ATA exists — if not, prepend a create-ATA instruction
        const instructions: TransactionInstruction[] = [];
        try {
            await connection.getTokenAccountBalance(authorityAta);
        } catch {
            instructions.push(
                createAssociatedTokenAccountInstruction(
                    authorityPubkey,
                    authorityAta,
                    authorityPubkey,
                    USDC_MINT
                )
            );
        }

        // Build the Anchor instruction (not rpc — just the instruction)
        const claimIx = await program.methods
            .claimPlatformFees()
            .accounts({
                authority: authorityPubkey,
                platformConfig: platformConfigPDA,
                platformTreasuryUsdc: platformTreasuryPDA,
                authorityUsdc: authorityAta,
                usdcMint: USDC_MINT,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            } as any)
            .instruction();

        instructions.push(claimIx);

        // Build the transaction
        const tx = new Transaction();
        tx.add(...instructions);

        // Set recent blockhash and fee payer
        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = authorityPubkey;

        // Serialize and return (unsigned — client will sign)
        const serializedTx = tx
            .serialize({ requireAllSignatures: false })
            .toString("base64");

        return NextResponse.json({
            transaction: serializedTx,
            amount: treasuryBalance,
            blockhash,
            lastValidBlockHeight,
        });
    } catch (error: any) {
        console.error("Admin claim API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to build claim transaction" },
            { status: 500 }
        );
    }
}
