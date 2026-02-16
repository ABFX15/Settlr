"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { WalletProvider } from "@/providers/WalletProvider";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <WalletProvider>
        <main>{children}</main>
      </WalletProvider>
    </PrivyProvider>
  );
}
