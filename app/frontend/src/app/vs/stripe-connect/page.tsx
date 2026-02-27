"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  X,
  Clock,
  Globe,
  DollarSign,
  Shield,
  Zap,
  Building2,
  Lock,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─── Palette ─── */
const CREAM = "#FFFFFF";
const NAVY = "#0A0F1E";
const SLATE = "#4A5568";
const MUTED = "#94A3B8";
const GREEN = "#10B981";
const ACCENT_LIGHT = "#2A9D6A";
const TOPO = "#E8E4DA";
const CARD_BORDER = "#E5E7EB";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

/* ─── Comparison data ─── */
const comparisonRows = [
  {
    feature: "Settlement Speed",
    settlr: "< 1 second",
    stripe: "2–7 business days",
    winner: "settlr",
  },
  {
    feature: "Per-Payout Fee",
    settlr: "1% flat",
    stripe: "0.25% + $0.25 (domestic) / 1% + $0.25 (intl)",
    winner: "settlr",
  },
  {
    feature: "Countries Supported",
    settlr: "180+ (email-based, no bank details)",
    stripe: "~47 (requires local bank account)",
    winner: "settlr",
  },
  {
    feature: "Onboarding Friction",
    settlr: "Email address only",
    stripe: "Full KYC per recipient, days to verify",
    winner: "settlr",
  },
  {
    feature: "Currency",
    settlr: "USDC (stablecoin, 1:1 USD)",
    stripe: "Fiat (local currency conversion fees)",
    winner: "settlr",
  },
  {
    feature: "Frozen Accounts",
    settlr: "Non-custodial — funds flow directly",
    stripe: "Stripe holds funds, freezing reported",
    winner: "settlr",
  },
  {
    feature: "Compliance (OFAC / AML)",
    settlr: "Built-in screening on every payout",
    stripe: "Via Connect, requires configuration",
    winner: "tie",
  },
  {
    feature: "API Integration",
    settlr: "3 lines of code",
    stripe: "Complex Connect onboarding flows",
    winner: "settlr",
  },
  {
    feature: "Marketplace Support",
    settlr: "Yes — split payments, multi-party",
    stripe: "Yes — Stripe Connect",
    winner: "tie",
  },
  {
    feature: "Privacy",
    settlr: "Confidential transfers (SPL Token 2022)",
    stripe: "Standard bank transfers",
    winner: "settlr",
  },
];

const painPoints = [
  {
    icon: Clock,
    title: "Wait 5 days for payouts to land?",
    description:
      "Stripe Connect batches payouts on a rolling schedule. Your contractors wait days for money they earned today. Settlr settles in under a second.",
  },
  {
    icon: Globe,
    title: "Only 47 countries?",
    description:
      "Stripe Connect requires recipients to have a local bank account in a supported country. Settlr pays anyone with an email address — 180+ countries, no bank details needed.",
  },
  {
    icon: DollarSign,
    title: "Hidden fees everywhere?",
    description:
      "Cross-border conversions, platform fees, FX markups. With Settlr, it's 1% flat. Period. No currency conversion because USDC is already a dollar.",
  },
  {
    icon: Lock,
    title: "Funds frozen without warning?",
    description:
      "Stripe holds your money in reserve and can freeze accounts with little notice. Settlr is non-custodial — funds flow directly from your wallet to theirs.",
  },
  {
    icon: Building2,
    title: "Weeks of onboarding per recipient?",
    description:
      "Stripe Connect requires full KYC for every connected account. Settlr: send an email, they claim their USDC. Done.",
  },
  {
    icon: Shield,
    title: "Compliance headaches?",
    description:
      "Settlr screens every payout against OFAC automatically. No extra config, no third-party add-ons. Compliance is built into the protocol.",
  },
];

