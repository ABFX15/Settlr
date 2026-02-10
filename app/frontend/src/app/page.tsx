"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  Shield,
  Zap,
  Globe,
  Clock,
  Code2,
  CreditCard,
  RefreshCw,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── Fade-in wrapper ─── */
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Savings calculator ─── */
function SavingsCalculator() {
  const [volume, setVolume] = useState(25000);

  const stripeFee = volume * 0.029 + (volume / 100) * 0.3;
  const settlrFee = volume * 0.01;
  const saved = stripeFee - settlrFee;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10">
      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-white/50">
          Monthly volume
        </label>
        <div className="text-4xl font-semibold text-white tabular-nums">
          {fmt(volume)}
        </div>
        <input
          type="range"
          min={1000}
          max={500000}
          step={1000}
          value={volume}
          onChange={(e) => setVolume(+e.target.value)}
          className="mt-4 w-full accent-[#a78bfa]"
        />
        <div className="mt-1 flex justify-between text-xs text-white/30">
          <span>$1K</span>
          <span>$500K</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white/[0.04] p-5">
          <p className="text-xs font-medium text-white/40">
            Stripe (2.9%&nbsp;+&nbsp;30¢)
          </p>
          <p className="mt-1 text-2xl font-semibold text-white/80">
            {fmt(stripeFee)}
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-5">
          <p className="text-xs font-medium text-white/40">Settlr (1% flat)</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {fmt(settlrFee)}
          </p>
        </div>
        <div className="rounded-xl bg-[#a78bfa]/10 p-5 ring-1 ring-[#a78bfa]/20">
          <p className="text-xs font-medium text-[#a78bfa]">You save</p>
          <p className="mt-1 text-2xl font-semibold text-[#a78bfa]">
            {fmt(saved)}
          </p>
          <p className="mt-0.5 text-xs text-white/30">{fmt(saved * 12)}/yr</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm install @settlr/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen bg-[#050507] text-white antialiased">
      {/* ── Global noise texture ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Navbar ── */}
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO
         ═══════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
        {/* Subtle ambient glow */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#a78bfa]/[0.07] blur-[128px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#38bdf8]/[0.05] blur-[128px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-[13px] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
              Built for AI &amp; SaaS teams blocked by Stripe
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2.25rem,5vw,4.25rem)] font-semibold leading-[1.08] tracking-tight">
              The payment stack for
              <br />
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
                global-first AI and SaaS companies
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/50 md:text-xl">
              Accept stablecoin subscriptions, invoices, and one-off payments.
              Instant settlement, no chargebacks, no bank dependencies.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-[#050507] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-7 py-3.5 text-[15px] font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                Documentation
              </Link>
            </div>
          </Reveal>

          {/* npm install */}
          <Reveal delay={0.2}>
            <button
              onClick={copyInstall}
              className="group mt-8 inline-flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-5 py-3 font-mono text-sm text-white/50 transition-colors hover:border-white/[0.12] hover:text-white/70"
            >
              <span>
                <span className="text-[#a78bfa]">npm</span> install @settlr/sdk
              </span>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4 opacity-40 transition-opacity group-hover:opacity-70" />
              )}
            </button>
          </Reveal>
        </div>

        {/* ── Product demo infographic ── */}
        <Reveal delay={0.25}>
          <div className="relative z-10 mx-auto mt-20 max-w-5xl px-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Checkout card mock */}
              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c10]">
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="text-xs text-white/25">
                    Checkout · settlr.dev
                  </span>
                </div>
                <div className="p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a78bfa]/20">
                      <CreditCard className="h-5 w-5 text-[#a78bfa]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        One-click checkout
                      </p>
                      <p className="text-xs text-white/40">
                        Gasless USDC payment
                      </p>
                    </div>
                  </div>

                  {/* Amount display */}
                  <div className="mb-5 rounded-xl bg-white/[0.03] p-4">
                    <p className="text-xs text-white/30">Amount due</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                      $49<span className="text-lg text-white/50">.99</span>
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      49.99 USDC · Solana
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mb-5 space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                      <span className="text-xs text-white/50">
                        Pro Plan — Monthly
                      </span>
                      <span className="text-xs font-medium text-white/70">
                        $49.99
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                      <span className="text-xs text-white/50">
                        Platform fee
                      </span>
                      <span className="text-xs font-medium text-emerald-400">
                        $0.00
                      </span>
                    </div>
                  </div>

                  {/* Pay button */}
                  <div className="rounded-xl bg-white py-3 text-center text-sm font-semibold text-[#050507]">
                    Pay with USDC
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/25">
                    <Shield className="h-3 w-3" />
                    No wallet needed · No gas fees
                  </div>
                </div>
              </div>

              {/* Subscription management mock */}
              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c10]">
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <span className="text-xs text-white/25">
                    Subscriptions · Dashboard
                  </span>
                </div>
                <div className="p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38bdf8]/20">
                      <RefreshCw className="h-5 w-5 text-[#38bdf8]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Recurring billing
                      </p>
                      <p className="text-xs text-white/40">
                        Auto-renewing subscriptions
                      </p>
                    </div>
                  </div>

                  {/* Active subscriptions */}
                  <div className="space-y-3">
                    {[
                      {
                        name: "Pro Plan",
                        amount: "$49.99/mo",
                        status: "Active",
                        next: "Mar 10",
                        color: "emerald",
                      },
                      {
                        name: "API Usage",
                        amount: "$0.002/call",
                        status: "Active",
                        next: "Metered",
                        color: "emerald",
                      },
                      {
                        name: "Enterprise Seat",
                        amount: "$199/mo",
                        status: "Trial",
                        next: "14 days left",
                        color: "amber",
                      },
                    ].map((sub) => (
                      <div
                        key={sub.name}
                        className="flex items-center justify-between rounded-xl bg-white/[0.03] p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {sub.name}
                          </p>
                          <p className="mt-0.5 text-xs text-white/30">
                            {sub.next}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white/70">
                            {sub.amount}
                          </p>
                          <span
                            className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              sub.color === "emerald"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* MRR summary */}
                  <div className="mt-5 rounded-xl bg-[#a78bfa]/10 p-4 ring-1 ring-[#a78bfa]/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#a78bfa]">Monthly MRR</p>
                        <p className="mt-1 text-2xl font-semibold text-white">
                          $249<span className="text-sm text-white/40">.98</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/30">Settlement</p>
                        <p className="mt-1 text-sm font-medium text-emerald-400">
                          Instant
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom caption */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-[11px] text-white/25">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Real-time settlement
              </span>
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Encrypted receipts
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                180+ countries
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Auto-renewal
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════
          SOCIAL PROOF BAR
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-10 md:justify-between">
          {[
            { value: "$2M+", label: "Volume processed" },
            { value: "10,000+", label: "Transactions" },
            { value: "<1s", label: "Settlement time" },
            { value: "0", label: "Chargebacks" },
            { value: "50+", label: "Countries" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05} className="text-center">
              <div className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {s.value}
              </div>
              <div className="mt-0.5 text-xs text-white/35">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY SETTLR — FEATURES
         ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
            Why Settlr
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
            Everything you need to accept
            <br className="hidden md:block" /> stablecoin payments
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Instant settlement",
              text: "Funds arrive in your wallet the moment a customer pays. No holds, no processing delays.",
            },
            {
              icon: Shield,
              title: "Non-custodial",
              text: "We never hold your money. Payments go directly to your wallet via on-chain transfers.",
            },
            {
              icon: Lock,
              title: "Privacy-first",
              text: "Encrypted receipts and private transaction data. Your revenue is nobody\u2019s business.",
            },
            {
              icon: RefreshCw,
              title: "Subscriptions",
              text: "Recurring billing with automatic renewal, trials, and dunning \u2014 all in stablecoins.",
            },
            {
              icon: Globe,
              title: "Global by default",
              text: "Accept payments from 180+ countries. No bank account required, no geographic restrictions.",
            },
            {
              icon: Code2,
              title: "Developer-first SDK",
              text: "TypeScript SDK with React components. Integrate checkout in under 10 lines of code.",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]">
                <div className="mb-4 inline-flex rounded-xl bg-white/[0.05] p-2.5">
                  <f.icon className="h-5 w-5 text-white/60" />
                </div>
                <h3 className="text-[15px] font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {f.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
              How it works
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Go live in minutes, not weeks
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Install the SDK",
                text: "Add @settlr/sdk to your project and configure your merchant wallet address.",
                code: "npm install @settlr/sdk",
              },
              {
                step: "02",
                title: "Drop in checkout",
                text: "Use our React components or REST API to create payment sessions and subscription plans.",
                code: "<SettlrCheckout amount={49.99} />",
              },
              {
                step: "03",
                title: "Get paid instantly",
                text: "Customers pay with USDC. Funds settle to your wallet in under one second.",
                code: "// Funds in your wallet \u2713",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08}>
                <div className="flex h-full flex-col bg-[#050507] p-8 md:p-10">
                  <span className="text-xs font-semibold text-[#a78bfa]">
                    Step {s.step}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/40">
                    {s.text}
                  </p>
                  <div className="mt-6 rounded-lg bg-white/[0.03] px-4 py-3 font-mono text-xs text-white/50">
                    {s.code}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CODE EXAMPLE
         ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
                Developer experience
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Ship payments,
                <br />
                not plumbing
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-base leading-relaxed text-white/45">
                Fully typed TypeScript SDK with React hooks and components.
                One-click payments, gasless transactions, and subscription
                management — all out of the box.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 space-y-3">
                {[
                  "Drop-in React checkout component",
                  "Server-side webhooks with signature verification",
                  "Subscription lifecycle management",
                  "Gasless \u2014 you cover gas, customers pay nothing extra",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#a78bfa]" />
                    <span className="text-sm text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <Link
                href="/docs"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#a78bfa] transition-colors hover:text-[#c4b5fd]"
              >
                Read the docs
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          {/* Code block */}
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c10]">
              {/* Tab bar */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-xs text-white/25">checkout.tsx</span>
              </div>
              <pre className="overflow-x-auto p-6 text-[13px] leading-6">
                <code>
                  <span className="text-[#c084fc]">import</span>{" "}
                  <span className="text-white/70">{"{ SettlrCheckout }"}</span>{" "}
                  <span className="text-[#c084fc]">from</span>{" "}
                  <span className="text-[#86efac]">
                    &apos;@settlr/sdk&apos;
                  </span>
                  {"\n\n"}
                  <span className="text-[#c084fc]">export default</span>{" "}
                  <span className="text-[#93c5fd]">function</span>{" "}
                  <span className="text-white">Pricing</span>
                  <span className="text-white/50">() {"{"}</span>
                  {"\n"}
                  {"  "}
                  <span className="text-[#c084fc]">return</span>{" "}
                  <span className="text-white/50">(</span>
                  {"\n"}
                  {"    "}
                  <span className="text-white/40">&lt;</span>
                  <span className="text-[#93c5fd]">SettlrCheckout</span>
                  {"\n"}
                  {"      "}
                  <span className="text-[#f9a8d4]">amount</span>
                  <span className="text-white/40">=</span>
                  <span className="text-[#fde68a]">{"{49.99}"}</span>
                  {"\n"}
                  {"      "}
                  <span className="text-[#f9a8d4]">currency</span>
                  <span className="text-white/40">=</span>
                  <span className="text-[#86efac]">&quot;USDC&quot;</span>
                  {"\n"}
                  {"      "}
                  <span className="text-[#f9a8d4]">merchant</span>
                  <span className="text-white/40">=</span>
                  <span className="text-[#86efac]">
                    &quot;YOUR_WALLET&quot;
                  </span>
                  {"\n"}
                  {"      "}
                  <span className="text-[#f9a8d4]">onSuccess</span>
                  <span className="text-white/40">=</span>
                  <span className="text-white/50">{"{(tx) =>"}</span>{" "}
                  <span className="text-white/70">console.log</span>
                  <span className="text-white/50">(tx){"}"}</span>
                  {"\n"}
                  {"    "}
                  <span className="text-white/40">/&gt;</span>
                  {"\n"}
                  {"  "}
                  <span className="text-white/50">)</span>
                  {"\n"}
                  <span className="text-white/50">{"}"}</span>
                </code>
              </pre>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COMPARISON
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
              Comparison
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Why teams switch to Settlr
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-6 py-4 font-medium text-white/40" />
                    <th className="px-6 py-4 font-medium text-white/40">
                      Traditional
                    </th>
                    <th className="px-6 py-4 font-semibold text-[#a78bfa]">
                      Settlr
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["Fees", "2.9% + 30\u00A2", "1% flat"],
                    ["Settlement", "2\u20137 days", "Instant"],
                    ["Chargebacks", "Yes \u2014 costly", "None"],
                    ["Custody", "They hold funds", "Non-custodial"],
                    ["Global access", "Bank-dependent", "180+ countries"],
                    ["KYC setup", "Weeks of paperwork", "Minutes"],
                    ["Subscriptions", "Extra tooling", "Built-in"],
                    ["Gas fees", "N/A or user pays", "We cover it"],
                  ].map(([feature, trad, settlr]) => (
                    <tr
                      key={feature}
                      className="transition-colors hover:bg-white/[0.015]"
                    >
                      <td className="px-6 py-4 font-medium text-white/70">
                        {feature}
                      </td>
                      <td className="px-6 py-4 text-white/35">{trad}</td>
                      <td className="px-6 py-4 font-medium text-emerald-400">
                        {settlr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SAVINGS CALCULATOR
         ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-3xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
            Savings
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Calculate how much you&apos;d save
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 text-base text-white/40">
            Drag the slider to see your savings compared to Stripe.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10">
            <SavingsCalculator />
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════
          USE CASES
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
              Built for
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Teams that move fast
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: CreditCard,
                title: "AI & SaaS",
                text: "Usage-based and subscription billing with instant settlement. No account holds or reserve requirements.",
              },
              {
                icon: RefreshCw,
                title: "Recurring billing",
                text: "Stablecoin subscriptions with automatic renewals, trial periods, and smart retry logic.",
              },
              {
                icon: Globe,
                title: "Global commerce",
                text: "Accept payments from anywhere. No bank account needed, no geographic restrictions, no currency conversion.",
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[#050507] p-8">
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                    <c.icon className="h-5 w-5 text-white/60" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {c.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/40">
                    {c.text}
                  </p>
                  <Link
                    href="/onboarding"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#a78bfa] transition-colors hover:text-[#c4b5fd]"
                  >
                    Get started <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
         ═══════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#a78bfa]/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Start accepting payments
              <br />
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
                in minutes
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              No setup fees. No contracts. 1% flat on every transaction. Go live
              today.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-semibold text-[#050507] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo/store"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                View demo
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Non-custodial
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Instant settlement
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                180+ countries
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Go live today
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </main>
  );
}
