"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Zap,
  FileCheck,
  CheckCircle2,
  Shield,
  Mail,
  Ban,
  Eye,
  Receipt,
  Send,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ── Design tokens ─────────────────────────────────────── */
const p = {
  bg: "#FFFFFF",
  bgSubtle: "#F8FAF9",
  bgMuted: "#F3F4F6",
  navy: "#0C1829",
  slate: "#3B4963",
  muted: "#7C8A9E",
  green: "#1B6B4A",
  greenLight: "#E8F5EE",
  greenPale: "#D1FAE5",
  border: "#E5E7EB",
  borderSubtle: "#F3F4F6",
  red: "#DC2626",
  white: "#FFFFFF",
};

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const springFast = { type: "spring" as const, stiffness: 260, damping: 24 };
const serif = "var(--font-fraunces), Georgia, serif";

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── FAQ Item (numbered, Finex-style) ──────────────────── */
function FAQ({ q, a, num }: { q: string; a: string; num: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: p.white,
        boxShadow: open
          ? "0 4px 24px rgba(0,0,0,0.06)"
          : "0 1px 4px rgba(0,0,0,0.03)",
        border: `1px solid ${open ? "rgba(27,107,74,0.25)" : p.border}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-5 px-7 py-5 text-left"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          style={{ background: p.greenLight, color: p.green }}
        >
          {num}
        </span>
        <span
          className="flex-1 text-[15px] font-semibold"
          style={{ color: p.navy }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={springFast}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4" style={{ color: p.green }} />
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
            <div className="px-7 pb-6 pl-[4.25rem]">
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

/* ── Tabbed Section (Finex-style pill tabs) ────────────── */
function TabSection() {
  const [tab, setTab] = useState<"problem" | "solution" | "how">("problem");
  const tabs = [
    { key: "problem" as const, label: "The Problem" },
    { key: "solution" as const, label: "The Solution" },
    { key: "how" as const, label: "How It Works" },
  ];
  return (
    <section className="py-24 sm:py-32" style={{ background: p.bgSubtle }}>
      <div className="mx-auto max-w-5xl px-6">
        <R className="text-center">
          <h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: p.navy, fontFamily: serif }}
          >
            Boosting your settlement success
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-base"
            style={{ color: p.slate }}
          >
            Unlock smarter ways to move money, reduce costs, and achieve lasting
            financial freedom for your business.
          </p>
        </R>

        <R delay={0.06} className="mt-10 text-center">
          <div
            className="inline-flex rounded-full p-1"
            style={{ border: `1px solid ${p.border}`, background: p.white }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{
                  color: tab === t.key ? p.white : p.slate,
                  background: tab === t.key ? p.green : "transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </R>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            {tab === "problem" && (
              <motion.div
                key="problem"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="grid gap-8 rounded-2xl p-8 sm:grid-cols-2 sm:p-12"
                  style={{
                    background: p.white,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      Cannabis is legal. Banking isn&apos;t.
                    </h3>
                    <p
                      className="mt-4 text-[15px] leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      State-legal businesses still can&apos;t access basic
                      financial infrastructure. Banks freeze accounts without
                      warning. High-risk processors charge 5–9%.
                    </p>
                    <div className="mt-6 space-y-3">
                      {[
                        "Banks freeze accounts without warning",
                        "High-risk processors charge 5–9%",
                        "Moving physical cash is dangerous",
                        "No recourse when funds are frozen",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: p.red }}
                          />
                          <span className="text-sm" style={{ color: p.slate }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { stat: "5–9%", label: "Processing fees" },
                        { stat: "72hrs", label: "Avg. freeze time" },
                        { stat: "$0", label: "Recourse" },
                        { stat: "100%", label: "Cash dependent" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl p-4"
                          style={{
                            background: p.bgSubtle,
                            border: `1px solid ${p.border}`,
                          }}
                        >
                          <p
                            className="text-2xl font-bold"
                            style={{ color: p.red }}
                          >
                            {item.stat}
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{ color: p.muted }}
                          >
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "solution" && (
              <motion.div
                key="solution"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="grid gap-8 rounded-2xl p-8 sm:grid-cols-2 sm:p-12"
                  style={{
                    background: p.white,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      USDC rails that don&apos;t need a bank&apos;s permission.
                    </h3>
                    <p
                      className="mt-4 text-[15px] leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      Settlr is a non-custodial settlement layer built on
                      Solana. Funds move peer-to-peer between multisig vaults —
                      no intermediary, no custody, no freeze risk.
                    </p>
                    <div className="mt-6 space-y-3">
                      {[
                        "Open accounts in USDC, instantly",
                        "Non-custodial peer-to-peer settlement",
                        "No bank intermediary or approval",
                        "GENIUS Act 2025 compliant",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: p.green }}
                          />
                          <span className="text-sm" style={{ color: p.slate }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { stat: "1%", label: "Flat fee, always" },
                        { stat: "<5s", label: "Settlement time" },
                        { stat: "0", label: "Funds in custody" },
                        { stat: "24/7", label: "Availability" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl p-4"
                          style={{
                            background: p.bgSubtle,
                            border: `1px solid ${p.border}`,
                          }}
                        >
                          <p
                            className="text-2xl font-bold"
                            style={{ color: p.green }}
                          >
                            {item.stat}
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{ color: p.muted }}
                          >
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "how" && (
              <motion.div
                key="how"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="grid gap-8 rounded-2xl p-8 sm:grid-cols-2 sm:p-12"
                  style={{
                    background: p.white,
                    border: `1px solid ${p.border}`,
                  }}
                >
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      Three steps. No crypto required.
                    </h3>
                    <p
                      className="mt-4 text-[15px] leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      Connect your business, send an invoice, and your recipient
                      claims via email. That&apos;s it.
                    </p>
                    <div className="mt-6 space-y-4">
                      {[
                        {
                          step: "1",
                          title: "Connect your business",
                          desc: "KYB verification — state licences, cannabis permits.",
                        },
                        {
                          step: "2",
                          title: "Send an invoice",
                          desc: "Create a settlement request. Your counterparty gets an email.",
                        },
                        {
                          step: "3",
                          title: "Recipient claims via email",
                          desc: "Click a link, verify identity, receive USDC. Done.",
                        },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-3">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: p.green }}
                          >
                            {item.step}
                          </div>
                          <div>
                            <h4
                              className="text-sm font-bold"
                              style={{ color: p.navy }}
                            >
                              {item.title}
                            </h4>
                            <p
                              className="mt-0.5 text-xs"
                              style={{ color: p.slate }}
                            >
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-xl p-8"
                    style={{ background: p.bgSubtle }}
                  >
                    <div className="text-center">
                      <Send
                        className="mx-auto h-12 w-12"
                        style={{ color: p.green }}
                      />
                      <p
                        className="mt-4 text-sm font-medium"
                        style={{ color: p.muted }}
                      >
                        Interactive demo coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
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
            "@type": "Organization",
            name: "Settlr",
            url: "https://settlr.dev",
            logo: "https://settlr.dev/icon.svg",
            description:
              "Non-custodial stablecoin settlement for B2B cannabis distributors at 1% flat fee.",
            foundingDate: "2025",
            areaServed: "US",
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
            "@type": "WebApplication",
            name: "Settlr",
            url: "https://settlr.dev",
            applicationCategory: "FinanceApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "1% flat per transaction.",
            },
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
                  text: "Non-custodial stablecoin settlement for B2B cannabis supply chains.",
                },
              },
              {
                "@type": "Question",
                name: "Do recipients need a crypto wallet?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. They get an email and click a link.",
                },
              },
              {
                "@type": "Question",
                name: "Is this legal?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. USDC is a regulated stablecoin. Settlr is GENIUS Act compliant.",
                },
              },
            ],
          }),
        }}
      />

      <div
        className="min-h-screen"
        style={{ background: p.bg, color: p.slate }}
      >
        <Navbar />

        {/* ═══════════════════════════════════════════════ */}
        {/*  HERO — Green background like Finex            */}
        {/* ═══════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden pt-28 pb-20 sm:pt-40 sm:pb-28"
          style={{ background: p.green }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left — copy */}
              <div>
                <R delay={0.06}>
                  <h1
                    className="text-4xl leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl lg:text-[56px]"
                    style={{ fontFamily: serif, fontWeight: 800 }}
                  >
                    Payment rails for cannabis wholesalers.
                  </h1>
                </R>
                <R delay={0.12}>
                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
                    Settle invoices in seconds, not days. No bank needed. No
                    account freezes. Just USDC moving directly between you and
                    your suppliers.{" "}
                    <span className="font-semibold text-white">1% flat.</span>
                  </p>
                </R>
                <R
                  delay={0.2}
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <Link
                    href="/waitlist"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ color: p.green }}
                  >
                    Request Access
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    Watch Demo
                  </Link>
                </R>

                {/* Social proof row */}
                <R delay={0.28} className="mt-10">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 text-[10px] font-bold text-white"
                          style={{
                            background: `hsl(${150 + i * 30}, 40%, ${
                              35 + i * 5
                            }%)`,
                          }}
                        >
                          {["GF", "ME", "SC", "PD"][i]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        $67K+ Settled
                      </p>
                      <p className="text-xs text-white/60">
                        Trusted by cannabis operators nationwide
                      </p>
                    </div>
                  </div>
                </R>
              </div>

              {/* Right — dashboard mockup with floating cards */}
              <R delay={0.3}>
                <div className="relative">
                  {/* Floating card — settlement */}
                  <motion.div
                    className="absolute -left-4 top-8 z-10 rounded-xl px-4 py-3 shadow-xl sm:-left-8"
                    style={{ background: p.white }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
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
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: p.navy }}
                      >
                        Settlement Complete
                      </span>
                    </div>
                    <p className="mt-1 text-[11px]" style={{ color: p.slate }}>
                      $47,500 · 0.6s
                    </p>
                  </motion.div>

                  {/* Floating card — income */}
                  <motion.div
                    className="absolute -right-2 bottom-16 z-10 rounded-xl px-4 py-3 shadow-xl sm:-right-6"
                    style={{ background: p.white }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5,
                    }}
                  >
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: p.muted }}
                    >
                      Volume · 30 Days
                    </p>
                    <p
                      className="mt-0.5 text-lg font-bold"
                      style={{ color: p.navy }}
                    >
                      $67,200
                    </p>
                  </motion.div>

                  {/* Dashboard card */}
                  <div
                    className="overflow-hidden rounded-2xl shadow-2xl"
                    style={{ background: p.white }}
                  >
                    {/* Browser chrome */}
                    <div
                      className="flex items-center gap-2 px-5 py-3"
                      style={{ borderBottom: `1px solid ${p.border}` }}
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
                        {
                          label: "Volume (30d)",
                          value: "$2.4M",
                          change: "+18%",
                        },
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
                          className="p-4"
                          style={{ background: p.white }}
                        >
                          <p
                            className="text-[10px] font-medium"
                            style={{ color: p.muted }}
                          >
                            {s.label}
                          </p>
                          <p
                            className="mt-1 text-lg font-bold tracking-tight"
                            style={{ color: p.navy }}
                          >
                            {s.value}
                          </p>
                          <p
                            className="mt-0.5 text-[10px] font-semibold"
                            style={{ color: p.green }}
                          >
                            {s.change}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Mini bar chart */}
                    <div className="flex items-end gap-1.5 px-5 py-5">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm"
                            style={{
                              height: `${h * 0.6}px`,
                              background: i >= 10 ? p.green : p.greenPale,
                            }}
                          />
                        ),
                      )}
                    </div>
                    {/* Settlements list */}
                    <div>
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
                      ].map((row) => (
                        <div
                          key={row.from}
                          className="flex items-center justify-between px-5 py-3"
                          style={{ borderTop: `1px solid ${p.borderSubtle}` }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                              style={{
                                background: p.greenLight,
                                color: p.green,
                              }}
                            >
                              {row.from[0]}
                            </div>
                            <p
                              className="text-xs font-medium"
                              style={{ color: p.navy }}
                            >
                              {row.from} → {row.to}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: p.navy }}
                            >
                              {row.amount}
                            </span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: p.greenLight,
                                color: p.green,
                              }}
                            >
                              {row.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </R>
            </div>
          </div>

          <p className="sr-only">
            Settlr is a non-custodial stablecoin settlement platform designed
            for B2B cannabis distributors and high-risk industries to process
            payments at a 1% flat fee.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  PARTNER LOGO BAR                              */}
        {/* ═══════════════════════════════════════════════ */}
        <section
          className="py-10"
          style={{ borderBottom: `1px solid ${p.border}` }}
        >
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
              {[
                { name: "Solana", src: "/solana-logo.png" },
                { name: "Circle USDC", src: "/usdc-logo.png" },
                { name: "Squads Protocol", src: "/squads-logo.png" },
              ].map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  className="h-7 w-auto object-contain sm:h-9"
                  style={{ filter: "grayscale(0.5)", opacity: 0.7 }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  BENTO — 3 mixed cards (Finex-style)           */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1 — light green bg */}
              <R>
                <div
                  className="flex h-full flex-col justify-between rounded-2xl p-7"
                  style={{ background: p.greenLight, minHeight: 280 }}
                >
                  <div>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: "rgba(27,107,74,0.15)" }}
                    >
                      <Zap className="h-6 w-6" style={{ color: p.green }} />
                    </div>
                    <h3
                      className="mt-5 text-xl font-bold"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      Instant B2B Settlement
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      Invoice to cash in seconds, not the 3–5 days you&apos;re
                      used to with ACH.
                    </p>
                  </div>
                  {/* Mini chart visualization */}
                  <div className="mt-6 flex items-end gap-1">
                    {[30, 50, 35, 65, 45, 80, 55].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h * 0.5}px`,
                          background: i === 5 ? p.green : "rgba(27,107,74,0.2)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </R>

              {/* Card 2 — solid green bg */}
              <R delay={0.06}>
                <div
                  className="flex h-full flex-col justify-between rounded-2xl p-7 text-white"
                  style={{ background: p.green, minHeight: 280 }}
                >
                  <div>
                    <h3
                      className="text-xl font-bold"
                      style={{ fontFamily: serif }}
                    >
                      No Wallet Required
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      Your supplier gets an email, clicks a link, gets paid. No
                      crypto knowledge needed.
                    </p>
                  </div>
                  <div className="mt-6">
                    <div className="flex -space-x-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/20 text-[10px] font-bold"
                          style={{
                            background: `hsl(${140 + i * 20}, 35%, ${
                              30 + i * 8
                            }%)`,
                          }}
                        >
                          {["GF", "ME", "SC", "PD", "VW"][i]}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold">
                        $67K+ Settled
                      </span>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold">
                        Email-based
                      </span>
                    </div>
                  </div>
                </div>
              </R>

              {/* Card 3 — white with dashboard preview */}
              <R delay={0.12}>
                <div
                  className="flex h-full flex-col justify-between overflow-hidden rounded-2xl"
                  style={{ background: p.bgMuted, minHeight: 280 }}
                >
                  <div className="p-7 pb-0">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      Unstoppable Rails
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      Non-custodial USDC on Solana. No bank can freeze your
                      payments.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-center px-4 pb-4">
                    <div
                      className="w-full rounded-xl p-4"
                      style={{
                        background: p.white,
                        border: `1px solid ${p.border}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: p.navy }}
                        >
                          Status
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: p.greenLight, color: p.green }}
                        >
                          Active
                        </span>
                      </div>
                      <p
                        className="mt-2 text-2xl font-bold"
                        style={{ color: p.navy }}
                      >
                        $2.4M
                      </p>
                      <p className="text-[11px]" style={{ color: p.muted }}>
                        30-day volume · 0 freezes
                      </p>
                    </div>
                  </div>
                </div>
              </R>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  SOCIAL PROOF — 3 col like Finex               */}
        {/* ═══════════════════════════════════════════════ */}
        <section
          className="py-24 sm:py-32"
          style={{ borderTop: `1px solid ${p.border}` }}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-3">
              {/* Left — heading + stats */}
              <div>
                <R>
                  <h2
                    className="text-3xl font-bold tracking-tight sm:text-4xl"
                    style={{ color: p.navy, fontFamily: serif }}
                  >
                    Built for the businesses banks won&apos;t serve
                  </h2>
                </R>
                <R delay={0.08}>
                  <div className="mt-10 grid grid-cols-2 gap-6">
                    {[
                      { value: "$67K+", label: "Settled" },
                      { value: "<1s", label: "Avg. Settlement" },
                      { value: "0%", label: "Bank Dependency" },
                      { value: "24/7", label: "Availability" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p
                          className="text-2xl font-bold tracking-tight"
                          style={{ color: p.navy }}
                        >
                          {stat.value}
                        </p>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: p.muted }}
                        >
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </R>
              </div>

              {/* Center — image placeholder */}
              <R delay={0.1}>
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{ background: p.greenLight, aspectRatio: "3/4" }}
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(27,107,74,0.15)" }}
                      >
                        <Shield
                          className="h-7 w-7"
                          style={{ color: p.green }}
                        />
                      </div>
                      <p
                        className="mt-3 text-sm font-medium"
                        style={{ color: p.green }}
                      >
                        Product image
                      </p>
                    </div>
                  </div>
                </div>
              </R>

              {/* Right — copy */}
              <div>
                <R delay={0.14}>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    With operators across multiple states, Settlr has become the
                    go-to platform for cannabis businesses looking to simplify
                    B2B payments and eliminate bank dependency.
                  </p>
                  <p
                    className="mt-4 text-[15px] leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    From invoice creation to instant settlement, Settlr makes
                    payments easy, reliable, and accessible — helping operators
                    stay in control no matter where they are.
                  </p>
                </R>
                <R delay={0.18}>
                  <Link
                    href="/waitlist"
                    className="group mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                    style={{ border: `1px solid ${p.green}`, color: p.green }}
                  >
                    Get Started{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </R>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  FEATURES — asymmetric 2+3 grid like Finex     */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32" style={{ background: p.bgSubtle }}>
          <div className="mx-auto max-w-6xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: p.navy, fontFamily: serif }}
              >
                Everything you need to settle
              </h2>
              <p
                className="mx-auto mt-4 max-w-lg text-base"
                style={{ color: p.slate }}
              >
                Discover how our platform streamlines B2B settlement for
                cannabis and high-risk industries.
              </p>
            </R>

            {/* Top row — 2 wide cards */}
            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              {[
                {
                  icon: Receipt,
                  title: "Invoice & Pay",
                  desc: "Create invoices, send payment links, settle instantly. Everything in one place.",
                },
                {
                  icon: ShieldCheck,
                  title: "Compliance Built In",
                  desc: "Automated KYB verification, OFAC screening, real-time BSA/AML monitoring. Stay compliant.",
                },
              ].map((item, i) => (
                <R key={item.title} delay={i * 0.06}>
                  <div
                    className="rounded-2xl p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      background: p.white,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: p.greenLight }}
                    >
                      <item.icon
                        className="h-5 w-5"
                        style={{ color: p.green }}
                      />
                    </div>
                    <h3
                      className="mt-5 text-lg font-bold"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </R>
              ))}
            </div>

            {/* Bottom row — 3 cards */}
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Ban,
                  title: "No Account Freezes",
                  desc: "Non-custodial means no one holds your funds. No one can freeze them.",
                },
                {
                  icon: Eye,
                  title: "On-Chain Transparency",
                  desc: "Every settlement is verifiable on Solana. Real-time proof, not promises.",
                },
                {
                  icon: Mail,
                  title: "Email-Based Claiming",
                  desc: "Recipients don\u2019t need a wallet or app. Email, click, paid.",
                },
              ].map((item, i) => (
                <R key={item.title} delay={i * 0.06}>
                  <div
                    className="rounded-2xl p-7 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      background: p.white,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: p.greenLight }}
                    >
                      <item.icon
                        className="h-5 w-5"
                        style={{ color: p.green }}
                      />
                    </div>
                    <h3
                      className="mt-4 text-base font-bold"
                      style={{ color: p.navy }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  TABBED SECTION                                */}
        {/* ═══════════════════════════════════════════════ */}
        <TabSection />

        {/* ═══════════════════════════════════════════════ */}
        {/*  PRICING — Finex style                         */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <R className="text-center">
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: p.navy, fontFamily: serif }}
              >
                Simple and transparent pricing
              </h2>
              <p
                className="mx-auto mt-4 max-w-lg text-base"
                style={{ color: p.slate }}
              >
                No hidden fees. No surprises. Just 1% flat per transaction.
              </p>
            </R>
            <R delay={0.08}>
              <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
                {/* Starter — Free tools */}
                <div
                  className="flex flex-col rounded-2xl p-7"
                  style={{ border: `1px solid ${p.border}` }}
                >
                  <h3 className="text-lg font-bold" style={{ color: p.navy }}>
                    Explorer
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: p.muted }}>
                    Free tools to get started
                  </p>
                  <p className="mt-6" style={{ color: p.navy }}>
                    <span className="text-4xl font-bold tracking-tight">
                      $0
                    </span>
                    <span className="text-sm text-slate-500">/month</span>
                  </p>
                  <div className="mt-6 flex-1 space-y-2.5">
                    {[
                      "Create invoices",
                      "View settlement history",
                      "Basic compliance tools",
                      "Email support",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          style={{ color: p.green }}
                        />
                        <span className="text-sm" style={{ color: p.slate }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/waitlist"
                    className="mt-8 block rounded-full py-3 text-center text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ border: `1px solid ${p.green}`, color: p.green }}
                  >
                    Get Started
                  </Link>
                </div>

                {/* Pro — highlighted */}
                <div
                  className="flex flex-col rounded-2xl p-7 text-white"
                  style={{ background: p.green }}
                >
                  <h3 className="text-lg font-bold">Settlement</h3>
                  <p className="mt-1 text-xs text-white/70">
                    Full settlement infrastructure
                  </p>
                  <p className="mt-6">
                    <span className="text-4xl font-bold tracking-tight">
                      1%
                    </span>
                    <span className="text-sm text-white/70">/transaction</span>
                  </p>
                  <div className="mt-6 flex-1 space-y-2.5">
                    {[
                      "All Explorer features",
                      "Instant USDC settlement",
                      "Email-based claiming",
                      "Full compliance suite",
                      "Priority support",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white/80" />
                        <span className="text-sm text-white/90">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/waitlist"
                    className="mt-8 block rounded-full bg-white py-3 text-center text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ color: p.green }}
                  >
                    Request Access
                  </Link>
                </div>

                {/* Enterprise */}
                <div
                  className="flex flex-col rounded-2xl p-7"
                  style={{ border: `1px solid ${p.border}` }}
                >
                  <h3 className="text-lg font-bold" style={{ color: p.navy }}>
                    Enterprise
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: p.muted }}>
                    Custom for high-volume operators
                  </p>
                  <p className="mt-6" style={{ color: p.navy }}>
                    <span className="text-4xl font-bold tracking-tight">
                      Custom
                    </span>
                  </p>
                  <div className="mt-6 flex-1 space-y-2.5">
                    {[
                      "All Settlement features",
                      "Volume discounts",
                      "Multi-entity support",
                      "Dedicated account manager",
                      "Custom integrations",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          style={{ color: p.green }}
                        />
                        <span className="text-sm" style={{ color: p.slate }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/waitlist"
                    className="mt-8 block rounded-full py-3 text-center text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ border: `1px solid ${p.green}`, color: p.green }}
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </R>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  TESTIMONIALS — Large featured + 3 small       */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32" style={{ background: p.bgSubtle }}>
          <div className="mx-auto max-w-6xl px-6">
            <R className="text-center">
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: p.navy, fontFamily: serif }}
              >
                Trusted by cannabis operators
              </h2>
              <p
                className="mx-auto mt-4 max-w-md text-base"
                style={{ color: p.slate }}
              >
                Real operators, real results — see how Settlr is helping
                businesses take control of their payments.
              </p>
            </R>

            {/* Featured testimonial */}
            <R delay={0.06}>
              <div className="mt-16 grid gap-6 sm:grid-cols-2">
                <div
                  className="flex flex-col justify-between rounded-2xl p-8 sm:p-10"
                  style={{ background: p.greenLight }}
                >
                  <div>
                    <span className="text-4xl" style={{ color: p.green }}>
                      &#x201C;&#x201C;
                    </span>
                    <p
                      className="mt-2 text-xl font-bold leading-snug sm:text-2xl"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      Settlr changed the way we move money. It&apos;s fast,
                      transparent, and finally free from bank interference.
                    </p>
                  </div>
                  <div className="mt-8">
                    <p className="text-sm font-bold" style={{ color: p.navy }}>
                      Cannabis Distributor
                    </p>
                    <p className="text-xs" style={{ color: p.muted }}>
                      Colorado
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center justify-center overflow-hidden rounded-2xl"
                  style={{ background: p.greenLight, minHeight: 300 }}
                >
                  <div className="text-center">
                    <Shield
                      className="mx-auto h-16 w-16"
                      style={{ color: p.green, opacity: 0.3 }}
                    />
                    <p className="mt-3 text-sm" style={{ color: p.green }}>
                      Operator photo
                    </p>
                  </div>
                </div>
              </div>
            </R>

            {/* 3 smaller testimonial cards */}
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {[
                {
                  quote:
                    "Our processor shut us down overnight. No warning, no recourse. $200K stuck for 3 weeks.",
                  name: "Cannabis Distributor",
                  company: "Colorado",
                },
                {
                  quote:
                    "We were paying 7.5% per transaction. Settlr cut that to 1%. That\u2019s $78K saved per year.",
                  name: "Wholesale Cultivator",
                  company: "Oregon",
                },
                {
                  quote:
                    "Moving cash was a nightmare. Armed guards, insurance. Now it\u2019s a 3-second transfer.",
                  name: "Multi-State Operator",
                  company: "West Coast",
                },
              ].map((item, i) => (
                <R key={item.company} delay={i * 0.06}>
                  <div
                    className="flex h-full flex-col rounded-2xl p-6"
                    style={{
                      background: p.white,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    <p
                      className="flex-1 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: p.greenLight, color: p.green }}
                      >
                        {item.name[0]}
                      </div>
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: p.navy }}
                        >
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: p.muted }}>
                          {item.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  THREE STEPS                                   */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <R className="mx-auto max-w-2xl text-center">
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: p.navy, fontFamily: serif }}
              >
                Get started with Settlr in three simple steps
              </h2>
              <p
                className="mx-auto mt-4 max-w-lg text-base"
                style={{ color: p.slate }}
              >
                In just a few minutes, you can start settling invoices and take
                control of your payments.
              </p>
            </R>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Connect your business",
                  desc: "KYB verification in minutes. We check state licences, cannabis permits, and business entity.",
                  icon: FileCheck,
                },
                {
                  step: "02",
                  title: "Create an invoice",
                  desc: "Send to any supplier or buyer by email. They get a simple checkout — no wallet needed.",
                  icon: Send,
                },
                {
                  step: "03",
                  title: "Settlement in seconds",
                  desc: "Recipient clicks, claims USDC, done. You both get a cryptographic receipt.",
                  icon: Zap,
                },
              ].map((item, i) => (
                <R key={item.step} delay={i * 0.08}>
                  <div
                    className="group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:shadow-md"
                    style={{
                      background: p.bgSubtle,
                      border: `1px solid ${p.border}`,
                    }}
                  >
                    {/* Step number watermark */}
                    <span
                      className="absolute -right-2 -top-4 text-[80px] font-bold leading-none"
                      style={{ color: p.green, opacity: 0.07 }}
                    >
                      {item.step}
                    </span>
                    <div
                      className="relative flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: p.greenLight }}
                    >
                      <item.icon
                        className="h-5 w-5"
                        style={{ color: p.green }}
                      />
                    </div>
                    <p
                      className="mt-4 text-xs font-bold"
                      style={{ color: p.green }}
                    >
                      Step {item.step}
                    </p>
                    <h3
                      className="mt-2 text-lg font-bold"
                      style={{ color: p.navy, fontFamily: serif }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  FAQ — numbered, Finex-style                   */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32" style={{ background: p.bgSubtle }}>
          <div className="mx-auto max-w-3xl px-6">
            <R className="text-center">
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: p.navy, fontFamily: serif }}
              >
                Frequently Asked Questions
              </h2>
              <p
                className="mx-auto mt-4 max-w-md text-base"
                style={{ color: p.slate }}
              >
                Find answers to the most common questions about using Settlr.
              </p>
            </R>
            <div className="mt-12 space-y-4">
              {[
                {
                  q: "What is Settlr and how does it work?",
                  a: "Non-custodial stablecoin settlement for B2B cannabis supply chains. We\u2019re a software layer \u2014 not a bank. Funds move peer-to-peer between multisig vaults on Solana.",
                },
                {
                  q: "Do recipients need a crypto wallet?",
                  a: "No. They get an email and click a link. The USDC is claimed through a simple web interface \u2014 no wallet, no app, no crypto knowledge required.",
                },
                {
                  q: "Is this legal?",
                  a: "Yes. USDC is a regulated stablecoin issued by Circle under the GENIUS Act 2025 framework. Settlr performs full BSA/AML screening and KYB verification on every operator.",
                },
                {
                  q: "What if cannabis becomes federally legal?",
                  a: "Our value is speed and cost, not just banking access. 1% and instant settlement beats ACH regardless of regulation. We\u2019re building payment infrastructure, not a workaround.",
                },
                {
                  q: "How is this different from ACH or wire transfers?",
                  a: "Instant settlement (not 3\u20135 days), no intermediary, no freeze risk, 1% vs 5\u20139%. Plus a cryptographic audit trail that your compliance team will love.",
                },
                {
                  q: "Who controls the funds?",
                  a: "You do. Settlr is non-custodial. Funds move peer-to-peer between Squads multisig vaults. We never have signing authority over your money.",
                },
              ].map((faq, i) => (
                <R key={faq.q} delay={i * 0.03}>
                  <FAQ q={faq.q} a={faq.a} num={i + 1} />
                </R>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/*  BOTTOM CTA — dark card in colored wrapper     */}
        {/* ═══════════════════════════════════════════════ */}
        <section
          className="py-24 sm:py-32"
          style={{ background: p.greenLight }}
        >
          <div className="mx-auto max-w-5xl px-6">
            <R>
              <div
                className="overflow-hidden rounded-3xl px-8 py-20 text-center sm:px-16 sm:py-24"
                style={{ background: p.navy }}
              >
                <h2
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: serif }}
                >
                  Stop paying the high-risk tax.{" "}
                  <span style={{ color: p.green }}>
                    Start settling in seconds.
                  </span>
                </h2>
                <p className="mx-auto mt-6 max-w-lg text-base text-white/70">
                  Introducing a settlement platform designed to simplify how you
                  move money in cannabis. Low fees. Instant finality.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/waitlist"
                    className="group inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: p.green }}
                  >
                    Request Access{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    Watch Demo
                  </Link>
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
