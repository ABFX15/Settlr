"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
  ShoppingCart,
  Wallet,
  CreditCard,
  Lock,
  Globe,
  DollarSign,
  TrendingUp,
  X,
  Percent,
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
    stat: "PER",
    statLabel: "privacy",
  },
];

const painPoints = [
  {
    icon: Percent,
    problem: "High Fees",
    detail: "2.9% + $0.30 per transaction",
  },
  { icon: Clock, problem: "Slow Payouts", detail: "2-7 day settlement delays" },
  { icon: RotateCcw, problem: "Chargebacks", detail: "$15 fee + lost revenue" },
  {
    icon: Globe,
    problem: "International Fees",
    detail: "+1.5% for global customers",
  },
  {
    icon: DollarSign,
    problem: "Rolling Reserves",
    detail: "Up to 10% held back",
  },
];

const stats = [
  { value: "1%", label: "Flat Fee" },
  { value: "Instant", label: "Settlement" },
  { value: "0%", label: "Chargebacks" },
  { value: "195+", label: "Countries" },
];

const integrations = [
  "Shopify",
  "WooCommerce",
  "Next.js",
  "React",
  "Payment Links",
  "API",
];

export default function EcommercePage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-24">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.3),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
        </div>

        {/* Floating orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-gradient-to-br from-[#a855f7]/20 to-[#14F195]/20 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[5%] top-[40%] h-48 w-48 rounded-full bg-gradient-to-br from-[#14F195]/20 to-[#a855f7]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-2">
            {/* Left - Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#a855f7]/30 bg-[#a855f7]/10 px-4 py-2">
                <ShoppingCart className="h-4 w-4 text-[#1B6B4A]" />
                <span className="text-sm font-medium text-[#1B6B4A]">
                  Built for E-Commerce
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#0C1829] md:text-7xl">
                Stop losing
                <br />
                30% to
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-[#a855f7] via-[#38bdf8] to-[#38bdf8] bg-clip-text text-transparent">
                    payment fees
                  </span>
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                  >
                    <motion.path
                      d="M2 10C50 2 150 2 298 10"
                      stroke="url(#ecom-underline)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="ecom-underline"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#14F195" />
                        <stop offset="100%" stopColor="#00D4FF" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </h1>

              <p className="mb-8 max-w-lg text-lg text-[#7C8A9E]">
                1% flat fee. Instant settlement. Zero chargebacks. Same checkout
                UX your customers expect, powered by crypto rails.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#14F195] px-6 py-3.5 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#a855f7]/15"
                >
                  Start Saving Today
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] bg-[#F3F2ED] px-6 py-3.5 font-semibold text-[#0C1829] backdrop-blur-sm transition-all hover:bg-[#F3F2ED]"
                >
                  View Documentation
                </Link>
              </div>
            </motion.div>

            {/* Right - Bento-style preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid gap-4">
                {/* Top row */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#14F195]/20 bg-gradient-to-br from-[#14F195]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <DollarSign className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">1%</div>
                    <div className="text-sm text-[#7C8A9E]">Flat fee</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#a855f7]/20 bg-gradient-to-br from-[#a855f7]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Shield className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">0%</div>
                    <div className="text-sm text-[#7C8A9E]">Chargebacks</div>
                  </motion.div>
                </div>

                {/* Large card */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative overflow-hidden rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-sm"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-[#14F195]/20 to-transparent" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-[#14F195]/20 p-2">
                        <Zap className="h-6 w-6 text-[#1B6B4A]" />
                      </div>
                      <span className="text-lg font-semibold text-[#0C1829]">
                        Instant Settlement
                      </span>
                    </div>
                    <p className="text-[#7C8A9E]">
                      Get your money in 400ms, not 7 days. No rolling reserves.
                      No holds.
                    </p>
                  </div>
                </motion.div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#00D4FF]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Globe className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">195+</div>
                    <div className="text-sm text-[#7C8A9E]">Countries</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Wallet className="mb-3 h-8 w-8 text-[#0C1829]" />
                    <div className="text-3xl font-bold text-[#0C1829]">No</div>
                    <div className="text-sm text-[#7C8A9E]">Wallet needed</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner - Bright Purple */}
      <section className="relative bg-[#a855f7] px-4 py-16">
        <div className="mx-auto max-w-7xl">
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
                <div className="mb-2 text-4xl font-bold text-[#0C1829] md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-[#0C1829]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section - White background */}
      <section className="relative overflow-hidden bg-white/[0.01] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              Stripe & PayPal are
              <span className="text-red-500"> eating your margin</span>
            </h2>
            <p className="mx-auto max-w-2xl text-[#7C8A9E]">
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
                  className="group relative overflow-hidden rounded-2xl border-2 border-red-200 bg-red-50 p-6 transition-all hover:border-red-300 hover:bg-red-100"
                >
                  <div className="absolute right-2 top-2 text-red-300">
                    <X className="h-8 w-8" />
                  </div>
                  <Icon className="mb-4 h-8 w-8 text-red-500" />
                  <h3 className="mb-2 font-semibold text-[#0C1829]">
                    {point.problem}
                  </h3>
                  <p className="text-sm text-[#7C8A9E]">{point.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative bg-white/[0.02] px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-[#0C1829]">
              Works with your stack
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center rounded-xl border-2 border-[#a855f7]/30 bg-[#FDFBF7] p-4 text-center font-medium text-[#0C1829] shadow-sm transition-all hover:border-[#a855f7] hover:shadow-lg"
              >
                {integration}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Purple gradient */}
      <section className="relative bg-gradient-to-br from-[#a855f7] to-[#7c3aed] px-4 py-24">
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5]/30 bg-white/10 px-4 py-2">
              <Check className="h-4 w-4 text-[#0C1829]" />
              <span className="text-sm font-medium text-[#0C1829]">
                The Settlr Advantage
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              Keep more of
              <br />
              <span className="text-[#1B6B4A]">every sale</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative rounded-2xl border border-[#E2DFD5] bg-white/10 p-8 backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3">
                      <Icon className="h-6 w-6 text-[#1B6B4A]" />
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-[#0C1829]">
                        {feature.stat}
                      </span>
                      <span className="ml-2 text-sm text-[#3B4963]">
                        {feature.statLabel}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-[#0C1829]">
                      {feature.title}
                    </h3>
                    <p className="text-[#0C1829]">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative bg-[#FDFBF7] px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              Stripe vs. <span className="text-[#1B6B4A]">Settlr</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-[#E2DFD5] bg-white/[0.02]"
          >
            <div className="grid grid-cols-3 border-b border-[#E2DFD5] bg-white/[0.02]">
              <div className="p-4 text-sm font-medium text-[#7C8A9E]">
                Feature
              </div>
              <div className="p-4 text-center text-sm font-medium text-[#7C8A9E]">
                Stripe
              </div>
              <div className="p-4 text-center text-sm font-medium text-[#1B6B4A]">
                Settlr
              </div>
            </div>

            {[
              {
                feature: "Transaction Fee",
                stripe: "2.9% + $0.30",
                settlr: "1% flat",
              },
              { feature: "International Fee", stripe: "+1.5%", settlr: "0%" },
              {
                feature: "Settlement Time",
                stripe: "2-7 days",
                settlr: "Instant",
              },
              {
                feature: "Chargebacks",
                stripe: "$15 + lost sale",
                settlr: "Zero",
              },
              {
                feature: "Rolling Reserve",
                stripe: "Up to 10%",
                settlr: "None",
              },
              { feature: "Wallet Required", stripe: "No", settlr: "No" },
            ].map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${
                  index !== 5 ? "border-b border-[#E2DFD5]" : ""
                }`}
              >
                <div className="p-4 text-[#0C1829]">{row.feature}</div>
                <div className="p-4 text-center text-[#7C8A9E]">
                  {row.stripe}
                </div>
                <div className="p-4 text-center font-medium text-[#1B6B4A]">
                  {row.settlr}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a855f7]/10 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5] bg-[#F3F2ED] px-4 py-2">
            <TrendingUp className="h-4 w-4 text-[#1B6B4A]" />
            <span className="text-sm font-medium text-[#1B6B4A]">
              Ready to save?
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-[#0C1829] md:text-5xl">
            Every sale,
            <br />
            <span className="bg-gradient-to-r from-[#a855f7] to-[#14F195] bg-clip-text text-transparent">
              more profit
            </span>
          </h2>

          <p className="mb-8 text-lg text-[#7C8A9E]">
            Join e-commerce stores saving thousands per month by switching to
            crypto-powered checkout.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/waitlist"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#14F195] px-8 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#a855f7]/15"
            >
              Start Saving Today
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
