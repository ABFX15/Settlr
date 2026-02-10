"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  Check,
  Copy,
  Globe,
  Shield,
  Lock,
  Clock,
  Code2,
  Layers,
  X,
  TrendingUp,
  Wallet,
  CreditCard,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ──────────────────────────────────────────────
   HERO
   ────────────────────────────────────────────── */
function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install @settlr/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative flex min-h-screen items-center pt-16">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#14F195]/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Announcement pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/industries/ai-saas"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Built for AI/SaaS teams blocked by Stripe
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl"
          >
            The payment stack for global-first{" "}
            <span className="text-primary">AI & SaaS</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Accept stablecoin payments, hold global revenue privately, and move
            money without banks or Stripe limitations. Instant settlement,
            non-custodial, one React component.
          </motion.p>

          {/* Install command */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 font-mono text-sm"
          >
            <span className="text-primary">npm</span>
            <span className="text-muted-foreground">install</span>
            <span className="text-foreground">@settlr/sdk</span>
            <button
              onClick={handleCopy}
              className="ml-3 rounded p-1 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              aria-label="Copy install command"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start accepting payments
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo/store"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              View demo
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              1% flat fee
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              No setup fees
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              Go live today
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   STATS BAR
   ────────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: "$2M+", label: "Payment volume" },
    { value: "10K+", label: "Transactions" },
    { value: "50+", label: "Countries" },
    { value: "<1s", label: "Settlement time" },
  ];

  return (
    <section className="border-y border-border bg-muted/50">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-foreground md:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FEATURES GRID
   ────────────────────────────────────────────── */
function FeaturesGrid() {
  const features = [
    {
      icon: CreditCard,
      title: "Email checkout",
      description:
        "Customers pay with just their email. No wallet downloads, no seed phrases, no friction.",
    },
    {
      icon: Zap,
      title: "Instant settlement",
      description:
        "Funds arrive in your wallet the moment customers pay. No holds, no delays, no waiting.",
    },
    {
      icon: Layers,
      title: "Multi-token accept",
      description:
        "Accept SOL, USDC, BONK, JUP, or any Solana token. Auto-converted to USDC for you.",
    },
    {
      icon: Shield,
      title: "Non-custodial",
      description:
        "Your keys, your funds. Settlr never takes custody of your money. You control everything.",
    },
    {
      icon: Lock,
      title: "Zero chargebacks",
      description:
        "Blockchain payments are final. No disputes, no reversals, no fraud losses.",
    },
    {
      icon: Globe,
      title: "180+ countries",
      description:
        "Accept payments from anywhere on earth. No geographic restrictions or waitlists.",
    },
  ];

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Why Settlr
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Everything you need to accept crypto payments
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Drop-in SDK, no blockchain expertise required. Ship payments in
            minutes, not months.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col gap-3 bg-background p-8"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   CODE SHOWCASE
   ────────────────────────────────────────────── */
function CodeShowcase() {
  return (
    <section className="border-y border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Developer experience
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
              Ship payments in 5 minutes
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              One component, three lines of code. Our TypeScript-first SDK works
              with React, Next.js, Vue, and any JavaScript framework. Fully typed,
              zero config.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["React", "Next.js", "Vue", "REST API"].map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
            <Link
              href="/docs"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Read the docs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          {/* Code block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground">
                checkout.tsx
              </span>
            </div>
            <div className="p-6 font-mono text-sm leading-loose">
              <div>
                <span className="text-[#c084fc]">import</span>{" "}
                <span className="text-foreground">{"{ SettlrButton }"}</span>{" "}
                <span className="text-[#c084fc]">from</span>{" "}
                <span className="text-primary">
                  {"'@settlr/sdk'"}
                </span>
              </div>
              <div className="mt-1 text-muted-foreground/50">
                {"// That's it. Really."}
              </div>
              <div className="mt-4">
                <span className="text-muted-foreground">{"<"}</span>
                <span className="text-[#67e8f9]">SettlrButton</span>
              </div>
              <div className="ml-4">
                <span className="text-[#c084fc]">amount</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-primary">{"{9.99}"}</span>
              </div>
              <div className="ml-4">
                <span className="text-[#c084fc]">currency</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-primary">{'"USDC"'}</span>
              </div>
              <div className="ml-4">
                <span className="text-[#c084fc]">onSuccess</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-foreground">{"{"}</span>
                <span className="text-muted-foreground">handlePayment</span>
                <span className="text-foreground">{"}"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{"/>"}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   COMPARISON TABLE
   ────────────────────────────────────────────── */
function ComparisonTable() {
  const rows = [
    { feature: "Custody model", competitor: "Custodial", settlr: "Non-custodial", competitorNeg: true, settlrPos: true },
    { feature: "Settlement time", competitor: "1-2 days", settlr: "Instant", competitorNeg: true, settlrPos: true },
    { feature: "Transaction fees", competitor: "1%", settlr: "From 1%", competitorNeg: false, settlrPos: true },
    { feature: "Chargebacks", competitor: "Yes", settlr: "Zero", competitorNeg: true, settlrPos: true },
    { feature: "Wallet required", competitor: "Yes", settlr: "No", competitorNeg: true, settlrPos: true },
    { feature: "Gas fees", competitor: "User pays", settlr: "We cover it", competitorNeg: true, settlrPos: true },
    { feature: "KYC required", competitor: "Heavy", settlr: "Simple", competitorNeg: true, settlrPos: true },
    { feature: "Embedded wallets", competitor: "No", settlr: "Yes", competitorNeg: true, settlrPos: true },
    { feature: "Payment token", competitor: "Limited tokens", settlr: "Any Solana token", competitorNeg: true, settlrPos: true },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Comparison
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Why developers choose Settlr
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            See how we stack up against traditional crypto payment solutions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-xl border border-border"
        >
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-border bg-muted px-6 py-4">
            <div className="text-sm font-medium text-muted-foreground">
              Feature
            </div>
            <div className="text-center text-sm font-medium text-muted-foreground">
              BitPay
            </div>
            <div className="text-center text-sm font-medium text-primary">
              Settlr
            </div>
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 items-center border-b border-border px-6 py-4 last:border-b-0 transition-colors hover:bg-muted/30"
            >
              <div className="text-sm font-medium text-foreground">
                {row.feature}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-sm">
                {row.competitorNeg && (
                  <X className="h-3.5 w-3.5 text-destructive/70" />
                )}
                <span className={row.competitorNeg ? "text-muted-foreground" : "text-muted-foreground"}>
                  {row.competitor}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-sm">
                {row.settlrPos && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
                <span className="font-medium text-foreground">
                  {row.settlr}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SAVINGS CALCULATOR
   ────────────────────────────────────────────── */
function SavingsCalculator() {
  const [volume, setVolume] = useState(10000);
  const [avgTransaction, setAvgTransaction] = useState(100);

  const transactions = Math.round(volume / avgTransaction);
  const stripeFee = volume * 0.029 + transactions * 0.3;
  const wireFee = transactions * 35;
  const settlrFee = volume * 0.01;
  const stripeSavings = stripeFee - settlrFee;
  const wireSavings = wireFee - settlrFee;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

  return (
    <section className="border-y border-border bg-muted/30 py-24" id="calculator">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Savings
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            See how much you would save
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Compare your current payment processor fees against Settlr.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-xl border border-border bg-card p-8"
        >
          {/* Inputs */}
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Monthly payment volume
              </label>
              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                  $
                </span>
                <input
                  type="text"
                  value={fmtNum(volume)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/,/g, "")) || 0;
                    setVolume(Math.min(val, 10000000));
                  }}
                  className="w-full rounded-lg border border-border bg-background py-3 pl-8 pr-4 text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>$1K</span>
                <span>$500K</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Average transaction size
              </label>
              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                  $
                </span>
                <input
                  type="text"
                  value={fmtNum(avgTransaction)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/,/g, "")) || 1;
                    setAvgTransaction(Math.max(1, Math.min(val, 100000)));
                  }}
                  className="w-full rounded-lg border border-border bg-background py-3 pl-8 pr-4 text-lg font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <input
                type="range"
                min="10"
                max="5000"
                step="10"
                value={avgTransaction}
                onChange={(e) => setAvgTransaction(parseInt(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>$10</span>
                <span>$5,000</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-border" />

          {/* Results */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-5 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                vs Stripe (2.9% + $0.30)
              </div>
              <div className="mt-2 text-2xl font-bold text-primary">
                {fmt(stripeSavings)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                saved per month
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-5 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                vs Wire transfers (~$35/tx)
              </div>
              <div className="mt-2 text-2xl font-bold text-primary">
                {fmt(wireSavings)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                saved per month
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Annual savings vs Stripe
              </div>
              <div className="mt-2 text-2xl font-bold text-primary">
                {fmt(stripeSavings * 12)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {fmtNum(transactions)} transactions/mo
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   USE CASES
   ────────────────────────────────────────────── */
function UseCases() {
  const cases = [
    {
      icon: Code2,
      title: "AI APIs",
      description:
        "Usage-based billing with instant settlement and no account holds.",
      points: [
        "Accept USDC from global customers",
        "Settle instantly to your wallet",
        "No chargebacks on API usage",
      ],
    },
    {
      icon: TrendingUp,
      title: "SaaS subscriptions",
      description:
        "Recurring billing without processor risk or reserve holds.",
      points: [
        "Subscription checkout in minutes",
        "Gasless payments for users",
        "No chargebacks on subscriptions",
      ],
    },
    {
      icon: Wallet,
      title: "Stripe-blocked startups",
      description:
        "Get live fast when Stripe says no. Keep shipping and collecting revenue.",
      points: [
        "No underwriting or reserve holds",
        "Accept global USDC instantly",
        "Zero chargebacks, payments are final",
      ],
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Built for you
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Who it&apos;s for
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Settlr is built for AI and SaaS teams that need reliable global
            payments without processor risk.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {cases.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {c.description}
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {c.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   PROBLEM / SOLUTION
   ────────────────────────────────────────────── */
function ProblemSolution() {
  const problems = [
    { text: "PayPal charges 5%+ fees on international transfers", stat: "-5%" },
    { text: "Bank transfers take 3-5 business days", stat: "3-5 days" },
    { text: "Your local currency loses value while you wait", stat: "-2-4%" },
    { text: "Many countries can't access PayPal or Wise", stat: "Blocked" },
  ];

  const solutions = [
    { text: "Receive USDC, stable and dollar-pegged, yours instantly", stat: "$1 = $1" },
    { text: "Instant settlement, no waiting, no holds", stat: "<1 sec" },
    { text: "1% flat fee, no hidden currency conversion costs", stat: "Just 1%" },
    { text: "Works in 180+ countries, no restrictions", stat: "Global" },
  ];

  return (
    <section className="border-y border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            The problem we solve
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Getting paid shouldn&apos;t be this hard
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            If you&apos;re a freelancer, remote worker, or creator getting paid
            internationally, you know the pain.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-destructive/20 bg-card p-8"
          >
            <h3 className="text-lg font-semibold text-destructive">
              The problem
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              What you deal with now
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {problems.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center justify-between gap-4 rounded-lg border border-destructive/10 bg-destructive/5 p-4"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.text}
                  </span>
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                    {item.stat}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-primary/20 bg-card p-8"
          >
            <h3 className="text-lg font-semibold text-primary">
              The Settlr solution
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              What Settlr gives you
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {solutions.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center justify-between gap-4 rounded-lg border border-primary/10 bg-primary/5 p-4"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.text}
                  </span>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {item.stat}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   FINAL CTA
   ────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="relative py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
            Start getting paid in crypto
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            Your customers pay with any token. You receive USDC. Instantly.
            Non-custodially.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.npmjs.com/package/@settlr/sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              View SDK
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary/60" />
              Non-custodial
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary/60" />
              Instant settlement
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-primary/60" />
              180+ countries
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <StatsBar />
      <FeaturesGrid />
      <CodeShowcase />
      <ComparisonTable />
      <SavingsCalculator />
      <UseCases />
      <ProblemSolution />
      <FinalCTA />
      <Footer />
    </main>
  );
}
