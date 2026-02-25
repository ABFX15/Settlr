"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Wallet,
  Lock,
  DollarSign,
  Eye,
  Ban,
  Sparkles,
  X,
  TrendingUp,
  Users,
  Globe,
  CreditCard,
  Heart,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const features = [
  {
    icon: Ban,
    title: "Can't Be Deplatformed",
    description:
      "No Visa, no Mastercard, no processor deciding what content is allowed. Stablecoins don't have content policies.",
    stat: "0",
    statLabel: "content restrictions",
  },
  {
    icon: Lock,
    title: "Private Purchases",
    description:
      "TEE-private receipts protect sensitive purchases. Your creators' revenue is nobody's business.",
    stat: "100%",
    statLabel: "private",
  },
  {
    icon: Wallet,
    title: "Email-Only Checkout",
    description:
      "Fans pay with just an email — no wallet download, no crypto UX. Embedded wallets via Privy handle everything.",
    stat: "3x",
    statLabel: "higher conversion",
  },
  {
    icon: Zap,
    title: "Instant Creator Payouts",
    description:
      "Pay creators anywhere in the world by email. No bank details, no wire fees, no 5-day ACH wait.",
    stat: "< 1s",
    statLabel: "settlement",
  },
  {
    icon: DollarSign,
    title: "1% Flat Fee",
    description:
      "Lower than Stripe + FX + chargebacks. No hidden fees, no reserves, no surprise holds.",
    stat: "1%",
    statLabel: "that's it",
  },
  {
    icon: Shield,
    title: "Zero Chargebacks",
    description:
      "Stablecoin payments are final. No disputes, no revenue clawbacks, no fraud losses.",
    stat: "0%",
    statLabel: "chargeback rate",
  },
];

const painPoints = [
  {
    icon: Ban,
    problem: "Deplatformed",
    detail: "Stripe/PayPal bans entire content categories overnight",
  },
  {
    icon: Eye,
    problem: "Revenue Exposed",
    detail: "Public transactions let competitors see your earnings",
  },
  {
    icon: DollarSign,
    problem: "5–15% Lost to Fees",
    detail: "Processing + FX + chargebacks destroy margins",
  },
  {
    icon: Clock,
    problem: "Payout Delays",
    detail: "7-day holds and rolling reserves slow creator pay",
  },
  {
    icon: Shield,
    problem: "Chargeback Fraud",
    detail: "Fans dispute after consuming content — you lose",
  },
];

const stats = [
  { value: "1%", label: "Flat Fee" },
  { value: "< 1s", label: "Settlement" },
  { value: "180+", label: "Countries" },
  { value: "$0", label: "Content Restrictions" },
];

const useCases = [
  { name: "Adult & Dating", icon: Heart },
  { name: "Fan Subscriptions", icon: Users },
  { name: "Creator Tipping", icon: DollarSign },
  { name: "Exclusive Content", icon: Lock },
];

