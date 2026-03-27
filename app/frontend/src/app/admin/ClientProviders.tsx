"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { WalletProvider } from "@/providers/WalletProvider";

/**
 * Admin-only client providers — no PostLoginRouter redirect.
 * Admin page handles its own auth state.
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <WalletProvider>{children}</WalletProvider>
    </PrivyProvider>
  );
}
