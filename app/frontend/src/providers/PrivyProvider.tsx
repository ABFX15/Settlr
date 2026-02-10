"use client";

import { useEffect, useState, useRef, ReactNode } from "react";

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerRef = useRef<{ Comp: React.ComponentType<any>; config: any } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!appId) return;

    // Lazily load all heavy Privy + Solana + Viem dependencies at runtime
    Promise.all([
      import("@privy-io/react-auth"),
      import("@privy-io/react-auth/solana"),
      import("viem/chains"),
      import("@solana/kit"),
    ])
      .then(([privyMod, solanaMod, viemChains, solanaKit]) => {
        const solanaConnectors = solanaMod.toSolanaWalletConnectors({
          shouldAutoConnect: false,
        });

        const supportedEvmChains = [
          viemChains.mainnet,
          viemChains.base,
          viemChains.arbitrum,
          viemChains.polygon,
          viemChains.optimism,
        ];

        const solanaRpcs = {
          "solana:devnet": {
            rpc: solanaKit.createSolanaRpc("https://api.devnet.solana.com"),
            rpcSubscriptions: solanaKit.createSolanaRpcSubscriptions(
              "wss://api.devnet.solana.com"
            ),
            blockExplorerUrl:
              "https://explorer.solana.com/?cluster=devnet",
          },
        };

        providerRef.current = {
          Comp: privyMod.PrivyProvider,
          config: {
            appearance: {
              theme: "dark" as const,
              accentColor: "#f472b6",
              logo: "/logo-new.png",
              showWalletLoginFirst: true,
              walletChainType: "ethereum-and-solana" as const,
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
              ethereum: { createOnLogin: "users-without-wallets" },
              solana: { createOnLogin: "users-without-wallets" },
            },
            externalWallets: {
              solana: { connectors: solanaConnectors },
            },
            solana: { rpcs: solanaRpcs },
          },
        };
        setReady(true);
      })
      .catch((err) => {
        console.warn("[Settlr] Failed to load Privy dependencies:", err.message);
      });
  }, [appId]);

  if (!appId) {
    return <>{children}</>;
  }

  if (!mounted || !ready || !providerRef.current) {
    // Show children without Privy context while loading
    return <>{children}</>;
  }

  const { Comp, config } = providerRef.current;

  return (
    <Comp appId={appId} config={config}>
      {children}
    </Comp>
  );
}
