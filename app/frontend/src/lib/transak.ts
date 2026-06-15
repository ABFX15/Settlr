/**
 * Transak fiat on-ramp integration.
 *
 * Lets a client pay an invoice in USD (card or bank/ACH) without owning any
 * crypto: Transak collects the fiat, converts it to USDC, and sends the USDC
 * straight to the *merchant's* settlement wallet. A signed webhook then
 * confirms the order completed before we mark the invoice paid.
 *
 * Two halves:
 *   - buildTransakUrl()      → the hosted-widget URL the buyer is sent to.
 *   - verifyTransakWebhook() → verifies the signed order webhook server-side.
 *
 * Env:
 *   NEXT_PUBLIC_TRANSAK_API_KEY    — partner API key (public, used in widget URL)
 *   NEXT_PUBLIC_TRANSAK_ENVIRONMENT — "STAGING" | "PRODUCTION" (default STAGING)
 *   TRANSAK_WEBHOOK_SECRET         — secret Transak signs webhooks with
 *                                    (your API secret / access token — see dashboard)
 */

import crypto from "crypto";

const WIDGET_HOST: Record<string, string> = {
    STAGING: "https://global-stg.transak.com",
    PRODUCTION: "https://global.transak.com",
};

function widgetHost(): string {
    const env = (process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT || "STAGING").toUpperCase();
    return WIDGET_HOST[env] ?? WIDGET_HOST.STAGING;
}

export interface TransakWidgetParams {
    /** Destination wallet — the MERCHANT's settlement address (buyer needs no wallet). */
    walletAddress: string;
    /** Invoice total in USD. */
    fiatAmount: number;
    /** Correlation id echoed back in the webhook — we use the invoice view token. */
    partnerOrderId: string;
    /** Where to send the buyer after the purchase (back to the invoice). */
    redirectURL: string;
}

/**
 * Build the hosted Transak widget URL for a USD→USDC invoice payment.
 * Returns null if no API key is configured (caller should hide the option).
 */
export function buildTransakUrl(params: TransakWidgetParams): string | null {
    const apiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY;
    if (!apiKey) return null;

    const qs = new URLSearchParams({
        apiKey,
        productsAvailed: "BUY",
        cryptoCurrencyCode: "USDC",
        network: "solana",
        fiatCurrency: "USD",
        fiatAmount: params.fiatAmount.toString(),
        walletAddress: params.walletAddress,
        disableWalletAddressForm: "true",
        partnerOrderId: params.partnerOrderId,
        redirectURL: params.redirectURL,
        themeColor: "34c759",
    });

    return `${widgetHost()}/?${qs.toString()}`;
}

/* ── Webhook verification ──────────────────────────────────── */

/** The order fields we rely on from a Transak webhook. */
export interface TransakOrder {
    id: string;
    status: string;
    partnerOrderId?: string;
    walletAddress?: string;
    cryptoCurrency?: string;
    network?: string;
    cryptoAmount?: number;
    fiatAmount?: number;
    fiatCurrency?: string;
    /** On-chain settlement signature once the USDC transfer lands. */
    transactionHash?: string;
}

export interface TransakWebhookEvent {
    eventID: string;
    webhookData: TransakOrder;
}

/** Constant-time compare of two base64url strings. */
function safeEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/** Verify and decode an HS256 JWT signed with `secret`. Returns payload or null. */
function verifyHs256(token: string, secret: string): Record<string, unknown> | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expected = crypto
        .createHmac("sha256", secret)
        .update(`${header}.${payload}`)
        .digest("base64url");
    if (!safeEqual(signature, expected)) return null;
    try {
        return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    } catch {
        return null;
    }
}

/**
 * Verify a Transak webhook request body and return the order event.
 *
 * Transak delivers the order as a signed JWT in the request body's `data`
 * field. We verify the HS256 signature against TRANSAK_WEBHOOK_SECRET, so a
 * forged body can't mark an invoice paid. Returns null on any failure.
 */
export function verifyTransakWebhook(
    rawBody: string,
    secret: string,
): TransakWebhookEvent | null {
    if (!secret) return null;

    let token: string | undefined;
    try {
        const parsed = JSON.parse(rawBody) as { data?: string };
        token = parsed.data;
    } catch {
        // Some setups POST the raw JWT as the body.
        token = rawBody.trim();
    }
    if (!token) return null;

    const decoded = verifyHs256(token, secret);
    if (!decoded) return null;

    // The decoded payload may be the event envelope or the order itself.
    const env = decoded as Partial<TransakWebhookEvent> & Partial<TransakOrder>;
    const webhookData = (env.webhookData ?? (decoded as unknown)) as TransakOrder;
    if (!webhookData || typeof webhookData !== "object" || !webhookData.status) {
        return null;
    }
    return {
        eventID: env.eventID ?? `ORDER_${webhookData.status}`,
        webhookData,
    };
}

/** Does this event represent a fully completed (USDC-delivered) order? */
export function isOrderCompleted(event: TransakWebhookEvent): boolean {
    const status = (event.webhookData.status || "").toUpperCase();
    return status === "COMPLETED" || event.eventID.toUpperCase() === "ORDER_COMPLETED";
}
