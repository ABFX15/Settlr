"use client";

import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

// Note: Using Privy for embedded wallets, no wallet adapter UI needed

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet"),
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>
  );
};
