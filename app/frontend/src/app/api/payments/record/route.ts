import { NextRequest, NextResponse } from "next/server";
import { createPayment, getMerchantByWallet } from "@/lib/db";

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
        const body = await request.json();
        const { signature, merchantWallet, customerWallet, amount, memo } = body;

        if (!signature || !merchantWallet || !customerWallet || !amount) {
            return NextResponse.json(
                { error: "Missing required fields: signature, merchantWallet, customerWallet, amount" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Try to find the merchant to get their ID
        const merchant = await getMerchantByWallet(merchantWallet);
        const merchantId = merchant?.id || `merchant_${merchantWallet.slice(0, 8)}`;
        const merchantName = merchant?.name || "Unknown Merchant";

        // Create payment record
        const payment = await createPayment({
            sessionId: undefined,
            merchantId,
            merchantName,
            merchantWallet,
            customerWallet,
            amount,
            currency: "USDC",
            description: memo || "SDK Payment",
            metadata: { source: "sdk-redirect" },
            txSignature: signature,
            explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
            createdAt: Date.now(),
            completedAt: Date.now(),
            status: "completed",
        });

        console.log(`[Payments] Recorded redirect payment: ${payment.id} for ${amount} USDC to ${merchantWallet}`);

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
