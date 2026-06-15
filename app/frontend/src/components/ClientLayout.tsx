"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { PrivyProvider } from "@/providers/PrivyProvider";

export default function ClientLayout({ children }: { children: ReactNode }) {
  // PrivyProvider self-no-ops if NEXT_PUBLIC_PRIVY_APP_ID isn't set,
  // so it's safe to mount globally. Wallet-adapter is mounted further
  // down (per-route in /admin and /onboarding) and the two coexist.
  //
  // MotionConfig reducedMotion="user" makes every framer-motion animation
  // app-wide respect the OS "reduce motion" setting without per-component code.
  return (
    <MotionConfig reducedMotion="user">
      <PrivyProvider>
        <main>{children}</main>
      </PrivyProvider>
    </MotionConfig>
  );
}
