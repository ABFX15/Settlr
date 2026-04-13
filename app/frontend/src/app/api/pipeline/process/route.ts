/**
 * POST /api/pipeline/process — Cron-triggered batch processor
 *
 * Reads unprocessed pipeline events, updates aggregation tables,
 * and marks events as processed. Secured by CRON_SECRET header.
 *
 * Vercel cron schedule: every 5 minutes (* /5 * * * *)
 */

import { NextRequest, NextResponse } from "next/server";
import { processEvents } from "@/lib/pipeline";

export async function POST(request: NextRequest) {
    // Verify cron secret to prevent unauthorized invocation
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await processEvents();

        return NextResponse.json({
            ok: true,
            ...result,
        });
    } catch (error) {
        console.error("[Pipeline] Process error:", error);
        return NextResponse.json(
            { error: "Pipeline processing failed", details: (error as Error).message },
            { status: 500 },
        );
    }
}
