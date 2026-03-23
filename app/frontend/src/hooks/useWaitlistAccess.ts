"use client";

import { useState, useEffect, useCallback } from "react";
import { useActiveWallet } from "./useActiveWallet";
import { usePrivy } from "@privy-io/react-auth";

export type WaitlistAccess = "loading" | "approved" | "pending" | "no-entry" | "unauthenticated";

interface WaitlistAccessResult {
    access: WaitlistAccess;
    refresh: () => void;
}

/**
 * Check whether the current authenticated wallet has been approved
 * on the waitlist (status = "invited" or "active").
 *
 * Returns:
 *  - "loading" while checking
 *  - "approved" if wallet is on waitlist with invited/active status
 *  - "pending" if wallet is on waitlist but still pending
 *  - "no-entry" if wallet has no waitlist entry at all
 *  - "unauthenticated" if not logged in
 */
export function useWaitlistAccess(): WaitlistAccessResult {
    const { authenticated, ready } = usePrivy();
    const { publicKey, connected } = useActiveWallet();

    const [access, setAccess] = useState<WaitlistAccess>("loading");
    const [checkCount, setCheckCount] = useState(0);

    const refresh = useCallback(() => setCheckCount((c) => c + 1), []);

    useEffect(() => {
        if (!ready) return;

        if (!authenticated || !connected || !publicKey) {
            setAccess("unauthenticated");
            return;
        }

        let cancelled = false;

        async function check() {
            setAccess("loading");
            try {
                const res = await fetch(`/api/waitlist/check?wallet=${publicKey}`);
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
                // On error, default to no-entry so they can submit
                setAccess("no-entry");
            }
        }

        check();
        return () => { cancelled = true; };
    }, [ready, authenticated, connected, publicKey, checkCount]);

    return { access, refresh };
}
