/**
 * Database Service Layer
 * 
 * Provides a unified interface for database operations.
 * Falls back to in-memory storage if Supabase is not configured.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

// Types
export interface Merchant {
    id: string;
    name: string;
    websiteUrl?: string | null;
    walletAddress: string;
    webhookUrl?: string | null;
    webhookSecret?: string | null;
    kycEnabled?: boolean;
    kycLevel?: "basic-kyc-level" | "gaming-kyc-level" | "enhanced-kyc-level";
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerKYC {
    id: string;
    externalUserId: string; // wallet address or email
    merchantId?: string; // null = global verification
    sumsubApplicantId?: string;
    status: "not_started" | "pending" | "verified" | "rejected";
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CheckoutSession {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantWallet: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
    webhookUrl?: string;
    status: "pending" | "completed" | "expired" | "cancelled";
    paymentSignature?: string;
    customerWallet?: string;
    createdAt: number;
    expiresAt: number;
    completedAt?: number;
    // Privacy fields (Inco Lightning FHE encryption)
    private?: boolean;              // Is this a private payment?
    encryptedAmount?: string;       // FHE-encrypted amount (base64)
    encryptedHandle?: string;       // Inco handle for decryption (u128 as string)
    privateReceiptPda?: string;     // PDA of private receipt on-chain
}

export interface Payment {
    id: string;
    sessionId: string;
    merchantId: string;
    merchantName: string;
    merchantWallet: string;
    customerWallet: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
    txSignature: string;
    explorerUrl: string;
    createdAt: number;
    completedAt: number;
    status: "completed" | "refunded" | "partially_refunded";
    refundedAmount?: number;
    refundSignature?: string;
}

export interface ApiKey {
    id: string;
    merchantId: string;
    key: string;  // hashed
    keyPrefix: string;  // first 8 chars for display
    name: string;
    tier: "free" | "pro" | "enterprise";
    rateLimit: number;  // requests per minute
    requestCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
    expiresAt?: Date;
    active: boolean;
}

// Subscription types
export type SubscriptionInterval = "daily" | "weekly" | "monthly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "past_due" | "expired";

export interface SubscriptionPlan {
    id: string;
    merchantId: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    interval: SubscriptionInterval;
    intervalCount: number; // e.g., 1 for monthly, 3 for quarterly
    trialDays?: number;
    features?: string[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Subscription {
    id: string;
    planId: string;
    merchantId: string;
    customerWallet: string;
    customerEmail?: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
    trialEnd?: Date;
    lastPaymentAt?: Date;
    lastPaymentId?: string;
    nextPaymentAt?: Date;
    failedPaymentCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// Payout types
export type PayoutStatus = "pending" | "funded" | "sent" | "claimed" | "expired" | "failed";

export interface Payout {
    id: string;
    merchantId: string;
    merchantWallet: string;
    email: string;
    amount: number;
    currency: string;
    memo?: string;
    metadata?: Record<string, string>;
    status: PayoutStatus;
    claimToken: string;
    claimUrl: string;
    recipientWallet?: string;
    txSignature?: string;
    batchId?: string;
    createdAt: Date;
    fundedAt?: Date;
    claimedAt?: Date;
    expiredAt?: Date;
    expiresAt: Date;
}

export interface PayoutBatch {
    id: string;
    merchantId: string;
    totalAmount: number;
    count: number;
    status: "processing" | "completed" | "partial" | "failed";
    createdAt: Date;
    completedAt?: Date;
}

// ---------------------------------------------------------------------------
// Recipient Network types
// ---------------------------------------------------------------------------

export interface Recipient {
    id: string;
    email: string;
    walletAddress: string;
    displayName?: string;
    authToken?: string;
    authTokenExpiresAt?: Date;
    notificationsEnabled: boolean;
    autoWithdraw: boolean;
    totalReceived: number;
    totalPayouts: number;
    createdAt: Date;
    updatedAt: Date;
    lastPayoutAt?: Date;
}

export interface RecipientBalance {
    id: string;
    recipientId: string;
    currency: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

export type BalanceTransactionType = "credit" | "debit" | "withdrawal";

export interface BalanceTransaction {
    id: string;
    recipientId: string;
    type: BalanceTransactionType;
    amount: number;
    currency: string;
    payoutId?: string;
    txSignature?: string;
    description?: string;
    createdAt: Date;
}

// ---------------------------------------------------------------------------
// Merchant Treasury types
// ---------------------------------------------------------------------------

export interface MerchantBalance {
    id: string;
    merchantId: string;
    currency: string;
    available: number;   // Funds ready to be used for payouts
    pending: number;     // Deposits detected but not yet confirmed
    reserved: number;    // Funds reserved for in-flight payouts
    totalDeposited: number;
    totalWithdrawn: number;
    totalPayouts: number;
    totalFees: number;
    depositAddress?: string; // USDC deposit address for this merchant
    createdAt: Date;
    updatedAt: Date;
}

export type TreasuryTransactionType =
    | "deposit"          // USDC deposited to fund payouts
    | "payout_reserved"  // Funds reserved when payout is created
    | "payout_released"  // Reserved funds released (payout completed)
    | "payout_refund"    // Reserved funds returned (payout expired/failed)
    | "fee_deducted"     // Platform fee deducted
    | "withdrawal";      // Merchant withdrew excess funds

export interface TreasuryTransaction {
    id: string;
    merchantId: string;
    type: TreasuryTransactionType;
    amount: number;
    currency: string;
    payoutId?: string;
    txSignature?: string;
    description?: string;
    balanceAfter: number;
    createdAt: Date;
}

// In-memory fallback stores
const memoryMerchants = new Map<string, Merchant>();
const memorySessions = new Map<string, CheckoutSession>();
const memoryPayments = new Map<string, Payment>();
const memoryApiKeys = new Map<string, ApiKey>();
const memorySubscriptionPlans = new Map<string, SubscriptionPlan>();
const memorySubscriptions = new Map<string, Subscription>();
const memoryPayouts = new Map<string, Payout>();
const memoryPayoutBatches = new Map<string, PayoutBatch>();
const memoryRecipients = new Map<string, Recipient>(); // keyed by email
const memoryBalances = new Map<string, RecipientBalance>(); // keyed by recipientId:currency
const memoryBalanceTxs: BalanceTransaction[] = [];
const memoryMerchantBalances = new Map<string, MerchantBalance>(); // keyed by merchantId:currency
const memoryTreasuryTxs: TreasuryTransaction[] = [];
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();

// ID generators
function generateSessionId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "cs_";
    for (let i = 0; i < 24; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generatePaymentId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "pay_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

export function generateReceiptId(paymentId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `RCP-${year}${month}-${paymentId.replace("pay_", "").toUpperCase().slice(0, 8)}`;
}

// ============================================
// CHECKOUT SESSIONS
// ============================================

export async function createCheckoutSession(
    data: Omit<CheckoutSession, "id" | "createdAt" | "status">
): Promise<CheckoutSession> {
    const session: CheckoutSession = {
        ...data,
        id: generateSessionId(),
        status: "pending",
        createdAt: Date.now(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("checkout_sessions").insert({
            id: session.id,
            merchant_id: session.merchantId,
            amount: session.amount,
            currency: session.currency,
            description: session.description,
            metadata: session.metadata,
            success_url: session.successUrl,
            cancel_url: session.cancelUrl,
            status: session.status,
            expires_at: new Date(session.expiresAt).toISOString(),
            is_private: session.private || false,
            encrypted_amount: session.encryptedAmount || null,
            encrypted_handle: session.encryptedHandle || null,
        });

        if (error) {
            console.error("Supabase error creating session:", error);
            throw new Error("Failed to create checkout session");
        }
    } else {
        memorySessions.set(session.id, session);
    }

    return session;
}

export async function getCheckoutSession(id: string): Promise<CheckoutSession | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("checkout_sessions")
            .select(`
        *,
        merchants (
          name,
          wallet_address,
          webhook_url
        )
      `)
            .eq("id", id)
            .single();

        if (error || !data) {
            return null;
        }

        const merchant = data.merchants as any;
        return {
            id: data.id,
            merchantId: data.merchant_id,
            merchantName: merchant?.name || "",
            merchantWallet: merchant?.wallet_address || "",
            amount: data.amount,
            currency: data.currency,
            description: data.description || undefined,
            metadata: data.metadata as Record<string, string> | undefined,
            successUrl: data.success_url,
            cancelUrl: data.cancel_url,
            webhookUrl: merchant?.webhook_url || undefined,
            status: data.status as CheckoutSession["status"],
            createdAt: new Date(data.created_at).getTime(),
            expiresAt: new Date(data.expires_at).getTime(),
            // Privacy fields
            private: data.is_private || false,
            encryptedAmount: data.encrypted_amount || undefined,
            encryptedHandle: data.encrypted_handle || undefined,
            privateReceiptPda: data.private_receipt_pda || undefined,
        };
    } else {
        return memorySessions.get(id) || null;
    }
}

export async function updateCheckoutSession(
    id: string,
    updates: Partial<CheckoutSession>
): Promise<CheckoutSession | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("checkout_sessions")
            .update({
                status: updates.status,
            })
            .eq("id", id)
            .select()
            .single();

        if (error || !data) {
            return null;
        }

        return getCheckoutSession(id);
    } else {
        const session = memorySessions.get(id);
        if (!session) return null;

        const updated = { ...session, ...updates };
        memorySessions.set(id, updated);
        return updated;
    }
}

// ============================================
// PAYMENTS
// ============================================

export async function createPayment(
    data: Omit<Payment, "id">
): Promise<Payment> {
    const payment: Payment = {
        ...data,
        id: generatePaymentId(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("payments").insert({
            id: payment.id,
            session_id: payment.sessionId,
            merchant_id: payment.merchantId,
            customer_wallet: payment.customerWallet,
            amount: payment.amount,
            currency: payment.currency,
            description: payment.description,
            metadata: payment.metadata,
            tx_signature: payment.txSignature,
            status: payment.status,
            completed_at: new Date(payment.completedAt).toISOString(),
        });

        if (error) {
            console.error("Supabase error creating payment:", error);
            throw new Error("Failed to create payment");
        }
    } else {
        memoryPayments.set(payment.id, payment);
    }

    return payment;
}

export async function getPayment(id: string): Promise<Payment | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .eq("id", id)
            .single();

        if (error || !data) {
            return null;
        }

        const merchant = data.merchants as any;
        return {
            id: data.id,
            sessionId: data.session_id,
            merchantId: data.merchant_id,
            merchantName: merchant?.name || "",
            merchantWallet: merchant?.wallet_address || "",
            customerWallet: data.customer_wallet,
            amount: data.amount,
            currency: data.currency,
            description: data.description || undefined,
            metadata: data.metadata as Record<string, string> | undefined,
            txSignature: data.tx_signature,
            explorerUrl: `https://explorer.solana.com/tx/${data.tx_signature}?cluster=devnet`,
            createdAt: new Date(data.created_at).getTime(),
            completedAt: new Date(data.completed_at).getTime(),
            status: data.status as Payment["status"],
            refundedAmount: data.refunded_amount || undefined,
            refundSignature: data.refund_signature || undefined,
        };
    } else {
        return memoryPayments.get(id) || null;
    }
}

export async function getPaymentBySessionId(sessionId: string): Promise<Payment | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .eq("session_id", sessionId)
            .single();

        if (error || !data) {
            return null;
        }

        const merchant = data.merchants as any;
        return {
            id: data.id,
            sessionId: data.session_id,
            merchantId: data.merchant_id,
            merchantName: merchant?.name || "",
            merchantWallet: merchant?.wallet_address || "",
            customerWallet: data.customer_wallet,
            amount: data.amount,
            currency: data.currency,
            description: data.description || undefined,
            metadata: data.metadata as Record<string, string> | undefined,
            txSignature: data.tx_signature,
            explorerUrl: `https://explorer.solana.com/tx/${data.tx_signature}?cluster=devnet`,
            createdAt: new Date(data.created_at).getTime(),
            completedAt: new Date(data.completed_at).getTime(),
            status: data.status as Payment["status"],
            refundedAmount: data.refunded_amount || undefined,
            refundSignature: data.refund_signature || undefined,
        };
    } else {
        for (const payment of memoryPayments.values()) {
            if (payment.sessionId === sessionId) {
                return payment;
            }
        }
        return null;
    }
}

export async function getPaymentsByMerchant(merchantId: string): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .eq("merchant_id", merchantId)
            .order("completed_at", { ascending: false });

        if (error || !data) {
            return [];
        }

        return data.map((row: any) => {
            const merchant = row.merchants as any;
            return {
                id: row.id,
                sessionId: row.session_id,
                merchantId: row.merchant_id,
                merchantName: merchant?.name || "",
                merchantWallet: merchant?.wallet_address || "",
                customerWallet: row.customer_wallet,
                amount: row.amount,
                currency: row.currency,
                description: row.description || undefined,
                metadata: row.metadata as Record<string, string> | undefined,
                txSignature: row.tx_signature,
                explorerUrl: `https://explorer.solana.com/tx/${row.tx_signature}?cluster=devnet`,
                createdAt: new Date(row.created_at).getTime(),
                completedAt: new Date(row.completed_at).getTime(),
                status: row.status as Payment["status"],
                refundedAmount: row.refunded_amount || undefined,
                refundSignature: row.refund_signature || undefined,
            };
        });
    } else {
        const payments: Payment[] = [];
        for (const payment of memoryPayments.values()) {
            if (payment.merchantId === merchantId) {
                payments.push(payment);
            }
        }
        return payments.sort((a, b) => b.completedAt - a.completedAt);
    }
}

export async function getAllPayments(): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        merchants (
          name,
          wallet_address
        )
      `)
            .order("completed_at", { ascending: false })
            .limit(100);

        if (error || !data) {
            return [];
        }

        return data.map((row: any) => {
            const merchant = row.merchants as any;
            return {
                id: row.id,
                sessionId: row.session_id,
                merchantId: row.merchant_id,
                merchantName: merchant?.name || "",
                merchantWallet: merchant?.wallet_address || "",
                customerWallet: row.customer_wallet,
                amount: row.amount,
                currency: row.currency,
                description: row.description || undefined,
                metadata: row.metadata as Record<string, string> | undefined,
                txSignature: row.tx_signature,
                explorerUrl: `https://explorer.solana.com/tx/${row.tx_signature}?cluster=devnet`,
                createdAt: new Date(row.created_at).getTime(),
                completedAt: new Date(row.completed_at).getTime(),
                status: row.status as Payment["status"],
                refundedAmount: row.refunded_amount || undefined,
                refundSignature: row.refund_signature || undefined,
            };
        });
    } else {
        return Array.from(memoryPayments.values()).sort(
            (a, b) => b.completedAt - a.completedAt
        );
    }
}

export async function getPaymentsByMerchantWallet(walletAddress: string): Promise<Payment[]> {
    if (isSupabaseConfigured()) {
        // First get the merchant by wallet address
        const { data: merchant } = await supabase
            .from("merchants")
            .select("id")
            .eq("wallet_address", walletAddress)
            .single();

        if (!merchant) {
            return [];
        }

        const { data, error } = await supabase
            .from("payments")
            .select(`
                *,
                merchants (
                    name,
                    wallet_address
                )
            `)
            .eq("merchant_id", merchant.id)
            .order("completed_at", { ascending: false })
            .limit(100);

        if (error || !data) {
            return [];
        }

        return data.map((row: any) => {
            const merchantData = row.merchants as any;
            return {
                id: row.id,
                sessionId: row.session_id,
                merchantId: row.merchant_id,
                merchantName: merchantData?.name || "",
                merchantWallet: merchantData?.wallet_address || "",
                customerWallet: row.customer_wallet,
                amount: row.amount,
                currency: row.currency,
                description: row.description || undefined,
                metadata: row.metadata as Record<string, string> | undefined,
                txSignature: row.tx_signature,
                explorerUrl: `https://explorer.solana.com/tx/${row.tx_signature}?cluster=devnet`,
                createdAt: new Date(row.created_at).getTime(),
                completedAt: new Date(row.completed_at).getTime(),
                status: row.status as Payment["status"],
                refundedAmount: row.refunded_amount || undefined,
                refundSignature: row.refund_signature || undefined,
            };
        });
    } else {
        return Array.from(memoryPayments.values())
            .filter((p) => p.merchantWallet === walletAddress)
            .sort((a, b) => b.completedAt - a.completedAt);
    }
}

// ============================================
// MERCHANTS
// ============================================

export async function getMerchant(id: string): Promise<Merchant | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchants")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            walletAddress: data.wallet_address,
            webhookUrl: data.webhook_url,
            webhookSecret: data.webhook_secret,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    } else {
        return memoryMerchants.get(id) || null;
    }
}

export async function getMerchantByWallet(walletAddress: string): Promise<Merchant | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchants")
            .select("*")
            .eq("wallet_address", walletAddress)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            walletAddress: data.wallet_address,
            webhookUrl: data.webhook_url,
            webhookSecret: data.webhook_secret,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    } else {
        for (const merchant of memoryMerchants.values()) {
            if (merchant.walletAddress === walletAddress) {
                return merchant;
            }
        }
        return null;
    }
}

/**
 * Look up a merchant by wallet address, creating one if it doesn't exist.
 * Used by dashboard routes that authenticate via wallet pubkey.
 */
