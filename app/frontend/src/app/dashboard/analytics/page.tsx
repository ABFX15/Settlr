"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00ff41]/10">
        <BarChart3 className="h-10 w-10 text-[#00ff41]" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-white">
        Analytics Coming Soon
      </h1>
      <p className="mb-6 max-w-sm text-sm text-[#666]">
        Detailed payment analytics, revenue charts, and business insights will
        be available here.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-[#00ff41] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00dd38]"
      >
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}
