/**
 * Range Security Integration
 * 
 * Wallet risk screening to block bad actors and ensure compliance.
 * Screens wallets for sanctions, fraud, and illicit activity before processing payments.
 * 
 * @see https://www.range.org/
 */

import { PublicKey } from '@solana/web3.js';

// Range API endpoint
const RANGE_API_URL = process.env.RANGE_API_URL || 'https://api.range.org/v1';
const RANGE_API_KEY = process.env.RANGE_API_KEY || '';

/**
 * Risk levels returned by Range screening
 */
export enum RiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    SEVERE = 'severe',
    UNKNOWN = 'unknown',
}

/**
 * Risk categories for wallet screening
 */
export enum RiskCategory {
    SANCTIONS = 'sanctions',
    FRAUD = 'fraud',
    MIXER = 'mixer',
    DARKNET = 'darknet',
    RANSOMWARE = 'ransomware',
    STOLEN_FUNDS = 'stolen_funds',
    TERRORISM = 'terrorism',
    SCAM = 'scam',
    GAMBLING = 'gambling',
    CLEAN = 'clean',
}

/**
 * Result of wallet risk screening
 */
export interface WalletRiskResult {
    /** The wallet address that was screened */
    address: string;

    /** Overall risk level */
    riskLevel: RiskLevel;

    /** Risk score from 0-100 (100 = highest risk) */
    riskScore: number;

    /** Specific risk categories detected */
    categories: RiskCategory[];

    /** Whether the wallet is on a sanctions list (OFAC, etc) */
    isSanctioned: boolean;

    /** Human-readable risk summary */
    summary: string;

    /** Timestamp of the screening */
    screenedAt: Date;

    /** Whether to block this transaction */
    shouldBlock: boolean;

    /** Raw response from Range API (for debugging) */
    raw?: any;
}

/**
 * Configuration for Range screening
 */
export interface RangeConfig {
    /** API key for Range */
    apiKey?: string;

    /** API endpoint */
    apiUrl?: string;

    /** Minimum risk score to block (default: 70) */
    blockThreshold?: number;

    /** Whether to block sanctioned addresses regardless of score */
    alwaysBlockSanctioned?: boolean;

    /** Enable test mode (returns mock data) */
    testMode?: boolean;
}

/**
 * Default risk thresholds
 */
const DEFAULT_BLOCK_THRESHOLD = 70;
const DEFAULT_ALWAYS_BLOCK_SANCTIONED = true;

/**
 * Screen a wallet for risk before processing payment
 * 
 * @param address - Solana wallet address to screen
 * @param config - Range configuration options
 * @returns Wallet risk assessment result
 * 
 * @example
 * ```typescript
 * const result = await screenWallet('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
 * if (result.shouldBlock) {
 *   throw new Error(`Transaction blocked: ${result.summary}`);
 * }
 * ```
 */
export async function screenWallet(
    address: string | PublicKey,
    config: RangeConfig = {}
): Promise<WalletRiskResult> {
    const addressStr = typeof address === 'string' ? address : address.toBase58();
    const apiKey = config.apiKey || RANGE_API_KEY;
    const apiUrl = config.apiUrl || RANGE_API_URL;
    const blockThreshold = config.blockThreshold ?? DEFAULT_BLOCK_THRESHOLD;
    const alwaysBlockSanctioned = config.alwaysBlockSanctioned ?? DEFAULT_ALWAYS_BLOCK_SANCTIONED;

    // Test mode - return mock data for development/testing
    if (config.testMode || !apiKey) {
        return getMockRiskResult(addressStr, blockThreshold, alwaysBlockSanctioned);
    }

    try {
        const response = await fetch(`${apiUrl}/screen/solana`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Key': apiKey,
            },
            body: JSON.stringify({
                address: addressStr,
                chain: 'solana',
            }),
        });

        if (!response.ok) {
            console.error('[Range] API error:', response.status, response.statusText);
            // Fail open in case of API errors (configurable)
            return getFailOpenResult(addressStr);
        }

        const data = await response.json();
        return parseRangeResponse(data, addressStr, blockThreshold, alwaysBlockSanctioned);
    } catch (error) {
        console.error('[Range] Screening failed:', error);
        // Fail open on network errors
        return getFailOpenResult(addressStr);
    }
}