export async function getOrCreateMerchantByWallet(walletAddress: string): Promise<Merchant> {
    const existing = await getMerchantByWallet(walletAddress);
    if (existing) return existing;

    // Auto-create a merchant record for this wallet
    try {
        return await createMerchant({
            name: `Merchant ${walletAddress.slice(0, 8)}`,
            walletAddress,
            webhookUrl: null,
        });
    } catch {
        // Race condition: another request already created this merchant
        const retry = await getMerchantByWallet(walletAddress);
        if (retry) return retry;
        throw new Error("Failed to get or create merchant for wallet");
    }
}

export async function createMerchant(
    data: Pick<Merchant, "name" | "walletAddress" | "webhookUrl"> & { websiteUrl?: string | null }
): Promise<Merchant> {
    if (isSupabaseConfigured()) {
        const { data: inserted, error } = await supabase
            .from("merchants")
            .insert({
                name: data.name,
                website_url: data.websiteUrl,
                wallet_address: data.walletAddress,
                webhook_url: data.webhookUrl,
            })
            .select()
            .single();

        if (error || !inserted) {
            console.error("Supabase error creating merchant:", error);
            throw new Error("Failed to create merchant");
        }

        return {
            id: inserted.id,
            name: inserted.name,
            walletAddress: inserted.wallet_address,
            websiteUrl: inserted.website_url,
            webhookUrl: inserted.webhook_url,
            webhookSecret: inserted.webhook_secret,
            createdAt: new Date(inserted.created_at),
            updatedAt: new Date(inserted.updated_at),
        };
    } else {
        const merchant: Merchant = {
            id: crypto.randomUUID(),
            name: data.name,
            websiteUrl: data.websiteUrl || null,
            walletAddress: data.walletAddress,
            webhookUrl: data.webhookUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        memoryMerchants.set(merchant.id, merchant);
        return merchant;
    }
}

// ============================================
// API KEYS
// ============================================

function generateApiKey(prefix: "sk_live" | "sk_test" = "sk_live"): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = `${prefix}_`;
    for (let i = 0; i < 32; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

function hashApiKey(key: string): string {
    // Simple hash for demo - in production use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
}

export async function createApiKey(
    merchantId: string,
    name: string = "Default",
    tier: "free" | "pro" | "enterprise" = "free",
    isTest: boolean = false
): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = generateApiKey(isTest ? "sk_test" : "sk_live");
    const keyHash = hashApiKey(rawKey);

    const rateLimits = {
        free: 60,
        pro: 300,
        enterprise: 1000,
    };

    const apiKey: ApiKey = {
        id: crypto.randomUUID(),
        merchantId,
        key: keyHash,
        keyPrefix: rawKey.slice(0, 12) + "...",
        name,
        tier,
        rateLimit: rateLimits[tier],
        requestCount: 0,
        createdAt: new Date(),
        active: true,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("api_keys").insert({
            id: apiKey.id,
            merchant_id: merchantId,
            key_hash: keyHash,
            key_prefix: apiKey.keyPrefix,
            name,
            tier,
            rate_limit: apiKey.rateLimit,
            active: true,
        });

        if (error) {
            console.error("Supabase error creating API key:", error);
            throw new Error("Failed to create API key");
        }
    } else {
        // Store with raw key for in-memory lookup (demo only)
        memoryApiKeys.set(rawKey, apiKey);
    }

    return { apiKey, rawKey };
}

// Demo API key for documentation examples - works out of the box
const DEMO_API_KEY = "sk_test_demo_xxxxxxxxxxxx";
const DEMO_MERCHANT = {
    id: "demo_merchant",
    name: "Demo Store",
    // Real devnet wallet - payments actually work for testing
    walletAddress: "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV",
};

export async function validateApiKey(rawKey: string): Promise<{
    valid: boolean;
    merchantId?: string;
    merchantWallet?: string;
    merchantName?: string;
    tier?: "free" | "pro" | "enterprise";
    rateLimit?: number;
    error?: string;
}> {
    // Handle demo API key - allows copy-paste from docs to work immediately
    if (rawKey === DEMO_API_KEY) {
        return {
            valid: true,
            merchantId: DEMO_MERCHANT.id,
            merchantWallet: DEMO_MERCHANT.walletAddress,
            merchantName: DEMO_MERCHANT.name,
            tier: "free",
            rateLimit: 60,
        };
    }

    // All API keys (test and live) should be looked up in the database
    if (isSupabaseConfigured()) {
        const keyHash = hashApiKey(rawKey);

        // Join with merchants to get wallet address
        const { data, error } = await supabase
            .from("api_keys")
            .select(`
                *,
                merchants (
                    id,
                    name,
                    wallet_address
                )
            `)
            .eq("key_hash", keyHash)
            .eq("active", true)
            .single();

        if (error || !data) {
            return { valid: false, error: "Invalid API key" };
        }

        // Check expiration
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return { valid: false, error: "API key expired" };
        }

        // Update last used
        await supabase
            .from("api_keys")
            .update({
                last_used_at: new Date().toISOString(),
                request_count: (data.request_count || 0) + 1,
            })
            .eq("id", data.id);

        // Extract merchant data from join
        const merchant = data.merchants as { id: string; name: string; wallet_address: string } | null;

        return {
            valid: true,
            merchantId: data.merchant_id,
            merchantWallet: merchant?.wallet_address,
            merchantName: merchant?.name,
            tier: data.tier,
            rateLimit: data.rate_limit,
        };
    } else {
        // In-memory lookup
        const apiKey = memoryApiKeys.get(rawKey);

        if (!apiKey || !apiKey.active) {
            return { valid: false, error: "Invalid API key" };
        }

        apiKey.lastUsedAt = new Date();
        apiKey.requestCount++;

        // Look up merchant for wallet address
        const merchant = memoryMerchants.get(apiKey.merchantId);

        return {
            valid: true,
            merchantId: apiKey.merchantId,
            merchantWallet: merchant?.walletAddress,
            merchantName: merchant?.name,
            tier: apiKey.tier,
            rateLimit: apiKey.rateLimit,
        };
    }
}

