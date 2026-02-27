"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogo } from "@/components/settlr-logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Zap,
  FileCheck,
  Play,
  BookOpen,
  Leaf,
  Film,
  LinkIcon,
  FileText,
  Truck,
  GraduationCap,
  Scale,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/help", label: "Support" },
];

const resourceLinks = [
  {
    href: "/learn",
    label: "Knowledge Hub",
    icon: GraduationCap,
    description: "Guides, costs & compliance answers",
  },
  {
    href: "/compare",
    label: "Compare Providers",
    icon: Scale,
    description: "Settlr vs cash, high-risk processors",
  },
  {
    href: "/demo",
    label: "Demo",
    icon: Play,
    description: "See a live B2B settlement",
  },
  {
    href: "/docs",
    label: "Documentation",
    icon: BookOpen,
    description: "API reference and integration guides",
  },
  {
    href: "/compliance",
    label: "Compliance Whitepaper",
    icon: FileCheck,
    description: "GENIUS Act & BSA/AML framework",
  },
];

const productLinks = [
  {
    href: "/products/payment-links",
    label: "Payment Links",
    icon: LinkIcon,
    description: "Shareable links for instant settlement",
  },
  {
    href: "/products/invoices",
    label: "Invoices",
    icon: FileText,
    description: "B2B invoice settlement on-chain",
  },
];

const industryLinks = [
  {
    href: "/industries/cannabis",
    label: "Cannabis & Wholesalers",
    icon: Leaf,
    description: "B2B settlement for state-legal operators",
  },
  {
    href: "/industries/cannabis-b2b-payments",
    label: "Cannabis B2B Payments",
    icon: Truck,
    description: "Supply-chain settlement without cash or banks",
  },
  {
    href: "/industries/adult-content",
    label: "Adult Content Platforms",
    icon: Film,
    description: "Creator payouts without deplatforming risk",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const industriesRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const { ready, authenticated, login, logout } = usePrivy();

  // Determine where the primary CTA should link to
  const { status: onboardingStatus } = useOnboardingStatus();
  const ctaHref =
    onboardingStatus === "onboarded" ? "/merchant" : "/onboarding";
  const ctaLabel =
    onboardingStatus === "onboarded" ? "Dashboard" : "Get Started";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isProductsActive =
    pathname === "/settlement" ||
    pathname === "/vaults" ||
    pathname === "/audit";
  const isIndustriesActive = pathname.startsWith("/industries");
  const isResourcesActive =
    pathname === "/demo" ||
    pathname === "/docs" ||
    pathname === "/learn" ||
    pathname.startsWith("/compare");

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        productsRef.current &&
        !productsRef.current.contains(event.target as Node)
      ) {
        setProductsOpen(false);
      }
      if (
        industriesRef.current &&
        !industriesRef.current.contains(event.target as Node)
      ) {
        setIndustriesOpen(false);
      }
      if (
        resourcesRef.current &&
        !resourcesRef.current.contains(event.target as Node)
      ) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogo size="sm" variant="dark" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#0A0F1E]"
                  : "text-[#94A3B8] hover:text-[#0A0F1E]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#10B981]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}

          {/* Products Dropdown */}
          <div ref={productsRef} className="relative">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                isProductsActive
                  ? "text-[#0A0F1E]"
                  : "text-[#94A3B8] hover:text-[#0A0F1E]"
              }`}
            >
              Products
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  productsOpen ? "rotate-180" : ""
                }`}
              />
              {isProductsActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#10B981]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>

            <AnimatePresence>
              {productsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white/98 p-2 shadow-xl backdrop-blur-xl"
                >
                  {productLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setProductsOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        pathname === link.href
                          ? "bg-[#10B981]/5 text-[#0A0F1E]"
                          : "text-[#4A5568] hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/10">
                        <link.icon className="h-4 w-4 text-[#059669]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-[#94A3B8]">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Industries Dropdown */}
          <div ref={industriesRef} className="relative">
            <button
              onClick={() => setIndustriesOpen(!industriesOpen)}
              className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                isIndustriesActive
                  ? "text-[#0A0F1E]"
                  : "text-[#94A3B8] hover:text-[#0A0F1E]"
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
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#10B981]"
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
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-[#E5E7EB] bg-white/98 p-2 shadow-xl backdrop-blur-xl"
                >
                  {industryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIndustriesOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        pathname === link.href
                          ? "bg-[#10B981]/5 text-[#0A0F1E]"
                          : "text-[#4A5568] hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/10">
                        <link.icon className="h-4 w-4 text-[#059669]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-[#94A3B8]">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resources Dropdown */}
          <div ref={resourcesRef} className="relative">
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                isResourcesActive
                  ? "text-[#0A0F1E]"
                  : "text-[#94A3B8] hover:text-[#0A0F1E]"
              }`}
            >
              Resources
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  resourcesOpen ? "rotate-180" : ""
                }`}
              />
              {isResourcesActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#10B981]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>

            <AnimatePresence>
              {resourcesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white/98 p-2 shadow-xl backdrop-blur-xl"
                >
                  {resourceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setResourcesOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        pathname === link.href ||
                        pathname.startsWith(link.href + "/")
                          ? "bg-[#10B981]/5 text-[#0A0F1E]"
                          : "text-[#4A5568] hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/10">
                        <link.icon className="h-4 w-4 text-[#059669]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-[#94A3B8]">
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
                href={ctaHref}
                className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#0A0F1E] transition-all hover:bg-[#F0F0F0]"
              >
                {ctaLabel}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={login}
                className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
              >
                Sign In
              </button>
              <Link
                href="/waitlist"
                className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                }}
              >
                Request Access
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0F1E] md:hidden"
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
            className="border-b border-[#E5E7EB] bg-white/98 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-[#10B981]/5 text-[#0A0F1E]"
                      : "text-[#94A3B8] hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Products Section */}
              <div className="mt-2 border-t border-[#E5E7EB] pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Products
                </div>
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#10B981]/5 text-[#0A0F1E]"
                        : "text-[#94A3B8] hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                    }`}
                  >
                    <link.icon className="h-4 w-4 text-[#059669]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Industries Section */}
              <div className="mt-2 border-t border-[#E5E7EB] pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Industries
                </div>
                {industryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#10B981]/5 text-[#0A0F1E]"
                        : "text-[#94A3B8] hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                    }`}
                  >
                    <link.icon className="h-4 w-4 text-[#059669]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Resources Section */}
              <div className="mt-2 border-t border-[#E5E7EB] pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Resources
                </div>
                {resourceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#10B981]/5 text-[#0A0F1E]"
                        : "text-[#94A3B8] hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                    }`}
                  >
                    <link.icon className="h-4 w-4 text-[#059669]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-[#E5E7EB] pt-4">
                {ready && authenticated ? (
                  <>
                    <Link
                      href={ctaHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-center text-sm font-medium text-[#0A0F1E]"
                    >
                      {ctaLabel}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-full px-4 py-3 text-sm font-medium text-[#94A3B8]"
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
                      className="rounded-full border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#94A3B8]"
                    >
                      Sign In
                    </button>
                    <Link
                      href="/waitlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-full px-4 py-3 text-center text-sm font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      }}
                    >
                      Request Access
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
