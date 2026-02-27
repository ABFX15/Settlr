/**
 * LeafLink API Client
 *
 * Wraps LeafLink's REST API for reading orders and updating payment status.
 * https://developer.leaflink.com
 */

import type {
    LeafLinkOrder,
    LeafLinkOrderStatus,
} from "./types";

const LEAFLINK_API_BASE = "https://www.leaflink.com/api/v2";

export class LeafLinkClient {
    private apiKey: string;
    private companyId: number;

    constructor(opts: { apiKey: string; companyId: number }) {
        this.apiKey = opts.apiKey;
        this.companyId = opts.companyId;
    }

    /* ── helpers ─────────────────────────────────────────── */

    private async request<T>(
        method: string,
        path: string,
        body?: unknown,
    ): Promise<T> {
        const url = `${LEAFLINK_API_BASE}${path}`;
        const headers: Record<string, string> = {
            Authorization: `App ${this.apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        };

        const res = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(
                `LeafLink API error: ${res.status} ${res.statusText} — ${text}`,
            );
        }

        return res.json() as Promise<T>;
    }

    /* ── orders ──────────────────────────────────────────── */

    /**
     * Fetch a single order by ID.
     */
    async getOrder(orderId: number): Promise<LeafLinkOrder> {
        return this.request<LeafLinkOrder>("GET", `/orders-received/${orderId}/`);
    }

    /**
     * List recent orders for this company (paginated).
     */
    async listOrders(params?: {
        status?: LeafLinkOrderStatus;
        page?: number;
        page_size?: number;
    }): Promise<{ count: number; results: LeafLinkOrder[] }> {
        const qs = new URLSearchParams();
        if (params?.status) qs.set("status", params.status);
        if (params?.page) qs.set("page", String(params.page));
        qs.set("page_size", String(params?.page_size ?? 25));

        return this.request("GET", `/orders-received/?${qs.toString()}`);
    }

    /**
     * Add a payment note to an order (e.g. tx hash, Settlr receipt link).
     */
    async addOrderNote(
        orderId: number,
        note: string,
    ): Promise<{ id: number; note: string }> {
        return this.request("POST", `/orders-received/${orderId}/notes/`, {
            note,
        });
    }

    /**
     * Update order metadata with custom fields (payment proof).
     * Uses LeafLink's order "external_id" or custom attributes endpoint
     * to record the Settlr payment details.
     */
    async setExternalPaymentRef(
        orderId: number,
        ref: {
            tx_signature: string;
            settlr_invoice_id: string;
            settled_at: string;
            amount_usdc: number;
        },
    ): Promise<void> {
        // LeafLink supports setting external_id on orders
        await this.request("PATCH", `/orders-received/${orderId}/`, {
            external_id: `settlr:${ref.settlr_invoice_id}`,
        });

        // Also add a human-readable note
        const note = [
            `✅ USDC Payment Settled via Settlr`,
            `Amount: $${ref.amount_usdc.toFixed(2)} USDC`,
            `Tx: https://solscan.io/tx/${ref.tx_signature}`,
            `Invoice: ${ref.settlr_invoice_id}`,
            `Settled: ${ref.settled_at}`,
        ].join("\n");

        await this.addOrderNote(orderId, note);
    }

    /* ── company info ────────────────────────────────────── */

    /**
     * Get the company profile (for verifying the integration).
     */
    async getCompany(): Promise<{
        id: number;
        name: string;
        license_number: string;
        state: string;
    }> {
        return this.request("GET", `/companies/${this.companyId}/`);
    }
}
