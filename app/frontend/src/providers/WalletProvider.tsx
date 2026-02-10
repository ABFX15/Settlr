"use client";

import { FC, ReactNode, useMemo, useState, useEffect } from "react";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const [ConnectionProviderComp, setConnectionProviderComp] = useState<
    React.ComponentType<{ endpoint: string; children: ReactNode }> | null
  >(null);

  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
    []
  );

  useEffect(() => {
    // Dynamically import to avoid SSR issues with wallet adapter
    import("@solana/wallet-adapter-react")
      .then((mod) => {
        setConnectionProviderComp(() => mod.ConnectionProvider);
      })
      .catch((err) => {
        console.warn("[Settlr] Wallet adapter not available:", err.message);
      });
  }, []);

  if (!ConnectionProviderComp) {
    return <>{children}</>;
  }

  return (
    <ConnectionProviderComp endpoint={endpoint}>
      {children}
    </ConnectionProviderComp>
  );
};
