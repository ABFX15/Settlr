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
  ExternalLink,
  Mail,
  Twitter,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── Reveal ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const categories = [
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "payments", label: "Payments", icon: RefreshCw },
  { id: "security", label: "Security", icon: Shield },
  { id: "refunds", label: "Refunds", icon: RefreshCw },
  { id: "integration", label: "Integration", icon: Code2 },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  "getting-started": [
    {
      q: "How do I get started with Settlr?",
      a: "Getting started is easy! Simply sign up, complete KYB verification, and you'll receive your API keys. Our SDK handles the rest — gasless payments, embedded wallets, and instant USDC settlements.",
    },
    {
      q: "Do I need any crypto knowledge?",
      a: "Not at all! Settlr abstracts away all blockchain complexity. You integrate with simple REST APIs, and your customers see a familiar payment experience — no wallets or crypto knowledge required.",
    },
    {
      q: "What currencies do you support?",
      a: "We currently support USDC on Solana. We're working on adding more stablecoins and chains based on merchant demand.",
    },
  ],
  payments: [
    {
      q: "How fast are payments settled?",
      a: "Payments are settled instantly! As soon as a customer completes a payment, the USDC arrives in your wallet — typically within 2 seconds.",
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
      a: "Security is our top priority. We use MPC wallets, never store private keys, and all transactions are verified on-chain. Funds go directly to your wallet — we never custody your money.",
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
      a: "Refunds are initiated through our dashboard or API. The USDC is returned to the customer's original payment method — their embedded wallet or connected wallet.",
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
    href: "/docs",
    external: false,
  },
  {
    title: "Contact Support",
    description: "Get help from our team",
    icon: Mail,
    href: "mailto:support@settlr.dev",
    external: true,
  },
  {
    title: "Twitter / X",
    description: "Follow for updates",
    icon: Twitter,
    href: "https://x.com/SettlrPay",
    external: true,
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] transition-colors hover:border-[#E2DFD5]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <span className="pr-4 text-[15px] font-semibold text-[#0C1829]">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-[#7C8A9E] transition-transform ${
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
            <div className="px-6 pb-6 text-sm leading-relaxed text-[#7C8A9E]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started");

  return (
    <main className="relative min-h-screen bg-[#FDFBF7] text-[#0C1829] antialiased">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-24">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#1B6B4A]/[0.05] blur-[128px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5] bg-[#F3F2ED] px-4 py-1.5 text-[13px] text-[#3B4963]">
              <MessageCircle className="h-3.5 w-3.5" />
              We&apos;re here to help
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Help & <span className="text-[#1B6B4A]">support</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-lg text-[#7C8A9E]">
              Find answers to common questions or reach out to our team.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            const Tag = link.external ? "a" : Link;
            const extraProps = link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <Reveal key={link.title} delay={i * 0.08}>
                <Tag
                  href={link.href}
                  {...(extraProps as any)}
                  className="group flex h-full flex-col rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-7 transition-colors hover:border-[#E2DFD5] hover:bg-[#F3F2ED]"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-white/[0.05] p-2.5 self-start">
                    <Icon className="h-5 w-5 text-[#3B4963]" />
                  </div>
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[#0C1829]">
                    {link.title}
                    {link.external && (
                      <ExternalLink className="h-3.5 w-3.5 text-[#7C8A9E]" />
                    )}
                  </h3>
                  <p className="mt-2 text-sm text-[#7C8A9E]">
                    {link.description}
                  </p>
                </Tag>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-y border-[#E2DFD5]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-4xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#1B6B4A]">
              FAQ
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-3 text-base text-[#7C8A9E]">
              Browse by category to find what you need
            </p>
          </Reveal>

          {/* Category tabs */}
          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-white text-[#0C1829]"
                      : "bg-[#F3F2ED] text-[#7C8A9E] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ items */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8 space-y-4"
            >
              {faqs[activeCategory]?.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3B82F6]/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Still have <span className="text-[#1B6B4A]">questions?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#7C8A9E]">
              Our team is here to help. Reach out and we&apos;ll get back to you
              within 24 hours.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="mailto:support@settlr.dev"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B6B4A] px-8 py-4 text-[15px] font-semibold text-[#0C1829] shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Contact support
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] px-8 py-4 text-[15px] font-medium text-[#3B4963] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829]"
              >
                Try demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
