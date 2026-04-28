import { NextRequest, NextResponse } from "next/server";
import { createPayment, getMerchantByWallet, getPaymentByTxSignature } from "@/lib/db";
import { explorerUrl } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { emitEvent } from "@/lib/pipeline";
import { verifyOnChainPayment } from "@/lib/verify-payment";

// CORS headers for SDK requests from any origin
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * OPTIONS /api/payments/record
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/**
 * POST /api/payments/record
 * 
 * Records a payment from redirect-based checkouts (no session ID)
 * This is called after a successful on-chain payment
 * 
 * Request body:
 * {
 *   signature: string,
 *   merchantWallet: string,
 *   customerWallet: string,
 *   amount: number,
 *   memo?: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const rateLimited = await checkRateLimit(`record:${getClientIp(request)}`);
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const { signature, merchantWallet, customerWallet, amount, memo } = body;

        if (!signature || !merchantWallet || !customerWallet || !amount) {
            return NextResponse.json(
                { error: "Missing required fields: signature, merchantWallet, customerWallet, amount" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Reject obvious bad inputs before hitting RPC.
        if (
            typeof signature !== "string" ||
            typeof merchantWallet !== "string" ||
            typeof customerWallet !== "string" ||
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return NextResponse.json(
                { error: "Invalid field types" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Idempotency: refuse to double-record the same on-chain signature.
        try {
            const existing = await getPaymentByTxSignature(signature);
            if (existing) {
                return NextResponse.json(
                    { success: true, paymentId: existing.id, deduped: true },
                    { headers: corsHeaders },
                );
            }
        } catch (err) {
            // If lookup fails we proceed; verification below is the real gate.
            console.error("[Payments] Dedup lookup error:", err);
        }

        // CRITICAL: verify the buyer-supplied signature actually represents a
        // successful on-chain payment of the claimed amount to the claimed
        // merchant, with the platform fee leg also present. Without this the
        // endpoint trusts arbitrary client input and would let anyone insert
        // fake "completed" rows.
        const verification = await verifyOnChainPayment({
            signature,
            merchantWallet,
            totalUsdc: amount,
        });
        if (!verification.ok) {
            return NextResponse.json(
                { error: `Payment verification failed: ${verification.error}` },
                { status: 400, headers: corsHeaders },
            );
        }

        // Try to find the merchant to get their ID
        const merchant = await getMerchantByWallet(merchantWallet);
        const merchantId = merchant?.id || `merchant_${merchantWallet.slice(0, 8)}`;
        const merchantName = merchant?.name || "Unknown Merchant";

        // Create payment record
        const payment = await createPayment({
            sessionId: "",
            merchantId,
            merchantName,
            merchantWallet,
            customerWallet,
            amount,
            currency: "USDC",
            description: memo || "SDK Payment",
            metadata: { source: "sdk-redirect" },
            txSignature: signature,
            explorerUrl: explorerUrl(signature),
            createdAt: Date.now(),
            completedAt: Date.now(),
            status: "completed",
        });

        console.log(`[Payments] Recorded redirect payment: ${payment.id} for ${amount} USDC to ${merchantWallet}`);

        emitEvent("payment.completed", "payment", payment.id, merchantId, {
            amount, merchantWallet, customerWallet, signature, currency: "USDC",
        }).catch((err) => console.error("[pipeline] emit error:", err));

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
        }, { headers: corsHeaders });

    } catch (error) {
        console.error("Error recording payment:", error);
        return NextResponse.json(
            { error: "Failed to record payment" },
            { status: 500, headers: corsHeaders }
        );
    }
}
