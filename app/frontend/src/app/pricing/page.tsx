"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Building2, Rocket, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── Reveal helper ─── */
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
    a: "We cover all gas fees for your customers. They only pay the transaction amount — no SOL required.",
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
    <main className="relative min-h-screen bg-[#FDFBF7] text-[#0C1829] antialiased">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-24">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#1B6B4A]/[0.06] blur-[128px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5] bg-[#F3F2ED] px-4 py-1.5 text-[13px] text-[#3B4963]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1B6B4A]" />
              No hidden fees
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Simple, transparent{" "}
              <span className="text-[#1B6B4A]">pricing</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-lg text-[#7C8A9E]">
              No monthly charges. Just pay per transaction. Start accepting
              stablecoin payments today.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <Reveal key={plan.name} delay={i * 0.08}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-8 transition-colors ${
                    plan.popular
                      ? "border-[#3B82F6]/30 bg-[#1B6B4A]/[0.04]"
                      : "border-[#E2DFD5] bg-white/[0.02] hover:border-[#E2DFD5]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[#1B6B4A] px-4 py-1 text-xs font-semibold text-[#0C1829]">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="mb-4 inline-flex rounded-xl bg-white/[0.05] p-2.5">
                      <Icon className="h-5 w-5 text-[#3B4963]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0C1829]">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#7C8A9E]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-[#0C1829]">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-sm text-[#7C8A9E]">
                      {plan.priceSubtext}
                    </span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-[#7C8A9E]"
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-[#1B6B4A]" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition-all ${
                      plan.popular
                        ? "bg-white text-[#0C1829] hover:bg-[#F3F2ED]"
                        : "border border-[#E2DFD5] text-[#3B4963] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-y border-[#E2DFD5]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-3xl px-6 py-28">
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

          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.06}>
                <div className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6">
                  <h4 className="text-[15px] font-semibold text-[#0C1829]">
                    {faq.q}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#7C8A9E]">
                    {faq.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3B82F6]/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Ready to start accepting
              <br />
              <span className="text-[#1B6B4A]">stablecoin payments?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#7C8A9E]">
              Join merchants already using Settlr for instant, gasless USDC
              payments.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1B6B4A] px-8 py-4 text-[15px] font-semibold text-[#0C1829] shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
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
