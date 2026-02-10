"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/demo", label: "Demo" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Support" },
];

const industryLinks = [
  {
    href: "/industries/ai-saas",
    label: "AI / SaaS",
    description: "Payments when Stripe says no",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const industriesRef = useRef<HTMLDivElement>(null);
  const { ready, authenticated, login, logout } = usePrivy();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isIndustriesActive = pathname.startsWith("/industries");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        industriesRef.current &&
        !industriesRef.current.contains(event.target as Node)
      ) {
        setIndustriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogoWithIcon size="sm" variant="light" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                isActive(link.href)
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-[13px] left-0 right-0 h-px bg-[var(--accent)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}

          {/* Industries Dropdown */}
          <div ref={industriesRef} className="relative">
            <button
              onClick={() => setIndustriesOpen(!industriesOpen)}
              className={`relative flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
                isIndustriesActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Industries
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  industriesOpen ? "rotate-180" : ""
                }`}
              />
              {isIndustriesActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-[13px] left-0 right-0 h-px bg-[var(--accent)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>

            <AnimatePresence>
              {industriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-3 w-56 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-xl"
                >
                  {industryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIndustriesOpen(false)}
                      className={`flex flex-col gap-0.5 rounded-md px-3 py-2.5 transition-colors ${
                        pathname === link.href
                          ? "bg-[var(--accent-muted)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span className="text-sm font-medium">{link.label}</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {link.description}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side - Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {ready && authenticated ? (
            <>
              <Link
                href="/client-dashboard"
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--border-hover)]"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={login}
                className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              >
                Sign In
              </button>
              <Link
                href="/onboarding"
                className="rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-sm font-semibold text-[#09090b] transition-all hover:shadow-[0_0_16px_var(--accent-glow)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--card)] hover:text-[var(--text-primary)] md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-[var(--card)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-1 border-t border-[var(--border)] pt-2">
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Industries
                </div>
                {industryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex flex-col rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[var(--card)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
                {ready && authenticated ? (
                  <>
                    <Link
                      href="/client-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-center text-sm font-medium text-[var(--text-primary)]"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--text-muted)]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        login();
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-md border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-[var(--text-muted)]"
                    >
                      Sign In
                    </button>
                    <Link
                      href="/onboarding"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md bg-[var(--accent)] px-3 py-2.5 text-center text-sm font-semibold text-[#09090b]"
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
