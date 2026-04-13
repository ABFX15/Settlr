/**
 * Data Pipeline — Exporter
 *
 * Generates CSV and JSON exports for merchant data and analytics.
 * Used by the /api/pipeline/export endpoint.
 */

import { getMerchantStats } from "./processor";
import { getEventsByMerchant } from "./events";
import type { ExportRequest, ExportResult, MerchantDailyStats, PipelineEvent } from "./types";

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

export async function generateExport(req: ExportRequest): Promise<ExportResult> {
    const { merchantId, entityType, format, dateFrom, dateTo, limit = 1000 } = req;

    if (entityType === "stats") {
        const stats = await getMerchantStats(merchantId, { dateFrom, dateTo, limit });
        return formatOutput(stats, statsColumns, format, `settlr-stats-${merchantId}`);
    }

    // Export raw pipeline events filtered by entity type
    const events = await getEventsByMerchant(merchantId, {
        limit,
        eventType: entityType ? undefined : undefined,
        dateFrom,
        dateTo,
    });

    // Filter by entity type if specified
    const filtered = entityType
        ? events.filter((e) => e.entityType === entityType)
        : events;

    return formatOutput(filtered, eventColumns, format, `settlr-${entityType || "events"}-${merchantId}`);
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

interface Column<T> {
    header: string;
    accessor: (row: T) => string | number;
}

const statsColumns: Column<MerchantDailyStats>[] = [
    { header: "Date", accessor: (r) => r.date },
    { header: "Payments", accessor: (r) => r.paymentsCount },
    { header: "Payment Volume (USDC)", accessor: (r) => r.paymentsVolume },
    { header: "Invoices Created", accessor: (r) => r.invoicesCreated },
    { header: "Invoices Paid", accessor: (r) => r.invoicesPaid },
    { header: "Invoice Revenue (USDC)", accessor: (r) => r.invoicesPaidVolume },
    { header: "Payouts", accessor: (r) => r.payoutsCount },
    { header: "Payout Volume (USDC)", accessor: (r) => r.payoutsVolume },
    { header: "Fees (USDC)", accessor: (r) => r.feesCollected },
    { header: "Orders Created", accessor: (r) => r.ordersCreated },
    { header: "Orders Paid (USDC)", accessor: (r) => r.ordersPaidVolume },
    { header: "Subscription Revenue (USDC)", accessor: (r) => r.subscriptionRevenue },
    { header: "Active Subscriptions", accessor: (r) => r.activeSubscriptions },
    { header: "New Recipients", accessor: (r) => r.newRecipients },
];

const eventColumns: Column<PipelineEvent>[] = [
    { header: "Event ID", accessor: (r) => r.id },
    { header: "Type", accessor: (r) => r.eventType },
    { header: "Entity", accessor: (r) => r.entityType },
    { header: "Entity ID", accessor: (r) => r.entityId },
    { header: "Amount", accessor: (r) => (r.data.amount as number) || 0 },
    { header: "Status", accessor: (r) => (r.data.status as string) || "" },
    { header: "Timestamp", accessor: (r) => r.createdAt },
];

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function formatOutput<T>(
    rows: T[],
    columns: Column<T>[],
    format: "csv" | "json",
    filenameBase: string,
): ExportResult {
    const today = new Date().toISOString().substring(0, 10);

    if (format === "json") {
        const jsonRows = rows.map((row) => {
            const obj: Record<string, string | number> = {};
            for (const col of columns) {
                obj[col.header] = col.accessor(row);
            }
            return obj;
        });

        return {
            data: JSON.stringify(jsonRows, null, 2),
            format: "json",
            filename: `${filenameBase}-${today}.json`,
            rowCount: rows.length,
        };
    }

    // CSV
    const header = columns.map((c) => escapeCsv(c.header)).join(",");
    const body = rows.map((row) =>
        columns.map((col) => escapeCsv(String(col.accessor(row)))).join(","),
    );

    return {
        data: [header, ...body].join("\n"),
        format: "csv",
        filename: `${filenameBase}-${today}.csv`,
        rowCount: rows.length,
    };
}

function escapeCsv(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
