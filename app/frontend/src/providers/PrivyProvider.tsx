"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { useEffect, useState, useMemo } from "react";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Solana wallet connectors only on client-side
  const solanaConnectors = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    try {
      return toSolanaWalletConnectors({
        shouldAutoConnect: false,
      });
    } catch (e) {
      console.warn("[Settlr] Failed to initialize Solana connectors:", e);
      return undefined;
    }
  }, []);

  if (!appId) {
    console.warn(
      "[Settlr] Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable embedded wallets."
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

