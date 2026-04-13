/**
 * GET /api/pipeline/stream — Server-Sent Events (SSE) for real-time dashboard
 *
 * Query params:
 *   merchant — Merchant ID (required)
 *
 * Sends recent events on connect, then polls for new events every 2 seconds.
 * Dashboard listens via EventSource for live payment/invoice/payout updates.
 */

import { NextRequest } from "next/server";
import { getRecentEvents } from "@/lib/pipeline";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const rateLimited = await checkRateLimit(`pipeline-stream:${getClientIp(request)}`);
    if (rateLimited) return rateLimited;

    const merchantId = request.nextUrl.searchParams.get("merchant");
    if (!merchantId) {
        return new Response(JSON.stringify({ error: "Missing 'merchant' query parameter" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const encoder = new TextEncoder();
    let closed = false;

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial batch of recent events
            try {
                const recent = await getRecentEvents(merchantId, 25);
                const initPayload = JSON.stringify({ type: "init", events: recent });
                controller.enqueue(encoder.encode(`data: ${initPayload}\n\n`));
            } catch (err) {
                console.error("[Pipeline SSE] Init error:", err);
            }

            // Track the last event timestamp we sent
            let lastTimestamp = new Date().toISOString();

            // Poll for new events
            const interval = setInterval(async () => {
                if (closed) {
                    clearInterval(interval);
                    return;
                }

                try {
                    const newEvents = await getRecentEvents(merchantId, 10);
                    const fresh = newEvents.filter((e) => e.createdAt > lastTimestamp);

                    if (fresh.length > 0) {
                        lastTimestamp = fresh[0].createdAt; // newest first
                        const payload = JSON.stringify({ type: "events", events: fresh });
                        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                    }

                    // Heartbeat to keep connection alive
                    controller.enqueue(encoder.encode(`: heartbeat\n\n`));
                } catch (err) {
                    console.error("[Pipeline SSE] Poll error:", err);
                }
            }, 2000);

            // Cleanup on disconnect
            request.signal.addEventListener("abort", () => {
                closed = true;
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
