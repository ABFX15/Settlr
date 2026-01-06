"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { useEffect, useState } from "react";
import { base, mainnet, arbitrum, polygon, optimism } from "viem/chains";

// Create Solana wallet connectors for Phantom, Solflare, etc.
const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: false,
});

// Supported EVM chains for USDC payments
const supportedEvmChains = [mainnet, base, arbitrum, polygon, optimism];

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          showWalletLoginFirst: true,
          walletChainType: "ethereum-and-solana",
          walletList: [
            "detected_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "phantom",
            "solflare",
            "backpack",
          ],
        },
        loginMethods: ["wallet", "email"],
        supportedChains: supportedEvmChains,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
