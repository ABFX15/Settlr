"use client";

import { useWallet } from "@solana/wallet-adapter-react";

/**
 * Hook to get the currently active wallet via Solana wallet-adapter.
 * Users connect directly through Phantom, Solflare, etc.
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

    const address = publicKey?.toBase58() ?? undefined;

    return {
        wallet,
        solanaWallet: wallet,
        address,
        publicKey: address,
        connected,
        ready: !connecting,
        wallets,
        signTransaction,
        signAllTransactions,
        disconnect,
    };
}
