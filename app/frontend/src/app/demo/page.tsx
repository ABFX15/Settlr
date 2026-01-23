"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  PrivacyComparison,
  ExplorerPreview,
} from "@/components/ui/PrivacyBadge";
import {
  Play,
  Zap,
  Link as LinkIcon,
  Code2,
  ArrowRight,
  Shield,
  Eye,
  Sparkles,
  Check,
} from "lucide-react";
import { useState } from "react";

const demoCards = [
  {
    title: "Gaming Tournament Store",
    description:
      "Full e-commerce experience with tournament entries, deposits, and instant USDC checkout.",
    href: "/demo/store",
    icon: Play,
    color: "#9945FF",
    cta: "Try Demo",
  },
  {
    title: "Quick Checkout",
    description:
      "Skip straight to the checkout flow. See a $10 USDC payment in action.",
    href: "/checkout?amount=10.00&merchant=Arena%20GG&to=DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV&memo=Tournament%20Deposit",
    icon: Zap,
    color: "#14F195",
    cta: "Try Checkout",
  },
  {
    title: "Create Payment Link",
    description:
      "Generate a shareable payment link with custom amount and description.",
    href: "/create",
    icon: LinkIcon,
    color: "#00D4FF",
    cta: "Create Link",
  },
  {
    title: "SDK Documentation",
    description:
      "Integrate Settlr into your app with our React, Next.js, or Vue SDK.",
    href: "/docs",
    icon: Code2,
    color: "#F59E0B",
    cta: "View Docs",
  },
];

const features = [
  "No wallet required",
  "Zero gas fees",
  "Instant settlement",
  "Privacy encryption",
];

export default function DemoPage() {
  const [showPrivateExplorer, setShowPrivateExplorer] = useState(true);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0f]">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-32">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(153,69,255,0.3),transparent)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </div>

          {/* Floating orbs */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[15%] top-[25%] h-64 w-64 rounded-full bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-[35%] h-48 w-48 rounded-full bg-gradient-to-br from-[#14F195]/20 to-[#00D4FF]/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9945FF]/30 bg-[#9945FF]/10 px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-[#9945FF]" />
              <span className="text-sm font-medium text-[#9945FF]">
                Interactive Demo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl"
            >
              Try Settlr{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00D4FF] bg-clip-text text-transparent">
                  Live
                </span>
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 100 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 10C20 2 80 2 98 10"
                    stroke="url(#demo-underline)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="demo-underline"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#9945FF" />
                      <stop offset="50%" stopColor="#14F195" />
                      <stop offset="100%" stopColor="#00D4FF" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-lg text-gray-400"
            >
              Experience gasless USDC payments in action. No wallet required, no
              gas fees. See how easy it is for your customers.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
                >
                  <Check className="h-4 w-4 text-[#14F195]" />
                  <span className="text-sm text-white">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Demo Cards - Bento Grid */}
        <section className="relative px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2">
              {demoCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      href={card.href}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                      style={{
                        boxShadow: `0 0 0 0 ${card.color}00`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 60px -12px ${card.color}40`;
                        e.currentTarget.style.borderColor = `${card.color}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 0 ${card.color}00`;
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                    >
                      {/* Corner gradient */}
                      <div
                        className="absolute right-0 top-0 h-32 w-32 rounded-bl-full opacity-20 transition-opacity group-hover:opacity-40"
                        style={{
                          background: `linear-gradient(to bottom left, ${card.color}, transparent)`,
                        }}
                      />

                      <div className="relative">
                        <div
                          className="mb-6 inline-flex rounded-xl p-4"
                          style={{
                            background: `linear-gradient(135deg, ${card.color}30, ${card.color}10)`,
                          }}
                        >
                          <Icon
                            className="h-7 w-7"
                            style={{ color: card.color }}
                          />
                        </div>

                        <h2 className="mb-3 text-xl font-semibold text-white transition-colors group-hover:text-white">
                          {card.title}
                        </h2>
                        <p className="mb-6 text-gray-400">{card.description}</p>

                        <div
                          className="inline-flex items-center gap-2 font-medium transition-colors"
                          style={{ color: card.color }}
                        >
                          <span>{card.cta}</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy Section - Green accent */}
        <section className="relative bg-gradient-to-br from-[#14F195] to-[#00D4FF] px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/10 px-4 py-2">
                <Shield className="h-4 w-4 text-black" />
                <span className="text-sm font-medium text-black">
                  Inco Lightning FHE Encryption
                </span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-black md:text-5xl">
                See the Privacy Difference
              </h2>
              <p className="mx-auto max-w-xl text-black/70">
                Compare how a regular payment vs. a private receipt appears on
                Solana Explorer. With FHE encryption, the amount is never
                visible on-chain.
              </p>
            </motion.div>

            {/* Privacy Comparison Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white p-8 shadow-2xl"
            >
              <PrivacyComparison
                publicAmount="5,000,000 (5.00 USDC)"
                privateHandle="340282366920938463463374607431768211456"
                decryptedAmount="5.00 USDC"
              />
            </motion.div>

            {/* Explorer Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  What you&apos;ll see on Solscan
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrivateExplorer(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      !showPrivateExplorer
                        ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    Public
                  </button>
                  <button
                    onClick={() => setShowPrivateExplorer(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      showPrivateExplorer
                        ? "bg-[#14F195]/20 text-[#0a8a5e] ring-2 ring-[#14F195]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Private (FHE)
                  </button>
                </div>
              </div>

              <ExplorerPreview
                isPrivate={showPrivateExplorer}
                amount="5000000"
                encryptedHandle="0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c"
              />

              {showPrivateExplorer && (
                <div className="mt-6 rounded-xl bg-[#14F195]/10 p-4">
                  <p className="text-sm text-[#0a8a5e]">
                    <strong>✓ Privacy protected:</strong> The actual amount is
                    encrypted using Inco Lightning&apos;s Fully Homomorphic
                    Encryption. Only the customer and merchant can decrypt it.
                  </p>
                </div>
              )}
              {!showPrivateExplorer && (
                <div className="mt-6 rounded-xl bg-amber-100 p-4">
                  <p className="text-sm text-amber-700">
                    <strong>⚠️ Public visibility:</strong> Anyone viewing this
                    transaction on Solana Explorer can see the exact payment
                    amount.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Gasless Info Section */}
        <section className="relative px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-[#9945FF]/30 bg-gradient-to-br from-[#9945FF]/10 to-transparent p-8"
            >
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9945FF] to-[#7B2FE0]">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-semibold text-white">
                    Powered by Kora Gasless
                  </h3>
                  <p className="text-gray-400">
                    Your customers pay only USDC — no SOL needed for transaction
                    fees. We cover the gas so checkout is seamless and
                    friction-free.
                  </p>
                </div>
                <Link
                  href="/docs?tab=quickstart"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#9945FF] px-6 py-3 font-semibold text-white transition-all hover:bg-[#8035E0] hover:shadow-lg hover:shadow-[#9945FF]/25"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden px-4 py-16">
          <div className="absolute inset-0 bg-gradient-to-t from-[#9945FF]/10 to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Ready to integrate?
            </h2>
            <p className="mb-8 text-gray-400">
              Start accepting gasless USDC payments in minutes with our simple
              SDK.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#14F195] to-[#00D4FF] px-8 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#14F195]/25"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                View Documentation
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
