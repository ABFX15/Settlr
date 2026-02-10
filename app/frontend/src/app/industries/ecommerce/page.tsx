"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  ArrowRight,
  Check,
  ShoppingCart,
  Wallet,
  Lock,
  Globe,
  DollarSign,
  X,
  Percent,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: DollarSign,
    title: "1% Flat Fee",
    description:
      "No per-transaction fees. No monthly minimums. Save 30%+ compared to Stripe.",
    stat: "1%",
    statLabel: "flat, always",
  },
  {
    icon: Shield,
    title: "Zero Chargebacks",
    description:
      "Blockchain payments are final. No more losing revenue to friendly fraud.",
    stat: "0%",
    statLabel: "chargeback rate",
  },
  {
    icon: Wallet,
    title: "No Wallet Required",
    description:
      "Customers pay with email. Same checkout UX as cards, powered by crypto.",
    stat: "3x",
    statLabel: "higher conversion",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Get your money in seconds, not days. No rolling reserves or holds.",
    stat: "400ms",
    statLabel: "settlement time",
  },
  {
    icon: Globe,
    title: "195 Countries",
    description:
      "Accept payments from anywhere. No international transaction fees.",
    stat: "195+",
    statLabel: "countries",
  },
  {
    icon: Lock,
    title: "Privacy Option",
    description:
      "Customers can checkout privately. Great for sensitive product categories.",
    stat: "FHE",
    statLabel: "encryption",
  },
];

const painPoints = [
  { icon: Percent, problem: "High Fees", detail: "2.9% + $0.30 per transaction" },
  { icon: Clock, problem: "Slow Payouts", detail: "2-7 day settlement delays" },
  { icon: RotateCcw, problem: "Chargebacks", detail: "$15 fee + lost revenue" },
  { icon: Globe, problem: "International Fees", detail: "+1.5% for global customers" },
  { icon: DollarSign, problem: "Rolling Reserves", detail: "Up to 10% held back" },
];

const stats = [
  { value: "1%", label: "Flat Fee" },
  { value: "Instant", label: "Settlement" },
  { value: "0%", label: "Chargebacks" },
  { value: "195+", label: "Countries" },
];

const integrations = ["Shopify", "WooCommerce", "Next.js", "React", "Payment Links", "API"];

const comparison = [
  { feature: "Transaction Fee", stripe: "2.9% + $0.30", settlr: "1% flat" },
  { feature: "International Fee", stripe: "+1.5%", settlr: "0%" },
  { feature: "Settlement Time", stripe: "2-7 days", settlr: "Instant" },
  { feature: "Chargebacks", stripe: "$15 + lost sale", settlr: "Zero" },
  { feature: "Rolling Reserve", stripe: "Up to 10%", settlr: "None" },
  { feature: "Wallet Required", stripe: "No", settlr: "No" },
];

export default function EcommercePage() {
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
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Built for E-Commerce
                  </span>
                </div>

                <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-6xl text-balance">
                  Stop losing 30% to{" "}
                  <span className="text-primary">payment fees</span>
                </h1>

                <p className="mb-8 max-w-lg text-lg text-muted-foreground">
                  1% flat fee. Instant settlement. Zero chargebacks. Same
                  checkout UX your customers expect, powered by crypto rails.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/waitlist"
                    className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Start Saving Today
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
                    <DollarSign className="mb-3 h-7 w-7 text-primary" />
                    <div className="text-3xl font-bold text-foreground">1%</div>
                    <div className="text-sm text-muted-foreground">Flat fee</div>
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
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">Instant Settlement</span>
                  </div>
                  <p className="text-muted-foreground">
                    Get your money in 400ms, not 7 days. No rolling reserves. No holds.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <Globe className="mb-3 h-7 w-7 text-accent" />
                    <div className="text-3xl font-bold text-foreground">195+</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <Wallet className="mb-3 h-7 w-7 text-muted-foreground" />
                    <div className="text-3xl font-bold text-foreground">No</div>
                    <div className="text-sm text-muted-foreground">Wallet needed</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
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
                  <div className="text-sm text-primary-foreground/70">{stat.label}</div>
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
                Stripe & PayPal are{" "}
                <span className="text-destructive">eating your margin</span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Traditional payment processors charge excessive fees, hold your
                money, and leave you exposed to chargeback fraud.
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
                    <h3 className="mb-1 font-semibold text-foreground">{point.problem}</h3>
                    <p className="text-sm text-muted-foreground">{point.detail}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="border-t border-border px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
              Works with your stack
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-center rounded-xl border border-border bg-card p-4 text-center text-sm font-medium text-foreground transition-colors hover:border-primary/30"
                >
                  {integration}
                </motion.div>
              ))}
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
                <span className="text-sm font-medium text-primary">The Settlr Advantage</span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                Keep more of <span className="text-primary">every sale</span>
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
                      <span className="text-3xl font-bold text-foreground">{feature.stat}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{feature.statLabel}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
              Stripe vs. <span className="text-primary">Settlr</span>
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-3 border-b border-border bg-muted">
                <div className="p-4 text-sm font-medium text-muted-foreground">Feature</div>
                <div className="p-4 text-center text-sm font-medium text-muted-foreground">Stripe</div>
                <div className="p-4 text-center text-sm font-medium text-primary">Settlr</div>
              </div>
              {comparison.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${index !== comparison.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="p-4 text-foreground">{row.feature}</div>
                  <div className="p-4 text-center text-muted-foreground">{row.stripe}</div>
                  <div className="p-4 text-center font-medium text-primary">{row.settlr}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <ShoppingCart className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Ready to Save?</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Keep more of every sale
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Switch to 1% flat-fee payments and watch your margins grow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Saving Today
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
