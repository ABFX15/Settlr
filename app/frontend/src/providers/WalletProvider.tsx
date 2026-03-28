"use client";

import { FC, ReactNode, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * 1. On first mount: disconnect any stale wallet state (prevents admin wallet leak).
 * 2. When user picks a wallet from the modal: call connect() explicitly
 *    (needed because autoConnect is OFF).
 * 3. Clear wallet-adapter's localStorage entry so nothing persists across sessions.
 */
function WalletGate({ children }: { children: ReactNode }) {
  const { wallet, select, connect, disconnect, connected, connecting } =
    useWallet();
  const userSelected = useRef(false);
  const didCleanup = useRef(false);

  // ── Step 1: On mount, wipe any stale wallet connection ──
  useEffect(() => {
    if (didCleanup.current) return;
    didCleanup.current = true;

    // Remove wallet-adapter's localStorage key so it doesn't auto-select a wallet
    try {
      localStorage.removeItem("walletName");
    } catch {}

    // If Phantom is globally connected (e.g. from admin), disconnect it
    try {
      const provider =
        (window as any)?.phantom?.solana || (window as any)?.solana;
      if (provider?.isConnected) {
        provider.disconnect().catch(() => {});
      }
    } catch {}

    // If wallet-adapter already picked up a wallet, deselect it
    if (wallet) {
      select(null as any);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 2: When user explicitly picks a wallet from the modal ──
  const prevWallet = useRef<typeof wallet>(null);
  useEffect(() => {
    // Only process changes after initial cleanup
    if (!didCleanup.current) return;

    if (wallet && wallet !== prevWallet.current) {
      // This is a genuine user selection
      userSelected.current = true;
      if (!connected && !connecting) {
        connect().catch(() => {});
      }
    }
    prevWallet.current = wallet;
  }, [wallet, connect, connected, connecting]);

  // ── Step 3: On unmount, clean up ──
  useEffect(() => {
    return () => {
      try {
        localStorage.removeItem("walletName");
      } catch {}
    };
  }, []);

  return <>{children}</>;
}

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet"),
    [],
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets}>
        <WalletModalProvider>
          <WalletGate>{children}</WalletGate>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
