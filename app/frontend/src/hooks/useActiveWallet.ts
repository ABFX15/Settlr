"use client";

import { useWallets } from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

/**
 * Hook to get the currently active wallet.
 * Prioritizes the Privy embedded wallet so email-login users get
 * their embedded wallet by default — not a detected browser extension.
 */
export function useActiveWallet() {
    const { wallets, ready } = useWallets();
    const { authenticated, user } = usePrivy();

    const activeWallet = useMemo(() => {
        if (!wallets || wallets.length === 0) return undefined;

        type WalletWithProps = {
            walletClientType?: string;
            connected?: boolean;
            address: string;
        };

        // Prefer the embedded Privy wallet (created on email login)
        const embeddedWallet = wallets.find(
            (w) => (w as WalletWithProps).walletClientType === "privy"
        );
        if (embeddedWallet) return embeddedWallet;

        // Fall back to first available wallet
        return wallets[0];
    }, [wallets]);

    const publicKey = activeWallet?.address;
    const connected = authenticated && !!publicKey;

    return {
        wallet: activeWallet,
        solanaWallet: activeWallet,
        address: publicKey,
        publicKey,
        connected,
        ready,
        wallets,
    };
}
