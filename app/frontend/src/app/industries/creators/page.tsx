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
  Palette,
  Wallet,
  Lock,
  Users,
  DollarSign,
  Eye,
  Ban,
  Heart,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: Lock,
    title: "Private Payments",
    description:
      "Fans pay without revealing purchase details. FHE-encrypted receipts protect both parties.",
  },
  {
    icon: Ban,
    title: "Never Deplatformed",
    description:
      "Crypto payments can't be frozen or banned. Your revenue is yours, always.",
  },
  {
    icon: Wallet,
    title: "No Wallet Required",
    description:
      "Fans pay with email. No MetaMask, no seed phrases, no crypto knowledge needed.",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description:
      "Get your money immediately. No 7-day holds, no minimum thresholds, no waiting.",
  },
  {
    icon: DollarSign,
    title: "2% Flat Fee",
    description:
      "Lower than OnlyFans (20%), Patreon (12%), or Gumroad (10%). Keep more of what you earn.",
  },
  {
    icon: Shield,
    title: "Zero Chargebacks",
    description:
      "Blockchain payments are irreversible. No more losing revenue to disputes.",
  },
];

const painPoints = [
  {
    icon: Ban,
    title: "Platform Risk",
    description:
      "One policy change and your income disappears overnight. Stripe, PayPal, and banks can freeze your funds without warning.",
    traditional: true,
  },
  {
    icon: Eye,
    title: "Privacy Concerns",
    description:
      "Fans don't want their purchases showing up on bank statements. Creators don't want payment data leaked.",
    traditional: true,
  },
  {
    icon: DollarSign,
    title: "Massive Fees",
    description:
      "Platforms take 10-20% of your revenue. Payment processors add another 3%. You're losing a quarter of your income.",
    traditional: true,
  },
];

const comparisonData = [
  {
    feature: "Platform Fee",
    traditional: "10-20%",
    settlr: "2%",
  },
  {
    feature: "Payout Speed",
    traditional: "7-30 days",
    settlr: "Instant",
  },
  {
    feature: "Chargebacks",
    traditional: "Common",
    settlr: "Zero",
  },
  {
    feature: "Account Freezes",
    traditional: "Anytime",
    settlr: "Never",
  },
  {
    feature: "Payment Privacy",
    traditional: "Visible on statements",
    settlr: "Encrypted",
  },
  {
    feature: "Wallet Required",
    traditional: "No",
    settlr: "No",
  },
];

const useCases = [
  "Digital art & NFTs",
  "Exclusive content subscriptions",
  "Online courses & tutorials",
  "Music & audio downloads",
  "Photography & presets",
  "Private community access",
  "1-on-1 video calls",
  "Custom commissions",
];

export default function CreatorsPage() {
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
            <Palette className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">For Creators</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent">
              Keep 98%.
            </span>
            <br />
            Never Get Banned.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-xl text-gray-400"
          >
            Accept payments from fans without wallets, bank bans, or platform
            fees eating your income. Private, instant, and truly yours.
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
              Start Accepting Payments
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-500/50 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/5"
            >
              Try Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="px-4 py-24 bg-gradient-to-b from-red-500/5 to-transparent">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">
              The Creator Economy is Broken
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              You create the value. Platforms take the profit. Banks hold the
              power.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {painPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
                  <point.icon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {point.title}
                </h3>
                <p className="text-gray-400">{point.description}</p>
              </motion.div>
            ))}
          </div>
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
              Built for Creators Who Value Freedom
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Your fans pay with email. You get USDC instantly. No middleman can
              stop you.
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
            <h2 className="mb-4 text-4xl font-bold text-white">
              vs Creator Platforms
            </h2>
            <p className="text-lg text-gray-400">
              Compare Settlr to Patreon, Gumroad, and OnlyFans
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
                Traditional
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
                <div className="text-center text-red-400">
                  {row.traditional}
                </div>
                <div className="text-center font-medium text-green-400">
                  {row.settlr}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white">
                Perfect For
              </h2>
              <p className="mb-8 text-lg text-gray-400">
                Whether you're selling digital downloads, subscriptions, or
                services—Settlr handles payments so you can focus on creating.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {useCases.map((useCase, index) => (
                  <motion.div
                    key={useCase}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-sm text-gray-300">{useCase}</span>
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
                Ready to Keep More of Your Money?
              </h3>
              <p className="mb-6 text-gray-400">
                Set up payment links in minutes. No code required. Start
                accepting payments from fans worldwide.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#22d3ee] px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>No monthly fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Unlimited fans</span>
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
