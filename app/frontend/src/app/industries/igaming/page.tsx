"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Gamepad2,
  Wallet,
  CreditCard,
  Lock,
  Globe,
  Ban,
  AlertTriangle,
  DollarSign,
  X,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: Zap,
    title: "Instant Deposits",
    description:
      "Sub-second finality on Solana. Players deposit and play immediately.",
    stat: "400ms",
    statLabel: "avg. settlement",
  },
  {
    icon: Clock,
    title: "Instant Withdrawals",
    description: "Non-custodial payouts with no approval delays.",
    stat: "0",
    statLabel: "waiting time",
  },
  {
    icon: Shield,
    title: "Zero Chargebacks",
    description:
      "Crypto payments are irreversible. Eliminate fraud completely.",
    stat: "0%",
    statLabel: "chargeback rate",
  },
  {
    icon: Wallet,
    title: "No Wallet Required",
    description: "Players pay with email. No MetaMask, no friction.",
    stat: "3x",
    statLabel: "higher conversion",
  },
  {
    icon: CreditCard,
    title: "Fiat On-Ramp",
    description: "Players buy crypto with cards through integrated partners.",
    stat: "150+",
    statLabel: "countries supported",
  },
  {
    icon: Lock,
    title: "Player Privacy",
    description: "Encrypted receipts protect player transaction details.",
    stat: "FHE",
    statLabel: "encryption",
  },
];

const painPoints = [
  {
    icon: Ban,
    problem: "Payment Processor Bans",
    detail: "Stripe, PayPal see you as high-risk",
  },
  {
    icon: Clock,
    problem: "Slow Withdrawals",
    detail: "3-7 day waits kill player retention",
  },
  {
    icon: AlertTriangle,
    problem: "Chargeback Fraud",
    detail: "2-5% of volume lost to disputes",
  },
  {
    icon: DollarSign,
    problem: "Excessive Fees",
    detail: "3-6% processing cuts into margin",
  },
  {
    icon: Globe,
    problem: "Geographic Limits",
    detail: "Traditional rails block emerging markets",
  },
];

const stats = [
  { value: "$2T+", label: "Crypto Market Cap" },
  { value: "0.001%", label: "Transaction Fees" },
  { value: "400ms", label: "Settlement Time" },
  { value: "150+", label: "Countries" },
];

const comparison = [
  { feature: "Transaction Fees", traditional: "3-6%", settlr: "0.5%" },
  { feature: "Settlement Time", traditional: "3-7 days", settlr: "Instant" },
  { feature: "Chargeback Risk", traditional: "2-5%", settlr: "0%" },
  { feature: "Geographic Limits", traditional: "Many", settlr: "None" },
  { feature: "Account Freezing", traditional: "Common", settlr: "Impossible" },
  { feature: "Player KYC", traditional: "Required", settlr: "Optional" },
];

export default function IGamingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="px-4 pb-16 pt-32">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Built for iGaming
                  </span>
                </div>

                <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-6xl text-balance">
                  The payment stack casinos{" "}
                  <span className="text-primary">actually deserve</span>
                </h1>

                <p className="mb-8 max-w-lg text-lg text-muted-foreground">
                  Non-custodial crypto payments with instant deposits, instant
                  withdrawals, zero chargebacks, and no payment processor can
                  shut you down.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/waitlist"
                    className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Get Early Access
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    View Documentation
                  </Link>
                </div>
              </motion.div>

              {/* Bento stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                    <Zap className="mb-3 h-7 w-7 text-primary" />
                    <div className="text-3xl font-bold text-foreground">400ms</div>
                    <div className="text-sm text-muted-foreground">Settlement time</div>
                  </div>
                  <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
                    <Shield className="mb-3 h-7 w-7 text-accent" />
                    <div className="text-3xl font-bold text-foreground">0%</div>
                    <div className="text-sm text-muted-foreground">Chargebacks</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">Global Reach</span>
                  </div>
                  <p className="text-muted-foreground">
                    Accept payments from 150+ countries. No payment processor
                    restrictions. Crypto has no borders.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <DollarSign className="mb-3 h-7 w-7 text-accent" />
                    <div className="text-3xl font-bold text-foreground">0.5%</div>
                    <div className="text-sm text-muted-foreground">Transaction fee</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <Wallet className="mb-3 h-7 w-7 text-muted-foreground" />
                    <div className="text-3xl font-bold text-foreground">No KYC</div>
                    <div className="text-sm text-muted-foreground">For players</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="bg-primary px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-1 text-3xl font-bold text-primary-foreground md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/70">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Problems */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                Traditional payments are{" "}
                <span className="text-destructive">broken</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                iGaming operators face unique challenges that traditional
                payment processors either can't or won't solve.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {painPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.problem}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative overflow-hidden rounded-xl border border-destructive/20 bg-destructive/5 p-6"
                  >
                    <div className="absolute right-2 top-2 text-destructive/30">
                      <X className="h-7 w-7" />
                    </div>
                    <Icon className="mb-3 h-7 w-7 text-destructive" />
                    <h3 className="mb-1 font-semibold text-foreground">
                      {point.problem}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {point.detail}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  The Settlr Solution
                </span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                Everything you need.{" "}
                <span className="text-primary">Nothing you don't.</span>
              </h2>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/20"
                  >
                    <div className="mb-4 inline-flex rounded-xl bg-muted p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div className="mb-3">
                      <span className="text-3xl font-bold text-foreground">
                        {feature.stat}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {feature.statLabel}
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <h2 className="text-3xl font-bold text-foreground">
                Traditional vs.{" "}
                <span className="text-primary">Settlr</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <div className="grid grid-cols-3 border-b border-border bg-muted">
                <div className="p-4 text-sm font-medium text-muted-foreground">
                  Feature
                </div>
                <div className="p-4 text-center text-sm font-medium text-muted-foreground">
                  Traditional
                </div>
                <div className="p-4 text-center text-sm font-medium text-primary">
                  Settlr
                </div>
              </div>
              {comparison.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${
                    index !== comparison.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div className="p-4 text-foreground">{row.feature}</div>
                  <div className="p-4 text-center text-muted-foreground">
                    {row.traditional}
                  </div>
                  <div className="p-4 text-center font-medium text-primary">
                    {row.settlr}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <Gamepad2 className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Ready to Level Up?
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Start accepting crypto payments today
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join iGaming operators who chose faster, cheaper, and more
              reliable payments.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Early Access
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/demo/store"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Try the Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
