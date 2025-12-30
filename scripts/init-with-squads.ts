/**
 * Initialize Platform with Squads Multisig as Authority
 * 
 * This script sets up the Settlr platform and transfers authority to your Squads vault.
 * Only the Squads multisig will be able to claim platform fees.
 * 
 * Run with: npx ts-node scripts/init-with-squads.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Configuration
const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const SQUADS_VAULT = new PublicKey("DthkuDsPKR6MqqV28rVSBEqdgnuNtEU6QpLACZ7bCBpD");

// Platform settings
const FEE_BPS = 200; // 2%
const MIN_PAYMENT_AMOUNT = 100000; // 0.1 USDC (6 decimals)

async function main() {
    console.log("🚀 Settlr Platform Initialization with Squads\n");
    console.log("=".repeat(50));
    console.log(`Program ID: ${PROGRAM_ID.toBase58()}`);
    console.log(`USDC Mint: ${USDC_MINT.toBase58()}`);
    console.log(`Squads Vault: ${SQUADS_VAULT.toBase58()}`);
    console.log(`Platform Fee: ${FEE_BPS / 100}%`);
    console.log(`Min Payment: $${MIN_PAYMENT_AMOUNT / 1_000_000} USDC`);
    console.log("=".repeat(50));

    // Load wallet
    const keypairPath = path.join(process.env.HOME || "", ".config/solana/id.json");
    if (!fs.existsSync(keypairPath)) {
        console.error("\n❌ No wallet found at ~/.config/solana/id.json");
        console.error("   Run: solana-keygen new");
        process.exit(1);
    }

    const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log(`\n👛 Payer wallet: ${payer.publicKey.toBase58()}`);

    // Connect to devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    const balance = await connection.getBalance(payer.publicKey);
    console.log(`   Balance: ${balance / 1e9} SOL`);

    if (balance < 0.1 * 1e9) {
        console.error("\n❌ Insufficient SOL. Need at least 0.1 SOL for rent.");
        console.error("   Run: solana airdrop 1");
        process.exit(1);
    }

    // Derive PDAs
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
    );
    console.log(`\n📋 Platform Config PDA: ${platformConfigPDA.toBase58()}`);

    const [platformTreasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID
    );
    console.log(`💰 Platform Treasury PDA: ${platformTreasuryPDA.toBase58()}`);

    // Set up Anchor
    const wallet = new anchor.Wallet(payer);
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });
    anchor.setProvider(provider);

    // Load IDL
    const idlPath = path.join(__dirname, "../target/idl/x402_hack_payment.json");
    if (!fs.existsSync(idlPath)) {
        console.error("\n❌ IDL not found. Run: anchor build");
        process.exit(1);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
    const program = new Program(idl, provider);

    // Check if already initialized
    const existingAccount = await connection.getAccountInfo(platformConfigPDA);

    if (existingAccount) {
        console.log("\n⚠️  Platform already initialized. Checking authority...");

        // Try to transfer authority to Squads if we're still the authority
        try {
            console.log("\n🔄 Transferring authority to Squads...");

            const tx = await program.methods
                .transferAuthority()
                .accounts({
                    authority: payer.publicKey,
                    newAuthority: SQUADS_VAULT,
                    platformConfig: platformConfigPDA,
                })
                .signers([payer])
                .rpc();

            console.log(`\n✅ Authority transferred to Squads!`);
            console.log(`   Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
            console.log(`\n🛡️  Squads Vault: ${SQUADS_VAULT.toBase58()}`);
            console.log(`   Dashboard: https://devnet.squads.so/squads/${SQUADS_VAULT.toBase58()}/home`);

        } catch (error: any) {
            if (error.message?.includes("Unauthorized")) {
                console.log("\n✅ Authority already transferred (not owned by this wallet)");
            } else {
                console.error("\n❌ Transfer failed:", error.message);
            }
        }
        return;
    }

    console.log("\n🔧 Initializing platform...");

    try {
        // Step 1: Initialize platform with our wallet as temporary authority
        const initTx = await program.methods
            .setPlatformConfig(new anchor.BN(FEE_BPS), new anchor.BN(MIN_PAYMENT_AMOUNT))
            .accounts({
                authority: payer.publicKey,
                platformConfig: platformConfigPDA,
                platformTreasury: platformTreasuryPDA,
                usdcMint: USDC_MINT,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([payer])
            .rpc();

        console.log(`\n✅ Platform initialized!`);
        console.log(`   Transaction: https://explorer.solana.com/tx/${initTx}?cluster=devnet`);

        // Step 2: Transfer authority to Squads
        console.log("\n🔄 Transferring authority to Squads...");

        const transferTx = await program.methods
            .transferAuthority()
            .accounts({
                authority: payer.publicKey,
                newAuthority: SQUADS_VAULT,
                platformConfig: platformConfigPDA,
            })
            .signers([payer])
            .rpc();

        console.log(`\n✅ Authority transferred to Squads!`);
        console.log(`   Transaction: https://explorer.solana.com/tx/${transferTx}?cluster=devnet`);

        console.log("\n" + "=".repeat(50));
        console.log("🎉 SETUP COMPLETE!");
        console.log("=".repeat(50));
        console.log(`\n🛡️  Platform Authority: ${SQUADS_VAULT.toBase58()}`);
        console.log(`💰 Treasury: ${platformTreasuryPDA.toBase58()}`);
        console.log(`\n📊 Squads Dashboard:`);
        console.log(`   https://devnet.squads.so/squads/${SQUADS_VAULT.toBase58()}/home`);
        console.log(`\nTo claim fees, create a transaction in Squads calling 'claim_platform_fees'`);

    } catch (error: any) {
        if (error.message?.includes("already in use")) {
            console.log("\n⚠️  Platform already initialized.");
        } else {
            console.error("\n❌ Error:", error.message || error);
        }
    }
}

main().catch(console.error);