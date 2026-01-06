import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    TokenAccountNotFoundError,
} from '@solana/spl-token';

import {
    USDC_MINT_DEVNET,
    USDC_MINT_MAINNET,
    SETTLR_CHECKOUT_URL,
    SETTLR_API_URL,
    DEFAULT_RPC_ENDPOINTS,
    type SupportedNetwork,
} from './constants';
import type {
    CreatePaymentOptions,
    Payment,
    PaymentResult,
    MerchantConfig,
    TransactionOptions,
} from './types';
import {
    parseUSDC,
    generatePaymentId,
    isValidSolanaAddress,
    retry,
} from './utils';

/**
 * Settlr SDK configuration
 */
export interface SettlrConfig {
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
 * API key validation response
 */
interface ApiKeyValidation {
    valid: boolean;
    merchantId?: string;
    merchantWallet?: string;
    merchantName?: string;
    tier?: 'free' | 'pro' | 'enterprise';
    rateLimit?: number;
    error?: string;
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
export class Settlr {
    private config: Required<Omit<SettlrConfig, 'apiKey'>> & { apiKey: string };
    private connection: Connection;
    private usdcMint: PublicKey;
    private merchantWallet: PublicKey | null;
    private merchantWalletFromValidation?: string;
    private apiBaseUrl: string;
    private validated: boolean = false;
    private merchantId?: string;
    private tier?: 'free' | 'pro' | 'enterprise';

    constructor(config: SettlrConfig) {
        // API key is required
        if (!config.apiKey) {
            throw new Error('API key is required. Get one at https://settlr.dev/dashboard');
        }

        // Wallet address is optional - can be fetched from API validation
        let walletAddress: string | undefined;
        if (config.merchant.walletAddress) {
            walletAddress = typeof config.merchant.walletAddress === 'string'
                ? config.merchant.walletAddress
                : config.merchant.walletAddress.toBase58();

            if (!isValidSolanaAddress(walletAddress)) {
                throw new Error('Invalid merchant wallet address');
            }
        }

        const network = config.network ?? 'devnet';
        const testMode = config.testMode ?? (network === 'devnet');

        this.config = {
            merchant: {
                ...config.merchant,
                walletAddress: walletAddress || '',
            },
            apiKey: config.apiKey,
            network,
            rpcEndpoint: config.rpcEndpoint ?? DEFAULT_RPC_ENDPOINTS[network],
            testMode,
        };

        this.apiBaseUrl = testMode ? SETTLR_API_URL.development : SETTLR_API_URL.production;
        this.connection = new Connection(this.config.rpcEndpoint, 'confirmed');
        this.usdcMint = network === 'devnet' ? USDC_MINT_DEVNET : USDC_MINT_MAINNET;
        this.merchantWallet = walletAddress ? new PublicKey(walletAddress) : null;
    }

    /**
     * Validate API key with Settlr backend
     */
    private async validateApiKey(): Promise<void> {
        if (this.validated) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/sdk/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.config.apiKey,
                },
                body: JSON.stringify({
                    walletAddress: this.config.merchant.walletAddress || undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Invalid API key' }));
                throw new Error(error.error || 'API key validation failed');
            }

            const data: ApiKeyValidation = await response.json();

            if (!data.valid) {
                throw new Error(data.error || 'Invalid API key');
            }

            this.validated = true;
            this.merchantId = data.merchantId;
            this.tier = data.tier;

            // Update merchant wallet from server if not provided in config
            if (data.merchantWallet && !this.merchantWallet) {
                this.merchantWallet = new PublicKey(data.merchantWallet);
                this.config.merchant.walletAddress = data.merchantWallet;
            }

            // Update merchant name from server if available
            if (data.merchantName && !this.config.merchant.name) {
                this.config.merchant.name = data.merchantName;
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('fetch')) {
                // Network error - allow offline/dev mode for test keys
                if (this.config.apiKey.startsWith('sk_test_')) {
                    this.validated = true;
                    this.tier = 'free';
                    return;
                }
            }
            throw error;
        }
    }

