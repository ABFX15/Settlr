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
  Users,
  Wallet,
  Building2,
  Lock,
  Globe,
  DollarSign,
  TrendingUp,
  X,
  Banknote,
  FileText,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: Zap,
    title: "Instant Cross-Border",
    description:
      "Receive payments from any country in seconds. No SWIFT delays.",
    stat: "Instant",
    statLabel: "settlement",
  },
  {
    icon: DollarSign,
    title: "No Wire Fees",
    description:
      "Save $25-50 per transaction. 1% flat beats wire fees every time.",
    stat: "1%",
    statLabel: "flat fee",
  },
  {
    icon: Clock,
    title: "Same-Day Settlement",
    description:
      "Get paid the moment your client pays. No 2-5 day wire delays.",
    stat: "0",
    statLabel: "days waiting",
  },
  {
    icon: Globe,
    title: "Accept From Anywhere",
    description:
      "Clients in 195+ countries can pay you. No banking restrictions.",
    stat: "195+",
    statLabel: "countries",
  },
  {
    icon: Shield,
    title: "Non-Reversible",
    description:
      "Blockchain payments are final. No payment reversals or disputes.",
    stat: "0%",
    statLabel: "reversal risk",
  },
  {
    icon: Lock,
    title: "Private Invoices",
    description: "Encrypt invoice amounts for client confidentiality.",
    stat: "PER",
    statLabel: "privacy",
  },
];

const painPoints = [
  { icon: Banknote, problem: "Wire Fees", detail: "$25-50 per transaction" },
  { icon: Clock, problem: "Slow Transfers", detail: "2-5 business days" },
  {
    icon: Globe,
    problem: "Currency Issues",
    detail: "FX markup + conversion delays",
  },
  { icon: X, problem: "Weekend Delays", detail: "No processing Sat/Sun" },
  {
    icon: DollarSign,
    problem: "Hidden Fees",
    detail: "Correspondent bank charges",
  },
];

const stats = [
  { value: "1%", label: "Flat Fee" },
  { value: "Instant", label: "Settlement" },
  { value: "24/7", label: "Processing" },
  { value: "195+", label: "Countries" },
];

const useCases = [
  { name: "Freelance Dev", icon: FileText },
  { name: "Agencies", icon: Building2 },
  { name: "Consultants", icon: Users },
  { name: "Contractors", icon: Wallet },
];

