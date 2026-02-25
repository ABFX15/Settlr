"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
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

export default function FreelancePage() {
  return (
    <main
      className="relative min-h-screen bg-[#FDFBF7] text-[#0C1829] antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <Navbar />

      {/* Hero */}
      <section className="relative isolate pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#fbbf24]/[0.05] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#fbbf24]/30 bg-[#fbbf24]/[0.1] px-4 py-1.5 text-[13px] text-[#fbbf24] font-medium">
              <Briefcase className="h-3.5 w-3.5" />
              Freelance Marketplaces
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Contractor payouts{" "}
              <span className="text-[#fbbf24]">without the wire fees</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3B4963]">
              Your freelancers are global. Wire transfers cost $25 each. PayPal
              takes 5%. Stripe Connect only works in 47 countries. Settlr pays
              contractors by email — 1% flat, instant settlement, 180+
              countries.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fbbf24] px-7 py-3.5 text-[15px] font-semibold text-[#0C1829] shadow-lg shadow-[#fbbf24]/25 transition-transform hover:scale-[1.02]"
              >
                Start integrating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo/store"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2DFD5] px-7 py-3.5 text-[15px] font-medium text-[#3B4963] hover:bg-[#F3F2ED]"
              >
                See live demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-y border-[#E2DFD5]/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-widest text-red-400">
              The payout problem
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              International contractor payments are expensive and slow
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: DollarSign,
                title: "$25+ per wire",
                text: "Bank wires are the default for international freelancers. At scale, the costs are brutal.",
              },
              {
                icon: Globe,
                title: "Stripe limits",
                text: "Stripe Connect payouts only in 47 countries. Your best talent isn't always in those 47.",
              },
              {
                icon: Clock,
                title: "Week-long delays",
                text: "Wire transfers take 5-7 business days. Freelancers chase invoices. Your AP team drowns.",
              },
              {
                icon: AlertTriangle,
                title: "Failed transfers",
                text: "Wrong bank details, frozen accounts, unsupported regions. Every failure is a support ticket.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-5">
                  <item.icon className="mb-3 h-5 w-5 text-red-400" />
                  <h3 className="text-sm font-semibold text-[#0C1829]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#7C8A9E]">
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
          <p className="text-sm font-medium uppercase tracking-widest text-[#fbbf24]">
            The Settlr solution
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Pay contractors by email. Settled instantly.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "Email-only payouts",
              text: "No invoicing, no bank details, no SWIFT codes. Enter email + amount, contractor gets paid.",
            },
            {
              icon: Zap,
              title: "Instant settlement",
              text: "Payouts settle in under 1 second. Freelancers stop chasing invoices and start doing more work.",
            },
            {
              icon: Globe,
              title: "180+ countries",
              text: "Everywhere Stripe Connect doesn't reach. No geographic restrictions, no bank account needed.",
            },
            {
              icon: DollarSign,
              title: "1% flat fee",
              text: "No wire fees, no FX markup. Save $24+ per transfer versus bank wires.",
            },
            {
              icon: Users,
              title: "Batch or single payouts",
              text: "Pay one freelancer or a thousand. CSV upload or API — both settle in seconds.",
            },
            {
              icon: Shield,
              title: "On-chain audit trail",
              text: "Every payout recorded on Solana. Immutable records for compliance and accounting.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6">
                <div className="mb-4 inline-flex rounded-xl bg-[#fbbf24]/10 p-2.5">
                  <item.icon className="h-5 w-5 text-[#fbbf24]" />
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

      {/* Relevant companies */}
      <section className="border-y border-[#E2DFD5]/[0.04]">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
              Built for platforms like yours
            </h2>
            <p className="mt-4 text-center text-[#7C8A9E]">
              Any marketplace paying international contractors can integrate in
              under 30 minutes.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Contra",
              "Braintrust",
              "Hobo.Video",
              "Toptal",
              "Gun.io",
              "Andela",
              "Deel alternative",
              "Remote.com alternative",
              "Your marketplace",
            ].map((name, i) => (
              <Reveal key={name} delay={i * 0.04}>
                <div className="flex items-center gap-3 rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-4">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#fbbf24]" />
                  <span className="text-sm text-[#3B4963]">{name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#fbbf24]/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Stop losing $25 per{" "}
              <span className="text-[#fbbf24]">contractor payment</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#7C8A9E]">
              1% flat fee. Instant settlement. 180+ countries. No bank details
              needed. Go live today.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#fbbf24] px-8 py-4 text-[15px] font-semibold text-[#0C1829] shadow-lg shadow-[#fbbf24]/25 hover:scale-[1.02]"
              >
                Start integrating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] px-8 py-4 text-[15px] font-medium text-[#3B4963] hover:bg-[#F3F2ED]"
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
