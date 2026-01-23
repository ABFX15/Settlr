"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Zap,
  DollarSign,
  Clock,
  Check,
  Copy,
  Play,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  X,
  Globe,
  Wallet,
  Shield,
  AlertTriangle,
  TrendingDown,
  Ban,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

// Savings Calculator component
function SavingsCalculator() {
  const [volume, setVolume] = useState(10000);
  const [avgTransaction, setAvgTransaction] = useState(100);

  // Calculate fees
  const transactions = Math.round(volume / avgTransaction);

  // Stripe: 2.9% + $0.30 per transaction
  const stripeFee = volume * 0.029 + transactions * 0.3;

  // Wire fees: ~$35 per transaction (for B2B)
  const wireFee = transactions * 35;

  // PayPal: 2.9% + $0.30 (same as Stripe, but often holds funds)
  const paypalFee = volume * 0.029 + transactions * 0.3;

  // Settlr: 1% flat
  const settlrFee = volume * 0.01;

  // Savings
  const stripeSavings = stripeFee - settlrFee;
  const wireSavings = wireFee - settlrFee;
  const paypalSavings = paypalFee - settlrFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent p-8"
    >
      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Monthly Payment Volume
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
              $
            </span>
            <input
              type="text"
              value={formatNumber(volume)}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/,/g, "")) || 0;
                setVolume(Math.min(val, 10000000));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <input
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full mt-4 accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$1K</span>
            <span>$500K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Average Transaction Size
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
              $
            </span>
            <input
              type="text"
              value={formatNumber(avgTransaction)}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/,/g, "")) || 1;
                setAvgTransaction(Math.max(1, Math.min(val, 100000)));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <input
            type="range"
            min="10"
            max="5000"
            step="10"
            value={avgTransaction}
            onChange={(e) => setAvgTransaction(parseInt(e.target.value))}
            className="w-full mt-4 accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$10</span>
            <span>$5,000</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-8" />

      {/* Results Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* vs Stripe */}
        <div className="bg-white/5 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-400 mb-2">
            vs Stripe (2.9% + $0.30)
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">
            {formatCurrency(stripeSavings)}
          </div>
          <div className="text-xs text-gray-500">saved per month</div>
          <div className="mt-3 text-xs text-gray-400">
            Stripe: {formatCurrency(stripeFee)} → Settlr:{" "}
            {formatCurrency(settlrFee)}
          </div>
        </div>

        {/* vs Wire */}
        <div className="bg-white/5 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-400 mb-2">
            vs Wire Transfers (~$35/tx)
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">
            {formatCurrency(wireSavings)}
          </div>
          <div className="text-xs text-gray-500">saved per month</div>
          <div className="mt-3 text-xs text-gray-400">
            Wire: {formatCurrency(wireFee)} → Settlr:{" "}
            {formatCurrency(settlrFee)}
          </div>
        </div>

        {/* vs PayPal */}
        <div className="bg-white/5 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-400 mb-2">
            vs PayPal (2.9% + $0.30)
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">
            {formatCurrency(paypalSavings)}
          </div>
          <div className="text-xs text-gray-500">saved per month</div>
          <div className="mt-3 text-xs text-gray-400">
            + No 21-day holds on new accounts
          </div>
        </div>
      </div>

      {/* Annual Savings Callout */}
      <motion.div
        initial={{ scale: 0.95 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="text-center p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30"
      >
        <div className="text-lg text-gray-300 mb-2">
          Annual Savings vs Stripe
        </div>
        <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {formatCurrency(stripeSavings * 12)}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Based on {formatNumber(transactions)} transactions/month at{" "}
          {formatCurrency(avgTransaction)} avg
        </div>
      </motion.div>
    </motion.div>
  );
}

