"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useWaitlistAccess } from "@/hooks/useWaitlistAccess";

/**
 * Invisible component that auto-redirects authenticated users:
 *  - Approved on waitlist but not onboarded → /onboarding
 *  - Not approved / no entry → /waitlist (the form)
 *
 * Only redirects from protected merchant pages (dashboard, create).
 * Customer-facing pages (checkout, invoice, demo, etc.) never redirect.
 */

// Pages that require merchant onboarding — redirect fires here
const PROTECTED_PATHS = ["/dashboard", "/create"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export function PostLoginRouter() {
  const { status } = useOnboardingStatus();
  const { access } = useWaitlistAccess();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (status === "loading" || access === "loading") return;

    // Only redirect from protected merchant pages
    if (status === "needs-onboarding" && isProtectedPath(pathname)) {
      hasRedirected.current = true;
      if (access === "approved") {
        router.replace("/onboarding");
      } else {
        router.replace("/waitlist");
      }
    }
  }, [status, access, pathname, router]);

  // Block direct access to protected pages (same logic, no hasRedirected guard)
  useEffect(() => {
    if (status === "needs-onboarding" && isProtectedPath(pathname)) {
      if (access === "approved") {
        router.replace("/onboarding");
      } else if (access !== "loading") {
        router.replace("/waitlist");
      }
    }
  }, [status, access, pathname, router]);

  return null;
}
