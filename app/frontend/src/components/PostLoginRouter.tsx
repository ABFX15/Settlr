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
 * Skips redirect on public pages.
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
  const { access } = useWaitlistAccess();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (status === "loading" || access === "loading") return;

    if (status === "needs-onboarding" && !isPublicPath(pathname)) {
      hasRedirected.current = true;
      if (access === "approved") {
        // Approved but not onboarded — send to onboarding
        router.replace("/onboarding");
      } else {
        // Not approved — send to waitlist form
        router.replace("/waitlist");
      }
    }
  }, [status, access, pathname, router]);

  // Block direct access to protected pages
  useEffect(() => {
    if (
      status === "needs-onboarding" &&
      (pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/create")
    ) {
      if (access === "approved") {
        router.replace("/onboarding");
      } else if (access !== "loading") {
        router.replace("/waitlist");
      }
    }
  }, [status, access, pathname, router]);

  return null;
}
