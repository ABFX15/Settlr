"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  Globe,
  Zap,
  DollarSign,
  Shield,
  Users,
  Clock,
  Code2,
  Lock,
  Check,
  RefreshCw,
  Database,
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

export default function SendPaymentsPage() {
  return (
    <main
      className="relative min-h-screen bg-[#050507] text-white antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Settlr Payout API",
            serviceType: "Stablecoin payout infrastructure",
            provider: { "@id": "https://settlr.dev/#organization" },
            url: "https://settlr.dev/send-payments",
            description:
              "Send USDC to anyone in 180+ countries with just their email. Instant settlement, non-custodial, from 1% per transaction.",
            areaServed: "Worldwide",
            about: { "@id": "https://settlr.dev/#defined-term" },
          }),
        }}
      />

      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative isolate pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#3B82F6]/[0.06] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/[0.1] px-4 py-1.5 text-[13px] text-[#3B82F6] font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Payout API
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Send stablecoin payments{" "}
              <span className="text-[#3B82F6]">to anyone, anywhere</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
              One API call. Recipient gets an email. USDC lands in their wallet
              in under a second. No bank details, no crypto knowledge, no
              geographic restrictions. Works in 180+ countries.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02]"
              >
                Start sending payments
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs?tab=payouts"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-[15px] font-medium text-white/70 hover:bg-white/[0.06]"
              >
                Read the docs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              How it works
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Three steps. Under a second.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Code2,
                title: "Call the API",
                text: "Send a payout with one SDK call — just an email address and an amount in USDC. We handle wallet creation, gas, and delivery.",
                code: `await settlr.payout({
  to: "worker@email.com",
  amount: 50,
  currency: "USDC"
});`,
              },
              {
                step: "02",
                icon: Mail,
                title: "Recipient gets an email",
                text: "They click a link to claim their payment. An embedded wallet is created automatically — no app download, no seed phrase, no crypto knowledge.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Settled instantly",
                text: "USDC arrives in under one second. Recipients can hold it, offramp to local currency via MoonPay or Coinbase, or transfer to any wallet.",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <span className="mb-4 block text-xs font-bold text-[#3B82F6]/60">
                    STEP {item.step}
                  </span>
                  <div className="mb-4 inline-flex rounded-xl bg-[#3B82F6]/10 p-2.5">
                    <item.icon className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    {item.text}
                  </p>
                  {item.code && (
                    <pre className="mt-4 overflow-x-auto rounded-xl bg-[#08080d] border border-white/[0.06] p-4 font-mono text-[12px] leading-relaxed text-white/50">
                      {item.code}
                    </pre>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why stablecoins ─── */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
            Why stablecoin payments
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Traditional payments are expensive, slow, and limited
          </h2>
          <p className="mt-4 max-w-xl text-white/45 leading-relaxed">
            Stablecoin payments remove the middlemen. No correspondent banks, no
            FX desks, no 3-day settlement windows. Just USDC moving from your
            platform to your recipient — instantly.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: DollarSign,
              title: "From 1% per transaction",
              text: "No wire fees ($25+), no FX markup (3-5%), no receiving fees. Stablecoin payments are radically cheaper than every alternative.",
              color: "#3B82F6",
            },
            {
              icon: Clock,
              title: "Settled in under 1 second",
              text: "Not 3-5 business days. Not 24 hours. Under one second. Recipients access funds immediately.",
              color: "#34d399",
            },
            {
              icon: Globe,
              title: "180+ countries, no restrictions",
              text: "Anywhere your recipient has an email address. No bank account required. No SWIFT codes. No geographic exclusions.",
              color: "#fbbf24",
            },
            {
              icon: Shield,
              title: "Non-custodial — we never hold funds",
              text: "Payments flow directly via on-chain smart contracts. Settlr never takes custody of your money or your recipients' money.",
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
                <h3 className="text-[15px] font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="border-y border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
              Built for scale
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need to send stablecoin payments
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mail,
                title: "Email-only delivery",
                text: "Recipients don't need wallets, apps, or bank accounts. Just an email address.",
              },
              {
                icon: Users,
                title: "Batch payouts",
                text: "Upload a CSV or use the API to send hundreds of payments at once. All settled in seconds.",
              },
              {
                icon: RefreshCw,
                title: "Recurring payments",
                text: "Set up subscription payouts that trigger automatically. Ideal for contractors and creator payments.",
              },
              {
                icon: Lock,
                title: "FHE-encrypted receipts",
                text: "Transaction amounts are encrypted on-chain using Fully Homomorphic Encryption. Only sender and recipient can see.",
              },
              {
                icon: Database,
                title: "On-chain audit trail",
                text: "Every stablecoin payment is recorded immutably. Full transparency for compliance and accounting.",
              },
              {
                icon: Zap,
                title: "Gasless for recipients",
                text: "We cover all network fees. Recipients never pay gas — stablecoin payments are free to receive.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-[#3B82F6]/10 p-2.5">
                    <item.icon className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison ─── */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Settlr vs traditional payment methods
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-6 py-4 text-left font-medium text-white/50">
                    &nbsp;
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-[#3B82F6]">
                    Settlr
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-white/50">
                    Wire Transfer
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-white/50">
                    PayPal
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-white/50">
                    Stripe Connect
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  {
                    label: "Fee",
                    settlr: "From 1%",
                    wire: "$25-50",
                    paypal: "~5%",
                    stripe: "0.25%+$0.25",
                  },
                  {
                    label: "Speed",
                    settlr: "< 1 second",
                    wire: "3-7 days",
                    paypal: "1-3 days",
                    stripe: "2-7 days",
                  },
                  {
                    label: "Countries",
                    settlr: "180+",
                    wire: "Most",
                    paypal: "~100",
                    stripe: "47",
                  },
                  {
                    label: "Bank needed",
                    settlr: "No",
                    wire: "Yes",
                    paypal: "Yes",
                    stripe: "Yes",
                  },
                  {
                    label: "Custodial",
                    settlr: "No",
                    wire: "Yes",
                    paypal: "Yes",
                    stripe: "Yes",
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="px-6 py-3 text-white/50">{row.label}</td>
                    <td className="px-6 py-3 font-medium text-[#3B82F6]">
                      {row.settlr}
                    </td>
                    <td className="px-6 py-3 text-white/40">{row.wire}</td>
                    <td className="px-6 py-3 text-white/40">{row.paypal}</td>
                    <td className="px-6 py-3 text-white/40">{row.stripe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ─── Use cases ─── */}
      <section className="border-y border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
              Who sends payments with Settlr
            </h2>
            <p className="mt-4 text-center text-white/40">
              Any platform that moves money to people globally.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Freelance marketplaces",
                link: "/industries/freelance",
              },
              {
                label: "Creator platforms",
                link: "/industries/creators",
              },
              {
                label: "Data labeling companies",
                link: "/industries/data-labeling",
              },
              {
                label: "iGaming operators",
                link: "/industries/igaming",
              },
              {
                label: "E-commerce payouts",
                link: "/industries/ecommerce",
              },
              {
                label: "B2B SaaS platforms",
                link: "/industries/b2b",
              },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.04}>
                <Link
                  href={item.link}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                  <span className="text-sm text-white/70">{item.label}</span>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-white/20" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3B82F6]/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Start sending{" "}
              <span className="text-[#3B82F6]">stablecoin payments</span> today
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              One SDK. One API call. Instant USDC payments to anyone with an
              email address. Go live in under 30 minutes.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-[#3B82F6]/25 hover:scale-[1.02]"
              >
                Start integrating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/accept-payments"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/70 hover:bg-white/[0.04]"
              >
                Accept payments instead →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
