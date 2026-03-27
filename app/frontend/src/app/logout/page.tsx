"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { connected, disconnect } = useWallet();

  useEffect(() => {
    if (connected) {
      disconnect().then(() => {
        window.location.href = "/";
      });
    } else {
      window.location.href = "/";
    }
  }, [connected, disconnect]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B6B4A] mx-auto mb-4" />
        <p className="text-[#7C8A9E]">Disconnecting...</p>
      </div>
    </div>
  );
}
