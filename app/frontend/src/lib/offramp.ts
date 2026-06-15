/**
 * Off-ramp (USDC → USD) request store + settlement confirmation.
 *
 * Off-ramping cannabis-derived USDC to a bank is the hard part of the model:
 * generic crypto off-ramps won't touch it, and the merchant's own bank can
 * freeze crypto-sourced cannabis deposits. So we DON'T pretend it settles
 * instantly. A request stays `pending` until a real settlement partner
 * confirms the USD actually moved, via the signature-verified webhook at
 * /api/integrations/offramp/webhook.
 *
 * Provider model (OFFBANK_OFFRAMP_PROVIDER):
 *   - "manual" (default): a cannabis-compliant settlement partner (e.g. Safe
 *     Harbor Financial / a partner credit union) processes the payout off
 *     the on-chain audit trail + KYB we already produce, then calls our
 *     webhook to confirm. No generic crypto off-ramp involved.
 *   - "<partner>": a future direct-API integration would set status to
 *     "processing" on submit and rely on the same webhook to complete.
 *
 * The on-chain audit trail + Sumsub KYB are the assets that make a compliant
 * partner willing to accept these funds — provenance is the whole point.
 */

import crypto from "crypto";

export type OfframpStatus = "pending" | "processing" | "completed" | "failed";

export interface OfframpRequest {
    id: string;
    merchantId: string;
    wallet: string;
    method: string;
    region: string;
    currency: string;
    amount: number;
    localAmount: number;
    accountInfo: string;
    status: OfframpStatus;
    /** Partner's reference once they pick it up (e.g. ACH trace / batch id). */
    providerRef?: string;
    /** Reason when status is "failed". */
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
}

const byMerchant: Map<string, OfframpRequest[]> = new Map();
const byId: Map<string, OfframpRequest> = new Map();

export function getOfframpProvider(): string {
    return (process.env.OFFBANK_OFFRAMP_PROVIDER || "manual").toLowerCase();
}

export function createOfframpRequest(
    data: Omit<OfframpRequest, "id" | "status" | "createdAt" | "updatedAt">,
): OfframpRequest {
    const now = new Date().toISOString();
    const req: OfframpRequest = {
        ...data,
        id: `ofr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        // Honest default: awaiting real partner settlement. Never auto-completes.
        status: "pending",
        createdAt: now,
        updatedAt: now,
    };
    const list = byMerchant.get(req.merchantId) || [];
    list.unshift(req);
    byMerchant.set(req.merchantId, list);
    byId.set(req.id, req);
    return req;
}

export function listOfframpRequests(merchantId: string): OfframpRequest[] {
    return byMerchant.get(merchantId) || [];
}

export function getOfframpRequest(id: string): OfframpRequest | null {
    return byId.get(id) ?? null;
}

export function updateOfframpStatus(
    id: string,
    status: OfframpStatus,
    extra?: { providerRef?: string; failureReason?: string },
): OfframpRequest | null {
    const req = byId.get(id);
    if (!req) return null;
    req.status = status;
    if (extra?.providerRef) req.providerRef = extra.providerRef;
    if (extra?.failureReason) req.failureReason = extra.failureReason;
    req.updatedAt = new Date().toISOString();
    return req;
}

/**
 * Verify an HMAC-SHA256 settlement webhook from the off-ramp partner.
 * The partner signs the raw request body with OFFRAMP_WEBHOOK_SECRET and
 * sends it in the `x-offramp-signature` header. A forged body can't mark a
 * payout completed.
 */
export function verifyOfframpWebhook(
    rawBody: string,
    signature: string,
    secret: string,
): boolean {
    if (!secret || !signature) return false;
    const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}
