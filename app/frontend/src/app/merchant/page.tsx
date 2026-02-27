"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /merchant now redirects to /dashboard where all vault + payment
 * management lives in one place.
 */
export default function MerchantRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
      <p className="text-sm text-[#7C8A9E]">Redirecting to dashboard…</p>
    </div>
  );
}
