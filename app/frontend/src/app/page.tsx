"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  DollarSign,
  Zap,
  AlertTriangle,
  FileCheck,
  Eye,
  Scale,
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ── Design tokens ─────────────────────────────────────── */
const p = {
  bg: "#FFFFFF",
  bgSubtle: "#FAFAFA",
  bgMuted: "#F5F5F5",
  navy: "#0A0F1E",
  slate: "#4A5568",
  muted: "#94A3B8",
  green: "#10B981",
  greenDark: "#059669",
  border: "#E5E7EB",
  borderSubtle: "#F0F0F0",
  red: "#EF4444",
  amber: "#F59E0B",
  white: "#FFFFFF",
};

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 260, damping: 24 };

/* ── Scroll-triggered reveal ───────────────────────────── */
function R({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated counter ──────────────────────────────────── */
function Counter({
  end,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = end / (duration * 60);
    const t = setInterval(() => {
      n += step;
      if (n >= end) {
        setVal(end);
        clearInterval(t);
      } else setVal(Math.floor(n));
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [inView, end, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

/* ── Floating notification cards (Sorbet-style hero treatment) ── */
const heroNotifications = [
  {
    label: "Settlement Complete",
    detail: "$47,500 → Pacific Distributors",
    time: "0.6s",
    position: "left-[2%] top-[18%] sm:left-[4%]",
  },
  {
    label: "KYB Verified",
    detail: "GreenLeaf Farms · CO",
    time: "Just now",
    position: "right-[2%] top-[12%] sm:right-[4%]",
  },
  {
    label: "Invoice Paid",
    detail: "$14,250 · Mountain Extracts",
    time: "0.8s",
    position: "left-[6%] bottom-[28%] sm:left-[8%]",
  },
  {
    label: "Compliance Check",
    detail: "OFAC · BSA/AML · Passed",
    time: "Real-time",
    position: "right-[4%] bottom-[32%] sm:right-[6%]",
  },
];

function FloatingCard({
  label,
  detail,
  time,
  position,
  delay,
}: {
  label: string;
  detail: string;
  time: string;
  position: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute ${position} z-20 hidden md:block`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay }}
    >
      <motion.div
        className="rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm"
        style={{
          background: "rgba(255,255,255,0.92)",
          border: `1px solid ${p.border}`,
          maxWidth: 220,
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 2,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ background: p.green }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: p.green }}
            />
          </span>
          <span className="text-[11px] font-bold" style={{ color: p.navy }}>
            {label}
          </span>
        </div>
        <p
          className="mt-1.5 text-[11px] leading-snug"
          style={{ color: p.slate }}
        >
          {detail}
        </p>
        <p className="mt-1 text-[10px] font-medium" style={{ color: p.muted }}>
          {time}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ── FAQ Item ──────────────────────────────────────────── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: p.white,
        boxShadow: open
          ? "0 4px 24px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        border: `1px solid ${open ? "rgba(16,185,129,0.25)" : p.border}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-8 py-6 text-left"
      >
        <span
          className="pr-4 text-base font-semibold"
          style={{ color: p.navy }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={springFast}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4" style={{ color: p.muted }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...spring, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-6">
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: p.slate }}
              >
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* card helper — soft shadow, hover lift */
const card =
  "rounded-3xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1";
const cardStatic =
  "rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md";
const cardBorder = `1px solid ${p.border}`;

/* ════════════════════════════════════════════════════════ */
/*  PAGE                                                   */
/* ════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      {/* Structured data — Organization (AEO entity) */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Settlr",
            url: "https://settlr.dev",
            logo: "https://settlr.dev/icon.svg",
            description:
              "Settlr is a non-custodial stablecoin settlement platform designed for B2B cannabis distributors and high-risk industries to process payments at a 1% flat fee.",
            foundingDate: "2025",
            areaServed: "US",
            sameAs: ["https://x.com/settlrp"],
            knowsAbout: [
              "Cannabis B2B payments",
              "Non-custodial stablecoin settlement",
              "High-risk merchant processing",
              "USDC payments on Solana",
              "GENIUS Act 2025 compliance",
              "BSA/AML KYB verification",
            ],
          }),
        }}
      />
      {/* Structured data — SoftwareApplication */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Settlr",
            url: "https://settlr.dev",
            applicationCategory: "FinanceApplication",
            operatingSystem: "All",
            description:
              "Enterprise payments for the debanked. Non-custodial USDC settlement for high-risk B2B supply chains.",
            offers: {
              "@type": "Offer",
              name: "Private Rail",
              price: "0",
              priceCurrency: "USD",
              description: "1% flat per transaction.",
              url: "https://settlr.dev/onboarding",
            },
            featureList: [
              "Non-custodial B2B settlement",
              "Instant finality on Solana",
              "GENIUS Act 2025 compliant",
              "Cryptographic audit trail",
              "BSA/AML integrated KYB",
              "Squads multisig treasury",
            ],
            sameAs: ["https://x.com/settlrp"],
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Settlr?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Settlr is non-custodial B2B stablecoin rails for cannabis and other high-risk industries.",
                },
              },
              {
                "@type": "Question",
                name: "Is Settlr compliant?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. GENIUS Act 2025-compliant stablecoins with BSA/AML KYB screening.",
                },
              },
              {
                "@type": "Question",
                name: "What are the fees?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "1% flat per transaction. No minimums, no hidden fees.",
                },
              },
              {
                "@type": "Question",
                name: "Does Settlr hold my funds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Non-custodial. Funds move peer-to-peer. We never have signing authority.",
                },
              },
            ],
          }),
        }}
      />
      {/* Structured data — BreadcrumbList */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://settlr.dev/",
              },
            ],
          }),
        }}
      />
      {/* Structured data — WebSite */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Settlr",
            url: "https://settlr.dev",
            description:
              "Non-custodial B2B stablecoin settlement for cannabis and high-risk industries.",
            publisher: {
              "@type": "Organization",
              name: "Settlr",
              url: "https://settlr.dev",
            },
          }),
        }}
      />

      <div
        className="min-h-screen"
        style={{ background: p.bg, color: p.slate }}
      >
        <Navbar />

        {/* ═══════════════════════════════════════════════ */}
        {/*  HERO                                          */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pb-32 pt-40 sm:pb-48 sm:pt-56">
          {/* Single soft gradient orb */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.15] blur-[120px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)",
              }}
            />
          </div>

          {/* Floating notification cards — Sorbet-style */}
          {heroNotifications.map((n, i) => (
            <FloatingCard key={n.label} {...n} delay={0.6 + i * 0.25} />
          ))}

          <div className="relative z-10 mx-auto max-w-5xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <R delay={0.06}>
                <h1
                  className="mt-10 text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[80px]"
                  style={{ color: p.navy }}
                >
                  Enterprise payments for the{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    debanked.
                  </span>
                </h1>
              </R>

              <R delay={0.12}>
                <p
                  className="mx-auto mt-8 max-w-lg text-lg leading-relaxed sm:text-xl"
                  style={{ color: p.slate }}
                >
                  Move capital with 100% certainty. We provide non-custodial
                  USDC settlement for high-risk B2B supply chains. No bank
                  interference, ever.
                </p>
              </R>

              <R
                delay={0.24}
                className="mt-14 flex flex-wrap items-center justify-center gap-4"
              >
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    boxShadow: "0 4px 24px rgba(16,185,129,0.25)",
                  }}
                >
                  Apply for the Private Rail
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold transition-all duration-200 hover:bg-gray-50"
                  style={{ border: `1px solid ${p.border}`, color: p.navy }}
                >
                  Watch Demo
                </Link>
              </R>

              {/* Muted trust line */}
              <R delay={0.3}>
                <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                  {[
                    "GENIUS Act Compliant",
                    "Non-Custodial",
                    "SOC 2 Ready",
                    "BSA/AML",
                  ].map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        style={{ color: p.muted }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: p.muted }}
                      >
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              </R>

              {/* AEO entity definition — crawlable by AI answer engines */}
              <p className="sr-only">
                Settlr is a non-custodial stablecoin settlement platform
                designed for B2B cannabis distributors and high-risk industries
                to process payments at a 1% flat fee. Built on Solana, Settlr
                provides instant USDC settlement with no bank interference,
                GENIUS Act 2025 compliance, BSA/AML-integrated KYB, and
                cryptographic audit trails. Traditional high-risk payment
                processors charge cannabis businesses between 5% and 9% per
                transaction. Settlr provides an alternative stablecoin rail at a
                1% flat fee with sub-second finality.
              </p>
            </div>

            {/* Product visual — dashboard mockup */}
            <R delay={0.34}>
              <div
                className="mx-auto mt-24 max-w-4xl overflow-hidden rounded-3xl"
                style={{
                  boxShadow:
                    "0 25px 80px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.03)",
                }}
              >
                {/* Browser chrome */}
                <div
                  className="flex items-center gap-2 px-5 py-3"
                  style={{
                    background: p.bgSubtle,
                    borderBottom: `1px solid ${p.border}`,
                  }}
                >
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                    <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <div
                    className="flex-1 text-center text-xs font-medium"
                    style={{ color: p.muted }}
                  >
                    settlr.dev/dashboard
                  </div>
                </div>
                {/* Stats row */}
                <div
                  className="grid grid-cols-3 gap-px"
                  style={{ background: p.border }}
                >
                  {[
                    { label: "Volume (30d)", value: "$2.4M", change: "+18%" },
                    {
                      label: "Avg. Settlement",
                      value: "3.2s",
                      change: "-0.4s",
                    },
                    {
                      label: "Transactions",
                      value: "1,847",
                      change: "+124",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="p-6"
                      style={{ background: p.bg }}
                    >
                      <p
                        className="text-xs font-medium"
                        style={{ color: p.muted }}
                      >
                        {s.label}
                      </p>
                      <p
                        className="mt-1 text-2xl font-bold tracking-tight"
                        style={{ color: p.navy }}
                      >
                        {s.value}
                      </p>
                      <p
                        className="mt-0.5 text-xs font-semibold"
                        style={{ color: p.green }}
                      >
                        {s.change}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Settlements list */}
                <div style={{ background: p.bg }}>
                  <div
                    className="px-5 py-3"
                    style={{ borderTop: `1px solid ${p.border}` }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: p.muted }}
                    >
                      Recent Settlements
                    </p>
                  </div>
                  {[
                    {
                      from: "GreenLeaf Farms",
                      to: "Pacific Distributors",
                      amount: "$47,500",
                      time: "0.6s",
                    },
                    {
                      from: "Mountain Extracts",
                      to: "Valley Wholesale",
                      amount: "$14,250",
                      time: "0.8s",
                    },
                    {
                      from: "Sunrise Cultivation",
                      to: "Metro Supply Co",
                      amount: "$8,900",
                      time: "0.9s",
                    },
                  ].map((row) => (
                    <div
                      key={row.from}
                      className="flex items-center justify-between px-5 py-3"
                      style={{ borderTop: `1px solid ${p.borderSubtle}` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            background: p.bgMuted,
                            color: p.slate,
                          }}
                        >
                          {row.from[0]}
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: p.navy }}
                        >
                          {row.from} → {row.to}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: p.navy }}
                        >
                          {row.amount}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{ background: p.bgMuted, color: p.slate }}
                        >
                          Settled · {row.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </R>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  DARK STATS BAR — contrast break               */}
        {/* ═══════════════════════════════════════════════ */}
        <section style={{ background: p.navy }}>
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <R>
              <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
                {[
                  { value: "$280K+", label: "Settled to date" },
                  { value: "<5s", label: "Time to finality" },
                  { value: "1%", label: "Flat fee" },
                  { value: "0", label: "Funds held in custody" },
                ].map((stat, i) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {stat.value}
                    </p>
                    <p
                      className="mt-2 text-sm font-medium"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </R>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  PROBLEM — Two cards only                      */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48">
          <div className="mx-auto max-w-5xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <p
                className="mb-5 text-sm font-semibold uppercase tracking-widest"
                style={{ color: p.muted }}
              >
                The Problem
              </p>
              <h2
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: p.navy }}
              >
                Legally compliant. Financially exiled.
              </h2>
              <p className="mt-5 text-lg" style={{ color: p.slate }}>
                State-legal businesses still can&apos;t access basic financial
                infrastructure.
              </p>
            </R>

            <div className="mt-20 grid gap-8 md:grid-cols-2">
              <R>
                <div
                  className={card}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "3rem",
                  }}
                >
                  <div
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(239,68,68,0.06)" }}
                  >
                    <DollarSign className="h-7 w-7" style={{ color: p.red }} />
                  </div>
                  <h3
                    className="mt-8 text-2xl font-bold"
                    style={{ color: p.navy }}
                  >
                    The &ldquo;High-Risk&rdquo; Tax
                  </h3>
                  <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    Processors charge 5–9% because you have no alternative. Your
                    margins disappear into someone else&apos;s bottom line.
                  </p>
                  <div className="mt-10 flex gap-10">
                    <div>
                      <p
                        className="text-4xl font-bold"
                        style={{ color: p.red }}
                      >
                        5–9%
                      </p>
                      <p className="mt-1 text-sm" style={{ color: p.muted }}>
                        Processing fees
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-4xl font-bold"
                        style={{ color: p.red }}
                      >
                        $12K+
                      </p>
                      <p className="mt-1 text-sm" style={{ color: p.muted }}>
                        Monthly overpayment
                      </p>
                    </div>
                  </div>
                </div>
              </R>

              <R delay={0.08}>
                <div
                  className={card}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "3rem",
                  }}
                >
                  <div
                    className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(245,158,11,0.06)" }}
                  >
                    <AlertTriangle
                      className="h-7 w-7"
                      style={{ color: p.amber }}
                    />
                  </div>
                  <h3
                    className="mt-8 text-2xl font-bold"
                    style={{ color: p.navy }}
                  >
                    Account Freezes &amp; Cash
                  </h3>
                  <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    Banks freeze accounts without warning. The
                    alternative&nbsp;— moving physical cash&nbsp;— is dangerous,
                    expensive, and impossible to scale.
                  </p>
                  <div className="mt-10 flex gap-10">
                    <div>
                      <p
                        className="text-4xl font-bold"
                        style={{ color: p.amber }}
                      >
                        72hrs
                      </p>
                      <p className="mt-1 text-sm" style={{ color: p.muted }}>
                        Avg. freeze duration
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-4xl font-bold"
                        style={{ color: p.amber }}
                      >
                        $0
                      </p>
                      <p className="mt-1 text-sm" style={{ color: p.muted }}>
                        Recourse available
                      </p>
                    </div>
                  </div>
                </div>
              </R>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  PRODUCT — mockups inside cards, not icons     */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
          <div className="mx-auto max-w-6xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <p
                className="mb-5 text-sm font-semibold uppercase tracking-widest"
                style={{ color: p.muted }}
              >
                How It Works
              </p>
              <h2
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: p.navy }}
              >
                Institutional rails. Zero custody.
              </h2>
              <p className="mt-5 text-lg" style={{ color: p.slate }}>
                A software layer&nbsp;— not a bank. Funds move peer-to-peer
                between vaults you control.
              </p>
            </R>

            <div className="mt-20 grid gap-6 md:grid-cols-2">
              {/* Featured — full width with vault-to-vault product mockup */}
              <R className="md:col-span-2">
                <div
                  className={`${cardStatic} relative overflow-hidden`}
                  style={{ background: p.white, border: cardBorder }}
                >
                  <div className="grid items-center gap-0 lg:grid-cols-2">
                    <div style={{ padding: "3rem 3rem 3rem 3.5rem" }}>
                      <h3
                        className="text-3xl font-bold"
                        style={{ color: p.navy }}
                      >
                        Non-custodial by design
                      </h3>
                      <p
                        className="mt-4 max-w-md text-base leading-relaxed"
                        style={{ color: p.slate }}
                      >
                        Funds move atomically from your vault to your
                        supplier&apos;s vault in a single Solana transaction.
                        Settlr never has signing authority.
                      </p>
                    </div>
                    {/* Product mockup — vault transfer visualization */}
                    <div className="px-6 pb-6 lg:px-8 lg:pb-8 lg:pt-8">
                      <div
                        className="rounded-2xl p-6"
                        style={{
                          background: p.bgSubtle,
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="rounded-xl px-4 py-3"
                            style={{
                              background: p.white,
                              border: `1px solid ${p.border}`,
                            }}
                          >
                            <p
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: p.muted }}
                            >
                              Your Vault
                            </p>
                            <p
                              className="mt-1 text-lg font-bold"
                              style={{ color: p.navy }}
                            >
                              $125,400
                            </p>
                            <p
                              className="text-[10px]"
                              style={{ color: p.muted }}
                            >
                              Squads 3/5 multisig
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-1 px-4">
                            <div className="flex items-center gap-1">
                              <div
                                className="h-px w-6 sm:w-10"
                                style={{ background: p.green }}
                              />
                              <Zap
                                className="h-3.5 w-3.5"
                                style={{ color: p.green }}
                              />
                              <div
                                className="h-px w-6 sm:w-10"
                                style={{ background: p.green }}
                              />
                            </div>
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: p.green }}
                            >
                              3.2s
                            </span>
                          </div>
                          <div
                            className="rounded-xl px-4 py-3"
                            style={{
                              background: p.white,
                              border: `1px solid ${p.border}`,
                            }}
                          >
                            <p
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: p.muted }}
                            >
                              Supplier
                            </p>
                            <p
                              className="mt-1 text-lg font-bold"
                              style={{ color: p.navy }}
                            >
                              +$47,500
                            </p>
                            <p
                              className="text-[10px]"
                              style={{ color: p.muted }}
                            >
                              Verified · CO License
                            </p>
                          </div>
                        </div>
                        <div
                          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2"
                          style={{
                            background: p.white,
                            border: `1px solid ${p.border}`,
                          }}
                        >
                          <CheckCircle2
                            className="h-3.5 w-3.5"
                            style={{ color: p.green }}
                          />
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: p.navy }}
                          >
                            Tx confirmed ·{" "}
                            <span style={{ color: p.muted }}>
                              Slot 284,291,003 · Fee $475 (1%)
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </R>

              {/* Instant finality — with settlement timeline mockup */}
              <R delay={0.06}>
                <div
                  className={`${card} flex h-full flex-col`}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "2.5rem",
                  }}
                >
                  <h3 className="text-2xl font-bold" style={{ color: p.navy }}>
                    Instant finality
                  </h3>
                  <p
                    className="mt-3 text-base leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    Invoices settle in seconds&nbsp;— not days. No
                    &ldquo;pending&rdquo; states. No ACH reversals.
                  </p>
                  {/* Mini timeline mockup */}
                  <div className="mt-auto pt-8">
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: p.bgSubtle,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <div className="space-y-3">
                        {[
                          {
                            label: "Invoice created",
                            time: "0.0s",
                            done: true,
                          },
                          { label: "Payment signed", time: "1.1s", done: true },
                          {
                            label: "On-chain confirmed",
                            time: "3.2s",
                            done: true,
                          },
                          {
                            label: "Receipt generated",
                            time: "3.4s",
                            done: true,
                          },
                        ].map((step, si) => (
                          <div
                            key={step.label}
                            className="flex items-center gap-3"
                          >
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full"
                              style={{
                                background: step.done ? p.green : p.bgMuted,
                              }}
                            >
                              {step.done && (
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <span
                              className="flex-1 text-xs font-medium"
                              style={{ color: p.navy }}
                            >
                              {step.label}
                            </span>
                            <span
                              className="text-[10px] font-bold tabular-nums"
                              style={{ color: p.muted }}
                            >
                              {step.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </R>

              {/* 1% flat — with fee comparison mockup */}
              <R delay={0.12}>
                <div
                  className={`${card} flex h-full flex-col`}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "2.5rem",
                  }}
                >
                  <h3 className="text-2xl font-bold" style={{ color: p.navy }}>
                    1% flat. That&apos;s it.
                  </h3>
                  <p
                    className="mt-3 text-base leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    No monthly minimums. No hidden markups. No processor
                    surcharges.
                  </p>
                  {/* Fee comparison mockup */}
                  <div className="mt-auto pt-8">
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: p.bgSubtle,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <p
                        className="mb-3 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: p.muted }}
                      >
                        On a $50,000 settlement
                      </p>
                      <div className="space-y-2.5">
                        {[
                          {
                            label: "High-risk processor",
                            fee: "$3,500",
                            pct: "7%",
                            color: p.red,
                            width: "70%",
                          },
                          {
                            label: "Cash + armored car",
                            fee: "$1,500",
                            pct: "3%",
                            color: p.amber,
                            width: "30%",
                          },
                          {
                            label: "Settlr",
                            fee: "$500",
                            pct: "1%",
                            color: p.green,
                            width: "10%",
                          },
                        ].map((row) => (
                          <div key={row.label}>
                            <div className="flex items-center justify-between text-[11px]">
                              <span
                                className="font-medium"
                                style={{ color: p.navy }}
                              >
                                {row.label}
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: row.color }}
                              >
                                {row.fee}{" "}
                                <span style={{ color: p.muted }}>
                                  ({row.pct})
                                </span>
                              </span>
                            </div>
                            <div
                              className="mt-1 h-2 overflow-hidden rounded-full"
                              style={{ background: p.bgMuted }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  background: row.color,
                                  width: row.width,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </R>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  COMPARISON                                    */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48">
          <div className="mx-auto max-w-5xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <p
                className="mb-5 text-sm font-semibold uppercase tracking-widest"
                style={{ color: p.muted }}
              >
                The Comparison
              </p>
              <h2
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: p.navy }}
              >
                See the difference
              </h2>
            </R>

            <R className="mt-16">
              <div
                className="overflow-hidden rounded-3xl shadow-sm"
                style={{ border: cardBorder }}
              >
                <table className="w-full text-sm" style={{ minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: p.bgSubtle }}>
                      <th
                        className="px-8 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: p.muted,
                          borderBottom: `1px solid ${p.border}`,
                        }}
                      >
                        Feature
                      </th>
                      <th
                        className="px-8 py-5 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: p.muted,
                          borderBottom: `1px solid ${p.border}`,
                        }}
                      >
                        Cash &amp; Armored Cars
                      </th>
                      <th
                        className="px-8 py-5 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: p.muted,
                          borderBottom: `1px solid ${p.border}`,
                        }}
                      >
                        High-Risk Processors
                      </th>
                      <th
                        className="px-8 py-5 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: p.green,
                          borderBottom: `1px solid ${p.border}`,
                        }}
                      >
                        Settlr
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        feature: "Transaction Fee",
                        cash: "2% + Security",
                        proc: "5.0–9.0%",
                        us: "1.0% Flat",
                      },
                      {
                        feature: "Settlement Speed",
                        cash: "Days",
                        proc: "3–5 Business Days",
                        us: "< 5 seconds",
                      },
                      {
                        feature: "Risk of Freeze",
                        cash: "High",
                        proc: "Very High",
                        us: "Zero",
                      },
                      {
                        feature: "Audit Trail",
                        cash: "Manual",
                        proc: "Fragmented",
                        us: "On-Chain",
                      },
                      {
                        feature: "Custody",
                        cash: "You (physical)",
                        proc: "They hold it",
                        us: "Non-custodial",
                      },
                    ].map((row, i) => (
                      <tr
                        key={row.feature}
                        style={{
                          borderBottom:
                            i < 4 ? `1px solid ${p.border}` : undefined,
                        }}
                      >
                        <td
                          className="px-8 py-5 font-semibold"
                          style={{ color: p.navy }}
                        >
                          {row.feature}
                        </td>
                        <td
                          className="px-8 py-5 text-center"
                          style={{ color: p.red }}
                        >
                          {row.cash}
                        </td>
                        <td
                          className="px-8 py-5 text-center"
                          style={{ color: p.red }}
                        >
                          {row.proc}
                        </td>
                        <td
                          className="px-8 py-5 text-center font-bold"
                          style={{ color: p.green }}
                        >
                          {row.us}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </R>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  THREE STEPS                                   */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
          <div className="mx-auto max-w-6xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <p
                className="mb-5 text-sm font-semibold uppercase tracking-widest"
                style={{ color: p.muted }}
              >
                Get Started
              </p>
              <h2
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: p.navy }}
              >
                Three steps to your first settlement
              </h2>
            </R>

            <div className="mt-20 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Verify your business",
                  desc: "Complete KYB verification in minutes. We check state licences, cannabis permits, and business entity.",
                  icon: FileCheck,
                  visual: (
                    <div className="mt-8 space-y-2.5">
                      {[
                        "Business Entity",
                        "State License",
                        "Beneficial Owners",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl px-4 py-3"
                          style={{
                            background: p.bgSubtle,
                            border: `1px solid ${p.border}`,
                          }}
                        >
                          <CheckCircle2
                            className="h-4 w-4"
                            style={{ color: p.muted }}
                          />
                          <span className="text-sm" style={{ color: p.navy }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  step: "02",
                  title: "Create an invoice",
                  desc: "Generate a settlement request or share a payment link. Your counterparty gets a simple checkout.",
                  icon: DollarSign,
                  visual: (
                    <div
                      className="mt-8 rounded-xl p-5"
                      style={{
                        background: p.bgSubtle,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-medium"
                          style={{ color: p.muted }}
                        >
                          Invoice #1047
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            background: p.bgMuted,
                            color: p.slate,
                          }}
                        >
                          Ready
                        </span>
                      </div>
                      <p
                        className="mt-3 text-3xl font-bold"
                        style={{ color: p.navy }}
                      >
                        $45,000
                      </p>
                      <p className="mt-1 text-xs" style={{ color: p.muted }}>
                        GreenLeaf Farms → Pacific Dist.
                      </p>
                    </div>
                  ),
                },
                {
                  step: "03",
                  title: "Settle instantly",
                  desc: "Payment moves peer-to-peer in under 5 seconds. Both parties get a cryptographic receipt.",
                  icon: Zap,
                  visual: (
                    <div
                      className="mt-8 rounded-xl p-5"
                      style={{
                        background: p.bgSubtle,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-5 w-5"
                          style={{ color: p.green }}
                        />
                        <span
                          className="text-sm font-bold"
                          style={{ color: p.navy }}
                        >
                          Settled
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {[
                          ["Time to finality", "3.2s"],
                          ["Platform fee", "$450 (1%)"],
                          ["Net to supplier", "$44,550"],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="flex justify-between text-xs"
                          >
                            <span style={{ color: p.muted }}>{label}</span>
                            <span
                              className="font-semibold"
                              style={{ color: p.navy }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ].map((item, i) => (
                <R key={item.step} delay={i * 0.08}>
                  <div
                    className={`${card} flex h-full flex-col`}
                    style={{
                      background: p.white,
                      border: cardBorder,
                      padding: "2.5rem",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="text-sm font-bold"
                        style={{ color: p.navy }}
                      >
                        {item.step}
                      </span>
                      <div
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: p.bgMuted }}
                      >
                        <item.icon
                          className="h-5 w-5"
                          style={{ color: p.slate }}
                        />
                      </div>
                    </div>
                    <h3
                      className="mt-6 text-xl font-bold"
                      style={{ color: p.navy }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-3 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      {item.desc}
                    </p>
                    {item.visual}
                  </div>
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  TRUST — Bento grid                            */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48">
          <div className="mx-auto max-w-6xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <p
                className="mb-5 text-sm font-semibold uppercase tracking-widest"
                style={{ color: p.muted }}
              >
                For Your CFO
              </p>
              <h2
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: p.navy }}
              >
                Built for the 2026 regulatory landscape
              </h2>
            </R>

            {/* Bento grid — asymmetric card sizes */}
            <div className="mt-20 grid gap-5 md:grid-cols-3 md:grid-rows-2">
              {/* Large — spans 2 cols */}
              <R className="md:col-span-2 md:row-span-1">
                <div
                  className={`${cardStatic} h-full`}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "2.5rem",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: p.bgMuted }}
                    >
                      <Scale className="h-5 w-5" style={{ color: p.slate }} />
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: p.navy }}
                      >
                        GENIUS Act 2025 Compliant
                      </h3>
                      <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: p.slate }}
                      >
                        Federal-framework payment stablecoins. USDC by Circle —
                        fully regulated, fully backed, fully audited. Not
                        algorithmic, not offshore.
                      </p>
                    </div>
                  </div>
                  {/* Inline compliance mockup */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      { label: "Stablecoin", value: "USDC", sub: "Circle" },
                      { label: "Framework", value: "GENIUS", sub: "Federal" },
                      { label: "Reserve", value: "1:1", sub: "US Treasuries" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl px-4 py-3"
                        style={{
                          background: p.bgSubtle,
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: p.muted }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="mt-1 text-lg font-bold"
                          style={{ color: p.navy }}
                        >
                          {item.value}
                        </p>
                        <p className="text-[10px]" style={{ color: p.muted }}>
                          {item.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </R>

              {/* Small — 1 col: Private Txn Receipt */}
              <R delay={0.06}>
                <div
                  className={`${cardStatic} relative flex h-full flex-col overflow-hidden`}
                  style={{
                    background: p.navy,
                    padding: 0,
                    minHeight: 260,
                  }}
                >
                  {/* Faint grid overlay */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-5 pt-5"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield
                        className="h-4 w-4"
                        style={{ color: "#10B981" }}
                      />
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        Private Receipt
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{
                        background: "rgba(16,185,129,0.15)",
                        color: "#10B981",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                      Verified
                    </span>
                  </div>

                  {/* Receipt body */}
                  <div
                    className="flex flex-1 flex-col gap-3 px-5 py-4"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    {/* Tx hash */}
                    <div>
                      <p
                        className="text-[9px] font-semibold uppercase tracking-wider"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      >
                        Tx Hash
                      </p>
                      <p
                        className="mt-0.5 font-mono text-[11px] font-medium"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        5Kj9…mR3x
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>
                          ●●●●
                        </span>
                        Qp7v
                      </p>
                    </div>

                    {/* From / To — redacted */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p
                          className="text-[9px] font-semibold uppercase tracking-wider"
                          style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                          From
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          />
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                          >
                            ██████.sol
                          </span>
                        </div>
                      </div>
                      <div>
                        <p
                          className="text-[9px] font-semibold uppercase tracking-wider"
                          style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                          To
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          />
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                          >
                            ██████.sol
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount + Timestamp */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p
                          className="text-[9px] font-semibold uppercase tracking-wider"
                          style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                          Amount
                        </p>
                        <p
                          className="mt-0.5 font-mono text-sm font-bold"
                          style={{ color: "#10B981" }}
                        >
                          $██,███
                          <span
                            className="text-[10px] font-normal"
                            style={{ color: "rgba(16,185,129,0.5)" }}
                          >
                            .██ USDC
                          </span>
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[9px] font-semibold uppercase tracking-wider"
                          style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                          Block
                        </p>
                        <p
                          className="mt-0.5 font-mono text-[11px]"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          #312,847,091
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom strip */}
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <span
                      className="text-[9px] font-medium"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      Solana Mainnet · 0.4s finality
                    </span>
                    <Lock
                      className="h-3 w-3"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                </div>
              </R>

              {/* Small — 1 col */}
              <R delay={0.1}>
                <div
                  className={`${cardStatic} h-full`}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "2.5rem",
                  }}
                >
                  <FileCheck className="h-6 w-6" style={{ color: p.slate }} />
                  <h3
                    className="mt-4 text-lg font-bold"
                    style={{ color: p.navy }}
                  >
                    BSA/AML Integrated
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    KYB heavy-lifting handled. State licences, beneficial
                    owners, OFAC SDN — all screened.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["KYB", "OFAC", "SDN", "BSA"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-3 py-1 text-[10px] font-bold"
                        style={{ background: p.bgMuted, color: p.slate }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </R>

              {/* Medium — spans 2 cols, compliance status dashboard */}
              <R delay={0.14} className="md:col-span-2">
                <div
                  className={`${cardStatic} h-full`}
                  style={{
                    background: p.white,
                    border: cardBorder,
                    padding: "2.5rem",
                  }}
                >
                  <p
                    className="mb-4 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: p.muted }}
                  >
                    Compliance Status — Live
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "GENIUS Act (2025)", status: "Compliant" },
                      { label: "BSA/AML Screening", status: "Active" },
                      { label: "KYB Verification", status: "Enforced" },
                      { label: "OFAC SDN Check", status: "Real-Time" },
                      { label: "On-Chain Audit Trail", status: "Immutable" },
                      { label: "SOC 2 Readiness", status: "In Progress" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{
                          background: p.bgSubtle,
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            className="h-3.5 w-3.5"
                            style={{ color: p.green }}
                          />
                          <span
                            className="text-xs font-medium"
                            style={{ color: p.navy }}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            background: "rgba(16,185,129,0.08)",
                            color: p.greenDark,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/compliance"
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ color: p.navy }}
                    >
                      Read our 2026 Compliance Whitepaper
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </R>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  INDUSTRIES                                    */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
          <div className="mx-auto max-w-6xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <p
                className="mb-5 text-sm font-semibold uppercase tracking-widest"
                style={{ color: p.muted }}
              >
                Industries
              </p>
              <h2
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: p.navy }}
              >
                Built for the businesses banks won&apos;t serve
              </h2>
            </R>

            <div className="mt-20 grid gap-8 md:grid-cols-2">
              {[
                {
                  title: "Cannabis & Wholesalers",
                  desc: "B2B settlement for state-licensed cultivators, processors, and distributors.",
                  href: "/industries/cannabis",
                  stats: ["40+ States", "$25B Market", "Non-Custodial"],
                  gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                },
                {
                  title: "Adult Content Platforms",
                  desc: "Creator payouts without deplatforming risk. 1% flat vs 8–15% processing.",
                  href: "/industries/adult-content",
                  stats: ["Instant Payouts", "No Chargebacks", "TEE Privacy"],
                  gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                },
              ].map((item, i) => (
                <R key={item.title} delay={i * 0.08}>
                  <Link href={item.href} className="group block">
                    <div
                      className="overflow-hidden rounded-3xl shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1"
                      style={{ background: p.white, border: cardBorder }}
                    >
                      <div
                        className="px-10 py-12 text-white"
                        style={{ background: item.gradient }}
                      >
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                        <p className="mt-3 text-base leading-relaxed text-white/80">
                          {item.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between px-10 py-6">
                        <div className="flex flex-wrap gap-3">
                          {item.stats.map((stat) => (
                            <span
                              key={stat}
                              className="rounded-full px-3 py-1 text-xs font-medium"
                              style={{
                                border: `1px solid ${p.border}`,
                                color: p.slate,
                              }}
                            >
                              {stat}
                            </span>
                          ))}
                        </div>
                        <ArrowUpRight
                          className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          style={{ color: p.muted }}
                        />
                      </div>
                    </div>
                  </Link>
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  FAQ                                           */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48">
          <div className="mx-auto max-w-3xl px-6">
            <R className="text-center">
              <h2
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: p.navy }}
              >
                Frequently asked questions
              </h2>
            </R>

            <div className="mt-16 space-y-4">
              {[
                {
                  q: "Is Settlr a bank?",
                  a: "No. Settlr is a non-custodial software layer. We never hold, control, or have signing authority over your funds. Money moves peer-to-peer between multisig vaults that you and your suppliers control.",
                },
                {
                  q: "What stablecoins do you use?",
                  a: "USDC issued by Circle \u2014 a GENIUS Act 2025-compliant payment stablecoin. Not algorithmic, not offshore, fully backed and audited.",
                },
                {
                  q: "How is this different from a high-risk processor?",
                  a: "High-risk processors charge 5\u20139% and can freeze your funds because they\u2019re custodial. Settlr charges 1% flat, settles instantly, and is non-custodial \u2014 there\u2019s nothing to freeze.",
                },
                {
                  q: "What does my auditor see?",
                  a: "Every transaction generates a cryptographically verifiable on-chain receipt. Amount, timestamp, sender, recipient \u2014 all immutable and tamper-proof.",
                },
                {
                  q: "Do I need crypto expertise?",
                  a: "No. You see invoices, settlements, and receipts. The blockchain runs underneath but your team never interacts with it directly.",
                },
              ].map((faq, i) => (
                <R key={faq.q} delay={i * 0.03}>
                  <FAQ q={faq.q} a={faq.a} />
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  FINAL CTA                                     */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-32 sm:py-48">
          <div className="mx-auto max-w-5xl px-6">
            <R>
              <div
                className="relative overflow-hidden rounded-[2rem] px-8 py-20 text-center sm:px-16 sm:py-28"
                style={{ background: p.navy }}
              >
                {/* Accent orb */}
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <h2
                    className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                    style={{ color: "#FFFFFF" }}
                  >
                    Stop paying the{" "}
                    <span
                      style={{
                        background: "linear-gradient(135deg, #10B981, #34D399)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      &ldquo;exile tax&rdquo;
                    </span>
                  </h2>
                  <p
                    className="mx-auto mt-6 max-w-md text-lg"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    We&apos;re onboarding a limited number of B2B operators for
                    the Private Rail.
                  </p>
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                    <Link
                      href="/waitlist"
                      className="group inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        boxShadow: "0 4px 24px rgba(16,185,129,0.3)",
                      }}
                    >
                      Apply for Onboarding
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href="/demo"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
                    >
                      See the Demo
                    </Link>
                  </div>
                </div>
              </div>
            </R>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
