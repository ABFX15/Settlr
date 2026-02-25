"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
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
  TrendingUp,
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
    stat: "PER",
    statLabel: "privacy",
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

export default function IGamingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <main className="min-h-screen bg-[#FDFBF7]" ref={containerRef}>
      <Navbar />

      {/* Hero Section - Unique asymmetric layout */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-24">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(153,69,255,0.3),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
        </div>

        {/* Floating orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-gradient-to-br from-[#a78bfa]/20 to-[#14F195]/20 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[5%] top-[40%] h-48 w-48 rounded-full bg-gradient-to-br from-[#14F195]/20 to-[#38bdf8]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-2">
            {/* Left - Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9945FF]/30 bg-[#1B6B4A]/10 px-4 py-2">
                <Gamepad2 className="h-4 w-4 text-[#9945FF]" />
                <span className="text-sm font-medium text-[#9945FF]">
                  Built for iGaming
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#0C1829] md:text-7xl">
                The payment
                <br />
                stack casinos
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-[#14F195] via-[#00D4FF] to-[#9945FF] bg-clip-text text-transparent">
                    actually deserve
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
                      stroke="url(#underline-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="underline-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#14F195" />
                        <stop offset="50%" stopColor="#00D4FF" />
                        <stop offset="100%" stopColor="#9945FF" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </h1>

              <p className="mb-8 max-w-lg text-lg text-[#7C8A9E]">
                Non-custodial crypto payments with instant deposits, instant
                withdrawals, zero chargebacks, and no payment processor can shut
                you down.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#14F195] to-[#38bdf8] px-6 py-3.5 font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#14F195]/25"
                >
                  Get Early Access
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
                    className="rounded-2xl border border-[#14F195]/20 bg-gradient-to-br from-[#14F195]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Zap className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">400ms</div>
                    <div className="text-sm text-[#7C8A9E]">Settlement time</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#9945FF]/20 bg-gradient-to-br from-[#a78bfa]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Shield className="mb-3 h-8 w-8 text-[#9945FF]" />
                    <div className="text-3xl font-bold text-[#0C1829]">0%</div>
                    <div className="text-sm text-[#7C8A9E]">Chargebacks</div>
                  </motion.div>
                </div>

                {/* Large feature card */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative overflow-hidden rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-sm"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-[#14F195]/20 to-transparent" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-[#14F195]/20 p-2">
                        <Globe className="h-6 w-6 text-[#1B6B4A]" />
                      </div>
                      <span className="text-lg font-semibold text-[#0C1829]">
                        Global Reach
                      </span>
                    </div>
                    <p className="text-[#7C8A9E]">
                      Accept payments from 150+ countries. No payment processor
                      restrictions. Crypto has no borders.
                    </p>
                  </div>
                </motion.div>

                {/* Bottom row - 2 cards */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#00D4FF]/20 bg-gradient-to-br from-[#00D4FF]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <DollarSign className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">0.5%</div>
                    <div className="text-sm text-[#7C8A9E]">Transaction fee</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Wallet className="mb-3 h-8 w-8 text-[#0C1829]" />
                    <div className="text-3xl font-bold text-[#0C1829]">No KYC</div>
                    <div className="text-sm text-[#7C8A9E]">For players</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner - Bright Green */}
      <section className="relative bg-[#14F195] px-4 py-16">
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
                <div className="mb-2 text-4xl font-bold text-black md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-black/70">
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
              Traditional payments are
              <span className="text-red-500"> broken</span>
            </h2>
            <p className="mx-auto max-w-2xl text-[#7C8A9E]">
              iGaming operators face unique challenges that traditional payment
              processors either can't or won't solve.
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

      {/* Features Section - Purple gradient background */}
      <section className="relative bg-gradient-to-br from-[#a78bfa] to-[#7B2FE0] px-4 py-24">
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
                The Settlr Solution
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              Everything you need.
              <br />
              <span className="text-[#1B6B4A]">Nothing you don't.</span>
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

      {/* Comparison Section - Clean modern table */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              Traditional vs. <span className="text-[#1B6B4A]">Settlr</span>
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
                Traditional
              </div>
              <div className="p-4 text-center text-sm font-medium text-[#1B6B4A]">
                Settlr
              </div>
            </div>

            {[
              {
                feature: "Transaction Fees",
                traditional: "3-6%",
                settlr: "0.5%",
              },
              {
                feature: "Settlement Time",
                traditional: "3-7 days",
                settlr: "Instant",
              },
              { feature: "Chargeback Risk", traditional: "2-5%", settlr: "0%" },
              {
                feature: "Geographic Limits",
                traditional: "Many",
                settlr: "None",
              },
              {
                feature: "Account Freezing",
                traditional: "Common",
                settlr: "Impossible",
              },
              {
                feature: "Player KYC",
                traditional: "Required",
                settlr: "Optional",
              },
            ].map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${
                  index !== 5 ? "border-b border-[#E2DFD5]" : ""
                }`}
              >
                <div className="p-4 text-[#0C1829]">{row.feature}</div>
                <div className="p-4 text-center text-[#7C8A9E]">
                  {row.traditional}
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9945FF]/10 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5] bg-[#F3F2ED] px-4 py-2">
            <TrendingUp className="h-4 w-4 text-[#1B6B4A]" />
            <span className="text-sm font-medium text-[#1B6B4A]">
              Ready to scale?
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-[#0C1829] md:text-5xl">
            Your players deserve
            <br />
            <span className="bg-gradient-to-r from-[#14F195] to-[#38bdf8] bg-clip-text text-transparent">
              instant everything
            </span>
          </h2>

          <p className="mb-8 text-lg text-[#7C8A9E]">
            Join forward-thinking casinos already using Settlr to eliminate
            payment friction and maximize player lifetime value.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/waitlist"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#14F195] to-[#38bdf8] px-8 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#14F195]/25"
            >
              Get Started Today
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
