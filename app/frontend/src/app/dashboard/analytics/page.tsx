"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#a78bfa]/10">
        <BarChart3 className="h-10 w-10 text-[#a78bfa]" />
      </div>
      <h1 className="mb-3 text-2xl font-bold">Analytics Coming Soon</h1>
      <p className="mb-6 max-w-sm text-sm text-white/50">
        Detailed payment analytics, revenue charts, and business insights will
        be available here.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-[#a78bfa] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a78bfa]/80"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
