/**
 * Settlr Shopify App — Express Server
 *
 * Implements the Shopify Payments App Extension flow:
 *
 * 1. Shopify calls POST /payment    → we create a Settlr payment & return redirect
 * 2. Customer pays on Settlr checkout
 * 3. Settlr webhook hits POST /webhook → we resolve the payment session
 * 4. Shopify calls POST /refund     → we call Settlr refund API
 *
 * For production, add proper session handling and Shopify OAuth.
 * This implementation covers the payments extension contract.
 */

import "dotenv/config";
import express from "express";
import crypto from "crypto";
import { SettlrAPI } from "./settlr-api";

const app = express();
app.use(express.json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));

const PORT = Number(process.env.PORT || 3200);
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const SETTLR_API_KEY = process.env.SETTLR_API_KEY!;
const SETTLR_BASE_URL = process.env.SETTLR_BASE_URL || "https://settlr.dev";
const APP_HOST = process.env.SHOPIFY_HOST || `http://localhost:${PORT}`;

if (!SETTLR_API_KEY) {
  console.error("❌  SETTLR_API_KEY is required");
  process.exit(1);
}

const settlr = new SettlrAPI(SETTLR_API_KEY, SETTLR_BASE_URL);

// In-memory map of Settlr payment ID → Shopify payment session.
// In production, use Redis or a database.
const paymentSessions = new Map<string, {
  shopifyPaymentId: string;
  gid: string;
  amount: number;
  currency: string;
  cancelUrl: string;
}>();

// ── Helpers ───────────────────────────────────────────────────────────

function verifyShopifyHmac(req: any): boolean {
  if (!SHOPIFY_API_SECRET) return true; // skip in dev
  const hmac = req.headers["x-shopify-hmac-sha256"];
  if (!hmac) return false;
  const digest = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(req.rawBody)
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
}

// ── Health ────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "settlr-shopify-app" });
});

// ── POST /payment ─────────────────────────────────────────────────────
// Called by Shopify when a customer selects "Pay with USDC" at checkout.

app.post("/payment", async (req, res) => {
  try {
    if (!verifyShopifyHmac(req)) {
      return res.status(401).json({ error: "Invalid HMAC" });
    }

    const {
      id: shopifyPaymentId,
      gid,
      amount,
      currency,
      payment_method: _paymentMethod,
      cancel_url: cancelUrl,
      kind,
      test,
    } = req.body;

    console.log(`[payment] Shopify payment session ${shopifyPaymentId}, amount=${amount} ${currency}`);

    // Create a Settlr payment
    const payment = await settlr.createPayment({
      amount: parseFloat(amount),
      memo: `Shopify order`,
      redirectUrl: `${APP_HOST}/payment/complete?session=${shopifyPaymentId}`,
      webhookUrl: `${APP_HOST}/webhook`,
      metadata: {
        source: "shopify",
        shopify_payment_id: shopifyPaymentId,
        shopify_gid: gid,
        test: test ? "true" : "false",
      },
    });

    // Store the session mapping
    paymentSessions.set(payment.id, {
      shopifyPaymentId,
      gid,
      amount: parseFloat(amount),
      currency,
      cancelUrl,
    });

    // Return redirect to Settlr checkout
    res.json({
      redirect_url: payment.checkoutUrl,
    });
  } catch (err: any) {
    console.error("[payment] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /payment/complete ─────────────────────────────────────────────
// Customer lands here after completing Settlr checkout.

app.get("/payment/complete", (req, res) => {
  const sessionId = req.query.session as string;
  // In production, check payment status and render a proper page.
  // The actual status update happens via webhook, so this is just a UX landing.
  res.send(`
    <html>
      <body style="font-family:system-ui;text-align:center;padding:80px">
        <h2>Payment Processing</h2>
        <p>Your USDC payment is being confirmed. You'll be redirected to your order shortly.</p>
        <p style="color:#888;font-size:14px">Session: ${sessionId}</p>
      </body>
    </html>
  `);
});

// ── POST /webhook ─────────────────────────────────────────────────────
// Called by Settlr when the on-chain payment is confirmed.

app.post("/webhook", async (req, res) => {
  try {
    const { event, data } = req.body;
    const settlrPaymentId = data?.id;

    console.log(`[webhook] event=${event}, paymentId=${settlrPaymentId}`);

    const session = paymentSessions.get(settlrPaymentId);
    if (!session) {
      console.warn(`[webhook] No session found for payment ${settlrPaymentId}`);
      return res.status(200).json({ ok: true, note: "no session" });
    }

    if (event === "payment.confirmed") {
      // Resolve the Shopify payment session via GraphQL
      // In production, use the Shopify Admin API with the shop's access token.
      console.log(`[webhook] Payment confirmed for Shopify session ${session.shopifyPaymentId}`);

      // The paymentSessionResolve mutation would be called here:
      // mutation paymentSessionResolve($id: ID!) {
      //   paymentSessionResolve(id: $id) {
      //     paymentSession { id, state { ... } }
      //     userErrors { field, message }
      //   }
      // }

      paymentSessions.delete(settlrPaymentId);
    }

    if (event === "payment.failed" || event === "payment.expired") {
      console.log(`[webhook] Payment ${event} for Shopify session ${session.shopifyPaymentId}`);

      // The paymentSessionReject mutation would be called here:
      // mutation paymentSessionReject($id: ID!, $reason: PaymentSessionRejectionReasonInput!) { ... }

      paymentSessions.delete(settlrPaymentId);
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error("[webhook] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /refund ──────────────────────────────────────────────────────
// Called by Shopify when a merchant initiates a refund.

app.post("/refund", async (req, res) => {
  try {
    if (!verifyShopifyHmac(req)) {
      return res.status(401).json({ error: "Invalid HMAC" });
    }

    const { id: refundId, gid, payment_id, amount, currency } = req.body;

    console.log(`[refund] Shopify refund ${refundId}, payment=${payment_id}, amount=${amount}`);

    // Find the Settlr payment ID from metadata
    // In production, look this up from your database
    const result = await settlr.refundPayment(payment_id, parseFloat(amount), "Shopify refund");

    res.json({ success: true });
  } catch (err: any) {
    console.error("[refund] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`⚡ Settlr Shopify app running on port ${PORT}`);
});
