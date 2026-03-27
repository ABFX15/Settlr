"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { ready, authenticated, logout } = usePrivy();

  useEffect(() => {
    if (!ready) return;
    if (authenticated) {
      logout().then(() => {
        window.location.href = "/";
      });
    } else {
      window.location.href = "/";
    }
  }, [ready, authenticated, logout]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B6B4A] mx-auto mb-4" />
        <p className="text-[#7C8A9E]">Signing out...</p>
      </div>
    </div>
  );
}
