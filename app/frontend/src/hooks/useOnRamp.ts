"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * Tiered on-ramp system for any payment size:
 *
 * ┌─────────────────────┬───────────────┬──────────────┬──────────────────┐
 * │ Tier                │ Max Amount    │ Method       │ Speed            │
 * ├─────────────────────┼───────────────┼──────────────┼──────────────────┤
 * │ Card (MoonPay)      │ $5,000        │ Debit/Credit │ ~5 min           │
 * │ Bank (Sphere)       │ $100,000      │ ACH / Wire   │ 1-2 business days│
 * │ OTC Desk (Circle)   │ $10,000,000+  │ Wire / RFQ   │ Same day         │
 * └─────────────────────┴───────────────┴──────────────┴──────────────────┘
 *
 * For the buyer experience:
 * - Small payments (< $5K): Show card option prominently
 * - Medium payments ($5K-$100K): Show bank transfer / ACH
 * - Large payments ($100K+): Show OTC desk / wire instructions
 */

const MOONPAY_API_KEY = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "";

/* ─── Payment tier definitions ─── */
export interface PaymentTier {
    id: "card" | "bank" | "otc";
    label: string;
    description: string;
    maxAmount: number;
    minAmount: number;
    speed: string;
    fees: string;
    available: boolean;
}

export const PAYMENT_TIERS: PaymentTier[] = [
    {
        id: "card",
        label: "Debit / Credit Card",
        description: "Instant purchase via MoonPay",
        maxAmount: 5_000,
        minAmount: 20,
        speed: "~5 minutes",
        fees: "~3.5% + network",
        available: true,
    },
    {
        id: "bank",
        label: "Bank Transfer (ACH / Wire)",
        description: "Send USD from your bank, receive USDC",
        maxAmount: 100_000,
        minAmount: 100,
        speed: "1–2 business days (ACH) / same day (wire)",
        fees: "~1% + $0.25",
        available: true,
    },
    {
        id: "otc",
        label: "OTC Desk (Large Transfers)",
        description: "White-glove conversion for large amounts",
        maxAmount: 10_000_000,
        minAmount: 25_000,
        speed: "Same day (wire) / next day (ACH)",
        fees: "~0.1–0.5% negotiated",
        available: true,
    },
];

export function getTiersForAmount(amount: number): PaymentTier[] {
    return PAYMENT_TIERS.filter(
        (t) => t.available && amount >= t.minAmount && amount <= t.maxAmount,
    );
}

export function getRecommendedTier(amount: number): PaymentTier {
    if (amount <= 5_000) return PAYMENT_TIERS[0]; // card
    if (amount <= 100_000) return PAYMENT_TIERS[1]; // bank
    return PAYMENT_TIERS[2]; // otc
}

/* ─── Types ─── */
export type OnRampStatus =
    | "idle"
    | "opening"
    | "waiting"
    | "funded"
    | "error";

interface UseOnRampReturn {
    status: OnRampStatus;
    error: string | null;
    availableTiers: PaymentTier[];
    recommendedTier: PaymentTier;
    openCardOnRamp: (params: {
        walletAddress: string;
        amount: number;
        currency?: string;
    }) => void;
    openBankOnRamp: (params: {
        walletAddress: string;
        amount: number;
    }) => void;
    requestOtcQuote: (params: {
        walletAddress: string;
        amount: number;
        email: string;
    }) => Promise<void>;
    reset: () => void;
}

export function useOnRamp(amount: number = 0): UseOnRampReturn {
    const [status, setStatus] = useState<OnRampStatus>("idle");
    const [error, setError] = useState<string | null>(null);

    const availableTiers = useMemo(() => getTiersForAmount(amount), [amount]);
    const recommendedTier = useMemo(() => getRecommendedTier(amount), [amount]);

    /* ─── Tier 1: Card via MoonPay popup ─── */
    const openCardOnRamp = useCallback(
        ({
            walletAddress,
            amount: buyAmount,
            currency = "usd",
        }: {
            walletAddress: string;
            amount: number;
            currency?: string;
        }) => {
            if (!walletAddress) {
                setError("Wallet address required");
                setStatus("error");
                return;
            }
            if (buyAmount > 5_000) {
                setError(
                    "Card purchases are limited to $5,000. Use bank transfer or OTC for larger amounts.",
                );
                setStatus("error");
                return;
            }

            setStatus("opening");
            setError(null);

            const params = new URLSearchParams({
                apiKey: MOONPAY_API_KEY,
                currencyCode: "usdc_sol",
                baseCurrencyCode: currency,
                baseCurrencyAmount: buyAmount.toString(),
                walletAddress,
                colorCode: "#34c759",
                language: "en",
                redirectURL: window.location.href,
                showWalletAddressForm: "false",
            });

            const moonpayUrl = `https://buy.moonpay.com?${params.toString()}`;
            const width = 500;
            const height = 700;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;

            const popup = window.open(
                moonpayUrl,
                "moonpay-onramp",
                `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
            );

            if (!popup) {
                window.location.href = moonpayUrl;
                return;
            }

            setStatus("waiting");
            const pollInterval = setInterval(() => {
                if (popup.closed) {
                    clearInterval(pollInterval);
                    setStatus("funded");
                }
            }, 500);
        },
        [],
    );

    /* ─── Tier 2: Bank transfer via Sphere ─── */
    const openBankOnRamp = useCallback(
        ({
            walletAddress,
            amount: buyAmount,
        }: {
            walletAddress: string;
            amount: number;
        }) => {
            if (!walletAddress) {
                setError("Wallet address required");
                setStatus("error");
                return;
            }

            setStatus("opening");
            setError(null);

            // Sphere buy flow — supports ACH and wire for larger amounts
            const params = new URLSearchParams({
                walletAddress,
                amount: buyAmount.toString(),
                currency: "usdc",
                network: "solana",
            });

            const sphereUrl = `https://spherepay.co/buy?${params.toString()}`;
            const width = 600;
            const height = 750;
            const left = window.screenX + (window.innerWidth - width) / 2;
            const top = window.screenY + (window.innerHeight - height) / 2;

            const popup = window.open(
                sphereUrl,
                "sphere-onramp",
                `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
            );

            if (!popup) {
                window.location.href = sphereUrl;
                return;
            }

            setStatus("waiting");
            const pollInterval = setInterval(() => {
                if (popup.closed) {
                    clearInterval(pollInterval);
                    setStatus("funded");
                }
            }, 500);
        },
        [],
    );

    /* ─── Tier 3: OTC Desk — request a quote ─── */
    const requestOtcQuote = useCallback(
        async ({
            walletAddress,
            amount: buyAmount,
            email,
        }: {
            walletAddress: string;
            amount: number;
            email: string;
        }) => {
            if (!walletAddress || !email) {
                setError("Wallet address and email required for OTC quotes");
                setStatus("error");
                return;
            }

            setStatus("opening");
            setError(null);

            try {
                const res = await fetch("/api/otc-quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        walletAddress,
                        amount: buyAmount,
                        email,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to request quote");
                }

                setStatus("waiting");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to request OTC quote");
                setStatus("error");
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setStatus("idle");
        setError(null);
    }, []);

    return {
        status,
        error,
        availableTiers,
        recommendedTier,
        openCardOnRamp,
        openBankOnRamp,
        requestOtcQuote,
        reset,
    };
}
