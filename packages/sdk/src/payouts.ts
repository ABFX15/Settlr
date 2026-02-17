/**
 * @settlr/sdk — Payout Client
 *
 * Send USDC to anyone in the world with just their email address.
 *
 * @example
 * ```typescript
 * import { PayoutClient } from '@settlr/sdk';
 *
 * const payouts = new PayoutClient({
 *   apiKey: 'sk_live_xxxxxxxxxxxx',
 * });
 *
 * // Send a payout
 * const payout = await payouts.create({
 *   email: 'creator@example.com',
 *   amount: 150.00,
 *   memo: 'March earnings',
 * });
 *
 * // Check status
 * const status = await payouts.get(payout.id);
 * console.log(status.status); // "sent" | "claimed"
 *
 * // Send batch payouts
 * const batch = await payouts.createBatch([
 *   { email: 'alice@example.com', amount: 250.00, memo: 'March' },
 *   { email: 'bob@example.com', amount: 180.00, memo: 'March' },
 * ]);
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PayoutStatus = "pending" | "funded" | "sent" | "claimed" | "expired" | "failed";

export interface CreatePayoutOptions {
    /** Recipient email address */
    email: string;
    /** Amount in USDC */
    amount: number;
    /** Currency (default: "USDC") */
    currency?: string;
    /** Description shown in the claim email */
    memo?: string;
    /** Custom key-value metadata for your records */
    metadata?: Record<string, string>;
}

export interface PayoutRecord {
    /** Unique payout ID (e.g. "po_abc123") */
    id: string;
    /** Recipient email */
    email: string;
    /** Amount in USDC */
    amount: number;
    /** Currency */
    currency: string;
    /** Memo / description */
    memo?: string;
    /** Custom metadata */
    metadata?: Record<string, string>;
    /** Current status */
    status: PayoutStatus;
    /** URL the recipient uses to claim the payout */
    claimUrl: string;
    /** Recipient wallet address (set after claim) */
    recipientWallet?: string;
    /** On-chain transaction signature (set after claim) */
    txSignature?: string;
    /** Batch ID if part of a batch */
    batchId?: string;
    /** ISO timestamp */
    createdAt: string;
    /** ISO timestamp — when funds were escrowed */
    fundedAt?: string;
    /** ISO timestamp — when recipient claimed */
    claimedAt?: string;
    /** ISO timestamp — when payout expires */
    expiresAt: string;
}

export interface PayoutBatchResult {
    /** Batch ID */
    id: string;
    /** Batch status */
    status: string;
    /** Total USDC amount */
    total: number;
    /** Number of payouts */
    count: number;
    /** Individual payout records */
    payouts: Array<{
        id: string;
        email: string;
        amount: number;
        status: PayoutStatus;
        claimUrl: string;
    }>;
    /** ISO timestamp */
    createdAt: string;
}

export interface ListPayoutsOptions {
    /** Filter by status */
    status?: PayoutStatus;
    /** Max results (default 20, max 100) */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}

export interface ListPayoutsResult {
    data: PayoutRecord[];
    count: number;
    limit: number;
    offset: number;
}

