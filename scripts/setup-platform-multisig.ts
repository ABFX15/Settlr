/**
 * scripts/setup-platform-multisig.ts
 *
 * One-shot setup that:
 *   1. Creates a new Squads v4 multisig with the configured members + threshold
 *   2. Calls `transfer_authority` on the platform program to point
 *      Platform.authority at the new vault PDA
 *   3. Prints the multisig PDA + vault PDA so you can set
 *      `PLATFORM_MULTISIG_PDA` in your frontend env
 *
 * After running this, the on-chain `claim_platform_fees` instruction can
 * only be invoked by the multisig vault (via Squads `vaultTransactionExecute`
 * CPI). The admin UI auto-detects the multisig and switches to a
 * propose / approve / execute flow.
 *
 * Run with:
 *   PAYER_KEYPAIR=~/.config/solana/id.json \
 *   MEMBERS=Pubkey1,Pubkey2,Pubkey3 \
 *   THRESHOLD=2 \
 *   RPC_URL=https://api.devnet.solana.com \
 *   npx ts-node scripts/setup-platform-multisig.ts
 *
 * Required env:
 *   - PAYER_KEYPAIR   path to current authority keypair (must be the
 *                     present `Platform.authority`)
 *   - MEMBERS         comma-separated member pubkeys (any number, ≥ THRESHOLD)
 *   - THRESHOLD       integer signing threshold (e.g. 2 for 2-of-3)
 *
 * Optional env:
 *   - RPC_URL         defaults to devnet
 *   - PROGRAM_ID      defaults to the deployed Settlr program id
 */