/**
 * Screen multiple wallets in batch
 * 
 * @param addresses - Array of wallet addresses to screen
 * @param config - Range configuration
 * @returns Array of risk results
 */
export async function screenWalletsBatch(
    addresses: (string | PublicKey)[],
    config: RangeConfig = {}
): Promise<WalletRiskResult[]> {
    // For now, screen in parallel with individual calls
    // Range may offer a batch endpoint in the future
    const results = await Promise.all(
        addresses.map(addr => screenWallet(addr, config))
    );
    return results;
}

/**
 * Quick check if a wallet should be blocked
 * 
 * @param address - Wallet address to check
 * @param config - Range configuration
 * @returns true if wallet should be blocked
 */
export async function isWalletBlocked(
    address: string | PublicKey,
    config: RangeConfig = {}
): Promise<boolean> {
    const result = await screenWallet(address, config);
    return result.shouldBlock;
}

/**
 * Check if wallet is on sanctions list (OFAC, etc)
 * 
 * @param address - Wallet address to check
 * @param config - Range configuration
 * @returns true if sanctioned
 */
export async function isSanctioned(
    address: string | PublicKey,
    config: RangeConfig = {}
): Promise<boolean> {
    const result = await screenWallet(address, config);
    return result.isSanctioned;
}

/**
 * Parse Range API response into our standardized format
 */
function parseRangeResponse(
    data: any,
    address: string,
    blockThreshold: number,
    alwaysBlockSanctioned: boolean
): WalletRiskResult {
    const riskScore = data.risk_score ?? data.riskScore ?? 0;
    const isSanctioned = data.is_sanctioned ?? data.sanctioned ?? data.ofac ?? false;
    const categories = parseCategories(data.categories || data.labels || []);

    const riskLevel = getRiskLevel(riskScore);
    const shouldBlock =
        riskScore >= blockThreshold ||
        (alwaysBlockSanctioned && isSanctioned);

    return {
        address,
        riskLevel,
        riskScore,
        categories,
        isSanctioned,
        summary: generateSummary(riskLevel, categories, isSanctioned),
        screenedAt: new Date(),
        shouldBlock,
        raw: data,
    };
}

/**
 * Parse risk categories from API response
 */
function parseCategories(rawCategories: string[]): RiskCategory[] {
    const categoryMap: Record<string, RiskCategory> = {
        'sanctions': RiskCategory.SANCTIONS,
        'ofac': RiskCategory.SANCTIONS,
        'fraud': RiskCategory.FRAUD,
        'mixer': RiskCategory.MIXER,
        'tornado': RiskCategory.MIXER,
        'darknet': RiskCategory.DARKNET,
        'ransomware': RiskCategory.RANSOMWARE,
        'stolen': RiskCategory.STOLEN_FUNDS,
        'theft': RiskCategory.STOLEN_FUNDS,
        'terrorism': RiskCategory.TERRORISM,
        'scam': RiskCategory.SCAM,
        'phishing': RiskCategory.SCAM,
        'gambling': RiskCategory.GAMBLING,
    };

    const categories: RiskCategory[] = [];
    for (const raw of rawCategories) {
        const normalized = raw.toLowerCase();
        for (const [key, category] of Object.entries(categoryMap)) {
            if (normalized.includes(key)) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            }
        }
    }

    if (categories.length === 0) {
        categories.push(RiskCategory.CLEAN);
    }

    return categories;
}

/**
 * Convert numeric risk score to risk level
 */
function getRiskLevel(score: number): RiskLevel {
    if (score >= 90) return RiskLevel.SEVERE;
    if (score >= 70) return RiskLevel.HIGH;
    if (score >= 40) return RiskLevel.MEDIUM;
    if (score >= 0) return RiskLevel.LOW;
    return RiskLevel.UNKNOWN;
}

/**
 * Generate human-readable risk summary
 */
