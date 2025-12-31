"use client";

import { useWallets } from "@privy-io/react-auth/solana";
import { usePrivy } from "@privy-io/react-auth";
import { useMemo } from "react";

/**
 * Hook to get the currently active wallet.
 * Prioritizes connected external wallets (Phantom/Solflare) over Privy embedded wallets.
 */
export function useActiveWallet() {
    const { wallets, ready } = useWallets();
    const { authenticated, user } = usePrivy();

    const activeWallet = useMemo(() => {
        if (!wallets || wallets.length === 0) return undefined;

        // Type helper for wallet properties that may not be in the type definition
        type WalletWithProps = {
            walletClientType?: string;
            connected?: boolean;
            address: string;
        };

        // First, find an external wallet that's explicitly connected
        const connectedExternal = wallets.find(
            (w) =>
                (w as WalletWithProps).walletClientType !== "privy" &&
                (w as WalletWithProps).connected === true
        );
        if (connectedExternal) return connectedExternal;

        // Check the user's linked accounts to see which wallet they authenticated with
        const linkedWalletAddress = user?.linkedAccounts?.find(
            (account) =>
                account.type === "wallet" && account.walletClientType !== "privy"
        );
        if (linkedWalletAddress && "address" in linkedWalletAddress) {
            const matchingWallet = wallets.find(
                (w) => w.address === linkedWalletAddress.address
            );
            if (matchingWallet) return matchingWallet;
        }

        // Fall back to any external wallet
        const externalWallet = wallets.find(
            (w) => (w as WalletWithProps).walletClientType !== "privy"
        );
        if (externalWallet) return externalWallet;

        // Last resort: first wallet (likely embedded)
        return wallets[0];
    }, [wallets, user?.linkedAccounts]);

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
