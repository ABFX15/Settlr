"use client";

import Link from "next/link";

/**
 * Auth buttons that always render a safe fallback.
 * When Privy is configured, the PrivyAuthButtons component
 * (loaded dynamically from ClientLayout) will replace these.
 */
export default function AuthButtons() {
  return (
    <>
      <Link
        href="/waitlist"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign In
      </Link>
      <Link
        href="/onboarding"
        className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Get Started
      </Link>
    </>
  );
}

export function MobileAuthButtons() {
  return (
    <>
      <Link
        href="/waitlist"
        className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground"
      >
        Sign In
      </Link>
      <Link
        href="/onboarding"
        className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
      >
        Get Started
      </Link>
    </>
  );
}
