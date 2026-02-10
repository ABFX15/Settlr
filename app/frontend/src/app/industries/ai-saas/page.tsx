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
  Palette,
  Wallet,
  Lock,
  DollarSign,
  Eye,
  Ban,
  Heart,
  Sparkles,
  X,
  TrendingUp,
  Users,
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
    icon: Eye,
    problem: "Revenue Exposure",
    detail: "On-chain totals visible to competitors",
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

const useCases = [
  { name: "AI APIs", icon: Zap },
  { name: "SaaS Subscriptions", icon: Users },
  { name: "Usage-Based Billing", icon: DollarSign },
  { name: "Global Customers", icon: Wallet },
];

export default function AiSaasPage() {
  return (
    <main className="min-h-screen bg-[#050507]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-24">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(167,139,250,0.2),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#050507] to-transparent" />
        </div>

        {/* Ambient glow */}
        <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-[#a78bfa]/[0.07] blur-[120px]" />
        <div className="absolute left-[5%] top-[40%] h-48 w-48 rounded-full bg-[#38bdf8]/[0.05] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-2">
            {/* Left - Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
                <Sparkles className="h-4 w-4 text-[#a78bfa]" />
                <span className="text-sm font-medium text-white/60">
                  Built for AI/SaaS founders
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
                Launch payments
                <br />
                even if Stripe
                <br />
                <span className="bg-gradient-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
                  says no.
                </span>
              </h1>

              <p className="mb-8 max-w-lg text-lg text-white/50">
                Accept private, gasless USDC payments and subscriptions in
                minutes. One SDK, instant payouts, and a 1% flat fee.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#050507] transition-all hover:bg-white/90"
                >
                  Start Accepting USDC
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  See How It Works
                </Link>
              </div>
            </motion.div>

            {/* Right - Bento-style feature preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid gap-4">
                {/* Top row - 2 cards */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <DollarSign className="mb-3 h-8 w-8 text-[#38bdf8]" />
                    <div className="text-3xl font-bold text-white">1%</div>
                    <div className="text-sm text-white/50">
                      Flat fee, always
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <Lock className="mb-3 h-8 w-8 text-[#a78bfa]" />
                    <div className="text-3xl font-bold text-white">Private</div>
                    <div className="text-sm text-white/50">
                      Customer transactions
                    </div>
                  </motion.div>
                </div>

                {/* Large feature card */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-[#a78bfa]/10 to-transparent" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-[#a78bfa]/20 p-2">
                        <Zap className="h-6 w-6 text-[#38bdf8]" />
                      </div>
                      <span className="text-lg font-semibold text-white">
                        Instant Payouts
                      </span>
                    </div>
                    <p className="text-white/50">
                      Get paid the moment a subscription starts. No waiting
                      weeks. No minimum thresholds. Your money, instantly.
                    </p>
                  </div>
                </motion.div>

                {/* Bottom row - 2 cards */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <Shield className="mb-3 h-8 w-8 text-[#a78bfa]" />
                    <div className="text-3xl font-bold text-white">0%</div>
                    <div className="text-sm text-white/50">Chargebacks</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <Ban className="mb-3 h-8 w-8 text-white" />
                    <div className="text-3xl font-bold text-white">Can't</div>
                    <div className="text-sm text-white/50">Be blocked</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative border-y border-white/[0.06] px-4 py-16">
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
                <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-white/40">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Processors can block your revenue
              <span className="text-red-400"> without warning</span>
            </h2>
            <p className="mx-auto max-w-2xl text-white/40">
              Traditional payment processors add fees, hold funds, and can
              freeze accounts when your growth spikes.
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
                  className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6 transition-all hover:border-red-500/30 hover:bg-red-500/[0.08]"
                >
                  <div className="absolute right-2 top-2 text-red-500/30">
                    <X className="h-8 w-8" />
                  </div>
                  <Icon className="mb-4 h-8 w-8 text-red-400" />
                  <h3 className="mb-2 font-semibold text-white">
                    {point.problem}
                  </h3>
                  <p className="text-sm text-white/40">{point.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-white">
              Perfect for AI/SaaS
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={useCase.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all hover:border-[#a78bfa]/30 hover:bg-white/[0.04]"
                >
                  <div className="rounded-xl bg-[#a78bfa]/20 p-3">
                    <Icon className="h-6 w-6 text-[#a78bfa]" />
                  </div>
                  <span className="font-medium text-white">{useCase.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-24">
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
              <Check className="h-4 w-4 text-[#a78bfa]" />
              <span className="text-sm font-medium text-white/60">
                Why Settlr
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Built for teams who
              <br />
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
                need reliable payments
              </span>
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
                  whileHover={{ y: -5 }}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-[#a78bfa]/10 p-3">
                      <Icon className="h-6 w-6 text-[#a78bfa]" />
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">
                        {feature.stat}
                      </span>
                      <span className="ml-2 text-sm text-white/40">
                        {feature.statLabel}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/50">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">
              Processor Fees vs. <span className="text-[#38bdf8]">Settlr</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
          >
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.02]">
              <div className="p-4 text-sm font-medium text-white/50">
                Platform
              </div>
              <div className="p-4 text-center text-sm font-medium text-white/50">
                Their Cut
              </div>
              <div className="p-4 text-center text-sm font-medium text-white/50">
                You Keep
              </div>
            </div>

            {[
              { platform: "Stripe (blocked)", fee: "2.9%+", keep: "97%" },
              { platform: "Paddle", fee: "5%+", keep: "95%" },
              { platform: "Lemon Squeezy", fee: "5%+", keep: "95%" },
              { platform: "PayPal", fee: "3.5%+", keep: "96%" },
            ].map((row, index) => (
              <div
                key={row.platform}
                className="grid grid-cols-3 border-b border-white/5"
              >
                <div className="p-4 text-white">{row.platform}</div>
                <div className="p-4 text-center text-red-400">{row.fee}</div>
                <div className="p-4 text-center text-white/50">{row.keep}</div>
              </div>
            ))}
            <div className="grid grid-cols-3 bg-[#a78bfa]/10">
              <div className="p-4 font-semibold text-[#a78bfa]">Settlr</div>
              <div className="p-4 text-center font-semibold text-[#a78bfa]">
                1%
              </div>
              <div className="p-4 text-center font-semibold text-[#a78bfa]">
                98%
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#a78bfa]/[0.05] to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
            <TrendingUp className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-sm font-medium text-white/60">
              Take back control
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Your product. Your users.
            <br />
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
              Your revenue.
            </span>
          </h2>

          <p className="mb-8 text-lg text-white/50">
            Join founders who ship global payments without processor risk. No
            one can freeze your growth.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/waitlist"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-[#050507] transition-all hover:bg-white/90"
            >
              Start Accepting USDC
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