export async function checkRateLimit(apiKey: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
}> {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    let rateData = memoryRateLimits.get(apiKey);

    // Reset if window expired
    if (!rateData || rateData.resetAt < now) {
        rateData = { count: 0, resetAt: now + windowMs };
        memoryRateLimits.set(apiKey, rateData);
    }

    // Get rate limit for this key
    const validation = await validateApiKey(apiKey);
    const limit = validation.rateLimit || 60;

    rateData.count++;

    return {
        allowed: rateData.count <= limit,
        remaining: Math.max(0, limit - rateData.count),
        resetAt: rateData.resetAt,
    };
}

export async function getApiKeysByMerchant(merchantId: string): Promise<ApiKey[]> {
    console.log("[DB] getApiKeysByMerchant called with:", merchantId);

    if (isSupabaseConfigured()) {
        console.log("[DB] Using Supabase, querying for merchant_id:", merchantId);
        const { data, error } = await supabase
            .from("api_keys")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[DB] Supabase error:", error);
            return [];
        }

        if (!data) {
            console.log("[DB] No data returned from Supabase");
            return [];
        }

        console.log("[DB] Supabase returned", data.length, "keys");
        return data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            merchantId: row.merchant_id as string,
            key: row.key_hash as string,
            keyPrefix: row.key_prefix as string,
            name: row.name as string,
            tier: row.tier as "free" | "pro" | "enterprise",
            rateLimit: row.rate_limit as number,
            requestCount: (row.request_count as number) || 0,
            lastUsedAt: row.last_used_at ? new Date(row.last_used_at as string) : undefined,
            createdAt: new Date(row.created_at as string),
            expiresAt: row.expires_at ? new Date(row.expires_at as string) : undefined,
            active: row.active as boolean,
        }));
    } else {
        return Array.from(memoryApiKeys.values()).filter(k => k.merchantId === merchantId);
    }
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("api_keys")
            .update({ active: false })
            .eq("id", keyId);

        return !error;
    } else {
        for (const [rawKey, apiKey] of memoryApiKeys.entries()) {
            if (apiKey.id === keyId) {
                apiKey.active = false;
                return true;
            }
        }
        return false;
    }
}

