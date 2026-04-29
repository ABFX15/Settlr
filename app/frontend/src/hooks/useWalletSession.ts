"use client";

/**
 * useWalletSession — establishes a server-verified session for the
 * currently connected wallet by signing a one-time nonce.
 *
 * Drop into the dashboard layout. While `status === "ready"`, all
 * `fetch("/api/...")` calls will be authenticated by the
 * `offbank_session` cookie set by /api/auth/wallet/verify.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

type Status = "idle" | "signing" | "ready" | "error";

export function useWalletSession() {
    const { publicKey, signMessage, connected } = useWallet();
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);
    const inFlight = useRef<string | null>(null);

    const signIn = useCallback(async () => {
        if (!publicKey || !signMessage) return;
        const wallet = publicKey.toBase58();
        if (inFlight.current === wallet) return;
        inFlight.current = wallet;
        setStatus("signing");
        setError(null);

        try {
            const nonceRes = await fetch(
                `/api/auth/wallet/nonce?wallet=${encodeURIComponent(wallet)}`,
                { credentials: "include" },
            );
            if (!nonceRes.ok) {
                throw new Error(`Failed to fetch nonce (${nonceRes.status})`);
            }
            const { message } = await nonceRes.json();

            const signed = await signMessage(new TextEncoder().encode(message));
            const signatureB58 = bs58.encode(signed);

            const verifyRes = await fetch("/api/auth/wallet/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ wallet, signature: signatureB58 }),
            });
            if (!verifyRes.ok) {
                const body = await verifyRes.json().catch(() => ({}));
                throw new Error(body?.error || `Verify failed (${verifyRes.status})`);
            }
            setStatus("ready");
        } catch (e) {
            console.error("[wallet-session] sign-in failed:", e);
            setError(e instanceof Error ? e.message : "Sign-in failed");
            setStatus("error");
        } finally {
            inFlight.current = null;
        }
    }, [publicKey, signMessage]);

    // Auto sign-in when a wallet connects. Only retry from `idle`; if a
    // previous attempt errored, surface it and wait for an explicit retry
    // so we don't reopen the wallet's signature prompt in a loop.
    useEffect(() => {
        if (!connected || !publicKey) {
            setStatus("idle");
            return;
        }
        if (status === "idle") {
            void signIn();
        }
    }, [connected, publicKey, status, signIn]);

    const signOut = useCallback(async () => {
        try {
            await fetch("/api/auth/wallet/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            /* ignore */
        }
        setStatus("idle");
    }, []);

    return { status, error, signIn, signOut };
}