export default function B2BPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-24">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.3),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
        </div>

        {/* Floating orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-gradient-to-br from-[#22d3ee]/20 to-[#a855f7]/20 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[5%] top-[40%] h-48 w-48 rounded-full bg-gradient-to-br from-[#a855f7]/20 to-[#14F195]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-2">
            {/* Left - Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-4 py-2">
                <Users className="h-4 w-4 text-[#22d3ee]" />
                <span className="text-sm font-medium text-[#22d3ee]">
                  For B2B & Freelancers
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#0C1829] md:text-7xl">
                Skip the wire.
                <br />
                Get paid
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-[#22d3ee] via-[#a855f7] to-[#14F195] bg-clip-text text-transparent">
                    instantly.
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
                      stroke="url(#b2b-underline)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="b2b-underline"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#14F195" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </h1>

              <p className="mb-8 max-w-lg text-lg text-[#7C8A9E]">
                Ditch expensive wire transfers. Send invoices, get paid in USDC
                instantly, from clients in 195+ countries. 24/7/365.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#a855f7] px-6 py-3.5 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#22d3ee]/15"
                >
                  Get Paid Faster
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] bg-[#F3F2ED] px-6 py-3.5 font-semibold text-[#0C1829] backdrop-blur-sm transition-all hover:bg-[#F3F2ED]"
                >
                  How It Works
                </Link>
              </div>
            </motion.div>

            {/* Right - Bento-style preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid gap-4">
                {/* Top row */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#22d3ee]/20 bg-gradient-to-br from-[#22d3ee]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Zap className="mb-3 h-8 w-8 text-[#22d3ee]" />
                    <div className="text-3xl font-bold text-[#0C1829]">Instant</div>
                    <div className="text-sm text-[#7C8A9E]">Settlement</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#a855f7]/20 bg-gradient-to-br from-[#a855f7]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <DollarSign className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">1%</div>
                    <div className="text-sm text-[#7C8A9E]">vs $25+ wire</div>
                  </motion.div>
                </div>

                {/* Large card */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative overflow-hidden rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-sm"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-[#22d3ee]/20 to-transparent" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-[#22d3ee]/20 p-2">
                        <Globe className="h-6 w-6 text-[#22d3ee]" />
                      </div>
                      <span className="text-lg font-semibold text-[#0C1829]">
                        Global Payments
                      </span>
                    </div>
                    <p className="text-[#7C8A9E]">
                      Accept payments from any country. No SWIFT, no
                      correspondent banks, no currency conversion headaches.
                    </p>
                  </div>
                </motion.div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#14F195]/20 bg-gradient-to-br from-[#14F195]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Clock className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">24/7</div>
                    <div className="text-sm text-[#7C8A9E]">Processing</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Shield className="mb-3 h-8 w-8 text-[#0C1829]" />
                    <div className="text-3xl font-bold text-[#0C1829]">Final</div>
                    <div className="text-sm text-[#7C8A9E]">No reversals</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner - Bright Cyan */}
      <section className="relative bg-[#22d3ee] px-4 py-16">
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
              Wire transfers are
              <span className="text-red-500"> stuck in the past</span>
            </h2>
            <p className="mx-auto max-w-2xl text-[#7C8A9E]">
              International clients mean expensive wire fees, SWIFT delays, and
              lost weekends waiting for funds to clear.
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

      {/* Use Cases Section - White background */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-[#0C1829]">Perfect for</h2>
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
                  className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[#22d3ee]/30 bg-[#FDFBF7] p-6 text-center shadow-lg transition-all hover:border-[#22d3ee] hover:shadow-xl"
                >
                  <div className="rounded-xl bg-gradient-to-br from-[#22d3ee] to-[#a855f7] p-3">
                    <Icon className="h-6 w-6 text-[#0C1829]" />
                  </div>
                  <span className="font-medium text-[#0C1829]">{useCase.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Cyan/Purple gradient */}
      <section className="relative bg-gradient-to-br from-[#22d3ee] to-[#a855f7] px-4 py-24">
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5]/30 bg-white/10 px-4 py-2">
              <Check className="h-4 w-4 text-[#0C1829]" />
              <span className="text-sm font-medium text-[#0C1829]">Why Settlr</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              Invoice. Send link.
              <br />
              <span className="text-[#1B6B4A]">Get paid instantly.</span>
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
                      <Icon className="h-6 w-6 text-[#0C1829]" />
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

      {/* Comparison Section */}
      <section className="relative bg-[#FDFBF7] px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              Wire Transfer vs. <span className="text-[#22d3ee]">Settlr</span>
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
                Wire Transfer
              </div>
              <div className="p-4 text-center text-sm font-medium text-[#22d3ee]">
                Settlr
              </div>
            </div>

            {[
              {
                feature: "Fee Structure",
                wire: "$25-50 + FX",
                settlr: "1% flat",
              },
              {
                feature: "Settlement Time",
                wire: "2-5 days",
                settlr: "Instant",
              },
              {
                feature: "Weekend/Holiday",
                wire: "No processing",
                settlr: "24/7/365",
              },
              {
                feature: "International",
                wire: "Extra fees",
                settlr: "Same as local",
              },
              { feature: "Currency Risk", wire: "Yes", settlr: "Receive USDC" },
              {
                feature: "Tracking",
                wire: "Limited",
                settlr: "Real-time on-chain",
              },
            ].map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${
                  index !== 5 ? "border-b border-[#E2DFD5]" : ""
                }`}
              >
                <div className="p-4 text-[#0C1829]">{row.feature}</div>
                <div className="p-4 text-center text-[#7C8A9E]">{row.wire}</div>
                <div className="p-4 text-center font-medium text-[#22d3ee]">
                  {row.settlr}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#22d3ee]/10 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-4 py-2">
            <TrendingUp className="h-4 w-4 text-[#22d3ee]" />
            <span className="text-sm font-medium text-[#22d3ee]">
              Ready to get paid faster?
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-[#0C1829] md:text-5xl">
            Your clients. Your work.
            <br />
            <span className="bg-gradient-to-r from-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent">
              Your money, instantly.
            </span>
          </h2>

          <p className="mb-8 text-lg text-[#7C8A9E]">
            Join freelancers and agencies saving thousands per year on wire fees
            while getting paid faster.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/waitlist"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#a855f7] px-8 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#22d3ee]/15"
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
