/**
 * Webhook Dispatch Engine
 *
 * Handles reliable delivery of webhook events to merchant endpoints.
 * Supports:
 * - Signed payloads (HMAC-SHA256) for verification
 * - Automatic retries with exponential back-off
 * - Delivery logging for debugging
 * - Event filtering (merchants subscribe to specific event types)
 *
 * Event types:
 *   payout.created     — A new payout was created
 *   payout.claimed     — Recipient claimed a payout
 *   payout.expired     — Payout expired unclaimed
 *   payout.failed      — Payout delivery failed
 *   deposit.confirmed  — Merchant treasury deposit confirmed
 *   batch.created      — Batch payout was created
 */

import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "./supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WebhookEventType =
    | "payout.created"
    | "payout.claimed"
    | "payout.expired"
    | "payout.failed"
    | "deposit.confirmed"
    | "batch.created";

export interface WebhookEvent {
    id: string;
    type: WebhookEventType;
    merchantId: string;
    data: Record<string, unknown>;
    createdAt: string; // ISO 8601
}

export interface WebhookDelivery {
    id: string;
    eventId: string;
    webhookId: string;
    url: string;
    status: "pending" | "success" | "failed";
    httpStatus?: number;
    attempts: number;
    maxAttempts: number;
    lastAttemptAt?: string;
    nextRetryAt?: string;
    responseBody?: string;
    errorMessage?: string;
    createdAt: string;
}

interface WebhookConfig {
    id: string;
    merchantId: string;
    url: string;
    secret: string;
    events: string[];
    active: boolean;
}

// ---------------------------------------------------------------------------
// In-memory stores (fallback when Supabase isn't configured)
// ---------------------------------------------------------------------------

const memoryWebhookEvents: WebhookEvent[] = [];
const memoryWebhookDeliveries: WebhookDelivery[] = [];

// We also reference the in-memory webhook configs from the webhooks route.
// Since those are in a separate module, we maintain our own small cache too.
const memoryWebhookConfigs = new Map<string, WebhookConfig>();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [0, 5_000, 30_000, 120_000, 600_000]; // immediate, 5s, 30s, 2m, 10m

// ---------------------------------------------------------------------------
// ID generators
// ---------------------------------------------------------------------------

function generateEventId(): string {
    return `evt_${crypto.randomBytes(16).toString("hex")}`;
}

function generateDeliveryId(): string {
    return `del_${crypto.randomBytes(12).toString("hex")}`;
}

// ---------------------------------------------------------------------------
// Signature
// ---------------------------------------------------------------------------

export function signPayload(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyPayloadSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const expected = signPayload(payload, secret);
    try {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
        return false;
    }
}

// ---------------------------------------------------------------------------
// Core: get matching webhooks for an event
// ---------------------------------------------------------------------------

async function getWebhooksForEvent(
    merchantId: string,
    eventType: WebhookEventType
): Promise<WebhookConfig[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("webhooks")
            .select("id, merchant_id, url, secret, events, active")
            .eq("merchant_id", merchantId)
            .eq("active", true);

        if (error || !data) return [];

        return (data as Array<{
            id: string;
            merchant_id: string;
            url: string;
            secret: string;
            events: string[];
            active: boolean;
        }>)
            .filter((w) => w.events.includes(eventType) || w.events.includes("*"))
            .map((w) => ({
                id: w.id,
                merchantId: w.merchant_id,
                url: w.url,
                secret: w.secret,
                events: w.events,
                active: w.active,
            }));
    } else {
        return Array.from(memoryWebhookConfigs.values())
            .filter(
                (w) =>
                    w.merchantId === merchantId &&
                    w.active &&
                    (w.events.includes(eventType) || w.events.includes("*"))
            );
    }
}

// ---------------------------------------------------------------------------
// Core: deliver to a single endpoint
// ---------------------------------------------------------------------------

