"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import { PostLoginRouter } from "@/components/PostLoginRouter";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <WalletProvider>
        <PostLoginRouter />
        <main>{children}</main>
      </WalletProvider>
    </PrivyProvider>
  );
}
