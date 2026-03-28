"use client";

import { ReactNode } from "react";
import { WalletProvider } from "@/providers/WalletProvider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
