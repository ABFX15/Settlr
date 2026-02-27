/**
 * LeafLink API types
 *
 * Based on LeafLink's B2B cannabis wholesale marketplace API.
 * https://developer.leaflink.com
 */

/* ── LeafLink order statuses ─────────────────────────── */
export type LeafLinkOrderStatus =
    | "submitted"
    | "accepted"
    | "in_transit"
    | "delivered"
    | "completed"
    | "cancelled"
    | "rejected";

/* ── Line item on a purchase order ───────────────────── */
export interface LeafLinkLineItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number; // dollars
    total: number;
    sku?: string;
    metrc_tag?: string;
}

/* ── Purchase order from LeafLink webhook ────────────── */
export interface LeafLinkOrder {
    id: number;
    number: string; // e.g. "PO-12345"
    status: LeafLinkOrderStatus;
    seller: {
        id: number;
        company_name: string;
        email: string;
        license_number?: string;
    };
    buyer: {
        id: number;
        company_name: string;
        email: string;
        license_number?: string;
    };
    line_items: LeafLinkLineItem[];
    subtotal: number;
    tax: number;
    total: number;
    currency: string; // "USD"
    notes?: string;
    delivery_date?: string; // ISO 8601
    created_at: string; // ISO 8601
    updated_at: string;
}

/* ── LeafLink webhook envelope ───────────────────────── */
export type LeafLinkWebhookEvent =
    | "order.created"
    | "order.accepted"
    | "order.shipped"
    | "order.delivered"
    | "order.cancelled";

export interface LeafLinkWebhookPayload {
    event: LeafLinkWebhookEvent;
    timestamp: string;
    data: {
        order: LeafLinkOrder;
    };
}

/* ── Internal sync record ────────────────────────────── */
export type SyncStatus =
    | "pending"       // Invoice created on Settlr, waiting for payment
    | "link_sent"     // Payment link delivered to buyer
    | "paid"          // USDC settled on-chain
    | "synced"        // LeafLink order updated with payment proof
    | "failed"        // Something went wrong
    | "cancelled";    // Order cancelled on LeafLink

export interface LeafLinkSync {
    id: string;
    merchant_id: string;
    leaflink_order_id: number;
    leaflink_order_number: string;
    seller_email: string;
    buyer_email: string;
    buyer_company: string;
    amount: number;
    settlr_invoice_id?: string;
    settlr_payment_link?: string;
    tx_signature?: string;
    status: SyncStatus;
    metadata: Record<string, string>;
    error?: string;
    created_at: string;
    updated_at: string;
}

/* ── Integration config per merchant ─────────────────── */
export interface LeafLinkIntegrationConfig {
    merchant_id: string;
    leaflink_api_key: string;
    leaflink_company_id: number;
    auto_create_invoice: boolean;   // Create Settlr invoice on order.created
    auto_send_link: boolean;        // Email payment link to buyer automatically
    webhook_secret?: string;        // HMAC secret for verifying LL webhooks
    metrc_sync: boolean;            // Tag invoices with METRC manifest IDs
    created_at: string;
    updated_at: string;
}
