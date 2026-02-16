"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { useEffect, useState, useMemo } from "react";
import { base, mainnet, arbitrum, polygon, optimism } from "viem/chains";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    setAppId(process.env.NEXT_PUBLIC_PRIVY_APP_ID || null);
  }, []);

  const rpcUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    []
  );

  if (!appId) {
    return <>{children}</>;
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#c8a2ff",
        },
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          solana: {
            createOnLogin: "all-users",
          },
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        supportedChains: [mainnet, base, arbitrum, polygon, optimism],
        solanaClusters: [
          {
            name: "mainnet-beta",
            rpcUrl,
          },
        ],
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
