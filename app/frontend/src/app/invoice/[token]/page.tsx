"use client";

import dynamic from "next/dynamic";
import { use } from "react";
import { Loader2 } from "lucide-react";

// Dynamically import the invoice client to avoid SSR issues with Privy Solana hooks
// (thread-stream / pino pulled in by @walletconnect/logger are Node.js-only)
const InvoicePayClient = dynamic(() => import("./InvoicePayClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#1B6B4A] animate-spin mx-auto mb-4" />
        <p className="text-[#7C8A9E]">Loading invoice...</p>
      </div>
    </div>
  ),
});

export default function InvoicePayPage({
  params: paramsPromise,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(paramsPromise);
  return <InvoicePayClient token={token} />;
}