async function deliverWebhook(
    webhookConfig: WebhookConfig,
    event: WebhookEvent
): Promise<WebhookDelivery> {
    const deliveryId = generateDeliveryId();
    const now = new Date().toISOString();

    const delivery: WebhookDelivery = {
        id: deliveryId,
        eventId: event.id,
        webhookId: webhookConfig.id,
        url: webhookConfig.url,
        status: "pending",
        attempts: 0,
        maxAttempts: MAX_ATTEMPTS,
        createdAt: now,
    };

    const payloadString = JSON.stringify(event);
    const signature = signPayload(payloadString, webhookConfig.secret);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        delivery.attempts = attempt + 1;
        delivery.lastAttemptAt = new Date().toISOString();

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

            const response = await fetch(webhookConfig.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Settlr-Signature": signature,
                    "X-Settlr-Event": event.type,
                    "X-Settlr-Delivery": deliveryId,
                    "X-Settlr-Timestamp": event.createdAt,
                    "User-Agent": "Settlr-Webhooks/1.0",
                },
                body: payloadString,
                signal: controller.signal,
            });

            clearTimeout(timeout);

            delivery.httpStatus = response.status;

            if (response.ok) {
                delivery.status = "success";
                try {
                    delivery.responseBody = (await response.text()).slice(0, 500);
                } catch {
                    // ignore
                }
                break;
            } else {
                delivery.errorMessage = `HTTP ${response.status}`;
                try {
                    delivery.responseBody = (await response.text()).slice(0, 500);
                } catch {
                    // ignore
                }
            }
        } catch (err) {
            delivery.errorMessage = err instanceof Error ? err.message : "Unknown error";
        }

        // If not last attempt, wait before retry
        if (attempt < MAX_ATTEMPTS - 1) {
            const delay = RETRY_DELAYS_MS[attempt + 1] || 60_000;
            delivery.nextRetryAt = new Date(Date.now() + delay).toISOString();

            // For the first retry, actually wait (it's short: 5s).
            // For longer delays, we record nextRetryAt but don't block.
            if (delay <= 5_000) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                // Mark as failed for now — a cron/worker would pick up retries
                delivery.status = "failed";
                break;
            }
        } else {
            delivery.status = "failed";
        }
    }

    // Persist delivery record
    await saveDelivery(delivery);

    // Update webhook last delivery status
    await updateWebhookDeliveryStatus(
        webhookConfig.id,
        delivery.status === "success" ? "success" : "failed"
    );

    return delivery;
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

async function saveEvent(event: WebhookEvent): Promise<void> {
    if (isSupabaseConfigured()) {
        await supabase.from("webhook_events").insert({
            id: event.id,
            type: event.type,
            merchant_id: event.merchantId,
            data: event.data,
            created_at: event.createdAt,
        });
    } else {
        memoryWebhookEvents.push(event);
    }
}

async function saveDelivery(delivery: WebhookDelivery): Promise<void> {
    if (isSupabaseConfigured()) {
        await supabase.from("webhook_deliveries").insert({
            id: delivery.id,
            event_id: delivery.eventId,
            webhook_id: delivery.webhookId,
            url: delivery.url,
            status: delivery.status,
            http_status: delivery.httpStatus,
            attempts: delivery.attempts,
            max_attempts: delivery.maxAttempts,
            last_attempt_at: delivery.lastAttemptAt,
            next_retry_at: delivery.nextRetryAt,
            response_body: delivery.responseBody,
            error_message: delivery.errorMessage,
            created_at: delivery.createdAt,
        });
    } else {
        // Upsert in memory
        const idx = memoryWebhookDeliveries.findIndex((d) => d.id === delivery.id);
        if (idx >= 0) {
            memoryWebhookDeliveries[idx] = delivery;
        } else {
            memoryWebhookDeliveries.push(delivery);
        }
    }
}

async function updateWebhookDeliveryStatus(
    webhookId: string,
    status: "success" | "failed"
): Promise<void> {
    if (isSupabaseConfigured()) {
        await supabase
            .from("webhooks")
            .update({
                last_delivery_at: new Date().toISOString(),
                last_delivery_status: status,
            })
            .eq("id", webhookId);
    }
    // In-memory webhook configs don't track delivery status (handled by memory map in webhooks route)
}

// ---------------------------------------------------------------------------
// Public API: dispatch an event
// ---------------------------------------------------------------------------

/**
 * Dispatch a webhook event to all matching merchant endpoints.
 *
 * This is fire-and-forget — call it without `await` from request handlers
 * so webhook delivery doesn't block the API response.
 *
 * @returns Array of delivery results (one per matching webhook endpoint)
 */
export async function dispatchWebhookEvent(
    merchantId: string,
    eventType: WebhookEventType,
    data: Record<string, unknown>
): Promise<WebhookDelivery[]> {
    const event: WebhookEvent = {
        id: generateEventId(),
        type: eventType,
        merchantId,
        data,
        createdAt: new Date().toISOString(),
    };

    await saveEvent(event);

    const webhooks = await getWebhooksForEvent(merchantId, eventType);
    if (webhooks.length === 0) {
        console.log(`[webhooks] No endpoints for ${merchantId} / ${eventType}`);
        return [];
    }

    console.log(`[webhooks] Dispatching ${eventType} to ${webhooks.length} endpoint(s) for ${merchantId}`);

    const deliveries = await Promise.allSettled(
        webhooks.map((wh) => deliverWebhook(wh, event))
    );

    return deliveries
        .filter((r): r is PromiseFulfilledResult<WebhookDelivery> => r.status === "fulfilled")
        .map((r) => r.value);
}

