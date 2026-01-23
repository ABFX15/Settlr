"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Gamepad2,
  ShoppingCart,
  Users,
  Palette,
} from "lucide-react";
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
    href: "/industries/creators",
    label: "Creators",
    icon: Palette,
    description: "Digital products & content",
  },
  {
    href: "/industries/ecommerce",
    label: "E-Commerce",
    icon: ShoppingCart,
    description: "Online stores & DTC",
  },
  {
    href: "/industries/b2b",
    label: "B2B & Freelancers",
    icon: Users,
    description: "Cross-border services",
  },
  {
    href: "/industries/igaming",
    label: "iGaming",
    icon: Gamepad2,
    description: "Casinos & betting",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const industriesRef = useRef<HTMLDivElement>(null);
  const { ready, authenticated, login, logout, user } = usePrivy();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isIndustriesActive = pathname.startsWith("/industries");

  // Close dropdown when clicking outside
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-new.png"
            alt="Settlr"
            width={100}
            height={28}
            priority
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}

          {/* Industries Dropdown */}
          <div ref={industriesRef} className="relative">
            <button
              onClick={() => setIndustriesOpen(!industriesOpen)}
              className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                isIndustriesActive
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Industries
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  industriesOpen ? "rotate-180" : ""
                }`}
              />
              {isIndustriesActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>

            <AnimatePresence>
              {industriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-2 shadow-xl backdrop-blur-xl"
                >
                  {industryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIndustriesOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        pathname === link.href
                          ? "bg-purple-500/20 text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                        <link.icon className="h-4 w-4 text-purple-400" />
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

        {/* Right Side - Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {ready && authenticated ? (
            <>
              <Link
                href="/client-dashboard"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={login}
                className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                Sign In
              </button>
              <Link
                href="/onboarding"
                className="rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl md:hidden"
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

              {/* Mobile Industries Section */}
              <div className="mt-2 border-t border-white/10 pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Industries
                </div>
                {industryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-white/5 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <link.icon className="h-4 w-4 text-purple-400" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                {ready && authenticated ? (
                  <>
                    <Link
                      href="/client-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-white/60"
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
                      className="rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white/60"
                    >
                      Sign In
                    </button>
                    <Link
                      href="/onboarding"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-3 text-center text-sm font-semibold text-white"
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
