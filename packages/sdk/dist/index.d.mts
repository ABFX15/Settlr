import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode, CSSProperties } from 'react';

declare const USDC_MINT_DEVNET: PublicKey;
declare const USDC_MINT_MAINNET: PublicKey;
declare const USDT_MINT_DEVNET: PublicKey;
declare const USDT_MINT_MAINNET: PublicKey;
declare const SUPPORTED_TOKENS: {
    readonly USDC: {
        readonly symbol: "USDC";
        readonly name: "USD Coin";
        readonly decimals: 6;
        readonly mint: {
            readonly devnet: PublicKey;
            readonly 'mainnet-beta': PublicKey;
        };
        readonly logoUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png";
    };
    readonly USDT: {
        readonly symbol: "USDT";
        readonly name: "Tether USD";
        readonly decimals: 6;
        readonly mint: {
            readonly devnet: PublicKey;
            readonly 'mainnet-beta': PublicKey;
        };
        readonly logoUrl: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg";
    };
};
type SupportedToken = keyof typeof SUPPORTED_TOKENS;
declare const SETTLR_CHECKOUT_URL: {
    readonly production: "https://settlr.dev/checkout";
    readonly development: "https://settlr.dev/checkout";
};
declare const SUPPORTED_NETWORKS: readonly ["devnet", "mainnet-beta"];
type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];
/**
 * Get token mint address for a specific network
 */
declare function getTokenMint(token: SupportedToken, network: SupportedNetwork): PublicKey;
/**
 * Get token decimals
 */
declare function getTokenDecimals(token: SupportedToken): number;

/**
 * Payment status
 */
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'refunded';
/**
 * Options for creating a payment
 */
interface CreatePaymentOptions {
    /** Amount in stablecoin (e.g., 29.99) */
    amount: number;
    /** Token to accept (default: USDC) */
    token?: SupportedToken;
    /** Optional memo/description for the payment */
    memo?: string;
    /** Optional order/invoice ID for your records */
    orderId?: string;
    /** Optional metadata to attach to the payment */
    metadata?: Record<string, string>;
    /** URL to redirect after successful payment */
    successUrl?: string;
    /** URL to redirect after cancelled payment */
    cancelUrl?: string;
    /** Expiration time in seconds (default: 3600 = 1 hour) */
    expiresIn?: number;
}
/**
 * Payment object returned after creation
 */
interface Payment {
    /** Unique payment ID */
    id: string;
    /** Amount in stablecoin */
    amount: number;
    /** Token used for payment */
    token: SupportedToken;
    /** Amount in lamports (USDC atomic units) */
    amountLamports: bigint;
    /** Current status */
    status: PaymentStatus;
    /** Merchant wallet address */
    merchantAddress: string;
    /** Checkout URL for the customer */
    checkoutUrl: string;
    /** QR code data URL (base64 PNG) */
    qrCode: string;
    /** Memo/description */
    memo?: string;
    /** Order ID */
    orderId?: string;
    /** Custom metadata */
    metadata?: Record<string, string>;
    /** Creation timestamp */
    createdAt: Date;
    /** Expiration timestamp */
    expiresAt: Date;
    /** Transaction signature (when completed) */
    txSignature?: string;
    /** Payer wallet address (when completed) */
    payerAddress?: string;
}
/**
 * Result of a direct payment (not via checkout link)
 */
interface PaymentResult {
    /** Whether the payment succeeded */
    success: boolean;
    /** Transaction signature */
    signature: string;
    /** Amount paid in USDC */
    amount: number;
    /** Merchant address */
    merchantAddress: string;
    /** Block time of confirmation */
    blockTime?: number;
    /** Error message if failed */
    error?: string;
}
/**
 * Merchant configuration
 */
interface MerchantConfig {
    /** Merchant display name */
    name: string;
    /** Merchant wallet address (receives payments) - optional if using registered API key */
    walletAddress?: string | PublicKey;
    /** Optional logo URL */
    logoUrl?: string;
    /** Optional website URL */
    websiteUrl?: string;
    /** Webhook URL for payment notifications */
    webhookUrl?: string;
    /** Webhook secret for signature verification */
    webhookSecret?: string;
}
/**
 * Transaction options for direct payments
 */
interface TransactionOptions {
    /** Skip preflight simulation */
    skipPreflight?: boolean;
    /** Commitment level */
    commitment?: 'processed' | 'confirmed' | 'finalized';
    /** Max retries */
    maxRetries?: number;
}
/**
 * Subscription interval
 */
type SubscriptionInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
/**
 * Subscription status
 */
type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due' | 'expired';
/**
 * Subscription plan
 */
interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    interval: SubscriptionInterval;
    intervalCount: number;
    trialDays?: number;
    features?: string[];
    active: boolean;
}
/**
 * Options for creating a subscription
 */
interface CreateSubscriptionOptions {
    /** The plan ID to subscribe to */
    planId: string;
    /** Customer's wallet address */
    customerWallet: string;
    /** Optional customer email for notifications */
    customerEmail?: string;
    /** Optional metadata */
    metadata?: Record<string, string>;
    /** URL to redirect after successful subscription */
    successUrl?: string;
    /** URL to redirect after cancelled subscription */
    cancelUrl?: string;
}
/**
 * Subscription object
 */
interface Subscription {
    id: string;
    planId: string;
    plan?: SubscriptionPlan;
    customerWallet: string;
    customerEmail?: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
    createdAt: string;
}
/**
 * Payout status
 */
type PayoutStatus$1 = 'pending' | 'funded' | 'sent' | 'claimed' | 'expired' | 'failed';
/**
 * Payout record
 */
interface Payout {
    id: string;
    email: string;
    amount: number;
    currency: string;
    memo?: string;
    metadata?: Record<string, string>;
    status: PayoutStatus$1;
    claimUrl: string;
    recipientWallet?: string;
    txSignature?: string;
    batchId?: string;
    createdAt: string;
    fundedAt?: string;
    claimedAt?: string;
    expiresAt: string;
}
/**
 * Payout batch
 */
