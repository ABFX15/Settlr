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
    <div className="rounded-2xl bg-[#08080d] p-8 md:p-10">
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
          className="mt-4 w-full accent-[#3B82F6]"
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
        <div className="rounded-xl bg-[#3B82F6]/10 p-5 ring-1 ring-[#3B82F6]/20">
          <p className="text-xs font-medium text-[#3B82F6]">You save</p>
          <p className="mt-1 text-2xl font-semibold text-[#3B82F6]">
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
    <main
      className="relative min-h-screen bg-[#050507] text-white antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "Settlr",
                url: "https://settlr.dev",
                logo: "https://settlr.dev/og-image.png",
                sameAs: [
                  "https://x.com/SettlrPay",
                  "https://github.com/ABFX15/x402-hack-payment",
                ],
                description:
                  "The payment stack for creator platforms. Stablecoin checkout and payouts — no card network content restrictions, 1% flat, instant settlement.",
              },
              {
                "@type": "SoftwareApplication",
                name: "Settlr",
                applicationCategory: "FinanceApplication",
                operatingSystem: "Web",
                url: "https://settlr.dev",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "1% flat fee per transaction. No setup fees, no monthly fees.",
                },
                description:
                  "Payment infrastructure for creator platforms. Fan checkout, creator payouts, subscriptions, and memberships — all in stablecoins. Non-custodial, gasless, instant settlement.",
                featureList: [
                  "Fan checkout — email-only, no wallet needed",
                  "Creator payouts by email to 180+ countries",
                  "Zero gas fees for fans and creators",
                  "Instant settlement under 1 second",
                  "No card network content restrictions",
                  "Recurring subscriptions and memberships",
                  "Privacy-first encrypted receipts",
                  "TypeScript SDK and React components",
                  "1% flat transaction fee",
                ],
              },
              {
                "@type": "WebSite",
                url: "https://settlr.dev",
                name: "Settlr",
                description:
                  "The payment stack for creator platforms. Checkout + payouts in stablecoins — no card network gatekeeping.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://settlr.dev/docs?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Can I use Settlr for adult content, gambling, or supplements?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. Settlr uses stablecoins — there are no card network content policies. As long as your platform is legal in your jurisdiction, you can use Settlr.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Do fans need a crypto wallet to pay?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. Settlr integrates Privy for embedded wallets — fans sign up with just their email or social login. No crypto experience required.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How do creator payouts work?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Send payouts to any email address. The creator receives a link to claim their funds to any Solana wallet — or they can cash out directly. No bank details needed.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What are Settlr's fees?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "1% flat per transaction. No setup fees, no monthly fees, no hidden charges. Compare that to Stripe's 2.9% + 30¢.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How fast do creators receive funds?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Instantly. Payments settle in under one second on Solana. No holds, no processing delays, no 2-7 day bank settlement windows.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is Settlr custodial?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. Settlr is fully non-custodial. Payments flow directly via on-chain smart contracts. We never have access to your funds.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Can I offer fan subscriptions and memberships?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. Built-in recurring billing with automatic renewal, trial periods, tiered access, and smart retry logic — all in stablecoins.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How do I integrate Settlr?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Install the TypeScript SDK (npm install @settlr/sdk), drop in the React checkout component, and you're live. Most platforms integrate in under 30 minutes.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

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
      <section className="relative isolate overflow-x-clip overflow-y-visible pt-28 pb-20 md:pt-40 md:pb-28">
        {/* Background image */}
        <div className="absolute inset-0 -z-20">
          <img src="/8917.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 -z-10 bg-[#050507]/30" />
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-[#3B82F6]/[0.08] blur-[120px]" />
        {/* Bottom fade into dark page background */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050507] via-[#050507]/90 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* ─── Left: Copy ─── */}
            <div className="lg:col-span-5">
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/[0.1] px-4 py-1.5 text-[13px] text-[#3B82F6] font-medium backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                  For platforms Stripe won&apos;t touch
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="max-w-xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.08] tracking-tight text-white">
                  The payment stack{" "}
                  <span className="text-[#3B82F6]">for creator platforms</span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
                  Collect payments from fans.{" "}
                  <span className="font-medium text-white/80">
                    Pay out creators instantly.
                  </span>{" "}
                  No card networks deciding what content is allowed. 1% flat —
                  stablecoin checkout and payouts that settle in under a second.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Start integrating
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/demo/store"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-[15px] font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    See a live demo
                  </Link>
                </div>
              </Reveal>

              {/* npm install */}
              <Reveal delay={0.2}>
                <button
                  onClick={copyInstall}
                  className="group mt-8 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-5 py-3 font-mono text-sm text-white/50 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white/70"
                >
                  <span>
                    <span className="text-[#3B82F6]">npm</span> install
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
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/25">
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
                    <span className="text-[11px] font-semibold text-white/20 transition-colors hover:text-white/40">
                      ARB
                    </span>
                    {/* Polygon */}
                    <span className="text-[11px] font-semibold text-white/20 transition-colors hover:text-white/40">
                      MATIC
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ─── Right: Premium payment visual ─── */}
            <Reveal delay={0.15} className="lg:col-span-7">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none overflow-visible">
                {/* Rounded dark panel — gradient border for polish */}
                <div className="absolute -inset-8 z-0 rounded-[2rem] bg-gradient-to-br from-[#3B82F6]/20 via-transparent to-[#34d399]/10 p-px">
                  <div className="h-full w-full rounded-[2rem] bg-[#0c0c14]" />
                </div>
                {/* ── Multi-layer ambient glow ── */}
                <div className="absolute left-1/2 top-1/2 z-[1] h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/[0.18] blur-[120px]" />
                <div className="absolute left-[65%] top-[35%] z-[1] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/[0.12] blur-[80px]" />
                <div className="absolute left-[30%] top-[65%] z-[1] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#34d399]/[0.08] blur-[60px]" />

                <div
                  className="relative z-[2]"
                  style={{ perspective: "1200px" }}
                >
                  {/* ── Background: Animated orbital rings + grid ── */}
                  <svg
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                    viewBox="0 0 500 460"
                    fill="none"
                  >
                    {/* Perspective grid */}
                    <g opacity="0.06" stroke="white" strokeWidth="0.5">
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
                      stroke="url(#flowBlue)"
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
                    <circle r="2.5" fill="#3B82F6" opacity="0.9">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M 100 170 Q 175 100 250 140"
                      />
                    </circle>
                    <circle r="2" fill="#3B82F6" opacity="0.5">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M 100 170 Q 175 100 250 140"
                        begin="1.5s"
                      />
                    </circle>
                    <circle r="2.5" fill="#3B82F6" opacity="0.9">
                      <animateMotion
                        dur="3.5s"
                        repeatCount="indefinite"
                        path="M 250 140 Q 325 100 400 170"
                      />
                    </circle>
                    <circle r="2" fill="#3B82F6" opacity="0.5">
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
                    <circle cx="100" cy="170" r="4" fill="#3B82F6">
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
                      fill="#3B82F6"
                      opacity="0.08"
                    >
                      <animate
                        attributeName="r"
                        values="10;16;10"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx="400" cy="170" r="4" fill="#3B82F6">
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
                      fill="#3B82F6"
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
                        opacity="0.2"
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
                          stopColor="#3B82F6"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="50%"
                          stopColor="#3B82F6"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
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
                          stopColor="#3B82F6"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="50%"
                          stopColor="#34d399"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
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
                          stopColor="#c084fc"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
                          stopOpacity="0.3"
                        />
                      </linearGradient>
                      <linearGradient
                        id="flowBlue"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                        <stop
                          offset="50%"
                          stopColor="#3B82F6"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
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
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                        <stop
                          offset="50%"
                          stopColor="#3B82F6"
                          stopOpacity="1"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
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
                          stopColor="#3B82F6"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="60%"
                          stopColor="#3B82F6"
                          stopOpacity="0.08"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
                          stopOpacity="0"
                        />
                      </radialGradient>
                      <radialGradient id="nexusInner">
                        <stop
                          offset="0%"
                          stopColor="#c4b5fd"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
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
                    className="relative z-30 mx-auto w-[300px]"
                    style={{ transform: "rotateY(-6deg) rotateX(3deg)" }}
                  >
                    {/* Gradient border wrapper */}
                    <div className="rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.03] p-px">
                      <div className="overflow-hidden rounded-2xl bg-[#0a0a0f]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
                        {/* Top accent gradient */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6]/25 to-[#3B82F6]/10 ring-1 ring-[#3B82F6]/20">
                              <CreditCard className="h-4 w-4 text-[#3B82F6]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">
                                FanVault Pro
                              </p>
                              <p className="text-[10px] text-white/25">
                                Creator subscription
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
                            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent">
                              <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                  repeatDelay: 3,
                                }}
                                className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#3B82F6]/60 to-transparent"
                              />
                            </div>
                          </div>
                          {/* Pay button */}
                          <div className="overflow-hidden rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] py-2.5 text-center shadow-lg shadow-[#3B82F6]/20">
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
                    className="absolute left-0 top-[55%] z-20 w-[230px] md:-left-6"
                    style={{ transform: "rotateY(8deg) rotateX(2deg)" }}
                  >
                    <div className="rounded-xl bg-gradient-to-b from-[#3B82F6]/[0.15] to-white/[0.03] p-px">
                      <div className="overflow-hidden rounded-xl bg-[#0a0a0f]/85 shadow-xl shadow-black/30 backdrop-blur-xl">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />
                        <div className="p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 ring-1 ring-[#3B82F6]/15">
                              <RefreshCw className="h-3.5 w-3.5 text-[#3B82F6]" />
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
                                color: "#3B82F6",
                              },
                              {
                                name: "API Credits",
                                price: "$0.002/call",
                                active: true,
                                color: "#3B82F6",
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
                                    i >= 9 ? "#3B82F6" : "#3B82F630"
                                  }, ${i >= 9 ? "#3B82F6" : "#3B82F615"})`,
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
                    className="absolute right-0 top-[48%] z-10 w-[220px] md:-right-4"
                    style={{ transform: "rotateY(-10deg) rotateX(3deg)" }}
                  >
                    <div className="rounded-xl bg-gradient-to-b from-emerald-400/[0.15] to-white/[0.03] p-px">
                      <div className="overflow-hidden rounded-xl bg-[#0a0a0f]/85 shadow-xl shadow-black/30 backdrop-blur-xl">
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
                    <div className="rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.04] p-px">
                      <div className="flex items-center gap-3 rounded-full bg-[#0a0a0f]/90 px-5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-xl">
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
                  <div className="h-[520px] md:h-[560px]" />
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
              title: "Can't be deplatformed",
              text: "No card network, no payment processor can shut you down",
              color: "#3B82F6",
            },
            {
              icon: CreditCard,
              title: "Checkout + Payouts",
              text: "Collect from fans, pay out to creators — one stack",
              color: "#3B82F6",
            },
            {
              icon: Zap,
              title: "1% flat",
              text: "No setup fees, no reserves, no surprise holds",
              color: "#34d399",
            },
            {
              icon: Clock,
              title: "Instant settlement",
              text: "Funds arrive in under one second, not 2–7 days",
              color: "#fbbf24",
            },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="group relative flex flex-col items-center px-6 py-12 text-center transition-colors hover:bg-white/[0.02]">
                {/* Vertical divider */}
                {i > 0 && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] hidden w-px bg-white/[0.04] md:block" />
                )}
                <div className="relative mb-5">
                  <div
                    className="inline-flex rounded-2xl p-4 transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${v.color}18, ${v.color}06)`,
                    }}
                  >
                    <v.icon className="h-6 w-6" style={{ color: v.color }} />
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold text-white">
                  {v.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/35">
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
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/[0.04] blur-[150px]" />

        <Reveal>
          <p className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
            Traction
          </p>
          <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Built for scale from day one
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              value: "$2M+",
              label: "Volume processed",
              sub: "on-chain, verifiable",
              color: "#3B82F6",
            },
            {
              value: "<1s",
              label: "Settlement time",
              sub: "vs 2–7 days with card networks",
              color: "#3B82F6",
            },
            {
              value: "0",
              label: "Chargebacks",
              sub: "stablecoin payments are final — no disputes",
              color: "#34d399",
            },
            {
              value: "180+",
              label: "Countries reached",
              sub: "pay creators anywhere, no banking required",
              color: "#fbbf24",
            },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div
                className="group relative overflow-hidden rounded-2xl p-px transition-all duration-500"
                style={{
                  background: `linear-gradient(to bottom, ${s.color}25, transparent 60%)`,
                }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-[#08080d] p-8 text-center">
                  {/* Inner ambient glow */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${s.color}10 0%, transparent 70%)`,
                    }}
                  />
                  <div
                    className="relative bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl"
                    style={{
                      backgroundImage: `linear-gradient(to bottom, ${s.color}, ${s.color}80)`,
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="relative mt-3 text-sm font-medium text-white/60">
                    {s.label}
                  </div>
                  <div className="relative mt-1 text-xs text-white/25">
                    {s.sub}
                  </div>
                </div>
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
            <p className="text-center text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
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
                <div
                  className="group relative overflow-hidden rounded-2xl p-px transition-all duration-500"
                  style={{
                    background: `linear-gradient(to bottom, ${coin.color}30, transparent 50%)`,
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-[#08080d] p-8 text-center">
                    {/* Coin-colored glow — always subtly visible */}
                    <div
                      className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                      style={{ background: coin.color }}
                    />
                    <div
                      className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: `${coin.color}12` }}
                    >
                      <img
                        src={coin.img}
                        alt={coin.name}
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div className="relative text-xl font-semibold text-white">
                      {coin.name}
                    </div>
                    <div
                      className="relative mt-1 text-xs font-medium"
                      style={{ color: `${coin.color}99` }}
                    >
                      by {coin.issuer}
                    </div>
                    <p className="relative mt-3 text-[13px] leading-relaxed text-white/40">
                      {coin.desc}
                    </p>
                  </div>
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
        <div className="absolute right-0 top-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-[#3B82F6]/[0.03] blur-[120px]" />

        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
            Why Settlr
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
            Everything your creator platform
            <br className="hidden md:block" /> needs to move money
          </h2>
        </Reveal>

        {/* Bento grid */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {/* Hero card 1 — Instant Settlement (spans 2 cols) */}
          <Reveal delay={0.06}>
            <div
              className="group relative overflow-hidden rounded-2xl p-px md:col-span-2 transition-all duration-500"
              style={{
                background:
                  "linear-gradient(135deg, #3B82F630, transparent 50%)",
              }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#08080d] p-8 md:p-10">
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/30 to-transparent" />
                <div className="mb-5 inline-flex rounded-xl bg-[#3B82F6]/12 p-3">
                  <Zap className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Fan checkout
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/45">
                  Fans pay with USDC — no wallet download, no gas fees. Embedded
                  wallets via Privy mean they just enter an email and pay. Funds
                  settle to your platform in under a second.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    &lt; 1 second
                  </div>
                  <span className="text-xs text-white/20">on Solana</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Hero card 2 — Non-custodial */}
          <Reveal delay={0.12}>
            <div
              className="group relative overflow-hidden rounded-2xl p-px transition-all duration-500"
              style={{
                background:
                  "linear-gradient(135deg, #3B82F630, transparent 50%)",
              }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#08080d] p-8 md:p-10">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3B82F6] via-[#3B82F6]/30 to-transparent" />
                <div className="mb-5 inline-flex rounded-xl bg-[#3B82F6]/12 p-3">
                  <Shield className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Creator payouts
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">
                  Pay creators anywhere in the world by email. No bank details
                  needed, no wire fees, no 5-day ACH wait.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs text-white/25">
                  <Globe className="h-3.5 w-3.5" />
                  180+ countries, instant
                </div>
              </div>
            </div>
          </Reveal>

          {/* Row 2 — 3 smaller feature cards */}
          {[
            {
              icon: Lock,
              title: "Privacy-first",
              text: "Encrypted receipts protect sensitive purchases. Your creators' revenue is nobody's business.",
              accent: "#c084fc",
            },
            {
              icon: RefreshCw,
              title: "Subscriptions & memberships",
              text: "Recurring billing for fan memberships, tiers, and paywalled content — all in stablecoins.",
              accent: "#34d399",
            },
            {
              icon: Shield,
              title: "Can't be deplatformed",
              text: "No Visa, no Mastercard, no processor who decides what's allowed. Stablecoins don't have content policies.",
              accent: "#fbbf24",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={0.18 + i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl bg-[#08080d] p-7 transition-all duration-300 hover:bg-[#0c0c14]">
                {/* Always-visible left accent */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
                  style={{ background: f.accent }}
                />
                <div
                  className="mb-4 inline-flex rounded-xl p-2.5"
                  style={{ background: `${f.accent}12` }}
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
          <div className="mt-4 group relative overflow-hidden rounded-2xl bg-[#08080d] p-8 transition-all duration-300 hover:bg-[#0c0c14] md:p-10">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
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
                <span className="text-[#3B82F6]">npm</span> install @settlr/sdk
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
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              How it works
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Integrate once, move money everywhere
            </h2>
          </Reveal>

          <div className="relative mt-16">
            {/* Connecting gradient line (desktop) */}
            <div className="absolute top-[26px] left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-[#3B82F6]/40 via-[#3B82F6]/30 to-[#34d399]/40 md:block" />

            <div className="grid gap-8 md:grid-cols-3 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Add the SDK",
                  text: "Install @settlr/sdk and drop in our React checkout component. Your fans can pay with just an email — no wallet needed.",
                  code: "npm install @settlr/sdk",
                  color: "#3B82F6",
                },
                {
                  step: "02",
                  title: "Fans pay creators",
                  text: "Fans pay with USDC for subscriptions, tips, or purchases. Embedded wallets handle everything — zero crypto UX.",
                  code: "<SettlrCheckout amount={9.99} />",
                  color: "#3B82F6",
                },
                {
                  step: "03",
                  title: "Creators get paid",
                  text: "Funds settle instantly. Pay out to creators by email — they claim to any wallet or cash out directly.",
                  code: "// Payout sent instantly ✓",
                  color: "#34d399",
                },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    {/* Step badge */}
                    <div
                      className="relative z-10 mb-8 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{
                        background: s.color,
                        boxShadow: `0 0 30px ${s.color}40`,
                      }}
                    >
                      {s.step}
                    </div>

                    {/* Card */}
                    <div className="group relative w-full overflow-hidden rounded-2xl bg-[#08080d] p-7 transition-all duration-300 hover:bg-[#0c0c14]">
                      {/* Left accent stripe */}
                      <div
                        className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full"
                        style={{ background: s.color }}
                      />
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
              <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
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
                Embed checkout, manage subscriptions, and trigger payouts — all
                from a single package.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 space-y-3">
                {[
                  "Drop-in React checkout component",
                  "Embedded wallets — fans pay with just an email",
                  "Subscription & membership management",
                  "Gasless — fans pay nothing extra, ever",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                    <span className="text-sm text-white/50">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <Link
                href="/docs"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] transition-colors hover:text-[#c4b5fd]"
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
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              Comparison
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Why platforms switch to Settlr
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl bg-[#08080d]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-6 py-4 font-medium text-white/40" />
                    <th className="px-6 py-4 font-medium text-white/40">
                      Traditional
                    </th>
                    <th className="relative px-6 py-4 font-semibold text-[#3B82F6]">
                      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />
                      Settlr
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["Fees", "2.9% + 30\u00A2", "1% flat"],
                    ["Settlement", "2\u20137 days", "Instant"],
                    ["Chargebacks", "Yes \u2014 costly", "None"],
                    ["Content restrictions", "Visa/MC policies", "None"],
                    ["Creator payouts", "ACH / wire fees", "By email, instant"],
                    ["Global reach", "Bank-dependent", "180+ countries"],
                    [
                      "Deplatforming risk",
                      "High for restricted categories",
                      "Zero",
                    ],
                    ["Fan UX", "Card + address form", "Email only"],
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

          <Reveal delay={0.15}>
            <div className="mt-6 text-center">
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] transition-colors hover:text-[#60a5fa]"
              >
                See full comparison vs Stripe, Coinbase Commerce, NOWPayments
                &amp; BitPay
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SAVINGS CALCULATOR
         ═══════════════════════════════════════ */}
      <section className="mx-auto max-w-3xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
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
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              Built for
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Platforms in every creator vertical
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Adult & dating platforms",
                text: "Content subscriptions, tips, and PPV — without Visa or Mastercard deciding what's allowed. Full privacy with encrypted receipts.",
                color: "#c084fc",
              },
              {
                icon: RefreshCw,
                title: "Fan memberships & tipping",
                text: "Recurring stablecoin subscriptions for creator memberships, fan clubs, and tiered access. Automatic renewals, trials, and dunning built in.",
                color: "#3B82F6",
              },
              {
                icon: Globe,
                title: "International creator payouts",
                text: "Pay freelancers and creators in 180+ countries by email. No bank details, no wire fees, no 5-day ACH wait.",
                color: "#34d399",
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-px transition-all duration-500"
                  style={{
                    background: `linear-gradient(to bottom, ${c.color}20, transparent 40%)`,
                  }}
                >
                  <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#08080d] p-8">
                    {/* Top accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, ${c.color}, transparent)`,
                      }}
                    />
                    <div
                      className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `${c.color}12` }}
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
        <div className="absolute left-0 top-1/2 -z-10 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#3B82F6]/[0.03] blur-[120px]" />

        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
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
            Your platform handles creators and fans. We handle the security.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "Non-custodial",
              text: "We never touch your funds. Payments flow directly via smart contracts — no middleman holds.",
              color: "#3B82F6",
            },
            {
              icon: Lock,
              title: "Encrypted receipts",
              text: "FHE-encrypted transaction data protects sensitive purchases. Only buyer and seller can see amounts.",
              color: "#3B82F6",
            },
            {
              icon: Globe,
              title: "Compliance built in",
              text: "Every wallet is screened against OFAC sanctions and scored for risk before any payment is processed.",
              color: "#34d399",
            },
            {
              icon: Zap,
              title: "Multisig treasury",
              text: "Platform fees held in a Squads multisig. No single point of failure, no unilateral access.",
              color: "#fbbf24",
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl bg-[#08080d] p-6 transition-all duration-300 hover:bg-[#0c0c14]">
                {/* Left accent stripe */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                  style={{ background: f.color }}
                />
                <div
                  className="mb-4 inline-flex rounded-xl p-2.5"
                  style={{ background: `${f.color}12` }}
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
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
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
                q: "Can I use this for adult content, gambling, or supplements?",
                a: "Yes. Settlr uses stablecoins — there are no card network content policies. As long as your platform is legal in your jurisdiction, you can use Settlr. No Visa, no Mastercard, no processor deciding what content is allowed.",
              },
              {
                q: "Do my fans need a crypto wallet?",
                a: "No. We integrate Privy for embedded wallets — fans sign up with just their email or social login. No crypto experience required. They can also connect existing wallets like Phantom.",
              },
              {
                q: "How do creator payouts work?",
                a: "Send payouts to any email address. The creator receives a link to claim their funds to any Solana wallet — or they can cash out directly. No bank details needed, no wire fees.",
              },
              {
                q: "What are the fees?",
                a: "1% flat per transaction. No setup fees, no monthly fees, no hidden charges. Compare that to Stripe's 2.9% + 30¢ — on $10,000/month you'd save over $190.",
              },
              {
                q: "How fast do creators receive funds?",
                a: "Instantly. Payments settle in under one second on Solana. No holds, no processing delays, no 2-7 day bank settlement windows.",
              },
              {
                q: "Is this custodial? Do you hold funds?",
                a: "No. Settlr is fully non-custodial. Payments flow directly via on-chain smart contracts. We never have access to platform or creator funds.",
              },
              {
                q: "Can I offer fan subscriptions and memberships?",
                a: "Yes. Built-in recurring billing with automatic renewal, trial periods, tiered access, and smart retry logic — all in stablecoins. No extra tooling needed.",
              },
              {
                q: "How do I integrate?",
                a: "Install our TypeScript SDK (npm install @settlr/sdk), drop in the React checkout component, and you're live. Most platforms integrate in under 30 minutes.",
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3B82F6]/[0.08] via-[#3B82F6]/[0.02] to-transparent" />
        <div className="absolute left-1/2 bottom-0 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-[#3B82F6]/[0.06] blur-[150px]" />
        <div className="absolute left-1/3 top-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-[#3B82F6]/[0.04] blur-[100px]" />

        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Your platform, your rules.
              <br />
              <span className="text-[#3B82F6]">
                No card network gatekeeping.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              1% flat. Instant settlement. Checkout + payouts in one SDK. Go
              live today.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-semibold text-[#050507] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start integrating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo/store"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                See a live demo
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
