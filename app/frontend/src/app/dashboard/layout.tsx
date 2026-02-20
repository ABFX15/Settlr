"use client";

import {
  DashboardSidebar,
  DashboardTopBar,
} from "@/components/ui/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#050507] text-white">
      <DashboardSidebar />
      <main className="flex-1 pt-14 lg:pt-0">
        <DashboardTopBar />
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
