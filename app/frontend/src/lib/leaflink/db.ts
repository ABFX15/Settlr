/**
 * LeafLink ↔ Settlr integration — database helpers
 *
 * Manages the sync records that track LeafLink orders through the
 * Settlr settlement lifecycle:
 *
 *   order.created → invoice created → link sent → paid → synced back
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
    LeafLinkSync,
    LeafLinkIntegrationConfig,
    SyncStatus,
} from "./types";

/* ── In-memory fallback ──────────────────────────────── */
const memorySyncs: Map<string, LeafLinkSync> = new Map();
const memoryConfigs: Map<string, LeafLinkIntegrationConfig> = new Map();

function generateId(): string {
    return `lls_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/* ═══════════════════════════════════════════════════════
   SYNC RECORDS
   ═══════════════════════════════════════════════════════ */

/**
 * Create a new sync record when a LeafLink order arrives.
 */
export async function createSync(
    data: Omit<LeafLinkSync, "id" | "created_at" | "updated_at">,
): Promise<LeafLinkSync> {
    const now = new Date().toISOString();
    const record: LeafLinkSync = {
        ...data,
        id: generateId(),
        created_at: now,
        updated_at: now,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("leaflink_syncs")
            .insert(record);

        if (error) {
            console.error("[leaflink] DB insert error:", error);
            throw new Error(`Failed to create sync: ${error.message}`);
        }
    } else {
        memorySyncs.set(record.id, record);
    }

    return record;
}

/**
 * Update a sync record (e.g. after payment, after syncing back to LL).
 */
export async function updateSync(
    id: string,
    updates: Partial<
        Pick<
            LeafLinkSync,
            | "status"
            | "settlr_invoice_id"
            | "settlr_payment_link"
            | "tx_signature"
            | "error"
        >
    >,
): Promise<LeafLinkSync | null> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("leaflink_syncs")
            .update({ ...updates, updated_at: now })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("[leaflink] DB update error:", error);
            return null;
        }
        return data as LeafLinkSync;
    }

    const existing = memorySyncs.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: now };
    memorySyncs.set(id, updated);
    return updated;
}

/**
 * Find a sync by its LeafLink order ID.
 */
export async function getSyncByOrderId(
    leaflinkOrderId: number,
): Promise<LeafLinkSync | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("leaflink_syncs")
            .select()
            .eq("leaflink_order_id", leaflinkOrderId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;
        return data as LeafLinkSync;
    }

    for (const s of memorySyncs.values()) {
        if (s.leaflink_order_id === leaflinkOrderId) return s;
    }
    return null;
}

/**
 * Find a sync by its Settlr invoice ID (used in the payment callback).
 */
export async function getSyncByInvoiceId(
    invoiceId: string,
): Promise<LeafLinkSync | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("leaflink_syncs")
            .select()
            .eq("settlr_invoice_id", invoiceId)
            .limit(1)
            .single();

        if (error || !data) return null;
        return data as LeafLinkSync;
    }

    for (const s of memorySyncs.values()) {
        if (s.settlr_invoice_id === invoiceId) return s;
    }
    return null;
}

/**
 * List syncs for a merchant, with optional status filter.
 */
export async function listSyncs(
    merchantId: string,
    opts?: { status?: SyncStatus; limit?: number },
): Promise<LeafLinkSync[]> {
    const limit = opts?.limit ?? 50;

    if (isSupabaseConfigured()) {
        let query = supabase
            .from("leaflink_syncs")
            .select()
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (opts?.status) {
            query = query.eq("status", opts.status);
        }

        const { data, error } = await query;
        if (error) {
            console.error("[leaflink] DB list error:", error);
            return [];
        }
        return (data ?? []) as LeafLinkSync[];
    }

    return [...memorySyncs.values()]
        .filter(
            (s) =>
                s.merchant_id === merchantId &&
                (!opts?.status || s.status === opts.status),
        )
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, limit);
}

/* ═══════════════════════════════════════════════════════
   INTEGRATION CONFIG
   ═══════════════════════════════════════════════════════ */

/**
 * Save or update a merchant's LeafLink integration config.
 */
export async function upsertConfig(
    config: LeafLinkIntegrationConfig,
): Promise<LeafLinkIntegrationConfig> {
    const now = new Date().toISOString();
    const record = { ...config, updated_at: now };

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("leaflink_configs")
            .upsert(record, { onConflict: "merchant_id" });

        if (error) {
            console.error("[leaflink] Config upsert error:", error);
            throw new Error(`Failed to save config: ${error.message}`);
        }
    } else {
        memoryConfigs.set(config.merchant_id, record);
    }

    return record;
}

/**
 * Get a merchant's LeafLink integration config.
 */
export async function getConfig(
    merchantId: string,
): Promise<LeafLinkIntegrationConfig | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("leaflink_configs")
            .select()
            .eq("merchant_id", merchantId)
            .single();

        if (error || !data) return null;
        return data as LeafLinkIntegrationConfig;
    }

    return memoryConfigs.get(merchantId) ?? null;
}

/**
 * Get all active configs (for routing incoming LeafLink webhooks).
 */
export async function getAllConfigs(): Promise<LeafLinkIntegrationConfig[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("leaflink_configs")
            .select();

        if (error) {
            console.error("[leaflink] Config list error:", error);
            return [];
        }
        return (data ?? []) as LeafLinkIntegrationConfig[];
    }

    return [...memoryConfigs.values()];
}
