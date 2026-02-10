/**
 * @settlr/sdk — Subscription Client
 *
 * Manage recurring stablecoin payments for your SaaS or AI product.
 *
 * @example
 * ```typescript
 * import { SubscriptionClient } from '@settlr/sdk';
 *
 * const subs = new SubscriptionClient({
 *   apiKey: 'sk_live_xxxxxxxxxxxx',
 *   baseUrl: 'https://settlr.dev',
 * });
 *
 * // Create a plan
 * const plan = await subs.createPlan({
 *   name: 'Pro',
 *   amount: 29.99,
 *   interval: 'monthly',
 * });
 *
 * // Subscribe a customer
 * const sub = await subs.subscribe({
 *   planId: plan.id,
 *   customerWallet: '7xKX...',
 *   merchantWallet: 'DjLF...',
 * });
 *
 * // Cancel at end of period
 * await subs.cancel(sub.id);
 * ```
 */

import type {
    SubscriptionPlan,
    SubscriptionInterval,
    SubscriptionStatus,
    Subscription,
    CreateSubscriptionOptions,
} from "./types";

export interface SubscriptionClientConfig {
    /** Settlr API key */
    apiKey: string;
    /** Base URL of your Settlr instance (default: https://settlr.dev) */
    baseUrl?: string;
    /** Merchant ID (resolved from API key if not provided) */
    merchantId?: string;
    /** Merchant wallet address */
    merchantWallet?: string;
}

export interface CreatePlanOptions {
    /** Plan display name */
    name: string;
    /** Optional description */
    description?: string;
    /** Amount in USDC per interval */
    amount: number;
    /** Billing interval */
    interval: SubscriptionInterval;
    /** Number of intervals between charges (default: 1) */
    intervalCount?: number;
    /** Free trial days (default: 0) */
    trialDays?: number;
    /** Feature list for display */
    features?: string[];
}

export interface UpdatePlanOptions {
    name?: string;
    description?: string;
    amount?: number;
    active?: boolean;
    features?: string[];
}

export interface SubscribeOptions {
    /** Plan ID */
    planId: string;
    /** Customer wallet address */
    customerWallet: string;
    /** Merchant wallet address (uses default if not provided) */
    merchantWallet?: string;
    /** Customer email for notifications */
    customerEmail?: string;
    /** Custom metadata */
    metadata?: Record<string, string>;
}

export interface ListSubscriptionsOptions {
    /** Filter by status */
    status?: SubscriptionStatus;
    /** Filter by customer wallet */
    customerWallet?: string;
    /** Filter by plan */
    planId?: string;
}

export interface SubscriptionPayment {
    id: string;
    amount: number;
    platformFee: number;
    status: "pending" | "completed" | "failed" | "refunded";
    txSignature?: string;
    periodStart: string;
    periodEnd: string;
    attemptCount: number;
    failureReason?: string;
    createdAt: string;
}

export interface SubscriptionDetail extends Subscription {
    plan: SubscriptionPlan;
    payments?: SubscriptionPayment[];
}

export class SubscriptionClient {
    private apiKey: string;
    private baseUrl: string;
    private merchantId?: string;
    private merchantWallet?: string;

