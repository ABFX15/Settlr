"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaPrivyWallets } from "@privy-io/react-auth/solana";

/**
 * Hook to get the currently active wallet — either via Solana
 * wallet-adapter (Phantom/Solflare/etc.) OR via a Privy embedded
 * wallet provisioned during email login. Wallet-adapter takes
 * precedence when both are present.
 */
export function useActiveWallet() {
    const {
        publicKey,
        connected,
        wallet,
        wallets,
        signTransaction,
        signAllTransactions,
        disconnect,
        connecting,
    } = useWallet();

    // Hooks must be called unconditionally. PrivyProvider is mounted
    // app-wide (or these hooks return safe defaults when disabled).
    const { authenticated: privyAuthenticated, ready: privyReady } = usePrivy();
    const { wallets: privyWalletsRaw } = useSolanaPrivyWallets();
    const privyWallets =
        (privyWalletsRaw ?? []) as { address: string; walletClientType?: string }[];

    const adapterAddress = publicKey?.toBase58();
    const privyEmbedded = privyWallets.find((w) => w.walletClientType === "privy");
    const privyAddress = privyAuthenticated
        ? (privyEmbedded?.address ?? privyWallets[0]?.address)
        : undefined;

    const address = adapterAddress ?? privyAddress;
    const isConnected = connected || (!!privyAddress && privyAuthenticated);

    return {
        wallet,
        solanaWallet: wallet,
        address,
        publicKey: address,
        connected: isConnected,
        ready: !connecting && privyReady,
        wallets,
        signTransaction,
        signAllTransactions,
        disconnect,
    };
}