// ---------------------------------------------------------------------------
// Query helpers (for dashboard / API)
// ---------------------------------------------------------------------------

/**
 * Get recent webhook events for a merchant.
 */
export async function getWebhookEvents(
    merchantId: string,
    options?: { type?: WebhookEventType; limit?: number; offset?: number }
): Promise<WebhookEvent[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("webhook_events")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });

        if (options?.type) query = query.eq("type", options.type);
        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data } = await query;
        if (!data) return [];

        return data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            type: d.type as WebhookEventType,
            merchantId: d.merchant_id as string,
            data: (d.data as Record<string, unknown>) || {},
            createdAt: d.created_at as string,
        }));
    } else {
        let events = memoryWebhookEvents.filter((e) => e.merchantId === merchantId);
        if (options?.type) events = events.filter((e) => e.type === options.type);
        events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (options?.offset) events = events.slice(options.offset);
        if (options?.limit) events = events.slice(0, options.limit);
        return events;
    }
}

/**
 * Get delivery attempts for a specific event.
 */
export async function getWebhookDeliveries(
    eventId: string,
    options?: { limit?: number }
): Promise<WebhookDelivery[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("webhook_deliveries")
            .select("*")
            .eq("event_id", eventId)
            .order("created_at", { ascending: false });

        if (options?.limit) query = query.limit(options.limit);

        const { data } = await query;
        if (!data) return [];

        return data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            eventId: d.event_id as string,
            webhookId: d.webhook_id as string,
            url: d.url as string,
            status: d.status as "pending" | "success" | "failed",
            httpStatus: d.http_status as number | undefined,
            attempts: (d.attempts as number) || 0,
            maxAttempts: (d.max_attempts as number) || MAX_ATTEMPTS,
            lastAttemptAt: d.last_attempt_at as string | undefined,
            nextRetryAt: d.next_retry_at as string | undefined,
            responseBody: d.response_body as string | undefined,
            errorMessage: d.error_message as string | undefined,
            createdAt: d.created_at as string,
        }));
    } else {
        let deliveries = memoryWebhookDeliveries.filter((d) => d.eventId === eventId);
        deliveries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (options?.limit) deliveries = deliveries.slice(0, options.limit);
        return deliveries;
    }
}

/**
 * Get recent deliveries for a merchant (all events).
 */
export async function getRecentDeliveries(
    merchantId: string,
    options?: { limit?: number }
): Promise<WebhookDelivery[]> {
    if (isSupabaseConfigured()) {
        // Join through events to filter by merchant
        const { data: events } = await supabase
            .from("webhook_events")
            .select("id")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false })
            .limit(options?.limit || 50);

        if (!events || events.length === 0) return [];

        const eventIds = events.map((e: { id: string }) => e.id);
        const { data } = await supabase
            .from("webhook_deliveries")
            .select("*")
            .in("event_id", eventIds)
            .order("created_at", { ascending: false })
            .limit(options?.limit || 50);

        if (!data) return [];

        return data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            eventId: d.event_id as string,
            webhookId: d.webhook_id as string,
            url: d.url as string,
            status: d.status as "pending" | "success" | "failed",
            httpStatus: d.http_status as number | undefined,
            attempts: (d.attempts as number) || 0,
            maxAttempts: (d.max_attempts as number) || MAX_ATTEMPTS,
            lastAttemptAt: d.last_attempt_at as string | undefined,
            nextRetryAt: d.next_retry_at as string | undefined,
            responseBody: d.response_body as string | undefined,
            errorMessage: d.error_message as string | undefined,
            createdAt: d.created_at as string,
        }));
    } else {
        const merchantEventIds = new Set(
            memoryWebhookEvents
                .filter((e) => e.merchantId === merchantId)
                .map((e) => e.id)
        );
        let deliveries = memoryWebhookDeliveries.filter((d) => merchantEventIds.has(d.eventId));
        deliveries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (options?.limit) deliveries = deliveries.slice(0, options.limit);
        return deliveries;
    }
}

// ---------------------------------------------------------------------------
// For testing: register a webhook config in memory
// ---------------------------------------------------------------------------

export function registerWebhookConfigInMemory(config: WebhookConfig): void {
    memoryWebhookConfigs.set(config.id, config);
}

// These are exposed for test introspection only
export { memoryWebhookEvents, memoryWebhookDeliveries, memoryWebhookConfigs };