// Comparison table component
function ComparisonTable() {
  const comparisonData = [
    {
      feature: "Custody Model",
      competitor: { value: "Custodial", isNegative: true },
      settlr: { value: "Non-Custodial", isPositive: true },
    },
    {
      feature: "Settlement Time",
      competitor: { value: "1-2 days", isNegative: true },
      settlr: { value: "Instant", isPositive: true },
    },
    {
      feature: "Transaction Fees",
      competitor: { value: "1%", isNegative: false },
      settlr: { value: "From 1%", isPositive: true },
    },
    {
      feature: "Chargebacks",
      competitor: { value: "Yes", isNegative: true },
      settlr: { value: "Zero", isPositive: true },
    },
    {
      feature: "Wallet Required",
      competitor: { value: "Yes", isNegative: true },
      settlr: { value: "No", isPositive: true },
    },
    {
      feature: "Gas Fees",
      competitor: { value: "User pays", isNegative: true },
      settlr: { value: "We Cover It", isPositive: true },
    },
    {
      feature: "KYC Required",
      competitor: { value: "Heavy", isNegative: true },
      settlr: { value: "Simple", isPositive: true },
    },
    {
      feature: "Embedded Wallets",
      competitor: { value: "No", isNegative: true },
      settlr: { value: "Yes", isPositive: true },
    },
    {
      feature: "Payment Token",
      competitor: { value: "Limited tokens", isNegative: true },
      settlr: { value: "Any Solana token", isPositive: true },
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* White/Light Background for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 px-4">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-center text-5xl font-bold text-gray-900 md:text-6xl"
          >
            Why Developers Choose Settlr
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16 text-center text-xl text-gray-600 max-w-2xl mx-auto"
          >
            See how we stack up against traditional crypto payment solutions
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="overflow-hidden rounded-2xl border"
            style={{
              borderColor: "rgba(139, 92, 246, 0.3)",
              backgroundColor: "white",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Table Header */}
            <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 p-6">
              <div className="text-lg font-semibold text-gray-600">Feature</div>
              <div className="text-center text-lg font-semibold text-gray-500">
                BitPay
              </div>
              <div className="text-center text-lg font-semibold">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #a855f7, #22d3ee)",
                  }}
                >
                  Settlr
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div>
              {comparisonData.map((row, index) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    backgroundColor: "rgba(139, 92, 246, 0.05)",
                  }}
                  className="grid grid-cols-3 items-center border-b border-gray-100 p-6 transition-colors duration-300 last:border-b-0"
                >
                  {/* Feature Name */}
                  <div className="text-base font-medium text-gray-700">
                    {row.feature}
                  </div>

                  {/* BitPay Column */}
                  <div className="flex items-center justify-center gap-2">
                    {row.competitor.isNegative && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                        <X className="h-3 w-3 text-red-500" />
                      </div>
                    )}
                    <span
                      className={
                        row.competitor.isNegative
                          ? "text-red-500"
                          : "text-gray-500"
                      }
                    >
                      {row.competitor.value}
                    </span>
                  </div>

                  {/* Settlr Column */}
                  <div className="flex items-center justify-center gap-2">
                    {row.settlr.isPositive && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                    )}
                    <span className="font-semibold text-green-600">
                      {row.settlr.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Vibrant Product Showcase Section (like PayRam's lime green section)
function ProductShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Email Checkout",
      description:
        "Customers pay with just their email. No wallet downloads, no seed phrases, no friction.",
      highlight: "No Wallet Required",
    },
    {
      title: "Instant Settlement",
      description:
        "Funds arrive in your wallet the moment customers pay. No holds, no delays.",
      highlight: "Same-Second Settlement",
    },
    {
      title: "Multi-Token Accept",
      description:
        "Accept SOL, USDC, BONK, JUP, or any Solana token. We convert to USDC automatically.",
      highlight: "Any Token → USDC",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Bright Accent Background - Like PayRam's lime green */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee] via-[#06b6d4] to-[#0891b2]" />

      {/* Decorative Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.3) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative Shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Experience Settlr <span className="italic">in action</span>
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            See how our checkout works with real-time interactions
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Browser Mockup with Checkout UI */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Browser Chrome */}
            <div className="bg-[#1a1a2e] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              {/* Browser Top Bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#0f0f1a] border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-md px-4 py-1 text-sm text-white/50 flex items-center gap-2">
                    <span className="text-green-400">🔒</span>
                    checkout.settlr.io
                  </div>
                </div>
              </div>

              {/* Checkout UI Mockup */}
              <div className="p-6 bg-gradient-to-b from-[#0a0a0f] to-[#12121a]">
                {/* Merchant Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    S
                  </div>
                  <div>
                    <div className="text-white font-semibold">Demo Store</div>
                    <div className="text-gray-400 text-sm">
                      Premium Subscription
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-1">
                    $49.99
                  </div>
                  <div className="text-gray-400 text-sm">Monthly Plan</div>
                </div>

                {/* Email Input */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Email
                  </label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-white">customer@email.com</span>
                  </div>
                </div>

                {/* Token Selector */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    Pay with
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "USDC", color: "#2775CA", active: true },
                      { name: "SOL", color: "#9945FF", active: false },
                      { name: "BONK", color: "#F7931A", active: false },
                    ].map((token) => (
                      <div
                        key={token.name}
                        className={`py-2 px-3 rounded-lg border text-center text-sm font-medium transition-all ${
                          token.active
                            ? "bg-purple-500/20 border-purple-500 text-white"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: token.color }}
                        />
                        {token.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pay Button */}
                <motion.button
                  className="w-full py-4 rounded-xl font-semibold text-white shadow-lg"
                  style={{
                    background: "linear-gradient(to right, #a855f7, #22d3ee)",
                  }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Pay $49.99 →
                </motion.button>

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  Secured by Settlr • Powered by Solana
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-2 shadow-xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Payment Complete!
                  </div>
                  <div className="text-xs text-gray-500">Settled in 0.4s</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Feature Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`p-6 rounded-2xl transition-all cursor-pointer ${
                  activeFeature === index
                    ? "bg-white/20 backdrop-blur-sm"
                    : "bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => setActiveFeature(index)}
                whileHover={{ x: 10 }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      activeFeature === index
                        ? "bg-white text-cyan-600"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {feature.title}
                      </h3>
                      {activeFeature === index && (
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                          {feature.highlight}
                        </span>
                      )}
                    </div>
                    <p
                      className={`transition-all ${
                        activeFeature === index
                          ? "text-white/90"
                          : "text-white/60"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Navigation Dots */}
            <div className="flex items-center justify-center gap-3 pt-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeFeature === index
                      ? "bg-white w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Developer Love Section with warm accent background
function DeveloperLove() {
  const testimonials = [
    {
      quote:
        "Integrated Settlr in under 10 minutes. My users love paying with their favorite tokens.",
      author: "Indie Dev",
      role: "Building on Solana",
      avatar: "🚀",
      color: "#f59e0b",
    },
    {
      quote:
        "Finally, a payment solution that actually understands Web3. No more Stripe headaches.",
      author: "Founder",
      role: "DeFi Startup",
      avatar: "⚡",
      color: "#8b5cf6",
    },
    {
      quote:
        "The email-based checkout is genius. Conversion went up 40% after switching.",
      author: "Store Owner",
      role: "NFT Marketplace",
      avatar: "💎",
      color: "#22d3ee",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Warm Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />

      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-yellow-300/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Developers <span className="italic">love</span> Settlr
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join hundreds of builders shipping crypto payments the easy way
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: testimonial.color }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-white/60">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              <p className="text-white/90 text-lg leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Floating Orb Component
function FloatingOrb({
  className,
  color,
  size = "400px",
  delay = 0,
}: {
  className?: string;
  color: string;
  size?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// Stats Counter Section
function StatsSection() {
  const stats = [
    { value: "$2M+", label: "Payment Volume", sublabel: "Processed securely" },
    { value: "10K+", label: "Transactions", sublabel: "Zero chargebacks" },
    { value: "50+", label: "Countries", sublabel: "Global coverage" },
    { value: "<1s", label: "Settlement", sublabel: "Instant finality" },
  ];

  return (
    <section className="relative z-10 py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />

      {/* Decorative Lines */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              >
                {stat.value}
              </motion.div>
              <div className="mt-2 text-white font-semibold">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Solana Gradient Hero Section */}
      <section
        className="relative min-h-screen pb-40"
        style={{
          background:
            "linear-gradient(135deg, #00D4FF 0%, #14F195 30%, #9945FF 70%, #E42575 100%)",
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-72 h-72 bg-[#9945FF]/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#14F195]/20 rounded-full blur-3xl" />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Unified Navbar */}
        <Navbar variant="light" />

        {/* Hero Content - Two Column Layout */}
        <div className="relative z-10 flex min-h-screen items-center px-4 pt-20">
          <div className="mx-auto max-w-7xl w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Main Headline */}
                <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl text-white">
                  CRYPTO PAYMENTS
                  <br />
                  <span className="italic font-black">MADE SIMPLE.</span>
                </h1>

                {/* Description */}
                <p className="text-xl text-white/90 md:text-2xl max-w-xl">
                  The world&apos;s first email-based crypto checkout. Your
                  customers pay with any token. You receive USDC. Instantly.
                </p>

                {/* Feature List */}
                <div className="flex flex-wrap gap-4">
                  {[
                    "No wallet required",
                    "1% flat fees",
                    "Instant settlement",
                    "Zero chargebacks",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span className="text-white font-medium text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Install Command */}
                <div className="flex items-center gap-2 max-w-md">
                  <div className="flex-1 bg-black/80 backdrop-blur rounded-lg px-4 py-3 font-mono text-sm text-white flex items-center gap-2 overflow-hidden">
                    <span className="text-[#14F195]">npm</span>
                    <span className="text-gray-400">install</span>
                    <span className="text-[#00D4FF]">@settlr/sdk</span>
                  </div>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText("npm install @settlr/sdk")
                    }
                    className="bg-[#9945FF] hover:bg-[#7c37cc] text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/onboarding"
                    className="group relative overflow-hidden rounded-xl px-8 py-4 text-lg font-semibold text-[#9945FF] bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <span className="flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>

                  <Link
                    href="/demo/store"
                    className="rounded-xl border-2 border-white/50 bg-white/10 backdrop-blur px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                  >
                    View Demo
                  </Link>
                </div>
              </motion.div>

              {/* Right Column - Dashboard Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                {/* Floating Phone Mockup */}
                <motion.div
                  className="absolute -left-8 bottom-10 z-20"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="bg-black rounded-[2rem] p-2 shadow-2xl border border-white/20">
                    <div className="bg-[#0a0a0f] rounded-[1.5rem] w-48 h-80 p-4 overflow-hidden">
                      {/* Phone Status Bar */}
                      <div className="flex justify-between items-center text-white/60 text-xs mb-4">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 rounded-sm bg-white/60" />
                        </div>
                      </div>
                      {/* Checkout UI */}
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] mx-auto" />
                        <div className="text-center text-white text-sm font-medium">
                          Pay Demo
                        </div>
                        <div className="text-center text-white text-2xl font-bold">
                          $49.99
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-xs text-white/60">
                          customer@email.com
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="bg-[#9945FF]/30 rounded p-1.5 text-center text-[10px] text-white border border-[#9945FF]">
                            USDC
                          </div>
                          <div className="bg-white/5 rounded p-1.5 text-center text-[10px] text-white/60">
                            SOL
                          </div>
                          <div className="bg-white/5 rounded p-1.5 text-center text-[10px] text-white/60">
                            BONK
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg py-2 text-center text-white text-sm font-medium">
                          Pay Now →
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Main Dashboard Browser */}
                <div className="bg-[#1a1a2e] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  {/* Browser Chrome */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#0f0f1a] border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white/5 rounded-md px-4 py-1 text-sm text-white/50">
                        dashboard.settlr.io
                      </div>
                    </div>
                  </div>
                  {/* Dashboard Content */}
                  <div className="p-6 bg-gradient-to-b from-[#0a0a0f] to-[#12121a]">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-white font-semibold">
                          Hi, Merchant 👋
                        </div>
                        <div className="text-gray-400 text-sm">
                          Welcome back
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          $12,450
                        </div>
                        <div className="text-green-400 text-xs">
                          +23% this week
                        </div>
                      </div>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Today</div>
                        <div className="text-white font-semibold">$2,340</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Payments</div>
                        <div className="text-white font-semibold">47</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Avg</div>
                        <div className="text-white font-semibold">$49.78</div>
                      </div>
                    </div>
                    {/* Recent Transactions */}
                    <div className="text-gray-400 text-xs mb-2">
                      Recent Payments
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          email: "alex@...",
                          amount: "$99.00",
                          token: "USDC",
                          time: "2m",
                        },
                        {
                          email: "maria@...",
                          amount: "$49.99",
                          token: "SOL",
                          time: "5m",
                        },
                        {
                          email: "james@...",
                          amount: "$199.00",
                          token: "BONK",
                          time: "12m",
                        },
                      ].map((tx, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500" />
                            <span className="text-white text-sm">
                              {tx.email}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-sm font-medium">
                              {tx.amount}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {tx.token} • {tx.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Success Badge */}
                <motion.div
                  className="absolute -right-4 top-20 bg-white rounded-xl px-4 py-2 shadow-xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Payment Received!
                      </div>
                      <div className="text-xs text-gray-500">$99.00 • 0.4s</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping Purple "Ship in 5 mins" Card - Bridges hero and WHITE section */}
      <div className="relative z-30 -mt-48">
        {/* This div creates the overlapping effect - matches hero gradient exactly */}
        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(135deg, #00D4FF 0%, #14F195 30%, #9945FF 70%, #E42575 100%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-4 py-12"
        >
          <div className="mx-auto max-w-5xl">
            <div className="bg-[#9945FF] rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
              {/* Decorative Shape */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#14F195]/30 to-transparent" />
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#14F195]/20 rounded-full blur-3xl" />

              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left - Text */}
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    <span className="text-[#14F195]">Ship</span> payments
                    <br />
                    in 5 minutes
                  </h3>
                  <p className="text-white/80 text-lg mb-6">
                    Drop in our SDK and start accepting crypto. No complex
                    setup, no blockchain expertise needed.
                  </p>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right - Code Snippet */}
                <div className="bg-black/40 backdrop-blur rounded-xl p-4 font-mono text-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2">checkout.tsx</span>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="text-[#f97316]">import</span>{" "}
                      <span className="text-[#fb923c]">
                        {"{ SettlrButton }"}
                      </span>{" "}
                      <span className="text-[#f97316]">from</span>{" "}
                      <span className="text-[#22c55e]">
                        &apos;@settlr/sdk&apos;
                      </span>
                    </div>
                    <div className="text-gray-500">
                      {"// That's it. Really."}
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-400">{"<"}</span>
                      <span className="text-[#60a5fa]">SettlrButton</span>{" "}
                      <span className="text-[#fb923c]">amount</span>
                      <span className="text-gray-400">=</span>
                      <span className="text-[#22c55e]">{"{9.99}"}</span>{" "}
                      <span className="text-gray-400">{"/>"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* White Section with Professional Cards - Like PayRam */}
      <section className="bg-white py-20">
        {/* Industry Category Bar */}
        <div className="mx-auto max-w-5xl px-4 mb-12">
          <div className="flex items-center justify-center gap-8 overflow-x-auto pb-4">
            <div className="flex items-center gap-2 text-[#14F195] font-semibold whitespace-nowrap">
              <span className="text-lg">We</span>
              <span className="text-lg italic">Empower</span>
            </div>
            {[
              { icon: "💜", label: "Creators", active: false },
              { icon: "🏪", label: "Marketplace", active: true },
              { icon: "🛒", label: "E-Commerce", active: false },
              { icon: "🎮", label: "iGaming", active: false },
            ].map((item) => (
              <Link
                key={item.label}
                href={`/industries/${item.label
                  .toLowerCase()
                  .replace("-", "")}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  item.active
                    ? "text-gray-900 font-semibold"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Headline */}
        <div className="mx-auto max-w-5xl px-4 mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
          >
            Zero waiting. Go live with payments in minutes.
          </motion.h2>
          <p className="text-xl text-gray-500 max-w-3xl">
            Launch your crypto payment gateway with Settlr. No approvals
            required, go permissionless from day one.
          </p>
        </div>

        {/* Professional Cards Grid */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Your Wallets - Dark Green */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#0d3320] rounded-2xl p-8 min-h-[400px] relative overflow-hidden"
            >
              <h3 className="text-[#14F195] text-xl font-bold mb-3">
                Your wallets. Your rules.
              </h3>
              <p className="text-gray-300 text-base mb-8 max-w-sm">
                Connect Phantom, Solflare, Backpack, and more. Settlr works with
                the wallets you already trust, without taking custody.
              </p>

              {/* Floating Wallet Badges */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="relative h-48">
                  <motion.div
                    className="absolute left-0 bottom-0 bg-[#AB9FF2] text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    👻 Phantom
                  </motion.div>
                  <motion.div
                    className="absolute left-24 bottom-16 bg-[#FC8C03] text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  >
                    ☀️ Solflare
                  </motion.div>
                  <motion.div
                    className="absolute right-0 bottom-8 bg-[#E84142] text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  >
                    🎒 Backpack
                  </motion.div>
                  <motion.div
                    className="absolute left-1/3 bottom-32 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, delay: 0.3 }}
                  >
                    💳 Any Wallet
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Every Transaction - Light/White */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-8 min-h-[400px] relative overflow-hidden"
            >
              <h3 className="text-gray-900 text-xl font-bold mb-3">
                Every transaction, accounted for.
              </h3>
              <p className="text-gray-500 text-base mb-8 max-w-sm">
                Ledger, analytics, and P&L built into your Settlr dashboard. A
                complete financial view without surrendering control.
              </p>

              {/* Dashboard Mockup */}
              <div className="space-y-4">
                {/* Chart Card */}
                <div className="bg-[#1a1a2e] rounded-xl p-4 shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white text-sm font-medium">
                      USDC 12.4K
                    </span>
                  </div>
                  <div className="h-16 flex items-end gap-1">
                    {[40, 60, 45, 80, 55, 90, 70, 85, 95, 75, 88, 92].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a2e] rounded-xl p-4">
                    <span className="text-gray-400 text-xs">Audits</span>
                    <div className="mt-2 space-y-1">
                      <div className="h-2 bg-purple-500/30 rounded w-full" />
                      <div className="h-2 bg-purple-500/30 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="bg-[#1a1a2e] rounded-xl p-4">
                    <span className="text-gray-400 text-xs">Reports</span>
                    <div className="mt-2 space-y-1">
                      <div className="h-2 bg-cyan-500/30 rounded w-full" />
                      <div className="h-2 bg-cyan-500/30 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Second Row of Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Card 3: No Waitlists - Purple */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#9945FF] to-[#7B3FE4] rounded-2xl p-8 min-h-[300px] relative overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center h-full">
                <div>
                  <h3 className="text-[#14F195] text-xl font-bold mb-3">
                    No waitlists. No approvals. Just go live.
                  </h3>
                  <p className="text-white/80 text-base mb-6">
                    Move fast, launch faster. Settlr gets your business online
                    in minutes, so you can start accepting payments
                    permissionlessly from minute one.
                  </p>
                </div>

                {/* Dashboard Preview */}
                <div className="relative">
                  <div className="bg-white rounded-xl p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-sm font-medium text-gray-900">
                        Dashboard
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="h-8 bg-gray-100 rounded" />
                        <div className="h-8 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </div>
                  {/* Checkmark Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#14F195] rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-6 h-6 text-[#0d3320]" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Accept Any Token - Cyan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#00D4FF] to-[#0891B2] rounded-2xl p-8 min-h-[300px] relative overflow-hidden"
            >
              <h3 className="text-white text-xl font-bold mb-3">
                Accept any Solana token.
              </h3>
              <p className="text-white/80 text-base mb-6 max-w-sm">
                Your customers pay with SOL, USDC, BONK, JUP, or any SPL token.
                You receive USDC. Automatic conversion, zero hassle.
              </p>

              {/* Token Badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "SOL", color: "#9945FF", icon: "◎" },
                  { name: "USDC", color: "#2775CA", icon: "$" },
                  { name: "BONK", color: "#F7931A", icon: "🐕" },
                  { name: "JUP", color: "#14F195", icon: "♃" },
                  { name: "USDT", color: "#26A17B", icon: "₮" },
                ].map((token) => (
                  <motion.div
                    key={token.name}
                    className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: token.color }}
                    >
                      {token.icon}
                    </span>
                    <span className="text-white font-medium">{token.name}</span>
                  </motion.div>
                ))}
              </div>

              {/* Arrow indicator */}
              <div className="absolute bottom-8 right-8 flex items-center gap-2 text-white/60">
                <span className="text-sm">→ You receive</span>
                <div className="bg-white text-[#0891B2] px-3 py-1 rounded-full font-bold text-sm">
                  USDC
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pink Stats Card - Bridging white and dark sections */}
      <div className="relative z-30">
        {/* This creates the overlapping effect between white and dark */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#0a0a0f]" />

        <div className="relative z-10 px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ec4899] to-[#f472b6] p-8 md:p-12 shadow-2xl"
            >
              {/* Decorative circles */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-4 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-8 rounded-full border-2 border-white/20" />
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Trusted by businesses{" "}
                  <span className="italic">worldwide</span>
                </h3>
                <p className="text-white/80 text-lg mb-8 max-w-xl">
                  Settlr empowers businesses to process payments securely and
                  efficiently, scaling effortlessly for global payment needs.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-3xl md:text-4xl font-black text-[#c8ff00] italic">
                      $2M+
                    </div>
                    <div className="text-white/60 text-sm">Value settled</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-black text-[#c8ff00] italic">
                      10,000+
                    </div>
                    <div className="text-white/60 text-sm">Transactions</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-black text-[#c8ff00] italic">
                      50+
                    </div>
                    <div className="text-white/60 text-sm">Merchants</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dark Section Below */}
      <div style={{ backgroundColor: "#0a0a0f" }}>
        {/* Floating Gradient Orbs */}
        <FloatingOrb
          className="top-20 -left-40"
          color="radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)"
          size="600px"
        />
        <FloatingOrb
          className="top-40 -right-40"
          color="radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)"
          size="500px"
          delay={2}
        />

        {/* Problem → Solution Section */}
        <section className="relative z-10 px-4 py-24 overflow-hidden">
          {/* Section Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-x-1/2" />

          <div className="mx-auto max-w-6xl relative">
            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 mb-4">
                The Problem We Solve
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Getting Paid Shouldn&apos;t Be This Hard
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                If you&apos;re a freelancer, remote worker, or creator getting
                paid internationally — you know the pain.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* The Problem - Dark card with red accents */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-2xl bg-[#1a0a0a] p-8 overflow-hidden"
              >
                {/* Red glow effect */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <span className="text-3xl">😤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-400">
                        The Problem
                      </h3>
                      <p className="text-red-400/60 text-sm">
                        What you deal with now
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        emoji: "💸",
                        text: "PayPal charges 5%+ fees on international transfers",
                        stat: "-5%",
                      },
                      {
                        emoji: "⏰",
                        text: "Bank transfers take 3-5 business days",
                        stat: "3-5 days",
                      },
                      {
                        emoji: "📉",
                        text: "Your local currency loses value while you wait",
                        stat: "-2-4%",
                      },
                      {
                        emoji: "🚫",
                        text: "Many countries can't access PayPal or Wise",
                        stat: "Blocked",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between bg-red-950/50 rounded-xl p-4 border border-red-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-gray-300 text-sm">
                            {item.text}
                          </span>
                        </div>
                        <span className="text-red-400 font-bold text-sm bg-red-500/20 px-3 py-1 rounded-full">
                          {item.stat}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* The Solution - Bright green card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-2xl bg-[#14F195] p-8 overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#9945FF]/20 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center">
                      <span className="text-3xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">
                        The Solution
                      </h3>
                      <p className="text-black/60 text-sm">
                        What Settlr gives you
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        emoji: "💵",
                        text: "Receive USDC — stable, dollar-pegged, yours instantly",
                        stat: "$1 = $1",
                      },
                      {
                        emoji: "⚡",
                        text: "Instant settlement — no waiting, no holds",
                        stat: "<1 sec",
                      },
                      {
                        emoji: "✨",
                        text: "1% flat fee — no hidden currency conversion costs",
                        stat: "Just 1%",
                      },
                      {
                        emoji: "🌍",
                        text: "Works in 180+ countries — no restrictions",
                        stat: "Global",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between bg-black/10 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-black/80 text-sm">
                            {item.text}
                          </span>
                        </div>
                        <span className="text-black font-bold text-sm bg-white/50 px-3 py-1 rounded-full">
                          {item.stat}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Use Case Callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-3">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">
                  Built for{" "}
                  <span className="text-white font-semibold">
                    digital agencies
                  </span>
                  ,{" "}
                  <span className="text-white font-semibold">
                    SaaS companies
                  </span>
                  ,{" "}
                  <span className="text-white font-semibold">
                    course creators
                  </span>
                  , and merchants who can&apos;t get approved by traditional
                  processors.
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Overlapping "Accept Any Solana Token" Card */}
        <div className="relative z-20 -mb-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-5xl"
          >
            <div className="bg-[#14F195] rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
              {/* Decorative Elements */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#9945FF]/30 rounded-full blur-2xl" />

              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    Accept <span className="text-[#9945FF]">any</span> Solana
                    token
                  </h3>
                  <p className="text-black/70 text-lg mb-6">
                    Your customers pay with their favorite token. SOL, USDC,
                    BONK, JUP, or any SPL token — we auto-convert to USDC for
                    you.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-black/60">
                    <Zap className="w-4 h-4" />
                    <span>
                      Instant conversion • No slippage • Best rates via Jupiter
                    </span>
                  </div>
                </div>

                {/* Token Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "USDC", color: "#2775CA", bg: "bg-blue-500" },
                    { name: "SOL", color: "#9945FF", bg: "bg-purple-500" },
                    { name: "BONK", color: "#F7931A", bg: "bg-orange-500" },
                    { name: "JUP", color: "#14F195", bg: "bg-green-500" },
                    { name: "USDT", color: "#26A17B", bg: "bg-emerald-500" },
                    { name: "WIF", color: "#8B5CF6", bg: "bg-violet-500" },
                  ].map((token) => (
                    <div
                      key={token.name}
                      className="bg-black/10 backdrop-blur-sm rounded-xl p-4 text-center border border-black/10 hover:bg-black/20 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 ${token.bg} rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {token.name.slice(0, 1)}
                      </div>
                      <div className="text-black font-semibold text-sm">
                        {token.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Who It's For Section - Emerald/Teal Accent */}
        <section className="relative pt-24 pb-24 overflow-hidden">
          {/* Emerald Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />

          {/* Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative Elements */}
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-cyan-300/20 rounded-full blur-3xl" />

          <div className="mx-auto max-w-6xl px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium text-white bg-white/20 border border-white/30 mb-4">
                Built For You
              </span>
              <h2 className="text-4xl font-bold text-white md:text-5xl mb-4">
                Who It&apos;s For
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Settlr is built for businesses that need reliable global
                payments without traditional banking friction.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1: Global E-commerce - Dark Green like PayRam */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl bg-[#0d3320] p-8 min-h-[420px] overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-[#14F195]/20 to-transparent rounded-tl-full" />

                <div className="relative z-10">
                  <div className="text-[#14F195] text-4xl mb-4">🌍</div>
                  <h3 className="text-[#14F195] text-xl font-bold mb-3">
                    Global E-commerce
                  </h3>
                  <p className="text-gray-300 text-sm mb-6">
                    SaaS companies, course creators, and digital sellers
                    reaching customers worldwide.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#14F195] mt-0.5 flex-shrink-0" />
                      <span>No 40% decline rates in emerging markets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#14F195] mt-0.5 flex-shrink-0" />
                      <span>Skip PayPal&apos;s 21-day holds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#14F195] mt-0.5 flex-shrink-0" />
                      <span>LatAm/Africa customers use USDC daily</span>
                    </li>
                  </ul>
                </div>

                {/* Floating wallet logos */}
                <div className="absolute bottom-6 right-6 flex gap-2">
                  {["💳", "🌐", "💰"].map((emoji, i) => (
                    <motion.div
                      key={i}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Card 2: B2B Services - White/Light with purple accents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl bg-white p-8 min-h-[420px] overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="text-[#9945FF] text-4xl mb-4">💼</div>
                  <h3 className="text-gray-900 text-xl font-bold mb-3">
                    B2B & Freelancers
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Agencies, dev shops, consultants with international clients
                    tired of wire fees.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#9945FF] mt-0.5 flex-shrink-0" />
                      <span>Same-day vs 3-5 day wires</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#9945FF] mt-0.5 flex-shrink-0" />
                      <span>1% flat vs $30-100 wire fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#9945FF] mt-0.5 flex-shrink-0" />
                      <span>No FX conversion losses</span>
                    </li>
                  </ul>
                </div>

                {/* Mini dashboard mockup */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">
                        Invoice #1042
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        Paid
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        $4,500
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="w-2 h-2 bg-[#9945FF] rounded-full" />
                        0.4s
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: High-Risk Merchants - Purple gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl p-8 min-h-[420px] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%)",
                }}
              >
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#9945FF]/30 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="text-4xl mb-4">🛡️</div>
                  <h3 className="text-white text-xl font-bold mb-3">
                    Underserved Industries
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    CBD, supplements, adult creators, crypto services — legal
                    but hard to bank.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#14F195] mt-0.5 flex-shrink-0" />
                      <span>No underwriting needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#14F195] mt-0.5 flex-shrink-0" />
                      <span>No reserve holds on funds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#14F195] mt-0.5 flex-shrink-0" />
                      <span>Zero chargebacks — payments are final</span>
                    </li>
                  </ul>
                </div>

                {/* Approval badge */}
                <motion.div
                  className="absolute bottom-6 right-6 bg-[#14F195] text-black px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Check className="w-4 h-4" />
                  Approved Instantly
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
        {/* End of "Who It's For" emerald section */}

        {/* Bridging "Go Live" Card - Overlaps between emerald and dark sections */}
        <div className="relative z-20 -mt-16 -mb-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-5xl"
          >
            <div className="bg-[#1a1a2e] rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 overflow-hidden relative">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/20 to-transparent" />
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <h3 className="text-[#14F195] text-lg font-semibold mb-2">
                    No waitlists. No approvals. Just go live.
                  </h3>
                  <p className="text-gray-400 text-lg">
                    Move fast, launch faster. Settlr gets your business online
                    in minutes, so you can start accepting payments
                    permissionlessly from minute one.
                  </p>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-sm font-medium text-white">
                      Dashboard
                    </div>
                    <div className="ml-auto">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="h-8 bg-white/5 rounded" />
                    <div className="h-8 bg-white/5 rounded" />
                    <div className="h-8 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Savings Calculator Section */}
        <section
          className="relative px-4 pt-32 pb-24 overflow-hidden"
          id="calculator"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

          <div className="mx-auto max-w-4xl relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium text-green-300 bg-green-500/10 border border-green-500/20 mb-4">
                Calculate Your Savings
              </span>
              <h2 className="text-4xl font-bold text-white md:text-5xl mb-4">
                See How Much You&apos;d Save
              </h2>
              <p className="text-xl text-gray-400">
                Enter your monthly payment volume to calculate your savings
              </p>
            </motion.div>

            <SavingsCalculator />
          </div>
        </section>

        {/* Vibrant Product Showcase - Bright accent section */}
        <ProductShowcase />

        {/* Comparison Table Section */}
        <div id="compare">
          <ComparisonTable />
        </div>

        {/* Works With Your Stack - Transition Card between white and orange */}
        <div className="relative z-30">
          {/* Top half continues white from ComparisonTable */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white" />
          {/* Bottom half is orange for DeveloperLove */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />

          <div className="relative z-10 px-4 py-16">
            <div className="mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-[#1a1a2e] rounded-2xl p-8 md:p-12 shadow-2xl border border-white/10 overflow-hidden relative">
                  {/* Decorative glow */}
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#9945FF]/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#14F195]/20 rounded-full blur-3xl" />

                  <div className="relative z-10 text-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Works with{" "}
                      <span className="text-[#14F195]">your stack</span>
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                      Drop in our SDK to any framework. TypeScript-first, fully
                      typed, zero config.
                    </p>

                    {/* Integration logos */}
                    <div className="flex flex-wrap justify-center gap-4">
                      {[
                        { name: "React", icon: "⚛️", color: "#61DAFB" },
                        { name: "Next.js", icon: "▲", color: "#ffffff" },
                        { name: "Vue", icon: "💚", color: "#42b883" },
                        { name: "Shopify", icon: "🛍️", color: "#96bf48" },
                        { name: "WordPress", icon: "📝", color: "#21759b" },
                        { name: "REST API", icon: "🔗", color: "#9945FF" },
                      ].map((integration) => (
                        <motion.div
                          key={integration.name}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="bg-white/5 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/10 flex items-center gap-3 hover:border-white/30 transition-colors"
                        >
                          <span className="text-2xl">{integration.icon}</span>
                          <span className="text-white font-medium">
                            {integration.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* npm install badge */}
                    <div className="mt-8 inline-flex items-center gap-3 bg-black/50 rounded-lg px-6 py-3 border border-white/10">
                      <span className="text-[#14F195] font-mono">npm</span>
                      <span className="text-gray-400 font-mono">install</span>
                      <span className="text-[#00D4FF] font-mono">
                        @settlr/sdk
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            "npm install @settlr/sdk",
                          )
                        }
                        className="ml-2 text-gray-500 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Developer Social Proof - Warm accent section */}
        <DeveloperLove />

        {/* Final CTA */}
        <section className="relative px-4 py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-3xl text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                  Start Getting Paid in Crypto
                </h2>
              </motion.div>
              <p className="mb-8 text-xl text-white/60">
                Your customers pay with any token. You receive USDC. Instantly.
                Non-custodially.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/onboarding"
                  className="group relative inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-purple-500/50 hover:scale-105"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #a855f7, #22d3ee)",
                  }}
                >
                  {/* Animated Ring */}
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <a
                  href="https://www.npmjs.com/package/@settlr/sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-xl border-2 border-purple-500/50 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-purple-500/10 hover:border-purple-500"
                >
                  View SDK
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  Non-Custodial
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  Instant Settlement
                </span>
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  180+ Countries
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Unified Footer */}
        <Footer />
      </div>
      {/* End of Dark Section */}

      {/* CSS Animation for Grid */}
      <style jsx global>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(80px, 80px);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </main>
  );
}
