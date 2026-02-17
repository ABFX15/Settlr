"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  Globe,
  Clock,
  DollarSign,
  Mail,
  Shield,
  Zap,
  Users,
  Check,
  AlertTriangle,
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

export default function DataLabelingPage() {
  return (
    <main
      className="relative min-h-screen bg-[#050507] text-white antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <Navbar />

      {/* Hero */}
      <section className="relative isolate pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#3B82F6]/[0.06] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/[0.1] px-4 py-1.5 text-[13px] text-[#3B82F6] font-medium">
              <Database className="h-3.5 w-3.5" />
              AI Data Labeling
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Pay your annotation workforce{" "}
              <span className="text-[#3B82F6]">by email, instantly</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
              Your annotators are in the Philippines, Kenya, India, Venezuela.
              PayPal takes 5-8% of their already-low wages. Wires cost $25 each
              and take a week. Settlr lets you pay everyone by email — 1% flat,
              settled in under a second, works in 180+ countries.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02]"
              >
                Start integrating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo/store"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-[15px] font-medium text-white/70 hover:bg-white/[0.06]"
              >
                See live demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-red-400">
              The problem you know too well
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Paying annotators globally is a nightmare
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: DollarSign,
                title: "5-8% eaten by PayPal",
                text: "Cross-border fees + FX + withdrawal fees. Workers already earning $2-5/hr lose even more.",
              },
              {
                icon: Globe,
                title: "Countries unsupported",
                text: "Venezuela, Pakistan, Bangladesh — your biggest worker pools have the worst payout options.",
              },
              {
                icon: Clock,
                title: "Weeks to settle",
                text: "Wire transfers take 5-7 days. Workers wait. Some stop working entirely.",
              },
              {
                icon: AlertTriangle,
                title: "PR risk growing",
                text: "Public criticism of data labeling payment practices is increasing. Worker forums are vocal.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-5">
                  <item.icon className="mb-3 h-5 w-5 text-red-400" />
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6]">
            The Settlr solution
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Email an amount. Worker gets paid. Done.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "Email-only payouts",
              text: "No bank details, no crypto wallets, no KYC forms for workers. Enter email + amount, we handle everything.",
            },
            {
              icon: Zap,
              title: "Instant settlement",
              text: "Payouts settle in under 1 second on Solana. Workers can access funds immediately — no holds, no delays.",
            },
            {
              icon: Globe,
              title: "180+ countries",
              text: "Philippines, Kenya, India, Venezuela, Bangladesh — everywhere your annotators are, Settlr works.",
            },
            {
              icon: DollarSign,
              title: "1% flat fee",
              text: "No FX markup, no wire fees, no hidden charges. Save 80%+ versus PayPal on international payouts.",
            },
            {
              icon: Users,
              title: "Bulk payouts via CSV or API",
              text: "Pay hundreds of annotators in one batch. Upload a CSV or call the API. All settled in seconds.",
            },
            {
              icon: Shield,
              title: "Non-custodial",
              text: "Funds flow via smart contracts. We never hold your money. Full on-chain audit trail.",
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
      </section>

      {/* Comparison */}
      <section className="border-y border-white/[0.04]">
        <div className="mx-auto max-w-4xl px-6 py-28">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
              Settlr vs. what you&apos;re using today
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.06]">
              <div className="grid grid-cols-4 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="p-4 text-xs font-medium text-white/40" />
                <div className="p-4 text-center text-xs font-semibold text-white/40">
                  PayPal
                </div>
                <div className="p-4 text-center text-xs font-semibold text-white/40">
                  Wire
                </div>
                <div className="p-4 text-center text-xs font-semibold text-[#3B82F6]">
                  Settlr
                </div>
              </div>
              {[
                { label: "Fee", values: ["~5-8%", "$25+", "1% flat"] },
                {
                  label: "Speed",
                  values: ["2-5 days", "5-7 days", "< 1 second"],
                },
                { label: "Venezuela", values: ["❌", "❌", "✅"] },
                {
                  label: "Philippines",
                  values: ["✅ (5%)", "✅ ($25)", "✅ (1%)"],
                },
                {
                  label: "Bank required?",
                  values: ["PayPal acct", "Yes", "No"],
                },
                {
                  label: "Bulk payouts",
                  values: ["Manual", "Manual", "CSV / API"],
                },
              ].map((row, ri) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 border-b border-white/[0.03] ${
                    ri % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <div className="p-4 text-sm text-white/60">{row.label}</div>
                  <div className="p-4 text-center text-sm text-white/50">
                    {row.values[0]}
                  </div>
                  <div className="p-4 text-center text-sm text-white/50">
                    {row.values[1]}
                  </div>
                  <div className="p-4 text-center text-sm font-medium text-[#3B82F6] bg-[#3B82F6]/[0.03]">
                    {row.values[2]}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Relevant companies */}
      <section className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Built for platforms like yours
          </h2>
          <p className="mt-4 text-center text-white/40">
            Whether you have 100 or 100,000 annotators, Settlr handles your
            payouts.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Remotasks / Scale AI",
            "Toloka",
            "Appen",
            "Clickworker",
            "DataAnnotation.tech",
            "Labelbox",
            "Hive",
            "CloudFactory",
            "Your platform",
          ].map((name, i) => (
            <Reveal key={name} delay={i * 0.04}>
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Check className="h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                <span className="text-sm text-white/70">{name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3B82F6]/[0.08] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Stop losing money to{" "}
              <span className="text-[#3B82F6]">broken payout rails</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              Your annotators deserve better than 5% PayPal fees and week-long
              waits. So does your operations team.
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
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/70 hover:bg-white/[0.04]"
              >
                Back to overview
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