const faqs = [
  {
    q: "Is USDC really the same as USD?",
    a: "Yes. USDC is a regulated stablecoin pegged 1:1 to the US dollar, issued by Circle and backed by cash and short-duration US treasuries. Recipients can off-ramp to their local currency via any exchange or use USDC directly.",
  },
  {
    q: "Can recipients cash out to their bank?",
    a: "Absolutely. Recipients can off-ramp USDC to their bank account via Coinbase, Circle, or dozens of local exchanges in their country. Many keep it as USDC for instant spending.",
  },
  {
    q: "Do I need to understand crypto?",
    a: "No. Settlr abstracts all blockchain complexity. You call an API with an email and an amount. We handle wallets, transactions, and delivery. Your recipients see a branded claim page — no crypto knowledge needed.",
  },
  {
    q: "How does Settlr handle compliance?",
    a: "Every payout is screened against OFAC and global sanctions lists in real-time. We maintain an audit trail for every transaction. Confidential transfers on SPL Token 2022 ensure amounts stay private on-chain while maintaining full compliance.",
  },
  {
    q: "Can I migrate from Stripe Connect?",
    a: "Yes. Most teams integrate Settlr in under an hour. You can run both systems in parallel during migration — use Stripe for card processing and Settlr for payouts.",
  },
  {
    q: "What about chargebacks?",
    a: "Stablecoin payments are final. There are no chargebacks, no disputes, no rolling reserves. Once funds are sent, they're sent. This is a feature for platforms tired of chargeback fraud.",
  },
];