// ============================================================================
// WAITLIST
// ============================================================================

export interface WaitlistEntry {
    id: string;
    email: string;
    company?: string;
    useCase?: string;
    position: number;
    createdAt: Date;
    status: "pending" | "invited" | "active";
}

// In-memory waitlist storage
const memoryWaitlist: WaitlistEntry[] = [];

export async function addToWaitlist(
    email: string,
    company?: string,
    useCase?: string
): Promise<WaitlistEntry> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        // Check if already exists
        const { data: existing } = await supabase
            .from("waitlist")
            .select("*")
            .eq("email", normalizedEmail)
            .single();

        if (existing) {
            throw new Error("This email is already on the waitlist");
        }

        // Get current count for position
        const { count } = await supabase
            .from("waitlist")
            .select("*", { count: "exact", head: true });

        const { data, error } = await supabase
            .from("waitlist")
            .insert({
                email: normalizedEmail,
                company,
                use_case: useCase,
                position: (count || 0) + 1,
                status: "pending",
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            email: data.email,
            company: data.company,
            useCase: data.use_case,
            position: data.position,
            createdAt: new Date(data.created_at),
            status: data.status,
        };
    } else {
        // Check if already exists
        const existing = memoryWaitlist.find(e => e.email === normalizedEmail);
        if (existing) {
            throw new Error("This email is already on the waitlist");
        }

        const entry: WaitlistEntry = {
            id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: normalizedEmail,
            company,
            useCase,
            position: memoryWaitlist.length + 1,
            createdAt: new Date(),
            status: "pending",
        };

        memoryWaitlist.push(entry);
        return entry;
    }
}

export async function getWaitlist(): Promise<WaitlistEntry[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("waitlist")
            .select("*")
            .order("position", { ascending: true });

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            email: row.email,
            company: row.company,
            useCase: row.use_case,
            position: row.position,
            createdAt: new Date(row.created_at),
            status: row.status,
        }));
    } else {
        return [...memoryWaitlist];
    }
}

export async function getWaitlistPosition(email: string): Promise<number | null> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { data } = await supabase
            .from("waitlist")
            .select("position")
            .eq("email", normalizedEmail)
            .single();

        return data?.position || null;
    } else {
        const entry = memoryWaitlist.find(e => e.email === normalizedEmail);
        return entry?.position || null;
    }
}

export async function updateWaitlistStatus(
    email: string,
    status: "pending" | "invited" | "active"
): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("waitlist")
            .update({ status })
            .eq("email", normalizedEmail);

        return !error;
    } else {
        const entry = memoryWaitlist.find(e => e.email === normalizedEmail);
        if (entry) {
            entry.status = status;
            return true;
        }
        return false;
    }
}

// ============================================
// PAYOUTS
// ============================================

function generatePayoutId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "po_";
    for (let i = 0; i < 20; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateClaimToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    for (let i = 0; i < 48; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

function generateBatchId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "batch_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

const CLAIM_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";

export async function createPayout(
    data: {
        merchantId: string;
        merchantWallet: string;
        email: string;
        amount: number;
        currency?: string;
        memo?: string;
        metadata?: Record<string, string>;
        batchId?: string;
    }
): Promise<Payout> {
    const id = generatePayoutId();
    const claimToken = generateClaimToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const payout: Payout = {
        id,
        merchantId: data.merchantId,
        merchantWallet: data.merchantWallet,
        email: data.email.toLowerCase().trim(),
        amount: data.amount,
        currency: data.currency || "USDC",
        memo: data.memo,
        metadata: data.metadata,
        status: "sent",
        claimToken,
        claimUrl: `${CLAIM_BASE_URL}/claim/${claimToken}`,
        batchId: data.batchId,
        createdAt: now,
        expiresAt,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("payouts").insert({
            id: payout.id,
            merchant_id: payout.merchantId,
            merchant_wallet: payout.merchantWallet,
            email: payout.email,
            amount: payout.amount,
            currency: payout.currency,
            memo: payout.memo,
            metadata: payout.metadata,
            status: payout.status,
            claim_token: payout.claimToken,
            batch_id: payout.batchId,
            expires_at: payout.expiresAt.toISOString(),
        });

        if (error) {
            console.error("Error creating payout:", error);
            throw new Error("Failed to create payout");
        }
    } else {
        memoryPayouts.set(id, payout);
    }

    return payout;
}

export async function getPayoutById(id: string): Promise<Payout | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payouts")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;
        return mapSupabasePayout(data);
    } else {
        return memoryPayouts.get(id) || null;
    }
}

