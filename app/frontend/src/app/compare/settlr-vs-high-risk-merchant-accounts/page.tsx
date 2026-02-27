"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  DollarSign,
  Shield,
  Clock,
  Lock,
  Ban,
  Zap,
  TrendingDown,
  Building2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ── Design tokens ─────────────────────────────────────── */
const p = {
  bg: "#FFFFFF",
  bgSubtle: "#FAFAFA",
  bgMuted: "#F5F5F5",
  navy: "#0A0F1E",
  slate: "#4A5568",
  muted: "#94A3B8",
  green: "#10B981",
  greenDark: "#059669",
  red: "#EF4444",
  amber: "#F59E0B",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
const cardBorder = `1px solid ${p.border}`;

function R({
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
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Comparison data ───────────────────────────────────── */
const comparisonRows = [
  {
    category: "Pricing",
    items: [
      {
        label: "Transaction fee",
        highRisk: "5–9% per transaction",
        settlr: "1% flat",
        winner: "settlr",
      },
      {
        label: "Monthly account fee",
        highRisk: "$500–$2,000/month",
        settlr: "$0",
        winner: "settlr",
      },
      {
        label: "Setup / onboarding fee",
        highRisk: "$1,000–$5,000",
        settlr: "$0",
        winner: "settlr",
      },
      {
        label: "Rolling reserve",
        highRisk: "10–20% held for 6 months",
        settlr: "None — non-custodial",
        winner: "settlr",
      },
      {
        label: "Chargeback fee",
        highRisk: "$25–$50 per dispute",
        settlr: "N/A — chargebacks impossible",
        winner: "settlr",
      },
      {
        label: "Annual cost on $2M revenue",
        highRisk: "$100,000–$180,000+",
        settlr: "$20,000",
        winner: "settlr",
      },
    ],
  },
  {
    category: "Risk & Control",
    items: [
      {
        label: "Account freeze risk",
        highRisk: "High — bank can freeze anytime",
        settlr: "Zero — non-custodial",
        winner: "settlr",
      },
      {
        label: "Funds custody",
        highRisk: "Processor holds funds 2–7 days",
        settlr: "Never — peer-to-peer",
        winner: "settlr",
      },
      {
        label: "Processing approval rate",
        highRisk: "70–85% (high decline rates)",
        settlr: "99%+ (on-chain)",
        winner: "settlr",
      },
      {
        label: "Account termination risk",
        highRisk: "Common — 62% had accounts closed",
        settlr: "Cannot be terminated by a bank",
        winner: "settlr",
      },
      {
        label: "Chargeback exposure",
        highRisk: "2–5% chargeback rate typical",
        settlr: "0% — transactions are final",
        winner: "settlr",
      },
    ],
  },
  {
    category: "Speed & Operations",
    items: [
      {
        label: "Settlement time",
        highRisk: "3–7 business days",
        settlr: "< 2 seconds",
        winner: "settlr",
      },
      {
        label: "Weekend / holiday settlement",
        highRisk: "No",
        settlr: "Yes — 24/7/365",
        winner: "settlr",
      },
      {
        label: "B2B wire transfers",
        highRisk: "Restricted or unavailable",
        settlr: "Instant — any amount",
        winner: "settlr",
      },
      {
        label: "Integration time",
        highRisk: "2–6 weeks (underwriting)",
        settlr: "< 1 hour (API/SDK)",
        winner: "settlr",
      },
      {
        label: "Audit trail",
        highRisk: "Monthly statements (PDF)",
        settlr: "Real-time on-chain receipts",
        winner: "settlr",
      },
    ],
  },
  {
    category: "Compliance",
    items: [
      {
        label: "KYB / KYC",
        highRisk: "Extensive — 2–4 week review",
        settlr: "Automated — 24hr verification",
        winner: "settlr",
      },
      {
        label: "GENIUS Act compliance",
        highRisk: "N/A (fiat rails)",
        settlr: "Fully compliant (USDC)",
        winner: "settlr",
      },
      {
        label: "BSA/AML integration",
        highRisk: "Processor handles (opaque)",
        settlr: "Integrated KYB screening",
        winner: "tie",
      },
      {
        label: "State license verification",
        highRisk: "Manual review",
        settlr: "Automated database check",
        winner: "settlr",
      },
    ],
  },
];

/* ── FAQ data ──────────────────────────────────────────── */
const faqs = [
  {
    q: "How much do high-risk payment processors charge cannabis businesses?",
    a: "Traditional high-risk payment processors charge cannabis businesses between 5% and 9% per transaction, plus monthly fees of $500–$2,000 and setup fees of $1,000–$5,000. A business processing $2M annually pays $100,000–$180,000+ in total processing costs. Settlr charges 1% flat with no monthly fees, setup fees, or rolling reserves — $20,000 on the same volume.",
  },
  {
    q: "What happens when a high-risk merchant account freezes cannabis business funds?",
    a: "When a high-risk merchant processor freezes funds, the business typically loses access to their money for 30–180 days. During this period, payroll, vendor payments, and tax obligations cannot be met. 62% of cannabis businesses have experienced at least one account freeze or closure. Settlr's non-custodial architecture makes fund freezes impossible — money goes directly to your wallet.",
  },
  {
    q: "What are rolling reserves and why do cannabis processors require them?",
    a: "Rolling reserves are a percentage of each transaction (typically 10–20%) that the processor holds for 6 months as a chargeback buffer. For a cannabis business processing $200K/month at 15% reserve, that's $30,000/month locked up — $180,000 total at any given time. Settlr has no reserve requirements because stablecoin transactions are final and irreversible.",
  },
  {
    q: "Why is Settlr better than PayQwick or Safe Harbor Financial for cannabis?",
    a: "PayQwick and Safe Harbor Financial are traditional high-risk processors that charge 5–8% fees, require rolling reserves, and depend on banking relationships that can terminate without notice. Settlr operates on blockchain infrastructure — 1% flat fee, no reserves, no account freezes, instant settlement. The trade-off is that Settlr settles in USDC (stablecoin) rather than fiat, though off-ramp integrations allow conversion to USD.",
  },
];

/* ── Named processors for content ──────────────────────── */
const processors = [
  {
    name: "PayQwick",
    fee: "6–8%",
    reserve: "15%",
    settlement: "3–5 days",
    risk: "Bank partner terminated in 2023",
  },
  {
    name: "Safe Harbor Financial",
    fee: "5–7%",
    reserve: "10–15%",
    settlement: "3–7 days",
    risk: "Limited state availability",
  },
  {
    name: "Aeropay",
    fee: "3–5%",
    reserve: "10%",
    settlement: "2–3 days",
    risk: "ACH-based — NACHA rejection risk",
  },
  {
    name: "CanPay",
    fee: "3.5–5%",
    reserve: "10%",
    settlement: "2–5 days",
    risk: "Debit-based — bank partner dependent",
  },
];

/* ════════════════════════════════════════════════════════ */
/*  PAGE                                                   */
/* ════════════════════════════════════════════════════════ */
export default function SettlrVsHighRiskPage() {
  return (
    <div className="min-h-screen" style={{ background: p.bg, color: p.slate }}>
      <Navbar />

      {/* Structured data — FAQPage */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
              },
            })),
          }),
        }}
      />

      {/* Structured data — Article */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "Settlr vs High-Risk Merchant Accounts: Cannabis Payment Processing Comparison 2026",
            description:
              "High-risk merchant processors charge cannabis businesses 5–9% with rolling reserves and account freeze risk. Settlr provides non-custodial stablecoin settlement at 1% flat with no reserves and zero freeze risk.",
            author: {
              "@type": "Organization",
              name: "Settlr",
              url: "https://settlr.dev",
            },
            publisher: {
              "@type": "Organization",
              name: "Settlr",
              url: "https://settlr.dev",
            },
            datePublished: "2026-01-15",
            dateModified: "2026-02-27",
          }),
        }}
      />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden pb-24 pt-40 sm:pb-32 sm:pt-56">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <R>
            <div
              className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm"
              style={{
                background: p.white,
                border: cardBorder,
                color: p.navy,
              }}
            >
              <TrendingDown
                className="h-3.5 w-3.5"
                style={{ color: p.green }}
              />
              Cost Comparison
            </div>
          </R>

          <R delay={0.06}>
            <h1
              className="mt-8 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: p.navy }}
            >
              Settlr vs{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                High-Risk Processors
              </span>
            </h1>
          </R>

          <R delay={0.12}>
            <p
              className="mx-auto mt-6 max-w-lg text-lg leading-relaxed"
              style={{ color: p.slate }}
            >
              High-risk merchant accounts charge 5–9% with rolling reserves and
              account freeze risk. Here&apos;s why cannabis businesses are
              switching to non-custodial stablecoin settlement.
            </p>
          </R>

          {/* AEO entity sentence */}
          <p className="sr-only">
            Traditional high-risk payment processors charge cannabis businesses
            between 5% and 9% per transaction with rolling reserves of 10–20%.
            Settlr provides an alternative non-custodial stablecoin rail at a 1%
            flat fee with no reserves, no account freeze risk, and sub-second
            settlement on Solana.
          </p>
        </div>
      </section>

      {/* ═══════ COST HEADLINE ═══════ */}
      <section style={{ background: p.navy }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <R>
            <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
              {[
                { value: "5–9%", label: "High-risk processor fee" },
                { value: "1%", label: "Settlr flat fee" },
                { value: "10–20%", label: "Rolling reserve (theirs)" },
                { value: "0%", label: "Rolling reserve (ours)" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {stat.value}
                  </p>
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ═══════ NAMED PROCESSOR COMPARISON ═══════ */}
      <section className="py-32 sm:py-48">
        <div className="mx-auto max-w-5xl px-6">
          <R className="text-center">
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              How Settlr compares to named processors
            </h2>
            <p className="mt-5 text-lg" style={{ color: p.slate }}>
              Real fee data from the top cannabis payment processors.
            </p>
          </R>

          <R delay={0.06}>
            <div
              className="mt-14 overflow-hidden rounded-2xl"
              style={{ border: cardBorder }}
            >
              {/* Header */}
              <div
                className="grid grid-cols-5 gap-2 px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                style={{ background: p.bgMuted, color: p.muted }}
              >
                <div>Provider</div>
                <div className="text-center">Fee</div>
                <div className="text-center">Reserve</div>
                <div className="text-center">Settlement</div>
                <div className="text-center">Risk</div>
              </div>
              {/* Settlr row */}
              <div
                className="grid grid-cols-5 gap-2 px-6 py-5 text-sm"
                style={{
                  background: "rgba(16,185,129,0.04)",
                  borderTop: `1px solid ${p.border}`,
                }}
              >
                <div className="font-bold" style={{ color: p.green }}>
                  Settlr
                </div>
                <div
                  className="text-center font-semibold"
                  style={{ color: p.green }}
                >
                  1% flat
                </div>
                <div
                  className="text-center font-semibold"
                  style={{ color: p.green }}
                >
                  None
                </div>
                <div
                  className="text-center font-semibold"
                  style={{ color: p.green }}
                >
                  &lt; 2 sec
                </div>
                <div
                  className="text-center font-semibold"
                  style={{ color: p.green }}
                >
                  Non-custodial
                </div>
              </div>
              {/* Competitor rows */}
              {processors.map((proc, i) => (
                <div
                  key={proc.name}
                  className="grid grid-cols-5 gap-2 px-6 py-5 text-sm"
                  style={{
                    background: i % 2 === 0 ? p.white : p.bgSubtle,
                    borderTop: `1px solid ${p.border}`,
                  }}
                >
                  <div className="font-medium" style={{ color: p.navy }}>
                    {proc.name}
                  </div>
                  <div className="text-center" style={{ color: p.red }}>
                    {proc.fee}
                  </div>
                  <div className="text-center" style={{ color: p.amber }}>
                    {proc.reserve}
                  </div>
                  <div className="text-center" style={{ color: p.slate }}>
                    {proc.settlement}
                  </div>
                  <div className="text-center text-xs" style={{ color: p.red }}>
                    {proc.risk}
                  </div>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ═══════ FULL COMPARISON TABLE ═══════ */}
      <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
        <div className="mx-auto max-w-5xl px-6">
          <R className="text-center">
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              Feature-by-feature comparison
            </h2>
          </R>

          {comparisonRows.map((section, si) => (
            <R key={section.category} delay={si * 0.06}>
              <div className="mt-14">
                <h3
                  className="mb-4 text-sm font-semibold uppercase tracking-widest"
                  style={{ color: p.muted }}
                >
                  {section.category}
                </h3>
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{ border: cardBorder }}
                >
                  <div
                    className="grid grid-cols-3 gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ background: p.bgMuted, color: p.muted }}
                  >
                    <div>Feature</div>
                    <div className="text-center">High-Risk Processor</div>
                    <div className="text-center">Settlr</div>
                  </div>
                  {section.items.map((item, i) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-3 gap-4 px-6 py-4 text-sm"
                      style={{
                        background: i % 2 === 0 ? p.white : p.bgSubtle,
                        borderTop: `1px solid ${p.border}`,
                      }}
                    >
                      <div className="font-medium" style={{ color: p.navy }}>
                        {item.label}
                      </div>
                      <div className="text-center" style={{ color: p.slate }}>
                        {item.highRisk}
                      </div>
                      <div
                        className="text-center"
                        style={{
                          color: item.winner === "settlr" ? p.green : p.slate,
                          fontWeight: item.winner === "settlr" ? 600 : 400,
                        }}
                      >
                        {item.settlr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </R>
          ))}
        </div>
      </section>

      {/* ═══════ THE FREEZE PROBLEM ═══════ */}
      <section className="py-32 sm:py-48">
        <div className="mx-auto max-w-5xl px-6">
          <R className="text-center">
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              The account freeze problem
            </h2>
            <p
              className="mt-5 max-w-2xl mx-auto text-lg"
              style={{ color: p.slate }}
            >
              62% of cannabis businesses had at least one bank account closed in
              the past 12 months. Here&apos;s what that means in practice.
            </p>
          </R>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Ban,
                title: "Payroll disruption",
                desc: "Frozen accounts mean you can't pay employees. Cannabis businesses report 2–4 week payroll delays during account closures.",
              },
              {
                icon: AlertTriangle,
                title: "Vendor relationships damaged",
                desc: "When you can't pay suppliers on time, you lose buying power, volume discounts, and allocation priority.",
              },
              {
                icon: Clock,
                title: "30–90 day fund holds",
                desc: "Processors typically hold funds for 30–90 days after account termination. That's working capital you can't access.",
              },
              {
                icon: Building2,
                title: "Tax payment delays",
                desc: "Cannabis businesses owe 280E federal taxes plus state taxes. Frozen accounts mean late payments and penalties.",
              },
              {
                icon: TrendingDown,
                title: "Revenue loss",
                desc: "Account transitions take 4–8 weeks. During that time, B2B transaction volume drops 30–50%.",
              },
              {
                icon: Lock,
                title: "Blacklisting risk",
                desc: "One processor termination can make it harder to open new accounts. MATCH/TMF listing is an industry death sentence.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <R key={item.title} delay={i * 0.04}>
                  <div
                    className="h-full rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-md"
                    style={{ background: p.white, border: cardBorder }}
                  >
                    <div
                      className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: p.bgMuted }}
                    >
                      <Icon className="h-5 w-5" style={{ color: p.slate }} />
                    </div>
                    <h3
                      className="text-base font-bold"
                      style={{ color: p.navy }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: p.slate }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </R>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
        <div className="mx-auto max-w-4xl px-6">
          <R className="text-center">
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              Frequently asked questions
            </h2>
          </R>

          <div className="mt-14 space-y-4">
            {faqs.map((faq, i) => (
              <R key={faq.q} delay={i * 0.04}>
                <div
                  className="rounded-2xl p-8"
                  style={{ background: p.white, border: cardBorder }}
                >
                  <h3 className="text-base font-bold" style={{ color: p.navy }}>
                    {faq.q}
                  </h3>
                  <p
                    className="mt-3 text-[15px] leading-relaxed"
                    style={{ color: p.slate }}
                  >
                    {faq.a}
                  </p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-32 sm:py-48">
        <div className="mx-auto max-w-5xl px-6">
          <R>
            <div
              className="relative overflow-hidden rounded-[2rem] px-8 py-20 text-center sm:px-16 sm:py-28"
              style={{ background: p.navy }}
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)",
                  }}
                />
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Stop paying{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #10B981, #34D399)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    5–9% fees
                  </span>
                </h2>
                <p
                  className="mx-auto mt-6 max-w-md text-lg"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  1% flat. No reserves. No account freezes. Non-custodial
                  stablecoin settlement that no bank can interfere with.
                </p>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/waitlist"
                    className="group inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      boxShadow: "0 4px 24px rgba(16,185,129,0.3)",
                    }}
                  >
                    Apply for the Private Rail
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/compare/settlr-vs-cash-armored-cars"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    Compare vs Cash
                  </Link>
                </div>
              </div>
            </div>
          </R>
        </div>
      </section>

      <Footer />
    </div>
  );
}