function generateSummary(
    level: RiskLevel,
    categories: RiskCategory[],
    isSanctioned: boolean
): string {
    if (isSanctioned) {
        return 'Wallet is on a sanctions list (OFAC/SDN). Transaction blocked.';
    }

    if (level === RiskLevel.SEVERE) {
        return `Severe risk detected: ${categories.join(', ')}. Transaction blocked.`;
    }

    if (level === RiskLevel.HIGH) {
        return `High risk wallet: ${categories.join(', ')}. Transaction blocked.`;
    }

    if (level === RiskLevel.MEDIUM) {
        return `Medium risk wallet: ${categories.join(', ')}. Proceed with caution.`;
    }

    if (categories.includes(RiskCategory.CLEAN)) {
        return 'Wallet passed risk screening. No issues detected.';
    }

    return `Low risk wallet. Minor flags: ${categories.join(', ')}.`;
}

/**
 * Return mock risk result for testing/development
 */
function getMockRiskResult(
    address: string,
    blockThreshold: number,
    alwaysBlockSanctioned: boolean
): WalletRiskResult {
    // Simulate known bad addresses for testing
    const knownBadAddresses: Record<string, Partial<WalletRiskResult>> = {
        // Simulated sanctioned address
        'BadActor111111111111111111111111111111111111': {
            riskScore: 100,
            riskLevel: RiskLevel.SEVERE,
            categories: [RiskCategory.SANCTIONS],
            isSanctioned: true,
        },
        // Simulated mixer address
        'Mixer22222222222222222222222222222222222222': {
            riskScore: 75,
            riskLevel: RiskLevel.HIGH,
            categories: [RiskCategory.MIXER],
            isSanctioned: false,
        },
        // Simulated scam address
        'Scammer333333333333333333333333333333333333': {
            riskScore: 85,
            riskLevel: RiskLevel.HIGH,
            categories: [RiskCategory.SCAM, RiskCategory.FRAUD],
            isSanctioned: false,
        },
    };

    const badResult = knownBadAddresses[address];
    if (badResult) {
        const riskScore = badResult.riskScore ?? 80;
        const isSanctioned = badResult.isSanctioned ?? false;
        const shouldBlock =
            riskScore >= blockThreshold ||
            (alwaysBlockSanctioned && isSanctioned);

        return {
            address,
            riskLevel: badResult.riskLevel ?? RiskLevel.HIGH,
            riskScore,
            categories: badResult.categories ?? [RiskCategory.FRAUD],
            isSanctioned,
            summary: generateSummary(
                badResult.riskLevel ?? RiskLevel.HIGH,
                badResult.categories ?? [],
                isSanctioned
            ),
            screenedAt: new Date(),
            shouldBlock,
        };
    }

    // Default: clean wallet
    return {
        address,
        riskLevel: RiskLevel.LOW,
        riskScore: 0,
        categories: [RiskCategory.CLEAN],
        isSanctioned: false,
        summary: 'Wallet passed risk screening. No issues detected.',
        screenedAt: new Date(),
        shouldBlock: false,
    };
}

/**
 * Fail-open result when API is unavailable
 * In production, you may want to fail-closed instead
 */
function getFailOpenResult(address: string): WalletRiskResult {
    console.warn('[Range] API unavailable, failing open for:', address);
    return {
        address,
        riskLevel: RiskLevel.UNKNOWN,
        riskScore: -1,
        categories: [],
        isSanctioned: false,
        summary: 'Risk screening unavailable. Proceeding with caution.',
        screenedAt: new Date(),
        shouldBlock: false, // Fail open - change to true for fail-closed
    };
}

/**
 * Range Security middleware for payment processing
 * Use this to screen both payer and merchant before processing
 */
export async function screenPaymentParties(
    payerAddress: string | PublicKey,
    merchantAddress: string | PublicKey,
    config: RangeConfig = {}
): Promise<{
    payer: WalletRiskResult;
    merchant: WalletRiskResult;
    canProceed: boolean;
    blockedParty?: 'payer' | 'merchant' | 'both';
}> {
    const [payer, merchant] = await screenWalletsBatch(
        [payerAddress, merchantAddress],
        config
    );

    const payerBlocked = payer.shouldBlock;
    const merchantBlocked = merchant.shouldBlock;

    let blockedParty: 'payer' | 'merchant' | 'both' | undefined;
    if (payerBlocked && merchantBlocked) {
        blockedParty = 'both';
    } else if (payerBlocked) {
        blockedParty = 'payer';
    } else if (merchantBlocked) {
        blockedParty = 'merchant';
    }

    return {
        payer,
        merchant,
        canProceed: !payerBlocked && !merchantBlocked,
        blockedParty,
    };
}
