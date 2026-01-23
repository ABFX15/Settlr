"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Building2,
  Rocket,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const plans = [
  {
    name: "Starter",
    description: "Perfect for indie developers and small projects",
    price: "1%",
    priceSubtext: "per transaction",
    icon: Zap,
    color: "#14F195",
    features: [
      "Unlimited transactions",
      "Gasless payments",
      "Embedded wallets",
      "Payment links",
      "Email support",
      "Basic analytics",
    ],
    cta: "Get Started",
    href: "/onboarding",
    popular: false,
  },
  {
    name: "Growth",
    description: "For growing businesses with higher volume",
    price: "0.75%",
    priceSubtext: "per transaction",
    icon: Rocket,
    color: "#9945FF",
    features: [
      "Everything in Starter",
      "Priority support",
      "Webhooks",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Team accounts",
    ],
    cta: "Contact Sales",
    href: "/waitlist",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions for high-volume merchants",
    price: "Custom",
    priceSubtext: "volume-based pricing",
    icon: Building2,
    color: "#00D4FF",
    features: [
      "Everything in Growth",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees",
      "Compliance tools",
      "White-label options",
      "On-chain reporting",
    ],
    cta: "Talk to Us",
    href: "/waitlist",
    popular: false,
  },
];

const faqs = [
  {
    q: "Are there any monthly fees?",
    a: "No. You only pay per transaction. There are no setup fees, monthly fees, or hidden charges.",
  },
  {
    q: "Who pays for gas fees?",
    a: "We cover all gas fees for your customers. They only pay the transaction amount - no SOL required.",
  },
  {
    q: "How fast are settlements?",
    a: "Instant. Funds are settled directly to your wallet in real-time, typically within 2 seconds.",
  },
  {
    q: "Can I try before committing?",
    a: "Yes! Try our demo with test payments. No credit card or signup required.",
  },
];

export default function PricingPage() {
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
            className="absolute right-[15%] top-[20%] h-64 w-64 rounded-full bg-gradient-to-br from-[#9945FF]/20 to-[#14F195]/20 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-[30%] h-48 w-48 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#9945FF]/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#14F195]/30 bg-[#14F195]/10 px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-[#14F195]" />
              <span className="text-sm font-medium text-[#14F195]">
                No Hidden Fees
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl"
            >
              Simple, Transparent{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00D4FF] bg-clip-text text-transparent">
                  Pricing
                </span>
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <motion.path
                    d="M2 10C40 2 160 2 198 10"
                    stroke="url(#pricing-underline)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="pricing-underline"
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
              No hidden fees. No monthly charges. Just pay per transaction.
              Start accepting crypto payments today.
            </motion.p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="relative px-4 pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-3">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative overflow-hidden rounded-2xl border p-8 transition-all ${
                      plan.popular
                        ? "border-[#9945FF]/50 bg-gradient-to-b from-[#9945FF]/10 to-transparent shadow-lg shadow-[#9945FF]/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00D4FF]" />
                    )}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] px-4 py-1 text-xs font-semibold text-white">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <div
                        className="mb-4 inline-flex rounded-xl p-3"
                        style={{ backgroundColor: `${plan.color}20` }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: plan.color }}
                        />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-5xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="ml-2 text-gray-400">
                        {plan.priceSubtext}
                      </span>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-gray-300"
                        >
                          <Check className="h-4 w-4 flex-shrink-0 text-[#14F195]" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-all ${
                        plan.popular
                          ? "bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white shadow-lg shadow-[#9945FF]/25 hover:shadow-[#9945FF]/40"
                          : "border border-white/10 text-white hover:bg-white/5"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section - White background */}
        <section className="relative bg-white px-4 py-24">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border-2 border-gray-100 bg-gray-50 p-6 transition-all hover:border-[#9945FF]/30"
                >
                  <h4 className="mb-2 font-semibold text-gray-900">{faq.q}</h4>
                  <p className="text-gray-600">{faq.a}</p>
                </motion.div>
              ))}
            </div>
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
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Ready to start accepting
              <br />
              <span className="bg-gradient-to-r from-[#14F195] to-[#00D4FF] bg-clip-text text-transparent">
                crypto payments?
              </span>
            </h2>
            <p className="mb-8 text-gray-400">
              Join hundreds of merchants already using Settlr for gasless USDC
              payments.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/onboarding"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#14F195] to-[#00D4FF] px-8 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#14F195]/25"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
