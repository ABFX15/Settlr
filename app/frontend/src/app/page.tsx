"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Check,
  Copy,
  ArrowRight,
  Shield,
  Globe,
  Clock,
  CreditCard,
  X as XIcon,
  Code2,
  Layers,
  RefreshCcw,
  Lock,
  Wallet,
  BarChart3,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── Savings Calculator ─── */
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8"
    >
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Monthly Payment Volume
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]">
              $
            </span>
            <input
              type="text"
              value={fmtNum(volume)}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/,/g, "")) || 0;
                setVolume(Math.min(val, 10000000));
              }}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-3 text-lg font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <input
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full mt-3 accent-[var(--accent)]"
          />
          <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
            <span>$1K</span>
            <span>$500K</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Average Transaction Size
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]">
              $
            </span>
            <input
              type="text"
              value={fmtNum(avgTransaction)}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/,/g, "")) || 1;
                setAvgTransaction(Math.max(1, Math.min(val, 100000)));
              }}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-3 text-lg font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <input
            type="range"
            min="10"
            max="5000"
            step="10"
            value={avgTransaction}
            onChange={(e) => setAvgTransaction(parseInt(e.target.value))}
            className="w-full mt-3 accent-[var(--accent)]"
          />
          <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
            <span>$10</span>
            <span>$5,000</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] my-6" />

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-[var(--background)] p-5 border border-[var(--border)]">
          <div className="text-sm text-[var(--text-muted)] mb-1">
            vs Stripe (2.9% + $0.30)
          </div>
          <div className="text-3xl font-bold text-[var(--accent)]">
            {fmt(stripeSavings)}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            saved per month
          </div>
        </div>
        <div className="rounded-lg bg-[var(--background)] p-5 border border-[var(--border)]">
          <div className="text-sm text-[var(--text-muted)] mb-1">
            vs Wire Transfers (~$35/tx)
          </div>
          <div className="text-3xl font-bold text-[var(--accent)]">
            {fmt(wireSavings)}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            saved per month
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/20 p-5 text-center">
        <div className="text-sm text-[var(--text-secondary)] mb-1">
          Annual Savings vs Stripe
        </div>
        <div className="text-4xl font-bold text-[var(--accent)]">
          {fmt(stripeSavings * 12)}
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          Based on {fmtNum(transactions)} transactions/month at{" "}
          {fmt(avgTransaction)} avg
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Comparison Table ─── */
function ComparisonTable() {
  const rows = [
    { feature: "Custody Model", them: "Custodial", us: "Non-Custodial" },
    { feature: "Settlement Time", them: "1-2 days", us: "Instant" },
    { feature: "Transaction Fees", them: "1%", us: "From 1%" },
    { feature: "Chargebacks", them: "Yes", us: "Zero" },
    { feature: "Wallet Required", them: "Yes", us: "No" },
    { feature: "Gas Fees", them: "User pays", us: "We Cover It" },
    { feature: "KYC Required", them: "Heavy", us: "Simple" },
    { feature: "Embedded Wallets", them: "No", us: "Yes" },
    { feature: "Payment Token", them: "Limited tokens", us: "Any Solana token" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-xl border border-[var(--border)]"
    >
      {/* Header */}
      <div className="grid grid-cols-3 border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
        <div className="text-sm font-medium text-[var(--text-muted)]">
          Feature
        </div>
        <div className="text-center text-sm font-medium text-[var(--text-muted)]">
          BitPay
        </div>
        <div className="text-center text-sm font-medium text-[var(--accent)]">
          Settlr
        </div>
      </div>

      {/* Rows */}
      {rows.map((row) => (
        <div
          key={row.feature}
          className="grid grid-cols-3 items-center border-b border-[var(--border)] px-6 py-4 last:border-b-0 transition-colors hover:bg-[var(--card)]"
        >
          <div className="text-sm font-medium text-[var(--text-secondary)]">
            {row.feature}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/10">
              <XIcon className="h-2.5 w-2.5 text-red-400" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">{row.them}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)]/10">
              <Check className="h-2.5 w-2.5 text-[var(--accent)]" />
            </div>
            <span className="text-sm font-medium text-[var(--accent)]">
              {row.us}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Stats Row ─── */
function StatsRow() {
  const stats = [
    { value: "$2M+", label: "Payment Volume" },
    { value: "10K+", label: "Transactions" },
    { value: "50+", label: "Countries" },
    { value: "<1s", label: "Settlement" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[var(--border)]">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className={`flex flex-col items-center justify-center py-10 ${
            i < stats.length - 1 ? "border-r border-[var(--border)]" : ""
          }`}
        >
          <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            {stat.value}
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--border-hover)]"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-muted)]">
        <Icon className="h-5 w-5 text-[var(--accent)]" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>
    </motion.div>
  );
}

/* ─── Use Case Card ─── */
function UseCaseCard({
  title,
  description,
  points,
  delay = 0,
}: {
  title: string;
  description: string;
  points: string[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--border-hover)]"
    >
      <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{description}</p>
      <ul className="space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
            <span className="text-[var(--text-secondary)]">{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ─── Code Block ─── */
function CodeBlock() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm install @settlr/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]/30" />
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]/30" />
        </div>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          checkout.tsx
        </span>
      </div>
      {/* Code content */}
      <div className="p-5 font-mono text-sm leading-relaxed">
        <div>
          <span className="text-orange-400">import</span>{" "}
          <span className="text-amber-300">{"{ SettlrButton }"}</span>{" "}
          <span className="text-orange-400">from</span>{" "}
          <span className="text-[var(--accent)]">
            {"'@settlr/sdk'"}
          </span>
        </div>
        <div className="mt-1 text-[var(--text-muted)]">
          {"// That's it. Really."}
        </div>
        <div className="mt-3">
          <span className="text-[var(--text-muted)]">{"<"}</span>
          <span className="text-sky-400">SettlrButton</span>{" "}
          <span className="text-amber-300">amount</span>
          <span className="text-[var(--text-muted)]">=</span>
          <span className="text-[var(--accent)]">{"{9.99}"}</span>{" "}
          <span className="text-[var(--text-muted)]">{"/>"}</span>
        </div>
      </div>
      {/* Install bar */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
        <code className="text-xs text-[var(--text-muted)]">
          <span className="text-[var(--accent)]">npm</span> install @settlr/sdk
        </code>
        <button
          onClick={copyInstall}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span className="text-[var(--accent)]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function LandingPage() {
  const [copied, setCopied] = useState(false);

  return (
    <main className="relative min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[var(--accent)]/[0.04] rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-sm text-[var(--text-secondary)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Built for AI/SaaS teams blocked by Stripe
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-6xl lg:text-7xl text-balance"
          >
            The payment stack for
            <br />
            <span className="text-[var(--accent)]">
              global-first companies
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-muted)] leading-relaxed md:text-xl"
          >
            Accept stablecoin payments with instant settlement, no chargebacks,
            and no processor risk. Integrate once, collect revenue globally.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              href="/onboarding"
              className="group flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#09090b] transition-all hover:shadow-[0_0_24px_var(--accent-glow)]"
            >
              Start accepting payments
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/demo/store"
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
            >
              View Demo
            </Link>
          </motion.div>

          {/* Install bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 inline-flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5"
          >
            <code className="text-sm font-mono text-[var(--text-muted)]">
              <span className="text-[var(--accent)]">npm</span>{" "}
              <span className="text-[var(--text-muted)]">install</span>{" "}
              <span className="text-[var(--text-secondary)]">@settlr/sdk</span>
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText("npm install @settlr/sdk");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[var(--accent)]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]"
          >
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              1% flat fee
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              No setup fees
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              Go live today
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <StatsRow />

      {/* ─── Features Grid ─── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl text-balance">
            Everything you need to accept crypto
          </h2>
          <p className="mt-3 text-[var(--text-muted)] md:text-lg">
            No wallets required for your customers. No blockchain expertise
            required for you.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={CreditCard}
            title="Email Checkout"
            description="Customers pay with just their email. No wallet downloads, no seed phrases, no friction."
            delay={0}
          />
          <FeatureCard
            icon={Zap}
            title="Instant Settlement"
            description="Funds arrive in your wallet the moment customers pay. No holds, no delays, no waiting periods."
            delay={0.05}
          />
          <FeatureCard
            icon={RefreshCcw}
            title="Auto Token Conversion"
            description="Accept SOL, USDC, BONK, JUP, or any Solana token. We convert to USDC automatically via Jupiter."
            delay={0.1}
          />
          <FeatureCard
            icon={Shield}
            title="Non-Custodial"
            description="Your keys, your funds. Settlr never holds your money. Payments go directly to your wallet."
            delay={0.15}
          />
          <FeatureCard
            icon={Lock}
            title="Zero Chargebacks"
            description="Blockchain payments are final. No disputes, no reversals, no fraud-related losses."
            delay={0.2}
          />
          <FeatureCard
            icon={Globe}
            title="Global Coverage"
            description="Accept payments from 180+ countries. No geographic restrictions, no currency conversion headaches."
            delay={0.25}
          />
        </div>
      </section>

      {/* ─── Code + Showcase ─── */}
      <section className="border-y border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="mx-auto max-w-5xl px-4 py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-2 text-sm font-medium text-[var(--accent)]">
                Developer Experience
              </div>
              <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
                Ship payments in minutes
              </h2>
              <p className="mb-6 text-[var(--text-muted)] leading-relaxed">
                Drop in our SDK and start accepting crypto. No complex setup,
                no blockchain expertise needed. TypeScript-first, fully typed,
                zero config.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {["React", "Next.js", "Vue", "REST API"].map((fw) => (
                  <span
                    key={fw}
                    className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {fw}
                  </span>
                ))}
              </div>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Read the docs
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <CodeBlock />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Problem / Solution ─── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl text-balance">
            Getting paid shouldn&apos;t be this hard
          </h2>
          <p className="mt-3 text-[var(--text-muted)] md:text-lg max-w-2xl mx-auto">
            If you&apos;re a freelancer, remote worker, or founder getting paid
            internationally — you know the pain.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-red-400">
              The Problem
            </h3>
            <div className="space-y-3">
              {[
                { text: "PayPal charges 5%+ fees on international transfers", stat: "-5%" },
                { text: "Bank transfers take 3-5 business days", stat: "3-5 days" },
                { text: "Your local currency loses value while you wait", stat: "-2-4%" },
                { text: "Many countries can't access PayPal or Wise", stat: "Blocked" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center justify-between rounded-lg bg-red-500/[0.05] border border-red-500/10 p-3"
                >
                  <span className="text-sm text-[var(--text-secondary)]">
                    {item.text}
                  </span>
                  <span className="ml-3 shrink-0 text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                    {item.stat}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/[0.03] p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-[var(--accent)]">
              The Settlr Solution
            </h3>
            <div className="space-y-3">
              {[
                { text: "Receive USDC -- stable, dollar-pegged, yours instantly", stat: "$1 = $1" },
                { text: "Instant settlement -- no waiting, no holds", stat: "<1 sec" },
                { text: "1% flat fee -- no hidden currency conversion costs", stat: "Just 1%" },
                { text: "Works in 180+ countries -- no restrictions", stat: "Global" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center justify-between rounded-lg bg-[var(--accent)]/[0.05] border border-[var(--accent)]/10 p-3"
                >
                  <span className="text-sm text-[var(--text-secondary)]">
                    {item.text}
                  </span>
                  <span className="ml-3 shrink-0 text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">
                    {item.stat}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section className="border-y border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="mx-auto max-w-5xl px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl text-balance">
              Built for modern teams
            </h2>
            <p className="mt-3 text-[var(--text-muted)] md:text-lg">
              Settlr is built for AI and SaaS teams that need reliable global
              payments without processor risk.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            <UseCaseCard
              title="AI APIs"
              description="Usage-based billing with instant settlement and no account holds."
              points={[
                "Accept USDC from global customers",
                "Settle instantly to your wallet",
                "No chargebacks on API usage",
              ]}
              delay={0}
            />
            <UseCaseCard
              title="SaaS Subscriptions"
              description="Recurring billing without processor risk or reserve holds."
              points={[
                "Subscription checkout in minutes",
                "Gasless payments for users",
                "No chargebacks on subscriptions",
              ]}
              delay={0.05}
            />
            <UseCaseCard
              title="Stripe-Blocked Startups"
              description="Get live fast when Stripe says no. Keep shipping and collecting revenue."
              points={[
                "No underwriting or reserve holds",
                "Accept global USDC instantly",
                "Zero chargebacks -- payments are final",
              ]}
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* ─── Savings Calculator ─── */}
      <section className="mx-auto max-w-4xl px-4 py-24" id="calculator">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            See how much you&apos;d save
          </h2>
          <p className="mt-3 text-[var(--text-muted)] md:text-lg">
            Enter your monthly payment volume to calculate your savings with
            Settlr.
          </p>
        </motion.div>

        <SavingsCalculator />
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="border-y border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="mx-auto max-w-4xl px-4 py-24" id="compare">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
              Why developers choose Settlr
            </h2>
            <p className="mt-3 text-[var(--text-muted)] md:text-lg">
              See how we stack up against traditional crypto payment solutions.
            </p>
          </motion.div>

          <ComparisonTable />
        </div>
      </section>

      {/* ─── Integrations ─── */}
      <section className="mx-auto max-w-4xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            Works with your stack
          </h2>
          <p className="mt-3 mb-10 text-[var(--text-muted)] md:text-lg">
            Drop in our SDK to any framework. TypeScript-first, fully typed,
            zero config.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "React", icon: Code2 },
              { name: "Next.js", icon: Layers },
              { name: "Vue", icon: Code2 },
              { name: "Shopify", icon: CreditCard },
              { name: "WordPress", icon: Globe },
              { name: "REST API", icon: BarChart3 },
            ].map((integration) => (
              <motion.div
                key={integration.name}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-3 transition-colors hover:border-[var(--border-hover)]"
              >
                <integration.icon className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {integration.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="border-y border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="mx-auto max-w-5xl px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
              Trusted by builders
            </h2>
            <p className="mt-3 text-[var(--text-muted)] md:text-lg">
              Join hundreds of developers shipping crypto payments the easy way.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                quote:
                  "Integrated Settlr in under 10 minutes. My users love paying with their favorite tokens.",
                author: "Indie Dev",
                role: "Building on Solana",
              },
              {
                quote:
                  "Finally, a payment solution that actually understands Web3. No more Stripe headaches.",
                author: "Founder",
                role: "DeFi Startup",
              },
              {
                quote:
                  "The email-based checkout is genius. Conversion went up 40% after switching.",
                author: "Store Owner",
                role: "NFT Marketplace",
              },
            ].map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {t.author}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {t.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden py-32 px-4">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--accent)]/[0.05] rounded-full blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] md:text-5xl text-balance">
              Start getting paid in crypto
            </h2>
            <p className="mb-8 text-lg text-[var(--text-muted)]">
              Your customers pay with any token. You receive USDC. Instantly.
              Non-custodially.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="group flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#09090b] transition-all hover:shadow-[0_0_24px_var(--accent-glow)]"
              >
                Get Started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="https://www.npmjs.com/package/@settlr/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
              >
                View SDK
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[var(--accent)]" />
                Non-Custodial
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
                Instant Settlement
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[var(--accent)]" />
                180+ Countries
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