export interface PayoutClientConfig {
    /** Settlr API key */
    apiKey: string;
    /** Base URL of your Settlr instance (default: https://settlr.dev) */
    baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class PayoutClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(config: PayoutClientConfig) {
        if (!config.apiKey) {
            throw new Error(
                "API key is required. Get one at https://settlr.dev/dashboard"
            );
        }
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || "https://settlr.dev").replace(/\/$/, "");
    }

    private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": this.apiKey,
                ...options.headers,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(
                (data as Record<string, string>).error ||
                `Payout API error: ${res.status}`
            );
        }

        return data as T;
    }

    // -----------------------------------------------------------------------
    // Create a single payout
    // -----------------------------------------------------------------------

    /**
     * Send a payout to a recipient by email.
     * They'll receive an email with a claim link — no wallet or bank details needed.
     *
     * @example
     * ```typescript
     * const payout = await payouts.create({
     *   email: 'alice@example.com',
     *   amount: 250.00,
     *   memo: 'March data labeling — 500 tasks',
     * });
     * console.log(payout.id);        // "po_abc123"
     * console.log(payout.status);    // "sent"
     * console.log(payout.claimUrl);  // "https://settlr.dev/claim/..."
     * ```
     */
    async create(options: CreatePayoutOptions): Promise<PayoutRecord> {
        if (!options.email || !options.email.includes("@")) {
            throw new Error("Valid email address is required");
        }
        if (!options.amount || options.amount <= 0) {
            throw new Error("Amount must be a positive number");
        }

        return this.fetch<PayoutRecord>("/api/payouts", {
            method: "POST",
            body: JSON.stringify({
                email: options.email,
                amount: options.amount,
                currency: options.currency || "USDC",
                memo: options.memo,
                metadata: options.metadata,
            }),
        });
    }

    // -----------------------------------------------------------------------
    // Create batch payouts
    // -----------------------------------------------------------------------

    /**
     * Send multiple payouts at once. Each recipient gets their own email.
     *
     * @example
     * ```typescript
     * const batch = await payouts.createBatch([
     *   { email: 'alice@example.com', amount: 250.00, memo: 'March' },
     *   { email: 'bob@example.com',   amount: 180.00, memo: 'March' },
     * ]);
     * console.log(batch.id);     // "batch_xyz"
     * console.log(batch.total);  // 430.00
     * ```
     */
    async createBatch(
        payoutsList: Array<{
            email: string;
            amount: number;
            memo?: string;
            metadata?: Record<string, string>;
        }>
    ): Promise<PayoutBatchResult> {
        if (!Array.isArray(payoutsList) || payoutsList.length === 0) {
            throw new Error("Payouts list must be a non-empty array");
        }

        return this.fetch<PayoutBatchResult>("/api/payouts/batch", {
            method: "POST",
            body: JSON.stringify({ payouts: payoutsList }),
        });
    }

    // -----------------------------------------------------------------------
    // Get a single payout
    // -----------------------------------------------------------------------

    /**
     * Get a payout by ID.
     *
     * @example
     * ```typescript
     * const payout = await payouts.get('po_abc123');
     * console.log(payout.status);     // "claimed"
     * console.log(payout.claimedAt);  // "2024-03-15T14:30:00Z"
     * ```
     */
    async get(id: string): Promise<PayoutRecord> {
        if (!id) throw new Error("Payout ID is required");
        return this.fetch<PayoutRecord>(`/api/payouts/${encodeURIComponent(id)}`);
    }

    // -----------------------------------------------------------------------
    // List payouts
    // -----------------------------------------------------------------------

    /**
     * List payouts for the authenticated merchant.
     *
     * @example
     * ```typescript
     * const result = await payouts.list({ status: 'claimed', limit: 50 });
     * result.data.forEach(p => console.log(p.email, p.amount, p.status));
     * ```
     */
    async list(options?: ListPayoutsOptions): Promise<ListPayoutsResult> {
        const params = new URLSearchParams();
        if (options?.status) params.set("status", options.status);
        if (options?.limit) params.set("limit", options.limit.toString());
        if (options?.offset) params.set("offset", options.offset.toString());

        const qs = params.toString();
        return this.fetch<ListPayoutsResult>(`/api/payouts${qs ? `?${qs}` : ""}`);
    }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a standalone PayoutClient instance.
 *
 * @example
 * ```typescript
 * import { createPayoutClient } from '@settlr/sdk';
 *
 * const payouts = createPayoutClient({ apiKey: 'sk_live_xxx' });
 * const payout = await payouts.create({ email: 'alice@test.com', amount: 50 });
 * ```
 */
export function createPayoutClient(config: PayoutClientConfig): PayoutClient {
    return new PayoutClient(config);
}
