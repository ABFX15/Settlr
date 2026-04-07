"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the invoice client to avoid SSR issues with Privy Solana hooks
// (thread-stream / pino pulled in by @walletconnect/logger are Node.js-only)
const InvoicePayClient = dynamic(() => import("./InvoicePayClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#00ff41] animate-spin mx-auto mb-4" />
        <p className="text-[#666]">Loading invoice...</p>
      </div>
    </div>
  ),
});

export default function InvoiceWrapper({ token }: { token: string }) {
  return <InvoicePayClient token={token} />;
}
