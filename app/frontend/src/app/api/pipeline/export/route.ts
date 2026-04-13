/**
 * GET /api/pipeline/export — Data export (CSV/JSON)
 *
 * Query params:
 *   merchant   — Merchant ID (required)
 *   type       — "stats" | "payment" | "invoice" | "payout" | "order" (default: "stats")
 *   format     — "csv" | "json" (default: "csv")
 *   dateFrom   — Start date (YYYY-MM-DD)
 *   dateTo     — End date (YYYY-MM-DD)
 *   limit      — Max rows (default: 1000, max: 10000)
 */

import { NextRequest, NextResponse } from "next/server";
import { generateExport } from "@/lib/pipeline";
import type { EntityType, ExportFormat } from "@/lib/pipeline";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const VALID_TYPES = new Set(["stats", "payment", "invoice", "payout", "order", "subscription", "merchant", "recipient", "batch", "treasury"]);
const VALID_FORMATS = new Set(["csv", "json"]);

export async function GET(request: NextRequest) {
    const rateLimited = await checkRateLimit(`pipeline-export:${getClientIp(request)}`);
    if (rateLimited) return rateLimited;

    const params = request.nextUrl.searchParams;
    const merchantId = params.get("merchant");
    const type = params.get("type") || "stats";
    const format = (params.get("format") || "csv") as ExportFormat;
    const dateFrom = params.get("dateFrom") || undefined;
    const dateTo = params.get("dateTo") || undefined;
    const limit = Math.min(parseInt(params.get("limit") || "1000", 10), 10_000);

    if (!merchantId) {
        return NextResponse.json({ error: "Missing 'merchant' query parameter" }, { status: 400 });
    }

    if (!VALID_TYPES.has(type)) {
        return NextResponse.json({ error: `Invalid type. Must be one of: ${[...VALID_TYPES].join(", ")}` }, { status: 400 });
    }

    if (!VALID_FORMATS.has(format)) {
        return NextResponse.json({ error: "Invalid format. Must be 'csv' or 'json'" }, { status: 400 });
    }

    try {
        const result = await generateExport({
            merchantId,
            entityType: type as EntityType | "stats",
            format,
            dateFrom,
            dateTo,
            limit,
        });

        const contentType = format === "csv" ? "text/csv" : "application/json";

        return new NextResponse(result.data, {
            status: 200,
            headers: {
                "Content-Type": `${contentType}; charset=utf-8`,
                "Content-Disposition": `attachment; filename="${result.filename}"`,
                "X-Row-Count": String(result.rowCount),
            },
        });
    } catch (error) {
        console.error("[Pipeline] Export error:", error);
        return NextResponse.json(
            { error: "Export failed", details: (error as Error).message },
            { status: 500 },
        );
    }
}
