/**
 * Saved payees (supplier address book).
 *
 * The primitive that turns "send crypto to an address" into "pay your
 * distributor in two clicks". A merchant saves the businesses they pay
 * (distributors, growers, suppliers) once, with the compliance context
 * (license #), then pays them repeatedly in USDC — money circulating inside
 * the network instead of leaking out an off-ramp.
 *
 * In-memory for now (mirrors the other new stores); move to Supabase before
 * production so payees persist.
 */

export interface Payee {
    id: string;
    merchantId: string;
    /** Display name of the supplier/business. */
    name: string;
    /** Solana wallet (or vault) address that receives USDC. */
    walletAddress: string;
    /** Counterparty's cannabis license #, when applicable (compliance). */
    licenseNumber?: string;
    note?: string;
    createdAt: string;
}

const byMerchant: Map<string, Payee[]> = new Map();
const byId: Map<string, Payee> = new Map();

export function listPayees(merchantId: string): Payee[] {
    return byMerchant.get(merchantId) || [];
}

export function getPayee(id: string): Payee | null {
    return byId.get(id) ?? null;
}

export function createPayee(
    data: Omit<Payee, "id" | "createdAt">,
): Payee {
    const payee: Payee = {
        ...data,
        id: `pye_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
    };
    const list = byMerchant.get(payee.merchantId) || [];
    list.unshift(payee);
    byMerchant.set(payee.merchantId, list);
    byId.set(payee.id, payee);
    return payee;
}

export function deletePayee(merchantId: string, id: string): boolean {
    const payee = byId.get(id);
    if (!payee || payee.merchantId !== merchantId) return false;
    byId.delete(id);
    byMerchant.set(
        merchantId,
        (byMerchant.get(merchantId) || []).filter((p) => p.id !== id),
    );
    return true;
}
