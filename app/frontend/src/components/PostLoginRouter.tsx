"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

/**
 * Invisible component that auto-redirects authenticated users who haven't
 * completed onboarding to /waitlist (gated access).
 *
 * Skips redirect when the user is already on /waitlist or on public pages
 * that don't require onboarding (marketing, docs, etc.).
 */

// Pages that should NOT trigger a redirect even when logged in
const PUBLIC_PATHS = [
  "/onboarding",
  "/waitlist",
  "/docs",
  "/learn",
  "/compare",
  "/demo",
  "/compliance",
  "/help",
  "/industries",
  "/products",
  "/pricing",
  "/integrations",
  "/send-payments",
  "/privacy",
  "/terms",
];

function isPublicPath(pathname: string): boolean {
  // Home page is always public
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export function PostLoginRouter() {
  const { status } = useOnboardingStatus();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once per session to avoid loops
    if (hasRedirected.current) return;

    if (status === "needs-onboarding" && !isPublicPath(pathname)) {
      hasRedirected.current = true;
      router.replace("/waitlist");
    }
  }, [status, pathname, router]);

  // Also redirect if they try to access protected pages directly
  useEffect(() => {
    if (
      status === "needs-onboarding" &&
      (pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/create")
    ) {
      router.replace("/waitlist");
    }
  }, [status, pathname, router]);

  return null;
}
