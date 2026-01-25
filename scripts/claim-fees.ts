/**
 * Claim Platform Fees Script
 * 
 * Withdraws accumulated USDC fees from the Platform Treasury to your wallet.
 * 
 * Run with: npx ts-node scripts/claim-fees.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Program ID
const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

// USDC Mint (Devnet)
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

async function main() {
    console.log("🏦 Settlr Fee Claim Tool\n");

    // Try to load the platform authority wallet
    // First check for phantom-wallet.json (used to initialize platform on devnet)
    // Then fall back to default Solana keypair
    let keypairPath = path.join(__dirname, "../phantom-wallet.json");

    if (!fs.existsSync(keypairPath)) {
        keypairPath = path.join(process.env.HOME || "", ".config/solana/id.json");
    }

    if (!fs.existsSync(keypairPath)) {
        console.error("❌ No wallet found");
        console.error("   Need phantom-wallet.json or ~/.config/solana/id.json");
        process.exit(1);
    }

    const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    const authority = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log(`👛 Authority wallet: ${authority.publicKey.toBase58()}`);
    console.log(`   (loaded from: ${keypairPath})`);

    // Connect to devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Derive PDAs
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
    );
    console.log(`📋 Platform Config PDA: ${platformConfigPDA.toBase58()}`);

    const [platformTreasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID
    );
    console.log(`💰 Platform Treasury PDA: ${platformTreasuryPDA.toBase58()}`);

    // Get treasury USDC balance - the treasury PDA IS the token account
    try {
        const treasuryBalance = await connection.getTokenAccountBalance(platformTreasuryPDA);
        const balanceUsdc = parseFloat(treasuryBalance.value.uiAmountString || "0");

        console.log(`\n💵 Treasury Balance: $${balanceUsdc.toFixed(2)} USDC`);

        if (balanceUsdc === 0) {
            console.log("\n✅ No fees to claim. Treasury is empty.");
            return;
        }

        // Authority's USDC ATA
        const authorityAta = await getAssociatedTokenAddress(USDC_MINT, authority.publicKey);
        console.log(`📥 Your USDC ATA: ${authorityAta.toBase58()}`);

        // Check if authority ATA exists, create if needed
        try {
            await connection.getTokenAccountBalance(authorityAta);
        } catch {
            console.log("\n📝 Creating your USDC token account...");
            const { createAssociatedTokenAccountInstruction } = await import("@solana/spl-token");
            const { Transaction, sendAndConfirmTransaction } = await import("@solana/web3.js");

            const createAtaTx = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    authority.publicKey,
                    authorityAta,
                    authority.publicKey,
                    USDC_MINT
                )
            );
            await sendAndConfirmTransaction(connection, createAtaTx, [authority]);
            console.log("   ✅ Token account created");
        }

        // Set up Anchor
        const wallet = new anchor.Wallet(authority);
        const provider = new anchor.AnchorProvider(connection, wallet, {
            commitment: "confirmed",
        });
        anchor.setProvider(provider);

        // Load the program IDL
        const idlPath = path.join(__dirname, "../target/idl/x402_hack_payment.json");
        if (!fs.existsSync(idlPath)) {
            console.error("❌ IDL not found. Run: anchor build");
            process.exit(1);
        }
        const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
        const program = new Program(idl, provider);

        console.log("\n🚀 Claiming fees...");

        // Call claim_platform_fees
        const tx = await program.methods
            .claimPlatformFees()
            .accounts({
                authority: authority.publicKey,
                platformConfig: platformConfigPDA,
                platformTreasuryUsdc: platformTreasuryPDA,
                authorityUsdc: authorityAta,
                usdcMint: USDC_MINT,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            })
            .signers([authority])
            .rpc();

        console.log(`\n✅ Fees claimed successfully!`);
        console.log(`   Transaction: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        console.log(`   Amount: $${balanceUsdc.toFixed(2)} USDC → Your wallet`);

    } catch (error: any) {
        if (error.message?.includes("Account does not exist")) {
            console.log("\n✅ Treasury account not initialized yet (no payments processed).");
        } else if (error.message?.includes("Unauthorized")) {
            console.error("\n❌ Unauthorized: Your wallet is not the platform authority.");
            console.error("   The platform was initialized with a different wallet.");
        } else {
            console.error("\n❌ Error:", error.message || error);
        }
    }
}

main().catch(console.error);
