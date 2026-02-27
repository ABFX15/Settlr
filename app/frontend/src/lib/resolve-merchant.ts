/**
 * Shared utility for resolving merchant IDs across API routes.
 * 
 * Many dashboard pages pass `publicKey` (a Solana wallet address) as `merchantId`.
 * This utility resolves wallet addresses to Supabase UUIDs transparently.
 */
import { getOrCreateMerchantByWallet } from "@/lib/db";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a merchantId that may be either a UUID or a Solana wallet address.
 * If it's a wallet address, looks up (or creates) the merchant record and returns the UUID.
 */
export async function resolveMerchantId(merchantId: string): Promise<string> {
    if (UUID_REGEX.test(merchantId)) return merchantId;

    // Treat as a Solana wallet address → resolve to merchant UUID
    const merchant = await getOrCreateMerchantByWallet(merchantId);
    return merchant.id;
}
