"use client";

import { useMemo } from "react";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Initialize Solana wallet connectors inside component to ensure browser environment
  const solanaConnectors = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    try {
      return toSolanaWalletConnectors();
    } catch (e) {
      console.warn(
        "[Settlr] Failed to initialize Solana wallet connectors:",
        e
      );
      return undefined;
    }
  }, []);

  if (!appId) {
    console.warn(
      "[Settlr] Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable embedded wallets."
    );
    return <>{children}</>;
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#f472b6",
          logo: "/logo-new.png",
          showWalletLoginFirst: false,
          walletChainType: "solana-only",
        },
        loginMethods: ["email", "wallet"],
        externalWallets: solanaConnectors
          ? {
              solana: {
                connectors: solanaConnectors,
              },
            }
          : undefined,
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
