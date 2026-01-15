import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Private Dashboard API
 * 
 * Returns aggregated merchant data with privacy-preserving features:
 * - Individual transaction amounts remain encrypted
 * - Only aggregate handles returned (decrypt client-side with merchant key)
 * - Transaction counts are public (configurable)
 * 
 * Perfect for hackathon demo:
 * "Dashboard shows aggregates only; payer privacy preserved"
 */

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";
const SETTLR_PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

interface PrivateDashboardResponse {
    success: boolean;
    data?: {
        // Encrypted handles (only merchant can decrypt via Inco)
        encryptedTotalRevenueHandle: string;
        encryptedTotalPayoutsHandle: string;

        // Public counts (or can be encrypted too)
        transactionCount: number;
        payoutCount: number;
        activeSubscriptions: number;

        // Privacy metadata
        privacyMode: {
            individualAmountsHidden: boolean;
            aggregatesOnly: boolean;
            decryptionAvailable: boolean;
        };

        lastUpdated: string;
    };
    error?: string;
}

/**
 * GET /api/privacy/dashboard
 * 
 * Query params:
 * - merchantId: The merchant's ID
 * - includeBreakdown: If true and merchant is authenticated, includes decryption hints
 */
export async function GET(request: NextRequest): Promise<NextResponse<PrivateDashboardResponse>> {
    const merchantId = request.nextUrl.searchParams.get("merchantId");

    if (!merchantId) {
        return NextResponse.json(
            { success: false, error: "merchantId is required" },
            { status: 400 }
        );
    }

    try {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");

        // Derive merchant PDAs
        const [merchantPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("merchant"), Buffer.from(merchantId)],
            SETTLR_PROGRAM_ID
        );

        const [statsPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("merchant_private_stats"), merchantPda.toBuffer()],
            SETTLR_PROGRAM_ID
        );

        // Fetch merchant private stats from chain
        const statsAccount = await connection.getAccountInfo(statsPda);

        let encryptedTotalRevenueHandle = "0";
        let encryptedTotalPayoutsHandle = "0";
        let transactionCount = 0;
        let payoutCount = 0;

        if (statsAccount) {
            // Parse the account data
            // Layout (after 8-byte discriminator):
            // - merchant: Pubkey (32)
            // - encrypted_total_revenue: u128 (16)
            // - encrypted_total_payouts: u128 (16)
            // - transaction_count: u64 (8)
            // - payout_count: u64 (8)
            // - last_updated: i64 (8)
            // - bump: u8 (1)

            const data = statsAccount.data;

            // Read encrypted handles as hex strings (clients will use Inco to decrypt)
            const revenueBytes = data.slice(40, 56); // After discriminator(8) + pubkey(32)
            const payoutBytes = data.slice(56, 72);

            encryptedTotalRevenueHandle = `0x${Buffer.from(revenueBytes).toString('hex')}`;
            encryptedTotalPayoutsHandle = `0x${Buffer.from(payoutBytes).toString('hex')}`;

            transactionCount = data.readBigUInt64LE(72);
            payoutCount = data.readBigUInt64LE(80);
        }

        // Count active subscriptions for this merchant
        // In production: query getProgramAccounts with filters
        const activeSubscriptions = 0; // TODO: Implement subscription counting

        return NextResponse.json({
            success: true,
            data: {
                encryptedTotalRevenueHandle,
                encryptedTotalPayoutsHandle,
                transactionCount: Number(transactionCount),
                payoutCount: Number(payoutCount),
                activeSubscriptions,
                privacyMode: {
                    individualAmountsHidden: true,
                    aggregatesOnly: true,
                    decryptionAvailable: true, // Merchant can decrypt via Inco
                },
                lastUpdated: new Date().toISOString(),
            },
        });

    } catch (error) {
        console.error("Private dashboard error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch private dashboard data" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/privacy/dashboard/decrypt
 * 
 * Request decryption of a specific handle (requires merchant signature)
 * This would integrate with Inco covalidators for actual decryption
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { handle, signature, merchantWallet } = body;

        if (!handle || !signature || !merchantWallet) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: handle, signature, merchantWallet" },
                { status: 400 }
            );
        }

        // In production: Verify signature and call Inco for decryption
        // For hackathon demo: simulate decryption

        // Parse the handle and "decrypt" (simulated)
        const handleBigInt = BigInt(handle);

        // Simulated decryption (in production, this calls Inco covalidators)
        const decryptedAmount = simulateDecryption(handleBigInt);

        return NextResponse.json({
            success: true,
            data: {
                handle,
                decryptedAmount,
                decryptedAt: new Date().toISOString(),
                note: "Demo mode - production uses Inco FHE decryption",
            },
        });

    } catch (error) {
        console.error("Decryption error:", error);
        return NextResponse.json(
            { success: false, error: "Decryption failed" },
            { status: 500 }
        );
    }
}

/**
 * Simulate decryption for hackathon demo
 * In production: Call Inco Lightning network for actual FHE decryption
 */
function simulateDecryption(handle: bigint): number {
    // The handle was created from the amount bytes, so we can "reverse" it
    // In real FHE, this would be impossible without the decryption key
    const bytes = [];
    let h = handle;
    for (let i = 0; i < 8; i++) {
        bytes.push(Number(h & BigInt(0xff)));
        h = h >> BigInt(8);
    }

    // Interpret as USDC amount (6 decimals)
    const buffer = Buffer.from(bytes);
    const rawAmount = buffer.readBigUInt64LE(0);
    return Number(rawAmount) / 1_000_000;
}