export async function getPayoutByClaimToken(claimToken: string): Promise<Payout | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("payouts")
            .select("*")
            .eq("claim_token", claimToken)
            .single();

        if (error || !data) return null;
        return mapSupabasePayout(data);
    } else {
        for (const payout of memoryPayouts.values()) {
            if (payout.claimToken === claimToken) return payout;
        }
        return null;
    }
}

export async function getPayoutsByMerchant(
    merchantId: string,
    options?: { status?: PayoutStatus; limit?: number; offset?: number }
): Promise<Payout[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("payouts")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });

        if (options?.status) query = query.eq("status", options.status);
        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapSupabasePayout);
    } else {
        let payouts = Array.from(memoryPayouts.values())
            .filter(p => p.merchantId === merchantId);

        if (options?.status) payouts = payouts.filter(p => p.status === options.status);
        payouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) payouts = payouts.slice(options.offset);
        if (options?.limit) payouts = payouts.slice(0, options.limit);

        return payouts;
    }
}

export async function claimPayout(
    claimToken: string,
    recipientWallet: string,
    txSignature: string
): Promise<Payout | null> {
    const payout = await getPayoutByClaimToken(claimToken);
    if (!payout) return null;
    if (payout.status !== "sent") return null;
    if (new Date() > payout.expiresAt) {
        // Mark as expired
        await updatePayoutStatus(payout.id, "expired");
        return null;
    }

    const now = new Date();

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("payouts")
            .update({
                status: "claimed",
                recipient_wallet: recipientWallet,
                tx_signature: txSignature,
                claimed_at: now.toISOString(),
            })
            .eq("claim_token", claimToken);

        if (error) {
            console.error("Error claiming payout:", error);
            return null;
        }
    } else {
        payout.status = "claimed";
        payout.recipientWallet = recipientWallet;
        payout.txSignature = txSignature;
        payout.claimedAt = now;
        memoryPayouts.set(payout.id, payout);
    }

    return { ...payout, status: "claimed", recipientWallet, txSignature, claimedAt: now };
}

export async function updatePayoutStatus(id: string, status: PayoutStatus): Promise<boolean> {
    if (isSupabaseConfigured()) {
        const updates: Record<string, unknown> = { status };
        if (status === "expired") updates.expired_at = new Date().toISOString();
        if (status === "funded") updates.funded_at = new Date().toISOString();

        const { error } = await supabase
            .from("payouts")
            .update(updates)
            .eq("id", id);

        return !error;
    } else {
        const payout = memoryPayouts.get(id);
        if (!payout) return false;
        payout.status = status;
        if (status === "expired") payout.expiredAt = new Date();
        if (status === "funded") payout.fundedAt = new Date();
        return true;
    }
}

// Batch operations
export async function createPayoutBatch(
    merchantId: string,
    payouts: Array<{
        email: string;
        amount: number;
        memo?: string;
        metadata?: Record<string, string>;
    }>,
    merchantWallet: string
): Promise<{ batch: PayoutBatch; payouts: Payout[] }> {
    const batchId = generateBatchId();
    const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);

    const batch: PayoutBatch = {
        id: batchId,
        merchantId,
        totalAmount,
        count: payouts.length,
        status: "processing",
        createdAt: new Date(),
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("payout_batches").insert({
            id: batch.id,
            merchant_id: batch.merchantId,
            total_amount: batch.totalAmount,
            count: batch.count,
            status: batch.status,
        });
        if (error) {
            console.error("Error creating payout batch:", error);
            throw new Error("Failed to create batch");
        }
    } else {
        memoryPayoutBatches.set(batchId, batch);
    }

    const createdPayouts: Payout[] = [];
    for (const p of payouts) {
        const created = await createPayout({
            merchantId,
            merchantWallet,
            email: p.email,
            amount: p.amount,
            memo: p.memo,
            metadata: p.metadata,
            batchId,
        });
        createdPayouts.push(created);
    }

    // Mark batch as completed
    if (isSupabaseConfigured()) {
        await supabase.from("payout_batches").update({
            status: "completed",
            completed_at: new Date().toISOString(),
        }).eq("id", batchId);
    } else {
        batch.status = "completed";
        batch.completedAt = new Date();
    }

    return { batch: { ...batch, status: "completed", completedAt: new Date() }, payouts: createdPayouts };
}

// Helper to map Supabase snake_case to our camelCase interface
function mapSupabasePayout(data: Record<string, unknown>): Payout {
    return {
        id: data.id as string,
        merchantId: data.merchant_id as string,
        merchantWallet: data.merchant_wallet as string,
        email: data.email as string,
        amount: Number(data.amount),
        currency: (data.currency as string) || "USDC",
        memo: data.memo as string | undefined,
        metadata: data.metadata as Record<string, string> | undefined,
        status: data.status as PayoutStatus,
        claimToken: data.claim_token as string,
        claimUrl: `${CLAIM_BASE_URL}/claim/${data.claim_token}`,
        recipientWallet: data.recipient_wallet as string | undefined,
        txSignature: data.tx_signature as string | undefined,
        batchId: data.batch_id as string | undefined,
        createdAt: new Date(data.created_at as string),
        fundedAt: data.funded_at ? new Date(data.funded_at as string) : undefined,
        claimedAt: data.claimed_at ? new Date(data.claimed_at as string) : undefined,
        expiredAt: data.expired_at ? new Date(data.expired_at as string) : undefined,
        expiresAt: new Date(data.expires_at as string),
    };
}


// =========================================================================
// Recipient Network — auto-delivery, balances, dashboard
// =========================================================================

