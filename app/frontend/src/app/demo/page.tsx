"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Demo merchant wallet
    const demoWallet = "Ac52MMouwRypY7WPxMnUGwi6ZDRuBDgbmt9aXKSp43By";
    // Redirect to embedded wallet checkout
    router.push(
      `/checkout?amount=5.00&merchant=Demo%20Coffee%20Shop&to=${demoWallet}&memo=Latte%20%26%20Pastry`
    );
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Loading demo...</p>
    </main>
  );
}
