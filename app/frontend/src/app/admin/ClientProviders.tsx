"use client";

import { ReactNode } from "react";
import { WalletProvider } from "@/providers/WalletProvider";

/**
 * Admin-only client providers — NO Privy at all.
 * Admin uses admin-secret auth + direct Phantom connection.
 * This keeps admin completely isolated from the user auth flow.
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