function generateRecipientId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "rcp_";
    for (let i = 0; i < 16; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function generateAuthToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 48; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function generateBalanceTxId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "btx_";
    for (let i = 0; i < 16; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// ---------------------------------------------------------------------------
// Recipient CRUD
// ---------------------------------------------------------------------------

/**
 * Look up a known recipient by email.
 * This is the core of auto-delivery: if a recipient exists, we can skip the claim flow.
 */
export async function getRecipientByEmail(email: string): Promise<Recipient | null> {
    const normalized = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("recipients")
            .select("*")
            .eq("email", normalized)
            .single();
        if (error || !data) return null;
        return mapSupabaseRecipient(data);
    } else {
        return memoryRecipients.get(normalized) || null;
    }
}

/**
 * Register a new recipient (happens on first claim).
 */
export async function registerRecipient(data: {
    email: string;
    walletAddress: string;
    displayName?: string;
}): Promise<Recipient> {
    const normalized = data.email.toLowerCase().trim();
    const now = new Date();

    const recipient: Recipient = {
        id: generateRecipientId(),
        email: normalized,
        walletAddress: data.walletAddress,
        displayName: data.displayName,
        notificationsEnabled: true,
        autoWithdraw: true,
        totalReceived: 0,
        totalPayouts: 0,
        createdAt: now,
        updatedAt: now,
    };

    if (isSupabaseConfigured()) {
        const { error } = await supabase.from("recipients").insert({
            id: recipient.id,
            email: recipient.email,
            wallet_address: recipient.walletAddress,
            display_name: recipient.displayName,
            notifications_enabled: recipient.notificationsEnabled,
            auto_withdraw: recipient.autoWithdraw,
        });
        if (error) {
            console.error("Error registering recipient:", error);
            throw new Error("Failed to register recipient");
        }
    } else {
        memoryRecipients.set(normalized, recipient);
    }

    return recipient;
}

/**
 * Update recipient wallet address or preferences.
 */
export async function updateRecipient(
    email: string,
    updates: {
        walletAddress?: string;
        displayName?: string;
        notificationsEnabled?: boolean;
        autoWithdraw?: boolean;
    }
): Promise<Recipient | null> {
    const normalized = email.toLowerCase().trim();
    const now = new Date();

    if (isSupabaseConfigured()) {
        const supaUpdates: Record<string, unknown> = { updated_at: now.toISOString() };
        if (updates.walletAddress !== undefined) supaUpdates.wallet_address = updates.walletAddress;
        if (updates.displayName !== undefined) supaUpdates.display_name = updates.displayName;
        if (updates.notificationsEnabled !== undefined) supaUpdates.notifications_enabled = updates.notificationsEnabled;
        if (updates.autoWithdraw !== undefined) supaUpdates.auto_withdraw = updates.autoWithdraw;

        const { data, error } = await supabase
            .from("recipients")
            .update(supaUpdates)
            .eq("email", normalized)
            .select()
            .single();

        if (error || !data) return null;
        return mapSupabaseRecipient(data);
    } else {
        const recipient = memoryRecipients.get(normalized);
        if (!recipient) return null;
        if (updates.walletAddress !== undefined) recipient.walletAddress = updates.walletAddress;
        if (updates.displayName !== undefined) recipient.displayName = updates.displayName;
        if (updates.notificationsEnabled !== undefined) recipient.notificationsEnabled = updates.notificationsEnabled;
        if (updates.autoWithdraw !== undefined) recipient.autoWithdraw = updates.autoWithdraw;
        recipient.updatedAt = now;
        return recipient;
    }
}

/**
 * Increment recipient stats after a successful payout.
 */
export async function updateRecipientStats(email: string, amount: number): Promise<void> {
    const normalized = email.toLowerCase().trim();
    const now = new Date();

    if (isSupabaseConfigured()) {
        // Use RPC or manual increment
        const { data } = await supabase
            .from("recipients")
            .select("total_received, total_payouts")
            .eq("email", normalized)
            .single();

        if (data) {
            await supabase.from("recipients").update({
                total_received: Number(data.total_received) + amount,
                total_payouts: Number(data.total_payouts) + 1,
                last_payout_at: now.toISOString(),
                updated_at: now.toISOString(),
            }).eq("email", normalized);
        }
    } else {
        const recipient = memoryRecipients.get(normalized);
        if (recipient) {
            recipient.totalReceived += amount;
            recipient.totalPayouts += 1;
            recipient.lastPayoutAt = now;
            recipient.updatedAt = now;
        }
    }
}

// ---------------------------------------------------------------------------
// Magic link auth for recipient dashboard
// ---------------------------------------------------------------------------

export async function createRecipientAuthToken(email: string): Promise<string | null> {
    const normalized = email.toLowerCase().trim();
    const token = generateAuthToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("recipients")
            .update({ auth_token: token, auth_token_expires_at: expiresAt.toISOString() })
            .eq("email", normalized);
        return error ? null : token;
    } else {
        const recipient = memoryRecipients.get(normalized);
        if (!recipient) return null;
        recipient.authToken = token;
        recipient.authTokenExpiresAt = expiresAt;
        return token;
    }
}

export async function validateRecipientAuthToken(token: string): Promise<Recipient | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("recipients")
            .select("*")
            .eq("auth_token", token)
            .single();

        if (error || !data) return null;
        if (new Date(data.auth_token_expires_at) < new Date()) return null;

        // Clear the token after use
        await supabase.from("recipients").update({
            auth_token: null,
            auth_token_expires_at: null,
        }).eq("auth_token", token);

        return mapSupabaseRecipient(data);
    } else {
        for (const recipient of memoryRecipients.values()) {
            if (recipient.authToken === token) {
                if (recipient.authTokenExpiresAt && recipient.authTokenExpiresAt < new Date()) return null;
                recipient.authToken = undefined;
                recipient.authTokenExpiresAt = undefined;
                return recipient;
            }
        }
        return null;
    }
}

// ---------------------------------------------------------------------------
// Get all payouts for a recipient email (across all platforms)
// ---------------------------------------------------------------------------

export async function getPayoutsByRecipientEmail(
    email: string,
    options?: { limit?: number; offset?: number }
): Promise<Payout[]> {
    const normalized = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
        let query = supabase
            .from("payouts")
            .select("*")
            .eq("email", normalized)
            .order("created_at", { ascending: false });

        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
        if (options?.limit) query = query.limit(options.limit);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d: Record<string, unknown>) => mapSupabasePayout(d));
    } else {
        let payouts = Array.from(memoryPayouts.values())
            .filter(p => p.email === normalized);

        payouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) payouts = payouts.slice(options.offset);
        if (options?.limit) payouts = payouts.slice(0, options.limit);
        return payouts;
    }
}

// ---------------------------------------------------------------------------
// Recipient Balances
// ---------------------------------------------------------------------------

/**
 * Get or create a balance record for a recipient.
 */
export async function getOrCreateBalance(recipientId: string, currency: string = "USDC"): Promise<RecipientBalance> {
    if (isSupabaseConfigured()) {
        // Try to get existing
        const { data } = await supabase
            .from("recipient_balances")
            .select("*")
            .eq("recipient_id", recipientId)
            .eq("currency", currency)
            .single();

        if (data) {
            return {
                id: data.id,
                recipientId: data.recipient_id,
                currency: data.currency,
                balance: Number(data.balance),
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };
        }

        // Create new
        const { data: newData, error } = await supabase
            .from("recipient_balances")
            .insert({ recipient_id: recipientId, currency, balance: 0 })
            .select()
            .single();

        if (error || !newData) throw new Error("Failed to create balance");
        return {
            id: newData.id,
            recipientId: newData.recipient_id,
            currency: newData.currency,
            balance: 0,
            createdAt: new Date(newData.created_at),
            updatedAt: new Date(newData.updated_at),
        };
    } else {
        const key = `${recipientId}:${currency}`;
        let balance = memoryBalances.get(key);
        if (!balance) {
            balance = {
                id: `bal_${recipientId}`,
                recipientId,
                currency,
                balance: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            memoryBalances.set(key, balance);
        }
        return balance;
    }
}

/**
 * Credit a recipient's balance (payout received, held instead of instant withdrawal).
 */
export async function creditBalance(
    recipientId: string,
    amount: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<RecipientBalance> {
    const balance = await getOrCreateBalance(recipientId, currency);
    const newBalance = balance.balance + amount;
    const now = new Date();

    if (isSupabaseConfigured()) {
        await supabase.from("recipient_balances")
            .update({ balance: newBalance, updated_at: now.toISOString() })
            .eq("id", balance.id);

        await supabase.from("balance_transactions").insert({
            id: generateBalanceTxId(),
            recipient_id: recipientId,
            type: "credit",
            amount,
            currency,
            payout_id: payoutId,
            description: `Payout ${payoutId} received`,
        });
    } else {
        balance.balance = newBalance;
        balance.updatedAt = now;
        memoryBalanceTxs.push({
            id: generateBalanceTxId(),
            recipientId,
            type: "credit",
            amount,
            currency,
            payoutId,
            description: `Payout ${payoutId} received`,
            createdAt: now,
        });
    }

    return { ...balance, balance: newBalance, updatedAt: now };
}

/**
 * Withdraw from balance (debit + on-chain transfer).
 */
export async function debitBalance(
    recipientId: string,
    amount: number,
    txSignature: string,
    currency: string = "USDC"
): Promise<RecipientBalance> {
    const balance = await getOrCreateBalance(recipientId, currency);
    if (balance.balance < amount) throw new Error("Insufficient balance");

    const newBalance = balance.balance - amount;
    const now = new Date();

    if (isSupabaseConfigured()) {
        await supabase.from("recipient_balances")
            .update({ balance: newBalance, updated_at: now.toISOString() })
            .eq("id", balance.id);

        await supabase.from("balance_transactions").insert({
            id: generateBalanceTxId(),
            recipient_id: recipientId,
            type: "withdrawal",
            amount,
            currency,
            tx_signature: txSignature,
            description: `Withdrawal to wallet`,
        });
    } else {
        balance.balance = newBalance;
        balance.updatedAt = now;
        memoryBalanceTxs.push({
            id: generateBalanceTxId(),
            recipientId,
            type: "withdrawal",
            amount,
            currency,
            txSignature,
            description: `Withdrawal to wallet`,
            createdAt: now,
        });
    }

    return { ...balance, balance: newBalance, updatedAt: now };
}

/**
 * Get balance transaction history for a recipient.
 */
export async function getBalanceTransactions(
    recipientId: string,
    options?: { limit?: number; offset?: number }
): Promise<BalanceTransaction[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("balance_transactions")
            .select("*")
            .eq("recipient_id", recipientId)
            .order("created_at", { ascending: false });

        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            recipientId: d.recipient_id as string,
            type: d.type as BalanceTransactionType,
            amount: Number(d.amount),
            currency: (d.currency as string) || "USDC",
            payoutId: d.payout_id as string | undefined,
            txSignature: d.tx_signature as string | undefined,
            description: d.description as string | undefined,
            createdAt: new Date(d.created_at as string),
        }));
    } else {
        let txs = memoryBalanceTxs.filter(t => t.recipientId === recipientId);
        txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) txs = txs.slice(options.offset);
        if (options?.limit) txs = txs.slice(0, options.limit);
        return txs;
    }
}

