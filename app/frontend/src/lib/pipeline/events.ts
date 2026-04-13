/**
 * Data Pipeline — Event Emitter
 *
 * Captures every meaningful state change as a PipelineEvent.
 * Writes to Supabase `pipeline_events` table, or falls back to an
 * in-memory queue for development.
 *
 * Usage from any API route:
 *   import { emitEvent } from "@/lib/pipeline/events";
 *   await emitEvent("payment.completed", "payment", payment.id, merchantId, { amount, ... });
 */

import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "../supabase";
import type { PipelineEvent, PipelineEventType, EntityType } from "./types";

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

const memoryEvents: PipelineEvent[] = [];
const MAX_MEMORY_EVENTS = 10_000;

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

function generateEventId(): string {
    return `pe_${Date.now().toString(36)}_${crypto.randomBytes(8).toString("hex")}`;
}

// ---------------------------------------------------------------------------
// Core emitter
// ---------------------------------------------------------------------------

export async function emitEvent(
    eventType: PipelineEventType,
    entityType: EntityType,
    entityId: string,
    merchantId: string,
    data: Record<string, unknown> = {},
): Promise<PipelineEvent> {
    const event: PipelineEvent = {
        id: generateEventId(),
        eventType,
        entityType,
        entityId,
        merchantId,
        data,
        processed: false,
        createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("pipeline_events").insert({
            id: event.id,
            event_type: event.eventType,
            entity_type: event.entityType,
            entity_id: event.entityId,
            merchant_id: event.merchantId,
            data: event.data,
            processed: false,
            created_at: event.createdAt,
        });

        if (error) {
            console.error("[Pipeline] Failed to write event:", error.message);
            // Fallback to memory so we don't lose the event
            pushToMemory(event);
        }
    } else {
        pushToMemory(event);
    }

    return event;
}

function pushToMemory(event: PipelineEvent): void {
    memoryEvents.push(event);
    // Evict oldest events if over limit
    if (memoryEvents.length > MAX_MEMORY_EVENTS) {
        memoryEvents.splice(0, memoryEvents.length - MAX_MEMORY_EVENTS);
    }
}

// ---------------------------------------------------------------------------
// Query helpers (used by processor)
// ---------------------------------------------------------------------------

export async function getPendingEvents(limit = 500): Promise<PipelineEvent[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("pipeline_events")
            .select("*")
            .eq("processed", false)
            .order("created_at", { ascending: true })
            .limit(limit);

        if (error) {
            console.error("[Pipeline] Failed to fetch pending events:", error.message);
            return [];
        }

        return (data || []).map(mapRow);
    }

    return memoryEvents.filter((e) => !e.processed).slice(0, limit);
}

export async function markEventsProcessed(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("pipeline_events")
            .update({ processed: true, processed_at: new Date().toISOString() })
            .in("id", eventIds);

        if (error) {
            console.error("[Pipeline] Failed to mark events processed:", error.message);
        }
    } else {
        for (const event of memoryEvents) {
            if (eventIds.includes(event.id)) {
                event.processed = true;
            }
        }
    }
}

export async function getEventsByMerchant(
    merchantId: string,
    opts: { limit?: number; offset?: number; eventType?: string; dateFrom?: string; dateTo?: string } = {},
): Promise<PipelineEvent[]> {
    const { limit = 100, offset = 0, eventType, dateFrom, dateTo } = opts;

    if (isSupabaseConfigured()) {
        let query = supabase
            .from("pipeline_events")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (eventType) query = query.eq("event_type", eventType);
        if (dateFrom) query = query.gte("created_at", dateFrom);
        if (dateTo) query = query.lte("created_at", dateTo);

        const { data, error } = await query;
        if (error) {
            console.error("[Pipeline] Failed to fetch merchant events:", error.message);
            return [];
        }
        return (data || []).map(mapRow);
    }

    let filtered = memoryEvents.filter((e) => e.merchantId === merchantId);
    if (eventType) filtered = filtered.filter((e) => e.eventType === eventType);
    if (dateFrom) filtered = filtered.filter((e) => e.createdAt >= dateFrom);
    if (dateTo) filtered = filtered.filter((e) => e.createdAt <= dateTo);
    return filtered.slice(-limit - offset, filtered.length - offset).reverse();
}

export async function getEventCount(processed?: boolean): Promise<number> {
    if (isSupabaseConfigured()) {
        let query = supabase.from("pipeline_events").select("id", { count: "exact", head: true });
        if (processed !== undefined) query = query.eq("processed", processed);
        const { count, error } = await query;
        if (error) return 0;
        return count || 0;
    }

    if (processed === undefined) return memoryEvents.length;
    return memoryEvents.filter((e) => e.processed === processed).length;
}

export async function getOldestPendingEvent(): Promise<PipelineEvent | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("pipeline_events")
            .select("*")
            .eq("processed", false)
            .order("created_at", { ascending: true })
            .limit(1);

        if (error || !data?.[0]) return null;
        return mapRow(data[0]);
    }

    return memoryEvents.find((e) => !e.processed) ?? null;
}

// ---------------------------------------------------------------------------
// SSE stream helpers
// ---------------------------------------------------------------------------

/**
 * Returns recent events for a merchant, suitable for SSE initial payload.
 */
export async function getRecentEvents(merchantId: string, limit = 50): Promise<PipelineEvent[]> {
    return getEventsByMerchant(merchantId, { limit });
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): PipelineEvent {
    return {
        id: row.id,
        eventType: row.event_type,
        entityType: row.entity_type,
        entityId: row.entity_id,
        merchantId: row.merchant_id,
        data: row.data || {},
        processed: row.processed,
        createdAt: row.created_at,
    };
}
