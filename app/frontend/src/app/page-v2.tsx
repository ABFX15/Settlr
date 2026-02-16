"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Copy,
  ChevronRight,
  ArrowUpRight,
  Play,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── Simple fade wrapper ─── */
function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="flex-1 text-[15px] leading-relaxed text-stone-600">
        "{quote}"
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-stone-100 to-stone-200" />
        <div>
          <p className="text-sm font-medium text-stone-900">{author}</p>
          <p className="text-xs text-stone-500">
            {role}, {company}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-stone-300 hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        {description}
      </p>
    </div>
  );
}

/* ─── Savings Calculator ─── */
function SavingsCalculator() {
  const [volume, setVolume] = useState(50000);

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
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="border-b border-stone-100 bg-stone-50 px-6 py-4">
        <h3 className="font-semibold text-stone-900">Fee Calculator</h3>
        <p className="text-sm text-stone-500">See how much you could save</p>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-stone-600">
              Monthly volume
            </label>
            <span className="text-2xl font-semibold text-stone-900 tabular-nums">
              {fmt(volume)}
            </span>
          </div>
          <input
            type="range"
            min={5000}
            max={500000}
            step={5000}
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
            className="mt-4 w-full accent-stone-900"
          />
          <div className="mt-1 flex justify-between text-xs text-stone-400">
            <span>$5K</span>
            <span>$500K</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
            <span className="text-sm text-stone-600">Stripe (2.9% + 30¢)</span>
            <span className="font-medium text-stone-400 line-through">
              {fmt(stripeFee)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
            <span className="text-sm text-stone-600">Settlr (1% flat)</span>
            <span className="font-semibold text-stone-900">
              {fmt(settlrFee)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
            <span className="text-sm font-medium text-emerald-700">
              Your annual savings
            </span>
            <span className="text-lg font-bold text-emerald-600">
              {fmt(saved * 12)}
            </span>
          </div>
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
    <main className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO WITH GLASS WAVE
         ═══════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Glass wave background */}
        <div className="absolute inset-0">
          {/* Base dark */}
          <div className="absolute inset-0 bg-[#0a0a0f]" />

          {/* Silk wave effect using layered gradients */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 60% at 50% 100%, rgba(30, 20, 50, 0.9) 0%, transparent 50%),
                radial-gradient(ellipse 80% 40% at 60% 80%, rgba(60, 40, 90, 0.6) 0%, transparent 40%),
                radial-gradient(ellipse 60% 30% at 40% 85%, rgba(90, 50, 70, 0.4) 0%, transparent 35%)
              `,
            }}
          />

          {/* Main flowing silk ribbon */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full h-[70%]"
            viewBox="0 0 1440 600"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glass gradient with shine */}
              <linearGradient
                id="silk-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1a1025" />
                <stop offset="20%" stopColor="#2d1f3d" />
                <stop offset="40%" stopColor="#3d2a4a" />
                <stop offset="60%" stopColor="#4a3055" />
                <stop offset="80%" stopColor="#352040" />
                <stop offset="100%" stopColor="#1a1025" />
              </linearGradient>

              {/* Highlight gradient for glass effect */}
              <linearGradient
                id="silk-highlight"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>

              {/* Accent colors */}
              <linearGradient
                id="accent-blue"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(100,140,200,0)" />
                <stop offset="50%" stopColor="rgba(100,140,200,0.3)" />
                <stop offset="100%" stopColor="rgba(100,140,200,0)" />
              </linearGradient>

              <linearGradient
                id="accent-copper"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(180,120,80,0)" />
                <stop offset="50%" stopColor="rgba(180,120,80,0.2)" />
                <stop offset="100%" stopColor="rgba(180,120,80,0)" />
              </linearGradient>

              {/* Blur filter for soft edges */}
              <filter
                id="soft-blur"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </filter>
            </defs>

            {/* Background wave layer */}
            <path
              d="M-100,400 C100,350 300,420 500,380 C700,340 900,300 1100,350 C1300,400 1400,380 1540,400 L1540,700 L-100,700 Z"
              fill="url(#silk-gradient)"
              opacity="0.6"
            />

            {/* Main silk ribbon - darker base */}
            <path
              d="M-100,320 C150,280 350,350 550,300 C750,250 950,220 1150,280 C1350,340 1450,300 1540,320 L1540,700 L-100,700 Z"
              fill="#1a1528"
            />

            {/* Silk ribbon with gradient */}
            <path
              d="M-100,330 C150,290 350,360 550,310 C750,260 950,230 1150,290 C1350,350 1450,310 1540,330 L1540,700 L-100,700 Z"
              fill="url(#silk-gradient)"
            />

            {/* Glass highlight on top edge */}
            <path
              d="M-100,330 C150,290 350,360 550,310 C750,260 950,230 1150,290 C1350,350 1450,310 1540,330 L1540,380 C1450,360 1350,400 1150,340 C950,280 750,310 550,360 C350,410 150,340 -100,380 Z"
              fill="url(#silk-highlight)"
            />

            {/* Blue accent streak */}
            <path
              d="M200,340 C400,300 600,350 800,310 C1000,270 1200,290 1300,320"
              stroke="url(#accent-blue)"
              strokeWidth="40"
              fill="none"
              filter="url(#soft-blur)"
              opacity="0.7"
            />

            {/* Copper/orange accent */}
            <path
              d="M0,380 C200,340 400,400 600,350 C800,300 1000,320 1100,360"
              stroke="url(#accent-copper)"
              strokeWidth="30"
              fill="none"
              filter="url(#soft-blur)"
              opacity="0.5"
            />

            {/* Top highlight line */}
            <path
              d="M-100,328 C150,288 350,358 550,308 C750,258 950,228 1150,288 C1350,348 1450,308 1540,328"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {/* Subtle top vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-32">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn delay={50}>
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
                The payment layer
                <br />
                <span className="bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  for AI-native businesses
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={100}>
              <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/60">
                Accept USDC payments globally. 1% flat fees. Instant settlement.
                No chargebacks. Built for teams that Stripe won't serve.
              </p>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-stone-900 transition-all hover:bg-white/90 hover:scale-105"
                >
                  Start accepting payments
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo/store"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <Play className="h-4 w-4" />
                  View demo
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <button
                onClick={copyInstall}
                className="group mx-auto mt-10 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-mono text-sm text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
              >
                <span>npm install @settlr/sdk</span>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                )}
              </button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRODUCT SCREENSHOT - Floating over dark bg
         ═══════════════════════════════════════ */}
      <section className="relative -mt-20 pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f15] shadow-2xl shadow-black/50">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/5 bg-[#0a0a0f] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="mx-auto flex h-7 w-80 items-center justify-center rounded-md bg-white/5 text-xs text-white/40 ring-1 ring-white/10">
                  settlr.dev/dashboard
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="aspect-[16/9] bg-gradient-to-br from-[#12121a] to-[#0a0a0f] p-6">
                {/* Mock dashboard UI */}
                <div className="grid h-full grid-cols-4 gap-4">
                  {/* Sidebar */}
                  <div className="col-span-1 rounded-lg bg-white/5 p-4">
                    <div className="mb-6 h-8 w-20 rounded bg-white/10" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-8 rounded ${
                            i === 1 ? "bg-white/15" : "bg-white/5"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Main content */}
                  <div className="col-span-3 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4">
                      {["$12,450", "156", "99.2%"].map((stat, i) => (
                        <div key={i} className="rounded-lg bg-white/5 p-4">
                          <div className="h-3 w-16 rounded bg-white/10 mb-2" />
                          <div className="text-xl font-bold text-white/80">
                            {stat}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Chart area */}
                    <div className="flex-1 rounded-lg bg-white/5 p-4 h-48">
                      <div className="h-3 w-24 rounded bg-white/10 mb-4" />
                      <div className="flex items-end justify-between h-32 gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map(
                          (h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t bg-gradient-to-t from-purple-500/50 to-cyan-500/50"
                              style={{ height: `${h}%` }}
                            />
                          ),
                        )}
                      </div>
                    </div>
                    {/* Table */}
                    <div className="rounded-lg bg-white/5 p-4">
                      <div className="h-3 w-32 rounded bg-white/10 mb-4" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex gap-4 py-2 border-b border-white/5"
                          >
                            <div className="h-4 w-24 rounded bg-white/10" />
                            <div className="h-4 w-16 rounded bg-white/10" />
                            <div className="h-4 w-20 rounded bg-emerald-500/30" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Rest of page with light background */}
      <div className="bg-[#FAFAF9]">
        {/* ═══════════════════════════════════════
          LOGOS / SOCIAL PROOF
         ═══════════════════════════════════════ */}
        <section className="border-y border-stone-200 bg-white py-12">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-8 text-center text-sm font-medium text-stone-400">
              TRUSTED BY AI-NATIVE TEAMS
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {[
                "Company A",
                "Company B",
                "Company C",
                "Company D",
                "Company E",
              ].map((name, i) => (
                <div
                  key={i}
                  className="text-lg font-semibold text-stone-300 transition-colors hover:text-stone-400"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
          VALUE PROP SECTION
         ═══════════════════════════════════════ */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">
                Why teams switch to Settlr
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-600">
                Stripe denies 40% of AI companies. We built the payment stack
                they deserve.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                title="Instant settlement"
                description="Funds hit your wallet the moment a payment clears. No 2-day holds, no rolling reserves."
              />
              <FeatureCard
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
                title="Zero chargebacks"
                description="Stablecoin payments are final. No disputes, no fraud reversals, no surprise debits."
              />
              <FeatureCard
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                }
                title="Global by default"
                description="Accept payments from 180+ countries. No merchant account needed. No geographic restrictions."
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
          SPLIT: CALCULATOR + CODE
         ═══════════════════════════════════════ */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              {/* Calculator */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-stone-900">
                  Keep more of what you earn
                </h2>
                <p className="mb-8 text-stone-600">
                  Our 1% flat fee beats Stripe's 2.9% + 30¢ on every
                  transaction. The more you process, the more you save.
                </p>
                <SavingsCalculator />
              </div>

              {/* Code example */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-stone-900">
                  Ship in minutes, not weeks
                </h2>
                <p className="mb-8 text-stone-600">
                  Drop in our React component and start accepting payments. Full
                  TypeScript support, built for modern stacks.
                </p>
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-900">
                  <div className="flex items-center gap-2 border-b border-stone-700 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-stone-600" />
                      <div className="h-3 w-3 rounded-full bg-stone-600" />
                      <div className="h-3 w-3 rounded-full bg-stone-600" />
                    </div>
                    <span className="ml-2 text-xs text-stone-500">
                      checkout.tsx
                    </span>
                  </div>
                  <pre className="overflow-x-auto p-6 text-sm leading-relaxed">
                    <code className="text-stone-300">
                      <span className="text-purple-400">import</span>{" "}
                      <span className="text-stone-300">{"{"}</span>{" "}
                      <span className="text-emerald-400">BuyButton</span>{" "}
                      <span className="text-stone-300">{"}"}</span>{" "}
                      <span className="text-purple-400">from</span>{" "}
                      <span className="text-amber-300">'@settlr/sdk'</span>
                      {"\n\n"}
                      <span className="text-purple-400">
                        export default
                      </span>{" "}
                      <span className="text-blue-400">function</span>{" "}
                      <span className="text-amber-300">Checkout</span>
                      <span className="text-stone-300">() {"{"}</span>
                      {"\n"}
                      {"  "}
                      <span className="text-purple-400">return</span>{" "}
                      <span className="text-stone-300">(</span>
                      {"\n"}
                      {"    "}
                      <span className="text-blue-400">{"<"}</span>
                      <span className="text-emerald-400">BuyButton</span>
                      {"\n"}
                      {"      "}
                      <span className="text-stone-500">amount</span>
                      <span className="text-stone-300">=</span>
                      <span className="text-stone-300">{"{"}</span>
                      <span className="text-amber-300">29.99</span>
                      <span className="text-stone-300">{"}"}</span>
                      {"\n"}
                      {"      "}
                      <span className="text-stone-500">productName</span>
                      <span className="text-stone-300">=</span>
                      <span className="text-amber-300">"Pro Plan"</span>
                      {"\n"}
                      {"      "}
                      <span className="text-stone-500">onSuccess</span>
                      <span className="text-stone-300">=</span>
                      <span className="text-stone-300">{"{"}</span>
                      <span className="text-stone-300">() ={">"}</span>{" "}
                      <span className="text-emerald-400">activatePlan</span>
                      <span className="text-stone-300">(){"}"}</span>
                      {"\n"}
                      {"    "}
                      <span className="text-blue-400">{"/>"}</span>
                      {"\n"}
                      {"  "}
                      <span className="text-stone-300">)</span>
                      {"\n"}
                      <span className="text-stone-300">{"}"}</span>
                    </code>
                  </pre>
                </div>
                <div className="mt-4 flex gap-4">
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
                  >
                    View documentation
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="https://github.com/settlr"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
                  >
                    GitHub
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
          TESTIMONIALS
         ═══════════════════════════════════════ */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-stone-900">
                Loved by builders
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <TestimonialCard
                quote="Stripe rejected us three times. Settlr had us live in 20 minutes. Game changer for AI startups."
                author="Sarah Chen"
                role="Founder"
                company="AI Startup"
              />
              <TestimonialCard
                quote="The 1% fee saves us thousands monthly. Plus instant settlement means better cash flow."
                author="Marcus Webb"
                role="CTO"
                company="SaaS Platform"
              />
              <TestimonialCard
                quote="Finally, a payment solution that just works. No compliance nightmares, no surprise holds."
                author="Alex Rivera"
                role="Head of Product"
                company="Dev Tools Co"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
          SIMPLE PRICING
         ═══════════════════════════════════════ */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold text-stone-900">
              Simple pricing
            </h2>
            <p className="mt-4 text-stone-600">
              No setup fees. No monthly minimums. No hidden costs.
            </p>

            <div className="mt-12 overflow-hidden rounded-2xl border-2 border-stone-900 bg-white">
              <div className="border-b border-stone-100 bg-stone-50 px-8 py-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-stone-900">1%</span>
                  <span className="text-xl text-stone-500">
                    per transaction
                  </span>
                </div>
              </div>
              <div className="px-8 py-8">
                <ul className="space-y-4 text-left">
                  {[
                    "Instant settlement to your wallet",
                    "Unlimited transactions",
                    "Dashboard & analytics",
                    "API & webhooks",
                    "Email support",
                    "No chargebacks, ever",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-stone-600"
                    >
                      <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboarding"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-4 text-[15px] font-semibold text-white transition-all hover:bg-stone-800"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <p className="mt-6 text-sm text-stone-500">
              Need custom pricing for high volume?{" "}
              <Link
                href="/contact"
                className="font-medium text-stone-900 hover:underline"
              >
                Talk to sales
              </Link>
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════
          FAQ
         ═══════════════════════════════════════ */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="mb-12 text-center text-3xl font-bold text-stone-900">
              Questions & answers
            </h2>

            <div className="divide-y divide-stone-200">
              {[
                {
                  q: "How do customers pay?",
                  a: "Customers pay with USDC from any wallet—Phantom, MetaMask, Coinbase, or even via email if they're new to crypto. We handle the complexity.",
                },
                {
                  q: "What happens to the funds?",
                  a: "Funds settle instantly to your Solana wallet. You can hold USDC, swap to other tokens, or offramp to your bank—it's your money.",
                },
                {
                  q: "Is it compliant?",
                  a: "We're non-custodial, which means we never hold your funds. Payments go directly from customer to merchant. No money transmission.",
                },
                {
                  q: "How fast can I integrate?",
                  a: "Most teams are live in under 30 minutes. Install our SDK, drop in a component, and you're accepting payments.",
                },
              ].map((faq, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium text-stone-900">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 text-stone-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 pr-8 text-sm leading-relaxed text-stone-600">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
          FINAL CTA
         ═══════════════════════════════════════ */}
        <section className="border-t border-stone-200 bg-stone-900 py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to accept payments?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-400">
              Join hundreds of AI and SaaS teams using Settlr. Start accepting
              USDC payments in minutes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-semibold text-stone-900 transition-all hover:bg-stone-100"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 px-8 py-4 text-[15px] font-medium text-stone-300 transition-all hover:bg-stone-800"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
