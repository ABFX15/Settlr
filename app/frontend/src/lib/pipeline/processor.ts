/**
 * Data Pipeline — Batch Processor
 *
 * Reads unprocessed PipelineEvents, updates aggregation tables
 * (merchant_daily_stats, platform_daily_stats), and marks events
 * as processed. Designed to be called by a cron endpoint.
 *
 * Runs idempotently — safe to call multiple times.
 */

import { supabase, isSupabaseConfigured } from "../supabase";
import { getPendingEvents, markEventsProcessed } from "./events";
import type {
    PipelineEvent,
    PipelineEventType,
    MerchantDailyStats,
    PlatformDailyStats,
} from "./types";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// In-memory aggregation stores
// ---------------------------------------------------------------------------

// key: `${merchantId}:${date}`
const memoryMerchantStats = new Map<string, MerchantDailyStats>();
// key: `${date}`
const memoryPlatformStats = new Map<string, PlatformDailyStats>();

let lastProcessedAt: string | null = null;
let totalProcessedCount = 0;

// ---------------------------------------------------------------------------
// Main processor
// ---------------------------------------------------------------------------

export interface ProcessResult {
    eventsProcessed: number;
    merchantStatsUpdated: number;
    platformStatsUpdated: number;
    errors: string[];
    durationMs: number;
}

