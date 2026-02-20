/**
 * GET /api/admin/treasury — Read on-chain platform treasury balance & config
 *
 * Returns:
 *  - treasuryBalance (USDC amount in the platform treasury PDA)
 *  - platformConfig (authority, feeBps, totalVolume, totalFees, isActive)
 *
 * This is read-only on-chain data (publicly visible), so no auth required.
 */

import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Keypair } from "@solana/web3.js";

// Import shared constants
const PROGRAM_ID = new PublicKey(
    "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5"
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

export async function GET() {
    try {
        const connection = new Connection(RPC_URL, "confirmed");
        const [platformConfigPDA] = getPlatformConfigPDA();
        const [platformTreasuryPDA] = getPlatformTreasuryPDA();

        // 1. Fetch treasury USDC balance
        let treasuryBalance = 0;
        let treasuryBalanceRaw = "0";
        try {
            const balanceInfo =
                await connection.getTokenAccountBalance(platformTreasuryPDA);
            treasuryBalance = parseFloat(
                balanceInfo.value.uiAmountString || "0"
            );
            treasuryBalanceRaw = balanceInfo.value.amount;
        } catch {
            // Treasury account may not exist yet (no payments processed)
            treasuryBalance = 0;
        }

        // 2. Fetch platform config via Anchor
        let platformConfig = null;
        try {
            // Create a read-only provider (dummy wallet, we're just reading)
            const dummyWallet = new NodeWallet(Keypair.generate());
            const provider = new AnchorProvider(connection, dummyWallet, {
                commitment: "confirmed",
            });

            // Load IDL dynamically
            const idlModule = await import("@/anchor/x402_hack_payment.json");
            const idl = idlModule.default || idlModule;
            const program = new Program(idl as any, provider);

            const config = await (program.account as any).platform.fetch(
                platformConfigPDA
            );

            platformConfig = {
                authority: (config as any).authority?.toBase58?.() || String((config as any).authority),
                feeBps: (config as any).feeBps,
                isActive: (config as any).isActive,
                totalVolume: (config as any).totalVolume?.toString() || "0",
                totalFees: (config as any).totalFees?.toString() || "0",
                usdcMint: (config as any).usdcMint?.toBase58?.() || String((config as any).usdcMint),
            };
        } catch (err: any) {
            console.warn("Could not fetch platform config:", err.message);
            platformConfig = null;
        }

        return NextResponse.json({
            treasuryBalance,
            treasuryBalanceRaw,
            platformConfig,
            treasuryPDA: platformTreasuryPDA.toBase58(),
            configPDA: platformConfigPDA.toBase58(),
            programId: PROGRAM_ID.toBase58(),
            cluster: RPC_URL.includes("devnet") ? "devnet" : RPC_URL.includes("mainnet") ? "mainnet-beta" : "custom",
        });
    } catch (error: any) {
        console.error("Admin treasury API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch treasury data" },
            { status: 500 }
        );
    }
}
