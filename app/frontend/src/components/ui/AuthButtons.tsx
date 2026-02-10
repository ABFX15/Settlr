"use client";

import { useState, useEffect, Component, ReactNode } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

/* ---------- Error boundary: catches if usePrivy has no context ---------- */
class PrivyGuard extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/* ---------- Privy-powered buttons ---------- */
function PrivyDesktopButtons() {
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
          onClick={logout}
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

function PrivyMobileButtons() {
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
          onClick={logout}
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

/* ---------- Static fallback links (no Privy) ---------- */
function FallbackDesktop() {
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

function FallbackMobile() {
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

/* ---------- Exports ---------- */
export default function AuthButtons() {
  return (
    <PrivyGuard fallback={<FallbackDesktop />}>
      <PrivyDesktopButtons />
    </PrivyGuard>
  );
}

export function MobileAuthButtons() {
  return (
    <PrivyGuard fallback={<FallbackMobile />}>
      <PrivyMobileButtons />
    </PrivyGuard>
  );
}
