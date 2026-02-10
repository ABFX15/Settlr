"use client";

import Link from "next/link";
import { BarChart3, ArrowLeft } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#a78bfa]/20 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-[#a78bfa]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Analytics Coming Soon
        </h1>
        <p className="text-white/50 mb-6">
          Detailed payment analytics, revenue charts, and business insights will
          be available here.
        </p>
        <Link
          href="/client-dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-[#a78bfa] text-white font-medium rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
