/**
 * @settlr/sdk
 * Solana USDC payments in 7 lines of code
 */

// Core client
export { Settlr, type SettlrConfig } from './client';

// Types
export type {
    CreatePaymentOptions,
    Payment,
    PaymentStatus,
    PaymentResult,
    MerchantConfig,
    TransactionOptions,
} from './types';

// Constants
export {
    USDC_MINT_DEVNET,
    USDC_MINT_MAINNET,
    SETTLR_CHECKOUT_URL,
    SUPPORTED_NETWORKS,
} from './constants';

// Utilities
export { formatUSDC, parseUSDC, shortenAddress } from './utils';

// React hook (optional peer dependency)
export { useSettlr, SettlrProvider } from './react';
