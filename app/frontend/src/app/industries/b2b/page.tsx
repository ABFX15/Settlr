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
  Users,
  Wallet,
  Building2,
  Lock,
  DollarSign,
  Banknote,
  FileText,
  Timer,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: Zap,
    title: "Instant Cross-Border",
    description:
      "Receive payments from any country in seconds. No SWIFT delays, no correspondent banks.",
  },
  {
    icon: DollarSign,
    title: "No Wire Fees",
    description:
      "Save $25-50 per transaction. At 2% flat, a $5,000 invoice costs $100 vs $50+ wire fee.",
  },
  {
    icon: Clock,
    title: "Same-Day Settlement",
    description:
      "Get paid the moment your client pays. No 2-5 day wire delays.",
  },
  {
    icon: Globe,
    title: "Accept From Anywhere",
    description:
      "Clients in 195+ countries can pay you. No banking restrictions, no currency conversion hassles.",
  },
  {
    icon: Shield,
    title: "Non-Reversible",
    description:
      "Blockchain payments are final. No payment reversals or disputed invoices.",
  },
  {
    icon: Lock,
    title: "Private Invoices",
    description:
      "Encrypt invoice amounts for client confidentiality. Great for sensitive contracts.",
  },
];

const wireComparison = [
  {
    feature: "Fee Structure",
    wire: "$25-50 flat + FX markup",
    settlr: "2% flat",
  },
  {
    feature: "Settlement Time",
    wire: "2-5 business days",
    settlr: "Instant",
  },
  {
    feature: "Weekend/Holiday",
    wire: "No processing",
    settlr: "24/7/365",
  },
  {
    feature: "International",
    wire: "Extra fees + delays",
    settlr: "Same as domestic",
  },
  {
    feature: "Currency Risk",
    wire: "Yes",
    settlr: "Receive USDC",
  },
  {
    feature: "Tracking",
    wire: "Limited",
    settlr: "Real-time on-chain",
  },
];

const useCases = [
  "Freelance developers & designers",
  "Marketing agencies",
  "Consulting firms",
  "Software contractors",
  "Remote teams & payroll",
  "International suppliers",
  "SaaS subscriptions",
  "Professional services",
];

const testimonialQuote = {
  text: "We used to lose $2,000/month on wire fees from international clients. With Settlr, our clients pay via email link, we get USDC instantly, and fees dropped 90%.",
  author: "Development Agency",
  role: "Serving clients in 12 countries",
};

export default function B2BPage() {
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
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              For B2B & Freelancers
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-[#a855f7] to-[#22d3ee] bg-clip-text text-transparent">
              Skip the Wire.
            </span>
            <br />
            Get Paid Instantly.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl text-xl text-gray-400"
          >
            International clients pay you via email link. You receive USDC in
            seconds—not days. No wire fees, no currency headaches, no banking
            hours.
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
              Send Your First Invoice
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-500/50 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/5"
            >
              See How It Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The Wire Problem */}
      <section className="px-4 py-24 bg-gradient-to-b from-red-500/5 to-transparent">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-white">
              The Wire Transfer Problem
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              You did the work. Why wait a week to get paid?
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
            >
              <Banknote className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <h3 className="mb-2 text-3xl font-bold text-white">$25-50</h3>
              <p className="text-gray-400">
                Per wire transfer (incoming + outgoing fees)
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
            >
              <Timer className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <h3 className="mb-2 text-3xl font-bold text-white">2-5 Days</h3>
              <p className="text-gray-400">To receive international payments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
            >
              <FileText className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <h3 className="mb-2 text-3xl font-bold text-white">3-5%</h3>
              <p className="text-gray-400">
                Hidden in currency conversion markups
              </p>
            </motion.div>
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
              The Modern Way to Get Paid
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Send a payment link. Client pays with email. You get USDC
              instantly.
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
              vs Wire Transfers
            </h2>
            <p className="text-lg text-gray-400">
              Why send a wire when you can send a link?
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
                Wire Transfer
              </div>
              <div className="text-center font-semibold text-purple-400">
                Settlr
              </div>
            </div>
            {wireComparison.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 p-4 ${
                  index < wireComparison.length - 1
                    ? "border-b border-white/5"
                    : ""
                }`}
              >
                <div className="text-white">{row.feature}</div>
                <div className="text-center text-red-400">{row.wire}</div>
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
                Any business receiving payments from clients abroad. Send a
                payment link, get paid in seconds.
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
              className="space-y-6"
            >
              {/* Testimonial */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="mb-4 text-lg text-gray-300 italic">
                  "{testimonialQuote.text}"
                </p>
                <div>
                  <div className="font-semibold text-white">
                    {testimonialQuote.author}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonialQuote.role}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 p-8">
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Ready to Ditch Wire Fees?
                </h3>
                <p className="mb-6 text-gray-400">
                  Create payment links in seconds. Clients pay from anywhere.
                  You get USDC instantly.
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
                    <Building2 className="h-4 w-4" />
                    <span>Works globally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Setup in 5 min</span>
                  </div>
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
