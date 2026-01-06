"use client";

import { useCallback, useState } from "react";
import {
    fetchQuote,
    swapFromEvm,
    Quote,
    addresses,
    ChainName,
} from "@mayanfinance/swap-sdk";
import { ethers } from "ethers";
import { useMultichainWallet, ChainType, USDC_ADDRESSES } from "./useMultichainWallet";

// Mayan chain names mapping
const MAYAN_CHAIN_NAMES: Record<ChainType, ChainName> = {
    solana: "solana",
    ethereum: "ethereum",
    base: "base",
    arbitrum: "arbitrum",
    polygon: "polygon",
    optimism: "optimism",
};

// ERC20 approve ABI for allowance
const ERC20_ABI = [
    {
        name: "approve",
        type: "function",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        name: "allowance",
        type: "function",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
];

export interface MayanSwapParams {
    amount: number;
    fromChain: ChainType;
    toAddress: string;
    referrerAddress?: string;
    referrerBps?: number;
}

export interface MayanQuoteResult {
    quote: Quote;
    expectedAmountOut: number;
    minReceived: number;
    eta: string;
    bridgeFee: number;
    type: string;
}

export interface MayanSwapResult {
    success: boolean;
    hash?: string;
    orderHash?: string;
    error?: string;
    fromChain: ChainType;
    toChain: "solana";
}

export type MayanStatus = "idle" | "quoting" | "approving" | "swapping" | "tracking";

/**
 * Hook for cross-chain USDC swaps via Mayan.
 * Bridges EVM USDC to Solana USDC using Mayan's intent-based protocol.
 */
export function useMayanSwap() {
    const { evmWallet } = useMultichainWallet();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<MayanStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [quote, setQuote] = useState<Quote | null>(null);

    /**
     * Get a quote for swapping USDC from EVM to Solana
     */
    const getQuote = useCallback(
        async (params: MayanSwapParams): Promise<MayanQuoteResult | null> => {
            const { amount, fromChain, referrerAddress, referrerBps } = params;

            if (fromChain === "solana") {
                setError("Use native Solana payment for Solana to Solana transfers");
                return null;
            }

            setStatus("quoting");
            setError(null);

            try {
                const sourceChain = MAYAN_CHAIN_NAMES[fromChain];
                const fromToken = USDC_ADDRESSES[fromChain];
                const toToken = USDC_ADDRESSES.solana;

                // Convert amount to smallest units (USDC has 6 decimals)
                const amountIn64 = (amount * 1_000_000).toString();

                console.log("[Mayan] Fetching quote:", {
                    amountIn64,
                    fromToken,
                    toToken,
                    fromChain: sourceChain,
                    toChain: "solana",
                });

                const quotes = await fetchQuote({
                    amountIn64,
                    fromToken,
                    toToken,
                    fromChain: sourceChain,
                    toChain: "solana",
                    slippageBps: "auto",
                    referrer: referrerAddress,
                    referrerBps: referrerBps || 0,
                });

                if (!quotes || quotes.length === 0) {
                    throw new Error("No quotes available for this swap");
                }

                // Use the best quote (first one)
                const bestQuote = quotes[0];
                setQuote(bestQuote);

                console.log("[Mayan] Best quote:", {
                    type: bestQuote.type,
                    expectedAmountOut: bestQuote.expectedAmountOut,
                    minReceived: bestQuote.minReceived,
                    eta: bestQuote.clientEta,
                });

                return {
                    quote: bestQuote,
                    expectedAmountOut: bestQuote.expectedAmountOut,
                    minReceived: bestQuote.minReceived,
                    eta: bestQuote.clientEta,
                    bridgeFee: bestQuote.clientRelayerFeeSuccess ?? 0,
                    type: bestQuote.type,
                };
            } catch (err) {
                console.error("[Mayan] Quote error:", err);
                setError(err instanceof Error ? err.message : "Failed to get quote");
                return null;
            } finally {
                setStatus("idle");
            }
        },
        []
    );

    /**
     * Execute the swap from EVM to Solana
     */
    const executeSwap = useCallback(
        async (params: MayanSwapParams): Promise<MayanSwapResult> => {
            const { amount, fromChain, toAddress, referrerAddress } = params;

            if (fromChain === "solana") {
                return {
                    success: false,
                    error: "Use native Solana payment for Solana to Solana transfers",
                    fromChain,
                    toChain: "solana",
                };
            }

            if (!evmWallet) {
                return {
                    success: false,
                    error: "No EVM wallet connected",
                    fromChain,
                    toChain: "solana",
                };
            }

            setLoading(true);
            setError(null);

            try {
                // Step 1: Get a fresh quote
                setStatus("quoting");
                const quoteResult = await getQuote(params);

                if (!quoteResult) {
                    throw new Error("Failed to get quote");
                }

                const { quote: swapQuote } = quoteResult;

                // Step 2: Get provider and signer
                const ethereumProvider = await evmWallet.getEthereumProvider();
                if (!ethereumProvider) {
                    throw new Error("Could not get Ethereum provider");
                }

                const provider = new ethers.BrowserProvider(ethereumProvider);
                const signer = await provider.getSigner();
                const signerAddress = await signer.getAddress();

                // Step 3: Check and set allowance for Mayan Forwarder
                setStatus("approving");
                const usdcAddress = USDC_ADDRESSES[fromChain];
                const forwarderAddress = addresses.MAYAN_FORWARDER_CONTRACT;

                const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);

                // Check current allowance
                const currentAllowance = await usdcContract.allowance(
                    signerAddress,
                    forwarderAddress
                );

                const requiredAmount = ethers.parseUnits(amount.toString(), 6);

                if (currentAllowance < requiredAmount) {
                    console.log("[Mayan] Approving USDC for Forwarder...");
                    const approveTx = await usdcContract.approve(
                        forwarderAddress,
                        ethers.MaxUint256
                    );
                    await approveTx.wait();
                    console.log("[Mayan] Approval confirmed");
                }

                // Step 4: Execute the swap
                setStatus("swapping");
                console.log("[Mayan] Executing swap to:", toAddress);

                // Referrer addresses object
                const referrerAddresses = referrerAddress
                    ? { solana: referrerAddress }
                    : undefined;

                // swapFromEvm signature: (quote, swapperAddress, destinationAddress, referrerAddresses, signer, permit, overrides, payload, options)
                const result = await swapFromEvm(
                    swapQuote,
                    signerAddress,
                    toAddress,
                    referrerAddresses,
                    signer,
                    null,
                    null,
                    null
                );

                console.log("[Mayan] Swap result:", result);

                // If gasless, result is an order hash string
                // Otherwise it's a transaction response
                const isGasless = swapQuote.gasless === true;

                let txHash: string;
                if (isGasless && typeof result === "string") {
                    txHash = result;
                    console.log("[Mayan] Gasless swap order hash:", txHash);
                } else if (result && typeof result === "object" && "hash" in result) {
                    txHash = (result as { hash: string }).hash;
                    console.log("[Mayan] Transaction hash:", txHash);
                } else {
                    txHash = String(result);
                }

                setStatus("tracking");

                return {
                    success: true,
                    hash: txHash,
                    orderHash: isGasless ? txHash : undefined,
                    fromChain,
                    toChain: "solana",
                };
            } catch (err) {
                console.error("[Mayan] Swap error:", err);
                const errorMessage = err instanceof Error ? err.message : "Swap failed";
                setError(errorMessage);
                return {
                    success: false,
                    error: errorMessage,
                    fromChain,
                    toChain: "solana",
                };
            } finally {
                setLoading(false);
                setStatus("idle");
            }
        },
        [evmWallet, getQuote]
    );

    /**
     * Track swap status using Mayan Explorer API
     */
    const trackSwap = useCallback(
        async (
            txHash: string
        ): Promise<{
            status: "INPROGRESS" | "COMPLETED" | "REFUNDED" | "UNKNOWN";
            details?: Record<string, unknown>;
        }> => {
            try {
                const response = await fetch(
                    `https://explorer-api.mayan.finance/v3/swap/trx/${txHash}`
                );

                if (!response.ok) {
                    return { status: "UNKNOWN" };
                }

                const data = await response.json();
                return {
                    status: data.clientStatus || "UNKNOWN",
                    details: data,
                };
            } catch (err) {
                console.error("[Mayan] Track error:", err);
                return { status: "UNKNOWN" };
            }
        },
        []
    );

    /**
     * Get a quick quote preview without state changes
     */
    const getQuotePreview = useCallback(
        async (
            amount: number,
            fromChain: ChainType
        ): Promise<{
            expectedOut: number;
            fee: number;
            eta: string;
        } | null> => {
            if (fromChain === "solana" || amount <= 0) return null;

            try {
                const sourceChain = MAYAN_CHAIN_NAMES[fromChain];
                const fromToken = USDC_ADDRESSES[fromChain];
                const toToken = USDC_ADDRESSES.solana;
                const amountIn64 = (amount * 1_000_000).toString();

                const quotes = await fetchQuote({
                    amountIn64,
                    fromToken,
                    toToken,
                    fromChain: sourceChain,
                    toChain: "solana",
                    slippageBps: "auto",
                });

                if (!quotes || quotes.length === 0) return null;

                const q = quotes[0];
                return {
                    expectedOut: q.expectedAmountOut,
                    fee: q.clientRelayerFeeSuccess ?? 0,
                    eta: q.clientEta,
                };
            } catch {
                return null;
            }
        },
        []
    );

    return {
        // Actions
        getQuote,
        executeSwap,
        trackSwap,
        getQuotePreview,

        // State
        loading,
        status,
        error,
        quote,

        // Status helpers
        isQuoting: status === "quoting",
        isApproving: status === "approving",
        isSwapping: status === "swapping",
        isTracking: status === "tracking",
    };
}
