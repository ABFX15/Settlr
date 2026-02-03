"use client";

import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <Settings className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Settings Coming Soon
        </h1>
        <p className="text-zinc-400 mb-6">
          Account settings, notification preferences, and security options will
          be available here.
        </p>
        <Link
          href="/client-dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
