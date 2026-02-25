"use client";

import { Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1B6B4A]/10">
        <Settings className="h-10 w-10 text-[#1B6B4A]" />
      </div>
      <h1 className="mb-3 text-2xl font-bold">Settings Coming Soon</h1>
      <p className="mb-6 max-w-sm text-sm text-[#7C8A9E]">
        Account settings, notification preferences, and security options will be
        available here.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-[#1B6B4A] px-6 py-3 text-sm font-semibold text-[#0C1829] transition-colors hover:bg-[#2A9D6A]/80"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
