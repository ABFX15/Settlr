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

    // Load wallet from default Solana keypair location
    const keypairPath = path.join(process.env.HOME || "", ".config/solana/id.json");
    if (!fs.existsSync(keypairPath)) {
        console.error("❌ No wallet found at ~/.config/solana/id.json");
        console.error("   Run: solana-keygen new");
        process.exit(1);
    }

    const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    const authority = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log(`👛 Authority wallet: ${authority.publicKey.toBase58()}`);

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

    // Get treasury USDC balance
    const treasuryAta = await getAssociatedTokenAddress(USDC_MINT, platformConfigPDA, true);

    try {
        const treasuryBalance = await connection.getTokenAccountBalance(treasuryAta);
        const balanceUsdc = parseFloat(treasuryBalance.value.uiAmountString || "0");

        console.log(`\n💵 Treasury Balance: $${balanceUsdc.toFixed(2)} USDC`);

        if (balanceUsdc === 0) {
            console.log("\n✅ No fees to claim. Treasury is empty.");
            return;
        }

        // Authority's USDC ATA
        const authorityAta = await getAssociatedTokenAddress(USDC_MINT, authority.publicKey);
        console.log(`📥 Your USDC ATA: ${authorityAta.toBase58()}`);

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
                platformTreasuryUsdc: treasuryAta,
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