interface PayoutBatch {
    id: string;
    status: string;
    total: number;
    count: number;
    payouts: Array<{
        id: string;
        email: string;
        amount: number;
        status: PayoutStatus$1;
        claimUrl: string;
    }>;
    createdAt: string;
}
/**
 * Webhook event types
 */
type WebhookEventType = 'payment.created' | 'payment.completed' | 'payment.failed' | 'payment.expired' | 'payment.refunded' | 'subscription.created' | 'subscription.renewed' | 'subscription.cancelled' | 'subscription.expired' | 'payout.created' | 'payout.sent' | 'payout.claimed' | 'payout.expired' | 'payout.failed';
/**
 * Webhook payload
 */
interface WebhookPayload {
    id: string;
    type: WebhookEventType;
    payment: Payment;
    timestamp: string;
    signature: string;
}

/**
 * Settlr SDK configuration
 */
interface SettlrConfig {
    /** Settlr API key (required for production) */
    apiKey: string;
    /** Merchant configuration */
    merchant: MerchantConfig;
    /** Network to use (default: devnet) */
    network?: SupportedNetwork;
    /** Custom RPC endpoint */
    rpcEndpoint?: string;
    /** Use testnet/sandbox mode */
    testMode?: boolean;
}
/**
 * Settlr SDK Client
 *
 * @example
 * ```typescript
 * const settlr = new Settlr({
 *   apiKey: 'sk_live_xxxxxxxxxxxx',
 *   merchant: {
 *     name: 'My Store',
 *     walletAddress: 'YOUR_WALLET_ADDRESS',
 *   },
 * });
 *
 * const payment = await settlr.createPayment({
 *   amount: 29.99,
 *   memo: 'Premium subscription',
 * });
 *
 * // Redirect customer to checkout
 * window.location.href = payment.checkoutUrl;
 * ```
 */
