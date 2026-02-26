"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Shield,
  Lock,
  DollarSign,
  Zap,
  AlertTriangle,
  Banknote,
  FileCheck,
  Eye,
  Scale,
  X,
  ArrowUpRight,
  Clock,
  Globe,
  Fingerprint,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ── Design tokens ─────────────────────────────────────── */
const palette = {
  bg: "#FFFFFF",
  bgSubtle: "#FAFAFA",
  bgMuted: "#F5F5F5",
  navy: "#0A0F1E",
  slate: "#4A5568",
  muted: "#94A3B8",
  green: "#10B981",
  greenDark: "#059669",
  greenDeep: "#047857",
  greenGlow: "rgba(16,185,129,0.15)",
  greenBorder: "rgba(16,185,129,0.2)",
  border: "#E5E7EB",
  borderSubtle: "#F0F0F0",
  red: "#EF4444",
  amber: "#F59E0B",
  white: "#FFFFFF",
};

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 260, damping: 24 };

/* ── Reveal ─────────────────────────────────────────────── */
function Reveal({
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Animated counter ─────────────────────────────────── */
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
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ── Live Settlement Ticker ───────────────────────────── */
function SettlementTicker() {
  const settlements = [
    { from: "CO Cultivator", to: "OR Distributor", amount: 14250, time: 0.8 },
    { from: "CA Processor", to: "NV Retailer", amount: 47500, time: 0.6 },
    { from: "MI Grower", to: "IL Dispensary", amount: 8900, time: 0.9 },
    { from: "WA Extractor", to: "AZ Distributor", amount: 32000, time: 0.7 },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % settlements.length),
      3800,
    );
    return () => clearInterval(t);
  }, []);
  const tx = settlements[idx];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tx.from}
        className="inline-flex items-center gap-3 rounded-full border px-5 py-2.5 backdrop-blur-sm"
        style={{
          background: "rgba(255,255,255,0.8)",
          borderColor: palette.border,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={springFast}
      >
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: palette.green }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: palette.green }}
          />
        </span>
        <span className="text-xs font-medium" style={{ color: palette.slate }}>
          <span style={{ color: palette.greenDark, fontWeight: 700 }}>
            ${tx.amount.toLocaleString()}
          </span>{" "}
          settled · {tx.from} → {tx.to}{" "}
          <span style={{ color: palette.muted }}>· {tx.time}s</span>
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── FAQ Item ─────────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        borderColor: open ? palette.greenBorder : palette.border,
        background: open ? "rgba(16,185,129,0.02)" : palette.white,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span
          className="pr-4 text-[15px] font-semibold"
          style={{ color: palette.navy }}
        >
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={springFast}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4" style={{ color: palette.muted }} />
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
            <div className="px-6 pb-5">
              <p
                className="text-sm leading-relaxed"
                style={{ color: palette.slate }}
              >
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
/*  PAGE                                                   */
/* ════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      {/* Structured data */}
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
              "The Settlement Layer for Restricted Commerce. Non-custodial B2B stablecoin rails for the cannabis industry. 1% flat, instant settlement, zero bank dependency.",
            offers: {
              "@type": "Offer",
              name: "Private Rail",
              price: "0",
              priceCurrency: "USD",
              description:
                "1% flat per transaction. No monthly minimums. No hidden fees.",
              url: "https://settlr.dev/onboarding",
            },
            featureList: [
              "Non-custodial B2B settlement",
              "Instant finality on Solana",
              "GENIUS Act 2025 compliant stablecoins",
              "Cryptographic audit trail",
              "BSA/AML integrated KYB",
              "Squads multisig treasury",
            ],
            sameAs: ["https://twitter.com/SettlrPay"],
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
                  text: "Settlr is the settlement layer for restricted commerce — non-custodial B2B stablecoin rails built for cannabis and other high-risk industries.",
                },
              },
              {
                "@type": "Question",
                name: "Is Settlr compliant with federal regulations?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Settlr exclusively uses GENIUS Act 2025-compliant payment stablecoins and integrates BSA/AML Know Your Business (KYB) screening.",
                },
              },
              {
                "@type": "Question",
                name: "What are the fees?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "1% flat per transaction. No monthly minimums, no hidden FX markups, no processor surcharges.",
                },
              },
              {
                "@type": "Question",
                name: "Does Settlr hold my funds?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Settlr is non-custodial. Funds move peer-to-peer from your vault to your supplier's vault. We never have signing authority.",
                },
              },
            ],
          }),
        }}
      />

      <div
        className="min-h-screen"
        style={{ background: palette.bg, color: palette.slate }}
      >
        <Navbar />

        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden pb-24 pt-36 sm:pb-32 sm:pt-48">
          {/* Subtle gradient orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)",
              }}
            />
            <div
              className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <SettlementTicker />
              </Reveal>

              <Reveal delay={0.06}>
                <h1
                  className="mt-8 text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
                  style={{ color: palette.navy }}
                >
                  The Settlement Layer for{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Restricted Commerce
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p
                  className="mx-auto mt-6 max-w-xl text-lg leading-relaxed sm:text-xl"
                  style={{ color: palette.slate }}
                >
                  Non-custodial B2B stablecoin rails for cannabis, adult
                  content, and every industry banks refuse to serve.{" "}
                  <span
                    className="font-semibold"
                    style={{ color: palette.navy }}
                  >
                    1% flat. Instant settlement.
                  </span>
                </p>
              </Reveal>

              <Reveal
                delay={0.18}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    boxShadow: "0 4px 24px rgba(16,185,129,0.3)",
                  }}
                >
                  Request Access
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-sm font-semibold transition-all duration-200 hover:bg-gray-50"
                  style={{
                    borderColor: palette.border,
                    color: palette.navy,
                  }}
                >
                  Watch Demo
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Reveal>

              {/* Trust badges */}
              <Reveal delay={0.26}>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                  {[
                    "GENIUS Act Compliant",
                    "Non-Custodial",
                    "SOC 2 Ready",
                    "BSA/AML",
                  ].map((badge) => (
                    <div key={badge} className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        style={{ color: palette.green }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: palette.muted }}
                      >
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Hero product visual */}
            <Reveal delay={0.3}>
              <div
                className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border shadow-2xl"
                style={{
                  borderColor: palette.border,
                  boxShadow:
                    "0 25px 80px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                {/* Mock dashboard header */}
                <div
                  className="flex items-center gap-2 border-b px-5 py-3"
                  style={{
                    background: palette.bgSubtle,
                    borderColor: palette.border,
                  }}
                >
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div
                    className="flex-1 text-center text-xs font-medium"
                    style={{ color: palette.muted }}
                  >
                    settlr.dev/dashboard
                  </div>
                </div>
                {/* Mock dashboard content */}
                <div
                  className="grid grid-cols-3 gap-px"
                  style={{ background: palette.border }}
                >
                  {[
                    { label: "Volume (30d)", value: "$2.4M", change: "+18%" },
                    {
                      label: "Avg. Settlement",
                      value: "3.2s",
                      change: "-0.4s",
                    },
                    { label: "Transactions", value: "1,847", change: "+124" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-5"
                      style={{ background: palette.bg }}
                    >
                      <p
                        className="text-xs font-medium"
                        style={{ color: palette.muted }}
                      >
                        {stat.label}
                      </p>
                      <p
                        className="mt-1 text-2xl font-bold tracking-tight"
                        style={{ color: palette.navy }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="mt-0.5 text-xs font-semibold"
                        style={{ color: palette.green }}
                      >
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Recent settlements */}
                <div style={{ background: palette.bg }}>
                  <div
                    className="border-t px-5 py-3"
                    style={{ borderColor: palette.border }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: palette.muted }}
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
                      className="flex items-center justify-between border-t px-5 py-3"
                      style={{ borderColor: palette.borderSubtle }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            background: palette.greenGlow,
                            color: palette.greenDark,
                          }}
                        >
                          {row.from[0]}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: palette.navy }}
                          >
                            {row.from} → {row.to}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: palette.navy }}
                        >
                          {row.amount}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{
                            background: palette.greenGlow,
                            color: palette.greenDark,
                          }}
                        >
                          Settled · {row.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ STATS BAR ═══ */}
        <section
          className="border-y py-16"
          style={{ borderColor: palette.border }}
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-12 px-6 sm:gap-20">
            {[
              { value: 1, suffix: "%", label: "Flat fee", prefix: "" },
              { value: 5, suffix: "s", label: "Settlement time", prefix: "<" },
              { value: 0, suffix: "", label: "Bank dependency", prefix: "" },
              {
                value: 280,
                suffix: "K+",
                label: "Settled this quarter",
                prefix: "$",
              },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06}>
                <div className="text-center">
                  <p
                    className="text-4xl font-bold tracking-tight sm:text-5xl"
                    style={{ color: palette.navy }}
                  >
                    <Counter
                      end={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                    />
                  </p>
                  <p
                    className="mt-1 text-sm font-medium"
                    style={{ color: palette.muted }}
                  >
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ PROBLEM — BENTO GRID ═══ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p
                className="mb-4 text-sm font-semibold uppercase tracking-widest"
                style={{ color: palette.red }}
              >
                The Problem
              </p>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: palette.navy }}
              >
                Legally compliant. Financially exiled.
              </h2>
              <p
                className="mt-4 text-base leading-relaxed"
                style={{ color: palette.slate }}
              >
                You operate a state-legal business, yet the financial system
                treats you like a liability.
              </p>
            </Reveal>

            {/* Bento grid — 2 large + 1 tall right */}
            <div className="mt-16 grid gap-4 md:grid-cols-3">
              {/* Big card left */}
              <Reveal className="md:col-span-2">
                <div
                  className="relative overflow-hidden rounded-2xl border p-8 sm:p-10"
                  style={{
                    borderColor: palette.border,
                    background: palette.bg,
                  }}
                >
                  <div
                    className="absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-40 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(239,68,68,0.1), transparent 70%)",
                    }}
                  />
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(239,68,68,0.08)" }}
                  >
                    <DollarSign
                      className="h-6 w-6"
                      style={{ color: palette.red }}
                    />
                  </div>
                  <h3
                    className="mt-6 text-2xl font-bold"
                    style={{ color: palette.navy }}
                  >
                    The &ldquo;High-Risk&rdquo; Tax
                  </h3>
                  <p
                    className="mt-3 max-w-lg text-base leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    Traditional processors charge 5–9% because they know you
                    have no other choice. Your margins shrink while theirs grow.
                    Every quarter, you lose tens of thousands in fees that go
                    straight to someone else&apos;s bottom line.
                  </p>
                  <div className="mt-6 flex gap-6">
                    <div>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: palette.red }}
                      >
                        5–9%
                      </p>
                      <p className="text-xs" style={{ color: palette.muted }}>
                        Processing fees
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: palette.red }}
                      >
                        $12K+
                      </p>
                      <p className="text-xs" style={{ color: palette.muted }}>
                        Monthly overpayment
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Stacked right */}
              <div className="flex flex-col gap-4">
                <Reveal delay={0.06}>
                  <div
                    className="rounded-2xl border p-6"
                    style={{
                      borderColor: palette.border,
                      background: palette.bg,
                    }}
                  >
                    <div
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: "rgba(245,158,11,0.08)" }}
                    >
                      <AlertTriangle
                        className="h-5 w-5"
                        style={{ color: palette.amber }}
                      />
                    </div>
                    <h3
                      className="mt-4 text-lg font-bold"
                      style={{ color: palette.navy }}
                    >
                      Account Freezes
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: palette.slate }}
                    >
                      Banks can freeze your operating accounts for &ldquo;manual
                      review,&rdquo; paralyzing your supply chain for weeks.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.12}>
                  <div
                    className="rounded-2xl border p-6"
                    style={{
                      borderColor: palette.border,
                      background: palette.bg,
                    }}
                  >
                    <div
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: "rgba(239,68,68,0.08)" }}
                    >
                      <Banknote
                        className="h-5 w-5"
                        style={{ color: palette.red }}
                      />
                    </div>
                    <h3
                      className="mt-4 text-lg font-bold"
                      style={{ color: palette.navy }}
                    >
                      The Cash Burden
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: palette.slate }}
                    >
                      Moving physical cash is dangerous, expensive, and an
                      accounting nightmare. It doesn&apos;t scale.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRODUCT — BENTO GRID ═══ */}
        <section
          className="py-24 sm:py-32"
          style={{ background: palette.bgSubtle }}
        >
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p
                className="mb-4 text-sm font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                How it works
              </p>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: palette.navy }}
              >
                Institutional rails. Zero custody.
              </h2>
              <p
                className="mt-4 text-base leading-relaxed"
                style={{ color: palette.slate }}
              >
                Settlr is a software layer — not a bank. Funds move peer-to-peer
                between multisig vaults that you and your suppliers control.
              </p>
            </Reveal>

            {/* 3-col bento */}
            <div className="mt-16 grid gap-4 md:grid-cols-3">
              {/* Feature 1 — spans 2 cols */}
              <Reveal className="md:col-span-2">
                <div
                  className="relative h-full overflow-hidden rounded-2xl border p-8 sm:p-10"
                  style={{
                    borderColor: palette.border,
                    background: palette.bg,
                  }}
                >
                  <div
                    className="absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-30 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)",
                    }}
                  />
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: palette.greenGlow }}
                  >
                    <Lock
                      className="h-6 w-6"
                      style={{ color: palette.greenDark }}
                    />
                  </div>
                  <h3
                    className="mt-6 text-2xl font-bold"
                    style={{ color: palette.navy }}
                  >
                    Non-custodial by design
                  </h3>
                  <p
                    className="mt-3 max-w-lg text-base leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    Funds move atomically from your vault to your
                    supplier&apos;s vault in a single Solana transaction. At no
                    point does Settlr (or any Settlr-controlled wallet) have
                    unilateral control over your funds.
                  </p>
                  {/* Mini flow diagram */}
                  <div className="mt-8 flex items-center gap-4">
                    <div
                      className="flex items-center gap-2 rounded-xl border px-4 py-3"
                      style={{ borderColor: palette.border }}
                    >
                      <Lock
                        className="h-4 w-4"
                        style={{ color: palette.green }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: palette.navy }}
                      >
                        Your Vault
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="h-px w-6"
                        style={{ background: palette.green }}
                      />
                      <Zap
                        className="h-4 w-4"
                        style={{ color: palette.green }}
                      />
                      <div
                        className="h-px w-6"
                        style={{ background: palette.green }}
                      />
                    </div>
                    <div
                      className="flex items-center gap-2 rounded-xl border px-4 py-3"
                      style={{ borderColor: palette.border }}
                    >
                      <Shield
                        className="h-4 w-4"
                        style={{ color: palette.green }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: palette.navy }}
                      >
                        Supplier Vault
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Feature 2 — tall right */}
              <Reveal delay={0.06}>
                <div
                  className="flex h-full flex-col rounded-2xl border p-8"
                  style={{
                    borderColor: palette.border,
                    background: palette.bg,
                  }}
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: palette.greenGlow }}
                  >
                    <Zap
                      className="h-6 w-6"
                      style={{ color: palette.greenDark }}
                    />
                  </div>
                  <h3
                    className="mt-6 text-xl font-bold"
                    style={{ color: palette.navy }}
                  >
                    Instant finality
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    Invoices settle in seconds — not days. No
                    &ldquo;pending&rdquo; states. No ACH reversals. Final means
                    final.
                  </p>
                  <div className="mt-auto pt-8">
                    <div
                      className="rounded-xl border p-4 text-center"
                      style={{
                        borderColor: palette.border,
                        background: palette.bgSubtle,
                      }}
                    >
                      <p
                        className="text-3xl font-bold"
                        style={{ color: palette.green }}
                      >
                        &lt;5s
                      </p>
                      <p
                        className="mt-1 text-xs font-medium"
                        style={{ color: palette.muted }}
                      >
                        Average settlement
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Feature 3 */}
              <Reveal delay={0.08}>
                <div
                  className="rounded-2xl border p-8"
                  style={{
                    borderColor: palette.border,
                    background: palette.bg,
                  }}
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: palette.greenGlow }}
                  >
                    <DollarSign
                      className="h-6 w-6"
                      style={{ color: palette.greenDark }}
                    />
                  </div>
                  <h3
                    className="mt-6 text-xl font-bold"
                    style={{ color: palette.navy }}
                  >
                    1% flat. That&apos;s it.
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    No monthly minimums. No hidden FX markups. No processor
                    surcharges. One number, always.
                  </p>
                </div>
              </Reveal>

              {/* Feature 4 */}
              <Reveal delay={0.1}>
                <div
                  className="rounded-2xl border p-8"
                  style={{
                    borderColor: palette.border,
                    background: palette.bg,
                  }}
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: palette.greenGlow }}
                  >
                    <Eye
                      className="h-6 w-6"
                      style={{ color: palette.greenDark }}
                    />
                  </div>
                  <h3
                    className="mt-6 text-xl font-bold"
                    style={{ color: palette.navy }}
                  >
                    On-chain audit trail
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    Every transaction generates a cryptographically verifiable
                    receipt. Immutable, tamper-proof, auditor-friendly.
                  </p>
                </div>
              </Reveal>

              {/* Feature 5 */}
              <Reveal delay={0.12}>
                <div
                  className="rounded-2xl border p-8"
                  style={{
                    borderColor: palette.border,
                    background: palette.bg,
                  }}
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: palette.greenGlow }}
                  >
                    <Fingerprint
                      className="h-6 w-6"
                      style={{ color: palette.greenDark }}
                    />
                  </div>
                  <h3
                    className="mt-6 text-xl font-bold"
                    style={{ color: palette.navy }}
                  >
                    Privacy where it matters
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    Sensitive details encrypted via TEE (MagicBlock PER). Trade
                    secrets stay secret while compliance passes.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══ COMPARISON TABLE ═══ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p
                className="mb-4 text-sm font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                The Comparison
              </p>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: palette.navy }}
              >
                See the difference
              </h2>
            </Reveal>

            <Reveal className="mt-12">
              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: palette.border }}
              >
                <table className="w-full text-sm" style={{ minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: palette.bgSubtle }}>
                      <th
                        className="border-b px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: palette.muted,
                          borderColor: palette.border,
                        }}
                      >
                        Feature
                      </th>
                      <th
                        className="border-b px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: palette.muted,
                          borderColor: palette.border,
                        }}
                      >
                        Cash & Armored Cars
                      </th>
                      <th
                        className="border-b px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: palette.muted,
                          borderColor: palette.border,
                        }}
                      >
                        High-Risk Processors
                      </th>
                      <th
                        className="border-b px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: palette.green,
                          borderColor: palette.border,
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
                        processor: "5.0%–9.0%",
                        settlr: "1.0% Flat",
                      },
                      {
                        feature: "Settlement Speed",
                        cash: "Days",
                        processor: "3–5 Business Days",
                        settlr: "< 5 seconds",
                      },
                      {
                        feature: "Risk of Freeze",
                        cash: "High",
                        processor: "Very High",
                        settlr: "Zero",
                      },
                      {
                        feature: "Audit Trail",
                        cash: "Manual",
                        processor: "Fragmented",
                        settlr: "On-Chain",
                      },
                      {
                        feature: "Custody",
                        cash: "You (physical)",
                        processor: "They hold it",
                        settlr: "Non-custodial",
                      },
                    ].map((row, i) => (
                      <tr
                        key={row.feature}
                        style={{ borderColor: palette.border }}
                        className={i < 4 ? "border-b" : ""}
                      >
                        <td
                          className="px-6 py-4 font-semibold"
                          style={{ color: palette.navy }}
                        >
                          {row.feature}
                        </td>
                        <td
                          className="px-6 py-4 text-center text-[13px]"
                          style={{ color: palette.red }}
                        >
                          {row.cash}
                        </td>
                        <td
                          className="px-6 py-4 text-center text-[13px]"
                          style={{ color: palette.red }}
                        >
                          {row.processor}
                        </td>
                        <td
                          className="px-6 py-4 text-center text-[13px] font-bold"
                          style={{ color: palette.green }}
                        >
                          {row.settlr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — 3 STEPS ═══ */}
        <section
          className="py-24 sm:py-32"
          style={{ background: palette.bgSubtle }}
        >
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p
                className="mb-4 text-sm font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Get Started
              </p>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: palette.navy }}
              >
                Three steps to your first settlement
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Verify your business",
                  desc: "Complete KYB verification in minutes. We verify your state licenses, cannabis permits, and business entity.",
                  icon: FileCheck,
                  visual: (
                    <div className="mt-6 space-y-2">
                      {[
                        "Business Entity",
                        "State License",
                        "Beneficial Owners",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                          style={{ borderColor: palette.border }}
                        >
                          <CheckCircle2
                            className="h-4 w-4"
                            style={{ color: palette.green }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: palette.navy }}
                          >
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
                  desc: "Generate a settlement request or share a payment link. Your counterparty receives a simple, clean checkout.",
                  icon: DollarSign,
                  visual: (
                    <div
                      className="mt-6 rounded-xl border p-4"
                      style={{
                        borderColor: palette.border,
                        background: palette.bgSubtle,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-medium"
                          style={{ color: palette.muted }}
                        >
                          Invoice #1047
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            background: palette.greenGlow,
                            color: palette.greenDark,
                          }}
                        >
                          Ready
                        </span>
                      </div>
                      <p
                        className="mt-2 text-2xl font-bold"
                        style={{ color: palette.navy }}
                      >
                        $45,000.00
                      </p>
                      <p className="text-xs" style={{ color: palette.muted }}>
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
                      className="mt-6 rounded-xl border p-4"
                      style={{
                        borderColor: palette.border,
                        background: palette.bgSubtle,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-5 w-5"
                          style={{ color: palette.green }}
                        />
                        <span
                          className="text-sm font-bold"
                          style={{ color: palette.green }}
                        >
                          Settled
                        </span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: palette.muted }}>
                            Time to finality
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: palette.navy }}
                          >
                            3.2s
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: palette.muted }}>
                            Platform fee
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: palette.navy }}
                          >
                            $450 (1%)
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: palette.muted }}>
                            Net to supplier
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: palette.navy }}
                          >
                            $44,550
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.08}>
                  <div
                    className="flex h-full flex-col rounded-2xl border p-8"
                    style={{
                      borderColor: palette.border,
                      background: palette.bg,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="text-sm font-bold"
                        style={{ color: palette.green }}
                      >
                        {item.step}
                      </span>
                      <div
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: palette.greenGlow }}
                      >
                        <item.icon
                          className="h-5 w-5"
                          style={{ color: palette.greenDark }}
                        />
                      </div>
                    </div>
                    <h3
                      className="mt-5 text-xl font-bold"
                      style={{ color: palette.navy }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: palette.slate }}
                    >
                      {item.desc}
                    </p>
                    {item.visual}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CFO COMPLIANCE ═══ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <Reveal>
                <p
                  className="mb-4 text-sm font-semibold uppercase tracking-widest"
                  style={{ color: palette.green }}
                >
                  CFO Reassurance
                </p>
                <h2
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{ color: palette.navy }}
                >
                  Built for the 2026 regulatory landscape
                </h2>
                <p
                  className="mt-4 max-w-lg text-base leading-relaxed"
                  style={{ color: palette.slate }}
                >
                  We understand that for a CFO, &ldquo;crypto&rdquo; sounds like
                  &ldquo;risk.&rdquo; We built Settlr to change that — every
                  component is designed for audit-readiness and regulatory
                  clarity.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    {
                      icon: Scale,
                      title: "GENIUS Act 2025 Compliant",
                      desc: "We exclusively use federal-framework payment stablecoins. Fully regulated, fully backed.",
                    },
                    {
                      icon: Eye,
                      title: "Full Transparency",
                      desc: "Every transaction generates a cryptographically verifiable receipt for your auditors.",
                    },
                    {
                      icon: FileCheck,
                      title: "BSA/AML Integrated",
                      desc: "We handle KYB heavy-lifting so your supply chain stays clean and compliant.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: palette.greenGlow }}
                      >
                        <item.icon
                          className="h-5 w-5"
                          style={{ color: palette.greenDark }}
                        />
                      </div>
                      <div>
                        <h4
                          className="text-sm font-bold"
                          style={{ color: palette.navy }}
                        >
                          {item.title}
                        </h4>
                        <p
                          className="mt-0.5 text-sm leading-relaxed"
                          style={{ color: palette.slate }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link
                    href="/compliance"
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                    style={{ color: palette.green }}
                  >
                    Read our 2026 Compliance Whitepaper
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>

              {/* Compliance visual */}
              <Reveal delay={0.1}>
                <div
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{
                    borderColor: palette.border,
                    background: palette.bg,
                  }}
                >
                  <p
                    className="mb-6 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: palette.muted }}
                  >
                    Compliance Snapshot
                  </p>
                  <div className="space-y-4">
                    {[
                      { label: "GENIUS Act (2025)", status: "Compliant" },
                      { label: "BSA/AML Screening", status: "Active" },
                      { label: "KYB Verification", status: "Enforced" },
                      { label: "OFAC SDN Check", status: "Real-Time" },
                      { label: "On-Chain Audit Trail", status: "Immutable" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border px-4 py-3"
                        style={{ borderColor: palette.border }}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className="h-4 w-4"
                            style={{ color: palette.green }}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: palette.navy }}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          style={{
                            background: palette.greenGlow,
                            color: palette.greenDark,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══ INDUSTRIES ═══ */}
        <section
          className="py-24 sm:py-32"
          style={{ background: palette.bgSubtle }}
        >
          <div className="mx-auto max-w-6xl px-6">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p
                className="mb-4 text-sm font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Industries
              </p>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: palette.navy }}
              >
                Built for the businesses banks won&apos;t serve
              </h2>
            </Reveal>

            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Cannabis & Wholesalers",
                  desc: "B2B settlement for state-licensed cultivators, processors, and distributors. Stop getting debanked.",
                  href: "/industries/cannabis",
                  stats: ["40+ States", "$25B Market", "100% Non-Custodial"],
                  gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                },
                {
                  title: "Adult Content Platforms",
                  desc: "Creator payouts without deplatforming risk. 1% flat vs 8–15% high-risk processing.",
                  href: "/industries/adult-content",
                  stats: ["Instant Payouts", "No Chargebacks", "TEE Privacy"],
                  gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 0.08}>
                  <Link href={item.href} className="group block">
                    <div
                      className="overflow-hidden rounded-2xl border transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1"
                      style={{
                        borderColor: palette.border,
                        background: palette.bg,
                      }}
                    >
                      {/* Color header */}
                      <div
                        className="px-8 py-10 text-white"
                        style={{ background: item.gradient }}
                      >
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/80">
                          {item.desc}
                        </p>
                      </div>
                      {/* Footer */}
                      <div className="flex items-center justify-between px-8 py-5">
                        <div className="flex flex-wrap gap-3">
                          {item.stats.map((stat) => (
                            <span
                              key={stat}
                              className="rounded-full border px-3 py-1 text-xs font-medium"
                              style={{
                                borderColor: palette.border,
                                color: palette.slate,
                              }}
                            >
                              {stat}
                            </span>
                          ))}
                        </div>
                        <ArrowUpRight
                          className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          style={{ color: palette.green }}
                        />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal className="text-center">
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: palette.navy }}
              >
                Frequently asked questions
              </h2>
              <p className="mt-4 text-base" style={{ color: palette.slate }}>
                Get answers to common questions here
              </p>
            </Reveal>

            <div className="mt-12 space-y-3">
              {[
                {
                  q: "Is Settlr a bank?",
                  a: "No. Settlr is a non-custodial software layer. We never hold, control, or have signing authority over your funds. Money moves peer-to-peer between multisig vaults that you and your suppliers control.",
                },
                {
                  q: "What stablecoins do you use?",
                  a: "We exclusively use GENIUS Act 2025-compliant payment stablecoins \u2014 USDC issued by Circle. Not algorithmic, not offshore, fully backed and audited.",
                },
                {
                  q: "How is this different from a high-risk processor?",
                  a: "High-risk processors charge 5\u20139% and can freeze your funds at any time because they are custodial. Settlr charges 1% flat, settles instantly, and is non-custodial \u2014 there is nothing to freeze.",
                },
                {
                  q: "What does my auditor see?",
                  a: "Every transaction generates a cryptographically verifiable on-chain receipt. Amount, timestamp, sender, recipient \u2014 all immutable and tamper-proof. Your auditors get a clean, automated trail.",
                },
                {
                  q: "Do I need crypto expertise to use this?",
                  a: "No. Settlr abstracts away the blockchain entirely. You see invoices, settlements, and receipts. The underlying infrastructure runs on Solana, but your team never needs to interact with it directly.",
                },
                {
                  q: "Who is eligible for the Private Rail?",
                  a: "We are currently onboarding state-licensed cannabis distributors, cultivators, and processors operating in legal markets. Contact us to discuss eligibility for your operation.",
                },
              ].map((faq, i) => (
                <Reveal key={faq.q} delay={i * 0.03}>
                  <FAQItem question={faq.q} answer={faq.a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <div
                className="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-24"
                style={{ background: palette.navy }}
              >
                {/* Subtle gradient orbs */}
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute -left-20 -top-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)",
                    }}
                  />
                  <div
                    className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)",
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Stop paying the{" "}
                    <span
                      style={{
                        background: "linear-gradient(135deg, #10B981, #34D399)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      &ldquo;Exile Tax&rdquo;
                    </span>
                  </h2>
                  <p
                    className="mx-auto mt-4 max-w-lg text-base leading-relaxed sm:text-lg"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Settlr is onboarding a limited number of B2B operators for
                    our Private Rail. Secure your 1% flat rate today.
                  </p>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Link
                      href="/waitlist"
                      className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
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
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
                    >
                      See the Demo
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
