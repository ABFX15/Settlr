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
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl shadow-xl shadow-black/20 md:p-10">
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
          className="mt-4 w-full accent-[#c8a2ff]"
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
        <div className="rounded-xl bg-[#c8a2ff]/10 p-5 ring-1 ring-[#c8a2ff]/20">
          <p className="text-xs font-medium text-[#c8a2ff]">You save</p>
          <p className="mt-1 text-2xl font-semibold text-[#c8a2ff]">
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
    <main className="relative min-h-screen bg-[#060608] text-white antialiased">
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
        {/* Glass wave background image */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage: "url('/glass-wave-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#060608]/40 via-[#060608]/60 to-[#060608]" />
        {/* Subtle ambient glow */}
        <div className="absolute -top-40 left-[10%] h-[600px] w-[600px] rounded-full bg-[#c8a2ff]/[0.07] blur-[128px]" />
        <div className="absolute top-[20%] right-[5%] h-[500px] w-[500px] rounded-full bg-[#7dd3fc]/[0.05] blur-[128px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ─── Left: Copy ─── */}
            <div>
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.06] px-4 py-1.5 text-[13px] text-white/60 backdrop-blur-xl shadow-lg shadow-black/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c8a2ff]" />
                  Built for AI &amp; SaaS teams blocked by Stripe
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="max-w-xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.08] tracking-tight">
                  The payment stack for{" "}
                  <span className="bg-gradient-to-r from-[#c8a2ff] to-[#7dd3fc] bg-clip-text text-transparent">
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-semibold text-[#060608] shadow-lg shadow-white/10 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-white/20 active:scale-[0.98]"
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
                    <span className="text-[#c8a2ff]">npm</span> install
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
                        fill="#060608"
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

            {/* ─── Right: Premium payment visual ─── */}
            <Reveal delay={0.15}>
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                {/* ── Multi-layer ambient glow ── */}
                <div className="absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8a2ff]/[0.14] blur-[140px]" />
                <div className="absolute left-[65%] top-[35%] -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7dd3fc]/[0.10] blur-[100px]" />
                <div className="absolute left-[30%] top-[65%] -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#34d399]/[0.06] blur-[80px]" />

                <div className="relative" style={{ perspective: "1200px" }}>
                  {/* ── Background: Animated orbital rings + grid ── */}
                  <svg
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                    viewBox="0 0 500 460"
                    fill="none"
                  >
                    {/* Perspective grid */}
                    <g opacity="0.04" stroke="white" strokeWidth="0.5">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <line
                          key={`gh${i}`}
                          x1="50"
                          y1={80 + i * 30}
                          x2="450"
                          y2={80 + i * 30}
                        />
                      ))}
                      {Array.from({ length: 11 }).map((_, i) => (
                        <line
                          key={`gv${i}`}
                          x1={50 + i * 40}
                          y1="80"
                          x2={50 + i * 40}
                          y2="380"
                        />
                      ))}
                    </g>

                    {/* Concentric orbital ellipses */}
                    <ellipse
                      cx="250"
                      cy="230"
                      rx="200"
                      ry="90"
                      stroke="url(#ring1)"
                      strokeWidth="0.8"
                      opacity="0.4"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 250 230;360 250 230"
                        dur="40s"
                        repeatCount="indefinite"
                      />
                    </ellipse>
                    <ellipse
                      cx="250"
                      cy="230"
                      rx="150"
                      ry="65"
                      stroke="url(#ring2)"
                      strokeWidth="0.6"
                      opacity="0.3"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="360 250 230;0 250 230"
                        dur="30s"
                        repeatCount="indefinite"
                      />
                    </ellipse>
                    <ellipse
                      cx="250"
                      cy="230"
                      rx="95"
                      ry="40"
                      stroke="url(#ring3)"
                      strokeWidth="0.5"
                      opacity="0.25"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 250 230;360 250 230"
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </ellipse>

                    {/* Animated flow paths — payment arcs */}
                    <path
                      d="M 100 170 Q 175 100 250 140"
                      stroke="url(#flowPurple)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.6"
                      strokeDasharray="6 8"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-80"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </path>
                    <path
                      d="M 250 140 Q 325 100 400 170"
                      stroke="url(#flowBlue)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.6"
                      strokeDasharray="6 8"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-80"
                        dur="3.5s"
                        repeatCount="indefinite"
                      />
                    </path>
                    <path
                      d="M 250 320 Q 250 270 250 220"
                      stroke="url(#flowGreen)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.5"
                      strokeDasharray="6 8"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-60"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </path>

                    {/* Animated particles along flow paths */}
                    <circle r="2.5" fill="#c8a2ff" opacity="0.9">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M 100 170 Q 175 100 250 140"
                      />
                    </circle>
                    <circle r="2" fill="#c8a2ff" opacity="0.5">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M 100 170 Q 175 100 250 140"
                        begin="1.5s"
                      />
                    </circle>
                    <circle r="2.5" fill="#7dd3fc" opacity="0.9">
                      <animateMotion
                        dur="3.5s"
                        repeatCount="indefinite"
                        path="M 250 140 Q 325 100 400 170"
                      />
                    </circle>
                    <circle r="2" fill="#7dd3fc" opacity="0.5">
                      <animateMotion
                        dur="3.5s"
                        repeatCount="indefinite"
                        path="M 250 140 Q 325 100 400 170"
                        begin="1.75s"
                      />
                    </circle>
                    <circle r="2.5" fill="#34d399" opacity="0.8">
                      <animateMotion
                        dur="2.5s"
                        repeatCount="indefinite"
                        path="M 250 320 Q 250 270 250 220"
                      />
                    </circle>

                    {/* Node glow dots at card anchors */}
                    <circle cx="100" cy="170" r="4" fill="#c8a2ff">
                      <animate
                        attributeName="opacity"
                        values="0.3;0.8;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="100"
                      cy="170"
                      r="12"
                      fill="#c8a2ff"
                      opacity="0.08"
                    >
                      <animate
                        attributeName="r"
                        values="10;16;10"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="400" cy="170" r="4" fill="#7dd3fc">
                      <animate
                        attributeName="opacity"
                        values="0.3;0.8;0.3"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="400"
                      cy="170"
                      r="12"
                      fill="#7dd3fc"
                      opacity="0.08"
                    >
                      <animate
                        attributeName="r"
                        values="10;16;10"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="250" cy="320" r="4" fill="#34d399">
                      <animate
                        attributeName="opacity"
                        values="0.3;0.7;0.3"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="250"
                      cy="320"
                      r="12"
                      fill="#34d399"
                      opacity="0.06"
                    >
                      <animate
                        attributeName="r"
                        values="10;16;10"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Central nexus orb */}
                    <circle
                      cx="250"
                      cy="200"
                      r="50"
                      fill="url(#nexusOuter)"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="r"
                        values="48;54;48"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="250"
                      cy="200"
                      r="24"
                      fill="url(#nexusInner)"
                      opacity="0.9"
                    >
                      <animate
                        attributeName="r"
                        values="22;26;22"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="250" cy="200" r="6" fill="white" opacity="0.4">
                      <animate
                        attributeName="opacity"
                        values="0.3;0.6;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Floating particles */}
                    {[
                      { cx: 70, cy: 120, dur: "6s", delay: "0s" },
                      { cx: 420, cy: 100, dur: "7s", delay: "1s" },
                      { cx: 380, cy: 340, dur: "5s", delay: "2s" },
                      { cx: 130, cy: 350, dur: "8s", delay: "0.5s" },
                      { cx: 320, cy: 260, dur: "6.5s", delay: "3s" },
                      { cx: 180, cy: 280, dur: "7.5s", delay: "1.5s" },
                    ].map((p, i) => (
                      <circle
                        key={i}
                        cx={p.cx}
                        cy={p.cy}
                        r="1.5"
                        fill="white"
                        opacity="0.15"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.05;0.25;0.05"
                          dur={p.dur}
                          begin={p.delay}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values={`${p.cy};${p.cy - 12};${p.cy}`}
                          dur={p.dur}
                          begin={p.delay}
                          repeatCount="indefinite"
                        />
                      </circle>
                    ))}

                    <defs>
                      <linearGradient
                        id="ring1"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#c8a2ff"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="50%"
                          stopColor="#7dd3fc"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#c8a2ff"
                          stopOpacity="0.5"
                        />
                      </linearGradient>
                      <linearGradient
                        id="ring2"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#7dd3fc"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="50%"
                          stopColor="#34d399"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#7dd3fc"
                          stopOpacity="0.4"
                        />
                      </linearGradient>
                      <linearGradient
                        id="ring3"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#d4b5ff"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#c8a2ff"
                          stopOpacity="0.3"
                        />
                      </linearGradient>
                      <linearGradient
                        id="flowPurple"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#c8a2ff" stopOpacity="0" />
                        <stop
                          offset="50%"
                          stopColor="#c8a2ff"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="#c8a2ff"
                          stopOpacity="0"
                        />
                      </linearGradient>
                      <linearGradient
                        id="flowBlue"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
                        <stop
                          offset="50%"
                          stopColor="#7dd3fc"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="#7dd3fc"
                          stopOpacity="0"
                        />
                      </linearGradient>
                      <linearGradient
                        id="flowGreen"
                        x1="0%"
                        y1="100%"
                        x2="0%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
                        <stop
                          offset="50%"
                          stopColor="#34d399"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="#34d399"
                          stopOpacity="0"
                        />
                      </linearGradient>
                      <radialGradient id="nexusOuter">
                        <stop
                          offset="0%"
                          stopColor="#c8a2ff"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="60%"
                          stopColor="#7dd3fc"
                          stopOpacity="0.08"
                        />
                        <stop
                          offset="100%"
                          stopColor="#c8a2ff"
                          stopOpacity="0"
                        />
                      </radialGradient>
                      <radialGradient id="nexusInner">
                        <stop
                          offset="0%"
                          stopColor="#dbc4ff"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#c8a2ff"
                          stopOpacity="0"
                        />
                      </radialGradient>
                    </defs>
                  </svg>

                  {/* ── Main card: Checkout (glassmorphism) ── */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-30 mx-auto w-[290px]"
                    style={{ transform: "rotateY(-6deg) rotateX(3deg)" }}
                  >
                    {/* Gradient border wrapper */}
                    <div className="rounded-2xl bg-gradient-to-b from-white/[0.18] to-white/[0.04] p-px shadow-2xl shadow-[#c8a2ff]/10">
                      <div className="overflow-hidden rounded-2xl bg-[#0a0a12]/80 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                        {/* Top accent gradient */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[#c8a2ff]/50 to-transparent" />
                        {/* Window chrome */}
                        <div className="flex items-center gap-1.5 border-b border-white/[0.04] px-4 py-2.5">
                          <span className="h-2 w-2 rounded-full bg-[#ff5f57]/80" />
                          <span className="h-2 w-2 rounded-full bg-[#febc2e]/80" />
                          <span className="h-2 w-2 rounded-full bg-[#28c840]/80" />
                          <span className="ml-auto text-[9px] font-medium tracking-wider text-white/15 uppercase">
                            Settlr Checkout
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#c8a2ff]/25 to-[#c8a2ff]/10 ring-1 ring-[#c8a2ff]/20">
                              <CreditCard className="h-4 w-4 text-[#c8a2ff]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">
                                Acme AI Pro
                              </p>
                              <p className="text-[10px] text-white/25">
                                Monthly subscription
                              </p>
                            </div>
                          </div>
                          {/* Amount display */}
                          <div className="mb-4 overflow-hidden rounded-xl bg-white/[0.03] ring-1 ring-white/[0.04]">
                            <div className="px-4 py-3">
                              <p className="text-[10px] font-medium text-white/25 uppercase tracking-wide">
                                Amount
                              </p>
                              <div className="mt-1 flex items-center justify-between">
                                <p className="text-2xl font-bold text-white tracking-tight">
                                  $49
                                  <span className="text-base font-medium text-white/30">
                                    .99
                                  </span>
                                </p>
                                <div className="flex items-center gap-1.5 rounded-full bg-[#2775CA]/15 px-2.5 py-1 ring-1 ring-[#2775CA]/20">
                                  <img
                                    src="/usdc.png"
                                    alt="USDC"
                                    className="h-4 w-4 rounded-full"
                                  />
                                  <span className="text-[10px] font-semibold text-[#2775CA]">
                                    USDC
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-[10px] text-white/15">
                                49.99 USDC · Solana
                              </p>
                            </div>
                            {/* Progress shimmer */}
                            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c8a2ff]/30 to-transparent">
                              <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                  repeatDelay: 3,
                                }}
                                className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#c8a2ff]/60 to-transparent"
                              />
                            </div>
                          </div>
                          {/* Pay button */}
                          <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#c8a2ff] to-[#a87dff] py-2.5 text-center shadow-lg shadow-[#c8a2ff]/20">
                            <span className="text-xs font-bold text-white tracking-wide">
                              Pay with USDC
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-center gap-3 text-[9px] text-white/20">
                            <span className="flex items-center gap-1">
                              <Shield className="h-2.5 w-2.5" /> Non-custodial
                            </span>
                            <span className="h-2 w-px bg-white/10" />
                            <span className="flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" /> Zero gas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Left card: Subscription dashboard ── */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute -left-6 top-12 z-20 w-[210px] md:-left-10"
                    style={{ transform: "rotateY(8deg) rotateX(2deg)" }}
                  >
                    <div className="rounded-xl bg-gradient-to-b from-[#7dd3fc]/[0.20] to-white/[0.04] p-px shadow-xl shadow-[#7dd3fc]/10">
                      <div className="overflow-hidden rounded-xl bg-[#0a0a12]/75 shadow-xl shadow-black/30 backdrop-blur-2xl">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#7dd3fc]/40 to-transparent" />
                        <div className="p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7dd3fc]/20 to-[#7dd3fc]/5 ring-1 ring-[#7dd3fc]/15">
                              <RefreshCw className="h-3.5 w-3.5 text-[#7dd3fc]" />
                            </div>
                            <p className="text-[11px] font-semibold text-white">
                              Active Plans
                            </p>
                            <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-[8px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                              3
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {[
                              {
                                name: "Pro",
                                price: "$49/mo",
                                active: true,
                                color: "#c8a2ff",
                              },
                              {
                                name: "API Credits",
                                price: "$0.002/call",
                                active: true,
                                color: "#7dd3fc",
                              },
                              {
                                name: "Enterprise",
                                price: "$199/mo",
                                active: false,
                                color: "#fbbf24",
                              },
                            ].map((s) => (
                              <div
                                key={s.name}
                                className="group flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                      background: s.active
                                        ? "#34d399"
                                        : "#fbbf24",
                                      boxShadow: s.active
                                        ? "0 0 6px #34d39960"
                                        : "none",
                                    }}
                                  />
                                  <span className="text-[10px] text-white/60">
                                    {s.name}
                                  </span>
                                </div>
                                <span className="text-[10px] font-medium text-white/30">
                                  {s.price}
                                </span>
                              </div>
                            ))}
                          </div>
                          {/* Mini revenue chart */}
                          <div className="mt-3 flex items-end gap-[3px] h-8 px-1">
                            {[
                              40, 55, 35, 65, 50, 80, 60, 75, 90, 70, 85, 95,
                            ].map((h, i) => (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{
                                  delay: 0.5 + i * 0.08,
                                  duration: 0.4,
                                  ease: "easeOut",
                                }}
                                className="flex-1 rounded-sm"
                                style={{
                                  background: `linear-gradient(to top, ${
                                    i >= 9 ? "#7dd3fc" : "#7dd3fc30"
                                  }, ${i >= 9 ? "#7dd3fc" : "#7dd3fc15"})`,
                                }}
                              />
                            ))}
                          </div>
                          <p className="mt-1.5 text-[8px] text-white/15 text-center">
                            Monthly recurring revenue
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Right card: Settlement confirmation ── */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 5.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    className="absolute -right-4 top-6 z-10 w-[200px] md:-right-8"
                    style={{ transform: "rotateY(-10deg) rotateX(3deg)" }}
                  >
                    <div className="rounded-xl bg-gradient-to-b from-emerald-400/[0.20] to-white/[0.04] p-px shadow-xl shadow-emerald-500/10">
                      <div className="overflow-hidden rounded-xl bg-[#0a0a12]/75 shadow-xl shadow-black/30 backdrop-blur-2xl">
                        <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                        <div className="p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 ring-1 ring-emerald-500/20">
                              <Zap className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <p className="text-[11px] font-semibold text-white">
                              Settlement
                            </p>
                          </div>
                          <div className="rounded-xl bg-emerald-500/[0.07] p-3 ring-1 ring-emerald-500/15">
                            <div className="flex items-center gap-1.5">
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40"
                              />
                              <p className="text-[10px] font-medium text-emerald-400">
                                Received
                              </p>
                            </div>
                            <p className="mt-1 text-xl font-bold text-white tracking-tight">
                              $249
                              <span className="text-xs font-normal text-white/25">
                                .98
                              </span>
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-[10px] text-emerald-400/70">
                                ✓ 0.4s
                              </span>
                              <span className="h-3 w-px bg-emerald-500/15" />
                              <span className="text-[10px] text-emerald-400/70">
                                3 txns
                              </span>
                            </div>
                          </div>
                          {/* Transaction list */}
                          <div className="mt-2.5 space-y-1">
                            {[
                              {
                                hash: "7xK2..mF9p",
                                amt: "$49.99",
                                time: "0.3s",
                              },
                              {
                                hash: "3bN8..uL2k",
                                amt: "$199.99",
                                time: "0.4s",
                              },
                            ].map((tx) => (
                              <div
                                key={tx.hash}
                                className="flex items-center justify-between text-[9px]"
                              >
                                <span className="font-mono text-white/20">
                                  {tx.hash}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-white/30">
                                    {tx.amt}
                                  </span>
                                  <span className="text-emerald-400/50">
                                    {tx.time}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-white/15">
                            <Lock className="h-3 w-3" />
                            Encrypted receipt · FHE
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Bottom badge: Supported coins ── */}
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                    className="absolute -bottom-6 left-1/2 z-40 -translate-x-1/2"
                  >
                    <div className="rounded-full bg-gradient-to-r from-white/[0.12] to-white/[0.05] p-px">
                      <div className="flex items-center gap-3 rounded-full bg-[#0a0a12]/75 px-5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-2xl">
                        {[
                          { img: "/usdc.png", name: "USDC", color: "#2775CA" },
                          { img: "/usdt.png", name: "USDT", color: "#26A17B" },
                          { img: "/usdg.png", name: "USDG", color: "#8B9A2B" },
                        ].map((coin, i) => (
                          <span
                            key={coin.name}
                            className="flex items-center gap-1.5"
                          >
                            {i > 0 && (
                              <span className="mr-1.5 h-3 w-px bg-white/[0.06]" />
                            )}
                            <img
                              src={coin.img}
                              alt={coin.name}
                              className="h-5 w-5 rounded-full"
                            />
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: `${coin.color}90` }}
                            >
                              {coin.name}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Orbiting coin tokens ── */}
                  <motion.div
                    animate={{
                      y: [0, -12, 0],
                      x: [0, 5, 0],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-4 right-6 z-50"
                  >
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#2775CA]/15 ring-1 ring-[#2775CA]/25 backdrop-blur-sm">
                      <img
                        src="/usdc.png"
                        alt="USDC"
                        className="h-9 w-9 rounded-full"
                      />
                      <div className="absolute inset-0 rounded-full shadow-lg shadow-[#2775CA]/20" />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full ring-1 ring-[#2775CA]/40"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                      x: [0, -6, 0],
                      rotate: [0, -8, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5,
                    }}
                    className="absolute left-0 top-[55%] z-50 md:-left-6"
                  >
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#26A17B]/15 ring-1 ring-[#26A17B]/25 backdrop-blur-sm">
                      <img
                        src="/usdt.png"
                        alt="USDT"
                        className="h-7 w-7 rounded-full"
                      />
                      <div className="absolute inset-0 rounded-full shadow-lg shadow-[#26A17B]/20" />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                        className="absolute inset-0 rounded-full ring-1 ring-[#26A17B]/40"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 7, 0], x: [0, 7, 0], rotate: [0, 12, 0] }}
                    transition={{
                      duration: 6.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 3,
                    }}
                    className="absolute bottom-[12%] right-0 z-50 md:-right-4"
                  >
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD700]/10 ring-1 ring-[#FFD700]/20 backdrop-blur-sm">
                      <img
                        src="/usdg.png"
                        alt="USDG"
                        className="h-7 w-7 rounded-full"
                      />
                      <div className="absolute inset-0 rounded-full shadow-lg shadow-[#FFD700]/15" />
                      <motion.div
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.15, 0, 0.15],
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        className="absolute inset-0 rounded-full ring-1 ring-[#FFD700]/30"
                      />
                    </div>
                  </motion.div>

                  {/* Spacer */}
                  <div className="h-[400px] md:h-[440px]" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VALUE PROPS — Helio-style quick hits
         ═══════════════════════════════════════ */}
      <section className="relative border-y border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "No middlemen",
              text: "Direct buyer-to-merchant payments on-chain",
              color: "#c8a2ff",
            },
            {
              icon: Zap,
              title: "Lower fees",
              text: "1% flat \u2014 keep more of every sale",
              color: "#7dd3fc",
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
      <section className="border-b border-white/[0.06] bg-white/[0.015]">
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
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8a2ff]/[0.04] blur-[150px]" />

        <Reveal>
          <p className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
              color: "#c8a2ff",
            },
            {
              value: "<1s",
              label: "Settlement time",
              sub: "on Solana",
              color: "#7dd3fc",
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
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-xl transition-all duration-500 hover:border-white/[0.16] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20">
                {/* Gradient glow on hover */}
                <div
                  className="absolute inset-0 -z-10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${s.color}20 0%, transparent 70%)`,
                  }}
                />
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-[10%] right-[10%] h-px opacity-60"
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
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <Reveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-xl transition-all duration-500 hover:border-white/[0.18] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20">
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
        <div className="absolute right-0 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-[#7dd3fc]/[0.03] blur-[120px]" />

        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#c8a2ff]/[0.10] via-white/[0.02] to-transparent p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#c8a2ff]/25 hover:shadow-lg hover:shadow-[#c8a2ff]/5 md:col-span-2 md:p-10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#c8a2ff]/40 via-[#c8a2ff]/10 to-transparent" />
              <div className="mb-5 inline-flex rounded-xl bg-[#c8a2ff]/15 p-3 ring-1 ring-[#c8a2ff]/20">
                <Zap className="h-6 w-6 text-[#c8a2ff]" />
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
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#7dd3fc]/[0.10] via-white/[0.02] to-transparent p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#7dd3fc]/25 hover:shadow-lg hover:shadow-[#7dd3fc]/5 md:p-10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#7dd3fc]/40 via-[#7dd3fc]/10 to-transparent" />
              <div className="mb-5 inline-flex rounded-xl bg-[#7dd3fc]/15 p-3 ring-1 ring-[#7dd3fc]/20">
                <Shield className="h-6 w-6 text-[#7dd3fc]" />
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
              accent: "#d4b5ff",
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
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20">
                <div
                  className="absolute left-0 top-0 bottom-0 w-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(to bottom, ${f.accent}, transparent)`,
                  }}
                />
                <div
                  className="mb-4 inline-flex rounded-xl p-2.5 ring-1"
                  style={{ background: `${f.accent}15`, ringColor: `${f.accent}25` }}
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
          <div className="mt-4 group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.04] to-white/[0.01] p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/20 md:p-10">
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
              <div className="shrink-0 rounded-xl bg-[#0c0c14] px-6 py-4 font-mono text-sm text-white/50 ring-1 ring-white/[0.06]">
                <span className="text-[#c8a2ff]">npm</span> install @settlr/sdk
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
         ═══════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
            <div className="absolute top-[26px] left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-[#c8a2ff]/40 via-[#7dd3fc]/30 to-[#34d399]/40 md:block" />

            <div className="grid gap-8 md:grid-cols-3 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Install the SDK",
                  text: "Add @settlr/sdk to your project and configure your merchant wallet address.",
                  code: "npm install @settlr/sdk",
                  color: "#c8a2ff",
                },
                {
                  step: "02",
                  title: "Drop in checkout",
                  text: "Use our React components or REST API to create payment sessions and subscription plans.",
                  code: "<SettlrCheckout amount={49.99} />",
                  color: "#7dd3fc",
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
                    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20">
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
              <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c8a2ff]" />
                    <span className="text-sm text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <Link
                href="/docs"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#c8a2ff] transition-colors hover:text-[#dbc4ff]"
              >
                Read the docs
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          {/* Code block */}
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c14]/90 backdrop-blur-xl shadow-2xl shadow-black/30">
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
                  <span className="text-[#d4b5ff]">import</span>{" "}
                  <span className="text-white/70">{"{ SettlrCheckout }"}</span>{" "}
                  <span className="text-[#d4b5ff]">from</span>{" "}
                  <span className="text-[#86efac]">
                    &apos;@settlr/sdk&apos;
                  </span>
                  {"\n\n"}
                  <span className="text-[#d4b5ff]">export default</span>{" "}
                  <span className="text-[#93c5fd]">function</span>{" "}
                  <span className="text-white">Pricing</span>
                  <span className="text-white/50">() {"{"}</span>
                  {"\n"}
                  {"  "}
                  <span className="text-[#d4b5ff]">return</span>{" "}
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
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
              Comparison
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Why teams switch to Settlr
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.01] backdrop-blur-xl shadow-xl shadow-black/20">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-6 py-4 font-medium text-white/40" />
                    <th className="px-6 py-4 font-medium text-white/40">
                      Traditional
                    </th>
                    <th className="relative px-6 py-4 font-semibold text-[#c8a2ff]">
                      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c8a2ff]/40 to-transparent" />
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
          <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
                color: "#c8a2ff",
              },
              {
                icon: RefreshCw,
                title: "Recurring billing",
                text: "Stablecoin subscriptions with automatic renewals, trial periods, and smart retry logic.",
                color: "#7dd3fc",
              },
              {
                icon: Globe,
                title: "Global commerce",
                text: "Accept payments from anywhere. No bank account needed, no geographic restrictions, no currency conversion.",
                color: "#34d399",
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060608]/80 p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.03] hover:shadow-lg hover:shadow-black/20">
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
        <div className="absolute left-0 top-1/2 -z-10 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#c8a2ff]/[0.03] blur-[120px]" />

        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
              color: "#c8a2ff",
            },
            {
              icon: Lock,
              title: "Encrypted receipts",
              text: "FHE-encrypted transaction data via Inco Lightning. Only you and your customer can see amounts.",
              color: "#7dd3fc",
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
              <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20">
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
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-3xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#c8a2ff]">
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
        {/* Glass wave background for CTA */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage: "url('/glass-wave-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
            transform: "rotate(180deg)",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#060608]/50 via-[#060608]/70 to-[#060608]" />
        <div className="absolute left-1/2 bottom-0 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-[#c8a2ff]/[0.08] blur-[150px]" />
        <div className="absolute left-1/3 top-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-[#7dd3fc]/[0.06] blur-[100px]" />

        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Start accepting payments
              <br />
              <span className="bg-gradient-to-r from-[#c8a2ff] to-[#7dd3fc] bg-clip-text text-transparent">
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
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-semibold text-[#060608] shadow-lg shadow-white/10 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-white/20 active:scale-[0.98]"
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
