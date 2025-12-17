import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Example webhook endpoint for receiving Settlr payment notifications
 * 
 * Merchants would implement their own version of this to handle:
 * - Order fulfillment
 * - Inventory updates
 * - Email notifications
 * - Analytics tracking
 */

// Verify webhook signature
function verifySignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get webhook secret from environment
        const webhookSecret = process.env.SETTLR_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("SETTLR_WEBHOOK_SECRET not configured");
            return NextResponse.json(
                { error: "Webhook secret not configured" },
                { status: 500 }
            );
        }

        // Get signature from header
        const signature = request.headers.get("x-settlr-signature");

        if (!signature) {
            return NextResponse.json(
                { error: "Missing signature header" },
                { status: 401 }
            );
        }

        // Get raw body
        const rawBody = await request.text();

        // Verify signature
        if (!verifySignature(rawBody, signature, webhookSecret)) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // Parse payload
        const event = JSON.parse(rawBody);

        console.log("Received webhook event:", event.type, event.payment?.id);

        // Handle different event types
        switch (event.type) {
            case "payment.completed":
                await handlePaymentCompleted(event.payment);
                break;

            case "payment.failed":
                await handlePaymentFailed(event.payment);
                break;

            case "payment.expired":
                await handlePaymentExpired(event.payment);
                break;

            case "payment.refunded":
                await handlePaymentRefunded(event.payment);
                break;

            default:
                console.log("Unknown event type:", event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

// Handler functions - implement your business logic here

async function handlePaymentCompleted(payment: any) {
    console.log("✅ Payment completed:", {
        id: payment.id,
        amount: payment.amount,
        orderId: payment.orderId,
        txSignature: payment.txSignature,
    });

    // Example: Update order status in database
    // await db.order.update({
    //   where: { id: payment.orderId },
    //   data: { status: 'paid', paidAt: new Date() }
    // });

    // Example: Send confirmation email
    // await sendEmail({
    //   to: customer.email,
    //   subject: 'Payment Received',
    //   body: `Your payment of $${payment.amount} has been confirmed!`
    // });

    // Example: Trigger fulfillment
    // await fulfillmentService.process(payment.orderId);
}

async function handlePaymentFailed(payment: any) {
    console.log("❌ Payment failed:", {
        id: payment.id,
        orderId: payment.orderId,
    });

    // Example: Notify customer
    // await sendEmail({
    //   to: customer.email,
    //   subject: 'Payment Failed',
    //   body: 'Your payment could not be processed. Please try again.'
    // });
}

async function handlePaymentExpired(payment: any) {
    console.log("⏰ Payment expired:", {
        id: payment.id,
        orderId: payment.orderId,
    });

    // Example: Release reserved inventory
    // await inventory.release(payment.orderId);
}

async function handlePaymentRefunded(payment: any) {
    console.log("↩️ Payment refunded:", {
        id: payment.id,
        amount: payment.amount,
        orderId: payment.orderId,
    });

    // Example: Update order status
    // await db.order.update({
    //   where: { id: payment.orderId },
    //   data: { status: 'refunded', refundedAt: new Date() }
    // });
}
