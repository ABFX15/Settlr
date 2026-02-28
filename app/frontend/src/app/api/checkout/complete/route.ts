import { NextRequest, NextResponse } from "next/server";
import { checkoutSessions } from "../store";
import {
    getCheckoutSession,
    updateCheckoutSession,
    createPayment,
    Payment,
    CheckoutSession,
} from "@/lib/db";
import { screenPaymentParties } from "@/lib/range";
import crypto from "crypto";

/**
 * POST /api/checkout/complete
 * 
 * Called after a successful payment to update session and trigger webhook
 * Includes Range Security wallet screening before completing payment
 * 
 * Request body:
 * {
 *   sessionId: string,
 *   signature: string,
 *   customerWallet: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, signature, customerWallet } = body;

        if (!sessionId || !signature || !customerWallet) {
            return NextResponse.json(
                { error: "Missing required fields: sessionId, signature, customerWallet" },
                { status: 400 }
            );
        }

        // Try database first, then fallback to in-memory
        let session = await getCheckoutSession(sessionId);
        if (!session) {
            session = checkoutSessions.get(sessionId) || null;
        }

        if (!session) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        if (session.status !== "pending") {
            return NextResponse.json(
                { error: `Session already ${session.status}` },
                { status: 400 }
            );
        }

        // Range Security: Screen both payer and merchant wallets
        const riskScreening = await screenPaymentParties(
            customerWallet,
            session.merchantWallet,
            { testMode: process.env.NODE_ENV !== 'production' }
        );

        if (!riskScreening.canProceed) {
            console.warn(`[Range] Payment blocked: ${riskScreening.blockedParty}`, {
                sessionId,
                customerWallet,
                merchantWallet: session.merchantWallet,
                payerRisk: riskScreening.payer.summary,
                merchantRisk: riskScreening.merchant.summary,
            });

            return NextResponse.json(
                {
                    error: "Payment blocked by risk screening",
                    reason: riskScreening.blockedParty === 'payer'
                        ? riskScreening.payer.summary
                        : riskScreening.merchant.summary,
                    blockedParty: riskScreening.blockedParty,
                },
                { status: 403 }
            );
        }

        console.log(`[Range] Payment parties cleared: payer=${riskScreening.payer.riskLevel}, merchant=${riskScreening.merchant.riskLevel}`);

        // Update session status
        await updateCheckoutSession(sessionId, { status: "completed" });

        // Also update legacy in-memory store
        session.status = "completed";
        session.paymentSignature = signature;
        session.customerWallet = customerWallet;
        session.completedAt = Date.now();
        checkoutSessions.set(sessionId, session);

        // Create payment record using database layer
        const payment = await createPayment({
            sessionId: session.id,
            merchantId: session.merchantId,
            merchantName: session.merchantName,
            merchantWallet: session.merchantWallet,
            customerWallet: customerWallet,
            amount: session.amount,
            currency: session.currency,
            description: session.description,
            metadata: session.metadata,
            txSignature: signature,
            explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
            createdAt: session.createdAt,
            completedAt: Date.now(),
            status: "completed",
        });

        // Trigger webhook asynchronously
        if (session.webhookUrl) {
            triggerWebhook(session, payment.id).catch(err => {
                console.error("Webhook delivery failed:", err);
            });
        }

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            sessionId,
            signature,
            successUrl: session.successUrl,
        });

    } catch (error) {
        console.error("Error completing checkout:", error);
        return NextResponse.json(
            { error: "Failed to complete checkout" },
            { status: 500 }
        );
    }
}

/**
 * Trigger webhook to merchant's endpoint
 */
async function triggerWebhook(session: CheckoutSession, paymentId: string): Promise<void> {
    if (!session.webhookUrl) return;

    const timestamp = Date.now();
    const webhookPayload = {
        event: "payment.completed",
        data: {
            paymentId: paymentId,
            sessionId: session.id,
            merchantId: session.merchantId,
            amount: session.amount,
            currency: session.currency,
            customerWallet: session.customerWallet,
            paymentSignature: session.paymentSignature,
            description: session.description,
            metadata: session.metadata,
            completedAt: session.completedAt,
            receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://settlr.io'}/receipts/${paymentId}`,
        },
        timestamp,
    };

    // Use merchant's webhook secret or fall back to a default
    // In production, each merchant would have their own secret
    const webhookSecret = process.env.SETTLR_WEBHOOK_SECRET || session.merchantId;
    const payloadString = JSON.stringify(webhookPayload);
    const webhookSignature = generateWebhookSignature(`${timestamp}.${payloadString}`, webhookSecret);

    // Retry logic for webhook delivery
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(session.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Settlr-Signature": `t=${timestamp},v1=${webhookSignature}`,
                    "X-Settlr-Timestamp": Date.now().toString(),
                    "X-Settlr-Event": "checkout.completed",
                },
                body: JSON.stringify(webhookPayload),
            });

            if (response.ok) {
                console.log(`Webhook delivered successfully to ${session.webhookUrl}`);
                return;
            }

            // Log failed attempt
            console.warn(`Webhook attempt ${attempt} failed with status ${response.status}`);
            lastError = new Error(`HTTP ${response.status}`);

        } catch (error) {
            console.warn(`Webhook attempt ${attempt} failed:`, error);
            lastError = error as Error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw new Error(`Webhook delivery failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Generate HMAC-SHA256 webhook signature
 */
function generateWebhookSignature(payload: string, secret: string): string {
    return crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");
}
