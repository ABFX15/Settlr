"use client";

import { useWallet } from "@solana/wallet-adapter-react";
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
 * Currently Solana-only (EVM support removed with Privy).
 */
export function useMultichainWallet() {
    const { publicKey, connected, wallet } = useWallet();

    const solanaAddress = publicKey?.toBase58();

    const allWallets = useMemo((): WalletInfo[] => {
        if (!solanaAddress) return [];
        return [{
            address: solanaAddress,
            chainType: "solana" as ChainType,
            isEvm: false,
            walletClientType: wallet?.adapter?.name,
        }];
    }, [solanaAddress, wallet?.adapter?.name]);

    return {
        // Solana
        solanaWallet: publicKey ? { address: solanaAddress } : undefined,
        solanaAddress,
        hasSolana: !!publicKey,

        // EVM (disabled — no Privy)
        evmWallet: undefined,
        evmAddress: undefined,
        evmChainType: undefined,
        evmChainId: undefined,
        hasEvm: false,

        // All wallets
        allWallets,
        connected,
        ready: true,

        // Helpers
        getUsdcAddress: (chain: ChainType) => USDC_ADDRESSES[chain],
        getChainId: (chain: ChainType) => chain === "solana" ? undefined : CHAIN_IDS[chain],
    };
}
