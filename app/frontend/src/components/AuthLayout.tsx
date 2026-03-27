"use client";

import { ReactNode } from "react";
import { WalletProvider } from "@/providers/WalletProvider";
import { PostLoginRouter } from "@/components/PostLoginRouter";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <PostLoginRouter />
      {children}
    </WalletProvider>
  );
}
