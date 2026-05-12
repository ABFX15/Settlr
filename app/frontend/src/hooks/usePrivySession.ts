"use client";

/**
 * usePrivySession — bridges Privy's client auth to our `offbank_session`
 * cookie. After Privy login completes (and an embedded Solana wallet
 * exists on the user), we POST the access token to /api/auth/privy/verify
 * which sets the session cookie. All existing /api/* routes keep working
 * unchanged.
 *
 * Safe to mount when Privy isn't configured — it just no-ops.
 *
 * Per Privy docs (https://docs.privy.io): automatic embedded-wallet
 * creation only works when using Privy's login modal AND only for
 * "users-without-wallets". After OTP login the user object can briefly
 * have no Solana wallet attached. The verify endpoint returns 425 in
 * that case; we retry with backoff up to ~12s before giving up.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
    useWallets as useSolanaWallets,
    useCreateWallet as useCreateSolanaWallet,
} from "@privy-io/react-auth/solana";

type Status = "idle" | "verifying" | "ready" | "error";

const MAX_VERIFY_ATTEMPTS = 6; // ~12s total with 2s spacing
const VERIFY_RETRY_MS = 2000;

export function usePrivySession() {
    const { authenticated, ready, user, getAccessToken, logout } = usePrivy();
    const { wallets: solanaWallets } = useSolanaWallets();
    const { createWallet } = useCreateSolanaWallet();
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
            // If no embedded Solana wallet yet, try to create one. This is
            // necessary when the user signs in via a custom flow (not the
            // Privy modal) — auto-creation doesn't fire in that path.
            const hasSolana = solanaWallets.some(
                (w) => (w as { walletClientType?: string }).walletClientType === "privy",
            );
            if (!hasSolana && createWallet) {
                try {
                    await createWallet();
                } catch (e) {
                    // Non-fatal: server may still find a previously
                    // provisioned wallet. Log and continue.
                    console.warn("[privy-session] createWallet failed:", e);
                }
            }

            const accessToken = await getAccessToken();
            if (!accessToken) throw new Error("Privy returned no access token");

            // Verify with retry on 425 (wallet not yet propagated server-side)
            let lastErrorBody: unknown = null;
            for (let attempt = 0; attempt < MAX_VERIFY_ATTEMPTS; attempt++) {
                const res = await fetch("/api/auth/privy/verify", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ accessToken }),
                });
                if (res.ok) {
                    setStatus("ready");
                    return;
                }
                const body = await res.json().catch(() => ({}));
                lastErrorBody = body;
                if (res.status !== 425) {
                    throw new Error(body?.error || `Verify failed (${res.status})`);
                }
                // 425: wait and retry
                await new Promise((r) => setTimeout(r, VERIFY_RETRY_MS));
            }
            throw new Error(
                (lastErrorBody as { error?: string } | null)?.error ??
                "Embedded wallet provisioning timed out. Please refresh and try again.",
            );
        } catch (e) {
            console.error("[privy-session] verify failed:", e);
            setError(e instanceof Error ? e.message : "Privy verify failed");
            setStatus("error");
        } finally {
            inFlight.current = null;
        }
    }, [authenticated, user, getAccessToken, solanaWallets, createWallet]);

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
