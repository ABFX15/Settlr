"use client";

import { FC, ReactNode, Suspense, useMemo } from "react";
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

/**
 * Inner provider — calls useSearchParams which Next 16 requires to live
 * inside a Suspense boundary so static prerendering doesn't bail out.
 */
const WalletProviderInner: FC<WalletProviderProps> = ({ children }) => {
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

  // Disable autoConnect on:
  //   - /admin (admin should pick a wallet explicitly)
  //   - ?pick=1 (force-pick override)
  //   - /login and /onboarding (Privy is the primary path; wallet-adapter
  //     should only connect when the user explicitly clicks "Connect
  //     existing Solana wallet". Otherwise it silently reconnects to the
  //     last trusted wallet — typically Phantom — the moment the Privy
  //     embedded wallet registers via the Wallet Standard, which then
  //     pops the Phantom signer right after a successful email login.)
  const autoConnect = useMemo(() => {
    if (pathname?.startsWith("/admin")) return false;
    if (pathname === "/login" || pathname === "/onboarding") return false;
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

/**
 * Public WalletProvider — wraps the inner provider in Suspense so that
 * useSearchParams() doesn't force every page that mounts this provider
 * to be dynamically rendered (Next 16 requirement).
 */
export const WalletProvider: FC<WalletProviderProps> = ({ children }) => (
  <Suspense fallback={null}>
    <WalletProviderInner>{children}</WalletProviderInner>
  </Suspense>
);
