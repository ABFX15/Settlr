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
    description: "Non-custodial settlement without deplatforming risk",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const industriesRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";

  // Scroll-based transparency (homepage only)
  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // When transparent (top of homepage): white text, no bg
  const transparent = isHome && !scrolled;

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
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-[#E5E7EB] bg-white/90 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogo size="sm" variant={transparent ? "light" : "dark"} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                transparent
                  ? "text-white/90 hover:text-white"
                  : isActive(link.href)
                  ? "text-[#0C1829]"
                  : "text-[#7C8A9E] hover:text-[#0C1829]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#1B6B4A]"
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
                transparent
                  ? "text-white/90 hover:text-white"
                  : isProductsActive
                  ? "text-[#0C1829]"
                  : "text-[#7C8A9E] hover:text-[#0C1829]"
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
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#1B6B4A]"
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
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white/98 p-2 shadow-lg backdrop-blur-sm"
                >
                  {productLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setProductsOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        pathname === link.href
                          ? "bg-[#1B6B4A]/5 text-[#0C1829]"
                          : "text-[#3B4963] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B4A]/10">
                        <link.icon className="h-4 w-4 text-[#155939]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-[#7C8A9E]">
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
                transparent
                  ? "text-white/90 hover:text-white"
                  : isIndustriesActive
                  ? "text-[#0C1829]"
                  : "text-[#7C8A9E] hover:text-[#0C1829]"
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
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#1B6B4A]"
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
                  className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-[#E5E7EB] bg-white/98 p-2 shadow-lg backdrop-blur-sm"
                >
                  {industryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIndustriesOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        pathname === link.href
                          ? "bg-[#1B6B4A]/5 text-[#0C1829]"
                          : "text-[#3B4963] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B4A]/10">
                        <link.icon className="h-4 w-4 text-[#155939]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-[#7C8A9E]">
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
                transparent
                  ? "text-white/90 hover:text-white"
                  : isResourcesActive
                  ? "text-[#0C1829]"
                  : "text-[#7C8A9E] hover:text-[#0C1829]"
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
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#1B6B4A]"
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
                  className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white/98 p-2 shadow-lg backdrop-blur-sm"
                >
                  {resourceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setResourcesOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        pathname === link.href ||
                        pathname.startsWith(link.href + "/")
                          ? "bg-[#1B6B4A]/5 text-[#0C1829]"
                          : "text-[#3B4963] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B6B4A]/10">
                        <link.icon className="h-4 w-4 text-[#155939]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{link.label}</div>
                        <div className="text-xs text-[#7C8A9E]">
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

        {/* Right Side - CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/waitlist"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1B6B4A 0%, #155939 100%)",
            }}
          >
            Request Access
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className={`rounded-lg p-2 transition-colors md:hidden ${
            transparent
              ? "text-white hover:bg-white/10"
              : "text-[#7C8A9E] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
          }`}
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
                      ? "bg-[#1B6B4A]/5 text-[#0C1829]"
                      : "text-[#7C8A9E] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Products Section */}
              <div className="mt-2 border-t border-[#E5E7EB] pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#7C8A9E]">
                  Products
                </div>
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#1B6B4A]/5 text-[#0C1829]"
                        : "text-[#7C8A9E] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
                    }`}
                  >
                    <link.icon className="h-4 w-4 text-[#155939]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Industries Section */}
              <div className="mt-2 border-t border-[#E5E7EB] pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#7C8A9E]">
                  Industries
                </div>
                {industryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#1B6B4A]/5 text-[#0C1829]"
                        : "text-[#7C8A9E] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
                    }`}
                  >
                    <link.icon className="h-4 w-4 text-[#155939]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Resources Section */}
              <div className="mt-2 border-t border-[#E5E7EB] pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#7C8A9E]">
                  Resources
                </div>
                {resourceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#1B6B4A]/5 text-[#0C1829]"
                        : "text-[#7C8A9E] hover:bg-[#F9FAFB] hover:text-[#0C1829]"
                    }`}
                  >
                    <link.icon className="h-4 w-4 text-[#155939]" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-[#E5E7EB] pt-4">
                <Link
                  href="/waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full px-4 py-3 text-center text-sm font-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #1B6B4A 0%, #155939 100%)",
                  }}
                >
                  Request Access
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
