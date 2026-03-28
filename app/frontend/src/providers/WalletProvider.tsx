"use client";

import { FC, ReactNode, useMemo, useEffect, useRef } from "react";
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
 * Bridges the gap when autoConnect is OFF:
 * when the user picks a wallet from the modal, `select()` fires
 * but `connect()` never does. This component watches for a new
 * wallet selection and calls connect() explicitly.
 */
function ConnectOnSelect({ children }: { children: ReactNode }) {
  const { wallet, connect, connected, connecting } = useWallet();
  const prevWallet = useRef(wallet);

  useEffect(() => {
    if (wallet && wallet !== prevWallet.current && !connected && !connecting) {
      connect().catch(() => {});
    }
    prevWallet.current = wallet;
  }, [wallet, connect, connected, connecting]);

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
          <ConnectOnSelect>{children}</ConnectOnSelect>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
