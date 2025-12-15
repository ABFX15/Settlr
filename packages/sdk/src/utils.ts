import { USDC_DECIMALS } from './constants';

/**
 * Format lamports to USDC string
 * @param lamports - Amount in lamports (atomic units)
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatUSDC(lamports: bigint | number, decimals: number = 2): string {
    const amount = Number(lamports) / Math.pow(10, USDC_DECIMALS);
    return amount.toFixed(decimals);
}

/**
 * Parse USDC amount to lamports
 * @param amount - Amount in USDC (e.g., 29.99)
 */
export function parseUSDC(amount: number | string): bigint {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return BigInt(Math.round(num * Math.pow(10, USDC_DECIMALS)));
}

/**
 * Shorten a Solana address for display
 * @param address - Full address string
 * @param chars - Number of chars to show on each end (default: 4)
 */
export function shortenAddress(address: string, chars: number = 4): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Generate a unique payment ID
 */
export function generatePaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `pay_${timestamp}${random}`;
}

/**
 * Validate a Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
    try {
        // Basic validation: 32-44 chars, base58
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return base58Regex.test(address);
    } catch {
        return false;
    }
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                await sleep(baseDelay * Math.pow(2, i));
            }
        }
    }

    throw lastError;
}
