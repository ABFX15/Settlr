/**
 * Check Platform Treasury Balance
 * 
 * View your accumulated fees without claiming.
 * 
 * Run with: npx ts-node scripts/check-balance.ts
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

async function main() {
    console.log("📊 Settlr Treasury Balance Checker\n");

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Derive Platform Config PDA
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
    );

    // Get treasury ATA
    const treasuryAta = await getAssociatedTokenAddress(USDC_MINT, platformConfigPDA, true);

    console.log(`Treasury PDA: ${platformConfigPDA.toBase58()}`);
    console.log(`Treasury ATA: ${treasuryAta.toBase58()}`);

    try {
        const balance = await connection.getTokenAccountBalance(treasuryAta);
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