    constructor(config: SubscriptionClientConfig) {
        if (!config.apiKey) {
            throw new Error(
                "API key is required. Get one at https://settlr.dev/dashboard"
            );
        }
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || "https://settlr.dev").replace(/\/$/, "");
        this.merchantId = config.merchantId;
        this.merchantWallet = config.merchantWallet;
    }

    private async fetch<T>(
        path: string,
        options: RequestInit = {}
    ): Promise<T> {
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
                `API error: ${res.status}`
            );
        }

        return data as T;
    }

    /**
     * Resolve merchant ID from API key
     */
    private async ensureMerchantId(): Promise<string> {
        if (this.merchantId) return this.merchantId;

        const data = await this.fetch<{
            valid: boolean;
            merchantId: string;
            merchantWallet: string;
        }>("/api/sdk/validate", {
            method: "POST",
            body: JSON.stringify({}),
        });

        this.merchantId = data.merchantId;
        if (data.merchantWallet && !this.merchantWallet) {
            this.merchantWallet = data.merchantWallet;
        }
        return this.merchantId;
    }

    // ═══════════════════════════════════════
    // PLANS
    // ═══════════════════════════════════════

    /**
     * Create a subscription plan
     */
    async createPlan(options: CreatePlanOptions): Promise<SubscriptionPlan> {
        const merchantId = await this.ensureMerchantId();

        const data = await this.fetch<{ plan: SubscriptionPlan }>(
            "/api/subscriptions/plans",
            {
                method: "POST",
                body: JSON.stringify({
                    merchantId,
                    name: options.name,
                    description: options.description,
                    amount: options.amount,
                    interval: options.interval,
                    intervalCount: options.intervalCount || 1,
                    trialDays: options.trialDays || 0,
                    features: options.features || [],
                }),
            }
        );

        return data.plan;
    }

    /**
     * List all plans for the merchant
     */
    async listPlans(): Promise<SubscriptionPlan[]> {
        const merchantId = await this.ensureMerchantId();

        const data = await this.fetch<{ plans: SubscriptionPlan[] }>(
            `/api/subscriptions/plans?merchantId=${merchantId}`
        );

        return data.plans;
    }

    /**
     * Update a plan
     */
    async updatePlan(
        planId: string,
        options: UpdatePlanOptions
    ): Promise<SubscriptionPlan> {
        const data = await this.fetch<{ plan: SubscriptionPlan }>(
            `/api/subscriptions/plans/${planId}`,
            {
                method: "PUT",
                body: JSON.stringify(options),
            }
        );

        return data.plan;
    }

    /**
     * Deactivate a plan (stops new subscriptions)
     */
    async deactivatePlan(planId: string): Promise<void> {
        await this.updatePlan(planId, { active: false });
    }

    // ═══════════════════════════════════════
    // SUBSCRIPTIONS
    // ═══════════════════════════════════════

    /**
     * Subscribe a customer to a plan
     */
    async subscribe(
        options: SubscribeOptions
    ): Promise<{
        subscription: Subscription;
        payment?: { id: string; amount: number; signature: string };
        message: string;
    }> {
        const data = await this.fetch<{
            subscription: Subscription;
            payment?: { id: string; amount: number; signature: string };
            message: string;
        }>("/api/subscriptions", {
            method: "POST",
            body: JSON.stringify({
                action: "subscribe",
                planId: options.planId,
                customerWallet: options.customerWallet,
                merchantWallet:
                    options.merchantWallet || this.merchantWallet,
                customerEmail: options.customerEmail,
                metadata: options.metadata,
            }),
        });

        return data;
    }

    /**
     * List subscriptions
     */
    async listSubscriptions(
        options?: ListSubscriptionsOptions
    ): Promise<Subscription[]> {
        const merchantId = await this.ensureMerchantId();
        const params = new URLSearchParams({ merchantId });

        if (options?.status) params.set("status", options.status);
        if (options?.customerWallet)
            params.set("customer", options.customerWallet);
        if (options?.planId) params.set("planId", options.planId);

        const data = await this.fetch<{ subscriptions: Subscription[] }>(
            `/api/subscriptions?${params.toString()}`
        );

        return data.subscriptions;
    }

    /**
     * Get subscription details including payment history
     */
    async getSubscription(subscriptionId: string): Promise<SubscriptionDetail> {
        const data = await this.fetch<{
            subscription: SubscriptionDetail;
            payments: SubscriptionPayment[];
        }>(`/api/subscriptions/${subscriptionId}`);

        return {
            ...data.subscription,
            payments: data.payments,
        };
    }

    /**
     * Cancel a subscription
     * @param immediately - If true, cancels now. If false (default), cancels at end of billing period.
     */
    async cancel(
        subscriptionId: string,
        immediately = false
    ): Promise<{ success: boolean; message: string; cancelAt?: string }> {
        return this.fetch("/api/subscriptions", {
            method: "POST",
            body: JSON.stringify({
                action: "cancel",
                subscriptionId,
                immediately,
            }),
        });
    }

    /**
     * Pause a subscription (stops billing, preserves subscription)
     */
    async pause(
        subscriptionId: string
    ): Promise<{ success: boolean; message: string }> {
        return this.fetch("/api/subscriptions", {
            method: "POST",
            body: JSON.stringify({
                action: "pause",
                subscriptionId,
            }),
        });
    }

    /**
     * Resume a paused subscription
     */
    async resume(
        subscriptionId: string
    ): Promise<{ success: boolean; message: string; nextCharge?: string }> {
        return this.fetch("/api/subscriptions", {
            method: "POST",
            body: JSON.stringify({
                action: "resume",
                subscriptionId,
            }),
        });
    }

    /**
     * Manually charge a subscription (useful for metered billing)
     */
    async charge(
        subscriptionId: string
    ): Promise<{
        success: boolean;
        payment?: { id: string; amount: number; signature: string };
    }> {
        return this.fetch("/api/subscriptions", {
            method: "POST",
            body: JSON.stringify({
                action: "charge",
                subscriptionId,
            }),
        });
    }
}

/**
 * Factory function to create a SubscriptionClient
 */
export function createSubscriptionClient(
    config: SubscriptionClientConfig
): SubscriptionClient {
    return new SubscriptionClient(config);
}
