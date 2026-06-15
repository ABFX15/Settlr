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
    /** Which provider is handling this payout (e.g. "cybrid", "manual"). */
    provider?: string;
    /** Partner's reference once they pick it up (e.g. ACH trace / batch id). */
    providerRef?: string;
    /** Compliance metadata partners require — attached automatically. */
    licenseNumber?: string | null;
    /** Range risk score (0-100) of the merchant wallet at payout time. */
    riskScore?: number;
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
    extra?: { provider?: string; providerRef?: string; failureReason?: string },
): OfframpRequest | null {
    const req = byId.get(id);
    if (!req) return null;
    req.status = status;
    if (extra?.provider) req.provider = extra.provider;
    if (extra?.providerRef) req.providerRef = extra.providerRef;
    if (extra?.failureReason) req.failureReason = extra.failureReason;
    req.updatedAt = new Date().toISOString();
    return req;
}

export function listOfframpsByStatus(status: OfframpStatus): OfframpRequest[] {
    return [...byId.values()].filter((r) => r.status === status);
}

/* ── OTC batches ───────────────────────────────────────────────
   At volume, an OTC desk clears payouts in batches off the licensing data
   we export, then wires USD to the cannabis-compliant bank. A batch groups
   payouts, moves them to "processing" (handed to the desk), and settles them
   all when the wire confirms. */

export type OfframpBatchStatus = "open" | "settled";

export interface OfframpBatch {
    id: string;
    requestIds: string[];
    totalAmount: number;
    currency: string;
    status: OfframpBatchStatus;
    /** Wire/ACH reference from the OTC desk once the batch settles. */
    wireRef?: string;
    createdAt: string;
    updatedAt: string;
}

const batches: Map<string, OfframpBatch> = new Map();

/**
 * Create a batch from pending requests (all pending if `requestIds` omitted).
 * Included requests move to "processing" (handed to the OTC desk).
 */
export function createOfframpBatch(requestIds?: string[]): OfframpBatch | null {
    const reqs = (requestIds
        ? requestIds.map((id) => byId.get(id)).filter((r): r is OfframpRequest => !!r)
        : listOfframpsByStatus("pending")
    ).filter((r) => r.status === "pending");

    if (reqs.length === 0) return null;

    const now = new Date().toISOString();
    const batch: OfframpBatch = {
        id: `ofb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        requestIds: reqs.map((r) => r.id),
        totalAmount: reqs.reduce((s, r) => s + r.amount, 0),
        currency: reqs[0].currency,
        status: "open",
        createdAt: now,
        updatedAt: now,
    };
    for (const r of reqs) updateOfframpStatus(r.id, "processing", { provider: "otc" });
    batches.set(batch.id, batch);
    return batch;
}

export function getOfframpBatch(id: string): OfframpBatch | null {
    return batches.get(id) ?? null;
}

export function listOfframpBatches(): OfframpBatch[] {
    return [...batches.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Settle a batch: mark it + all its requests completed with the wire ref. */
export function settleOfframpBatch(
    id: string,
    wireRef: string,
): { batch: OfframpBatch; settled: OfframpRequest[] } | null {
    const batch = batches.get(id);
    if (!batch || batch.status === "settled") return null;
    const settled: OfframpRequest[] = [];
    for (const rid of batch.requestIds) {
        const r = updateOfframpStatus(rid, "completed", {
            provider: "otc",
            providerRef: wireRef,
        });
        if (r) settled.push(r);
    }
    batch.status = "settled";
    batch.wireRef = wireRef;
    batch.updatedAt = new Date().toISOString();
    return { batch, settled };
}

/** CSV the OTC desk needs to clear a batch (compliance + settlement fields). */
export function buildOtcExportCsv(requests: OfframpRequest[]): string {
    const esc = (v: unknown) => {
        const s = v == null ? "" : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = [
        "request_id",
        "merchant_id",
        "wallet",
        "license_number",
        "amount_usdc",
        "currency",
        "method",
        "destination_account",
        "risk_score",
        "created_at",
    ];
    const rows = requests.map((r) =>
        [
            r.id,
            r.merchantId,
            r.wallet,
            r.licenseNumber ?? "",
            r.amount,
            r.currency,
            r.method,
            r.accountInfo,
            r.riskScore ?? "",
            r.createdAt,
        ]
            .map(esc)
            .join(","),
    );
    return [header.join(","), ...rows].join("\n");
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
