"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChainType, CHAIN_IDS } from "@/hooks/useMultichainWallet";

interface ChainSelectorProps {
  selectedChain: ChainType;
  onSelect: (chain: ChainType) => void;
  availableChains?: ChainType[];
  disabled?: boolean;
}

const CHAIN_INFO: Record<
  ChainType,
  { name: string; icon: string; color: string }
> = {
  solana: {
    name: "Solana",
    icon: "◎",
    color: "#14F195",
  },
  ethereum: {
    name: "Ethereum",
    icon: "Ξ",
    color: "#627EEA",
  },
  base: {
    name: "Base",
    icon: "🔵",
    color: "#0052FF",
  },
  arbitrum: {
    name: "Arbitrum",
    icon: "🔷",
    color: "#28A0F0",
  },
  polygon: {
    name: "Polygon",
    icon: "⬡",
    color: "#8247E5",
  },
  optimism: {
    name: "Optimism",
    icon: "🔴",
    color: "#FF0420",
  },
};

export function ChainSelector({
  selectedChain,
  onSelect,
  availableChains = [
    "solana",
    "ethereum",
    "base",
    "arbitrum",
    "polygon",
    "optimism",
  ],
  disabled = false,
}: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedInfo = CHAIN_INFO[selectedChain];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
          ${
            disabled
              ? "bg-[#F5F5F5] border-[#E5E7EB] cursor-not-allowed opacity-50"
              : "bg-[#F5F5F5] border-[#E5E7EB] hover:border-[#E5E7EB] cursor-pointer"
          }
        `}
      >
        <span className="text-lg" style={{ color: selectedInfo.color }}>
          {selectedInfo.icon}
        </span>
        <span className="text-[#0A0F1E] font-medium">{selectedInfo.name}</span>
        <svg
          className={`w-4 h-4 text-[#94A3B8] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {availableChains.map((chain) => {
              const info = CHAIN_INFO[chain];
              const isSelected = chain === selectedChain;

              return (
                <button
                  key={chain}
                  onClick={() => {
                    onSelect(chain);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 transition-colors
                    ${isSelected ? "bg-[#F5F5F5]" : "hover:bg-[#F5F5F5]"}
                  `}
                >
                  <span className="text-lg" style={{ color: info.color }}>
                    {info.icon}
                  </span>
                  <span className="text-[#0A0F1E]">{info.name}</span>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-[#059669] ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
}

// Helper to get block explorer URL for a transaction
export function getExplorerUrl(chain: ChainType, txHash: string): string {
  switch (chain) {
    case "solana":
      return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
    case "ethereum":
      return `https://etherscan.io/tx/${txHash}`;
    case "base":
      return `https://basescan.org/tx/${txHash}`;
    case "arbitrum":
      return `https://arbiscan.io/tx/${txHash}`;
    case "polygon":
      return `https://polygonscan.com/tx/${txHash}`;
    case "optimism":
      return `https://optimistic.etherscan.io/tx/${txHash}`;
    default:
      return "#";
  }
}
