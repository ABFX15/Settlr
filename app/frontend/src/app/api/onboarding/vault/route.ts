/**
 * POST /api/onboarding/vault — Sponsor Squads vault creation.
 *
 * A brand-new (email / embedded) wallet has 0 SOL and can't pay the rent +
 * Squads protocol fee to create its multisig vault. This endpoint builds the
 * vault-creation transaction with the platform FEE_PAYER as fee payer,
 * co-signs it (fee payer + the random createKey), and returns it for the user
 * to add their signature and submit. The user pays nothing.
 *
 * Safety: the server constructs the instruction itself — a Squads
 * `multisigCreateV2` with the requesting wallet as the sole 1-of-1 member —
 * so the fee payer can only ever sign a vault-creation for the caller, never
 * an arbitrary transfer. Rate-limited per IP to bound sponsorship spend.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SOLANA_RPC_URL } from "@/lib/constants";
import { buildCreateVaultTransaction } from "@/lib/squads";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        // Bound how many vaults a single client can sponsor.
        const limited = await checkRateLimit(`vault-create:${getClientIp(request)}`);
        if (limited) return limited;

        const body = await request.json().catch(() => ({}));
        const { creator } = body as { creator?: string };

        if (!creator || typeof creator !== "string") {
            return NextResponse.json(
                { error: "creator wallet address is required" },
                { status: 400 },
            );
        }

        let creatorPubkey: PublicKey;
        try {
            creatorPubkey = new PublicKey(creator);
        } catch {
            return NextResponse.json(
                { error: "invalid creator wallet address" },
                { status: 400 },
            );
        }

        const feePayerSecret = process.env.FEE_PAYER_SECRET_KEY;
        if (!feePayerSecret) {
            // No sponsor configured — tell the client so it can fall back to
            // the self-pay path (the wallet must hold SOL).
            return NextResponse.json(
                { error: "sponsorship_unavailable" },
                { status: 503 },
            );
        }

        let feePayer: Keypair;
        try {
            feePayer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(feePayerSecret)));
        } catch {
            logger.error("[onboarding/vault] FEE_PAYER_SECRET_KEY is malformed");
            return NextResponse.json(
                { error: "sponsorship_misconfigured" },
                { status: 500 },
            );
        }

        const connection = new Connection(SOLANA_RPC_URL, "confirmed");

        // Build with the fee payer as payer; the builder partial-signs with the
        // createKey. We then add the fee payer's signature.
        const { multisigPda, vaultPda, transaction } =
            await buildCreateVaultTransaction(
                creatorPubkey,
                connection,
                feePayer.publicKey,
            );
        transaction.partialSign(feePayer);

        // Serialize without requiring the creator's signature yet.
        const serialized = transaction
            .serialize({ requireAllSignatures: false, verifySignatures: false })
            .toString("base64");

        logger.info(
            `[onboarding/vault] Sponsored vault tx for ${creator.slice(0, 8)}… (multisig ${multisigPda.toBase58().slice(0, 8)}…)`,
        );

        return NextResponse.json({
            transaction: serialized,
            multisigPda: multisigPda.toBase58(),
            vaultPda: vaultPda.toBase58(),
            feePayer: feePayer.publicKey.toBase58(),
        });
    } catch (error) {
        logger.error("[onboarding/vault] Sponsor error:", error);
        return NextResponse.json(
            { error: "Failed to prepare vault transaction" },
            { status: 500 },
        );
    }
}
