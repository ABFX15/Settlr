/**
 * Saved payees (supplier address book).
 *
 * The primitive that turns "send crypto to an address" into "pay your
 * distributor in two clicks". Persists to Supabase when configured; falls back
 * to an in-memory store for tests/dev (no DB required).
 */

import { logger } from "@/lib/logger";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface Payee {
    id: string;
    merchantId: string;
    name: string;
    walletAddress: string;
    licenseNumber?: string;
    note?: string;
    createdAt: string;
}

/* ── in-memory fallback ── */
const byMerchant: Map<string, Payee[]> = new Map();
const byId: Map<string, Payee> = new Map();

interface PayeeRow {
    id: string;
    merchant_id: string;
    name: string;
    wallet_address: string;
    license_number?: string | null;
    note?: string | null;
    created_at: string;
}

function fromRow(r: PayeeRow): Payee {
    return {
        id: r.id,
        merchantId: r.merchant_id,
        name: r.name,
        walletAddress: r.wallet_address,
        licenseNumber: r.license_number ?? undefined,
        note: r.note ?? undefined,
        createdAt: r.created_at,
    };
}

export async function listPayees(merchantId: string): Promise<Payee[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payees")
            .select()
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });
        if (error) {
            logger.error("[payees] list error:", error);
            return [];
        }
        return (data ?? []).map(fromRow);
    }
    return byMerchant.get(merchantId) || [];
}

export async function getPayee(id: string): Promise<Payee | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payees")
            .select()
            .eq("id", id)
            .single();
        if (error || !data) return null;
        return fromRow(data);
    }
    return byId.get(id) ?? null;
}

export async function createPayee(
    data: Omit<Payee, "id" | "createdAt">,
): Promise<Payee> {
    const payee: Payee = {
        ...data,
        id: `pye_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("payees").insert({
            id: payee.id,
            merchant_id: payee.merchantId,
            name: payee.name,
            wallet_address: payee.walletAddress,
            license_number: payee.licenseNumber ?? null,
            note: payee.note ?? null,
            created_at: payee.createdAt,
        });
        if (error) {
            logger.error("[payees] insert error:", error);
            throw new Error(`Failed to save payee: ${error.message}`);
        }
        return payee;
    }

    const list = byMerchant.get(payee.merchantId) || [];
    list.unshift(payee);
    byMerchant.set(payee.merchantId, list);
    byId.set(payee.id, payee);
    return payee;
}

export async function deletePayee(
    merchantId: string,
    id: string,
): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const { error, count } = await supabase
            .from("payees")
            .delete({ count: "exact" })
            .eq("id", id)
            .eq("merchant_id", merchantId);
        if (error) {
            logger.error("[payees] delete error:", error);
            return false;
        }
        return (count ?? 0) > 0;
    }

    const payee = byId.get(id);
    if (!payee || payee.merchantId !== merchantId) return false;
    byId.delete(id);
    byMerchant.set(
        merchantId,
        (byMerchant.get(merchantId) || []).filter((p) => p.id !== id),
    );
    return true;
}
