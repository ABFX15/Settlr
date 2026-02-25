"use client";

import Link from "next/link";
import { BarChart3, ArrowLeft } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#1B6B4A]/15 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-[#1B6B4A]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0C1829] mb-3">
          Analytics Coming Soon
        </h1>
        <p className="text-[#7C8A9E] mb-6">
          Detailed payment analytics, revenue charts, and business insights will
          be available here.
        </p>
        <Link
          href="/client-dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B6B4A] hover:bg-[#2A9D6A] text-white font-medium rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
