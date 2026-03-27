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
                    // Also check localStorage as fallback (onboarding might have just completed)
                    const lsVault = localStorage.getItem(`settlr_vault_pda_${publicKey}`);
                    const lsMerchant = localStorage.getItem(`settlr_merchant_id_${publicKey}`);
                    if (lsVault && lsMerchant) {
                        setMerchantId(lsMerchant);
                        setHasVault(true);
                        setStatus("onboarded");
                    } else {
                        setMerchantId(null);
                        setMerchantName(null);
                        setHasVault(false);
                        setStatus("needs-onboarding");
                    }
                }
            } catch {
                if (cancelled) return;
                // On error, check localStorage as fallback
                const lsVault = localStorage.getItem(`settlr_vault_pda_${publicKey}`);
                const lsMerchant = localStorage.getItem(`settlr_merchant_id_${publicKey}`);
                if (lsVault && lsMerchant) {
                    setMerchantId(lsMerchant);
                    setHasVault(true);
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
