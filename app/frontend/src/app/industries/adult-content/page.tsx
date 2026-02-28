"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Ban,
  DollarSign,
  Shield,
  Zap,
  Lock,
  Globe,
  AlertTriangle,
  Film,
  CreditCard,
  Clock,
  FileText,
  Scale,
  BadgeCheck,
  ChevronDown,
  UserX,
  Wallet,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 80, damping: 18 };

/* ─── Reveal ─── */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, ...spring }}
    >
      {children}
    </motion.div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E2E2D1] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 font-medium text-[#0C1829]">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#7C8A9E] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[#7C8A9E]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── DATA ─── */

const features = [
  {
    icon: Ban,
    title: "Deplatform-Proof",
    description:
      "Non-custodial rails mean no payment processor can cut you off. Your settlement infrastructure doesn\u2019t depend on Stripe, PayPal, or any bank.",
    stat: "0",
    statLabel: "deplatform risk",
  },
  {
    icon: Zap,
    title: "Instant Creator Payouts",
    description:
      "Pay creators the moment they earn. No 7-day holds, no net-30 delays. Settlement finalizes in under 5 seconds.",
    stat: "<5s",
    statLabel: "time to settle",
  },
  {
    icon: DollarSign,
    title: "1% Flat Fee",
    description:
      "High-risk processors charge 8\u201315% with rolling reserves. Settlr is 1% flat. No chargebacks, no reserves, no surprises.",
    stat: "1%",
    statLabel: "flat fee",
  },
  {
    icon: Lock,
    title: "Privacy by Default",
    description:
      "TEE-based private settlements hide payout amounts and creator identities from on-chain observers. Your business data stays yours.",
    stat: "TEE",
    statLabel: "encrypted",
  },
  {
    icon: Shield,
    title: "Compliance-Ready",
    description:
      "Full KYB verification, OFAC screening, and an immutable audit trail. Satisfy auditors without exposing creator data publicly.",
    stat: "KYB",
    statLabel: "verified",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Pay creators in any country. No blocked regions, no currency conversion headaches. USDC works the same everywhere.",
    stat: "180+",
    statLabel: "countries",
  },
];

const painPoints = [
  {
    icon: UserX,
    problem: "Deplatformed Overnight",
    detail:
      "Stripe, PayPal, and traditional processors routinely cut off adult content platforms with zero warning",
  },
  {
    icon: DollarSign,
    problem: "Predatory Processing",
    detail:
      "High-risk MCC codes mean 8\u201315% fees + 10% rolling reserves held for 6 months",
  },
  {
    icon: CreditCard,
    problem: "Chargeback Abuse",
    detail:
      "Buyers dispute charges to hide purchases. Platforms eat the cost + $25 chargeback fees",
  },
  {
    icon: Clock,
    problem: "Payout Delays",
    detail:
      "Net-14 to net-30 creator payouts kill retention. Top creators leave for faster-paying platforms",
  },
  {
    icon: AlertTriangle,
    problem: "Banking Instability",
    detail:
      "Banks close accounts for \u201Creputational risk\u201D \u2014 even when everything is legal and verified",
  },
];

const stats = [
  { value: "$15B+", label: "Creator Economy (Adult)" },
  { value: "8\u201315%", label: "Typical Processing Fee" },
  { value: "1%", label: "Settlr Flat Fee" },
  { value: "<5s", label: "Settlement Finality" },
];

const comparisonRows = [
  {
    feature: "Deplatforming risk",
    traditional: "High \u2014 at processor\u2019s discretion",
    settlr: "Zero \u2014 non-custodial",
  },
  {
    feature: "Processing fee",
    traditional: "8\u201315% + rolling reserves",
    settlr: "1% flat",
  },
  {
    feature: "Chargebacks",
    traditional: "Frequent + $25 dispute fee",
    settlr: "Impossible \u2014 crypto is final",
  },
  {
    feature: "Creator payout speed",
    traditional: "Net-14 to net-30",
    settlr: "Instant",
  },
  {
    feature: "Rolling reserves",
    traditional: "10% held for 6 months",
    settlr: "None",
  },
  {
    feature: "Privacy",
    traditional: "Credit card statements expose purchases",
    settlr: "TEE-encrypted \u2014 no public trace",
  },
  {
    feature: "Global payouts",
    traditional: "Wire fees + blocked countries",
    settlr: "USDC to 180+ countries",
  },
  {
    feature: "Audit trail",
    traditional: "Fragmented bank records",
    settlr: "On-chain + exportable",
  },
];

const faqItems = [
  {
    q: "How does this protect my platform from deplatforming?",
    a: 'Settlr is non-custodial — we provide the settlement software, but we never hold, touch, or control your funds. There\u2019s no "merchant account" for anyone to close. Funds flow directly between wallets on Solana. Even if a bank or processor wanted to shut you down, there\u2019s nothing to shut down — the rail is permissionless.',
  },
  {
    q: "Do subscribers need a crypto wallet?",
    a: "No. Subscribers can pay with USDC using an email-based embedded wallet (powered by Privy). They don\u2019t need to know anything about crypto, wallets, or Solana. The experience feels like any other checkout — but settlement is instant and can\u2019t be reversed.",
  },
  {
    q: "How do creator payouts work?",
    a: "Creators receive USDC directly to their wallet as soon as you trigger a payout. No net-14 or net-30 delays. They can hold USDC (it\u2019s always worth $1), offramp to their bank via integrated partners, or transfer anywhere. Setup takes under 2 minutes with just an email.",
  },
  {
    q: "What about chargebacks and fraud?",
    a: 'Stablecoin payments are final — there is no chargeback mechanism. Once a subscriber pays, the funds are settled and cannot be reversed by a bank. This eliminates the chargeback abuse that plagues adult content platforms (where buyers dispute charges to "hide" purchases).',
  },
  {
    q: "Is this compliant with financial regulations?",
    a: "Yes. Settlr includes KYB verification for platforms, OFAC screening for wallets, and produces a full on-chain audit trail. We\u2019re built for the GENIUS Act (2025) stablecoin framework. Because we\u2019re non-custodial, we\u2019re a software provider — not a money transmitter.",
  },
  {
    q: "What about user privacy? Credit card statements expose what people buy.",
    a: 'With Settlr, there\u2019s no credit card statement entry like "OnlyFans" or "FanCentro" on a bank statement. Subscribers pay with USDC from a wallet — the only record is a generic on-chain transaction. With privacy mode (TEE), even the on-chain amount is hidden during processing.',
  },
];

/* ═══════════════ PAGE ═══════════════ */

export default function AdultContentPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      <Navbar />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(27,107,74,0.10),transparent)]" />
        </div>
        <div className="absolute right-[15%] top-[20%] h-72 w-72 rounded-full bg-[#1B6B4A]/[0.06] blur-[120px]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1B6B4A]/20 bg-[#1B6B4A]/[0.06] px-4 py-2">
                <Film className="h-4 w-4 text-[#155939]" />
                <span className="text-sm font-medium text-[#155939]">
                  Adult Content Platforms
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1
                className="mb-6 text-5xl font-bold leading-[1.08] text-[#0C1829] md:text-7xl"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Stop getting{" "}
                <span className="text-[#1B6B4A]">deplatformed.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[#7C8A9E]">
                Pay creators instantly, accept subscriber payments without
                chargebacks, and never worry about a processor shutting you down
                overnight. Non-custodial settlement rails that no one can cut
                off.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background:
                      "linear-gradient(135deg, #1B6B4A 0%, #155939 100%)",
                  }}
                >
                  Request Access
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E2D1] bg-white px-7 py-3.5 font-semibold text-[#0C1829] transition-all hover:bg-[#F5F5F5]"
                >
                  See the Demo
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#7C8A9E]">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-[#155939]" />
                  KYB Verified
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[#155939]" />
                  Non-Custodial
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-[#155939]" />
                  TEE Privacy
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───── Stats ───── */}
      <section className="border-y border-[#E2E2D1] bg-white px-4 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.05}>
              <div className="text-center">
                <div
                  className="mb-1 text-3xl font-bold text-[#0C1829] md:text-4xl"
                  style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[#7C8A9E]">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───── Pain Points ───── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2
              className="mb-4 text-3xl font-bold text-[#0C1829] md:text-4xl"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              The payment{" "}
              <span className="text-[#B91C1C]">deplatforming problem</span>
            </h2>
            <p className="mb-12 max-w-2xl text-[#7C8A9E]">
              Your platform is legal. Your content is verified. But payment
              processors treat you like a liability — charging extortionate
              fees, holding reserves, or dropping you entirely.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {painPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <Reveal key={point.problem} delay={i * 0.05}>
                  <div className="rounded-2xl border border-[#B91C1C]/15 bg-[#FEF2F2] p-5">
                    <Icon className="mb-3 h-6 w-6 text-[#B91C1C]" />
                    <h3 className="mb-1 text-sm font-semibold text-[#0C1829]">
                      {point.problem}
                    </h3>
                    <p className="text-xs text-[#7C8A9E]">{point.detail}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2
              className="mb-4 text-3xl font-bold text-[#0C1829] md:text-4xl"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              Settlement rails that can&apos;t be shut off.
            </h2>
            <p className="mb-12 max-w-2xl text-[#7C8A9E]">
              Non-custodial means no processor, no bank, and no platform policy
              change can freeze your payments or hold your creators&apos; money.
            </p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.05}>
                  <div className="rounded-2xl border border-[#E2E2D1] bg-white p-6 transition-colors hover:bg-[#F7F6F1]">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg bg-[#1B6B4A]/[0.08] p-2.5">
                        <Icon className="h-5 w-5 text-[#155939]" />
                      </div>
                      <div className="text-right">
                        <span
                          className="text-2xl font-bold text-[#0C1829]"
                          style={{
                            fontFamily: "var(--font-fraunces), Georgia, serif",
                          }}
                        >
                          {f.stat}
                        </span>
                        <span className="ml-1.5 text-xs text-[#7C8A9E]">
                          {f.statLabel}
                        </span>
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold text-[#0C1829]">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#7C8A9E]">{f.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="border-y border-[#E2E2D1] bg-white px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2
              className="mb-4 text-3xl font-bold text-[#0C1829] md:text-4xl"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              How it works for your platform
            </h2>
            <p className="mb-12 max-w-2xl text-[#7C8A9E]">
              Two flows — subscriber payments in, creator payouts out. Both
              instant, both non-custodial.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Subscriber Pays",
                desc: "Subscriber pays with USDC via email-based wallet. No credit card statement, no chargeback risk.",
                icon: Wallet,
              },
              {
                step: "02",
                title: "Instant Settlement",
                desc: "Funds settle to your vault in under 5 seconds. Non-custodial — Settlr never touches the money.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Creator Payout",
                desc: "Trigger creator payouts instantly or on schedule. No net-14, no net-30 delays.",
                icon: DollarSign,
              },
              {
                step: "04",
                title: "Audit Trail",
                desc: "Every transaction timestamped on-chain. Export for compliance, taxes, and financial reporting.",
                icon: Scale,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.step} delay={i * 0.08}>
                  <div className="rounded-2xl border border-[#E2E2D1] bg-[#F7F6F1] p-6">
                    <div
                      className="mb-4 text-4xl font-bold text-[#1B6B4A]/20"
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                      }}
                    >
                      {item.step}
                    </div>
                    <div className="mb-3 inline-flex rounded-lg bg-[#1B6B4A]/[0.08] p-2.5">
                      <Icon className="h-5 w-5 text-[#155939]" />
                    </div>
                    <h3 className="mb-2 font-semibold text-[#0C1829]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#7C8A9E]">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Comparison Table ───── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2
              className="mb-10 text-center text-3xl font-bold text-[#0C1829] md:text-4xl"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              High-Risk Processors vs.{" "}
              <span className="text-[#1B6B4A]">Settlr</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-[#E2E2D1]">
              <div className="grid grid-cols-3 border-b border-[#E2E2D1] bg-[#F5F5F5]">
                <div className="p-4 text-xs font-semibold uppercase tracking-wider text-[#7C8A9E]">
                  Feature
                </div>
                <div className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-[#B91C1C]">
                  Traditional
                </div>
                <div className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-[#155939]">
                  Settlr
                </div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${
                    i !== comparisonRows.length - 1
                      ? "border-b border-[#E2E2D1]"
                      : ""
                  }`}
                >
                  <div className="p-4 text-sm text-[#0C1829]">
                    {row.feature}
                  </div>
                  <div className="p-4 text-center text-sm text-[#7C8A9E]">
                    {row.traditional}
                  </div>
                  <div className="p-4 text-center text-sm font-medium text-[#155939]">
                    {row.settlr}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="border-t border-[#E2E2D1] bg-white px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2
              className="mb-4 text-center text-3xl font-bold text-[#0C1829] md:text-4xl"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              Frequently Asked Questions
            </h2>
            <p className="mb-10 text-center text-[#7C8A9E]">
              Common questions about using Settlr for adult content platform
              payments.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[#E2E2D1] bg-[#F7F6F1] px-6">
              {faqItems.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-[#0C1829]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(27,107,74,0.15),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={spring}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h2
            className="mb-6 text-3xl font-bold text-white md:text-4xl"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              color: "#FFFFFF",
            }}
          >
            Your platform is legal.{" "}
            <span className="text-[#1B6B4A]">Your payments should be too.</span>
          </h2>
          <p className="mb-8 text-lg text-[#7C8A9E]">
            Join platforms replacing unreliable processors with instant,
            non-custodial settlement rails. No chargebacks, no deplatforming, no
            rolling reserves.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/waitlist"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #1B6B4A 0%, #155939 100%)",
              }}
            >
              Request Access
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Read the Docs
            </Link>
          </div>
          <p className="mt-6 text-xs text-[#7C8A9E]/60">
            Non-custodial · KYB verified · TEE privacy · No chargebacks
          </p>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
