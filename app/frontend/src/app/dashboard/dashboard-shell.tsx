"use client";

import {
  DashboardSidebar,
  DashboardTopBar,
} from "@/components/ui/DashboardSidebar";
import { WalletSessionProvider } from "@/hooks/useWalletSession";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // Establish a server-verified session by signing a one-time nonce on
  // wallet connect. Provided via context so child components (e.g.
  // dashboard/page.tsx) can read the session status without triggering
  // their own duplicate signMessage prompt.
  return (
    <WalletSessionProvider>
      <div className="flex min-h-screen bg-[#f7f7f7] text-[#212121]">
        <DashboardSidebar />
        <main className="flex-1 pt-14 lg:pt-0">
          <DashboardTopBar />
          <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
        </main>
      </div>
    </WalletSessionProvider>
  );
}