export default function StripeConnectComparison() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen" style={{ background: CREAM }}>
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(27,107,74,0.06), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pill */}
            <div
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
              style={{
                borderColor: `${GREEN}30`,
                background: `${GREEN}08`,
                color: GREEN,
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: GREEN }}
              />
              Stripe Connect Alternative
            </div>

            <h1
              className="mb-6 text-4xl font-bold tracking-tight md:text-6xl"
              style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
            >
              Stop waiting days.{" "}
              <span style={{ color: GREEN }}>Pay in seconds.</span>
            </h1>

            <p
              className="mx-auto mb-10 max-w-2xl text-lg md:text-xl"
              style={{ color: SLATE }}
            >
              Stripe Connect was built for card payments. Settlr was built for
              payouts. Faster settlement, lower fees, 180+ countries — no bank
              details required.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                }}
              >
                Start Sending — Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-base font-semibold transition-colors"
                style={{ borderColor: CARD_BORDER, color: SLATE }}
              >
                Read the Docs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Pain Points ─── */}
      <section className="py-20 md:py-28" style={{ background: `${TOPO}40` }}>
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16 text-center"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
            >
              Why platforms switch from Stripe Connect
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mx-auto max-w-2xl text-lg"
              style={{ color: SLATE }}
            >
              These are the real complaints we hear from marketplaces, agencies,
              and SaaS platforms every week.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((point, i) => (
              <motion.div
                key={point.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="rounded-2xl border p-8"
                style={{ background: CREAM, borderColor: CARD_BORDER }}
              >
                <div
                  className="mb-4 inline-flex rounded-xl p-3"
                  style={{ background: `${GREEN}10` }}
                >
                  <point.icon className="h-6 w-6" style={{ color: GREEN }} />
                </div>
                <h3 className="mb-2 text-lg font-bold" style={{ color: NAVY }}>
                  {point.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: SLATE }}>
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16 text-center"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
            >
              Settlr vs Stripe Connect
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mx-auto max-w-2xl text-lg"
              style={{ color: SLATE }}
            >
              Feature-by-feature. No spin — just facts.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            custom={2}
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: CARD_BORDER }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-3 gap-4 px-6 py-4 text-sm font-semibold"
              style={{ background: NAVY, color: "white" }}
            >
              <span>Feature</span>
              <span className="text-center" style={{ color: ACCENT_LIGHT }}>
                Settlr
              </span>
              <span className="text-center opacity-60">Stripe Connect</span>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 gap-4 border-t px-6 py-4 text-sm"
                style={{
                  borderColor: CARD_BORDER,
                  background: i % 2 === 0 ? CREAM : `${TOPO}30`,
                }}
              >
                <span className="font-medium" style={{ color: NAVY }}>
                  {row.feature}
                </span>
                <span
                  className="text-center"
                  style={{ color: row.winner === "settlr" ? GREEN : SLATE }}
                >
                  {row.winner === "settlr" && (
                    <Check
                      className="mr-1 inline h-4 w-4"
                      style={{ color: GREEN }}
                    />
                  )}
                  {row.settlr}
                </span>
                <span className="text-center" style={{ color: MUTED }}>
                  {row.winner === "settlr" && (
                    <X className="mr-1 inline h-4 w-4 opacity-40" />
                  )}
                  {row.stripe}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Integration Speed ─── */}
      <section className="py-20 md:py-28" style={{ background: `${TOPO}40` }}>
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
            >
              Integrate in minutes, not weeks
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mx-auto mb-12 max-w-2xl text-lg"
              style={{ color: SLATE }}
            >
              Stripe Connect requires building complex onboarding flows. Settlr
              is three lines of code.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            custom={2}
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: CARD_BORDER, background: NAVY }}
          >
            <div
              className="flex items-center gap-2 border-b px-6 py-3"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs" style={{ color: MUTED }}>
                payout.ts
              </span>
            </div>
            <pre
              className="overflow-x-auto p-6 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              <code>
                <span style={{ color: "#94A3B8" }}>
                  {"// npm install @settlr/sdk\n"}
                </span>
                <span style={{ color: MUTED }}>{"import "}</span>
                <span style={{ color: "white" }}>{"{ SettlrClient }"}</span>
                <span style={{ color: MUTED }}>{" from "}</span>
                <span style={{ color: ACCENT_LIGHT }}>{'"@settlr/sdk"'}</span>
                <span style={{ color: MUTED }}>{";\n\n"}</span>
                <span style={{ color: MUTED }}>{"const client = "}</span>
                <span style={{ color: "white" }}>{"new SettlrClient"}</span>
                <span style={{ color: MUTED }}>{"("}</span>
                <span style={{ color: ACCENT_LIGHT }}>
                  {"process.env.SETTLR_API_KEY"}
                </span>
                <span style={{ color: MUTED }}>{");\n\n"}</span>
                <span style={{ color: MUTED }}>{"await client."}</span>
                <span style={{ color: "white" }}>{"pay"}</span>
                <span style={{ color: MUTED }}>{"({\n"}</span>
                <span style={{ color: MUTED }}>{"  email: "}</span>
                <span style={{ color: ACCENT_LIGHT }}>
                  {'"contractor@example.com"'}
                </span>
                <span style={{ color: MUTED }}>{",\n"}</span>
                <span style={{ color: MUTED }}>{"  amount: "}</span>
                <span style={{ color: "#B8860B" }}>{"250_00"}</span>
                <span style={{ color: MUTED }}>{",\n"}</span>
                <span style={{ color: MUTED }}>{"  currency: "}</span>
                <span style={{ color: ACCENT_LIGHT }}>{'"USDC"'}</span>
                <span style={{ color: MUTED }}>{",\n"}</span>
                <span style={{ color: MUTED }}>{"  memo: "}</span>
                <span style={{ color: ACCENT_LIGHT }}>
                  {'"February invoice"'}
                </span>
                <span style={{ color: MUTED }}>{"\n});"}</span>
              </code>
            </pre>
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={3}
            className="mt-6 text-center text-sm"
            style={{ color: MUTED }}
          >
            That&apos;s it. No connected accounts. No onboarding flows. No KYC
            per recipient.
          </motion.p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={0}
            className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
          >
            Frequently asked questions
          </motion.h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: CARD_BORDER, background: CREAM }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-semibold"
                  style={{ color: NAVY }}
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    style={{ color: MUTED }}
                  />
                </button>
                {openFaq === i && (
                  <div
                    className="border-t px-6 pb-5 pt-4 text-sm leading-relaxed"
                    style={{ borderColor: CARD_BORDER, color: SLATE }}
                  >
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28" style={{ background: NAVY }}>
        <div className="mx-auto max-w-3xl px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl"
              style={{ fontFamily: "var(--font-fraunces)", color: "#FFFFFF" }}
            >
              Ready to ditch the 5-day wait?
            </motion.h2>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mx-auto mb-10 max-w-lg text-lg"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Join platforms already saving thousands per month in fees and
              settling payouts in under a second.
            </motion.p>
            <motion.div
              custom={2}
              variants={fadeUp}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/waitlist"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                }}
              >
                Get Early Access
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-base font-semibold text-white transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                See Pricing
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ─── JSON-LD ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Settlr vs Stripe Connect — Faster, Cheaper Global Payouts",
            description:
              "Compare Settlr and Stripe Connect for global payouts. Settlr settles in seconds, costs 1% flat, and reaches 180+ countries with just an email.",
            url: "https://settlr.dev/vs/stripe-connect",
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://settlr.dev/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Settlr vs Stripe Connect",
                  item: "https://settlr.dev/vs/stripe-connect",
                },
              ],
            },
          }),
        }}
      />
    </main>
  );
}
