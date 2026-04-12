"use client";

import { useState, useEffect, useCallback } from "react";
import { useActiveWallet } from "./useActiveWallet";

export type OnboardingStatus = "loading" | "onboarded" | "needs-onboarding" | "unauthenticated";

interface OnboardingResult {
    status: OnboardingStatus;
    merchantId: string | null;
    merchantName: string | null;
    hasVault: boolean;
    refresh: () => void;
}

/**
 * Hook to check whether the current connected wallet has completed
 * merchant onboarding (registered + has a Squads vault).
 */
export function useOnboardingStatus(): OnboardingResult {
    const { publicKey, connected, ready } = useActiveWallet();

    const [status, setStatus] = useState<OnboardingStatus>("loading");
    const [merchantId, setMerchantId] = useState<string | null>(null);
    const [merchantName, setMerchantName] = useState<string | null>(null);
    const [hasVault, setHasVault] = useState(false);
    const [checkCount, setCheckCount] = useState(0);

    const refresh = useCallback(() => setCheckCount((c) => c + 1), []);

    useEffect(() => {
        if (!ready) return;

        if (!connected || !publicKey) {
            setStatus("unauthenticated");
            setMerchantId(null);
            setMerchantName(null);
            setHasVault(false);
            return;
        }

        let cancelled = false;

        async function check() {
            setStatus("loading");
            try {
                const res = await fetch(`/api/merchants/register?wallet=${publicKey}`);
                if (!res.ok) throw new Error("API error");
                const data = await res.json();

                if (cancelled) return;

                if (data.registered && data.merchant) {
                    setMerchantId(data.merchant.id);
                    setMerchantName(data.merchant.name);
                    const vault = !!(data.merchant.multisigPda || data.merchant.walletAddress);
                    setHasVault(vault);
                    setStatus("onboarded");
                } else {
                    // localStorage is only a short-lived cache for the onboarding→dashboard handoff.
                    // If the server says not registered, trust the server and clear stale cache.
                    const lsMerchant = localStorage.getItem(`settlr_merchant_id_${publicKey}`);
                    if (lsMerchant) {
                        // Stale cache from a previous onboarding attempt — re-check server once
                        localStorage.removeItem(`settlr_merchant_id_${publicKey}`);
                        localStorage.removeItem(`settlr_vault_pda_${publicKey}`);
                        localStorage.removeItem(`settlr_vault_${publicKey}`);
                    }
                    setMerchantId(null);
                    setMerchantName(null);
                    setHasVault(false);
                    setStatus("needs-onboarding");
                }
            } catch {
                if (cancelled) return;
                // On network error, use localStorage as temporary cache to avoid blocking the user
                const lsVault = localStorage.getItem(`settlr_vault_pda_${publicKey}`);
                const lsMerchant = localStorage.getItem(`settlr_merchant_id_${publicKey}`);
                if (lsVault && lsMerchant) {
                    setMerchantId(lsMerchant);
                    setHasVault(true);
                    // Mark as onboarded but schedule a re-check
                    setStatus("onboarded");
                } else {
                    setStatus("needs-onboarding");
                }
            }
        }

        check();
        return () => { cancelled = true; };
    }, [ready, connected, publicKey, checkCount]);

    return { status, merchantId, merchantName, hasVault, refresh };
}
