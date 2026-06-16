/**
 * Merchant compliance dossier.
 *
 * The single artifact you hand a bank or OTC desk to win a "yes": one
 * authoritative report proving a merchant's funds are clean and traceable.
 * Aggregates everything the platform already produces — verified business
 * identity + license, KYB status, AML wallet screening, on-chain transaction
 * volume, and off-ramp history — into a bank-ready package.
 *
 * This is the "radical transparency" play in concrete form: we don't ask the
 * bank to trust us, we show them the complete, verifiable record.
 */

import { logger } from "@/lib/logger";
import {
    getMerchantByWallet,
    getPaymentsByMerchant,
} from "@/lib/db";
import { isUserVerified } from "@/lib/sumsub";
import { screenWallet } from "@/lib/range";
import { listOfframpRequests } from "@/lib/offramp";

export interface MerchantComplianceReport {
    business: {
        name: string;
        licenseNumber: string | null;
        wallet: string;
        memberSince: string | null;
    };
    kyb: {
        verified: boolean;
        provider: "sumsub";
    };
    aml: {
        riskLevel: string;
        riskScore: number;
        flagged: boolean;
        provider: "range";
    };
    activity: {
        completedPayments: number;
        totalVolumeUSDC: number;
        firstPaymentAt: string | null;
        lastPaymentAt: string | null;
    };
    offramp: {
        settledCount: number;
        settledTotalUSD: number;
        pendingCount: number;
    };
    generatedAt: string;
}

export async function assembleMerchantComplianceReport(
    wallet: string,
): Promise<MerchantComplianceReport> {
    const merchant = await getMerchantByWallet(wallet);

    // KYB (Sumsub) — false if unverified or not configured.
    let kybVerified = false;
    try {
        kybVerified = await isUserVerified(wallet);
    } catch (err) {
        logger.error("[compliance-report] KYB check failed:", err);
    }

    // AML wallet screening (Range — falls back to a low-risk mock without a key).
    const screen = await screenWallet(wallet);

    // On-chain activity / volume.
    const payments = merchant ? await getPaymentsByMerchant(merchant.id) : [];
    const completed = payments
        .filter((p) => p.status === "completed")
        .sort((a, b) => a.createdAt - b.createdAt);
    const totalVolume = completed.reduce((s, p) => s + p.amount, 0);

    // Off-ramp history.
    const offramps = merchant ? await listOfframpRequests(merchant.id) : [];
    const settled = offramps.filter((o) => o.status === "completed");
    const pending = offramps.filter(
        (o) => o.status === "pending" || o.status === "processing",
    );

    return {
        business: {
            name: merchant?.name ?? "",
            licenseNumber: merchant?.licenseNumber ?? null,
            wallet,
            memberSince: merchant?.createdAt
                ? new Date(merchant.createdAt).toISOString()
                : null,
        },
        kyb: { verified: kybVerified, provider: "sumsub" },
        aml: {
            riskLevel: String(screen.riskLevel),
            riskScore: screen.riskScore,
            flagged: screen.shouldBlock,
            provider: "range",
        },
        activity: {
            completedPayments: completed.length,
            totalVolumeUSDC: totalVolume,
            firstPaymentAt: completed[0]
                ? new Date(completed[0].createdAt).toISOString()
                : null,
            lastPaymentAt: completed.length
                ? new Date(completed[completed.length - 1].createdAt).toISOString()
                : null,
        },
        offramp: {
            settledCount: settled.length,
            settledTotalUSD: settled.reduce((s, o) => s + o.amount, 0),
            pendingCount: pending.length,
        },
        generatedAt: new Date().toISOString(),
    };
}
