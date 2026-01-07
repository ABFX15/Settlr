/**
 * Script to create a Privy managed wallet for use as gas fee payer
 * 
 * Run this once to create the wallet:
 *   npx tsx scripts/create-fee-payer.ts
 * 
 * Then add the output to your .env.local:
 *   PRIVY_FEE_PAYER_WALLET_ID=xxx
 *   PRIVY_FEE_PAYER_ADDRESS=xxx
 * 
 * Finally, fund the wallet with SOL on devnet:
 *   solana airdrop 1 <PRIVY_FEE_PAYER_ADDRESS> --url devnet
 */

import { PrivyClient } from "@privy-io/server-auth";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

async function main() {
    if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
        console.error("Error: Missing NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET in .env.local");
        console.error("\nMake sure you have these env vars set:");
        console.error("  NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>");
        console.error("  PRIVY_APP_SECRET=<your-privy-app-secret>");
        process.exit(1);
    }

    console.log("Creating Privy managed wallet for gas fee payer...\n");

    const client = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

    try {
        const wallet = await client.walletApi.create({
            chainType: "solana",
        });

        console.log("✅ Wallet created successfully!\n");
        console.log("Add these to your .env.local:\n");
        console.log(`PRIVY_FEE_PAYER_WALLET_ID=${wallet.id}`);
        console.log(`PRIVY_FEE_PAYER_ADDRESS=${wallet.address}`);
        console.log(`\nThen fund the wallet with SOL for gas:`);
        console.log(`  solana airdrop 1 ${wallet.address} --url devnet`);
        console.log(`\nOr use the faucet: https://faucet.solana.com/`);
        console.log(`Wallet address: ${wallet.address}`);
    } catch (error) {
        console.error("Failed to create wallet:", error);
        process.exit(1);
    }
}

main();
