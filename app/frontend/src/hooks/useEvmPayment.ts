"use client";

import { useCallback, useState } from "react";
import { useMultichainWallet, ChainType, USDC_ADDRESSES, CHAIN_IDS } from "./useMultichainWallet";

export interface EvmPaymentParams {
    to: string;
    amount: number;
    chain?: ChainType;
    memo?: string;
}

export interface EvmPaymentResult {
    success: boolean;
    hash?: string;
    error?: string;
    chain: ChainType;
}

/**
 * Hook for sending USDC payments on EVM chains.
 * Currently disabled — EVM support was removed with Privy.
 */
export function useEvmPayment() {
    const { hasEvm } = useMultichainWallet();
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);

    const sendPayment = useCallback(
        async (params: EvmPaymentParams): Promise<EvmPaymentResult> => {
            const targetChain = params.chain || "ethereum";
            return {
                success: false,
                error: "EVM payments are not currently supported",
                chain: targetChain,
            };
        },
        []
    );

    const getBalance = useCallback(
        async (_chain?: ChainType): Promise<number> => {
            return 0;
        },
        []
    );

    return {
        sendPayment,
        getBalance,
        loading,
        error,
        hasEvm,
        currentChain: undefined,
        walletAddress: undefined,
    };
}
