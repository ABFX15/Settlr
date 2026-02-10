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
    href: "https://twitter.com/settlrpay",
    external: true,
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-foreground pr-4">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
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
            <p className="px-5 pb-5 text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="px-4 pb-16 pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {"We're Here to Help"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-4 text-4xl font-bold text-foreground md:text-6xl text-balance"
            >
              Help & Support
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-xl text-lg text-muted-foreground"
            >
              Find answers to common questions or reach out to our team.
            </motion.p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 md:grid-cols-3">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                const Tag = link.external ? "a" : Link;
                const extraProps = link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {};
                return (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Tag
                      href={link.href}
                      {...extraProps}
                      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-muted"
                    >
                      <div className="rounded-lg bg-muted p-2.5 group-hover:bg-primary/10">
                        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <h3 className="flex items-center gap-1.5 font-semibold text-foreground">
                          {link.title}
                          {link.external && (
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {link.description}
                        </p>
                      </div>
                    </Tag>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-3 text-center text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mb-10 text-center text-muted-foreground">
              Browse by category to find what you need
            </p>

            {/* Category Tabs */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
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
                className="space-y-3"
              >
                {faqs[activeCategory]?.map((faq) => (
                  <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Still have questions?
            </h2>
            <p className="mb-8 text-muted-foreground">
              {"Our team is here to help. Reach out and we'll get back to you within 24 hours."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@settlr.dev"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Contact Support
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
