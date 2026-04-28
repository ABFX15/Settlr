"use client";

import { FC, ReactNode, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@/components/WalletModal";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet"),
    [],
  );

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Pass an empty wallets array — all modern Solana wallets (Phantom,
  // Solflare, Backpack, Glow, Coinbase Wallet, OKX, Brave, Trust, etc.)
  // register themselves via the Wallet Standard, so wallet-adapter
  // auto-discovers any installed extension. Hard-coding adapters here
  // would limit users to only the listed wallets and double-up any that
  // also register via the standard.
  const wallets = useMemo(() => [], []);

  // Disable autoConnect on the admin route, or whenever ?pick=1 is in the
  // URL. Otherwise wallet-adapter silently re-grabs the previously trusted
  // wallet (typically Phantom) before the admin gets a chance to pick a
  // different one.
  const autoConnect = useMemo(() => {
    if (pathname?.startsWith("/admin")) return false;
    if (searchParams?.get("pick") === "1") return false;
    return true;
  }, [pathname, searchParams]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
