"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#34c759]/10">
        <BarChart3 className="h-10 w-10 text-[#34c759]" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-[#212121]">
        Analytics Coming Soon
      </h1>
      <p className="mb-6 max-w-sm text-sm text-[#5c5c5c]">
        Detailed payment analytics, revenue charts, and business insights will
        be available here.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-[#34c759] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#2ba048]"
      >
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}
