"use client";

/**
 * usePrivySession — bridges Privy's client auth to our `offbank_session`
 * cookie. After Privy login completes (and an embedded Solana wallet
 * exists on the user), we POST the access token to /api/auth/privy/verify
 * which sets the session cookie. All existing /api/* routes keep working
 * unchanged.
 *
 * Safe to mount when Privy isn't configured — it just no-ops.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

type Status = "idle" | "verifying" | "ready" | "error";

export function usePrivySession() {
    const { authenticated, ready, user, getAccessToken, logout } = usePrivy();
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);
    const inFlight = useRef<string | null>(null);

    const verify = useCallback(async () => {
        if (!authenticated || !user) return;
        if (inFlight.current === user.id) return;
        inFlight.current = user.id;
        setStatus("verifying");
        setError(null);
        try {
            const accessToken = await getAccessToken();
            if (!accessToken) throw new Error("Privy returned no access token");
            const res = await fetch("/api/auth/privy/verify", {
                method: "POST",
                headers: { "content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ accessToken }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error || `Verify failed (${res.status})`);
            }
            setStatus("ready");
        } catch (e) {
            console.error("[privy-session] verify failed:", e);
            setError(e instanceof Error ? e.message : "Privy verify failed");
            setStatus("error");
        } finally {
            inFlight.current = null;
        }
    }, [authenticated, user, getAccessToken]);

    useEffect(() => {
        if (!ready) return;
        if (!authenticated) {
            setStatus("idle");
            return;
        }
        if (status === "idle") void verify();
    }, [ready, authenticated, status, verify]);

    return { status, error, verify, logout, user, authenticated, ready };
}
