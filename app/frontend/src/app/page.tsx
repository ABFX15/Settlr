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
          HERO — split layout: copy left, visual right
         ═══════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
        {/* Subtle ambient glow */}
        <div className="absolute -top-40 left-[10%] h-[600px] w-[600px] rounded-full bg-[#a78bfa]/[0.07] blur-[128px]" />
        <div className="absolute top-[20%] right-[5%] h-[500px] w-[500px] rounded-full bg-[#38bdf8]/[0.05] blur-[128px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ─── Left: Copy ─── */}
            <div>
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-[13px] text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
                  Built for AI &amp; SaaS teams blocked by Stripe
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="max-w-xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.08] tracking-tight">
                  The payment stack for{" "}
                  <span className="bg-gradient-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
                    global-first AI and SaaS
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/50">
                  Accept stablecoin subscriptions, invoices, and one-off
                  payments. Instant settlement, no chargebacks, no bank
                  dependencies.
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
                    <span className="text-[#a78bfa]">npm</span> install
                    @settlr/sdk
                  </span>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 opacity-40 transition-opacity group-hover:opacity-70" />
                  )}
                </button>
              </Reveal>

              {/* Chain logos — Helio-style */}
              <Reveal delay={0.25}>
                <div className="mt-8 flex items-center gap-5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/20">
                    Powered by
                  </span>
                  <div className="flex items-center gap-4">
                    {/* Solana */}
                    <svg
                      viewBox="0 0 397.7 311.7"
                      className="h-3.5 w-auto fill-white/25 transition-colors hover:fill-white/50"
                    >
                      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
                      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
                      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
                    </svg>
                    {/* Ethereum */}
                    <svg
                      viewBox="0 0 256 417"
                      className="h-4 w-auto fill-white/25 transition-colors hover:fill-white/50"
                    >
                      <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
                      <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
                      <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.601L256 236.587z" />
                      <path d="M127.962 416.905v-104.72L0 236.585z" />
                    </svg>
                    {/* Base */}
                    <svg
                      viewBox="0 0 111 111"
                      className="h-4 w-auto fill-white/25 transition-colors hover:fill-white/50"
                    >
                      <circle cx="55.5" cy="55.5" r="55.5" />
                      <path
                        d="M55.2 23C37.5 23 23 37.3 23 55s14.5 32 32.2 32c15.4 0 28.3-10.9 31.4-25.4H62.5v-13.2h24.1C83.5 33.9 70.6 23 55.2 23z"
                        fill="#050507"
                      />
                    </svg>
                    {/* Arbitrum */}
                    <span className="text-[11px] font-semibold text-white/20 transition-colors hover:text-white/45">
                      ARB
                    </span>
                    {/* Polygon */}
                    <span className="text-[11px] font-semibold text-white/20 transition-colors hover:text-white/45">
                      MATIC
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ─── Right: Isometric payment visual ─── */}
            <Reveal delay={0.15}>
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                {/* Glow behind the graphic */}
                <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a78bfa]/[0.12] blur-[100px]" />
                <div className="absolute left-[60%] top-[40%] -z-10 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#38bdf8]/[0.08] blur-[80px]" />

                {/* Isometric container with perspective */}
                <div className="relative" style={{ perspective: "1200px" }}>
                  {/* ── Floating card: Checkout ── */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-30 mx-auto w-[280px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10]/90 shadow-2xl shadow-black/40 backdrop-blur-sm"
                    style={{
                      transform: "rotateY(-8deg) rotateX(4deg)",
                    }}
                  >
                    <div className="border-b border-white/[0.06] px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-white/10" />
                        <span className="h-2 w-2 rounded-full bg-white/10" />
                        <span className="h-2 w-2 rounded-full bg-white/10" />
                        <span className="ml-2 text-[10px] text-white/20">
                          checkout
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-4 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a78bfa]/20">
                          <CreditCard className="h-4 w-4 text-[#a78bfa]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Pro Plan
                          </p>
                          <p className="text-[10px] text-white/30">Monthly</p>
                        </div>
                      </div>
                      <div className="mb-4 rounded-lg bg-white/[0.03] p-3">
                        <p className="text-[10px] text-white/30">Amount</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-semibold text-white">
                            $49
                            <span className="text-sm text-white/40">.99</span>
                          </p>
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="h-7 w-7 rounded-full"
                          />
                        </div>
                        <p className="text-[10px] text-white/20">
                          USDC · Solana
                        </p>
                      </div>
                      <div className="rounded-lg bg-white py-2 text-center text-xs font-semibold text-[#050507]">
                        Pay with USDC
                      </div>
                      <p className="mt-2 text-center text-[9px] text-white/20">
                        No wallet needed · Zero gas
                      </p>
                    </div>
                  </motion.div>

                  {/* ── Floating card: Subscription (behind left) ── */}
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute -left-4 top-12 z-20 w-[220px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c10]/80 shadow-xl shadow-black/30 backdrop-blur-sm md:-left-8"
                    style={{
                      transform: "rotateY(6deg) rotateX(2deg)",
                    }}
                  >
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#38bdf8]/20">
                          <RefreshCw className="h-3.5 w-3.5 text-[#38bdf8]" />
                        </div>
                        <p className="text-[11px] font-semibold text-white">
                          Subscriptions
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: "Pro", price: "$49/mo", active: true },
                          {
                            name: "API Credits",
                            price: "$0.002/call",
                            active: true,
                          },
                          {
                            name: "Enterprise",
                            price: "$199/mo",
                            active: false,
                          },
                        ].map((s) => (
                          <div
                            key={s.name}
                            className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
                          >
                            <span className="text-[10px] text-white/60">
                              {s.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-white/40">
                                {s.price}
                              </span>
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  s.active ? "bg-emerald-400" : "bg-amber-400"
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Floating card: Settlement (behind right) ── */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 5.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    className="absolute -right-2 top-8 z-10 w-[200px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c10]/80 shadow-xl shadow-black/30 backdrop-blur-sm md:-right-6"
                    style={{
                      transform: "rotateY(-12deg) rotateX(3deg)",
                    }}
                  >
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                          <Zap className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <p className="text-[11px] font-semibold text-white">
                          Settlement
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                        <p className="text-[10px] text-emerald-400">Received</p>
                        <p className="text-lg font-semibold text-white">
                          $249<span className="text-xs text-white/30">.98</span>
                        </p>
                        <p className="text-[10px] text-emerald-400/60">
                          ✓ Instant · 0.4s
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[9px] text-white/20">
                        <Shield className="h-3 w-3" />
                        Encrypted receipt
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Bottom floating badge: Supported stablecoins ── */}
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                    className="absolute -bottom-4 left-1/2 z-40 -translate-x-1/2"
                  >
                    <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-[#0c0c10]/90 px-5 py-2.5 shadow-lg shadow-black/30 backdrop-blur-sm">
                      {/* USDC */}
                      <span className="flex items-center gap-1.5">
                        <img
                          src="/usdc.png"
                          alt="USDC"
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-[11px] font-medium text-white/60">
                          USDC
                        </span>
                      </span>
                      <span className="text-white/10">|</span>
                      {/* USDT */}
                      <span className="flex items-center gap-1.5">
                        <img
                          src="/usdt.png"
                          alt="USDT"
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-[11px] font-medium text-white/60">
                          USDT
                        </span>
                      </span>
                      <span className="text-white/10">|</span>
                      {/* USDG (Paxos) */}
                      <span className="flex items-center gap-1.5">
                        <img
                          src="/usdg.png"
                          alt="USDG"
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-[11px] font-medium text-white/60">
                          USDG
                        </span>
                      </span>
                    </div>
                  </motion.div>

                  {/* ── Orbiting stablecoin logos ── */}
                  {/* USDC — top-right orbit */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      x: [0, 4, 0],
                      rotate: [0, 8, 0],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-2 right-8 z-50"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2775CA]/20 shadow-lg shadow-[#2775CA]/10 ring-1 ring-[#2775CA]/30 backdrop-blur-sm">
                      <img
                        src="/usdc.png"
                        alt="USDC"
                        className="h-9 w-9 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* USDT — left orbit */}
                  <motion.div
                    animate={{
                      y: [0, 8, 0],
                      x: [0, -5, 0],
                      rotate: [0, -6, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5,
                    }}
                    className="absolute left-0 top-[55%] z-50 md:-left-4"
                  >
                    <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#26A17B]/20 shadow-lg shadow-[#26A17B]/10 ring-1 ring-[#26A17B]/30 backdrop-blur-sm">
                      <img
                        src="/usdt.png"
                        alt="USDT"
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* USDG — bottom-right orbit */}
                  <motion.div
                    animate={{ y: [0, 6, 0], x: [0, 6, 0], rotate: [0, 10, 0] }}
                    transition={{
                      duration: 6.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 3,
                    }}
                    className="absolute bottom-[15%] right-0 z-50 md:-right-2"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD700]/10 shadow-lg shadow-[#FFD700]/5 ring-1 ring-[#FFD700]/25 backdrop-blur-sm">
                      <img
                        src="/usdg.png"
                        alt="USDG"
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* ── Connecting dots/lines (decorative) ── */}
                  <svg
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                    viewBox="0 0 500 400"
                    fill="none"
                  >
                    {/* Connecting lines */}
                    <line
                      x1="120"
                      y1="160"
                      x2="200"
                      y2="120"
                      stroke="rgba(167,139,250,0.15)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="300"
                      y1="120"
                      x2="380"
                      y2="160"
                      stroke="rgba(56,189,248,0.15)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="250"
                      y1="280"
                      x2="250"
                      y2="340"
                      stroke="rgba(167,139,250,0.1)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    {/* Glowing dots at intersections — stablecoin colors */}
                    <circle
                      cx="120"
                      cy="160"
                      r="4"
                      fill="#2775CA"
                      opacity="0.5"
                    />
                    <circle
                      cx="120"
                      cy="160"
                      r="8"
                      fill="#2775CA"
                      opacity="0.15"
                    />
                    <circle
                      cx="380"
                      cy="160"
                      r="4"
                      fill="#26A17B"
                      opacity="0.5"
                    />
                    <circle
                      cx="380"
                      cy="160"
                      r="8"
                      fill="#26A17B"
                      opacity="0.15"
                    />
                    <circle
                      cx="250"
                      cy="340"
                      r="4"
                      fill="#FFD700"
                      opacity="0.4"
                    />
                    <circle
                      cx="250"
                      cy="340"
                      r="8"
                      fill="#FFD700"
                      opacity="0.1"
                    />
                    {/* Central glow orb */}
                    <circle
                      cx="250"
                      cy="200"
                      r="40"
                      fill="url(#hero-orb)"
                      opacity="0.6"
                    />
                    <circle
                      cx="250"
                      cy="200"
                      r="20"
                      fill="url(#hero-orb-inner)"
                      opacity="0.8"
                    />
                    <defs>
                      <radialGradient id="hero-orb">
                        <stop
                          offset="0%"
                          stopColor="#a78bfa"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#a78bfa"
                          stopOpacity="0"
                        />
                      </radialGradient>
                      <radialGradient id="hero-orb-inner">
                        <stop
                          offset="0%"
                          stopColor="#c4b5fd"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="100%"
                          stopColor="#a78bfa"
                          stopOpacity="0"
                        />
                      </radialGradient>
                    </defs>
                  </svg>

                  {/* Spacer for floating elements */}
                  <div className="h-[380px] md:h-[420px]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VALUE PROPS — Helio-style quick hits
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] bg-gradient-to-b from-white/[0.015] to-transparent">
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "No middlemen",
              text: "Direct buyer-to-merchant payments on-chain",
              color: "#a78bfa",
            },
            {
              icon: Zap,
              title: "Lower fees",
              text: "1% flat \u2014 keep more of every sale",
              color: "#38bdf8",
            },
            {
              icon: Globe,
              title: "More reach",
              text: "Accept from 500M+ crypto holders worldwide",
              color: "#34d399",
            },
            {
              icon: Clock,
              title: "Instant settlement",
              text: "Receive funds in under one second",
              color: "#fbbf24",
            },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="group relative flex flex-col items-center px-6 py-12 text-center transition-colors hover:bg-white/[0.02]">
                {/* Vertical divider */}
                {i > 0 && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] hidden w-px bg-white/[0.04] md:block" />
                )}
                <div className="relative mb-4">
                  <div
                    className="inline-flex rounded-2xl border p-3.5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${v.color}12`,
                      borderColor: `${v.color}25`,
                    }}
                  >
                    <v.icon className="h-5 w-5" style={{ color: v.color }} />
                  </div>
                  {/* Glow behind icon on hover */}
                  <div
                    className="absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `${v.color}20` }}
                  />
                </div>
                <h3 className="text-[15px] font-semibold text-white">
                  {v.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/35">
                  {v.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUSTED BY — Partner logo bar
         ═══════════════════════════════════════ */}
      <section className="border-b border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-white/25">
            Built on &amp; integrated with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              {
                name: "Solana",
                svg: (
                  <svg
                    viewBox="0 0 397.7 311.7"
                    className="h-5 w-auto fill-white/30 transition-all duration-300 group-hover:fill-white/60"
                  >
                    <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
                    <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
                    <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
                  </svg>
                ),
              },
              {
                name: "Circle (USDC)",
                svg: (
                  <div className="flex items-center gap-2 text-white/30 transition-all duration-300 group-hover:text-white/60">
                    <img
                      src="/usdc.png"
                      alt="USDC"
                      className="h-5 w-5 rounded-full opacity-40 transition-opacity group-hover:opacity-70"
                    />
                    <span className="text-sm font-medium">Circle</span>
                  </div>
                ),
              },
              {
                name: "Privy",
                svg: (
                  <span className="text-sm font-semibold text-white/30 transition-colors duration-300 group-hover:text-white/60">
                    privy
                  </span>
                ),
              },
              {
                name: "Kora",
                svg: (
                  <span className="text-sm font-semibold text-white/30 transition-colors duration-300 group-hover:text-white/60">
                    Kora
                  </span>
                ),
              },
              {
                name: "Mayan",
                svg: (
                  <span className="text-sm font-semibold text-white/30 transition-colors duration-300 group-hover:text-white/60">
                    Mayan
                  </span>
                ),
              },
              {
                name: "Squads",
                svg: (
                  <span className="text-sm font-semibold text-white/30 transition-colors duration-300 group-hover:text-white/60">
                    Squads
                  </span>
                ),
              },
            ].map((p) => (
              <div
                key={p.name}
                className="group flex items-center"
                title={p.name}
              >
                {p.svg}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS — Big bold numbers
         ═══════════════════════════════════════ */}
      <section className="relative isolate mx-auto max-w-5xl px-6 py-28">
        {/* Ambient glow */}
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a78bfa]/[0.04] blur-[150px]" />

        <Reveal>
          <p className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
            Traction
          </p>
          <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Numbers that speak for themselves
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              value: "$2M+",
              label: "Volume processed",
              sub: "and counting",
              color: "#a78bfa",
            },
            {
              value: "<1s",
              label: "Settlement time",
              sub: "on Solana",
              color: "#38bdf8",
            },
            { value: "0", label: "Chargebacks", sub: "ever", color: "#34d399" },
            {
              value: "180+",
              label: "Countries supported",
              sub: "no restrictions",
              color: "#fbbf24",
            },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center transition-all duration-500 hover:border-white/[0.14] hover:bg-white/[0.04]">
                {/* Gradient glow on hover */}
                <div
                  className="absolute inset-0 -z-10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${s.color}15 0%, transparent 70%)`,
                  }}
                />
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-[15%] right-[15%] h-px opacity-50"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                  }}
                />
                <div
                  className="bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, ${s.color}, ${s.color}99)`,
                  }}
                >
                  {s.value}
                </div>
                <div className="mt-3 text-sm font-medium text-white/60">
                  {s.label}
                </div>
                <div className="mt-1 text-xs text-white/25">{s.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SUPPORTED STABLECOINS
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Reveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
              Supported stablecoins
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-center text-2xl font-semibold tracking-tight md:text-3xl">
              Accept the world&apos;s top stablecoins
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "USDC",
                img: "/usdc.png",
                issuer: "Circle",
                color: "#2775CA",
                desc: "The most trusted stablecoin for business payments. Backed 1:1 by US dollars.",
              },
              {
                name: "USDT",
                img: "/usdt.png",
                issuer: "Tether",
                color: "#26A17B",
                desc: "The world\u2019s most traded stablecoin with the deepest liquidity across chains.",
              },
              {
                name: "USDG",
                img: "/usdg.png",
                issuer: "Paxos",
                color: "#8B9A2B",
                desc: "A regulated, yield-bearing stablecoin backed by US Treasuries and cash.",
              },
            ].map((coin, i) => (
              <Reveal key={coin.name} delay={i * 0.08}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center transition-all duration-500 hover:border-white/[0.14] hover:bg-white/[0.04]">
                  {/* Coin-colored glow */}
                  <div
                    className="absolute left-1/2 top-0 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                    style={{ background: coin.color }}
                  />
                  <div
                    className="absolute top-0 left-[20%] right-[20%] h-px opacity-40"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${coin.color}, transparent)`,
                    }}
                  />
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ring-1 ring-white/[0.06]"
                    style={{ background: `${coin.color}15` }}
                  >
                    <img
                      src={coin.img}
                      alt={coin.name}
                      className="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {coin.name}
                  </div>
                  <div
                    className="mt-1 text-xs font-medium"
                    style={{ color: `${coin.color}99` }}
                  >
                    by {coin.issuer}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-white/35">
                    {coin.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY SETTLR — FEATURES (Bento Grid)
         ═══════════════════════════════════════ */}
      <section className="relative isolate mx-auto max-w-5xl px-6 py-28">
        <div className="absolute right-0 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-[#38bdf8]/[0.03] blur-[120px]" />

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

        {/* Bento grid */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {/* Hero card 1 — Instant Settlement (spans 2 cols) */}
          <Reveal delay={0.06}>
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#a78bfa]/[0.08] via-transparent to-transparent p-8 transition-all duration-300 hover:border-[#a78bfa]/20 md:col-span-2 md:p-10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#a78bfa]/40 via-[#a78bfa]/10 to-transparent" />
              <div className="mb-5 inline-flex rounded-xl bg-[#a78bfa]/15 p-3 ring-1 ring-[#a78bfa]/20">
                <Zap className="h-6 w-6 text-[#a78bfa]" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Instant settlement
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/45">
                Funds arrive in your wallet the moment a customer pays. No
                holds, no processing delays. No 2-7 day bank settlement windows.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  &lt; 1 second
                </div>
                <span className="text-xs text-white/20">on Solana</span>
              </div>
            </div>
          </Reveal>

          {/* Hero card 2 — Non-custodial */}
          <Reveal delay={0.12}>
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#38bdf8]/[0.08] via-transparent to-transparent p-8 transition-all duration-300 hover:border-[#38bdf8]/20 md:p-10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#38bdf8]/40 via-[#38bdf8]/10 to-transparent" />
              <div className="mb-5 inline-flex rounded-xl bg-[#38bdf8]/15 p-3 ring-1 ring-[#38bdf8]/20">
                <Shield className="h-6 w-6 text-[#38bdf8]" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Non-custodial
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/45">
                We never hold your money. Payments go directly to your wallet
                via on-chain smart contracts.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-white/25">
                <Lock className="h-3.5 w-3.5" />
                Your keys, your funds
              </div>
            </div>
          </Reveal>

          {/* Row 2 — 3 smaller feature cards */}
          {[
            {
              icon: Lock,
              title: "Privacy-first",
              text: "Encrypted receipts and private transaction data. Your revenue is nobody\u2019s business.",
              accent: "#c084fc",
            },
            {
              icon: RefreshCw,
              title: "Subscriptions",
              text: "Recurring billing with automatic renewal, trials, and dunning \u2014 all in stablecoins.",
              accent: "#34d399",
            },
            {
              icon: Globe,
              title: "Global by default",
              text: "Accept payments from 180+ countries. No bank account, no geographic restrictions.",
              accent: "#fbbf24",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={0.18 + i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]">
                <div
                  className="absolute left-0 top-0 bottom-0 w-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(to bottom, ${f.accent}, transparent)`,
                  }}
                />
                <div
                  className="mb-4 inline-flex rounded-xl p-2.5"
                  style={{ background: `${f.accent}15` }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.accent }} />
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

        {/* Full-width Developer card */}
        <Reveal delay={0.36}>
          <div className="mt-4 group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent p-8 transition-all duration-300 hover:border-white/[0.12] md:p-10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-4 inline-flex rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/[0.08]">
                  <Code2 className="h-6 w-6 text-white/70" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Developer-first SDK
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">
                  TypeScript SDK with React hooks and components. Integrate
                  checkout in under 10 lines of code.
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-[#0c0c10] px-6 py-4 font-mono text-sm text-white/50 ring-1 ring-white/[0.06]">
                <span className="text-[#a78bfa]">npm</span> install @settlr/sdk
              </div>
            </div>
          </div>
        </Reveal>
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

          <div className="relative mt-16">
            {/* Connecting gradient line (desktop) */}
            <div className="absolute top-[26px] left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-[#a78bfa]/40 via-[#38bdf8]/30 to-[#34d399]/40 md:block" />

            <div className="grid gap-8 md:grid-cols-3 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Install the SDK",
                  text: "Add @settlr/sdk to your project and configure your merchant wallet address.",
                  code: "npm install @settlr/sdk",
                  color: "#a78bfa",
                },
                {
                  step: "02",
                  title: "Drop in checkout",
                  text: "Use our React components or REST API to create payment sessions and subscription plans.",
                  code: "<SettlrCheckout amount={49.99} />",
                  color: "#38bdf8",
                },
                {
                  step: "03",
                  title: "Get paid instantly",
                  text: "Customers pay with USDC. Funds settle to your wallet in under one second.",
                  code: "// Funds in your wallet \u2713",
                  color: "#34d399",
                },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    {/* Step badge */}
                    <div
                      className="relative z-10 mb-8 flex h-[52px] w-[52px] items-center justify-center rounded-2xl text-lg font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${s.color}20, ${s.color}08)`,
                        border: `1px solid ${s.color}30`,
                        color: s.color,
                      }}
                    >
                      {s.step}
                      <div
                        className="absolute inset-0 -z-10 rounded-2xl blur-xl"
                        style={{ background: `${s.color}15` }}
                      />
                    </div>

                    {/* Card */}
                    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]">
                      <h3 className="text-lg font-semibold text-white">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/40">
                        {s.text}
                      </p>
                      <div
                        className="mt-5 rounded-lg px-4 py-3 font-mono text-xs"
                        style={{
                          background: `${s.color}08`,
                          color: `${s.color}99`,
                          border: `1px solid ${s.color}15`,
                        }}
                      >
                        {s.code}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
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
                    <th className="relative px-6 py-4 font-semibold text-[#a78bfa]">
                      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent" />
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
                color: "#a78bfa",
              },
              {
                icon: RefreshCw,
                title: "Recurring billing",
                text: "Stablecoin subscriptions with automatic renewals, trial periods, and smart retry logic.",
                color: "#38bdf8",
              },
              {
                icon: Globe,
                title: "Global commerce",
                text: "Accept payments from anywhere. No bank account needed, no geographic restrictions, no currency conversion.",
                color: "#34d399",
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#050507] p-8 transition-all duration-300 hover:border-white/[0.12]">
                  <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${c.color}, transparent)`,
                    }}
                  />
                  <div
                    className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border"
                    style={{
                      background: `${c.color}12`,
                      borderColor: `${c.color}25`,
                    }}
                  >
                    <c.icon className="h-5 w-5" style={{ color: c.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {c.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/40">
                    {c.text}
                  </p>
                  <Link
                    href="/onboarding"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:brightness-125"
                    style={{ color: c.color }}
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
          SECURITY & TRUST
         ═══════════════════════════════════════ */}
      <section className="relative isolate mx-auto max-w-5xl px-6 py-28">
        <div className="absolute left-0 top-1/2 -z-10 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#a78bfa]/[0.03] blur-[120px]" />

        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
            Security
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
            Enterprise-grade payment security
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-lg text-base text-white/40">
            Focus on growing your business. We handle the security.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "Non-custodial",
              text: "We never touch your funds. Payments flow directly from customer to your wallet via smart contracts.",
              color: "#a78bfa",
            },
            {
              icon: Lock,
              title: "Encrypted receipts",
              text: "FHE-encrypted transaction data via Inco Lightning. Only you and your customer can see amounts.",
              color: "#38bdf8",
            },
            {
              icon: Globe,
              title: "AML screening",
              text: "Every wallet is screened against OFAC sanctions and scored for risk before payment is processed.",
              color: "#34d399",
            },
            {
              icon: Zap,
              title: "Multisig treasury",
              text: "Platform fees are held in a Squads multisig. No single point of failure, no unilateral access.",
              color: "#fbbf24",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]">
                <div
                  className="absolute left-0 top-0 bottom-0 w-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(to bottom, ${f.color}, transparent)`,
                  }}
                />
                <div
                  className="mb-4 inline-flex rounded-xl border p-2.5"
                  style={{
                    background: `${f.color}15`,
                    borderColor: `${f.color}25`,
                  }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.color }} />
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
          FAQ
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-3xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#a78bfa]">
              FAQ
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>

          <div className="mt-12 divide-y divide-white/[0.06]">
            {[
              {
                q: "What stablecoins do you support?",
                a: "We currently support USDC, USDT, and USDG on Solana. Cross-chain support for Ethereum, Base, Arbitrum, Polygon, and Optimism is available via Mayan Protocol — funds are automatically bridged to your Solana wallet.",
              },
              {
                q: "Do my customers need a crypto wallet?",
                a: "No. We integrate Privy for embedded wallets — customers can sign up with just their email or social login. No crypto experience required. They can also use existing wallets like Phantom or Solflare.",
              },
              {
                q: "Who pays the gas fees?",
                a: "Nobody. All transactions are gasless via Kora (backed by the Solana Foundation). Your customers don't need SOL for gas, and neither do you.",
              },
              {
                q: "What are the fees?",
                a: "1% flat per transaction. No setup fees, no monthly fees, no hidden charges. Compare that to Stripe's 2.9% + 30¢ — on $10,000/month you'd save over $190.",
              },
              {
                q: "How fast do I receive funds?",
                a: "Instantly. Payments settle to your wallet in under one second on Solana. No holds, no processing delays, no 2-7 day bank settlement windows.",
              },
              {
                q: "Is this custodial? Do you hold my funds?",
                a: "No. Settlr is fully non-custodial. Payments flow directly from the customer's wallet to yours via on-chain smart contracts. We never have access to your funds.",
              },
              {
                q: "Can I accept subscriptions?",
                a: "Yes. We have built-in recurring billing with automatic renewal, trial periods, and smart retry logic — all in stablecoins. No extra tooling needed.",
              },
              {
                q: "How do I integrate?",
                a: "Install our TypeScript SDK (npm install @settlr/sdk), drop in the React checkout component, and you're live. Most teams integrate in under 30 minutes.",
              },
            ].map((faq, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium text-white transition-colors hover:text-white/80">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/30 transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-relaxed text-white/45">
                    {faq.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
         ═══════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#a78bfa]/[0.08] via-[#a78bfa]/[0.02] to-transparent" />
        <div className="absolute left-1/2 bottom-0 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-[#a78bfa]/[0.06] blur-[150px]" />
        <div className="absolute left-1/3 top-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-[#38bdf8]/[0.04] blur-[100px]" />

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
