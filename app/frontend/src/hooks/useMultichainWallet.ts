"use client";

import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { usePrivy, useWallets as useEvmWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

export type ChainType = "solana" | "ethereum" | "base" | "arbitrum" | "polygon" | "optimism";

export interface WalletInfo {
    address: string;
    chainType: ChainType;
    isEvm: boolean;
    walletClientType?: string;
}

// USDC contract addresses on each chain
export const USDC_ADDRESSES: Record<ChainType, string> = {
    solana: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
};

// Chain IDs for EVM networks
export const CHAIN_IDS: Record<Exclude<ChainType, "solana">, number> = {
    ethereum: 1,
    base: 8453,
    arbitrum: 42161,
    polygon: 137,
    optimism: 10,
};

/**
 * Hook to get all connected wallets across chains.
 * Returns both Solana and EVM wallets with chain type info.
 */
export function useMultichainWallet() {
    const { wallets: solanaWallets, ready: solanaReady } = useSolanaWallets();
    const { wallets: evmWallets, ready: evmReady } = useEvmWallets();
    const { authenticated, user } = usePrivy();

    // Get the active Solana wallet
    const activeSolanaWallet = useMemo(() => {
        if (!solanaWallets || solanaWallets.length === 0) return undefined;

        // Prefer external wallets over embedded
        const externalWallet = solanaWallets.find(
            (w) => (w as { walletClientType?: string }).walletClientType !== "privy"
        );
        return externalWallet || solanaWallets[0];
    }, [solanaWallets]);

    // Get the active EVM wallet
    const activeEvmWallet = useMemo(() => {
        if (!evmWallets || evmWallets.length === 0) return undefined;

        // Prefer external wallets over embedded
        const externalWallet = evmWallets.find(
            (w) => w.walletClientType !== "privy"
        );
        return externalWallet || evmWallets[0];
    }, [evmWallets]);

    // Get current chain from EVM wallet
    const evmChainId = activeEvmWallet?.chainId;
    const evmChainType = useMemo((): ChainType | undefined => {
        if (!evmChainId) return undefined;
        const chainIdNum = typeof evmChainId === "string"
            ? parseInt(evmChainId.replace("eip155:", ""), 10)
            : evmChainId;

        const entry = Object.entries(CHAIN_IDS).find(([, id]) => id === chainIdNum);
        return entry ? (entry[0] as ChainType) : undefined;
    }, [evmChainId]);

    // All connected wallets with chain info
    const allWallets = useMemo((): WalletInfo[] => {
        const wallets: WalletInfo[] = [];

        if (activeSolanaWallet) {
            wallets.push({
                address: activeSolanaWallet.address,
                chainType: "solana",
                isEvm: false,
                walletClientType: (activeSolanaWallet as { walletClientType?: string }).walletClientType,
            });
        }

        if (activeEvmWallet) {
            wallets.push({
                address: activeEvmWallet.address,
                chainType: evmChainType || "ethereum",
                isEvm: true,
                walletClientType: activeEvmWallet.walletClientType,
            });
        }

        return wallets;
    }, [activeSolanaWallet, activeEvmWallet, evmChainType]);

    // Check if user has any wallet connected
    const connected = authenticated && allWallets.length > 0;
    const ready = solanaReady && evmReady;

    return {
        // Solana
        solanaWallet: activeSolanaWallet,
        solanaAddress: activeSolanaWallet?.address,
        hasSolana: !!activeSolanaWallet,

        // EVM
        evmWallet: activeEvmWallet,
        evmAddress: activeEvmWallet?.address,
        evmChainType,
        evmChainId,
        hasEvm: !!activeEvmWallet,

        // All wallets
        allWallets,
        connected,
        ready,

        // Helpers
        getUsdcAddress: (chain: ChainType) => USDC_ADDRESSES[chain],
        getChainId: (chain: ChainType) => chain === "solana" ? undefined : CHAIN_IDS[chain],
    };
}
