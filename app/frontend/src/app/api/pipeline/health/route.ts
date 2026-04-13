/**
 * GET /api/pipeline/health — Pipeline health check
 *
 * Returns queue depth, processing lag, and storage mode.
 */

import { NextResponse } from "next/server";
import {
    getEventCount,
    getOldestPendingEvent,
    getLastProcessedAt,
    getTotalProcessedCount,
} from "@/lib/pipeline";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { PipelineHealth } from "@/lib/pipeline";

export async function GET() {
    try {
        const [pendingEvents, oldestPending, processedLast24h] = await Promise.all([
            getEventCount(false),
            getOldestPendingEvent(),
            getProcessedLast24hCount(),
        ]);

        const oldestPendingAge = oldestPending
            ? Math.floor((Date.now() - new Date(oldestPending.createdAt).getTime()) / 1000)
            : null;

        let status: PipelineHealth["status"] = "healthy";
        if (pendingEvents > 1000) status = "degraded";
        if (oldestPendingAge && oldestPendingAge > 3600) status = "degraded";
        if (oldestPendingAge && oldestPendingAge > 86400) status = "down";

        const health: PipelineHealth = {
            status,
            pendingEvents,
            oldestPendingAge,
            lastProcessedAt: getLastProcessedAt(),
            eventsProcessedLast24h: processedLast24h,
            avgProcessingTimeMs: null, // TODO: track in processor
            storage: isSupabaseConfigured() ? "supabase" : "memory",
        };

        return NextResponse.json(health, {
            status: status === "down" ? 503 : 200,
        });
    } catch (error) {
        console.error("[Pipeline] Health check error:", error);
        return NextResponse.json(
            { status: "down", error: (error as Error).message },
            { status: 503 },
        );
    }
}

async function getProcessedLast24hCount(): Promise<number> {
    // Use in-process counter as a proxy
    return getTotalProcessedCount();
}
