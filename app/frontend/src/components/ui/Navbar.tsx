"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Palette } from "lucide-react";

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
    label: "AI/SaaS (Stripe-blocked)",
    icon: Palette,
    description: "Launch payments when Stripe blocks you",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const industriesRef = useRef<HTMLDivElement>(null);

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#060608]/70 backdrop-blur-2xl backdrop-saturate-150">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogoWithIcon size="sm" variant="light" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#c8a2ff]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}

          <div ref={industriesRef} className="relative">
            <button
              onClick={() => setIndustriesOpen(!industriesOpen)}
              className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                isIndustriesActive
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              AI/SaaS
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  industriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {industriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-white/[0.08] bg-[#0a0a10]/95 p-2 shadow-2xl backdrop-blur-2xl"
                >
                  {industryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIndustriesOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        pathname === link.href
                          ? "bg-white/[0.08] text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8a2ff]/15">
                        <link.icon className="h-4 w-4 text-[#c8a2ff]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-white/40">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/onboarding"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#060608] transition-all hover:bg-white/90 hover:shadow-lg hover:shadow-white/10"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/[0.06] bg-[#060608]/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-white/5 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-white/10 pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  AI/SaaS
                </div>
                {industryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <link.icon className="h-4 w-4 text-[#c8a2ff]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-[#060608]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
