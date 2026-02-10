"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

/* Dynamically loaded auth buttons -- avoids crashing when Privy context is absent */
const AuthButtons = dynamic(() => import("@/components/ui/AuthButtons"), {
  ssr: false,
  loading: () => (
    <Link
      href="/onboarding"
      className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
    >
      Get Started
    </Link>
  ),
});

const MobileAuthButtons = dynamic(
  () => import("@/components/ui/AuthButtons").then((m) => m.MobileAuthButtons),
  {
    ssr: false,
    loading: () => (
      <Link
        href="/onboarding"
        className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
      >
        Get Started
      </Link>
    ),
  }
);

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
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
          <AuthButtons />
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
                <MobileAuthButtons />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
