/**
 * Octane Relay Configuration
 * 
 * This configuration defines which tokens the relay accepts for fees
 * and how much SOL-equivalent they're worth.
 */

export interface TokenConfig {
    mint: string;
    symbol: string;
    decimals: number;
    /** Fee in token atomic units per signature */
    fee: number;
}

export interface OctaneConfig {
    /** RPC endpoint */
    rpcEndpoint: string;

    /** Fee payer public key (derived from FEE_PAYER_SECRET) */
    feePayer: string;

    /** Supported tokens for fee payment */
    tokens: TokenConfig[];

    /** Rate limit: max requests per minute per IP */
    rateLimit: number;
}

// USDC on Devnet
export const USDC_DEVNET: TokenConfig = {
    mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    symbol: 'USDC',
    decimals: 6,
    fee: 10000, // 0.01 USDC per signature
};

// USDC on Mainnet
export const USDC_MAINNET: TokenConfig = {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    decimals: 6,
    fee: 5000, // 0.005 USDC per signature (cheaper on mainnet)
};

export function getConfig(): Omit<OctaneConfig, 'feePayer'> {
    const isMainnet = process.env.SOLANA_NETWORK === 'mainnet-beta';

    return {
        rpcEndpoint: process.env.SOLANA_RPC_URL || (
            isMainnet
                ? 'https://api.mainnet-beta.solana.com'
                : 'https://api.devnet.solana.com'
        ),
        tokens: [isMainnet ? USDC_MAINNET : USDC_DEVNET],
        rateLimit: parseInt(process.env.RATE_LIMIT || '60', 10),
    };
}
