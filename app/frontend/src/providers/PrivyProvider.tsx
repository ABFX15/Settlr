"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { useEffect, useState, useMemo } from "react";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

// Solana RPC configuration for devnet
const SOLANA_DEVNET_RPC = "https://api.devnet.solana.com";
const SOLANA_DEVNET_WS = "wss://api.devnet.solana.com";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [mounted, setMounted] = useState(false);

  // Create Solana RPC configuration - memoized to avoid re-creating on each render
  const solanaRpcs = useMemo(
    () => ({
      "solana:devnet": {
        rpc: createSolanaRpc(SOLANA_DEVNET_RPC),
        rpcSubscriptions: createSolanaRpcSubscriptions(SOLANA_DEVNET_WS),
        blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
      },
    }),
    [],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!appId) {
    console.warn(
      "[Settlr] Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable embedded wallets.",
    );
    return <>{children}</>;
  }

  // Don't render on server
  if (!mounted) {
    return null;
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#1B6B4A",
          logo: "/logo-new.png",
          showWalletLoginFirst: false,
          walletChainType: "solana-only",
        },
        loginMethods: ["email"],
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        solana: {
          rpcs: solanaRpcs,
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
