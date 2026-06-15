/**
 * Compliance payload assembler.
 *
 * The thing that actually gets a cannabis bank to *auto-clear* an incoming
 * wire: a packaged proof that the funds came from licensed sales. For each
 * off-ramp payout we bundle the merchant's license #, business identity, the
 * amount, and the on-chain-verified payments that funded the balance
 * (provenance / look-through transparency).
 *
 * This is custody-model-independent — you need it whether the platform stays
 * non-custodial or runs a closed-loop treasury. Pushing the bundle to a bank
 * compliance API (e.g. Safe Harbor) is a partnership-gated step; the bundle
 * itself is built entirely from our own data here.
 */

import { getMerchantByWallet, getPaymentsByMerchant } from "@/lib/db";
import type { OfframpRequest } from "@/lib/offramp";

export interface FundingSource {
    type: "payment";
    id: string;
    amount: number;
    txSignature: string;
    date: string;
}

export interface CompliancePayload {
    requestId: string;
    merchantId: string;
    businessName: string;
    /** State cannabis license (METRC/BioTrack). */
    licenseNumber: string | null;
    /** Business EIN — not yet captured on the merchant record (see TODO). */
    ein: string | null;
    amount: number;
    currency: string;
    destinationAccount: string;
    riskScore?: number;
    /** On-chain payments that funded this balance — the provenance a bank wants. */
    fundingSources: FundingSource[];
    fundingCovered: number;
    generatedAt: string;
}

/**
 * Build the compliance bundle for one off-ramp request. Pulls the most recent
 * completed payments as funding provenance up to the payout amount.
 */
export async function assembleCompliancePayload(
    request: OfframpRequest,
): Promise<CompliancePayload> {
    const merchant = await getMerchantByWallet(request.wallet);
    const payments = await getPaymentsByMerchant(request.merchantId);

    // Most-recent completed payments first, accumulate until they cover the payout.
    const completed = payments
        .filter((p) => p.status === "completed")
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const fundingSources: FundingSource[] = [];
    let covered = 0;
    for (const p of completed) {
        if (covered >= request.amount) break;
        fundingSources.push({
            type: "payment",
            id: p.id,
            amount: p.amount,
            txSignature: p.txSignature,
            date: new Date(p.createdAt).toISOString(),
        });
        covered += p.amount;
    }

    return {
        requestId: request.id,
        merchantId: request.merchantId,
        businessName: merchant?.name ?? "",
        licenseNumber: request.licenseNumber ?? merchant?.licenseNumber ?? null,
        // TODO: capture EIN on the merchant record (KYB) and surface it here.
        ein: null,
        amount: request.amount,
        currency: request.currency,
        destinationAccount: request.accountInfo,
        riskScore: request.riskScore,
        fundingSources,
        fundingCovered: covered,
        generatedAt: new Date().toISOString(),
    };
}
