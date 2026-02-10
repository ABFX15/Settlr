"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/industries/ai-saas", label: "AI/SaaS" },
  { href: "/demo", label: "Demo" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Support" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { ready, authenticated, login, logout } = usePrivy();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogoWithIcon size="sm" variant="light" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-[calc(0.5rem+1px)] left-1 right-1 h-px bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right side - Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {ready && authenticated ? (
            <>
              <Link
                href="/client-dashboard"
                className="rounded-md border border-border bg-muted px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign Out
              </button>
            </>
          ) : (
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
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                {ready && authenticated ? (
                  <>
                    <Link
                      href="/client-dashboard"
                      className="rounded-md border border-border bg-muted px-4 py-2.5 text-center text-sm font-medium text-foreground"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
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
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
