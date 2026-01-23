"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book,
  MessageCircle,
  Zap,
  Shield,
  RefreshCw,
  Code2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Mail,
  Twitter,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const categories = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Zap,
    color: "#14F195",
  },
  { id: "payments", label: "Payments", icon: RefreshCw, color: "#9945FF" },
  { id: "security", label: "Security", icon: Shield, color: "#00D4FF" },
  { id: "refunds", label: "Refunds", icon: RefreshCw, color: "#f59e0b" },
  { id: "integration", label: "Integration", icon: Code2, color: "#ec4899" },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  "getting-started": [
    {
      q: "How do I get started with Settlr?",
      a: "Getting started is easy! Simply sign up, complete KYB verification, and you'll receive your API keys. Our SDK handles the rest - gasless payments, embedded wallets, and instant USDC settlements.",
    },
    {
      q: "Do I need any crypto knowledge?",
      a: "Not at all! Settlr abstracts away all blockchain complexity. You integrate with simple REST APIs, and your customers see a familiar payment experience - no wallets or crypto knowledge required.",
    },
    {
      q: "What currencies do you support?",
      a: "We currently support USDC on Solana. We're working on adding more stablecoins and chains based on merchant demand.",
    },
  ],
  payments: [
    {
      q: "How fast are payments settled?",
      a: "Payments are settled instantly! As soon as a customer completes a payment, the USDC arrives in your wallet - typically within 2 seconds.",
    },
    {
      q: "Who pays for transaction fees?",
      a: "We cover all gas fees for your customers. They only pay the transaction amount. No SOL required.",
    },
    {
      q: "Is there a minimum payment amount?",
      a: "No minimum! You can accept payments of any size. Our gasless infrastructure makes even micro-payments economically viable.",
    },
  ],
  security: [
    {
      q: "How secure is Settlr?",
      a: "Security is our top priority. We use MPC wallets, never store private keys, and all transactions are verified on-chain. Funds go directly to your wallet - we never custody your money.",
    },
    {
      q: "Is Settlr compliant?",
      a: "Yes, we maintain SOC 2 compliance and work with regulated partners. All merchants complete KYB verification to ensure a safe ecosystem.",
    },
    {
      q: "What happens if something goes wrong?",
      a: "All transactions are recorded on the Solana blockchain, providing an immutable audit trail. Our support team is available 24/7 to help with any issues.",
    },
  ],
  refunds: [
    {
      q: "How do refunds work?",
      a: "Refunds are initiated through our dashboard or API. The USDC is returned to the customer's original payment method - their embedded wallet or connected wallet.",
    },
    {
      q: "How long do refunds take?",
      a: "Refunds are processed instantly on-chain. The customer receives their USDC within seconds of you initiating the refund.",
    },
    {
      q: "Are there fees for refunds?",
      a: "We don't charge additional fees for refunds. However, the original transaction fee is non-refundable.",
    },
  ],
  integration: [
    {
      q: "How hard is it to integrate?",
      a: "Our React SDK makes integration a breeze. Most developers are up and running in under an hour. We also offer payment links for no-code solutions.",
    },
    {
      q: "Do you support webhooks?",
      a: "Yes! We support webhooks for payment confirmations, refunds, and other events. Real-time notifications keep your systems in sync.",
    },
    {
      q: "Can I customize the payment UI?",
      a: "Absolutely! Our components are fully customizable. Match your brand colors, add custom fields, or build entirely custom experiences with our headless APIs.",
    },
  ],
};

const quickLinks = [
  {
    title: "Documentation",
    description: "Comprehensive API docs and guides",
    icon: Book,
    href: "https://docs.settlr.dev",
    color: "#14F195",
  },
  {
    title: "Contact Support",
    description: "Get help from our team",
    icon: Mail,
    href: "mailto:support@settlr.dev",
    color: "#9945FF",
  },
  {
    title: "Twitter / X",
    description: "Follow for updates",
    icon: Twitter,
    href: "https://twitter.com/settlrpay",
    color: "#00D4FF",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:border-[#9945FF]/30"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 text-gray-600">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0f]">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-32">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,212,255,0.3),transparent)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </div>

          {/* Floating orbs */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[15%] top-[20%] h-64 w-64 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#9945FF]/20 blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-[30%] h-48 w-48 rounded-full bg-gradient-to-br from-[#14F195]/20 to-[#00D4FF]/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-4 py-2"
            >
              <MessageCircle className="h-4 w-4 text-[#00D4FF]" />
              <span className="text-sm font-medium text-[#00D4FF]">
                We&apos;re Here to Help
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl"
            >
              Help &{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#00D4FF] via-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                  Support
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
                    stroke="url(#help-underline)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="help-underline"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#00D4FF" />
                      <stop offset="50%" stopColor="#9945FF" />
                      <stop offset="100%" stopColor="#14F195" />
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
              Find answers to common questions or reach out to our team.
            </motion.p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="relative px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.title}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/5"
                  >
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${link.color}10, transparent 70%)`,
                      }}
                    />
                    <div className="relative">
                      <div
                        className="mb-4 inline-flex rounded-xl p-3"
                        style={{ backgroundColor: `${link.color}20` }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: link.color }}
                        />
                      </div>
                      <h3 className="mb-2 flex items-center gap-2 font-bold text-white">
                        {link.title}
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      </h3>
                      <p className="text-sm text-gray-400">
                        {link.description}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section - White background */}
        <section className="relative bg-white px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Browse by category to find what you need
              </p>
            </motion.div>

            {/* Category Tabs */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeCategory === cat.id
                        ? "bg-[#9945FF] text-white shadow-lg shadow-[#9945FF]/25"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* FAQ Items */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-4"
              >
                {faqs[activeCategory]?.map((faq) => (
                  <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="relative overflow-hidden px-4 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D4FF]/10 to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#00D4FF]/20 to-[#9945FF]/20 p-4">
              <Sparkles className="h-8 w-8 text-[#00D4FF]" />
            </div>
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              Still have{" "}
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#14F195] bg-clip-text text-transparent">
                questions?
              </span>
            </h2>
            <p className="mb-8 text-gray-400">
              Our team is here to help. Reach out and we&apos;ll get back to you
              within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@settlr.dev"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#14F195] px-8 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#00D4FF]/25"
              >
                Contact Support
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
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
