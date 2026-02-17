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
    title: "Creator Platform Store",
    description:
      "Full checkout experience with fan subscriptions, creator tiers, and instant USDC payment.",
    href: "/demo/store",
    icon: Play,
    color: "#3B82F6",
    cta: "Try Demo",
  },
  {
    title: "Quick Checkout",
    description:
      "Skip straight to the checkout flow. See a $9.99 USDC fan subscription payment in action.",
    href: "/checkout?amount=9.99&merchant=FanVault&to=DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV&memo=Creator%20Subscription",
    icon: Zap,
    color: "#3B82F6",
    cta: "Try Checkout",
  },
  {
    title: "Create Payment Link",
    description:
      "Generate a shareable payment link for tips, purchases, or creator payouts.",
    href: "/create",
    icon: LinkIcon,
    color: "#3B82F6",
    cta: "Create Link",
  },
  {
    title: "SDK Documentation",
    description:
      "Integrate checkout and payouts into your creator platform with our SDK.",
    href: "/docs",
    icon: Code2,
    color: "#3B82F6",
    cta: "View Docs",
  },
];

const features = [
  "No wallet required",
  "Zero gas fees",
  "Instant settlement",
  "No content restrictions",
];

export default function DemoPage() {
  const [showPrivateExplorer, setShowPrivateExplorer] = useState(true);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#050507]">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-32">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#050507] to-transparent" />
          </div>

          {/* Ambient glow */}
          <div className="absolute right-[15%] top-[25%] h-64 w-64 rounded-full bg-[#3B82F6]/[0.07] blur-[100px]" />
          <div className="absolute left-[10%] top-[35%] h-48 w-48 rounded-full bg-[#3B82F6]/[0.05] blur-[100px]" />

          <div className="relative mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-white/60">
                Interactive Demo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl"
            >
              Try Settlr <span className="text-[#3B82F6]">Live</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-lg text-white/50"
            >
              See how fans subscribe and pay creators with USDC — no wallet
              needed, no gas fees, no card network restrictions.
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
                  <Check className="h-4 w-4 text-[#3B82F6]" />
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
                        <p className="mb-6 text-white/50">{card.description}</p>

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

        {/* Privacy Section */}
        <section className="relative px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2">
                <Shield className="h-4 w-4 text-[#3B82F6]" />
                <span className="text-sm font-medium text-white/60">
                  Inco Lightning FHE Encryption
                </span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                See the Privacy Difference
              </h2>
              <p className="mx-auto max-w-xl text-white/50">
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
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
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
              className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
            >
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-xl font-semibold text-white">
                  What you&apos;ll see on Solscan
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrivateExplorer(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      !showPrivateExplorer
                        ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                        : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08]"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    Public
                  </button>
                  <button
                    onClick={() => setShowPrivateExplorer(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      showPrivateExplorer
                        ? "bg-[#3B82F6]/20 text-[#3B82F6] ring-2 ring-[#3B82F6]"
                        : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08]"
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
                <div className="mt-6 rounded-xl bg-[#3B82F6]/10 p-4">
                  <p className="text-sm text-[#3B82F6]">
                    <strong>✓ Privacy protected:</strong> The actual amount is
                    encrypted using Inco Lightning&apos;s Fully Homomorphic
                    Encryption. Only the customer and merchant can decrypt it.
                  </p>
                </div>
              )}
              {!showPrivateExplorer && (
                <div className="mt-6 rounded-xl bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-400">
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
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8"
            >
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-semibold text-white">
                    Powered by Kora Gasless
                  </h3>
                  <p className="text-white/50">
                    Fans pay only USDC — no SOL needed for transaction fees. We
                    cover the gas so checkout is seamless and friction-free for
                    every fan and creator.
                  </p>
                </div>
                <Link
                  href="/docs?tab=quickstart"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#050507] transition-all hover:bg-white/90"
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B82F6]/[0.05] to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Ready to integrate?
            </h2>
            <p className="mb-8 text-white/50">
              Add checkout and payouts to your creator platform in minutes. One
              SDK, no card network gatekeeping.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-[#050507] transition-all hover:bg-white/90"
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
