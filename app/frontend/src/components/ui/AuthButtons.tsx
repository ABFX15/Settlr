"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyStatus } from "@/providers/PrivyStatusContext";

/* ── Privy-connected buttons (only rendered when Privy context exists) ── */

function PrivyDesktop() {
  const { ready, authenticated, login, logout } = usePrivy();

  if (!ready) {
    return <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />;
  }

  if (authenticated) {
    return (
      <>
        <Link
          href="/client-dashboard"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
        <button
          onClick={() => logout()}
          className="rounded-md border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <button
        onClick={login}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign In
      </button>
      <Link
        href="/onboarding"
        className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Get Started
      </Link>
    </>
  );
}

function PrivyMobile() {
  const { ready, authenticated, login, logout } = usePrivy();

  if (!ready) {
    return <div className="h-10 animate-pulse rounded-md bg-muted" />;
  }

  if (authenticated) {
    return (
      <>
        <Link
          href="/client-dashboard"
          className="rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground"
        >
          Dashboard
        </Link>
        <button
          onClick={() => logout()}
          className="rounded-md bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <button
        onClick={login}
        className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground"
      >
        Sign In
      </button>
      <Link
        href="/onboarding"
        className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
      >
        Get Started
      </Link>
    </>
  );
}

/* ── Static fallback (shown while Privy is loading or not configured) ── */

function FallbackDesktop() {
  return (
    <>
      <Link
        href="/onboarding"
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

function FallbackMobile() {
  return (
    <>
      <Link
        href="/onboarding"
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

/* ── Exports: check PrivyStatus context before deciding which to render ── */

export default function AuthButtons() {
  const { available } = usePrivyStatus();
  if (!available) return <FallbackDesktop />;
  return <PrivyDesktop />;
}

export function MobileAuthButtons() {
  const { available } = usePrivyStatus();
  if (!available) return <FallbackMobile />;
  return <PrivyMobile />;
}
