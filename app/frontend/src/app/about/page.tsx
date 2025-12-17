"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Shield,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Globe,
  Clock,
  Code,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Payments settle in under 1 second. No waiting for batch processing or bank transfers. Your money is in your wallet immediately.",
  },
  {
    icon: DollarSign,
    title: "Stablecoin Payments",
    description:
      "Accept USDC on Solana - a dollar-backed stablecoin. No crypto volatility, no currency conversion. $1 sent = $1 received.",
  },
  {
    icon: Shield,
    title: "Non-Custodial",
    description:
      "We never hold your funds. Payments go directly from your customer's wallet to yours through our smart contract. You're always in control.",
  },
  {
    icon: Wallet,
    title: "Gasless for Customers",
    description:
      "Your customers don't need SOL for gas fees. They pay a tiny USDC fee instead, making the experience seamless for crypto newcomers.",
  },
  {
    icon: Globe,
    title: "Global by Default",
    description:
      "Accept payments from anyone, anywhere in the world. No bank accounts, no borders, no restrictions. Just instant, global commerce.",
  },
  {
    icon: Code,
    title: "Developer First",
    description:
      "Simple SDK, React hooks, REST APIs, and webhooks. Integrate in 5 minutes. We handle the blockchain complexity so you don't have to.",
  },
];

const useCases = [
  {
    title: "E-commerce",
    description: "Add crypto checkout to your online store",
    examples: ["Product sales", "Digital downloads", "Subscriptions"],
  },
  {
    title: "Freelancers",
    description: "Get paid instantly by clients worldwide",
    examples: ["Invoice payments", "Milestone payments", "Retainers"],
  },
  {
    title: "SaaS",
    description: "Accept recurring payments for your software",
    examples: ["Monthly plans", "Usage-based billing", "Enterprise contracts"],
  },
  {
    title: "Marketplaces",
    description: "Power payments between buyers and sellers",
    examples: ["Escrow payments", "Split payments", "Instant payouts"],
  },
];

const stats = [
  { value: "<1s", label: "Settlement Time" },
  { value: "$0.001", label: "Transaction Cost" },
  { value: "24/7", label: "Availability" },
  { value: "0%", label: "Chargebacks" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={90}
              height={24}
              quality={100}
              className="object-contain"
            />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-[var(--text-primary)] font-medium"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Pricing
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <div className="pt-24">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#f472b6] to-[#67e8f9] bg-clip-text text-transparent">
                  Payments for the
                </span>
                <br />
                <span className="text-white">Internet Economy</span>
              </h1>
              <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-8">
                Settlr is a payment infrastructure built on Solana that lets
                businesses accept stablecoin payments instantly, globally, and
                without intermediaries.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What is Settlr */}
        <section className="py-16 px-4 bg-gradient-to-b from-transparent to-[#0d0d18]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-[#12121a] border border-white/10 rounded-2xl p-8 md:p-12"
            >
              <h2 className="text-3xl font-bold mb-6 text-white">
                What is Settlr?
              </h2>
              <div className="space-y-4 text-[var(--text-muted)] text-lg leading-relaxed">
                <p>
                  <strong className="text-white">
                    Settlr is a payment gateway for stablecoins.
                  </strong>{" "}
                  We make it easy for businesses to accept USDC payments on
                  Solana - no crypto knowledge required.
                </p>
                <p>
                  Traditional payment processors charge 2.9% + $0.30 per
                  transaction, take days to settle, and can freeze your funds at
                  any time. We're different.
                </p>
                <p>
                  With Settlr, payments settle in under 1 second, cost a
                  fraction of a cent, and go directly to your wallet. No
                  intermediaries, no delays, no permission needed.
                </p>
                <p>
                  We provide the tools - payment links, QR codes, embeddable
                  checkouts, APIs, and SDKs - so you can start accepting
                  payments in minutes, not weeks.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-[#12121a] border border-white/10 rounded-xl"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#f472b6] to-[#67e8f9] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[var(--text-muted)] text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Create Payment",
                  description:
                    "Generate a payment link, QR code, or embed our checkout widget. Takes 30 seconds.",
                },
                {
                  step: "2",
                  title: "Customer Pays",
                  description:
                    "Customer connects their wallet and pays with USDC. Gasless - they don't need SOL.",
                },
                {
                  step: "3",
                  title: "Instant Settlement",
                  description:
                    "Funds arrive in your wallet in under 1 second. That's it. No waiting, no holds.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 h-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#f472b6] to-[#67e8f9] flex items-center justify-center text-white font-bold mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[var(--text-muted)]">
                      {item.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-[var(--text-muted)]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-gradient-to-b from-[#0d0d18] to-[#0a0a12]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">
              Why Choose Settlr
            </h2>
            <p className="text-center text-[var(--text-muted)] mb-12 max-w-2xl mx-auto">
              Built for speed, security, and simplicity
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#12121a] border border-white/10 rounded-xl p-6 hover:border-[#f472b6]/30 transition-colors"
                >
                  <feature.icon className="w-10 h-10 text-[#f472b6] mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">
              Built for Every Business
            </h2>
            <p className="text-center text-[var(--text-muted)] mb-12 max-w-2xl mx-auto">
              From solo freelancers to enterprise marketplaces
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#12121a] border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-[var(--text-muted)] mb-4">
                    {useCase.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.examples.map((example) => (
                      <span
                        key={example}
                        className="px-3 py-1 bg-[#1a1a24] text-[var(--text-muted)] text-sm rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 px-4 bg-gradient-to-b from-transparent to-[#0d0d18]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Settlr vs Traditional Payments
            </h2>
            <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-4 bg-[#1a1a24] border-b border-white/10">
                <div className="font-semibold text-white"></div>
                <div className="font-semibold text-center text-[#f472b6]">
                  Settlr
                </div>
                <div className="font-semibold text-center text-[var(--text-muted)]">
                  Stripe/PayPal
                </div>
              </div>
              {[
                {
                  feature: "Settlement Time",
                  settlr: "<1 second",
                  traditional: "2-7 days",
                },
                {
                  feature: "Transaction Fee",
                  settlr: "0.5%-2%",
                  traditional: "2.9% + $0.30",
                },
                {
                  feature: "Chargebacks",
                  settlr: "None",
                  traditional: "Yes + fees",
                },
                {
                  feature: "Global Access",
                  settlr: "Anyone with wallet",
                  traditional: "Bank account required",
                },
                {
                  feature: "Fund Holds",
                  settlr: "Never",
                  traditional: "Up to 90 days",
                },
                {
                  feature: "Operating Hours",
                  settlr: "24/7/365",
                  traditional: "Business days",
                },
              ].map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 gap-4 p-4 ${
                    index % 2 === 0 ? "bg-[#12121a]" : "bg-[#15151f]"
                  }`}
                >
                  <div className="text-[var(--text-muted)]">{row.feature}</div>
                  <div className="text-center text-white font-medium">
                    {row.settlr}
                  </div>
                  <div className="text-center text-[var(--text-muted)]">
                    {row.traditional}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4 text-white">
                Ready to Get Started?
              </h2>
              <p className="text-[var(--text-muted)] text-lg mb-8 max-w-xl mx-auto">
                Start accepting stablecoin payments in minutes. No credit card
                required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f472b6] to-[#67e8f9] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Create Your First Payment
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={80}
              height={22}
              quality={100}
              className="object-contain opacity-60"
            />
            <p className="text-[var(--text-muted)] text-sm">
              © 2024 Settlr. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
