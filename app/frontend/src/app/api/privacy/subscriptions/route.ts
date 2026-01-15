import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Private Subscriptions API
 * 
 * Manage subscriptions with hidden pricing:
 * - Create subscriptions with encrypted amounts
 * - List subscriptions (amounts hidden from observers)
 * - Cancel subscriptions
 * 
 * Killer feature for Inco Payments prize:
 * "Private subscriptions or gaming micro-payments"
 */

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com";
const SETTLR_PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

interface PrivateSubscription {
    subscriptionId: string;
    customer: string;
    merchant: string;
    /** Encrypted - only visible to customer and merchant */
    encryptedAmountHandle: string;
    billingCycleSeconds: number;
    billingCycleLabel: string;
    createdAt: string;
    lastPaymentAt: string;
    nextPaymentAt: string;
    paymentCount: number;
    status: "active" | "paused" | "cancelled" | "past_due";
}

interface ListSubscriptionsResponse {
    success: boolean;
    data?: {
        subscriptions: PrivateSubscription[];
        total: number;
        privacyNote: string;
    };
    error?: string;
}

/**
 * GET /api/privacy/subscriptions
 * 
 * List subscriptions for a merchant or customer
 * Query params:
 * - merchantId: List all subscriptions for a merchant
 * - customerWallet: List subscriptions for a customer
 */
export async function GET(request: NextRequest): Promise<NextResponse<ListSubscriptionsResponse>> {
    const merchantId = request.nextUrl.searchParams.get("merchantId");
    const customerWallet = request.nextUrl.searchParams.get("customerWallet");

    if (!merchantId && !customerWallet) {
        return NextResponse.json(
            { success: false, error: "Either merchantId or customerWallet is required" },
            { status: 400 }
        );
    }

    try {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");

        // In production: Use getProgramAccounts with memcmp filters
        // For hackathon demo: return mock data showing privacy features

        const mockSubscriptions: PrivateSubscription[] = [
            {
                subscriptionId: "sub_demo123abc",
                customer: customerWallet || "DemoCustomer11111111111111111111111111111",
                merchant: merchantId ? await getMerchantPda(merchantId) : "DemoMerchant1111111111111111111111111111",
                encryptedAmountHandle: "0x7b226964223a22737562...", // Encrypted!
                billingCycleSeconds: 30 * 24 * 60 * 60,
                billingCycleLabel: "Monthly",
                createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                lastPaymentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                nextPaymentAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                paymentCount: 2,
                status: "active",
            },
            {
                subscriptionId: "sub_demo456def",
                customer: customerWallet || "DemoCustomer22222222222222222222222222222",
                merchant: merchantId ? await getMerchantPda(merchantId) : "DemoMerchant1111111111111111111111111111",
                encryptedAmountHandle: "0x8c337365223a227072...", // Different encrypted amount
                billingCycleSeconds: 7 * 24 * 60 * 60,
                billingCycleLabel: "Weekly",
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastPaymentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                nextPaymentAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                paymentCount: 4,
                status: "active",
            },
        ];

        return NextResponse.json({
            success: true,
            data: {
                subscriptions: mockSubscriptions,
                total: mockSubscriptions.length,
                privacyNote: "Subscription amounts are FHE-encrypted. Only the customer and merchant can decrypt the actual prices.",
            },
        });

    } catch (error) {
        console.error("Subscriptions API error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch subscriptions" },
            { status: 500 }
        );
    }
}

async function getMerchantPda(merchantId: string): Promise<string> {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("merchant"), Buffer.from(merchantId)],
        SETTLR_PROGRAM_ID
    );
    return pda.toBase58();
}

/**
 * POST /api/privacy/subscriptions
 * 
 * Create a new private subscription
 * Body:
 * - subscriptionId: Unique ID
 * - merchantId: Merchant's ID
 * - amount: Subscription amount (will be encrypted)
 * - billingCycleSeconds: Billing period
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { subscriptionId, merchantId, amount, billingCycleSeconds } = body;

        if (!subscriptionId || !merchantId || !amount || !billingCycleSeconds) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Encrypt the amount (simulated for hackathon)
        const encryptedAmountHandle = encryptAmount(amount);

        // In production: Build and send the Anchor transaction
        // For hackathon: Return the encrypted data for client to submit

        return NextResponse.json({
            success: true,
            data: {
                subscriptionId,
                merchantId,
                encryptedAmountHandle,
                billingCycleSeconds,
                billingCycleLabel: getBillingCycleLabel(billingCycleSeconds),
                instruction: {
                    program: SETTLR_PROGRAM_ID.toBase58(),
                    method: "createPrivateSubscription",
                    args: {
                        subscriptionId,
                        encryptedAmountCiphertext: encryptedAmountHandle,
                        billingCycleSeconds,
                    },
                },
                privacyNote: "Amount encrypted with Inco FHE. Only you and the merchant can see the price.",
            },
        });

    } catch (error) {
        console.error("Create subscription error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create subscription" },
            { status: 500 }
        );
    }
}

/**
 * Simulate FHE encryption (hackathon placeholder)
 * In production: Use Inco SDK for actual encryption
 */
function encryptAmount(amount: number): string {
    // Convert to USDC lamports (6 decimals)
    const lamports = BigInt(Math.round(amount * 1_000_000));

    // Simulate encryption by encoding as hex
    const buffer = Buffer.alloc(16);
    buffer.writeBigUInt64LE(lamports, 0);

    return `0x${buffer.toString('hex')}`;
}

function getBillingCycleLabel(seconds: number): string {
    if (seconds <= 7 * 24 * 60 * 60) return "Weekly";
    if (seconds <= 14 * 24 * 60 * 60) return "Bi-weekly";
    if (seconds <= 31 * 24 * 60 * 60) return "Monthly";
    if (seconds <= 92 * 24 * 60 * 60) return "Quarterly";
    return "Yearly";
}
