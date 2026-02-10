"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Wallet,
  Lock,
  DollarSign,
  Ban,
  X,
  Users,
  Code2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: Lock,
    title: "Private Payments",
    description:
      "Customers pay without on-chain amounts exposed. FHE-encrypted receipts.",
    stat: "100%",
    statLabel: "private",
  },
  {
    icon: Ban,
    title: "No Processor Risk",
    description:
      "No arbitrary freezes or account flags. Your revenue keeps flowing.",
    stat: "0",
    statLabel: "risk of shutdown",
  },
  {
    icon: Wallet,
    title: "Frictionless Checkout",
    description:
      "Pay with email. Wallet optional. No crypto expertise required.",
    stat: "3x",
    statLabel: "higher conversion",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description:
      "Get your money immediately. No holds, no thresholds, no waiting.",
    stat: "0",
    statLabel: "waiting days",
  },
  {
    icon: DollarSign,
    title: "1% Flat Fee",
    description: "Lower than Stripe + FX + chargebacks. No hidden add-ons.",
    stat: "1%",
    statLabel: "that's it",
  },
  {
    icon: Shield,
    title: "Zero Chargebacks",
    description:
      "Blockchain payments are irreversible. No revenue lost to disputes.",
    stat: "0%",
    statLabel: "chargeback rate",
  },
];

const painPoints = [
  {
    icon: Ban,
    problem: "Processor Risk",
    detail: "Stripe flags can freeze revenue overnight",
  },
  {
    icon: DollarSign,
    problem: "High Fees",
    detail: "2.9% + FX + chargebacks add up fast",
  },
  {
    icon: Clock,
    problem: "Delayed Settlements",
    detail: "Holds and reserves slow your cash flow",
  },
  {
    icon: Shield,
    problem: "Chargebacks",
    detail: "Disputes kill margins and time",
  },
];

const stats = [
  { value: "1%", label: "Flat Fee" },
  { value: "Instant", label: "Payouts" },
  { value: "Private", label: "By Default" },
  { value: "$0", label: "Min Payout" },
];

const comparisonRows = [
  { platform: "Stripe (blocked)", fee: "2.9%+", keep: "97%" },
  { platform: "Paddle", fee: "5%+", keep: "95%" },
  { platform: "Lemon Squeezy", fee: "5%+", keep: "95%" },
  { platform: "PayPal", fee: "3.5%+", keep: "96%" },
];

const useCases = [
  { name: "AI APIs", icon: Zap },
  { name: "SaaS Subscriptions", icon: Users },
  { name: "Usage-Based Billing", icon: DollarSign },
  { name: "Global Customers", icon: Wallet },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function AiSaasPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center pt-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                Built for AI/SaaS founders
              </div>

              <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                Launch payments
                <br />
                even if Stripe{" "}
                <span className="text-primary">says no.</span>
              </h1>

              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                Accept private, gasless USDC payments and subscriptions in
                minutes. One SDK, instant payouts, and a 1% flat fee.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Start Accepting USDC
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
                >
                  See How It Works
                </Link>
              </div>
            </motion.div>

            {/* Right - stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-6">
                <DollarSign className="mb-3 h-6 w-6 text-primary" />
                <div className="text-3xl font-bold">1%</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Flat fee, always
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <Lock className="mb-3 h-6 w-6 text-muted-foreground" />
                <div className="text-3xl font-bold">Private</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Customer transactions
                </div>
              </div>
              <div className="col-span-2 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold">Instant Payouts</span>
                </div>
                <p className="mt-3 text-muted-foreground">
                  Get paid the moment a subscription starts. No waiting weeks. No
                  minimum thresholds. Your money, instantly.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <Shield className="mb-3 h-6 w-6 text-primary" />
                <div className="text-3xl font-bold">0%</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Chargebacks
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <Ban className="mb-3 h-6 w-6 text-muted-foreground" />
                <div className="text-3xl font-bold">{"Can't"}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Be blocked
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div {...fadeUp} className="mb-14 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Processors can block your revenue{" "}
              <span className="text-destructive">without warning</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Traditional payment processors add fees, hold funds, and can freeze
              accounts when your growth spikes.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.problem}
                  {...fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="group relative rounded-xl border border-destructive/20 bg-destructive/[0.04] p-6"
                >
                  <div className="absolute right-3 top-3 text-destructive/30">
                    <X className="h-5 w-5" />
                  </div>
                  <Icon className="mb-4 h-6 w-6 text-destructive" />
                  <h3 className="mb-1.5 font-semibold">{point.problem}</h3>
                  <p className="text-sm text-muted-foreground">{point.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div {...fadeUp} className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Perfect for AI/SaaS
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {useCases.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <motion.div
                  key={uc.name}
                  {...fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
                >
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{uc.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div {...fadeUp} className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary" />
              Why Settlr
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Built for teams who need{" "}
              <span className="text-primary">reliable payments</span>
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold">{feature.stat}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {feature.statLabel}
                    </span>
                  </div>
                  <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y border-border bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Processor Fees vs.{" "}
              <span className="text-primary">Settlr</span>
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="overflow-hidden rounded-xl border border-border"
          >
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-border bg-muted/50">
              <div className="p-4 text-sm font-medium text-muted-foreground">
                Platform
              </div>
              <div className="p-4 text-center text-sm font-medium text-muted-foreground">
                Their Cut
              </div>
              <div className="p-4 text-center text-sm font-medium text-muted-foreground">
                You Keep
              </div>
            </div>

            {comparisonRows.map((row) => (
              <div
                key={row.platform}
                className="grid grid-cols-3 border-b border-border last:border-0"
              >
                <div className="p-4 text-sm">{row.platform}</div>
                <div className="p-4 text-center text-sm text-destructive">
                  {row.fee}
                </div>
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {row.keep}
                </div>
              </div>
            ))}

            {/* Settlr row */}
            <div className="grid grid-cols-3 bg-primary/[0.06]">
              <div className="p-4 text-sm font-semibold text-primary">
                Settlr
              </div>
              <div className="p-4 text-center text-sm font-semibold text-primary">
                1%
              </div>
              <div className="p-4 text-center text-sm font-semibold text-primary">
                99%
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Ready to accept payments
              <br />
              <span className="text-primary">without limits?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              One SDK. One percent. Instant settlement. No bank needed.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get Early Access
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Read the Docs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
