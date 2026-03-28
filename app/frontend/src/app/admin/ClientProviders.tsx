"use client";

import { ReactNode, useMemo } from "react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

/**
 * Admin-only client providers — ConnectionProvider only.
 * Admin uses admin-secret auth + direct Phantom connection (window.phantom.solana).
 * We deliberately exclude SolanaWalletProvider/WalletModalProvider here
 * so the wallet-adapter never registers Phantom's global connection state,
 * which would leak the admin wallet into the user flow via autoConnect.
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet"),
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>
  );
}
