"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDownLeft,
  ShoppingCart,
  Globe,
  Zap,
  DollarSign,
  Shield,
  Code2,
  Clock,
  RefreshCw,
  Lock,
  Check,
  Smartphone,
  Link2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

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

export default function AcceptPaymentsPage() {
  return (
    <main
      className="relative min-h-screen bg-[#FDFBF7] text-[#0C1829] antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Settlr Checkout SDK",
            serviceType: "Stablecoin checkout infrastructure",
            provider: { "@id": "https://settlr.dev/#organization" },
            url: "https://settlr.dev/accept-payments",
            description:
              "Accept USDC payments from customers with a React component or payment link. Gasless, instant settlement, subscription billing built in.",
            areaServed: "Worldwide",
            about: { "@id": "https://settlr.dev/#defined-term" },
          }),
        }}
      />

      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative isolate pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.1] px-4 py-1.5 text-[13px] text-[#1B6B4A] font-medium">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              Checkout SDK
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Accept stablecoin payments{" "}
              <span className="text-[#1B6B4A]">from your customers</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3B4963]">
              Drop a React component into your app or share a payment link.
              Customers pay in USDC — gasless, settled instantly, with
              subscription billing built in. No crypto UX, no wallet popups.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:scale-[1.02]"
              >
                Start accepting payments
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs?tab=react"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2DFD5] px-7 py-3.5 text-[15px] font-medium text-[#3B4963] hover:bg-[#F3F2ED]"
              >
                Read the docs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Two ways to accept ─── */}
      <section className="border-y border-[#E2DFD5]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#1B6B4A]">
              Integration options
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Two ways to accept USDC
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* React component */}
            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="inline-flex rounded-xl bg-emerald-500/10 p-3">
                    <Code2 className="h-5 w-5 text-[#1B6B4A]" />
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-[#1B6B4A]">
                    React
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-[#0C1829]">
                  Checkout Component
                </h3>
                <p className="mt-2 text-sm text-[#7C8A9E] leading-relaxed">
                  Drop a {`<SettlrCheckout />`} component into your React app.
                  Handles wallet connection, payment confirmation, and receipt —
                  all in your UI.
                </p>

                <pre className="mt-6 overflow-x-auto rounded-xl bg-[#08080d] border border-[#E2DFD5] p-5 font-mono text-[12px] leading-relaxed text-[#7C8A9E]">
                  {`import { SettlrCheckout } from "@settlr/sdk";

<SettlrCheckout
  merchant="your-wallet"
  amount={29.99}
  currency="USDC"
  onSuccess={(tx) => console.log(tx)}
/>`}
                </pre>
              </div>
            </Reveal>

            {/* Payment link */}
            <Reveal delay={0.12}>
              <div className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="inline-flex rounded-xl bg-[#1B6B4A]/10 p-3">
                    <Link2 className="h-5 w-5 text-[#1B6B4A]" />
                  </div>
                  <span className="rounded-full bg-[#F3F2ED] border border-[#E2DFD5] px-3 py-1 text-xs font-semibold text-[#7C8A9E]">
                    No-code
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-[#0C1829]">
                  Payment Links
                </h3>
                <p className="mt-2 text-sm text-[#7C8A9E] leading-relaxed">
                  Generate a shareable link from the dashboard. Send it to
                  customers via email, embed it on your site, or share on
                  social. No code required.
                </p>

                <div className="mt-6 rounded-xl bg-[#08080d] border border-[#E2DFD5] p-5">
                  <p className="text-xs text-[#7C8A9E] mb-2">
                    Your payment link
                  </p>
                  <div className="flex items-center gap-2 rounded-lg bg-[#F3F2ED] px-4 py-3 font-mono text-[13px] text-[#3B4963]">
                    <Globe className="h-4 w-4 flex-shrink-0 text-[#7C8A9E]" />
                    pay.settlr.dev/your-store/plan-pro
                  </div>
                  <p className="mt-3 text-xs text-[#7C8A9E]">
                    Customers click → pay USDC → you get funds instantly
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Why accept stablecoin payments ─── */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#1B6B4A]">
            Why stablecoin checkout
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Better than Stripe for stablecoin payments
          </h2>
          <p className="mt-4 max-w-xl text-[#7C8A9E] leading-relaxed">
            Traditional payment processors take 2.9% + $0.30 per transaction,
            hold funds for days, and charge extra for international cards.
            Stablecoin checkout removes all of that.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: DollarSign,
              title: "From 1% per transaction",
              text: "No interchange fees, no processor markup, no international surcharges. One flat rate.",
              color: "#34d399",
            },
            {
              icon: Zap,
              title: "Instant settlement",
              text: "Funds arrive in your wallet in under one second. No 2-day rolling holds, no reserve requirements.",
              color: "#3B82F6",
            },
            {
              icon: Shield,
              title: "No chargebacks",
              text: "Stablecoin payments are final. No disputes, no fraudulent reversals, no chargeback fees.",
              color: "#fbbf24",
            },
            {
              icon: Globe,
              title: "Accept from anywhere",
              text: "Anyone with USDC can pay — no country restrictions, no declined international cards, no FX conversion.",
              color: "#f87171",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl bg-[#08080d] p-6 transition-all duration-300 hover:bg-[#0c0c14]">
                <div
                  className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                  style={{ background: item.color }}
                />
                <div
                  className="mb-4 inline-flex rounded-xl p-2.5"
                  style={{ background: `${item.color}12` }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: item.color }}
                  />
                </div>
                <h3 className="text-[15px] font-semibold text-[#0C1829]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#7C8A9E]">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="border-y border-[#E2DFD5]/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#1B6B4A]">
              Features
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to accept stablecoin payments
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: RefreshCw,
                title: "Subscription billing",
                text: "Recurring USDC charges with automatic billing cycles. Cancel, pause, or upgrade — all via the SDK.",
              },
              {
                icon: Smartphone,
                title: "Mobile-ready",
                text: "Checkout component works on any screen size. Responsive design, touch-friendly, wallet-connect compatible.",
              },
              {
                icon: Zap,
                title: "Gasless for customers",
                text: "Buyers never see gas fees. We abstract away all blockchain complexity — it feels like paying with a card.",
              },
              {
                icon: Lock,
                title: "Private receipts",
                text: "Payment amounts hidden during processing with TEE privacy. Only you and your customer can see transaction details.",
              },
              {
                icon: ShoppingCart,
                title: "Embeddable widget",
                text: "Embed checkout directly in your product. No redirects, no third-party page, no context switch.",
              },
              {
                icon: Code2,
                title: "TypeScript SDK",
                text: "Full TypeScript support with React hooks, event callbacks, and webhook integration. Ship in an afternoon.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-2.5">
                    <item.icon className="h-5 w-5 text-[#1B6B4A]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#0C1829]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7C8A9E]">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Use cases ─── */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Who accepts payments with Settlr
          </h2>
          <p className="mt-4 text-center text-[#7C8A9E]">
            Any platform that charges customers or sells subscriptions.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "SaaS platforms",
            "E-commerce stores",
            "Membership sites",
            "Creator tip jars",
            "Digital product sales",
            "API usage billing",
          ].map((label, i) => (
            <Reveal key={label} delay={i * 0.04}>
              <div className="flex items-center gap-3 rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-4">
                <Check className="h-4 w-4 flex-shrink-0 text-[#1B6B4A]" />
                <span className="text-sm text-[#3B4963]">{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative isolate overflow-hidden border-t border-[#E2DFD5]/[0.04]">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-emerald-500/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Start accepting{" "}
              <span className="text-[#1B6B4A]">stablecoin payments</span>{" "}
              today
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#7C8A9E]">
              One React component or a payment link. Instant USDC checkout with
              subscription billing. Go live in under 30 minutes.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02]"
              >
                Start integrating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/send-payments"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] px-8 py-4 text-[15px] font-medium text-[#3B4963] hover:bg-[#F3F2ED]"
              >
                Send payments instead →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
