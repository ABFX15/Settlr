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
  Mail,
  Users,
  DollarSign,
  Building2,
  Briefcase,
  Tag,
  Database,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* --- Fade-in wrapper --- */
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

/* --- Savings calculator --- */
function SavingsCalculator() {
  const [workers, setWorkers] = useState(500);
  const avgPayout = 50; // $50 avg payout per worker

  const volume = workers * avgPayout;
  const paypalFee = volume * 0.05; // ~5% PayPal international
  const wireFee = workers * 25; // $25 per wire
  const settlrFee = volume * 0.01;
  const savedVsPaypal = paypalFee - settlrFee;

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
          Workers paid per month
        </label>
        <div className="text-4xl font-semibold text-white tabular-nums">
          {workers.toLocaleString()}
        </div>
        <input
          type="range"
          min={50}
          max={10000}
          step={50}
          value={workers}
          onChange={(e) => setWorkers(+e.target.value)}
          className="mt-4 w-full accent-[#3B82F6]"
        />
        <div className="mt-1 flex justify-between text-xs text-white/30">
          <span>50</span>
          <span>10,000</span>
        </div>
        <p className="mt-2 text-xs text-white/30">
          Assuming {fmt(avgPayout)} avg payout &middot; {fmt(volume)}/mo total
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white/[0.04] p-5">
          <p className="text-xs font-medium text-white/40">PayPal (~5% intl)</p>
          <p className="mt-1 text-2xl font-semibold text-white/80">
            {fmt(paypalFee)}
          </p>
        </div>
        <div className="rounded-xl bg-white/[0.04] p-5">
          <p className="text-xs font-medium text-white/40">Wire ($25/each)</p>
          <p className="mt-1 text-2xl font-semibold text-white/80">
            {fmt(wireFee)}
          </p>
        </div>
        <div className="rounded-xl bg-[#3B82F6]/10 p-5 ring-1 ring-[#3B82F6]/20">
          <p className="text-xs font-medium text-[#3B82F6]">Settlr (1%)</p>
          <p className="mt-1 text-2xl font-semibold text-[#3B82F6]">
            {fmt(settlrFee)}
          </p>
          <p className="mt-0.5 text-xs text-white/30">
            Save {fmt(savedVsPaypal)} vs PayPal
          </p>
        </div>
      </div>
    </div>
  );
}

