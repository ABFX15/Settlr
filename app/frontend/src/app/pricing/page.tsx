"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Building2, Rocket, ArrowRight, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for indie developers and small projects",
    price: "1%",
    priceSubtext: "per transaction",
    icon: Zap,
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

function FAQItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="font-medium text-foreground">{faq.q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-5 pb-5 text-muted-foreground">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
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
              <span className="text-sm font-medium text-primary">
                No Hidden Fees
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-4 text-4xl font-bold leading-tight text-foreground md:text-6xl text-balance"
            >
              Simple, Transparent Pricing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
            >
              No hidden fees. No monthly charges. Just pay per transaction.
            </motion.p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative rounded-2xl border p-8 transition-colors ${
                      plan.popular
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="mb-4 inline-flex rounded-xl bg-muted p-3">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mb-1 text-xl font-bold text-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-5xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        {plan.priceSubtext}
                      </span>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors ${
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} faq={faq} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Ready to start accepting crypto payments?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join merchants already using Settlr for gasless USDC payments.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/onboarding"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
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
