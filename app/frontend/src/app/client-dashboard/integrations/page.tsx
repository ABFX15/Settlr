"use client";

import Link from "next/link";
import { Key, ArrowLeft, ExternalLink } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#a78bfa]/20 flex items-center justify-center mx-auto mb-6">
          <Key className="w-10 h-10 text-[#a78bfa]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Integrations</h1>
        <p className="text-white/50 mb-6">
          Connect Settlr to your ecommerce platform, website, or app using our
          SDK.
        </p>
        <div className="space-y-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-purple-600 hover:bg-[#a78bfa] text-white font-medium rounded-xl transition-colors"
          >
            View Documentation
            <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/api-keys"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-white/[0.06] hover:bg-white/[0.08] text-white font-medium rounded-xl transition-colors"
          >
            <Key className="w-4 h-4" />
            Manage API Keys
          </Link>
          <Link
            href="/client-dashboard"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
