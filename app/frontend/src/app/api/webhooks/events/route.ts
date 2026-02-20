/**
 * GET /api/webhooks/events — List webhook events + deliveries for a merchant
 *
 * Query params:
 *   merchantId  (required) — merchant to query
 *   type        (optional) — filter by event type (e.g. payout.created)
 *   limit       (optional, default 20)
 *   offset      (optional, default 0)
 *
 * Each event includes its delivery attempts for debugging.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/db";
import {
    getWebhookEvents,
    getWebhookDeliveries,
    getRecentDeliveries,
    type WebhookEventType,
} from "@/lib/webhooks";

export async function GET(request: NextRequest) {
    try {
        // Authenticate
        const apiKey =
            request.headers.get("x-api-key") ||
            request.headers.get("authorization")?.replace("Bearer ", "");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API key" }, { status: 401 });
        }

        const validation = await validateApiKey(apiKey);
        if (!validation.valid || !validation.merchantId) {
            return NextResponse.json(
                { error: validation.error || "Invalid API key" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") as WebhookEventType | null;
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
        const offset = parseInt(searchParams.get("offset") || "0");
        const deliveryView = searchParams.get("view") === "deliveries";

        if (deliveryView) {
            // Return recent delivery attempts (flat list)
            const deliveries = await getRecentDeliveries(validation.merchantId, { limit });
            return NextResponse.json({
                deliveries,
                count: deliveries.length,
                limit,
            });
        }

        // Return events with inline deliveries
        const events = await getWebhookEvents(validation.merchantId, {
            type: type || undefined,
            limit,
            offset,
        });

        // Fetch deliveries for each event
        const eventsWithDeliveries = await Promise.all(
            events.map(async (event) => {
                const deliveries = await getWebhookDeliveries(event.id, { limit: 5 });
                return {
                    ...event,
                    deliveries: deliveries.map((d) => ({
                        id: d.id,
                        url: d.url,
                        status: d.status,
                        httpStatus: d.httpStatus,
                        attempts: d.attempts,
                        lastAttemptAt: d.lastAttemptAt,
                        errorMessage: d.errorMessage,
                    })),
                };
            })
        );

        return NextResponse.json({
            events: eventsWithDeliveries,
            count: eventsWithDeliveries.length,
            limit,
            offset,
        });
    } catch (error) {
        console.error("[webhooks/events] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch webhook events" },
            { status: 500 }
        );
    }
}