// Helper: map Supabase recipient row
function mapSupabaseRecipient(data: Record<string, unknown>): Recipient {
    return {
        id: data.id as string,
        email: data.email as string,
        walletAddress: data.wallet_address as string,
        displayName: data.display_name as string | undefined,
        authToken: data.auth_token as string | undefined,
        authTokenExpiresAt: data.auth_token_expires_at ? new Date(data.auth_token_expires_at as string) : undefined,
        notificationsEnabled: data.notifications_enabled as boolean ?? true,
        autoWithdraw: data.auto_withdraw as boolean ?? true,
        totalReceived: Number(data.total_received || 0),
        totalPayouts: Number(data.total_payouts || 0),
        createdAt: new Date(data.created_at as string),
        updatedAt: new Date(data.updated_at as string),
        lastPayoutAt: data.last_payout_at ? new Date(data.last_payout_at as string) : undefined,
    };
}

// ============================================
// MERCHANT TREASURY
// ============================================

function generateTreasuryTxId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "ttx_";
    for (let i = 0; i < 20; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

function generateMerchantBalanceId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "mbal_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

/**
 * Get or create a merchant's balance for a given currency.
 */
export async function getOrCreateMerchantBalance(
    merchantId: string,
    currency: string = "USDC"
): Promise<MerchantBalance> {
    if (isSupabaseConfigured()) {
        // Try to get existing
        const { data, error } = await supabase
            .from("merchant_balances")
            .select("*")
            .eq("merchant_id", merchantId)
            .eq("currency", currency)
            .single();

        if (data && !error) {
            return mapSupabaseMerchantBalance(data);
        }

        // Create new
        const newBalance = {
            id: generateMerchantBalanceId(),
            merchant_id: merchantId,
            currency,
            available: 0,
            pending: 0,
            reserved: 0,
            total_deposited: 0,
            total_withdrawn: 0,
            total_payouts: 0,
            total_fees: 0,
        };

        const { data: inserted, error: insertError } = await supabase
            .from("merchant_balances")
            .insert(newBalance)
            .select()
            .single();

        if (insertError || !inserted) {
            // Race condition — another request created it, try to fetch again
            const { data: refetch } = await supabase
                .from("merchant_balances")
                .select("*")
                .eq("merchant_id", merchantId)
                .eq("currency", currency)
                .single();
            if (refetch) return mapSupabaseMerchantBalance(refetch);
            throw new Error("Failed to create merchant balance");
        }

        return mapSupabaseMerchantBalance(inserted);
    } else {
        const key = `${merchantId}:${currency}`;
        let balance = memoryMerchantBalances.get(key);
        if (!balance) {
            const now = new Date();
            balance = {
                id: generateMerchantBalanceId(),
                merchantId,
                currency,
                available: 0,
                pending: 0,
                reserved: 0,
                totalDeposited: 0,
                totalWithdrawn: 0,
                totalPayouts: 0,
                totalFees: 0,
                createdAt: now,
                updatedAt: now,
            };
            memoryMerchantBalances.set(key, balance);
        }
        return balance;
    }
}

/**
 * Get a merchant's current balance (read-only, no creation).
 */
export async function getMerchantBalance(
    merchantId: string,
    currency: string = "USDC"
): Promise<MerchantBalance | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from("merchant_balances")
            .select("*")
            .eq("merchant_id", merchantId)
            .eq("currency", currency)
            .single();

        if (error || !data) return null;
        return mapSupabaseMerchantBalance(data);
    } else {
        return memoryMerchantBalances.get(`${merchantId}:${currency}`) || null;
    }
}

/**
 * Credit merchant balance (deposit confirmed).
 * Moves amount from pending → available (if pending was set) or directly adds to available.
 */
export async function creditMerchantBalance(
    merchantId: string,
    amount: number,
    options: {
        currency?: string;
        txSignature?: string;
        description?: string;
        fromPending?: boolean;
    } = {}
): Promise<MerchantBalance> {
    const currency = options.currency || "USDC";
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const now = new Date();

    let newAvailable = balance.available + amount;
    let newPending = balance.pending;
    let newTotalDeposited = balance.totalDeposited + amount;

    if (options.fromPending) {
        newPending = Math.max(0, balance.pending - amount);
    }

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                available: newAvailable,
                pending: newPending,
                total_deposited: newTotalDeposited,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) throw new Error("Failed to credit merchant balance");
    } else {
        balance.available = newAvailable;
        balance.pending = newPending;
        balance.totalDeposited = newTotalDeposited;
        balance.updatedAt = now;
    }

    // Record transaction
    const txId = generateTreasuryTxId();
    const tx: TreasuryTransaction = {
        id: txId,
        merchantId,
        type: "deposit",
        amount,
        currency,
        txSignature: options.txSignature,
        description: options.description || "USDC deposit",
        balanceAfter: newAvailable,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert({
            id: tx.id,
            merchant_id: tx.merchantId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            tx_signature: tx.txSignature,
            description: tx.description,
            balance_after: tx.balanceAfter,
        });
    } else {
        memoryTreasuryTxs.push(tx);
    }

    return { ...balance, available: newAvailable, pending: newPending, totalDeposited: newTotalDeposited, updatedAt: now };
}

/**
 * Reserve funds for a payout. Moves amount from available → reserved.
 * Returns false if insufficient balance.
 */
