"use client";

import { useState, useEffect, useCallback } from "react";
import { useActiveWallet } from "./useActiveWallet";

export type WaitlistAccess = "loading" | "approved" | "pending" | "no-entry" | "unauthenticated";

interface WaitlistAccessResult {
    access: WaitlistAccess;
    refresh: () => void;
}

/**
 * Check whether the current connected wallet has been approved
 * on the waitlist (status = "invited" or "active").
 */
export function useWaitlistAccess(): WaitlistAccessResult {
    const { publicKey, connected, ready } = useActiveWallet();

    const [access, setAccess] = useState<WaitlistAccess>("loading");
    const [checkCount, setCheckCount] = useState(0);

    const refresh = useCallback(() => setCheckCount((c) => c + 1), []);

    useEffect(() => {
        if (!ready) return;

        if (!connected || !publicKey) {
            setAccess("unauthenticated");
            return;
        }

        let cancelled = false;

        async function check() {
            setAccess("loading");
            try {
                const params = new URLSearchParams({ wallet: publicKey! });

                const res = await fetch(`/api/waitlist/check?${params}`);
                if (!res.ok) throw new Error("API error");
                const data = await res.json();

                if (cancelled) return;

                if (data.approved) {
                    setAccess("approved");
                } else if (data.pending) {
                    setAccess("pending");
                } else {
                    setAccess("no-entry");
                }
            } catch {
                if (cancelled) return;
                setAccess("no-entry");
            }
        }

        check();
        return () => { cancelled = true; };
    }, [ready, connected, publicKey, checkCount]);

    return { access, refresh };
}