/* ====================
   PAGE
   ==================== */
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
      {/* ── Organization ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://settlr.dev/#organization",
            name: "Settlr",
            url: "https://settlr.dev",
            logo: "https://settlr.dev/og-image.png",
            description: "Stablecoin payment infrastructure for platforms.",
            foundingDate: "2025",
            founder: { "@type": "Person", name: "Adam Bryant" },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              url: "https://settlr.dev/support",
              email: "adam@settlr.dev",
            },
            sameAs: ["https://x.com/SettlrPay", "https://github.com/settlr"],
          }),
        }}
      />

      {/* ── Service + System Flow (core entity) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": "https://settlr.dev/#service",
            name: "Settlr Stablecoin Payment Infrastructure",
            serviceType: "Stablecoin payment infrastructure",
            provider: { "@id": "https://settlr.dev/#organization" },
            url: "https://settlr.dev",
            description:
              "Send and receive USDC payments globally with just an email address. Instant settlement, non-custodial, from 1% per transaction.",
            areaServed: "Worldwide",
            audience: {
              "@type": "BusinessAudience",
              name: "Platforms, marketplaces, and gig economy companies that pay people globally",
            },
            about: {
              "@type": "DefinedTerm",
              "@id": "https://settlr.dev/#defined-term",
              name: "Stablecoin Payment Infrastructure",
              description:
                "Infrastructure that enables platforms to send and receive stablecoin (USDC) payments globally via email, with instant settlement and no bank details required.",
              url: "https://settlr.dev",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Pricing Tiers",
              itemListElement: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "2% per transaction. Up to 500 payouts/month. No setup fees.",
                  url: "https://settlr.dev/pricing",
                },
                {
                  "@type": "Offer",
                  name: "Growth",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "1.5% per transaction. Unlimited payouts, batch payouts, recurring subscriptions.",
                  url: "https://settlr.dev/pricing",
                },
                {
                  "@type": "Offer",
                  name: "Enterprise",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "1% per transaction. Dedicated treasury, multi-sig support, custom integrations.",
                  url: "https://settlr.dev/pricing",
                },
              ],
            },
            hasPart: [
              {
                "@type": "HowTo",
                name: "Stablecoin Payment System Flow",
                description:
                  "How Settlr processes stablecoin payments — a repeatable five-step system from integration to offramp.",
                step: [
                  {
                    "@type": "HowToStep",
                    position: 1,
                    name: "Integration",
                    text: "Platform installs @settlr/sdk and connects via API. One SDK handles both payouts (sending USDC) and checkout (receiving USDC).",
                    url: "https://settlr.dev/docs",
                  },
                  {
                    "@type": "HowToStep",
                    position: 2,
                    name: "Payment Routing",
                    text: "Platform calls payout() with a recipient email and amount. Settlr routes the stablecoin payment on-chain via non-custodial smart contracts.",
                    url: "https://settlr.dev/docs?tab=api",
                  },
                  {
                    "@type": "HowToStep",
                    position: 3,
                    name: "Wallet Creation",
                    text: "An embedded wallet is created automatically for first-time recipients. No crypto knowledge, seed phrases, or app downloads required.",
                    url: "https://settlr.dev/#how-it-works",
                  },
                  {
                    "@type": "HowToStep",
                    position: 4,
                    name: "Settlement",
                    text: "USDC settles in under one second. Non-custodial, gasless for recipients, with FHE-encrypted receipts for privacy.",
                    url: "https://settlr.dev/#how-it-works",
                  },
                  {
                    "@type": "HowToStep",
                    position: 5,
                    name: "Offramp",
                    text: "Recipients hold USDC, offramp to local currency via integrated partners (MoonPay, Coinbase), or transfer to any wallet. Works in 180+ countries.",
                    url: "https://settlr.dev/#how-it-works",
                  },
                ],
                totalTime: "PT1M",
              },
            ],
          }),
        }}
      />

      {/* ── Breadcrumb ── */}
      <script
        type="application/ld+json"
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
              {
                "@type": "ListItem",
                position: 2,
                name: "Pricing",
                item: "https://settlr.dev/pricing",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Documentation",
                item: "https://settlr.dev/docs",
              },
              {
                "@type": "ListItem",
                position: 4,
                name: "Demo",
                item: "https://settlr.dev/demo",
              },
              {
                "@type": "ListItem",
                position: 5,
                name: "Get Started",
                item: "https://settlr.dev/onboarding",
              },
            ],
          }),
        }}
      />

      {/* ── FAQ ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do stablecoin email payments work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Enter a recipient's email and amount. Settlr creates an embedded wallet for them automatically. They receive a link to claim their USDC — no crypto knowledge needed.",
                },
              },
              {
                "@type": "Question",
                name: "What countries does Settlr support?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Settlr works in 180+ countries. Recipients only need an email address and internet connection — no bank account required.",
                },
              },
              {
                "@type": "Question",
                name: "Do recipients need a crypto wallet?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Settlr creates an embedded wallet automatically when someone receives their first stablecoin payment. Recipients can hold USDC, offramp to local currency, or transfer to any wallet.",
                },
              },
              {
                "@type": "Question",
                name: "What are Settlr's fees?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Transaction-based pricing from 1–2% depending on tier. No FX fees, no wire fees, no hidden charges. Compare that to PayPal's 5%+ for international transfers or $25+ per wire.",
                },
              },
              {
                "@type": "Question",
                name: "How fast do stablecoin payments settle?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Instantly. Stablecoin payments settle in under one second. No holds, no processing delays, no multi-day bank settlement windows.",
                },
              },
              {
                "@type": "Question",
                name: "Is Settlr custodial?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Settlr is fully non-custodial. Stablecoin payments flow directly via on-chain smart contracts. We never hold your funds.",
                },
              },
              {
                "@type": "Question",
                name: "Can I send bulk stablecoin payments?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Upload a CSV with emails and amounts, or use the API to programmatically send hundreds of payments in a single batch. All settled in seconds.",
                },
              },
              {
                "@type": "Question",
                name: "How do recipients cash out to local currency?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Recipients can offramp USDC to their local currency via integrated partners like MoonPay or Coinbase. They can also send to any crypto exchange that supports their country.",
                },
              },
            ],
          }),
        }}
      />

      {/* Global noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />

      {/* ============================
          HERO
         ============================ */}
      <section className="relative isolate overflow-x-clip overflow-y-visible pt-28 pb-20 md:pt-40 md:pb-28">
        {/* Background image */}
        <div className="absolute inset-0 -z-20">
          <img src="/8917.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[#050507]/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-[#3B82F6]/[0.08] blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050507] via-[#050507]/90 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left: Copy */}
            <div className="lg:col-span-6">
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/[0.1] px-4 py-1.5 text-[13px] text-[#3B82F6] font-medium backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                  Stablecoin payment infrastructure
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="max-w-xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.08] tracking-tight text-white">
                  Stablecoin payments{" "}
                  <span className="text-[#3B82F6]">for every platform</span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
                  Settlr is stablecoin payment infrastructure that lets
                  platforms{" "}
                  <span className="font-medium text-white/80">
                    send and receive USDC payments globally.
                  </span>{" "}
                  Pay anyone with just their email — 180+ countries, 1% flat,
                  settled in under a second.
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
            </div>

            {/* Right: Animated code snippet */}
            <Reveal delay={0.15} className="lg:col-span-6">
              <div className="relative mx-auto w-full max-w-lg">
                {/* Ambient glow */}
                <div className="absolute -inset-6 z-0 rounded-3xl bg-[#3B82F6]/[0.06] blur-3xl" />

                {/* Editor chrome */}
                <div className="relative z-[2] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c14] shadow-2xl shadow-black/40">
                  {/* Title bar */}
                  <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                    <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    <span className="ml-3 text-xs text-white/30 font-mono">
                      payout.ts
                    </span>
                  </div>

                  {/* Code content */}
                  <div className="px-5 py-5 font-mono text-[13px] leading-[1.7] sm:text-sm">
                    {/* Line 1 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <span className="text-[#c678dd]">const</span>{" "}
                      <span className="text-[#e5c07b]">payout</span>{" "}
                      <span className="text-white/50">=</span>{" "}
                      <span className="text-[#c678dd]">await</span>{" "}
                      <span className="text-[#61afef]">settlr</span>
                      <span className="text-white/40">.</span>
                      <span className="text-[#61afef]">payouts</span>
                      <span className="text-white/40">.</span>
                      <span className="text-[#61afef]">create</span>
                      <span className="text-[#e5c07b]">({"{"}</span>
                    </motion.div>

                    {/* Line 2 — amount */}
                    <motion.div
                      className="pl-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                    >
                      <span className="text-[#e06c75]">amount</span>
                      <span className="text-white/40">: </span>
                      <span className="text-[#d19a66]">50.00</span>
                      <span className="text-white/30">,</span>
                    </motion.div>

                    {/* Line 3 — currency */}
                    <motion.div
                      className="pl-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.2 }}
                    >
                      <span className="text-[#e06c75]">currency</span>
                      <span className="text-white/40">: </span>
                      <span className="text-[#98c379]">&quot;USDC&quot;</span>
                      <span className="text-white/30">,</span>
                    </motion.div>

                    {/* Line 4 — recipient */}
                    <motion.div
                      className="pl-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.6 }}
                    >
                      <span className="text-[#e06c75]">recipient</span>
                      <span className="text-white/40">: </span>
                      <span className="text-[#98c379]">
                        &quot;maria@remotasks.ph&quot;
                      </span>
                      <span className="text-white/30">,</span>
                    </motion.div>

                    {/* Line 5 — closing */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 2.0 }}
                    >
                      <span className="text-[#e5c07b]">{"}"})</span>
                      <span className="text-white/30">;</span>
                    </motion.div>

                    {/* Blank line */}
                    <div className="h-5" />

                    {/* Response comment */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 2.6 }}
                    >
                      <span className="text-white/20">
                        {"// "}→ settled in 900ms
                      </span>
                    </motion.div>

                    {/* Response object */}
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 3.0 }}
                    >
                      <span className="text-white/20">{"// "}</span>
                      <span className="text-[#e5c07b]">{"{"}</span>
                      <span className="text-[#e06c75]"> id</span>
                      <span className="text-white/40">: </span>
                      <span className="text-[#98c379]">
                        &quot;pay_8xK2m&quot;
                      </span>
                      <span className="text-white/30">, </span>
                      <span className="text-[#e06c75]">status</span>
                      <span className="text-white/40">: </span>
                      <span className="text-[#98c379]">
                        &quot;settled&quot;
                      </span>
                      <span className="text-[#e5c07b]"> {"}"}</span>
                    </motion.div>
                  </div>

                  {/* Blinking cursor */}
                  <motion.div
                    className="absolute bottom-5 font-mono text-[13px] sm:text-sm"
                    style={{ left: "calc(1.25rem + 27ch)" }}
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      times: [0, 0.5, 0.5, 1],
                    }}
                  >
                    <span className="text-[#3B82F6]">▎</span>
                  </motion.div>
                </div>

                {/* Settled badge */}
                <motion.div
                  className="absolute -bottom-4 right-6 z-10 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-[#050507] px-3.5 py-2 shadow-lg"
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 3.2, duration: 0.5 }}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-400">
                    $50 → maria@remotasks.ph
                  </span>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================
          HOW IT WORKS — 3-step flow
         ============================ */}
      <section className="relative border-b border-white/[0.04] bg-[#050507]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-[#3B82F6] mb-4">
              How it works
            </p>
            <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl mb-16">
              Three steps. That&apos;s it.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-0 items-start">
            {/* Step 1 */}
            <Reveal delay={0.05}>
              <div className="flex flex-col items-center text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-5">
                  <Code2 className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  You call the API
                </h3>
                <p className="text-sm leading-relaxed text-white/40 max-w-[240px]">
                  One POST request with the amount and recipient email.
                  That&apos;s your entire integration.
                </p>
              </div>
            </Reveal>

            {/* Arrow 1 */}
            <div className="hidden md:flex items-start justify-center pt-6">
              <Reveal delay={0.12}>
                <div className="flex items-center gap-1 text-white/15">
                  <div className="h-px w-12 bg-gradient-to-r from-[#3B82F6]/30 to-white/10" />
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Reveal>
            </div>

            {/* Step 2 */}
            <Reveal delay={0.1}>
              <div className="flex flex-col items-center text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mb-5">
                  <Mail className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Recipient gets an email
                </h3>
                <p className="text-sm leading-relaxed text-white/40 max-w-[240px]">
                  No wallet needed. No app download. They get a link to claim
                  their payout — any country.
                </p>
              </div>
            </Reveal>

            {/* Arrow 2 */}
            <div className="hidden md:flex items-start justify-center pt-6">
              <Reveal delay={0.17}>
                <div className="flex items-center gap-1 text-white/15">
                  <div className="h-px w-12 bg-gradient-to-r from-white/10 to-emerald-500/30" />
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Reveal>
            </div>

            {/* Step 3 */}
            <Reveal delay={0.15}>
              <div className="flex flex-col items-center text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  They claim instantly
                </h3>
                <p className="text-sm leading-relaxed text-white/40 max-w-[240px]">
                  One click, funds arrive. Stablecoin payment settled in under a
                  second, from 1% per transaction.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================
          PROBLEM - WHY IT'S BROKEN
         ============================ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <Reveal>
                <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
                  The problem
                </p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  Paying people globally is still broken
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-white/50 leading-relaxed">
                  Your platform has workers, creators, or contractors in 50+
                  countries. But Stripe Connect doesn&apos;t support half of
                  them. PayPal takes 5% and fails silently. Wire transfers cost
                  $25 each and take a week. And every failed payout is a support
                  ticket.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Globe,
                  problem: "100+ countries unsupported",
                  detail:
                    "Stripe Connect payouts only work in 47 countries. Your workers aren't in those 47.",
                  color: "#ef4444",
                },
                {
                  icon: DollarSign,
                  problem: "5-8% lost to fees",
                  detail:
                    "PayPal cross-border + FX + withdrawal fees eat into already low wages.",
                  color: "#ef4444",
                },
                {
                  icon: Clock,
                  problem: "5-7 day settlement",
                  detail:
                    "Bank wires take a week. Workers in emerging markets wait even longer.",
                  color: "#ef4444",
                },
                {
                  icon: Mail,
                  problem: "Support ticket hell",
                  detail:
                    "Failed payouts, wrong bank details, frozen accounts — your ops team drowns.",
                  color: "#ef4444",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.problem} delay={i * 0.08}>
                    <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-5">
                      <Icon className="mb-3 h-5 w-5 text-red-400" />
                      <h3 className="text-sm font-semibold text-white">
                        {item.problem}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                        {item.detail}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================
          HOW IT WORKS
         ============================ */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
            How it works
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Three lines of code. That&apos;s it.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: Code2,
              title: "Integrate the SDK",
              text: "Install @settlr/sdk. Call payout() with an email and amount. We handle wallets, gas, and delivery.",
            },
            {
              step: "02",
              icon: Mail,
              title: "Recipients get an email",
              text: "They click a link to claim their USDC. An embedded wallet is created automatically - no crypto knowledge needed.",
            },
            {
              step: "03",
              icon: DollarSign,
              title: "They cash out locally",
              text: "Recipients hold USDC, offramp to local currency via integrated partners, or transfer to any wallet.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.step} delay={i * 0.08}>
                <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
                  <span className="absolute right-6 top-6 text-4xl font-bold text-white/[0.04]">
                    {item.step}
                  </span>
                  <div className="mb-4 inline-flex rounded-xl bg-[#3B82F6]/10 p-3">
                    <Icon className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Code snippet */}
        <Reveal delay={0.2}>
          <div className="mt-12 rounded-2xl border border-white/[0.06] bg-[#08080d] p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-white/30">payout.ts</span>
            </div>
            <pre className="overflow-x-auto text-sm leading-relaxed">
              <code>
                <span className="text-[#3B82F6]">import</span>{" "}
                <span className="text-white">{"{ Settlr }"}</span>{" "}
                <span className="text-[#3B82F6]">from</span>{" "}
                <span className="text-emerald-400">
                  &quot;@settlr/sdk&quot;
                </span>
                {"\n\n"}
                <span className="text-white/30">
                  {"// Pay anyone by email"}
                </span>
                {"\n"}
                <span className="text-[#3B82F6]">await</span>{" "}
                <span className="text-white">settlr.</span>
                <span className="text-[#fbbf24]">payout</span>
                <span className="text-white">{"({"}</span>
                {"\n"}
                <span className="text-white">{"  to:    "}</span>
                <span className="text-emerald-400">
                  &quot;maria@remotasks.ph&quot;
                </span>
                <span className="text-white">,</span>
                {"\n"}
                <span className="text-white">{"  amount: "}</span>
                <span className="text-[#fbbf24]">50.00</span>
                <span className="text-white">,</span>
                {"\n"}
                <span className="text-white">{"  token:  "}</span>
                <span className="text-emerald-400">&quot;USDC&quot;</span>
                {"\n"}
                <span className="text-white">{"});"}</span>
                {"\n\n"}
                <span className="text-white/30">
                  {"// That's it. Settled in <1s."}
                </span>
              </code>
            </pre>
          </div>
        </Reveal>
      </section>

      {/* ============================
          VALUE PROPS - QUICK HITS
         ============================ */}
      <section className="border-y border-white/[0.04] bg-gradient-to-b from-white/[0.015] to-transparent">
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "Non-custodial",
              text: "Funds flow on-chain. We never hold your money.",
            },
            {
              icon: Zap,
              title: "Instant settlement",
              text: "< 1 second. No holds, no delays.",
            },
            {
              icon: Globe,
              title: "180+ countries",
              text: "Email is the only requirement.",
            },
            {
              icon: Lock,
              title: "Privacy (FHE)",
              text: "Encrypted receipts. Amounts hidden on-chain.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <div
                  className={`flex flex-col items-center gap-3 px-6 py-10 text-center ${
                    i < 3 ? "border-r border-white/[0.04]" : ""
                  }`}
                >
                  <Icon className="h-5 w-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/40">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============================
          TWO PRODUCTS
         ============================ */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
            Two products, one SDK
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Payouts out. Payments in.
          </h2>
          <p className="mt-4 max-w-xl text-white/45 leading-relaxed">
            Most platforms need to both{" "}
            <strong className="text-white/70">collect money</strong> from users
            and <strong className="text-white/70">pay people</strong> globally.
            Settlr handles both sides with stablecoin payment rails — instant,
            global, from 1% per transaction.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Payout API — Primary */}
          <Reveal delay={0.08}>
            <div className="group relative flex h-full flex-col rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.03] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex rounded-xl bg-[#3B82F6]/10 p-3">
                  <ArrowRight className="h-5 w-5 text-[#3B82F6] rotate-[135deg]" />
                </div>
                <span className="rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-3 py-1 text-xs font-semibold text-[#3B82F6]">
                  Core product
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white">Payout API</h3>
              <p className="mt-2 text-sm text-white/45 leading-relaxed">
                Send money to anyone by email. One API call, instant settlement,
                180+ countries. No bank details needed.
              </p>

              <div className="mt-6 rounded-xl bg-[#08080d] border border-white/[0.06] p-5 font-mono text-[13px] leading-relaxed">
                <span className="text-[#3B82F6]">await</span>{" "}
                <span className="text-white">settlr.</span>
                <span className="text-[#fbbf24]">payouts</span>
                <span className="text-white">.</span>
                <span className="text-[#fbbf24]">create</span>
                <span className="text-white">{"({"}</span>
                {"\n"}
                <span className="text-white">{"  amount:    "}</span>
                <span className="text-[#fbbf24]">50.00</span>
                <span className="text-white">,</span>
                {"\n"}
                <span className="text-white">{"  currency:  "}</span>
                <span className="text-emerald-400">&quot;USDC&quot;</span>
                <span className="text-white">,</span>
                {"\n"}
                <span className="text-white">{"  recipient: "}</span>
                <span className="text-emerald-400">
                  &quot;maria@remotasks.ph&quot;
                </span>
                {"\n"}
                <span className="text-white">{"});"}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Data labeling",
                  "Freelance",
                  "Creator payouts",
                  "Contractor pay",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-white/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Checkout SDK — Secondary */}
          <Reveal delay={0.14}>
            <div className="group relative flex h-full flex-col rounded-2xl border border-[#34d399]/20 bg-[#34d399]/[0.03] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex rounded-xl bg-[#34d399]/10 p-3">
                  <CreditCard className="h-5 w-5 text-[#34d399]" />
                </div>
                <span className="rounded-full bg-[#34d399]/10 border border-[#34d399]/20 px-3 py-1 text-xs font-semibold text-[#34d399]">
                  Add-on
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white">Checkout SDK</h3>
              <p className="mt-2 text-sm text-white/45 leading-relaxed">
                Embeddable checkout for platforms that also collect payments
                from end users. Fans pay creators, players deposit — same
                infrastructure.
              </p>

              <div className="mt-6 rounded-xl bg-[#08080d] border border-white/[0.06] p-5 font-mono text-[13px] leading-relaxed">
                <span className="text-[#3B82F6]">{"<"}</span>
                <span className="text-[#fbbf24]">SettlrCheckout</span>
                {"\n"}
                <span className="text-white">{"  amount"}</span>
                <span className="text-white/40">{"={"}</span>
                <span className="text-[#fbbf24]">9.99</span>
                <span className="text-white/40">{"}"}</span>
                {"\n"}
                <span className="text-white">{"  currency"}</span>
                <span className="text-white/40">{"="}</span>
                <span className="text-emerald-400">&quot;USDC&quot;</span>
                {"\n"}
                <span className="text-white">{"  onSuccess"}</span>
                <span className="text-white/40">{"={"}</span>
                <span className="text-white">handlePayment</span>
                <span className="text-white/40">{"}"}</span>
                {"\n"}
                <span className="text-[#3B82F6]">{"/>"}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Creator platforms",
                  "iGaming deposits",
                  "Fan payments",
                  "Subscriptions",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-white/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================
          3 VERTICALS
         ============================ */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
            Who we serve
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Built for platforms that pay people globally
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Database,
              label: "Priority",
              badge: "#1",
              title: "AI Data Labeling",
              subtitle: "Remotasks, Toloka, Appen, Clickworker, Scale AI",
              pain: "Millions of annotators in Philippines, Kenya, India, Venezuela. PayPal takes 5-8%, doesn't work in some regions, and workers wait weeks. Public criticism of payment practices is growing.",
              pitch:
                "Pay your entire annotation workforce by email. 1% flat, instant, works in every country they're in.",
              color: "#3B82F6",
            },
            {
              icon: Sparkles,
              label: "Growth",
              badge: "#2",
              title: "Creator Platforms",
              subtitle: "Fourthwall, Ko-fi, Gumroad, Payhip, itch.io",
              pain: "Stripe Connect doesn't support half the countries creators are in. PayPal has been pulled from others. Creators lose 3-10% to fees and FX on every payout.",
              pitch:
                "Collect from fans via Checkout SDK. Pay creators in 180+ countries via Payout API. Both sides, one integration.",
              color: "#34d399",
            },
            {
              icon: Briefcase,
              label: "Expansion",
              badge: "#3",
              title: "Freelance Marketplaces",
              subtitle: "Contra, Braintrust, Hobo.Video, niche marketplaces",
              pain: "International talent gets paid via wire ($25/transfer) or PayPal (5%+ fees). Slow settlement, high ops burden, failed transfers.",
              pitch:
                "Contractor payouts that work everywhere. No bank details, no wire fees, settled in under a second.",
              color: "#fbbf24",
            },
          ].map((vertical, i) => {
            const Icon = vertical.icon;
            return (
              <Reveal key={vertical.title} delay={i * 0.1}>
                <div className="group relative flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]">
                  {/* Badge */}
                  <div className="mb-6 flex items-center justify-between">
                    <div
                      className="inline-flex rounded-xl p-3"
                      style={{ background: `${vertical.color}15` }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: vertical.color }}
                      />
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: `${vertical.color}15`,
                        color: vertical.color,
                      }}
                    >
                      {vertical.badge} {vertical.label}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white">
                    {vertical.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/30">
                    {vertical.subtitle}
                  </p>

                  <div className="mt-6 rounded-xl bg-red-500/[0.04] border border-red-500/10 p-4">
                    <p className="text-xs font-medium text-red-400 mb-1">
                      The pain
                    </p>
                    <p className="text-xs leading-relaxed text-white/40">
                      {vertical.pain}
                    </p>
                  </div>

                  <div className="mt-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 p-4 flex-1">
                    <p className="text-xs font-medium text-emerald-400 mb-1">
                      Your pitch
                    </p>
                    <p className="text-xs leading-relaxed text-white/50">
                      {vertical.pitch}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============================
          STATS
         ============================ */}
      <section className="relative isolate mx-auto max-w-5xl px-6 py-28">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]/[0.04] blur-[150px]" />

        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            The numbers
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              value: "1%",
              label: "Flat fee",
              sub: "No FX markup, no wire fees",
            },
            {
              value: "< 1s",
              label: "Settlement",
              sub: "Not days. Not hours. Seconds.",
            },
            {
              value: "180+",
              label: "Countries",
              sub: "Email is the only requirement",
            },
            {
              value: "$0",
              label: "Recipient cost",
              sub: "Zero gas fees, zero setup",
            },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="bg-[#050507] px-8 py-10 text-center">
                <p className="text-4xl font-bold text-white md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-white/60">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-white/30">{stat.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================
          SAVINGS CALCULATOR
         ============================ */}
      <section className="border-y border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              Calculate your savings
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              See what you&apos;d save on payouts
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12">
              <SavingsCalculator />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================
          COMPARISON TABLE
         ============================ */}
      <section className="mx-auto max-w-4xl px-6 py-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Settlr vs. traditional payouts
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="grid grid-cols-4 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="p-4 text-xs font-medium text-white/40" />
              <div className="p-4 text-center text-xs font-semibold text-white/40">
                PayPal
              </div>
              <div className="p-4 text-center text-xs font-semibold text-white/40">
                Wire Transfer
              </div>
              <div className="p-4 text-center text-xs font-semibold text-[#3B82F6]">
                Settlr
              </div>
            </div>
            {[
              { label: "Fee", values: ["~5%+", "$25+", "1% flat"] },
              {
                label: "Speed",
                values: ["2-5 days", "5-7 days", "< 1 second"],
              },
              {
                label: "Countries",
                values: ["~100", "~195 (if banked)", "180+"],
              },
              {
                label: "Bank required?",
                values: ["No (PayPal acct)", "Yes", "No (email only)"],
              },
              { label: "Crypto knowledge?", values: ["No", "No", "No"] },
              {
                label: "Bulk payouts",
                values: ["Manual", "Manual", "CSV or API"],
              },
              { label: "Custodial?", values: ["Yes", "Yes", "No"] },
              { label: "Privacy", values: ["None", "None", "FHE encrypted"] },
            ].map((row, ri) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 border-b border-white/[0.03] ${
                  ri % 2 === 0 ? "" : "bg-white/[0.01]"
                }`}
              >
                <div className="p-4 text-sm text-white/60">{row.label}</div>
                <div className="p-4 text-center text-sm text-white/50">
                  {row.values[0]}
                </div>
                <div className="p-4 text-center text-sm text-white/50">
                  {row.values[1]}
                </div>
                <div className="p-4 text-center text-sm font-medium text-[#3B82F6] bg-[#3B82F6]/[0.03]">
                  {row.values[2]}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTA after comparison */}
        <Reveal delay={0.2}>
          <div className="mt-10 text-center">
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#3B82F6]/90"
            >
              Start Saving Today
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ============================
          TRUST & SECURITY
         ============================ */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              Security & compliance
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Enterprise-grade infrastructure
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Non-custodial",
                text: "Funds flow via on-chain smart contracts. We never hold or touch your money.",
                color: "#3B82F6",
              },
              {
                icon: Lock,
                title: "FHE-encrypted receipts",
                text: "Transaction amounts hidden on-chain using Fully Homomorphic Encryption. Only sender and recipient can see.",
                color: "#3B82F6",
              },
              {
                icon: Globe,
                title: "Compliance built in",
                text: "Every wallet screened against OFAC sanctions. Risk scoring on all recipients before payouts process.",
                color: "#34d399",
              },
              {
                icon: CreditCard,
                title: "Multisig treasury",
                text: "Platform fees held in a Squads multisig. No single point of failure, no unilateral access.",
                color: "#fbbf24",
              },
              {
                icon: RefreshCw,
                title: "Gasless transactions",
                text: "Recipients never pay gas. We cover all network fees so stablecoin payments are free to receive.",
                color: "#3B82F6",
              },
              {
                icon: Database,
                title: "On-chain audit trail",
                text: "Every stablecoin payment is recorded on-chain. Immutable, auditable, verifiable by anyone.",
                color: "#34d399",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="group relative overflow-hidden rounded-2xl bg-[#08080d] p-6 transition-all duration-300 hover:bg-[#0c0c14]">
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
        </div>
      </section>

      {/* ============================
          Pricing
         ============================ */}
      <section className="border-b border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              Pricing
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Simple, transparent pricing
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-xl text-white/45">
              No monthly fees. No hidden costs. Pay only when you move money.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                fee: "2%",
                description: "For early-stage platforms",
                features: [
                  "Up to 500 payouts/month",
                  "Email-based claiming",
                  "Webhook notifications",
                  "Devnet sandbox",
                  "Community support",
                ],
                cta: "Get Started",
                href: "/onboarding",
                highlighted: false,
              },
              {
                name: "Growth",
                fee: "1.5%",
                description: "For scaling platforms",
                features: [
                  "Unlimited payouts",
                  "Batch payouts (CSV & API)",
                  "Recurring subscriptions",
                  "Priority support",
                  "Custom branding",
                  "Advanced analytics",
                ],
                cta: "Get Started",
                href: "/onboarding",
                highlighted: true,
              },
              {
                name: "Enterprise",
                fee: "1%",
                description: "Custom terms & volume pricing",
                features: [
                  "Everything in Growth",
                  "Dedicated treasury",
                  "Multi-sig support",
                  "SOC 2 report",
                  "Custom integrations",
                  "Dedicated account manager",
                ],
                cta: "Contact Us",
                href: "mailto:team@settlr.dev",
                highlighted: false,
              },
            ].map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-8 ${
                    tier.highlighted
                      ? "border-[#3B82F6]/50 bg-[#3B82F6]/[0.04]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  {tier.highlighted && (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#3B82F6] px-3 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/40">
                    {tier.description}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {tier.fee}
                    </span>
                    <span className="text-sm text-white/40">
                      per transaction
                    </span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-white/50"
                      >
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.href}
                    className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                      tier.highlighted
                        ? "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90"
                        : "bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================
          FAQ
         ============================ */}
      <section className="border-b border-white/[0.04]">
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
                q: "How do email payouts work?",
                a: "Enter a recipient's email and amount via the API or dashboard. We create an embedded wallet for them via Privy. They receive a link to claim their USDC - no crypto knowledge needed. First-time recipients set up in under 30 seconds.",
              },
              {
                q: "What countries are supported?",
                a: "180+ countries. Recipients only need an email address and internet connection. No bank account, no ID verification on their end, no geographic restrictions. If they have email, you can pay them.",
              },
              {
                q: "Do recipients need crypto knowledge?",
                a: "No. The experience is: get an email, click a link, see your balance. They can hold USDC, offramp to local currency via integrated partners (MoonPay, Coinbase), or transfer to any wallet. No seed phrases, no gas, no blockchain terminology.",
              },
              {
                q: "What are the fees?",
                a: "From 1-2% per transaction depending on your tier. No FX fees, no wire fees, no receiving fees, no hidden charges. On $25,000/month in payouts you'd save over $1,000 vs PayPal international transfers.",
              },
              {
                q: "How fast are payouts?",
                a: "Instant. Stablecoin payments settle in under one second. No holds, no processing delays, no multi-day bank settlement windows. Recipients can access funds immediately.",
              },
              {
                q: "Can I send bulk payouts?",
                a: "Yes. Upload a CSV with emails and amounts, or use the API to programmatically send hundreds of payouts in a single batch. All settled in seconds.",
              },
              {
                q: "How do recipients cash out to local currency?",
                a: "Recipients can offramp USDC to their local currency via integrated partners like MoonPay or Coinbase. They can also send to any crypto exchange that supports their country.",
              },
              {
                q: "Is this custodial? Do you hold funds?",
                a: "No. Settlr is fully non-custodial. Stablecoin payments flow directly via on-chain smart contracts. We never have access to your funds or your recipients' funds.",
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

      {/* ============================
          FINAL CTA
         ============================ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3B82F6]/[0.08] via-[#3B82F6]/[0.02] to-transparent" />
        <div className="absolute left-1/2 bottom-0 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-[#3B82F6]/[0.06] blur-[150px]" />

        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Stop losing money on
              <br />
              <span className="text-[#3B82F6]">broken global payments</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              Stablecoin payments from 1%. Instant settlement. 180+ countries.
              Email-only. Go live today.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
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

      <Footer />
    </main>
  );
}