export async function reservePayoutFunds(
    merchantId: string,
    amount: number,
    fee: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<{ success: boolean; balance?: MerchantBalance; error?: string }> {
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const totalRequired = amount + fee;

    if (balance.available < totalRequired) {
        return {
            success: false,
            balance,
            error: `Insufficient balance. Required: $${totalRequired.toFixed(2)} (payout: $${amount.toFixed(2)} + fee: $${fee.toFixed(2)}). Available: $${balance.available.toFixed(2)}`,
        };
    }

    const now = new Date();
    const newAvailable = balance.available - totalRequired;
    const newReserved = balance.reserved + totalRequired;

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                available: newAvailable,
                reserved: newReserved,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) return { success: false, error: "Failed to reserve funds" };
    } else {
        balance.available = newAvailable;
        balance.reserved = newReserved;
        balance.updatedAt = now;
    }

    // Record reservation transaction
    const txId = generateTreasuryTxId();
    const tx: TreasuryTransaction = {
        id: txId,
        merchantId,
        type: "payout_reserved",
        amount: totalRequired,
        currency,
        payoutId,
        description: `Reserved for payout ${payoutId} ($${amount.toFixed(2)} + $${fee.toFixed(2)} fee)`,
        balanceAfter: newAvailable,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert({
            id: tx.id,
            merchant_id: tx.merchantId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            payout_id: tx.payoutId,
            description: tx.description,
            balance_after: tx.balanceAfter,
        });
    } else {
        memoryTreasuryTxs.push(tx);
    }

    return {
        success: true,
        balance: { ...balance, available: newAvailable, reserved: newReserved, updatedAt: now },
    };
}

/**
 * Release reserved funds after payout is completed (claimed/delivered).
 * Moves amount from reserved → totalPayouts, fee → totalFees.
 */
export async function releasePayoutFunds(
    merchantId: string,
    amount: number,
    fee: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<MerchantBalance> {
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const now = new Date();
    const totalReleased = amount + fee;

    const newReserved = Math.max(0, balance.reserved - totalReleased);
    const newTotalPayouts = balance.totalPayouts + amount;
    const newTotalFees = balance.totalFees + fee;

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                reserved: newReserved,
                total_payouts: newTotalPayouts,
                total_fees: newTotalFees,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) throw new Error("Failed to release payout funds");
    } else {
        balance.reserved = newReserved;
        balance.totalPayouts = newTotalPayouts;
        balance.totalFees = newTotalFees;
        balance.updatedAt = now;
    }

    // Record release + fee transactions
    const releaseTx: TreasuryTransaction = {
        id: generateTreasuryTxId(),
        merchantId,
        type: "payout_released",
        amount,
        currency,
        payoutId,
        description: `Payout ${payoutId} completed`,
        balanceAfter: balance.available, // available unchanged
        createdAt: now,
    };

    const feeTx: TreasuryTransaction = {
        id: generateTreasuryTxId(),
        merchantId,
        type: "fee_deducted",
        amount: fee,
        currency,
        payoutId,
        description: `Platform fee for payout ${payoutId}`,
        balanceAfter: balance.available,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert([
            {
                id: releaseTx.id,
                merchant_id: releaseTx.merchantId,
                type: releaseTx.type,
                amount: releaseTx.amount,
                currency: releaseTx.currency,
                payout_id: releaseTx.payoutId,
                description: releaseTx.description,
                balance_after: releaseTx.balanceAfter,
            },
            {
                id: feeTx.id,
                merchant_id: feeTx.merchantId,
                type: feeTx.type,
                amount: feeTx.amount,
                currency: feeTx.currency,
                payout_id: feeTx.payoutId,
                description: feeTx.description,
                balance_after: feeTx.balanceAfter,
            },
        ]);
    } else {
        memoryTreasuryTxs.push(releaseTx, feeTx);
    }

    return { ...balance, reserved: newReserved, totalPayouts: newTotalPayouts, totalFees: newTotalFees, updatedAt: now };
}

/**
 * Refund reserved funds back to available (payout expired/failed).
 */
export async function refundReservedFunds(
    merchantId: string,
    amount: number,
    fee: number,
    payoutId: string,
    currency: string = "USDC"
): Promise<MerchantBalance> {
    const balance = await getOrCreateMerchantBalance(merchantId, currency);
    const now = new Date();
    const totalRefund = amount + fee;

    const newAvailable = balance.available + totalRefund;
    const newReserved = Math.max(0, balance.reserved - totalRefund);

    if (isSupabaseConfigured()) {
        const { error } = await supabase
            .from("merchant_balances")
            .update({
                available: newAvailable,
                reserved: newReserved,
                updated_at: now.toISOString(),
            })
            .eq("id", balance.id);

        if (error) throw new Error("Failed to refund reserved funds");
    } else {
        balance.available = newAvailable;
        balance.reserved = newReserved;
        balance.updatedAt = now;
    }

    // Record refund transaction
    const tx: TreasuryTransaction = {
        id: generateTreasuryTxId(),
        merchantId,
        type: "payout_refund",
        amount: totalRefund,
        currency,
        payoutId,
        description: `Refund for expired/failed payout ${payoutId}`,
        balanceAfter: newAvailable,
        createdAt: now,
    };

    if (isSupabaseConfigured()) {
        await supabase.from("treasury_transactions").insert({
            id: tx.id,
            merchant_id: tx.merchantId,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            payout_id: tx.payoutId,
            description: tx.description,
            balance_after: tx.balanceAfter,
        });
    } else {
        memoryTreasuryTxs.push(tx);
    }

    return { ...balance, available: newAvailable, reserved: newReserved, updatedAt: now };
}

/**
 * Get treasury transaction history for a merchant.
 */
export async function getTreasuryTransactions(
    merchantId: string,
    options?: { type?: TreasuryTransactionType; limit?: number; offset?: number }
): Promise<TreasuryTransaction[]> {
    if (isSupabaseConfigured()) {
        let query = supabase
            .from("treasury_transactions")
            .select("*")
            .eq("merchant_id", merchantId)
            .order("created_at", { ascending: false });

        if (options?.type) query = query.eq("type", options.type);
        if (options?.limit) query = query.limit(options.limit);
        if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            merchantId: d.merchant_id as string,
            type: d.type as TreasuryTransactionType,
            amount: Number(d.amount),
            currency: (d.currency as string) || "USDC",
            payoutId: d.payout_id as string | undefined,
            txSignature: d.tx_signature as string | undefined,
            description: d.description as string | undefined,
            balanceAfter: Number(d.balance_after),
            createdAt: new Date(d.created_at as string),
        }));
    } else {
        let txs = memoryTreasuryTxs.filter(t => t.merchantId === merchantId);
        if (options?.type) txs = txs.filter(t => t.type === options.type);
        txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (options?.offset) txs = txs.slice(options.offset);
        if (options?.limit) txs = txs.slice(0, options.limit);
        return txs;
    }
}

/**
 * Calculate the fee for a payout amount.
 * 1% with a $0.25 minimum.
 */
export function calculatePayoutFee(amount: number): number {
    return Math.max(amount * 0.01, 0.25);
}

// Helper: map Supabase merchant_balance row
function mapSupabaseMerchantBalance(data: Record<string, unknown>): MerchantBalance {
    return {
        id: data.id as string,
        merchantId: data.merchant_id as string,
        currency: (data.currency as string) || "USDC",
        available: Number(data.available || 0),
        pending: Number(data.pending || 0),
        reserved: Number(data.reserved || 0),
        totalDeposited: Number(data.total_deposited || 0),
        totalWithdrawn: Number(data.total_withdrawn || 0),
        totalPayouts: Number(data.total_payouts || 0),
        totalFees: Number(data.total_fees || 0),
        depositAddress: data.deposit_address as string | undefined,
        createdAt: new Date(data.created_at as string),
        updatedAt: new Date(data.updated_at as string),
    };
}