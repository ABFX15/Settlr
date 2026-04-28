/**
 * GET /api/admin/merchants
 *
 * Returns a paginated list of all merchants on the platform with summary
 * stats. Wallet-gated: caller must be on the ADMIN_WALLETS env list.
 *
 * Query params:
 *   limit  — page size, default 50, max 200
 *   offset — page offset, default 0
 *   search — substring match on name, wallet_address, signer_wallet, or license_number
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const auth = requireAdmin(request);
    if (!auth.ok) return auth.response;

    if (!isSupabaseConfigured()) {
        return NextResponse.json(
            { error: "supabase_not_configured", merchants: [], total: 0 },
            { status: 503 },
        );
    }

    const limitRaw = Number(request.nextUrl.searchParams.get("limit"));
    const offsetRaw = Number(request.nextUrl.searchParams.get("offset"));
    const search = (request.nextUrl.searchParams.get("search") || "").trim();
    const limit = Math.min(
        200,
        Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 50,
    );
    const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    let query = supabase
        .from("merchants")
        .select(
            "id, name, wallet_address, signer_wallet, multisig_pda, license_number, receipt_pubkey, website_url, created_at, updated_at",
            { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (search) {
        // Supabase or() takes a single comma-separated filter expression.
        // Escape commas in the search term to avoid breaking the parser.
        const safe = search.replace(/[,()]/g, "");
        query = query.or(
            `name.ilike.%${safe}%,wallet_address.ilike.%${safe}%,signer_wallet.ilike.%${safe}%,license_number.ilike.%${safe}%`,
        );
    }

    const { data, error, count } = await query;
    if (error) {
        console.error("[admin/merchants] supabase error:", error);
        return NextResponse.json(
            { error: "query_failed", detail: error.message },
            { status: 500 },
        );
    }

    return NextResponse.json({
        merchants: data || [],
        total: count ?? data?.length ?? 0,
        limit,
        offset,
    });
}