declare class Settlr {
    private config;
    private connection;
    private usdcMint;
    private merchantWallet;
    private merchantWalletFromValidation?;
    private apiBaseUrl;
    private validated;
    private merchantId?;
    private tier?;
    constructor(config: SettlrConfig);
    /**
     * Validate API key with Settlr backend
     * This is called automatically by SettlrProvider, but can also be called manually.
     * Fetches merchant wallet address if not provided in config.
     */
    validateApiKey(): Promise<void>;
    /**
     * Get the current tier
     */
    getTier(): 'free' | 'pro' | 'enterprise' | undefined;
    /**
     * Get a checkout URL for redirect-based payments
     *
     * This is the simplest integration - just redirect users to this URL.
     * Settlr handles auth (email or wallet) and payment processing.
     *
     * @example
     * ```typescript
     * const url = settlr.getCheckoutUrl({
     *   amount: 29.99,
     *   memo: 'Premium Pack',
     * });
     *
     * // Redirect user to checkout
     * window.location.href = url;
     * ```
     */
    getCheckoutUrl(options: {
        amount: number;
        memo?: string;
        orderId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }): string;
    /**
     * Create a payment link
     *
     * @example
     * ```typescript
     * const payment = await settlr.createPayment({
     *   amount: 29.99,
     *   memo: 'Order #1234',
     *   successUrl: 'https://mystore.com/success',
     * });
     *
     * console.log(payment.checkoutUrl);
     * // https://settlr.dev/pay?amount=29.99&merchant=...
     * ```
     */
    createPayment(options: CreatePaymentOptions): Promise<Payment>;
    /**
     * Build a transaction for direct payment (for wallet integration)
     *
     * @example
     * ```typescript
     * const tx = await settlr.buildTransaction({
     *   payerPublicKey: wallet.publicKey,
     *   amount: 29.99,
     * });
     *
     * const signature = await wallet.sendTransaction(tx, connection);
     * ```
     */
    buildTransaction(options: {
        payerPublicKey: PublicKey;
        amount: number;
        memo?: string;
    }): Promise<Transaction>;
    /**
     * Execute a direct payment (requires wallet adapter)
     *
     * @example
     * ```typescript
     * const result = await settlr.pay({
     *   wallet,
     *   amount: 29.99,
     *   memo: 'Order #1234',
     * });
     *
     * if (result.success) {
     *   console.log('Paid!', result.signature);
     * }
     * ```
     */
    pay(options: {
        wallet: {
            publicKey: PublicKey;
            signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
        amount: number;
        memo?: string;
        txOptions?: TransactionOptions;
    }): Promise<PaymentResult>;
    /**
     * Check payment status by transaction signature
     */
    getPaymentStatus(signature: string): Promise<'pending' | 'completed' | 'failed'>;
    /**
     * Create a hosted checkout session (like Stripe Checkout)
     *
     * @example
     * ```typescript
     * const session = await settlr.createCheckoutSession({
     *   amount: 29.99,
     *   description: 'Premium Plan',
     *   successUrl: 'https://mystore.com/success',
     *   cancelUrl: 'https://mystore.com/cancel',
     *   webhookUrl: 'https://mystore.com/api/webhooks/settlr',
     * });
     *
     * // Redirect customer to hosted checkout
     * window.location.href = session.url;
     * ```
     */
    createCheckoutSession(options: {
        amount: number;
        description?: string;
        metadata?: Record<string, string>;
        successUrl: string;
        cancelUrl: string;
        webhookUrl?: string;
    }): Promise<{
        id: string;
        url: string;
        expiresAt: number;
    }>;
    /**
     * Get merchant's USDC balance
     */
    getMerchantBalance(): Promise<number>;
    /**
     * Generate QR code for payment URL
     */
    private generateQRCode;
    /**
     * Get the connection instance
     */
    getConnection(): Connection;
    /**
     * Get merchant wallet - from config or from API validation
     * @internal
     */
    private getMerchantWallet;
    /**
     * Get merchant wallet address
     */
    getMerchantAddress(): PublicKey | null;
    /**
     * Get USDC mint address
     */
    getUsdcMint(): PublicKey;
}

/**
 * Format lamports to USDC string
 * @param lamports - Amount in lamports (atomic units)
 * @param decimals - Number of decimal places (default: 2)
 */
declare function formatUSDC(lamports: bigint | number, decimals?: number): string;
/**
 * Parse USDC amount to lamports
 * @param amount - Amount in USDC (e.g., 29.99)
 */
declare function parseUSDC(amount: number | string): bigint;
/**
 * Shorten a Solana address for display
 * @param address - Full address string
 * @param chars - Number of chars to show on each end (default: 4)
 */
declare function shortenAddress(address: string, chars?: number): string;

/**
 * Checkout URL options
 */
interface CheckoutUrlOptions {
    amount: number;
    memo?: string;
    orderId?: string;
    successUrl?: string;
    cancelUrl?: string;
}
/**
 * Settlr context value
 */
interface SettlrContextValue {
    /** Settlr client instance */
    settlr: Settlr | null;
    /** Whether user is authenticated */
    authenticated: boolean;
    /** Whether the SDK is ready (API key validated) */
    ready: boolean;
    /** Error if initialization failed */
    error: Error | null;
    /** Create a payment link (redirect flow) */
    createPayment: (options: CreatePaymentOptions) => Promise<Payment>;
    /** Generate checkout URL for redirect */
    getCheckoutUrl: (options: CheckoutUrlOptions) => string;
    /** Get merchant's USDC balance */
    getBalance: () => Promise<number>;
}
/**
 * Settlr Provider Props
 */
interface SettlrProviderProps {
    children: ReactNode;
    config: SettlrConfig;
    /** Whether user is authenticated (from Privy or other auth) */
    authenticated?: boolean;
}
/**
 * Settlr Provider - Wraps your app to provide Settlr functionality
 *
 * Works with Privy authentication - just pass the authenticated state.
 *
 * @example
 * ```tsx
 * import { SettlrProvider } from '@settlr/sdk';
 * import { usePrivy } from '@privy-io/react-auth';
 *
 * function App() {
 *   const { authenticated } = usePrivy();
 *
 *   return (
 *     <SettlrProvider
 *       authenticated={authenticated}
 *       config={{
 *         apiKey: 'sk_live_xxxxxxxxxxxx',
 *         merchant: {
 *           name: 'My Game',
 *           walletAddress: 'YOUR_WALLET',
 *         },
 *       }}
 *     >
 *       <YourApp />
 *     </SettlrProvider>
 *   );
 * }
 * ```
 */
declare function SettlrProvider({ children, config, authenticated, }: SettlrProviderProps): react_jsx_runtime.JSX.Element;
/**
 * useSettlr hook - Access Settlr functionality in your components
 *
 * @example
 * ```tsx
 * import { useSettlr } from '@settlr/sdk';
 *
 * function CheckoutButton() {
 *   const { getCheckoutUrl, authenticated } = useSettlr();
 *
 *   const handleCheckout = () => {
 *     // Redirect to Settlr checkout (handles Privy auth internally)
 *     const url = getCheckoutUrl({ amount: 29.99, memo: 'Premium Pack' });
 *     window.location.href = url;
 *   };
 *
 *   return (
 *     <button onClick={handleCheckout}>
 *       Buy Premium Pack - $29.99
 *     </button>
 *   );
 * }
 * ```
 */
declare function useSettlr(): SettlrContextValue;

/**
 * Settlr Buy Button - Drop-in payment button component
 *
 * @example
 * ```tsx
 * import { BuyButton } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   return (
 *     <BuyButton
 *       amount={49.99}
 *       memo="Premium Game Bundle"
 *       onSuccess={(result) => {
 *         console.log('Payment successful!', result.signature);
 *         // Redirect to success page or unlock content
 *       }}
 *       onError={(error) => console.error(error)}
 *     >
 *       Buy Now - $49.99
 *     </BuyButton>
 *   );
 * }
 * ```
 */
interface BuyButtonProps {
    /** Payment amount in USDC */
    amount: number;
    /** Optional memo/description */
    memo?: string;
    /** Optional order ID for your records */
    orderId?: string;
    /** Button text/content (default: "Pay ${amount}") */
    children?: ReactNode;
    /** Called when payment succeeds */
    onSuccess?: (result: {
        signature: string;
        amount: number;
        merchantAddress: string;
    }) => void;
    /** Called when payment fails */
    onError?: (error: Error) => void;
    /** Called when payment starts processing */
    onProcessing?: () => void;
    /** Use redirect flow instead of direct payment */
    useRedirect?: boolean;
    /** Success URL for redirect flow */
    successUrl?: string;
    /** Cancel URL for redirect flow */
    cancelUrl?: string;
    /** Custom class name */
    className?: string;
    /** Custom styles */
    style?: CSSProperties;
    /** Disabled state */
    disabled?: boolean;
    /** Button variant */
    variant?: "primary" | "secondary" | "outline";
    /** Button size */
    size?: "sm" | "md" | "lg";
}
declare function BuyButton({ amount, memo, orderId, children, onSuccess, onError, onProcessing, useRedirect, // Default to redirect flow (works with Privy)
successUrl, cancelUrl, className, style, disabled, variant, size, }: BuyButtonProps): react_jsx_runtime.JSX.Element;
/**
 * Checkout Widget - Embeddable checkout form
 *
 * @example
 * ```tsx
 * import { CheckoutWidget } from '@settlr/sdk';
 *
 * function CheckoutPage() {
 *   return (
 *     <CheckoutWidget
 *       amount={149.99}
 *       productName="Annual Subscription"
 *       productDescription="Full access to all premium features"
 *       onSuccess={(result) => {
 *         router.push('/success');
 *       }}
 *     />
 *   );
 * }
 * ```
 */
interface CheckoutWidgetProps {
    /** Payment amount in USDC */
    amount: number;
    /** Product/service name */
    productName: string;
    /** Optional description */
    productDescription?: string;
    /** Optional product image URL */
    productImage?: string;
    /** Merchant name (from config if not provided) */
    merchantName?: string;
    /** Optional memo for the transaction */
    memo?: string;
    /** Optional order ID */
    orderId?: string;
    /** Called when payment succeeds */
    onSuccess?: (result: {
        signature: string;
        amount: number;
        merchantAddress: string;
    }) => void;
    /** Called when payment fails */
    onError?: (error: Error) => void;
    /** Called when user cancels */
    onCancel?: () => void;
    /** Custom class name */
    className?: string;
    /** Custom styles */
    style?: CSSProperties;
    /** Theme */
    theme?: "light" | "dark";
    /** Show powered by Settlr badge */
    showBranding?: boolean;
}
declare function CheckoutWidget({ amount, productName, productDescription, productImage, merchantName, memo, orderId, onSuccess, onError, onCancel, className, style, theme, showBranding, }: CheckoutWidgetProps): react_jsx_runtime.JSX.Element;
/**
 * Payment Link Generator - Create shareable payment links
 *
 * @example
 * ```tsx
 * const { generateLink } = usePaymentLink({
 *   merchantWallet: 'YOUR_WALLET',
 *   merchantName: 'My Store',
 * });
 *
 * const link = generateLink({
 *   amount: 29.99,
 *   memo: 'Order #1234',
 * });
 * // https://settlr.dev/pay?amount=29.99&merchant=My+Store&to=YOUR_WALLET&memo=Order+%231234
 * ```
 */
declare function usePaymentLink(config: {
    merchantWallet: string;
    merchantName: string;
    baseUrl?: string;
}): {
    generateLink: (options: {
        amount: number;
        memo?: string;
        orderId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) => string;
    generateQRCode: (options: Parameters<(options: {
        amount: number;
        memo?: string;
        orderId?: string;
        successUrl?: string;
        cancelUrl?: string;
    }) => string>[0]) => Promise<string>;
};
/**
 * Payment Modal - Iframe-based checkout that keeps users on your site
 *
 * @example
 * ```tsx
 * import { PaymentModal } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   const [showPayment, setShowPayment] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setShowPayment(true)}>
 *         Buy Now - $49.99
 *       </button>
 *
 *       {showPayment && (
 *         <PaymentModal
 *           amount={49.99}
 *           merchantName="Arena GG"
 *           merchantWallet="YOUR_WALLET_ADDRESS"
 *           memo="Tournament Entry"
 *           onSuccess={(result) => {
 *             console.log('Paid!', result.signature);
 *             setShowPayment(false);
 *           }}
 *           onClose={() => setShowPayment(false)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
interface PaymentModalProps {
    /** Payment amount in USDC */
    amount: number;
    /** Merchant display name */
    merchantName: string;
    /** Merchant wallet address */
    merchantWallet: string;
    /** Optional memo/description */
    memo?: string;
    /** Optional order ID */
    orderId?: string;
    /** Called when payment succeeds */
    onSuccess?: (result: {
        signature: string;
        amount: number;
    }) => void;
    /** Called when modal is closed */
    onClose?: () => void;
    /** Called on error */
    onError?: (error: Error) => void;
    /** Checkout base URL (default: https://settlr.dev/checkout) */
    checkoutUrl?: string;
}
declare function PaymentModal({ amount, merchantName, merchantWallet, memo, orderId, onSuccess, onClose, onError, checkoutUrl, }: PaymentModalProps): react_jsx_runtime.JSX.Element;
/**
 * Hook to open payment modal programmatically
 *
 * @example
 * ```tsx
 * import { usePaymentModal } from '@settlr/sdk';
 *
 * function ProductPage() {
 *   const { openPayment, PaymentModalComponent } = usePaymentModal({
 *     merchantName: "Arena GG",
 *     merchantWallet: "YOUR_WALLET",
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={() => openPayment({
 *         amount: 49.99,
 *         memo: "Tournament Entry",
 *         onSuccess: (result) => console.log("Paid!", result),
 *       })}>
 *         Buy Now
 *       </button>
 *       <PaymentModalComponent />
 *     </>
 *   );
 * }
 * ```
 */
declare function usePaymentModal(config: {
    merchantName: string;
    merchantWallet: string;
    checkoutUrl?: string;
}): {
    openPayment: (options: {
        amount: number;
        memo?: string;
        orderId?: string;
        onSuccess?: (result: {
            signature: string;
            amount: number;
        }) => void;
        onError?: (error: Error) => void;
    }) => void;
    closePayment: () => void;
    isOpen: boolean;
    PaymentModalComponent: () => react_jsx_runtime.JSX.Element | null;
};

/**
 * Verify a webhook signature
 * @param payload - The raw request body (string)
 * @param signature - The signature from the X-Settlr-Signature header
 * @param secret - Your webhook secret
 * @returns Whether the signature is valid
 */
declare function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
/**
 * Parse and verify a webhook payload
 * @param rawBody - The raw request body
 * @param signature - The signature from headers
 * @param secret - Your webhook secret
 * @returns The parsed and verified payload
 * @throws Error if signature is invalid
 */
declare function parseWebhookPayload(rawBody: string, signature: string, secret: string): WebhookPayload;
/**
 * Webhook event handler type
 */
type WebhookHandler = (event: WebhookPayload) => Promise<void> | void;
/**
 * Webhook event handlers map
 */
interface WebhookHandlers {
    'payment.created'?: WebhookHandler;
    'payment.completed'?: WebhookHandler;
    'payment.failed'?: WebhookHandler;
    'payment.expired'?: WebhookHandler;
    'payment.refunded'?: WebhookHandler;
    'subscription.created'?: WebhookHandler;
    'subscription.renewed'?: WebhookHandler;
    'subscription.cancelled'?: WebhookHandler;
    'subscription.expired'?: WebhookHandler;
    'payout.created'?: WebhookHandler;
    'payout.sent'?: WebhookHandler;
    'payout.claimed'?: WebhookHandler;
    'payout.expired'?: WebhookHandler;
    'payout.failed'?: WebhookHandler;
}
/**
 * Create a webhook handler middleware
 *
 * @example Express.js
 * ```typescript
 * import express from 'express';
 * import { createWebhookHandler } from '@settlr/sdk/webhooks';
 *
 * const app = express();
 *
 * app.post('/webhooks/settlr',
 *   express.raw({ type: 'application/json' }),
 *   createWebhookHandler({
 *     secret: process.env.SETTLR_WEBHOOK_SECRET!,
 *     handlers: {
 *       'payment.completed': async (event) => {
 *         console.log('Payment completed:', event.payment.id);
 *         await fulfillOrder(event.payment.orderId);
 *       },
 *       'payment.failed': async (event) => {
 *         console.log('Payment failed:', event.payment.id);
 *         await notifyCustomer(event.payment.orderId);
 *       },
 *     },
 *   })
 * );
 * ```
 *
 * @example Next.js API Route
 * ```typescript
 * // pages/api/webhooks/settlr.ts
 * import { createWebhookHandler } from '@settlr/sdk/webhooks';
 *
 * export const config = { api: { bodyParser: false } };
 *
 * export default createWebhookHandler({
 *   secret: process.env.SETTLR_WEBHOOK_SECRET!,
 *   handlers: {
 *     'payment.completed': async (event) => {
 *       await fulfillOrder(event.payment.orderId);
 *     },
 *   },
 * });
 * ```
 */
declare function createWebhookHandler(options: {
    secret: string;
    handlers: WebhookHandlers;
    onError?: (error: Error) => void;
}): (req: any, res: any) => Promise<void>;

/**
 * MagicBlock Private Ephemeral Rollup (PER) Privacy Module
 *
 * Private payments powered by MagicBlock's TEE (Intel TDX) infrastructure.
 * Payment data is hidden inside a Private Ephemeral Rollup — only permissioned
 * members (merchant + customer) can observe state. Observers on the base layer
 * see nothing until settlement.
 *
 * Flow:
 *   1. Create private payment session (on base layer)
 *   2. Delegate the account to a PER (data moves into TEE)
 *   3. Process payment inside the TEE (hidden from observers)
 *   4. Settle — commit final state back to Solana
 */

/** Settlr program */
declare const SETTLR_PROGRAM_ID: PublicKey;
/** MagicBlock Delegation Program */
declare const DELEGATION_PROGRAM_ID: PublicKey;
/** MagicBlock Permission Program */
declare const PERMISSION_PROGRAM_ID: PublicKey;
/** Devnet TEE endpoint — Private Ephemeral Rollup */
declare const PER_ENDPOINT = "https://tee.magicblock.app";
declare const PER_WS_ENDPOINT = "wss://tee.magicblock.app";
/** Devnet ER endpoint (non-private) */
declare const ER_ENDPOINTS: {
    readonly asia: "https://devnet-as.magicblock.app";
    readonly eu: "https://devnet-eu.magicblock.app";
    readonly us: "https://devnet-us.magicblock.app";
};
/** Magic Router (devnet) — routes to nearest ER */
declare const MAGIC_ROUTER_DEVNET = "https://devnet-router.magicblock.app";
/** TEE Validator pubkey */
declare const TEE_VALIDATOR: PublicKey;
/**
 * Derive the private receipt PDA for a given payment ID
 */
declare function findPrivateReceiptPda(paymentId: string): [PublicKey, number];
/**
 * Derive the delegation buffer PDA for a given account
 */
declare function findDelegationBufferPda(accountPda: PublicKey): [PublicKey, number];
/**
 * Derive the delegation record PDA
 */
declare function findDelegationRecordPda(accountPda: PublicKey): [PublicKey, number];
/**
 * Derive the delegation metadata PDA
 */
declare function findDelegationMetadataPda(accountPda: PublicKey): [PublicKey, number];
/** Session status enum (mirrors on-chain SessionStatus) */
declare enum SessionStatus {
    Pending = 0,
    Active = 1,
    Processed = 2,
    Settled = 3
}
/**
 * Configuration for creating a private payment session
 */
interface PrivatePaymentConfig {
    /** Payment ID (must be unique) */
    paymentId: string;
    /** Amount in USDC (will be converted to lamports) */
    amount: number;
    /** Fee amount in USDC */
    feeAmount?: number;
    /** Customer wallet (payer + signer) */
    customer: PublicKey;
    /** Merchant wallet */
    merchant: PublicKey;
    /** Optional memo / order reference */
    memo?: string;
}
/**
 * Build accounts for creating a private payment session
 */
declare function buildPrivatePaymentAccounts(config: PrivatePaymentConfig): Promise<{
    customer: PublicKey;
    merchant: PublicKey;
    privateReceipt: PublicKey;
    systemProgram: PublicKey;
}>;
/**
 * Build accounts for delegating a private payment to PER
 */
declare function buildDelegateAccounts(paymentId: string, payer: PublicKey): Promise<{
    payer: PublicKey;
    privateReceipt: PublicKey;
    ownerProgram: PublicKey;
    buffer: PublicKey;
    delegationRecord: PublicKey;
    delegationMetadata: PublicKey;
    delegationProgram: PublicKey;
    systemProgram: PublicKey;
}>;
/**
 * Create a connection to the Private Ephemeral Rollup (TEE)
 *
 * Transactions sent through this connection execute inside Intel TDX.
 * State is hidden from base-layer observers.
 */
declare function createPERConnection(): Connection;
/**
 * Create a connection to the base-layer Solana devnet
 */
declare function createBaseConnection(): Connection;
/**
 * Privacy-preserving payment features powered by MagicBlock PER
 */
declare const PrivacyFeatures: {
    /** Payment data hidden inside TEE during processing */
    readonly TEE_ENCRYPTED_STATE: true;
    /** Permission-based access: only merchant + customer can observe */
    readonly PERMISSION_ACCESS_CONTROL: true;
    /** Sub-10ms latency inside PER, gasless transactions */
    readonly REALTIME_EXECUTION: true;
    /** Final state committed back to base layer for accounting */
    readonly SETTLEMENT_VISIBILITY: true;
    /** Intel TDX hardware enclave — hardware root of trust */
    readonly HARDWARE_SECURITY: true;
};
/**
 * Member permission configuration
 */
interface MemberPermission {
    pubkey: PublicKey;
    flags: number;
}
/**
 * Build permission member list for a private payment
 * The customer gets full visibility; merchants get balance + log view.
 */
declare function buildPaymentPermissions(customer: PublicKey, merchant: PublicKey): MemberPermission[];
/**
 * Full private payment flow result
 */
interface PrivatePaymentResult {
    sessionId: string;
    privateReceiptPda: PublicKey;
    status: SessionStatus;
    createSignature?: string;
    delegateSignature?: string;
    processSignature?: string;
    settleSignature?: string;
}
/**
 * Privacy mode options for merchant dashboard
 */
interface PrivacyModeConfig {
    /** When true, individual transaction amounts are hidden */
    hideIndividualAmounts: boolean;
    /** When true, only show aggregate totals */
    aggregatesOnly: boolean;
    /** Allow on-demand access for specific transactions */
    allowSelectiveAccess: boolean;
}
/**
 * Generate a unique payment session ID
 */
declare function generateSessionId(): string;
/**
 * Generate a unique payout ID
 */
declare function generatePayoutId(): string;

/**
 * One-Click Payments Module
 *
 * Enables frictionless repeat payments for returning customers.
 * Customer approves a spending limit once, merchant can charge without interaction.
 */
interface SpendingApproval {
    id: string;
    customerWallet: string;
    customerEmail?: string;
    merchantWallet: string;
    spendingLimit: number;
    amountSpent: number;
    remainingLimit: number;
    expiresAt: Date;
    status: 'active' | 'expired' | 'revoked';
    createdAt: Date;
}
interface ApproveOneClickOptions {
    /** Customer's wallet address */
    customerWallet: string;
    /** Customer's email (optional, for notifications) */
    customerEmail?: string;
    /** Merchant's wallet address */
    merchantWallet: string;
    /** Maximum USDC amount the merchant can charge */
    spendingLimit: number;
    /** Days until approval expires (default: 30) */
    expiresInDays?: number;
}
interface ChargeOneClickOptions {
    /** Customer's wallet address */
    customerWallet: string;
    /** Merchant's wallet address */
    merchantWallet: string;
    /** Amount to charge in USDC */
    amount: number;
    /** Optional memo for the transaction */
    memo?: string;
}
interface OneClickResult {
    success: boolean;
    error?: string;
    txSignature?: string;
    remainingLimit?: number;
}
/**
 * One-Click Payment Client
 *
 * @example
 * ```typescript
 * import { OneClickClient } from '@settlr/sdk';
 *
 * const oneClick = new OneClickClient('https://settlr.dev');
 *
 * // Customer approves merchant
 * await oneClick.approve({
 *   customerWallet: 'Ac52MM...',
 *   merchantWallet: 'DjLFeM...',
 *   spendingLimit: 100, // $100 max
 * });
 *
 * // Merchant charges customer later (no interaction needed)
 * const result = await oneClick.charge({
 *   customerWallet: 'Ac52MM...',
 *   merchantWallet: 'DjLFeM...',
 *   amount: 25,
 * });
 * ```
 */
declare class OneClickClient {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * Customer approves a spending limit for a merchant
     */
    approve(options: ApproveOneClickOptions): Promise<{
        success: boolean;
        approval?: SpendingApproval;
    }>;
    /**
     * Check if customer has active approval for merchant
     */
    check(customerWallet: string, merchantWallet: string): Promise<{
        hasApproval: boolean;
        remainingLimit?: number;
        approval?: SpendingApproval;
    }>;
    /**
     * Merchant charges customer using their one-click approval
     * No customer interaction required if approval exists with sufficient limit
     */
    charge(options: ChargeOneClickOptions): Promise<OneClickResult>;
    /**
     * Customer revokes merchant's one-click access
     */
    revoke(customerWallet: string, merchantWallet: string): Promise<{
        success: boolean;
    }>;
}
/**
 * Create a one-click payment client
 *
 * @param baseUrl - Settlr API base URL (default: https://settlr.dev)
 */
declare function createOneClickClient(baseUrl?: string): OneClickClient;

/**
 * Mobile Game Integration Utilities
 *
 * Simple helpers for integrating Settlr payments in mobile games.
 * Works with Unity, Unreal, native iOS/Android, React Native, etc.
 *
 * The simplest integration is URL-based - just open the checkout URL
 * and listen for the callback.
 */
interface MobileCheckoutOptions {
    /** Amount in USDC */
    amount: number;
    /** Merchant wallet address */
    merchantWallet: string;
    /** Optional: Merchant display name */
    merchantName?: string;
    /** Optional: Payment description */
    memo?: string;
    /** URL to redirect after success */
    successUrl?: string;
    /** URL to redirect on cancel */
    cancelUrl?: string;
    /** Optional: Your order/transaction ID */
    orderId?: string;
    /** Optional: Customer ID for one-click */
    customerId?: string;
}
interface MobileCheckoutResult {
    success: boolean;
    signature?: string;
    orderId?: string;
    error?: string;
}
/**
 * Generate a checkout URL for mobile games
 *
 * Usage in Unity (C#):
 * ```csharp
 * string url = $"https://settlr.dev/checkout?amount={amount}&merchant={wallet}";
 * Application.OpenURL(url);
 * ```
 *
 * Usage in Swift:
 * ```swift
 * let url = "https://settlr.dev/checkout?amount=\(amount)&merchant=\(wallet)"
 * UIApplication.shared.open(URL(string: url)!)
 * ```
 */
declare function generateCheckoutUrl(options: MobileCheckoutOptions, baseUrl?: string): string;
/**
 * Generate a deep link for mobile app integration
 *
 * For apps that register a custom URL scheme (e.g., mygame://)
 * the success/cancel URLs can redirect back to the app.
 *
 * Example:
 * - successUrl: "mygame://payment-success?order=123"
 * - cancelUrl: "mygame://payment-cancel?order=123"
 */
declare function generateDeepLinkCheckout(options: MobileCheckoutOptions, appScheme: string, baseUrl?: string): string;
/**
 * Parse the callback URL when user returns to app
 *
 * Usage in Swift:
 * ```swift
 * func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
 *     if url.scheme == "mygame" && url.host == "payment-success" {
 *         let signature = URLComponents(url: url, resolvingAgainstBaseURL: true)?
 *             .queryItems?.first(where: { $0.name == "signature" })?.value
 *         // Handle success
 *     }
 * }
 * ```
 */
declare function parseCallbackUrl(url: string): MobileCheckoutResult;
/**
 * REST API endpoint info for server-side integration
 *
 * Mobile games can use these APIs directly without the SDK:
 *
 * 1. Create checkout session:
 *    POST /api/checkout/create
 *    { amount, merchantWallet, memo }
 *    → { sessionId, checkoutUrl }
 *
 * 2. Check payment status:
 *    GET /api/checkout/status?session={sessionId}
 *    → { status: 'pending' | 'completed' | 'expired', signature? }
 *
 * 3. One-click payment (for returning players):
 *    POST /api/one-click
 *    { action: 'charge', customerWallet, merchantWallet, amount }
 *    → { success, signature }
 */
declare const REST_API: {
    createSession: string;
    checkStatus: string;
    oneClick: string;
    webhook: string;
};
/**
 * Example Unity C# integration code
 * (For documentation purposes)
 */
declare const UNITY_EXAMPLE = "\n// SettlrPayment.cs - Drop into your Unity project\n\nusing UnityEngine;\nusing UnityEngine.Networking;\nusing System.Collections;\n\npublic class SettlrPayment : MonoBehaviour\n{\n    public string merchantWallet = \"YOUR_WALLET_ADDRESS\";\n    public string settlrUrl = \"https://settlr.dev\";\n    \n    // Call this to start a payment\n    public void StartPayment(float amount, string orderId, System.Action<bool, string> callback)\n    {\n        string url = $\"{settlrUrl}/checkout?amount={amount}&merchant={merchantWallet}&order_id={orderId}\";\n        \n        // Add deep link callback (register mygame:// scheme in your app)\n        url += $\"&success_url=mygame://payment-success?order={orderId}\";\n        url += $\"&cancel_url=mygame://payment-cancel?order={orderId}\";\n        \n        Application.OpenURL(url);\n        \n        // Start polling for completion\n        StartCoroutine(PollPaymentStatus(orderId, callback));\n    }\n    \n    IEnumerator PollPaymentStatus(string orderId, System.Action<bool, string> callback)\n    {\n        string statusUrl = $\"{settlrUrl}/api/checkout/status?order_id={orderId}\";\n        \n        for (int i = 0; i < 60; i++) // Poll for 5 minutes\n        {\n            using (UnityWebRequest request = UnityWebRequest.Get(statusUrl))\n            {\n                yield return request.SendWebRequest();\n                \n                if (request.result == UnityWebRequest.Result.Success)\n                {\n                    var response = JsonUtility.FromJson<PaymentStatusResponse>(request.downloadHandler.text);\n                    \n                    if (response.status == \"completed\")\n                    {\n                        callback(true, response.signature);\n                        yield break;\n                    }\n                    else if (response.status == \"expired\" || response.status == \"cancelled\")\n                    {\n                        callback(false, null);\n                        yield break;\n                    }\n                }\n            }\n            \n            yield return new WaitForSeconds(5f); // Check every 5 seconds\n        }\n        \n        callback(false, \"Timeout\");\n    }\n    \n    [System.Serializable]\n    class PaymentStatusResponse\n    {\n        public string status;\n        public string signature;\n    }\n}\n";
/**
 * Example React Native integration
 */
declare const REACT_NATIVE_EXAMPLE = "\n// SettlrPayment.tsx - React Native component\n\nimport { Linking, Alert } from 'react-native';\nimport { useEffect } from 'react';\n\nconst SETTLR_URL = 'https://settlr.dev';\nconst APP_SCHEME = 'mygame';\n\nexport function useSettlrPayment(onSuccess: (sig: string) => void) {\n  useEffect(() => {\n    const handleDeepLink = ({ url }: { url: string }) => {\n      if (url.includes('payment-success')) {\n        const sig = new URL(url).searchParams.get('signature');\n        if (sig) onSuccess(sig);\n      }\n    };\n    \n    Linking.addEventListener('url', handleDeepLink);\n    return () => Linking.removeAllListeners('url');\n  }, [onSuccess]);\n  \n  const startPayment = async (amount: number, merchantWallet: string) => {\n    const orderId = `order_${Date.now()}`;\n    const url = `${SETTLR_URL}/checkout?amount=${amount}&merchant=${merchantWallet}` +\n      `&success_url=${APP_SCHEME}://payment-success?order=${orderId}` +\n      `&cancel_url=${APP_SCHEME}://payment-cancel?order=${orderId}`;\n    \n    await Linking.openURL(url);\n  };\n  \n  return { startPayment };\n}\n";

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

interface SubscriptionClientConfig {
    /** Settlr API key */
    apiKey: string;
    /** Base URL of your Settlr instance (default: https://settlr.dev) */
    baseUrl?: string;
    /** Merchant ID (resolved from API key if not provided) */
    merchantId?: string;
    /** Merchant wallet address */
    merchantWallet?: string;
}
interface CreatePlanOptions {
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
interface UpdatePlanOptions {
    name?: string;
    description?: string;
    amount?: number;
    active?: boolean;
    features?: string[];
}
interface SubscribeOptions {
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
interface ListSubscriptionsOptions {
    /** Filter by status */
    status?: SubscriptionStatus;
    /** Filter by customer wallet */
    customerWallet?: string;
    /** Filter by plan */
    planId?: string;
}
interface SubscriptionPayment {
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
interface SubscriptionDetail extends Subscription {
    plan: SubscriptionPlan;
    payments?: SubscriptionPayment[];
}
declare class SubscriptionClient {
    private apiKey;
    private baseUrl;
    private merchantId?;
    private merchantWallet?;
    constructor(config: SubscriptionClientConfig);
    private fetch;
    /**
     * Resolve merchant ID from API key
     */
    private ensureMerchantId;
    /**
     * Create a subscription plan
     */
    createPlan(options: CreatePlanOptions): Promise<SubscriptionPlan>;
    /**
     * List all plans for the merchant
     */
    listPlans(): Promise<SubscriptionPlan[]>;
    /**
     * Update a plan
     */
    updatePlan(planId: string, options: UpdatePlanOptions): Promise<SubscriptionPlan>;
    /**
     * Deactivate a plan (stops new subscriptions)
     */
    deactivatePlan(planId: string): Promise<void>;
    /**
     * Subscribe a customer to a plan
     */
    subscribe(options: SubscribeOptions): Promise<{
        subscription: Subscription;
        payment?: {
            id: string;
            amount: number;
            signature: string;
        };
        message: string;
    }>;
    /**
     * List subscriptions
     */
    listSubscriptions(options?: ListSubscriptionsOptions): Promise<Subscription[]>;
    /**
     * Get subscription details including payment history
     */
    getSubscription(subscriptionId: string): Promise<SubscriptionDetail>;
    /**
     * Cancel a subscription
     * @param immediately - If true, cancels now. If false (default), cancels at end of billing period.
     */
    cancel(subscriptionId: string, immediately?: boolean): Promise<{
        success: boolean;
        message: string;
        cancelAt?: string;
    }>;
    /**
     * Pause a subscription (stops billing, preserves subscription)
     */
    pause(subscriptionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Resume a paused subscription
     */
    resume(subscriptionId: string): Promise<{
        success: boolean;
        message: string;
        nextCharge?: string;
    }>;
    /**
     * Manually charge a subscription (useful for metered billing)
     */
    charge(subscriptionId: string): Promise<{
        success: boolean;
        payment?: {
            id: string;
            amount: number;
            signature: string;
        };
    }>;
}
/**
 * Factory function to create a SubscriptionClient
 */
declare function createSubscriptionClient(config: SubscriptionClientConfig): SubscriptionClient;

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
type PayoutStatus = "pending" | "funded" | "sent" | "claimed" | "expired" | "failed";
interface CreatePayoutOptions {
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
interface PayoutRecord {
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
interface PayoutBatchResult {
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
interface ListPayoutsOptions {
    /** Filter by status */
    status?: PayoutStatus;
    /** Max results (default 20, max 100) */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}
interface ListPayoutsResult {
    data: PayoutRecord[];
    count: number;
    limit: number;
    offset: number;
}
interface PayoutClientConfig {
    /** Settlr API key */
    apiKey: string;
    /** Base URL of your Settlr instance (default: https://settlr.dev) */
    baseUrl?: string;
}
declare class PayoutClient {
    private apiKey;
    private baseUrl;
    constructor(config: PayoutClientConfig);
    private fetch;
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
    create(options: CreatePayoutOptions): Promise<PayoutRecord>;
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
    createBatch(payoutsList: Array<{
        email: string;
        amount: number;
        memo?: string;
        metadata?: Record<string, string>;
    }>): Promise<PayoutBatchResult>;
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
    get(id: string): Promise<PayoutRecord>;
    /**
     * List payouts for the authenticated merchant.
     *
     * @example
     * ```typescript
     * const result = await payouts.list({ status: 'claimed', limit: 50 });
     * result.data.forEach(p => console.log(p.email, p.amount, p.status));
     * ```
     */
    list(options?: ListPayoutsOptions): Promise<ListPayoutsResult>;
}
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
declare function createPayoutClient(config: PayoutClientConfig): PayoutClient;

export { type ApproveOneClickOptions, BuyButton, type BuyButtonProps, type ChargeOneClickOptions, CheckoutWidget, type CheckoutWidgetProps, type CreatePaymentOptions, type CreatePayoutOptions, type CreatePlanOptions, type CreateSubscriptionOptions, DELEGATION_PROGRAM_ID, ER_ENDPOINTS, type ListPayoutsOptions, type ListPayoutsResult, type ListSubscriptionsOptions, MAGIC_ROUTER_DEVNET, type MemberPermission, type MerchantConfig, type MobileCheckoutOptions, type MobileCheckoutResult, OneClickClient, type OneClickResult, PERMISSION_PROGRAM_ID, PER_ENDPOINT, PER_WS_ENDPOINT, type Payment, PaymentModal, type PaymentModalProps, type PaymentResult, type PaymentStatus, type Payout, type PayoutBatch, type PayoutBatchResult, PayoutClient, type PayoutClientConfig, type PayoutRecord, type PayoutStatus$1 as PayoutStatus, PrivacyFeatures, type PrivacyModeConfig, type PrivatePaymentConfig, type PrivatePaymentResult, REACT_NATIVE_EXAMPLE, REST_API, SETTLR_CHECKOUT_URL, SETTLR_PROGRAM_ID, SUPPORTED_NETWORKS, SUPPORTED_TOKENS, SessionStatus, Settlr, type SettlrConfig, SettlrProvider, type SpendingApproval, type SubscribeOptions, type Subscription, SubscriptionClient, type SubscriptionClientConfig, type SubscriptionDetail, type SubscriptionInterval, type SubscriptionPayment, type SubscriptionPlan, type SubscriptionStatus, type SupportedToken, TEE_VALIDATOR, type TransactionOptions, UNITY_EXAMPLE, USDC_MINT_DEVNET, USDC_MINT_MAINNET, USDT_MINT_DEVNET, USDT_MINT_MAINNET, type UpdatePlanOptions, type WebhookEventType, type WebhookHandler, type WebhookHandlers, type WebhookPayload, buildDelegateAccounts, buildPaymentPermissions, buildPrivatePaymentAccounts, createBaseConnection, createOneClickClient, createPERConnection, createPayoutClient, createSubscriptionClient, createWebhookHandler, findDelegationBufferPda, findDelegationMetadataPda, findDelegationRecordPda, findPrivateReceiptPda, formatUSDC, generateCheckoutUrl, generateDeepLinkCheckout, generatePayoutId, generateSessionId, getTokenDecimals, getTokenMint, parseCallbackUrl, parseUSDC, parseWebhookPayload, shortenAddress, usePaymentLink, usePaymentModal, useSettlr, verifyWebhookSignature };
