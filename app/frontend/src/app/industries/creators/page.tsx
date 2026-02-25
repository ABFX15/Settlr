"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Palette,
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

export default function CreatorsPage() {
  return (
    <main
      className="relative min-h-screen bg-[#FDFBF7] text-[#0C1829] antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <Navbar />

      {/* Hero */}
      <section className="relative isolate pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#34d399]/[0.05] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#34d399]/[0.1] px-4 py-1.5 text-[13px] text-[#34d399] font-medium">
              <Palette className="h-3.5 w-3.5" />
              Creator Platforms
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Pay creators in 180+ countries{" "}
              <span className="text-[#34d399]">with just their email</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3B4963]">
              Stripe Connect doesn&apos;t support half the countries your
              creators are in. PayPal has been pulled from others. Settlr lets
              you pay every creator by email — 1% flat, instant, no geographic
              restrictions.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34d399] px-7 py-3.5 text-[15px] font-semibold text-[#0C1829] shadow-lg shadow-[#34d399]/25 transition-transform hover:scale-[1.02]"
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
              The payout gap
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Creator payouts are broken for half the world
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Globe,
                title: "47-country limit",
                text: "Stripe Connect only pays out in 47 countries. Creators in Africa, SE Asia, and LATAM are excluded.",
              },
              {
                icon: DollarSign,
                title: "3-10% payout fees",
                text: "Between Stripe fees, PayPal FX, and withdrawal charges, creators lose a significant cut.",
              },
              {
                icon: Clock,
                title: "Slow settlement",
                text: "Standard payout cycles are 7-14 days. Some platforms hold funds even longer.",
              },
              {
                icon: AlertTriangle,
                title: "Content restrictions",
                text: "Card networks restrict categories. Creators in adult, gambling, or supplements get deplatformed.",
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
          <p className="text-sm font-medium uppercase tracking-widest text-[#34d399]">
            The Settlr solution
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Collect from fans. Pay creators. One integration.
          </h2>
          <p className="mt-4 max-w-2xl text-[#7C8A9E] leading-relaxed">
            Creator platforms have two money flows — fans paying in, and
            creators getting paid out. Settlr handles both.
          </p>
        </Reveal>

        {/* Dual-flow diagram */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Inbound: Checkout */}
          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-[#34d399]/15 bg-[#34d399]/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-[#34d399]/10 p-2.5">
                  <Users className="h-5 w-5 text-[#34d399]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#34d399]">Inbound</p>
                  <h3 className="text-[15px] font-semibold text-[#0C1829]">
                    Checkout SDK
                  </h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#7C8A9E]">
                Embed a checkout component so fans can pay creators with USDC.
                Email-based wallets, zero gas, no crypto knowledge needed from
                buyers.
              </p>
              <div className="mt-4 rounded-lg bg-[#08080d] border border-[#E2DFD5] p-4 font-mono text-xs leading-relaxed">
                <span className="text-[#1B6B4A]">{"<"}</span>
                <span className="text-[#fbbf24]">SettlrCheckout</span>
                <span className="text-[#0C1829]">{" amount={9.99}"}</span>
                <span className="text-[#1B6B4A]">{" />"}</span>
              </div>
            </div>
          </Reveal>

          {/* Outbound: Payouts */}
          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-[#3B82F6]/15 bg-[#1B6B4A]/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-[#1B6B4A]/10 p-2.5">
                  <DollarSign className="h-5 w-5 text-[#1B6B4A]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#1B6B4A]">Outbound</p>
                  <h3 className="text-[15px] font-semibold text-[#0C1829]">
                    Payout API
                  </h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#7C8A9E]">
                Pay creators their earnings in 180+ countries with just their
                email. 1% flat, instant, no bank details, no Stripe Connect
                restrictions.
              </p>
              <div className="mt-4 rounded-lg bg-[#08080d] border border-[#E2DFD5] p-4 font-mono text-xs leading-relaxed">
                <span className="text-[#1B6B4A]">await</span>{" "}
                <span className="text-[#0C1829]">settlr.payouts.create</span>
                <span className="text-[#7C8A9E]">{"({...})"}</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Feature grid below */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "Email-only payouts",
              text: "No bank details, no Stripe Connect onboarding. Enter a creator's email and amount — they're paid.",
            },
            {
              icon: Zap,
              title: "Instant settlement",
              text: "Payouts settle in under 1 second. Creators access funds immediately, not in 2 weeks.",
            },
            {
              icon: Globe,
              title: "180+ countries",
              text: "Every country Stripe Connect doesn't reach. Africa, SE Asia, LATAM — all covered.",
            },
            {
              icon: DollarSign,
              title: "1% flat fee",
              text: "No FX markup, no receiving fees. Creators keep more of what they earn.",
            },
            {
              icon: Shield,
              title: "No content restrictions",
              text: "Stablecoin rails, not card networks. No content-based deplatforming risk.",
            },
            {
              icon: Users,
              title: "Batch payouts",
              text: "Pay hundreds of creators at once via CSV or API. All settled in seconds.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6">
                <div className="mb-4 inline-flex rounded-xl bg-[#34d399]/10 p-2.5">
                  <item.icon className="h-5 w-5 text-[#34d399]" />
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
              Any platform paying creators globally can integrate in under 30
              minutes.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Fourthwall",
              "Ko-fi",
              "Gumroad",
              "Payhip",
              "itch.io",
              "Fanvue",
              "Passes",
              "Spring (Teespring)",
              "Your platform",
            ].map((name, i) => (
              <Reveal key={name} delay={i * 0.04}>
                <div className="flex items-center gap-3 rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-4">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#34d399]" />
                  <span className="text-sm text-[#3B4963]">{name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#34d399]/[0.06] via-transparent to-transparent" />

        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Pay every creator,{" "}
              <span className="text-[#34d399]">everywhere</span>
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-[#7C8A9E]">
              1% flat fee. Instant settlement. 180+ countries. No content
              restrictions. Go live today.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#34d399] px-8 py-4 text-[15px] font-semibold text-[#0C1829] shadow-lg shadow-[#34d399]/25 hover:scale-[1.02]"
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