export async function processEvents(batchSize = 500): Promise<ProcessResult> {
    const start = Date.now();
    const errors: string[] = [];

    const events = await getPendingEvents(batchSize);
    if (events.length === 0) {
        return { eventsProcessed: 0, merchantStatsUpdated: 0, platformStatsUpdated: 0, errors, durationMs: Date.now() - start };
    }

    // Group events by merchant+date for efficient aggregation
    const merchantDateBuckets = new Map<string, PipelineEvent[]>();
    const dateBuckets = new Map<string, PipelineEvent[]>();
    const activeMerchantsByDate = new Map<string, Set<string>>();

    for (const event of events) {
        const date = event.createdAt.substring(0, 10); // YYYY-MM-DD
        const key = `${event.merchantId}:${date}`;

        if (!merchantDateBuckets.has(key)) merchantDateBuckets.set(key, []);
        merchantDateBuckets.get(key)!.push(event);

        if (!dateBuckets.has(date)) dateBuckets.set(date, []);
        dateBuckets.get(date)!.push(event);

        if (!activeMerchantsByDate.has(date)) activeMerchantsByDate.set(date, new Set());
        activeMerchantsByDate.get(date)!.add(event.merchantId);
    }

    // Update merchant daily stats
    let merchantStatsUpdated = 0;
    for (const [key, bucket] of merchantDateBuckets) {
        try {
            const [merchantId, date] = key.split(/:(.+)/);
            await upsertMerchantDailyStats(merchantId, date, bucket);
            merchantStatsUpdated++;
        } catch (err) {
            errors.push(`merchant-stats:${key}: ${(err as Error).message}`);
        }
    }

    // Update platform daily stats
    let platformStatsUpdated = 0;
    for (const [date, bucket] of dateBuckets) {
        try {
            const activeMerchants = activeMerchantsByDate.get(date)?.size ?? 0;
            await upsertPlatformDailyStats(date, bucket, activeMerchants);
            platformStatsUpdated++;
        } catch (err) {
            errors.push(`platform-stats:${date}: ${(err as Error).message}`);
        }
    }

    // Mark all events as processed
    await markEventsProcessed(events.map((e) => e.id));

    lastProcessedAt = new Date().toISOString();
    totalProcessedCount += events.length;

    return {
        eventsProcessed: events.length,
        merchantStatsUpdated,
        platformStatsUpdated,
        errors,
        durationMs: Date.now() - start,
    };
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

function computeDeltas(events: PipelineEvent[]) {
    const deltas = {
        paymentsCount: 0,
        paymentsVolume: 0,
        invoicesCreated: 0,
        invoicesPaid: 0,
        invoicesPaidVolume: 0,
        payoutsCount: 0,
        payoutsVolume: 0,
        feesCollected: 0,
        ordersCreated: 0,
        ordersPaidVolume: 0,
        subscriptionRevenue: 0,
        newRecipients: 0,
        newMerchants: 0,
        activeSubscriptions: 0,
    };

    for (const event of events) {
        const amount = (event.data.amount as number) || 0;
        const fee = (event.data.fee as number) || 0;

        const handlers: Partial<Record<PipelineEventType, () => void>> = {
            "payment.completed": () => { deltas.paymentsCount++; deltas.paymentsVolume += amount; },
            "invoice.created": () => { deltas.invoicesCreated++; },
            "invoice.paid": () => { deltas.invoicesPaid++; deltas.invoicesPaidVolume += amount; },
            "payout.created": () => { deltas.payoutsCount++; deltas.payoutsVolume += amount; },
            "fee.collected": () => { deltas.feesCollected += fee || amount; },
            "order.created": () => { deltas.ordersCreated++; },
            "order.paid": () => { deltas.ordersPaidVolume += amount; },
            "subscription.renewed": () => { deltas.subscriptionRevenue += amount; },
            "subscription.created": () => { deltas.activeSubscriptions++; },
            "subscription.cancelled": () => { deltas.activeSubscriptions--; },
            "recipient.registered": () => { deltas.newRecipients++; },
            "merchant.registered": () => { deltas.newMerchants++; },
        };

        const handler = handlers[event.eventType];
        if (handler) handler();
    }

    return deltas;
}

// ---------------------------------------------------------------------------
// Merchant daily stats upsert
// ---------------------------------------------------------------------------

async function upsertMerchantDailyStats(
    merchantId: string,
    date: string,
    events: PipelineEvent[],
): Promise<void> {
    const deltas = computeDeltas(events);

    if (isSupabaseConfigured()) {
        // Try to fetch existing row
        const { data: existing } = await supabase
            .from("merchant_daily_stats")
            .select("*")
            .eq("merchant_id", merchantId)
            .eq("date", date)
            .single();

        if (existing) {
            const { error } = await supabase
                .from("merchant_daily_stats")
                .update({
                    payments_count: (existing.payments_count || 0) + deltas.paymentsCount,
                    payments_volume: (existing.payments_volume || 0) + deltas.paymentsVolume,
                    invoices_created: (existing.invoices_created || 0) + deltas.invoicesCreated,
                    invoices_paid: (existing.invoices_paid || 0) + deltas.invoicesPaid,
                    invoices_paid_volume: (existing.invoices_paid_volume || 0) + deltas.invoicesPaidVolume,
                    payouts_count: (existing.payouts_count || 0) + deltas.payoutsCount,
                    payouts_volume: (existing.payouts_volume || 0) + deltas.payoutsVolume,
                    fees_collected: (existing.fees_collected || 0) + deltas.feesCollected,
                    orders_created: (existing.orders_created || 0) + deltas.ordersCreated,
                    orders_paid_volume: (existing.orders_paid_volume || 0) + deltas.ordersPaidVolume,
                    active_subscriptions: (existing.active_subscriptions || 0) + deltas.activeSubscriptions,
                    subscription_revenue: (existing.subscription_revenue || 0) + deltas.subscriptionRevenue,
                    new_recipients: (existing.new_recipients || 0) + deltas.newRecipients,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);

            if (error) throw new Error(`Update failed: ${error.message}`);
        } else {
            const { error } = await supabase.from("merchant_daily_stats").insert({
                id: `mds_${crypto.randomBytes(12).toString("hex")}`,
                merchant_id: merchantId,
                date,
                payments_count: deltas.paymentsCount,
                payments_volume: deltas.paymentsVolume,
                invoices_created: deltas.invoicesCreated,
                invoices_paid: deltas.invoicesPaid,
                invoices_paid_volume: deltas.invoicesPaidVolume,
                payouts_count: deltas.payoutsCount,
                payouts_volume: deltas.payoutsVolume,
                fees_collected: deltas.feesCollected,
                orders_created: deltas.ordersCreated,
                orders_paid_volume: deltas.ordersPaidVolume,
                active_subscriptions: deltas.activeSubscriptions,
                subscription_revenue: deltas.subscriptionRevenue,
                new_recipients: deltas.newRecipients,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            if (error) throw new Error(`Insert failed: ${error.message}`);
        }
    } else {
        // In-memory upsert
        const key = `${merchantId}:${date}`;
        const existing = memoryMerchantStats.get(key);

        if (existing) {
            existing.paymentsCount += deltas.paymentsCount;
            existing.paymentsVolume += deltas.paymentsVolume;
            existing.invoicesCreated += deltas.invoicesCreated;
            existing.invoicesPaid += deltas.invoicesPaid;
            existing.invoicesPaidVolume += deltas.invoicesPaidVolume;
            existing.payoutsCount += deltas.payoutsCount;
            existing.payoutsVolume += deltas.payoutsVolume;
            existing.feesCollected += deltas.feesCollected;
            existing.ordersCreated += deltas.ordersCreated;
            existing.ordersPaidVolume += deltas.ordersPaidVolume;
            existing.activeSubscriptions += deltas.activeSubscriptions;
            existing.subscriptionRevenue += deltas.subscriptionRevenue;
            existing.newRecipients += deltas.newRecipients;
            existing.updatedAt = new Date().toISOString();
        } else {
            memoryMerchantStats.set(key, {
                id: `mds_${crypto.randomBytes(12).toString("hex")}`,
                merchantId,
                date,
                ...deltas,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }
}

// ---------------------------------------------------------------------------
// Platform daily stats upsert
// ---------------------------------------------------------------------------

async function upsertPlatformDailyStats(
    date: string,
    events: PipelineEvent[],
    activeMerchants: number,
): Promise<void> {
    const deltas = computeDeltas(events);

    if (isSupabaseConfigured()) {
        const { data: existing } = await supabase
            .from("platform_daily_stats")
            .select("*")
            .eq("date", date)
            .single();

        // Count total merchants
        const { count: totalMerchants } = await supabase
            .from("merchants")
            .select("id", { count: "exact", head: true });

        if (existing) {
            const { error } = await supabase
                .from("platform_daily_stats")
                .update({
                    total_merchants: totalMerchants || existing.total_merchants,
                    active_merchants: Math.max(existing.active_merchants || 0, activeMerchants),
                    payments_count: (existing.payments_count || 0) + deltas.paymentsCount,
                    payments_volume: (existing.payments_volume || 0) + deltas.paymentsVolume,
                    invoices_created: (existing.invoices_created || 0) + deltas.invoicesCreated,
                    invoices_paid: (existing.invoices_paid || 0) + deltas.invoicesPaid,
                    payouts_count: (existing.payouts_count || 0) + deltas.payoutsCount,
                    payouts_volume: (existing.payouts_volume || 0) + deltas.payoutsVolume,
                    fees_collected: (existing.fees_collected || 0) + deltas.feesCollected,
                    new_merchants: (existing.new_merchants || 0) + deltas.newMerchants,
                    new_recipients: (existing.new_recipients || 0) + deltas.newRecipients,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);

            if (error) throw new Error(`Update failed: ${error.message}`);
        } else {
            const { error } = await supabase.from("platform_daily_stats").insert({
                id: `pds_${crypto.randomBytes(12).toString("hex")}`,
                date,
                total_merchants: totalMerchants || 0,
                active_merchants: activeMerchants,
                payments_count: deltas.paymentsCount,
                payments_volume: deltas.paymentsVolume,
                invoices_created: deltas.invoicesCreated,
                invoices_paid: deltas.invoicesPaid,
                payouts_count: deltas.payoutsCount,
                payouts_volume: deltas.payoutsVolume,
                fees_collected: deltas.feesCollected,
                new_merchants: deltas.newMerchants,
                new_recipients: deltas.newRecipients,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            if (error) throw new Error(`Insert failed: ${error.message}`);
        }
    } else {
        const existing = memoryPlatformStats.get(date);

        if (existing) {
            existing.activeMerchants = Math.max(existing.activeMerchants, activeMerchants);
            existing.paymentsCount += deltas.paymentsCount;
            existing.paymentsVolume += deltas.paymentsVolume;
            existing.invoicesCreated += deltas.invoicesCreated;
            existing.invoicesPaid += deltas.invoicesPaid;
            existing.payoutsCount += deltas.payoutsCount;
            existing.payoutsVolume += deltas.payoutsVolume;
            existing.feesCollected += deltas.feesCollected;
            existing.newMerchants += deltas.newMerchants;
            existing.newRecipients += deltas.newRecipients;
            existing.updatedAt = new Date().toISOString();
        } else {
            memoryPlatformStats.set(date, {
                id: `pds_${crypto.randomBytes(12).toString("hex")}`,
                date,
                totalMerchants: 0,
                activeMerchants,
                paymentsCount: deltas.paymentsCount,
                paymentsVolume: deltas.paymentsVolume,
                invoicesCreated: deltas.invoicesCreated,
                invoicesPaid: deltas.invoicesPaid,
                payoutsCount: deltas.payoutsCount,
                payoutsVolume: deltas.payoutsVolume,
                feesCollected: deltas.feesCollected,
                newMerchants: deltas.newMerchants,
                newRecipients: deltas.newRecipients,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }
}

// ---------------------------------------------------------------------------
// Query aggregated stats
// ---------------------------------------------------------------------------

export async function getMerchantStats(
    merchantId: string,
    opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
): Promise<MerchantDailyStats[]> {
    const { dateFrom, dateTo, limit = 90 } = opts;

    if (isSupabaseConfigured()) {
        let query = supabase
            .from("merchant_daily_stats")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("date", { ascending: false })
            .limit(limit);

        if (dateFrom) query = query.gte("date", dateFrom);
        if (dateTo) query = query.lte("date", dateTo);

        const { data, error } = await query;
        if (error) {
            console.error("[Pipeline] Failed to fetch merchant stats:", error.message);
            return [];
        }

        return (data || []).map(mapMerchantStatsRow);
    }

    let stats = Array.from(memoryMerchantStats.values())
        .filter((s) => s.merchantId === merchantId);
    if (dateFrom) stats = stats.filter((s) => s.date >= dateFrom);
    if (dateTo) stats = stats.filter((s) => s.date <= dateTo);
    return stats.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export async function getPlatformStats(
    opts: { dateFrom?: string; dateTo?: string; limit?: number } = {},
): Promise<PlatformDailyStats[]> {
    const { dateFrom, dateTo, limit = 90 } = opts;

    if (isSupabaseConfigured()) {
        let query = supabase
            .from("platform_daily_stats")
            .select("*")
            .order("date", { ascending: false })
            .limit(limit);

        if (dateFrom) query = query.gte("date", dateFrom);
        if (dateTo) query = query.lte("date", dateTo);

        const { data, error } = await query;
        if (error) {
            console.error("[Pipeline] Failed to fetch platform stats:", error.message);
            return [];
        }

        return (data || []).map(mapPlatformStatsRow);
    }

    let stats = Array.from(memoryPlatformStats.values());
    if (dateFrom) stats = stats.filter((s) => s.date >= dateFrom);
    if (dateTo) stats = stats.filter((s) => s.date <= dateTo);
    return stats.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Health helpers (exported for health endpoint)
// ---------------------------------------------------------------------------

export function getLastProcessedAt(): string | null {
    return lastProcessedAt;
}

export function getTotalProcessedCount(): number {
    return totalProcessedCount;
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMerchantStatsRow(row: any): MerchantDailyStats {
    return {
        id: row.id,
        merchantId: row.merchant_id,
        date: row.date,
        paymentsCount: row.payments_count || 0,
        paymentsVolume: row.payments_volume || 0,
        invoicesCreated: row.invoices_created || 0,
        invoicesPaid: row.invoices_paid || 0,
        invoicesPaidVolume: row.invoices_paid_volume || 0,
        payoutsCount: row.payouts_count || 0,
        payoutsVolume: row.payouts_volume || 0,
        feesCollected: row.fees_collected || 0,
        ordersCreated: row.orders_created || 0,
        ordersPaidVolume: row.orders_paid_volume || 0,
        activeSubscriptions: row.active_subscriptions || 0,
        subscriptionRevenue: row.subscription_revenue || 0,
        newRecipients: row.new_recipients || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapPlatformStatsRow(row: any): PlatformDailyStats {
    return {
        id: row.id,
        date: row.date,
        totalMerchants: row.total_merchants || 0,
        activeMerchants: row.active_merchants || 0,
        paymentsCount: row.payments_count || 0,
        paymentsVolume: row.payments_volume || 0,
        invoicesCreated: row.invoices_created || 0,
        invoicesPaid: row.invoices_paid || 0,
        payoutsCount: row.payouts_count || 0,
        payoutsVolume: row.payouts_volume || 0,
        feesCollected: row.fees_collected || 0,
        newMerchants: row.new_merchants || 0,
        newRecipients: row.new_recipients || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
