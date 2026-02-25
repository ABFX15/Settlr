"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import {
  Zap,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  Check,
  Gamepad2,
  Wallet,
  CreditCard,
  RefreshCw,
  Lock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Deposits",
    description:
      "Sub-second transaction finality on Solana. Players deposit and play immediately.",
  },
  {
    icon: Clock,
    title: "Fast Withdrawals",
    description:
      "Non-custodial payouts with no approval delays. Players get their winnings instantly.",
  },
  {
    icon: Shield,
    title: "Zero Chargebacks",
    description:
      "Crypto payments are irreversible. Eliminate fraud losses and disputes completely.",
  },
  {
    icon: Wallet,
    title: "No Wallet Required",
    description:
      "Players pay with email. No MetaMask, no seed phrases, no friction.",
  },
  {
    icon: CreditCard,
    title: "Fiat On-Ramp",
    description:
      "Players can buy crypto with cards through our MoonPay integration.",
  },
  {
    icon: Lock,
    title: "Player Privacy",
    description:
      "Minimal data collection. Players enjoy privacy-preserving transactions.",
  },
];

const benefits = [
  "Accept any Solana token, receive USDC",
  "No payment processor holds or freezes",
  "Global player reach without geo-restrictions",
  "Lower fees than traditional payment gateways",
  "Full API for seamless platform integration",
  "Real-time transaction webhooks",
];

const comparisonData = [
  {
    feature: "Deposit Speed",
    traditional: "1-5 days",
    settlr: "< 1 second",
  },
  {
    feature: "Withdrawal Speed",
    traditional: "3-7 days",
    settlr: "Instant",
  },
  {
    feature: "Chargebacks",
    traditional: "2-5% of volume",
    settlr: "0%",
  },
  {
    feature: "Processing Fees",
    traditional: "3-6%",
    settlr: "From 1%",
  },
  {
    feature: "Geographic Limits",
    traditional: "Restricted",
    settlr: "Global",
  },
  {
    feature: "Payment Holds",
    traditional: "Common",
    settlr: "Never",
  },
];

export default function IGamingPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#E2DFD5] bg-[#FDFBF7]/80 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <SettlrLogoWithIcon size="sm" variant="dark" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
            >
              Home
            </Link>
            <Link
              href="/docs"
              className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
            >
              Docs
            </Link>
            <Link
              href="/waitlist"
              className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
            >
              Contact
            </Link>
          </nav>
          <Link
            href="/waitlist"
            className="rounded-lg bg-[#FDFBF7] px-4 py-2 text-sm font-medium text-[#0C1829] transition-all hover:opacity-90"
          >
            Join Waitlist
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 pb-24 pt-32">
        <div className="mx-auto max-w-6xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#a78bfa]/30 bg-[#1B6B4A]/10 px-4 py-2"
          >
            <Gamepad2 className="h-4 w-4 text-[#1B6B4A]" />
            <span className="text-sm text-purple-300">Built for iGaming</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight text-[#0C1829] md:text-6xl lg:text-7xl"
          >
            <span className="bg-white bg-clip-text text-transparent">
              Zero Chargebacks.
            </span>
            <br />
            Instant Payouts.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-xl text-[#7C8A9E]"
          >
            Players pay with any crypto. You receive USDC instantly. No wallets,
            no gas, no custody risk.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FDFBF7] px-8 py-4 text-lg font-semibold text-[#0C1829] shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50"
            >
              Request Access
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#a78bfa]/50 px-8 py-4 text-lg font-semibold text-[#0C1829] transition-all hover:bg-[#F3F2ED]"
            >
              View Documentation
            </Link>
          </motion.div>
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
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              Purpose-Built for Gaming
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[#7C8A9E]">
              Every feature designed to solve real problems for iGaming
              operators
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
                className="rounded-2xl border border-[#E2DFD5] bg-[#F3F2ED] p-6 backdrop-blur-sm transition-all hover:border-[#a78bfa]/30 hover:bg-[#F3F2ED]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B6B4A]/10">
                  <feature.icon className="h-6 w-6 text-[#1B6B4A]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0C1829]">
                  {feature.title}
                </h3>
                <p className="text-[#7C8A9E]">{feature.description}</p>
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
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              vs Traditional Payment Processors
            </h2>
            <p className="text-lg text-[#7C8A9E]">
              See why crypto payments win for gaming
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-[#E2DFD5]"
          >
            <div className="grid grid-cols-3 border-b border-[#E2DFD5] bg-[#F3F2ED] p-4">
              <div className="font-semibold text-[#7C8A9E]">Feature</div>
              <div className="text-center font-semibold text-[#7C8A9E]">
                Traditional
              </div>
              <div className="text-center font-semibold text-[#1B6B4A]">
                Settlr
              </div>
            </div>
            {comparisonData.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 p-4 ${
                  index < comparisonData.length - 1
                    ? "border-b border-[#E2DFD5]"
                    : ""
                }`}
              >
                <div className="text-[#0C1829]">{row.feature}</div>
                <div className="text-center text-red-400">
                  {row.traditional}
                </div>
                <div className="text-center font-medium text-[#1B6B4A]">
                  {row.settlr}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-[#0C1829]">
                Everything You Need to Accept Crypto
              </h2>
              <p className="mb-8 text-lg text-[#7C8A9E]">
                Integrate once and start accepting payments from players
                worldwide. Players pay with SOL, BONK, JUP, or any Solana token
                - you receive USDC.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B6B4A]/15">
                      <Check className="h-4 w-4 text-[#1B6B4A]" />
                    </div>
                    <span className="text-[#3B4963]">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[#a78bfa]/20 bg-[#1B6B4A]/[0.06] p-8"
            >
              <h3 className="mb-4 text-2xl font-bold text-[#0C1829]">
                Ready to Get Started?
              </h3>
              <p className="mb-6 text-[#7C8A9E]">
                Join the waitlist for early access. We're onboarding select
                operators for our beta program.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FDFBF7] px-6 py-3 font-semibold text-[#0C1829] transition-all hover:opacity-90"
              >
                Join Waitlist
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="mt-6 flex items-center gap-4 text-sm text-[#7C8A9E]">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Limited beta spots</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Priority support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2DFD5] px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <SettlrLogoWithIcon size="sm" variant="dark" />
          </div>
          <div className="flex gap-6 text-sm text-[#7C8A9E]">
            <Link
              href="/docs"
              className="transition-colors hover:text-[#7C8A9E]"
            >
              Docs
            </Link>
            <Link
              href="/waitlist"
              className="transition-colors hover:text-[#7C8A9E]"
            >
              Contact
            </Link>
            <Link href="/" className="transition-colors hover:text-[#7C8A9E]">
              Home
            </Link>
          </div>
          <p className="text-sm text-[#7C8A9E]">
            © 2026 Settlr. Built on Solana.
          </p>
        </div>
      </footer>
    </main>
  );
}