export default function AiSaasPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-24">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
        </div>

        {/* Ambient glow */}
        <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-[#1B6B4A]/[0.07] blur-[120px]" />
        <div className="absolute left-[5%] top-[40%] h-48 w-48 rounded-full bg-[#34d399]/[0.05] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-2">
            {/* Left - Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#1B6B4A]/[0.1] px-4 py-2">
                <Sparkles className="h-4 w-4 text-[#1B6B4A]" />
                <span className="text-sm font-medium text-[#1B6B4A]">
                  Built for creator platforms
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#0C1829] md:text-7xl">
                Your platform,
                <br />
                your rules.
                <br />
                <span className="text-[#1B6B4A]">No gatekeeping.</span>
              </h1>

              <p className="mb-8 max-w-lg text-lg text-[#7C8A9E]">
                Collect payments from fans and pay out creators instantly — with
                no card network deciding what content is allowed. One SDK, 1%
                flat, instant settlement.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#1B6B4A] px-6 py-3.5 font-semibold text-[#0C1829] shadow-lg shadow-[#3B82F6]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Integrating
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/demo/store"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] bg-[#F3F2ED] px-6 py-3.5 font-semibold text-[#0C1829] backdrop-blur-sm transition-all hover:bg-[#F3F2ED]"
                >
                  See a Live Demo
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
                    className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <CreditCard className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">1%</div>
                    <div className="text-sm text-[#7C8A9E]">
                      Flat fee, always
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <Lock className="mb-3 h-8 w-8 text-[#1B6B4A]" />
                    <div className="text-3xl font-bold text-[#0C1829]">Private</div>
                    <div className="text-sm text-[#7C8A9E]">
                      Encrypted receipts
                    </div>
                  </motion.div>
                </div>

                {/* Large feature card */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative overflow-hidden rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-8 backdrop-blur-sm"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-[#3B82F6]/10 to-transparent" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-[#1B6B4A]/15 p-2">
                        <Globe className="h-6 w-6 text-[#1B6B4A]" />
                      </div>
                      <span className="text-lg font-semibold text-[#0C1829]">
                        Checkout + Payouts
                      </span>
                    </div>
                    <p className="text-[#7C8A9E]">
                      Fans pay with just an email. Creators get paid instantly
                      to 180+ countries. No bank details, no wire fees.
                    </p>
                  </div>
                </motion.div>

                {/* Bottom row - 2 cards */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <Shield className="mb-3 h-8 w-8 text-[#34d399]" />
                    <div className="text-3xl font-bold text-[#0C1829]">0%</div>
                    <div className="text-sm text-[#7C8A9E]">Chargebacks</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6 backdrop-blur-sm"
                  >
                    <Ban className="mb-3 h-8 w-8 text-[#fbbf24]" />
                    <div className="text-3xl font-bold text-[#0C1829]">Zero</div>
                    <div className="text-sm text-[#7C8A9E]">
                      Content restrictions
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative border-y border-[#E2DFD5] px-4 py-16">
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
                <div className="mb-2 text-4xl font-bold text-[#0C1829] md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-[#7C8A9E]">
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
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              Card networks control what
              <span className="text-red-400"> your creators can sell</span>
            </h2>
            <p className="mx-auto max-w-2xl text-[#7C8A9E]">
              Visa and Mastercard content policies shut down entire categories.
              Processors freeze funds, hold reserves, and charge back legitimate
              sales.
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

      {/* Use Cases Section */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-[#0C1829]">
              Built for every creator vertical
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
                  className="flex flex-col items-center gap-3 rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6 text-center transition-all hover:border-[#3B82F6]/30 hover:bg-[#F3F2ED]"
                >
                  <div className="rounded-xl bg-[#1B6B4A]/15 p-3">
                    <Icon className="h-6 w-6 text-[#1B6B4A]" />
                  </div>
                  <span className="font-medium text-[#0C1829]">{useCase.name}</span>
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#1B6B4A]/[0.06] px-4 py-2">
              <Check className="h-4 w-4 text-[#1B6B4A]" />
              <span className="text-sm font-medium text-[#1B6B4A]/80">
                Why Settlr
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              Built for platforms that
              <br />
              <span className="text-[#1B6B4A]">refuse to be silenced</span>
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
                  className="group relative rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-8 transition-all hover:border-[#E2DFD5] hover:bg-[#F3F2ED]"
                >
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-[#1B6B4A]/10 p-3">
                      <Icon className="h-6 w-6 text-[#1B6B4A]" />
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-[#0C1829]">
                        {feature.stat}
                      </span>
                      <span className="ml-2 text-sm text-[#7C8A9E]">
                        {feature.statLabel}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-[#0C1829]">
                      {feature.title}
                    </h3>
                    <p className="text-[#7C8A9E]">{feature.description}</p>
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
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              Traditional Fees vs.{" "}
              <span className="text-[#1B6B4A]">Settlr</span>
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
                Platform
              </div>
              <div className="p-4 text-center text-sm font-medium text-[#7C8A9E]">
                Their Cut
              </div>
              <div className="p-4 text-center text-sm font-medium text-[#7C8A9E]">
                Content Restrictions
              </div>
            </div>

            {[
              {
                platform: "Stripe",
                fee: "2.9%+",
                restriction: "Yes — bans adult, gambling, supplements",
              },
              {
                platform: "PayPal",
                fee: "3.5%+",
                restriction: "Yes — aggressive content policing",
              },
              {
                platform: "CCBill",
                fee: "10–15%",
                restriction: "Adult-only, high fees",
              },
              {
                platform: "Wise / PayPal Payouts",
                fee: "2–5%+ FX",
                restriction: "Limited categories, slow",
              },
            ].map((row) => (
              <div
                key={row.platform}
                className="grid grid-cols-3 border-b border-[#E2DFD5]"
              >
                <div className="p-4 text-[#0C1829]">{row.platform}</div>
                <div className="p-4 text-center text-red-400">{row.fee}</div>
                <div className="p-4 text-center text-sm text-[#7C8A9E]">
                  {row.restriction}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-3 bg-[#1B6B4A]/10">
              <div className="p-4 font-semibold text-[#1B6B4A]">Settlr</div>
              <div className="p-4 text-center font-semibold text-[#1B6B4A]">
                1%
              </div>
              <div className="p-4 text-center font-semibold text-[#1B6B4A]">
                None — stablecoins have no content policy
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3B82F6]/[0.04] to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#1B6B4A]/[0.06] px-4 py-2">
            <TrendingUp className="h-4 w-4 text-[#1B6B4A]" />
            <span className="text-sm font-medium text-[#1B6B4A]/80">
              Take back control
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-[#0C1829] md:text-5xl">
            Your platform. Your creators.
            <br />
            <span className="text-[#1B6B4A]">No card network gatekeeping.</span>
          </h2>

          <p className="mb-8 text-lg text-[#7C8A9E]">
            Join platforms that own their payment stack. Checkout + payouts in
            one SDK. No one can shut you down.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/onboarding"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#1B6B4A] px-8 py-4 font-semibold text-[#0C1829] shadow-lg shadow-[#3B82F6]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Integrating
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo/store"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] bg-[#F3F2ED] px-8 py-4 font-semibold text-[#0C1829] backdrop-blur-sm transition-all hover:bg-[#F3F2ED]"
            >
              See a Live Demo
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
