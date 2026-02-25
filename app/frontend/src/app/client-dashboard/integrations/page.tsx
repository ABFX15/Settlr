"use client";

import Link from "next/link";
import { Key, ArrowLeft, ExternalLink } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#1B6B4A]/15 flex items-center justify-center mx-auto mb-6">
          <Key className="w-10 h-10 text-[#1B6B4A]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0C1829] mb-3">Integrations</h1>
        <p className="text-[#7C8A9E] mb-6">
          Connect Settlr to your ecommerce platform, website, or app using our
          SDK.
        </p>
        <div className="space-y-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#1B6B4A] hover:bg-[#2A9D6A] text-white font-medium rounded-xl transition-colors"
          >
            View Documentation
            <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/api-keys"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-[#F3F2ED] hover:bg-[#F3F2ED] text-[#0C1829] font-medium rounded-xl transition-colors"
          >
            <Key className="w-4 h-4" />
            Manage API Keys
          </Link>
          <Link
            href="/client-dashboard"
            className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 text-[#7C8A9E] hover:text-[#0C1829] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
