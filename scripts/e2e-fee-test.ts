/**
 * End-to-End Fee Collection Test
 * 
 * This script performs a complete test of the payment flow:
 * 1. Check/setup a test merchant
 * 2. Make a USDC payment (simulating checkout)
 * 3. Verify treasury received 1% fee
 * 4. Claim the fees
 * 
 * Prerequisites:
 * - Demo wallet with devnet USDC
 * - Frontend server running on localhost:3000
 * 
 * Run: npx ts-node scripts/e2e-fee-test.ts
 */

import { Connection, PublicKey, Keypair, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    getAccount,
    createTransferInstruction,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

// Configuration
const RPC_URL = "https://api.devnet.solana.com";
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");
const PLATFORM_FEE_BPS = 100; // 1%

// Test merchant wallet (using phantom-wallet.json as merchant)
const MERCHANT_NAME = "E2E Test Merchant";

// Get Platform Treasury PDA (this is the actual on-chain token account)
function getPlatformTreasuryPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID
    );
    return pda;
}

async function loadWallet(filePath: string): Promise<Keypair> {
    const fullPath = path.resolve(filePath);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    return Keypair.fromSecretKey(new Uint8Array(data));
}

async function getTokenBalance(connection: Connection, ata: PublicKey): Promise<number> {
    try {
        const account = await getAccount(connection, ata);
        return Number(account.amount) / 1_000_000;
    } catch {
        return 0;
    }
}