import * as anchor from "@coral-xyz/anchor";
import {
    PublicKey,
    Connection,
    Keypair,
    Transaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import * as multisig from "@sqds/multisig";

const { Permissions } = multisig.types;

const SQUADS_PROGRAM_ID = new PublicKey(
    "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf",
);

const PROGRAM_ID = new PublicKey(
    process.env.PROGRAM_ID ||
    "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5",
);
const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";

function loadKeypair(p: string): Keypair {
    const expanded = p.startsWith("~")
        ? path.join(process.env.HOME || "", p.slice(1))
        : p;
    if (!fs.existsSync(expanded)) {
        throw new Error(`Keypair file not found: ${expanded}`);
    }
    const secret = JSON.parse(fs.readFileSync(expanded, "utf-8"));
    return Keypair.fromSecretKey(new Uint8Array(secret));
}

async function main() {
    console.log("🔐 Settlr — Platform Multisig Setup\n");
    console.log("=".repeat(60));

    // ── Validate env ─────────────────────────────────────────────
    const payerPath = process.env.PAYER_KEYPAIR;
    const membersRaw = process.env.MEMBERS;
    const thresholdRaw = process.env.THRESHOLD;

    if (!payerPath || !membersRaw || !thresholdRaw) {
        console.error(
            "\n❌ Missing required env vars.\n" +
            "   PAYER_KEYPAIR=...    path to current platform.authority keypair\n" +
            "   MEMBERS=Pk1,Pk2,Pk3  comma-separated member pubkeys\n" +
            "   THRESHOLD=2          signing threshold (e.g. 2 for 2-of-3)\n",
        );
        process.exit(1);
    }

    const payer = loadKeypair(payerPath);
    const memberKeys = membersRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => new PublicKey(s));
    const threshold = parseInt(thresholdRaw, 10);

    if (memberKeys.length < 1) {
        console.error("❌ MEMBERS must contain at least one pubkey");
        process.exit(1);
    }
    if (
        Number.isNaN(threshold) ||
        threshold < 1 ||
        threshold > memberKeys.length
    ) {
        console.error(
            `❌ THRESHOLD (${thresholdRaw}) must be 1..${memberKeys.length}`,
        );
        process.exit(1);
    }

    console.log(`Program ID:      ${PROGRAM_ID.toBase58()}`);
    console.log(`RPC URL:         ${RPC_URL}`);
    console.log(`Payer wallet:    ${payer.publicKey.toBase58()}`);
    console.log(`Threshold:       ${threshold}-of-${memberKeys.length}`);
    console.log(`Members:`);
    memberKeys.forEach((k, i) => console.log(`  ${i + 1}. ${k.toBase58()}`));
    console.log("=".repeat(60));

    const connection = new Connection(RPC_URL, "confirmed");

    // Sanity-check: payer is currently the platform authority
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID,
    );
    const platformAccount = await connection.getAccountInfo(platformConfigPDA);
    if (!platformAccount) {
        console.error(
            `\n❌ Platform config account not found at ${platformConfigPDA.toBase58()}.\n` +
            `   Run set_platform_config first.`,
        );
        process.exit(1);
    }
    // Platform layout: 8 (disc) + Pubkey authority + ...
    const onChainAuthority = new PublicKey(
        platformAccount.data.slice(8, 8 + 32),
    );
    console.log(`\nOn-chain authority: ${onChainAuthority.toBase58()}`);
    if (!onChainAuthority.equals(payer.publicKey)) {
        console.error(
            `❌ Payer (${payer.publicKey.toBase58()}) is not the current platform authority.\n` +
            `   This script must be run by the wallet that currently controls the platform.`,
        );
        process.exit(1);
    }
    console.log("✅ Payer is the current platform authority\n");

    // ── 1. Create the Squads multisig ───────────────────────────
    const createKey = Keypair.generate();
    const [multisigPda] = multisig.getMultisigPda({
        createKey: createKey.publicKey,
        programId: SQUADS_PROGRAM_ID,
    });
    const [vaultPda] = multisig.getVaultPda({
        multisigPda,
        index: 0,
        programId: SQUADS_PROGRAM_ID,
    });

    console.log(`📦 New multisig PDA:  ${multisigPda.toBase58()}`);
    console.log(`📦 New vault PDA:     ${vaultPda.toBase58()}`);
    console.log(`📦 Create key:        ${createKey.publicKey.toBase58()}\n`);

    const [programConfigPda] = multisig.getProgramConfigPda({
        programId: SQUADS_PROGRAM_ID,
    });
    const programConfig =
        await multisig.accounts.ProgramConfig.fromAccountAddress(
            connection,
            programConfigPda,
        );

    const createIx = multisig.instructions.multisigCreateV2({
        treasury: programConfig.treasury,
        creator: payer.publicKey,
        multisigPda,
        configAuthority: null,
        threshold,
        members: memberKeys.map((key) => ({
            key,
            permissions: Permissions.all(),
        })),
        timeLock: 0,
        createKey: createKey.publicKey,
        rentCollector: null,
        memo: "Settlr platform fee multisig",
        programId: SQUADS_PROGRAM_ID,
    });

    const createTx = new Transaction().add(createIx);
    createTx.feePayer = payer.publicKey;
    const { blockhash: bh1, lastValidBlockHeight: lh1 } =
        await connection.getLatestBlockhash("confirmed");
    createTx.recentBlockhash = bh1;
    createTx.lastValidBlockHeight = lh1;
    createTx.partialSign(createKey, payer);

    console.log("⏳ Creating Squads multisig...");
    const createSig = await connection.sendRawTransaction(createTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
    });
    await connection.confirmTransaction(
        { signature: createSig, blockhash: bh1, lastValidBlockHeight: lh1 },
        "confirmed",
    );
    console.log(`✅ Multisig created: ${createSig}\n`);

    // ── 2. Transfer Platform.authority → vault PDA ──────────────
    console.log("⏳ Transferring platform authority to vault PDA...");

    const idlPath = path.join(
        __dirname,
        "../target/idl/x402_hack_payment.json",
    );
    if (!fs.existsSync(idlPath)) {
        console.error(
            `❌ IDL not found at ${idlPath}. Run \`anchor build\` first.`,
        );
        process.exit(1);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
    const provider = new anchor.AnchorProvider(
        connection,
        new anchor.Wallet(payer),
        { commitment: "confirmed" },
    );
    const program = new anchor.Program(idl as any, provider);

    const transferSig = await program.methods
        .transferAuthority()
        .accounts({
            authority: payer.publicKey,
            newAuthority: vaultPda,
            platformConfig: platformConfigPDA,
        } as any)
        .rpc();
    console.log(`✅ Authority transferred: ${transferSig}\n`);

    // ── 3. Verify ───────────────────────────────────────────────
    const updated = await connection.getAccountInfo(platformConfigPDA);
    const newAuthority = new PublicKey(updated!.data.slice(8, 8 + 32));
    if (!newAuthority.equals(vaultPda)) {
        console.error(
            `❌ Verification failed. On-chain authority is now ${newAuthority.toBase58()}, expected ${vaultPda.toBase58()}.`,
        );
        process.exit(1);
    }
    console.log(`✅ Verified: Platform.authority == ${vaultPda.toBase58()}\n`);

    // ── 4. Print env config ─────────────────────────────────────
    console.log("=".repeat(60));
    console.log("🎉 Done. Add this to your frontend env (Vercel + .env.local):");
    console.log("");
    console.log(`PLATFORM_MULTISIG_PDA=${multisigPda.toBase58()}`);
    console.log(`NEXT_PUBLIC_PLATFORM_MULTISIG_PDA=${multisigPda.toBase58()}`);
    console.log("");
    console.log("Save these for your records:");
    console.log(`  Multisig PDA:  ${multisigPda.toBase58()}`);
    console.log(`  Vault PDA:     ${vaultPda.toBase58()}`);
    console.log(`  Create key:    ${createKey.publicKey.toBase58()}`);
    console.log(`  Threshold:     ${threshold}-of-${memberKeys.length}`);
    console.log("");
    console.log("⚠️  The vault PDA needs ~0.01 SOL to pay rent for its USDC ATA");
    console.log("    on the first claim. Fund it once:");
    console.log(`    solana transfer ${vaultPda.toBase58()} 0.01 --allow-unfunded-recipient`);
    console.log("=".repeat(60));
}

main().catch((err) => {
    console.error("\n💥 Setup failed:", err);
    process.exit(1);
});
