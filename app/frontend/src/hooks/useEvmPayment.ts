"use client";

import { useCallback, useState } from "react";
import { useMultichainWallet, ChainType, USDC_ADDRESSES, CHAIN_IDS } from "./useMultichainWallet";
import { encodeFunctionData, parseUnits } from "viem";

// Standard ERC20 transfer ABI
const ERC20_TRANSFER_ABI = [
    {
        name: "transfer",
        type: "function",
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
] as const;

export interface EvmPaymentParams {
    to: string;
    amount: number; // Amount in USDC (e.g., 10.50)
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
 */
export function useEvmPayment() {
    const { evmWallet, evmChainType, hasEvm } = useMultichainWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendPayment = useCallback(
        async (params: EvmPaymentParams): Promise<EvmPaymentResult> => {
            const { to, amount, chain } = params;
            const targetChain = chain || evmChainType || "ethereum";

            setLoading(true);
            setError(null);

            try {
                if (!evmWallet) {
                    throw new Error("No EVM wallet connected");
                }

                // Get the wallet provider
                const provider = await evmWallet.getEthereumProvider();
                if (!provider) {
                    throw new Error("Could not get Ethereum provider");
                }

                // Check if we need to switch chains
                const targetChainId = CHAIN_IDS[targetChain as keyof typeof CHAIN_IDS];
                const currentChainId = await provider.request({ method: "eth_chainId" });
                const currentChainIdNum = parseInt(currentChainId as string, 16);

                if (currentChainIdNum !== targetChainId) {
                    // Request chain switch
                    try {
                        await provider.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
                        });
                    } catch (switchError: unknown) {
                        // Chain not added to wallet, might need to add it
                        const err = switchError as { code?: number };
                        if (err.code === 4902) {
                            throw new Error(`Please add ${targetChain} network to your wallet`);
                        }
                        throw switchError;
                    }
                }

                // Get USDC address for target chain
                const usdcAddress = USDC_ADDRESSES[targetChain];
                if (!usdcAddress) {
                    throw new Error(`USDC not supported on ${targetChain}`);
                }

                // USDC has 6 decimals
                const amountInUnits = parseUnits(amount.toString(), 6);

                // Encode the transfer call
                const data = encodeFunctionData({
                    abi: ERC20_TRANSFER_ABI,
                    functionName: "transfer",
                    args: [to as `0x${string}`, amountInUnits],
                });

                // Send the transaction
                const txHash = await provider.request({
                    method: "eth_sendTransaction",
                    params: [
                        {
                            from: evmWallet.address,
                            to: usdcAddress,
                            data,
                        },
                    ],
                });

                setLoading(false);
                return {
                    success: true,
                    hash: txHash as string,
                    chain: targetChain,
                };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Payment failed";
                setError(errorMessage);
                setLoading(false);
                return {
                    success: false,
                    error: errorMessage,
                    chain: targetChain,
                };
            }
        },
        [evmWallet, evmChainType]
    );

    // Get USDC balance on a specific chain
    const getBalance = useCallback(
        async (chain?: ChainType): Promise<number> => {
            const targetChain = chain || evmChainType || "ethereum";

            if (!evmWallet || targetChain === "solana") {
                return 0;
            }

            try {
                const provider = await evmWallet.getEthereumProvider();
                if (!provider) return 0;

                const usdcAddress = USDC_ADDRESSES[targetChain];

                // Encode balanceOf call
                const balanceOfData = encodeFunctionData({
                    abi: [
                        {
                            name: "balanceOf",
                            type: "function",
                            inputs: [{ name: "account", type: "address" }],
                            outputs: [{ name: "", type: "uint256" }],
                        },
                    ] as const,
                    functionName: "balanceOf",
                    args: [evmWallet.address as `0x${string}`],
                });

                const result = await provider.request({
                    method: "eth_call",
                    params: [
                        {
                            to: usdcAddress,
                            data: balanceOfData,
                        },
                        "latest",
                    ],
                });

                // Parse the result (returns hex string)
                const balance = BigInt(result as string);
                // USDC has 6 decimals
                return Number(balance) / 1_000_000;
            } catch (err) {
                console.error("Failed to get balance:", err);
                return 0;
            }
        },
        [evmWallet, evmChainType]
    );

    return {
        sendPayment,
        getBalance,
        loading,
        error,
        hasEvm,
        currentChain: evmChainType,
        walletAddress: evmWallet?.address,
    };
}
