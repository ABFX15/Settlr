/**
 * Data Pipeline — Type Definitions
 *
 * Central event bus for Settlr. Every meaningful state change produces a
 * PipelineEvent that feeds analytics aggregation, webhook fan-out, and
 * real-time streaming.
 */

// ---------------------------------------------------------------------------
// Pipeline Event Types
// ---------------------------------------------------------------------------

export type PipelineEventType =
    // Payments
    | "payment.completed"
    | "payment.refunded"
    // Invoices
    | "invoice.created"
    | "invoice.sent"
    | "invoice.viewed"
    | "invoice.paid"
    | "invoice.overdue"
    | "invoice.cancelled"
    // Payouts
    | "payout.created"
    | "payout.claimed"
    | "payout.expired"
    | "payout.failed"
    // Treasury
    | "deposit.confirmed"
    | "withdrawal.completed"
    | "fee.collected"
    // Orders
    | "order.created"
    | "order.accepted"
    | "order.invoiced"
    | "order.paid"
    | "order.cancelled"
    // Subscriptions
    | "subscription.created"
    | "subscription.renewed"
    | "subscription.failed"
    | "subscription.cancelled"
    // Entities
    | "merchant.registered"
    | "recipient.registered"
    // Batches
    | "batch.created"
    | "batch.completed";

export type EntityType =
    | "payment"
    | "invoice"
    | "payout"
    | "order"
    | "subscription"
    | "merchant"
    | "recipient"
    | "batch"
    | "treasury";

export interface PipelineEvent {
    id: string;
    eventType: PipelineEventType;
    entityType: EntityType;
    entityId: string;
    merchantId: string;
    data: Record<string, unknown>;
    processed: boolean;
    createdAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Aggregated Stats
// ---------------------------------------------------------------------------

export interface MerchantDailyStats {
    id: string;
    merchantId: string;
    date: string; // YYYY-MM-DD
    paymentsCount: number;
    paymentsVolume: number;
    invoicesCreated: number;
    invoicesPaid: number;
    invoicesPaidVolume: number;
    payoutsCount: number;
    payoutsVolume: number;
    feesCollected: number;
    ordersCreated: number;
    ordersPaidVolume: number;
    activeSubscriptions: number;
    subscriptionRevenue: number;
    newRecipients: number;
    createdAt: string;
    updatedAt: string;
}

export interface PlatformDailyStats {
    id: string;
    date: string; // YYYY-MM-DD
    totalMerchants: number;
    activeMerchants: number; // merchants with >= 1 event today
    paymentsCount: number;
    paymentsVolume: number;
    invoicesCreated: number;
    invoicesPaid: number;
    payoutsCount: number;
    payoutsVolume: number;
    feesCollected: number;
    newMerchants: number;
    newRecipients: number;
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// Pipeline Health
// ---------------------------------------------------------------------------

export interface PipelineHealth {
    status: "healthy" | "degraded" | "down";
    pendingEvents: number;
    oldestPendingAge: number | null; // seconds
    lastProcessedAt: string | null;
    eventsProcessedLast24h: number;
    avgProcessingTimeMs: number | null;
    storage: "supabase" | "memory";
}

// ---------------------------------------------------------------------------
// Export Formats
// ---------------------------------------------------------------------------

export type ExportFormat = "csv" | "json";

export interface ExportRequest {
    merchantId: string;
    entityType: EntityType | "stats";
    format: ExportFormat;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
}

export interface ExportResult {
    data: string; // CSV string or JSON string
    format: ExportFormat;
    filename: string;
    rowCount: number;
}