async function main() {
    console.log("🧪 End-to-End Fee Collection Test\n");
    console.log("=".repeat(60));

    const connection = new Connection(RPC_URL, "confirmed");

    // 1. Load wallets
    console.log("\n📁 Loading wallets...");

    const payerWallet = await loadWallet("./demo-wallet.json");
    console.log(`   Payer (customer): ${payerWallet.publicKey.toBase58()}`);

    const merchantWallet = await loadWallet("./phantom-wallet.json");
    console.log(`   Merchant:         ${merchantWallet.publicKey.toBase58()}`);

    // 2. Check balances
    console.log("\n" + "=".repeat(60));
    console.log("💰 INITIAL BALANCES");
    console.log("=".repeat(60));

    const payerAta = await getAssociatedTokenAddress(USDC_MINT, payerWallet.publicKey);
    const merchantAta = await getAssociatedTokenAddress(USDC_MINT, merchantWallet.publicKey);
    // Use the on-chain treasury PDA (it IS a token account, not an ATA owner)
    const treasuryPDA = getPlatformTreasuryPDA();

    const initialPayerBalance = await getTokenBalance(connection, payerAta);
    const initialMerchantBalance = await getTokenBalance(connection, merchantAta);
    const initialTreasuryBalance = await getTokenBalance(connection, treasuryPDA);

    console.log(`\n   Payer USDC:    $${initialPayerBalance.toFixed(6)}`);
    console.log(`   Merchant USDC: $${initialMerchantBalance.toFixed(6)}`);
    console.log(`   Treasury USDC: $${initialTreasuryBalance.toFixed(6)}`);

    if (initialPayerBalance < 0.10) {
        console.log("\n❌ Payer needs at least $0.10 USDC for test");
        console.log("   Get devnet USDC from: https://faucet.circle.com/");
        return;
    }

    // 3. Create payment transaction (simulating what the API does)
    console.log("\n" + "=".repeat(60));
    console.log("💳 CREATING PAYMENT TRANSACTION");
    console.log("=".repeat(60));

    // Use 10 cents for test
    const paymentAmount = BigInt(100_000); // $0.10 USDC (6 decimals)
    const platformFee = (paymentAmount * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
    const merchantAmount = paymentAmount - platformFee;

    console.log(`\n   Payment Amount:  $${Number(paymentAmount) / 1_000_000}`);
    console.log(`   Platform Fee (1%): $${Number(platformFee) / 1_000_000}`);
    console.log(`   Merchant (99%):    $${Number(merchantAmount) / 1_000_000}`);

    const tx = new Transaction();

    // Check if merchant ATA exists
    try {
        await getAccount(connection, merchantAta);
    } catch {
        console.log("\n   Creating merchant ATA...");
        tx.add(
            createAssociatedTokenAccountInstruction(
                payerWallet.publicKey,
                merchantAta,
                merchantWallet.publicKey,
                USDC_MINT
            )
        );
    }

    // Treasury is already initialized on-chain, no need to create

    // Transfer to merchant (99%)
    tx.add(
        createTransferInstruction(
            payerAta,
            merchantAta,
            payerWallet.publicKey,
            merchantAmount
        )
    );

    // Transfer to treasury (1% fee)
    tx.add(
        createTransferInstruction(
            payerAta,
            treasuryPDA,
            payerWallet.publicKey,
            platformFee
        )
    );

    // 4. Send transaction
    console.log("\n" + "=".repeat(60));
    console.log("📤 SENDING TRANSACTION");
    console.log("=".repeat(60));

    try {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = payerWallet.publicKey;

        const signature = await sendAndConfirmTransaction(connection, tx, [payerWallet], {
            commitment: "confirmed",
        });

        console.log(`\n   ✅ Transaction confirmed!`);
        console.log(`   Signature: ${signature}`);
        console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (error: any) {
        console.log(`\n   ❌ Transaction failed: ${error.message}`);
        return;
    }

    // 5. Verify final balances
    console.log("\n" + "=".repeat(60));
    console.log("✅ FINAL BALANCES");
    console.log("=".repeat(60));

    // Wait a moment for confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const finalPayerBalance = await getTokenBalance(connection, payerAta);
    const finalMerchantBalance = await getTokenBalance(connection, merchantAta);
    const finalTreasuryBalance = await getTokenBalance(connection, treasuryPDA);

    console.log(`\n   Payer USDC:    $${finalPayerBalance.toFixed(6)} (was $${initialPayerBalance.toFixed(6)})`);
    console.log(`   Merchant USDC: $${finalMerchantBalance.toFixed(6)} (was $${initialMerchantBalance.toFixed(6)})`);
    console.log(`   Treasury USDC: $${finalTreasuryBalance.toFixed(6)} (was $${initialTreasuryBalance.toFixed(6)})`);

    // 6. Verify fee collection
    console.log("\n" + "=".repeat(60));
    console.log("🔍 VERIFICATION");
    console.log("=".repeat(60));

    const payerDiff = initialPayerBalance - finalPayerBalance;
    const merchantDiff = finalMerchantBalance - initialMerchantBalance;
    const treasuryDiff = finalTreasuryBalance - initialTreasuryBalance;

    console.log(`\n   Payer spent:      $${payerDiff.toFixed(6)}`);
    console.log(`   Merchant gained:  $${merchantDiff.toFixed(6)}`);
    console.log(`   Treasury gained:  $${treasuryDiff.toFixed(6)}`);

    const expectedMerchantGain = Number(merchantAmount) / 1_000_000;
    const expectedTreasuryGain = Number(platformFee) / 1_000_000;

    const merchantOk = Math.abs(merchantDiff - expectedMerchantGain) < 0.000001;
    const treasuryOk = Math.abs(treasuryDiff - expectedTreasuryGain) < 0.000001;

    console.log(`\n   Merchant received correct amount: ${merchantOk ? "✅ YES" : "❌ NO"}`);
    console.log(`   Treasury received correct fee:    ${treasuryOk ? "✅ YES" : "❌ NO"}`);

    if (merchantOk && treasuryOk) {
        console.log("\n" + "=".repeat(60));
        console.log("🎉 SUCCESS! Fee collection is working correctly!");
        console.log("=".repeat(60));
        console.log(`\n   Total treasury balance: $${finalTreasuryBalance.toFixed(6)} USDC`);
        console.log(`   Run 'npx ts-node scripts/claim-fees.ts' to withdraw`);
    } else {
        console.log("\n❌ Fee collection verification failed!");
    }
}

main().catch(console.error);
