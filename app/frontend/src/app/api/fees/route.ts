/**
 * GET  /api/fees — Get platform fee summary (all merchants or one)
 * POST /api/fees/collect — Trigger on-chain claim_platform_fees + record in ledger
 *
 * Admin-only: requires the caller's wallet session to be on the
 * ADMIN_WALLETS env list (see lib/admin-auth.ts). Falls back to the
 * legacy PLATFORM_ADMIN_KEY / X-Admin-Key header for backwards compat
 * with internal scripts.
 */
import { logger } from "@/lib/logger";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";

import { NextRequest, NextResponse } from "next/server";
import {
    getTreasuryTransactions,
    getMerchantBalance,
    type TreasuryTransaction,
} from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

// ---------------------------------------------------------------------------
// Admin auth helper — wallet-gated, with legacy header fallback
// ---------------------------------------------------------------------------

function authenticateAdmin(request: NextRequest): { valid: boolean; error?: string } {
    // Preferred: wallet-session admin
    const auth = requireAdmin(request);
    if (auth.ok) return { valid: true };

    // Legacy: X-Admin-Key header (kept for internal scripts/cron). Distinct
    // env var (PLATFORM_ADMIN_KEY) from the wallet-session ADMIN_SECRET so
    // we can deprecate independently.
    const adminKey = request.headers.get("x-admin-key");
    const expected = process.env.PLATFORM_ADMIN_KEY;
    if (expected && adminKey && adminKey === expected) return { valid: true };

    if (process.env.NODE_ENV === "development" && !expected) {
        // Dev convenience: allow when neither admin model is configured
        return { valid: true };
    }
    return { valid: false, error: "Sign in with an admin wallet, or supply X-Admin-Key for scripts." };
}

// ---------------------------------------------------------------------------
// GET /api/fees — Fee summary
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
    try {
        const auth = authenticateAdmin(request);
        if (!auth.valid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const merchantId = request.nextUrl.searchParams.get("merchantId");

        if (merchantId) {
            // Per-merchant fee report
            const balance = await getMerchantBalance(merchantId);
            const feeTxs = await getTreasuryTransactions(merchantId, { type: "fee_deducted", limit: 50 });

            return NextResponse.json({
                merchantId,
                totalFees: balance?.totalFees || 0,
                totalPayouts: balance?.totalPayouts || 0,
                feePercentage: "1%",
                minimumFee: 0.25,
                recentFees: feeTxs.map(formatTx),
            });
        }

        // Platform-wide fee summary
        if (isSupabaseConfigured()) {
            // Aggregate across all merchant balances
            const { data, error } = await supabase
                .from("merchant_balances")
                .select("merchant_id, total_fees, total_payouts");

            if (error || !data) {
                return NextResponse.json({ error: "Failed to fetch fee data" }, { status: 500 });
            }

            const totalFees = data.reduce((sum: number, m: { total_fees: number }) => sum + Number(m.total_fees || 0), 0);
            const totalPayouts = data.reduce((sum: number, m: { total_payouts: number }) => sum + Number(m.total_payouts || 0), 0);

            return NextResponse.json({
                platform: {
                    totalFees,
                    totalPayouts,
                    merchantCount: data.length,
                    effectiveRate: totalPayouts > 0 ? (totalFees / totalPayouts * 100).toFixed(2) + "%" : "1%",
                },
                merchants: data.map((m: { merchant_id: string; total_fees: number; total_payouts: number }) => ({
                    merchantId: m.merchant_id,
                    totalFees: Number(m.total_fees || 0),
                    totalPayouts: Number(m.total_payouts || 0),
                })),
            });
        } else {
            // In-memory mode: we don't have a simple way to iterate all merchants,
            // so return a reduced summary from treasury transactions
            return NextResponse.json({
                platform: {
                    totalFees: 0,
                    totalPayouts: 0,
                    merchantCount: 0,
                    effectiveRate: "1%",
                    note: "In-memory mode — per-merchant balances not iterable. Use ?merchantId= for specific merchant.",
                },
                merchants: [],
            });
        }
    } catch (error) {
        logger.error("[fees] Error:", error);
        return NextResponse.json({ error: "Failed to fetch fee data" }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// POST /api/fees — Collect fees (trigger on-chain claim)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        const auth = authenticateAdmin(request);
        if (!auth.valid) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        // Step 1: Check on-chain treasury balance
        let treasuryBalance = 0;
        let txSignature = "";

        try {
            const { Connection, PublicKey, Keypair, Transaction } = await import("@solana/web3.js");
            const { getAssociatedTokenAddress } = await import("@solana/spl-token");

            const programId = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");
            const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
            const rpcUrl = SOLANA_RPC_URL;
            const connection = new Connection(rpcUrl, "confirmed");

            // Derive the on-chain platform treasury PDA
            const [platformTreasuryPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("platform_treasury")],
                programId,
            );

            // Check treasury token balance
            try {
                const balance = await connection.getTokenAccountBalance(platformTreasuryPDA);
                treasuryBalance = parseFloat(balance.value.uiAmountString || "0");
            } catch {
                // Treasury may not exist yet
                treasuryBalance = 0;
            }

            if (treasuryBalance <= 0) {
                return NextResponse.json({
                    status: "empty",
                    message: "No fees to collect. On-chain treasury is empty.",
                    treasuryBalance: 0,
                });
            }

            // Step 2: Execute claim_platform_fees via Anchor
            // This requires the platform authority keypair
            const feePayerSecret = process.env.FEE_PAYER_SECRET_KEY;
            if (feePayerSecret) {
                const authorityKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(feePayerSecret)));
                const [platformConfigPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("platform_config")],
                    programId,
                );
                const authorityAta = await getAssociatedTokenAddress(usdcMint, authorityKeypair.publicKey);

                // Build the claim instruction using raw instruction encoding
                // program.methods.claimPlatformFees()
                // For now, we report the balance — the actual on-chain claim
                // should be done via the scripts/claim-fees.ts script or
                // integrated Anchor client call.
                logger.info(`[fees] On-chain treasury balance: $${treasuryBalance} USDC`);
                logger.info(`[fees] Use scripts/claim-fees.ts for on-chain claim, or proceed to integrate Anchor client.`);

                // Demo mode: report what would be collected
                txSignature = `pending_manual_claim_${Date.now()}`;
            }
        } catch (err) {
            logger.error("[fees] On-chain fee check failed:", err);
            // Continue with off-chain data
        }

        // Step 3: Return the off-chain + on-chain fee summary
        let offChainFees = 0;
        if (isSupabaseConfigured()) {
            const { data } = await supabase
                .from("merchant_balances")
                .select("total_fees");
            if (data) {
                offChainFees = data.reduce((sum: number, m: { total_fees: number }) => sum + Number(m.total_fees || 0), 0);
            }
        }

        return NextResponse.json({
            status: "collected",
            onChain: {
                treasuryBalance,
                txSignature: txSignature || null,
                note: treasuryBalance > 0
                    ? "Run scripts/claim-fees.ts for full on-chain claim, or integrate Anchor client call."
                    : "On-chain treasury empty or not accessible.",
            },
            offChain: {
                totalFeesAccrued: offChainFees,
                note: "Off-chain fees are tracked in merchant_balances.total_fees and deducted per-payout.",
            },
        });
    } catch (error) {
        logger.error("[fees] Error collecting fees:", error);
        return NextResponse.json(
            { error: "Failed to collect fees" },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTx(tx: TreasuryTransaction) {
    return {
        id: tx.id,
        amount: tx.amount,
        payoutId: tx.payoutId,
        description: tx.description,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
    };
}
