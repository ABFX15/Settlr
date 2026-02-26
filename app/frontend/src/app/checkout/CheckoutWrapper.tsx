"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const CheckoutClient = dynamic(() => import("./CheckoutClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#1B6B4A] animate-spin mx-auto mb-4" />
        <p className="text-[#7C8A9E]">Loading checkout...</p>
      </div>
    </div>
  ),
});

export default function CheckoutWrapper() {
  const searchParams = useSearchParams();
  return <CheckoutClient searchParams={searchParams} />;
}