    /**
     * Get the current tier
     */
    getTier(): 'free' | 'pro' | 'enterprise' | undefined {
        return this.tier;
    }

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
    }): string {
        const { amount, memo, orderId, successUrl, cancelUrl } = options;

        // Get wallet from config or from API validation
        const walletAddress = this.config.merchant.walletAddress?.toString() || this.merchantWalletFromValidation;
        if (!walletAddress) {
            throw new Error('Wallet address not available. Either provide walletAddress in config or call validateApiKey() first.');
        }

        const baseUrl = this.config.testMode
            ? SETTLR_CHECKOUT_URL.development
            : SETTLR_CHECKOUT_URL.production;

        const params = new URLSearchParams({
            amount: amount.toString(),
            merchant: this.config.merchant.name,
            to: walletAddress,
        });

        if (memo) params.set('memo', memo);
        if (orderId) params.set('orderId', orderId);
        if (successUrl) params.set('successUrl', successUrl);
        if (cancelUrl) params.set('cancelUrl', cancelUrl);

        return `${baseUrl}?${params.toString()}`;
    }

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
    async createPayment(options: CreatePaymentOptions): Promise<Payment> {
        // Validate API key before any operation - this also fetches merchant wallet if not in config
        await this.validateApiKey();

        const { amount, memo, orderId, metadata, successUrl, cancelUrl, expiresIn = 3600 } = options;

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        // Get wallet from config or from API validation
        const walletAddress = this.config.merchant.walletAddress?.toString() || this.merchantWalletFromValidation;
        if (!walletAddress) {
            throw new Error('Wallet address not available. Ensure your API key is linked to a merchant with a wallet.');
        }

        const paymentId = generatePaymentId();
        const amountLamports = parseUSDC(amount);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + expiresIn * 1000);

        // Build checkout URL
        const baseUrl = this.config.testMode
            ? SETTLR_CHECKOUT_URL.development
            : SETTLR_CHECKOUT_URL.production;

        const params = new URLSearchParams({
            amount: amount.toString(),
            merchant: this.config.merchant.name,
            to: walletAddress,
        });

        if (memo) params.set('memo', memo);
        if (orderId) params.set('orderId', orderId);
        if (successUrl) params.set('success', successUrl);
        if (cancelUrl) params.set('cancel', cancelUrl);
        if (paymentId) params.set('paymentId', paymentId);

        const checkoutUrl = `${baseUrl}?${params.toString()}`;

        // Generate QR code (simple data URL for now)
        const qrCode = await this.generateQRCode(checkoutUrl);

        const payment: Payment = {
            id: paymentId,
            amount,
            token: 'USDC', // Default to USDC
            amountLamports,
            status: 'pending',
            merchantAddress: walletAddress,
            checkoutUrl,
            qrCode,
            memo,
            orderId,
            metadata,
            createdAt,
            expiresAt,
        };

        return payment;
    }

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
    async buildTransaction(options: {
        payerPublicKey: PublicKey;
        amount: number;
        memo?: string;
    }): Promise<Transaction> {
        // Validate API key before any operation
        await this.validateApiKey();

        // Get merchant wallet - from config or from validation
        const merchantWallet = this.getMerchantWallet();
        if (!merchantWallet) {
            throw new Error('Wallet address not available. Ensure your API key is linked to a merchant with a wallet.');
        }

        const { payerPublicKey, amount, memo } = options;
        const amountLamports = parseUSDC(amount);

        // Get ATAs
        const payerAta = await getAssociatedTokenAddress(this.usdcMint, payerPublicKey);
        const merchantAta = await getAssociatedTokenAddress(this.usdcMint, merchantWallet);

        const instructions: TransactionInstruction[] = [];

        // Check if merchant ATA exists, create if not
        try {
            await getAccount(this.connection, merchantAta);
        } catch (error) {
            if (error instanceof TokenAccountNotFoundError) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(
                        payerPublicKey,
                        merchantAta,
                        merchantWallet,
                        this.usdcMint
                    )
                );
            } else {
                throw error;
            }
        }

        // Add transfer instruction
        instructions.push(
            createTransferInstruction(
                payerAta,
                merchantAta,
                payerPublicKey,
                BigInt(amountLamports)
            )
        );

        // Add memo if provided
        if (memo) {
            const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
            instructions.push(
                new TransactionInstruction({
                    keys: [{ pubkey: payerPublicKey, isSigner: true, isWritable: false }],
                    programId: MEMO_PROGRAM_ID,
                    data: Buffer.from(memo, 'utf-8'),
                })
            );
        }

        // Build transaction
        const { blockhash } = await this.connection.getLatestBlockhash();
        const transaction = new Transaction();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = payerPublicKey;

        transaction.add(...instructions);

        return transaction;
    }

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
    async pay(options: {
        wallet: {
            publicKey: PublicKey;
            signTransaction: (tx: Transaction) => Promise<Transaction>;
        };
        amount: number;
        memo?: string;
        txOptions?: TransactionOptions;
    }): Promise<PaymentResult> {
        const { wallet, amount, memo, txOptions } = options;

        try {
            // Build transaction
            const transaction = await this.buildTransaction({
                payerPublicKey: wallet.publicKey,
                amount,
                memo,
            });

            // Sign transaction
            const signedTx = await wallet.signTransaction(transaction);

            // Send transaction
            const signature = await retry(
                () => this.connection.sendRawTransaction(signedTx.serialize(), {
                    skipPreflight: txOptions?.skipPreflight ?? false,
                    preflightCommitment: txOptions?.commitment ?? 'confirmed',
                    maxRetries: txOptions?.maxRetries ?? 3,
                }),
                3
            );

            // Confirm transaction
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            await this.connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature,
            });

            const merchantWallet = this.getMerchantWallet();
            return {
                success: true,
                signature,
                amount,
                merchantAddress: merchantWallet?.toBase58() || '',
            };
        } catch (error) {
            const merchantWallet = this.getMerchantWallet();
            return {
                success: false,
                signature: '',
                amount,
                merchantAddress: merchantWallet?.toBase58() || '',
                error: error instanceof Error ? error.message : 'Payment failed',
            };
        }
    }

    /**
     * Check payment status by transaction signature
     */
    async getPaymentStatus(signature: string): Promise<'pending' | 'completed' | 'failed'> {
        try {
            const status = await this.connection.getSignatureStatus(signature);

            if (!status.value) {
                return 'pending';
            }

            if (status.value.err) {
                return 'failed';
            }

            if (status.value.confirmationStatus === 'confirmed' ||
                status.value.confirmationStatus === 'finalized') {
                return 'completed';
            }

            return 'pending';
        } catch {
            return 'failed';
        }
    }

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
    async createCheckoutSession(options: {
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
    }> {
        const { amount, description, metadata, successUrl, cancelUrl, webhookUrl } = options;

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const baseUrl = this.config.testMode
            ? 'http://localhost:3000'
            : 'https://settlr.dev';

        const response = await fetch(`${baseUrl}/api/checkout/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
            },
            body: JSON.stringify({
                merchantId: this.config.merchant.name.toLowerCase().replace(/\s+/g, '-'),
                merchantName: this.config.merchant.name,
                merchantWallet: this.config.merchant.walletAddress,
                amount,
                description,
                metadata,
                successUrl,
                cancelUrl,
                webhookUrl,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || 'Failed to create checkout session');
        }

        return response.json();
    }

    /**
     * Get merchant's USDC balance
     */
    async getMerchantBalance(): Promise<number> {
        try {
            const merchantWallet = this.getMerchantWallet();
            if (!merchantWallet) {
                throw new Error('Merchant wallet not available');
            }
            const ata = await getAssociatedTokenAddress(this.usdcMint, merchantWallet);
            const account = await getAccount(this.connection, ata);
            return Number(account.amount) / 1_000_000;
        } catch {
            return 0;
        }
    }

    /**
     * Generate QR code for payment URL
     */
    private async generateQRCode(url: string): Promise<string> {
        // Simple QR code placeholder - in production, use a proper QR library
        // For now, return a data URL that represents the URL
        const encoded = encodeURIComponent(url);
        return `data:image/svg+xml,${encoded}`;
    }

    /**
     * Get the connection instance
     */
    getConnection(): Connection {
        return this.connection;
    }

    /**
     * Get merchant wallet - from config or from API validation
     * @internal
     */
    private getMerchantWallet(): PublicKey | null {
        if (this.merchantWallet) {
            return this.merchantWallet;
        }
        if (this.merchantWalletFromValidation) {
            return new PublicKey(this.merchantWalletFromValidation);
        }
        return null;
    }

    /**
     * Get merchant wallet address
     */
    getMerchantAddress(): PublicKey | null {
        return this.getMerchantWallet();
    }

    /**
     * Get USDC mint address
     */
    getUsdcMint(): PublicKey {
        return this.usdcMint;
    }
}
