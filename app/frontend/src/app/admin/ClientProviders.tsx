"use client";

import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@/components/WalletModal";

/**
 * Admin-only client providers.
 *
 * We rely on wallet-adapter's select + autoConnect lifecycle.
 * Admin page clears walletName and disconnects before opening modal to keep
 * wallet choice explicit.
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_RPC_URL ||
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      clusterApiUrl("devnet"),
    [],
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
