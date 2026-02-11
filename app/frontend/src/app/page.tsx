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
                          <svg
                            viewBox="0 0 32 32"
                            className="h-5 w-5"
                            fill="none"
                          >
                            <circle cx="16" cy="16" r="16" fill="#2775CA" />
                            <path
                              d="M20.4 18.6c0-2-1.2-2.7-3.6-3-.8-.2-1.6-.4-2-1-.2-.4-.2-.8 0-1.2.2-.4.8-.6 1.4-.6.8 0 1.2.4 1.4.8.2.2.4.4.6.4h.8c.4 0 .6-.2.6-.4-.4-1-1-1.8-2.2-2v-1.2c0-.4-.2-.6-.6-.6h-.4c-.4 0-.6.2-.6.6v1.2c-1.6.2-2.6 1.4-2.6 2.8 0 1.8 1.2 2.6 3.6 2.8 1.6.4 2 .8 2 1.6s-.8 1.4-1.8 1.4c-1.2 0-1.8-.6-2-1.2 0-.2-.2-.4-.6-.4h-.8c-.4 0-.6.2-.6.6.4 1.2 1.2 2 2.8 2.4v1.2c0 .4.2.6.6.6h.4c.4 0 .6-.2.6-.6v-1.2c1.6-.4 2.6-1.4 2.6-3z"
                              fill="#fff"
                            />
                          </svg>
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
                        <svg
                          viewBox="0 0 32 32"
                          className="h-5 w-5"
                          fill="none"
                        >
                          <circle cx="16" cy="16" r="16" fill="#2775CA" />
                          <path
                            d="M20.4 18.6c0-2-1.2-2.7-3.6-3-.8-.2-1.6-.4-2-1-.2-.4-.2-.8 0-1.2.2-.4.8-.6 1.4-.6.8 0 1.2.4 1.4.8.2.2.4.4.6.4h.8c.4 0 .6-.2.6-.4-.4-1-1-1.8-2.2-2v-1.2c0-.4-.2-.6-.6-.6h-.4c-.4 0-.6.2-.6.6v1.2c-1.6.2-2.6 1.4-2.6 2.8 0 1.8 1.2 2.6 3.6 2.8 1.6.4 2 .8 2 1.6s-.8 1.4-1.8 1.4c-1.2 0-1.8-.6-2-1.2 0-.2-.2-.4-.6-.4h-.8c-.4 0-.6.2-.6.6.4 1.2 1.2 2 2.8 2.4v1.2c0 .4.2.6.6.6h.4c.4 0 .6-.2.6-.6v-1.2c1.6-.4 2.6-1.4 2.6-3z"
                            fill="#fff"
                          />
                        </svg>
                        <span className="text-[11px] font-medium text-white/60">
                          USDC
                        </span>
                      </span>
                      <span className="text-white/10">|</span>
                      {/* USDT */}
                      <span className="flex items-center gap-1.5">
                        <svg
                          viewBox="0 0 32 32"
                          className="h-5 w-5"
                          fill="none"
                        >
                          <circle cx="16" cy="16" r="16" fill="#26A17B" />
                          <path
                            d="M17.6 17v-.2c-1 0-2.2-.2-2.2-.2v.4c0 .2 1 .2 2.2.2zm3.4-3.4H11v1.6h3.4v2.4c-2.4.2-4.2.6-4.2 1.2s1.8 1 4.2 1.2v4.4h2.2V20c2.4-.2 4.2-.6 4.2-1.2s-1.8-1-4.2-1.2v-2.4H21v-1.6z"
                            fill="#fff"
                          />
                        </svg>
                        <span className="text-[11px] font-medium text-white/60">
                          USDT
                        </span>
                      </span>
                      <span className="text-white/10">|</span>
                      {/* USDG (Paxos) */}
                      <span className="flex items-center gap-1.5">
                        <svg
                          viewBox="0 0 32 32"
                          className="h-5 w-5"
                          fill="none"
                        >
                          <circle cx="16" cy="16" r="16" fill="#1A1A2E" />
                          <circle
                            cx="16"
                            cy="16"
                            r="11"
                            stroke="#FFD700"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <text
                            x="16"
                            y="20"
                            textAnchor="middle"
                            fill="#FFD700"
                            fontSize="11"
                            fontWeight="700"
                            fontFamily="system-ui"
                          >
                            G
                          </text>
                        </svg>
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
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2775CA]/20 shadow-lg shadow-[#2775CA]/10 ring-1 ring-[#2775CA]/30 backdrop-blur-sm">
                      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#2775CA" />
                        <path
                          d="M20.4 18.6c0-2-1.2-2.7-3.6-3-.8-.2-1.6-.4-2-1-.2-.4-.2-.8 0-1.2.2-.4.8-.6 1.4-.6.8 0 1.2.4 1.4.8.2.2.4.4.6.4h.8c.4 0 .6-.2.6-.4-.4-1-1-1.8-2.2-2v-1.2c0-.4-.2-.6-.6-.6h-.4c-.4 0-.6.2-.6.6v1.2c-1.6.2-2.6 1.4-2.6 2.8 0 1.8 1.2 2.6 3.6 2.8 1.6.4 2 .8 2 1.6s-.8 1.4-1.8 1.4c-1.2 0-1.8-.6-2-1.2 0-.2-.2-.4-.6-.4h-.8c-.4 0-.6.2-.6.6.4 1.2 1.2 2 2.8 2.4v1.2c0 .4.2.6.6.6h.4c.4 0 .6-.2.6-.6v-1.2c1.6-.4 2.6-1.4 2.6-3z"
                          fill="#fff"
                        />
                      </svg>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#26A17B]/20 shadow-lg shadow-[#26A17B]/10 ring-1 ring-[#26A17B]/30 backdrop-blur-sm">
                      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#26A17B" />
                        <path
                          d="M17.6 17v-.2c-1 0-2.2-.2-2.2-.2v.4c0 .2 1 .2 2.2.2zm3.4-3.4H11v1.6h3.4v2.4c-2.4.2-4.2.6-4.2 1.2s1.8 1 4.2 1.2v4.4h2.2V20c2.4-.2 4.2-.6 4.2-1.2s-1.8-1-4.2-1.2v-2.4H21v-1.6z"
                          fill="#fff"
                        />
                      </svg>
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD700]/10 shadow-lg shadow-[#FFD700]/5 ring-1 ring-[#FFD700]/25 backdrop-blur-sm">
                      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#1A1A2E" />
                        <circle
                          cx="16"
                          cy="16"
                          r="11"
                          stroke="#FFD700"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <text
                          x="16"
                          y="20"
                          textAnchor="middle"
                          fill="#FFD700"
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="system-ui"
                        >
                          G
                        </text>
                      </svg>
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
