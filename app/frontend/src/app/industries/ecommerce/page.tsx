"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  Check,
  ShoppingCart,
  Wallet,
  CreditCard,
  Lock,
  Users,
  DollarSign,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: DollarSign,
    title: "2% Flat Fee",
    description:
      "No per-transaction fees. No monthly minimums. Save 30%+ compared to Stripe.",
  },
  {
    icon: Shield,
    title: "Zero Chargebacks",
    description:
      "Blockchain payments are final. No more losing revenue to friendly fraud.",
  },
  {
    icon: Wallet,
    title: "No Wallet Required",
    description:
      "Customers pay with email. Same checkout UX as cards, powered by crypto.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Get your money in seconds, not days. No rolling reserves or holds.",
  },
  {
    icon: Globe,
    title: "195 Countries",
    description:
      "Accept payments from anywhere. No international transaction fees.",
  },
  {
    icon: Lock,
    title: "Privacy Option",
    description:
      "Customers can checkout privately. Great for sensitive product categories.",
  },
];

const savingsCalculation = [
  {
    volume: "$10,000/mo",
    stripeFee: "$320",
    settlrFee: "$200",
    savings: "$120",
  },
  {
    volume: "$50,000/mo",
    stripeFee: "$1,600",
    settlrFee: "$1,000",
    savings: "$600",
  },
  {
    volume: "$100,000/mo",
    stripeFee: "$3,200",
    settlrFee: "$2,000",
    savings: "$1,200",
  },
  {
    volume: "$500,000/mo",
    stripeFee: "$16,000",
    settlrFee: "$10,000",
    savings: "$6,000",
  },
];

const comparisonData = [
  {
    feature: "Transaction Fee",
    stripe: "2.9% + $0.30",
    settlr: "2% flat",
  },
  {
    feature: "International Fee",
    stripe: "+1.5%",
    settlr: "0%",
  },
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
  {
    feature: "Wallet Required",
    stripe: "No",
    settlr: "No",
  },
];

const integrations = [
  "Shopify",
  "WooCommerce",
  "React / Next.js",
  "Custom checkout",
  "Payment links",
  "API integration",
];

export default function EcommercePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      {/* Hero */}
      <section className="relative px-4 pb-24 pt-32">
        <div className="mx-auto max-w-6xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2"
          >
            <ShoppingCart className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">For E-Commerce</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent">
              Lower Fees.
            </span>
            <br />
            Zero Chargebacks.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-xl text-gray-400"
          >
            Accept payments globally at 2% flat. Customers pay with email—no
            wallets needed. Get paid instantly with zero chargeback risk.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#22d3ee] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
            >
              Start Saving Today
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-500/50 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/5"
            >
              See Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="px-4 py-24 bg-gradient-to-b from-green-500/5 to-transparent">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">
              See Your Savings
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              At 2% flat vs Stripe's 2.9% + $0.30, the savings add up fast
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-white/10"
          >
            <div className="grid grid-cols-4 border-b border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-gray-400">Volume</div>
              <div className="text-center font-semibold text-gray-400">
                Stripe
              </div>
              <div className="text-center font-semibold text-gray-400">
                Settlr
              </div>
              <div className="text-center font-semibold text-green-400">
                Savings
              </div>
            </div>
            {savingsCalculation.map((row, index) => (
              <div
                key={row.volume}
                className={`grid grid-cols-4 p-4 ${
                  index < savingsCalculation.length - 1
                    ? "border-b border-white/5"
                    : ""
                }`}
              >
                <div className="text-white font-medium">{row.volume}</div>
                <div className="text-center text-red-400">{row.stripeFee}</div>
                <div className="text-center text-gray-300">{row.settlrFee}</div>
                <div className="text-center font-bold text-green-400">
                  {row.savings}
                </div>
              </div>
            ))}
          </motion.div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Based on $50 average order value. Higher-ticket items save even
            more.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">
              Why E-Commerce Brands Choose Settlr
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Same checkout experience. Lower fees. Better economics.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-white/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                  <feature.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">vs Stripe</h2>
            <p className="text-lg text-gray-400">
              Same simplicity. Better economics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-white/10"
          >
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 p-4">
              <div className="font-semibold text-gray-400">Feature</div>
              <div className="text-center font-semibold text-gray-400">
                Stripe
              </div>
              <div className="text-center font-semibold text-purple-400">
                Settlr
              </div>
            </div>
            {comparisonData.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 p-4 ${
                  index < comparisonData.length - 1
                    ? "border-b border-white/5"
                    : ""
                }`}
              >
                <div className="text-white">{row.feature}</div>
                <div className="text-center text-red-400">{row.stripe}</div>
                <div className="text-center font-medium text-green-400">
                  {row.settlr}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integration Options */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white">
                Integrate in Minutes
              </h2>
              <p className="mb-8 text-lg text-gray-400">
                Drop-in SDK for React and Next.js. Payment links for no-code.
                Full API for custom integrations.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {integrations.map((integration, index) => (
                  <motion.div
                    key={integration}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-sm text-gray-300">{integration}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-8"
            >
              <h3 className="mb-4 text-2xl font-bold text-white">
                Ready to Cut Your Payment Costs?
              </h3>
              <p className="mb-6 text-gray-400">
                Start accepting payments in under 10 minutes. No contracts, no
                minimums, no hidden fees.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#22d3ee] px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  <span>Save 30%+ on fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  <span>Zero chargebacks</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
