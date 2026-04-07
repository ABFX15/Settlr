"use client";

import {
  DashboardSidebar,
  DashboardTopBar,
} from "@/components/ui/DashboardSidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <DashboardSidebar />
      <main className="flex-1 pt-14 lg:pt-0">
        <DashboardTopBar />
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
