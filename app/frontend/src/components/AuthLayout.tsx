"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import { PostLoginRouter } from "@/components/PostLoginRouter";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider>
      <WalletProvider>
        <PostLoginRouter />
        {children}
      </WalletProvider>
    </PrivyProvider>
  );
}
