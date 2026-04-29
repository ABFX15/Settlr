"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@/providers/PrivyProvider";

export default function ClientLayout({ children }: { children: ReactNode }) {
  // PrivyProvider self-no-ops if NEXT_PUBLIC_PRIVY_APP_ID isn't set,
  // so it's safe to mount globally. Wallet-adapter is mounted further
  // down (per-route in /admin and /onboarding) and the two coexist.
  return (
    <PrivyProvider>
      <main>{children}</main>
    </PrivyProvider>
  );
}
