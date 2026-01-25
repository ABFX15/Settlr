/**
 * Check Platform Treasury Balance
 * 
 * View your accumulated fees without claiming.
 * 
 * Run with: npx ts-node scripts/check-balance.ts
 */

import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

async function main() {
    console.log("📊 Settlr Treasury Balance Checker\n");

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Derive Platform Treasury PDA (this IS the token account, not an ATA owner)
    const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID
    );

    console.log(`Treasury PDA: ${treasuryPDA.toBase58()}`);

    try {
        const balance = await connection.getTokenAccountBalance(treasuryPDA);
        const usdcBalance = parseFloat(balance.value.uiAmountString || "0");

        console.log(`\n💰 Available Fees: $${usdcBalance.toFixed(2)} USDC`);

        if (usdcBalance > 0) {
            console.log(`\n💡 Run 'npx ts-node scripts/claim-fees.ts' to withdraw`);
        }
    } catch (error: any) {
        if (error.message?.includes("could not find account")) {
            console.log("\n💰 Available Fees: $0.00 USDC");
            console.log("   (Treasury not yet initialized - no payments processed)");
        } else {
            throw error;
        }
    }
}

main().catch(console.error);
