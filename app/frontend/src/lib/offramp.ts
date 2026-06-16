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
 * Persists to Supabase when configured; falls back to in-memory for tests/dev.
 *
 * Provider model (OFFBANK_OFFRAMP_PROVIDER): see offramp-providers.ts. The
 * on-chain audit trail + Sumsub KYB are the assets that make a compliant
 * partner willing to accept these funds — provenance is the whole point.
 */

import crypto from "crypto";
import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
    provider?: string;
    providerRef?: string;
    licenseNumber?: string | null;
    riskScore?: number;
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
}

/* ── in-memory fallback ── */
const byMerchant: Map<string, OfframpRequest[]> = new Map();
const byId: Map<string, OfframpRequest> = new Map();

interface RequestRow {
    id: string;
    merchant_id: string;
    wallet: string;
    method: string;
    region: string;
    currency: string;
    amount: number;
    local_amount: number;
    account_info: string;
    status: OfframpStatus;
    provider?: string | null;
    provider_ref?: string | null;
    license_number?: string | null;
    risk_score?: number | null;
    failure_reason?: string | null;
    created_at: string;
    updated_at: string;
}

function fromRow(r: RequestRow): OfframpRequest {
    return {
        id: r.id,
        merchantId: r.merchant_id,
        wallet: r.wallet,
        method: r.method,
        region: r.region,
        currency: r.currency,
        amount: Number(r.amount),
        localAmount: Number(r.local_amount),
        accountInfo: r.account_info,
        status: r.status,
        provider: r.provider ?? undefined,
        providerRef: r.provider_ref ?? undefined,
        licenseNumber: r.license_number ?? null,
        riskScore: r.risk_score ?? undefined,
        failureReason: r.failure_reason ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

function toRow(r: OfframpRequest): RequestRow {
    return {
        id: r.id,
        merchant_id: r.merchantId,
        wallet: r.wallet,
        method: r.method,
        region: r.region,
        currency: r.currency,
        amount: r.amount,
        local_amount: r.localAmount,
        account_info: r.accountInfo,
        status: r.status,
        provider: r.provider ?? null,
        provider_ref: r.providerRef ?? null,
        license_number: r.licenseNumber ?? null,
        risk_score: r.riskScore ?? null,
        failure_reason: r.failureReason ?? null,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
    };
}

export function getOfframpProvider(): string {
    return (process.env.OFFBANK_OFFRAMP_PROVIDER || "manual").toLowerCase();
}

export async function createOfframpRequest(
    data: Omit<OfframpRequest, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<OfframpRequest> {
    const now = new Date().toISOString();
    const req: OfframpRequest = {
        ...data,
        id: `ofr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        status: "pending", // Honest default: never auto-completes.
        createdAt: now,
        updatedAt: now,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("offramp_requests").insert(toRow(req));
        if (error) {
            logger.error("[offramp] insert error:", error);
            throw new Error(`Failed to create off-ramp request: ${error.message}`);
        }
        return req;
    }

    const list = byMerchant.get(req.merchantId) || [];
    list.unshift(req);
    byMerchant.set(req.merchantId, list);
    byId.set(req.id, req);
    return req;
}

export async function listOfframpRequests(
    merchantId: string,
): Promise<OfframpRequest[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("offramp_requests")
            .select()
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });
        if (error) {
            logger.error("[offramp] list error:", error);
            return [];
        }
        return (data ?? []).map(fromRow);
    }
    return byMerchant.get(merchantId) || [];
}

export async function getOfframpRequest(
    id: string,
): Promise<OfframpRequest | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("offramp_requests")
            .select()
            .eq("id", id)
            .single();
        if (error || !data) return null;
        return fromRow(data);
    }
    return byId.get(id) ?? null;
}

export async function listOfframpsByStatus(
    status: OfframpStatus,
): Promise<OfframpRequest[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("offramp_requests")
            .select()
            .eq("status", status)
            .order("created_at", { ascending: false });
        if (error) {
            logger.error("[offramp] list-by-status error:", error);
            return [];
        }
        return (data ?? []).map(fromRow);
    }
    return [...byId.values()].filter((r) => r.status === status);
}

export async function updateOfframpStatus(
    id: string,
    status: OfframpStatus,
    extra?: { provider?: string; providerRef?: string; failureReason?: string },
): Promise<OfframpRequest | null> {
    if (isSupabaseConfigured()) {
        const patch: Record<string, unknown> = { status };
        if (extra?.provider) patch.provider = extra.provider;
        if (extra?.providerRef) patch.provider_ref = extra.providerRef;
        if (extra?.failureReason) patch.failure_reason = extra.failureReason;
        const { data, error } = await supabase
            .from("offramp_requests")
            .update(patch)
            .eq("id", id)
            .select()
            .single();
        if (error || !data) {
            if (error) logger.error("[offramp] update error:", error);
            return null;
        }
        return fromRow(data);
    }

    const req = byId.get(id);
    if (!req) return null;
    req.status = status;
    if (extra?.provider) req.provider = extra.provider;
    if (extra?.providerRef) req.providerRef = extra.providerRef;
    if (extra?.failureReason) req.failureReason = extra.failureReason;
    req.updatedAt = new Date().toISOString();
    return req;
}

/* ── OTC batches ───────────────────────────────────────────── */

export type OfframpBatchStatus = "open" | "settled";

export interface OfframpBatch {
    id: string;
    requestIds: string[];
    totalAmount: number;
    currency: string;
    status: OfframpBatchStatus;
    wireRef?: string;
    createdAt: string;
    updatedAt: string;
}

const batches: Map<string, OfframpBatch> = new Map();

interface BatchRow {
    id: string;
    request_ids: string[];
    total_amount: number;
    currency: string;
    status: OfframpBatchStatus;
    wire_ref?: string | null;
    created_at: string;
    updated_at: string;
}

function batchFromRow(r: BatchRow): OfframpBatch {
    return {
        id: r.id,
        requestIds: r.request_ids ?? [],
        totalAmount: Number(r.total_amount),
        currency: r.currency,
        status: r.status,
        wireRef: r.wire_ref ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

/**
 * Create a batch from pending requests (all pending if `requestIds` omitted).
 * Included requests move to "processing" (handed to the OTC desk).
 */
export async function createOfframpBatch(
    requestIds?: string[],
): Promise<OfframpBatch | null> {
    let reqs: OfframpRequest[];
    if (requestIds) {
        reqs = (await Promise.all(requestIds.map((id) => getOfframpRequest(id)))).filter(
            (r): r is OfframpRequest => !!r && r.status === "pending",
        );
    } else {
        reqs = await listOfframpsByStatus("pending");
    }
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

    for (const r of reqs) {
        await updateOfframpStatus(r.id, "processing", { provider: "otc" });
    }

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("offramp_batches").insert({
            id: batch.id,
            request_ids: batch.requestIds,
            total_amount: batch.totalAmount,
            currency: batch.currency,
            status: batch.status,
            created_at: batch.createdAt,
            updated_at: batch.updatedAt,
        });
        if (error) {
            logger.error("[offramp] batch insert error:", error);
            throw new Error(`Failed to create batch: ${error.message}`);
        }
        return batch;
    }

    batches.set(batch.id, batch);
    return batch;
}

export async function getOfframpBatch(id: string): Promise<OfframpBatch | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("offramp_batches")
            .select()
            .eq("id", id)
            .single();
        if (error || !data) return null;
        return batchFromRow(data);
    }
    return batches.get(id) ?? null;
}

export async function listOfframpBatches(): Promise<OfframpBatch[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("offramp_batches")
            .select()
            .order("created_at", { ascending: false });
        if (error) {
            logger.error("[offramp] batch list error:", error);
            return [];
        }
        return (data ?? []).map(batchFromRow);
    }
    return [...batches.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Settle a batch: mark it + all its requests completed with the wire ref. */
export async function settleOfframpBatch(
    id: string,
    wireRef: string,
): Promise<{ batch: OfframpBatch; settled: OfframpRequest[] } | null> {
    const batch = await getOfframpBatch(id);
    if (!batch || batch.status === "settled") return null;

    const settled: OfframpRequest[] = [];
    for (const rid of batch.requestIds) {
        const r = await updateOfframpStatus(rid, "completed", {
            provider: "otc",
            providerRef: wireRef,
        });
        if (r) settled.push(r);
    }

    batch.status = "settled";
    batch.wireRef = wireRef;
    batch.updatedAt = new Date().toISOString();

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("offramp_batches")
            .update({ status: "settled", wire_ref: wireRef })
            .eq("id", id);
        if (error) logger.error("[offramp] batch settle error:", error);
    }

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
