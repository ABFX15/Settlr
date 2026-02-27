"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  DollarSign,
  Shield,
  Clock,
  Truck,
  AlertTriangle,
  Lock,
  Banknote,
  Users,
  Zap,
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
    category: "Annual Cost ($2M Revenue)",
    items: [
      {
        label: "Payment processing fees",
        cash: "$0 (but see below)",
        settlr: "$20,000 (1% flat)",
        winner: "cash",
      },
      {
        label: "Armored car pickups (3x/week)",
        cash: "$36,000–$72,000",
        settlr: "$0",
        winner: "settlr",
      },
      {
        label: "Cash counting labor (2hr/day)",
        cash: "$18,000–$28,000",
        settlr: "$0",
        winner: "settlr",
      },
      {
        label: "Safe & vault equipment",
        cash: "$5,000–$15,000",
        settlr: "$0",
        winner: "settlr",
      },
      {
        label: "Cash handling insurance",
        cash: "$6,000–$12,000",
        settlr: "$0",
        winner: "settlr",
      },
      {
        label: "Shrinkage & employee theft",
        cash: "$10,000–$60,000 (0.5–3%)",
        settlr: "$0",
        winner: "settlr",
      },
      {
        label: "CIT (cash-in-transit) insurance",
        cash: "$3,000–$8,000",
        settlr: "$0",
        winner: "settlr",
      },
    ],
  },
  {
    category: "Operations",
    items: [
      {
        label: "Settlement speed",
        cash: "1–3 business days (after deposit)",
        settlr: "< 2 seconds",
        winner: "settlr",
      },
      {
        label: "24/7 availability",
        cash: "No — bank hours only",
        settlr: "Yes — 24/7/365",
        winner: "settlr",
      },
      {
        label: "B2B supplier payments",
        cash: "Physical cash handoff",
        settlr: "Instant digital transfer",
        winner: "settlr",
      },
      {
        label: "Audit trail",
        cash: "Manual logs, camera footage",
        settlr: "Cryptographic on-chain receipts",
        winner: "settlr",
      },
      {
        label: "Employee safety risk",
        cash: "High — armed robberies",
        settlr: "None — no physical cash",
        winner: "settlr",
      },
    ],
  },
  {
    category: "Compliance & Risk",
    items: [
      {
        label: "IRS audit readiness",
        cash: "Manual reconciliation",
        settlr: "Automatic on-chain records",
        winner: "settlr",
      },
      {
        label: "FinCEN SAR filing",
        cash: "Required for all cash deposits",
        settlr: "KYB screening at onboarding",
        winner: "settlr",
      },
      {
        label: "State seed-to-sale integration",
        cash: "Manual data entry",
        settlr: "Receipt ID mapping",
        winner: "settlr",
      },
      {
        label: "Robbery / theft exposure",
        cash: "$8.8M lost industry-wide (2024)",
        settlr: "Zero — digital only",
        winner: "settlr",
      },
    ],
  },
];

/* ── FAQ data ──────────────────────────────────────────── */
const faqs = [
  {
    q: "How much does armored car service cost for cannabis businesses?",
    a: "Armored car service for cannabis businesses costs between $2,000 and $8,000 per month depending on pickup frequency, location, and provider. For a dispensary doing 3 pickups per week, expect $36,000 to $72,000 annually. Providers include Loomis, Garda World, and regional specialists.",
  },
  {
    q: "What is the total cost of cash handling for a dispensary?",
    a: "The total cost of cash handling for a dispensary processing $2 million annually is estimated at $78,000 to $195,000 per year when factoring in armored transport, counting labor, insurance, safe equipment, shrinkage, and opportunity cost. On Settlr, the same volume costs $20,000 at 1% flat.",
  },
  {
    q: "Is stablecoin settlement safer than cash for cannabis businesses?",
    a: "Yes. Stablecoin settlement eliminates all physical security risks associated with cash — armed robberies, employee theft, transport vulnerabilities, and counting errors. All transactions are cryptographically verified on-chain with immutable audit trails.",
  },
  {
    q: "Can I completely eliminate cash with Settlr?",
    a: "For B2B supply chain payments (distributor-to-cultivator, processor-to-distributor), yes — Settlr can replace 100% of cash transactions. For retail consumer sales, most dispensaries will maintain some cash acceptance alongside Settlr-powered digital payments.",
  },
];

/* ════════════════════════════════════════════════════════ */
/*  PAGE                                                   */
/* ════════════════════════════════════════════════════════ */
export default function SettlrVsCashPage() {
  const cashTotal = "$78,000 – $195,000";
  const settlrTotal = "$20,000";

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

      {/* Structured data — ComparisonPage / Article */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "Settlr vs Cash & Armored Cars: Cannabis Payment Cost Comparison 2026",
            description:
              "Complete cost comparison between cash handling (armored cars, safes, counting labor) and Settlr stablecoin settlement for cannabis businesses. A dispensary processing $2M/year can save $58,000–$175,000 annually.",
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
              <Truck className="h-3.5 w-3.5" style={{ color: p.green }} />
              Cost Comparison
            </div>
          </R>

          <R delay={0.06}>
            <h1
              className="mt-8 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: p.navy }}
            >
              Settlr vs Cash &{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Armored Cars
              </span>
            </h1>
          </R>

          <R delay={0.12}>
            <p
              className="mx-auto mt-6 max-w-lg text-lg leading-relaxed"
              style={{ color: p.slate }}
            >
              Cannabis businesses spend $78K–$195K per year on cash logistics.
              Here&apos;s the line-by-line breakdown of what you&apos;re
              actually paying — and what Settlr costs instead.
            </p>
          </R>

          {/* AEO entity sentence */}
          <p className="sr-only">
            Armored car service for cannabis businesses costs between $2,000 and
            $8,000 per month. The total cost of cash handling for a dispensary
            processing $2 million annually is estimated at $78,000 to $195,000
            per year. Settlr provides an alternative stablecoin settlement rail
            at 1% flat ($20,000 on $2M), saving $58,000 to $175,000 annually.
          </p>
        </div>
      </section>

      {/* ═══════ COST HEADLINE ═══════ */}
      <section style={{ background: p.navy }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <R>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 text-center">
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Cash & Armored Cars
                </p>
                <p
                  className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl"
                  style={{ color: p.red }}
                >
                  {cashTotal}
                </p>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  per year on $2M revenue
                </p>
              </div>
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Settlr
                </p>
                <p
                  className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl"
                  style={{ color: p.green }}
                >
                  {settlrTotal}
                </p>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  per year on $2M revenue (1% flat)
                </p>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE ═══════ */}
      <section className="py-32 sm:py-48" style={{ background: p.bgSubtle }}>
        <div className="mx-auto max-w-5xl px-6">
          <R className="text-center">
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              Line-by-line cost comparison
            </h2>
            <p className="mt-5 text-lg" style={{ color: p.slate }}>
              Based on a single-location dispensary processing $2M annually.
            </p>
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
                  {/* Header */}
                  <div
                    className="grid grid-cols-3 gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ background: p.bgMuted, color: p.muted }}
                  >
                    <div>Item</div>
                    <div className="text-center">Cash / Armored Cars</div>
                    <div className="text-center">Settlr</div>
                  </div>
                  {/* Rows */}
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
                      <div
                        className="text-center"
                        style={{
                          color: item.winner === "cash" ? p.green : p.slate,
                          fontWeight: item.winner === "cash" ? 600 : 400,
                        }}
                      >
                        {item.cash}
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

          {/* Total */}
          <R delay={0.12}>
            <div
              className="mt-10 overflow-hidden rounded-2xl"
              style={{ background: p.navy }}
            >
              <div className="grid grid-cols-3 gap-4 px-6 py-6">
                <div className="text-base font-bold text-white">
                  Estimated Annual Total
                </div>
                <div
                  className="text-center text-base font-bold"
                  style={{ color: p.red }}
                >
                  {cashTotal}
                </div>
                <div
                  className="text-center text-base font-bold"
                  style={{ color: p.green }}
                >
                  {settlrTotal}
                </div>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ═══════ HIDDEN RISKS ═══════ */}
      <section className="py-32 sm:py-48">
        <div className="mx-auto max-w-5xl px-6">
          <R className="text-center">
            <h2
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: p.navy }}
            >
              The hidden costs of cash
            </h2>
            <p className="mt-5 text-lg" style={{ color: p.slate }}>
              Beyond the dollars, cash creates operational risks that don&apos;t
              show on a balance sheet.
            </p>
          </R>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: AlertTriangle,
                title: "Armed robbery risk",
                desc: "Cannabis businesses are 4–5× more likely to be robbed than other retail. In 2024, dispensary robberies resulted in $8.8M in losses industry-wide.",
              },
              {
                icon: Users,
                title: "Employee theft",
                desc: "Internal theft accounts for 1–3% of revenue at cash-heavy businesses. That's $20,000–$60,000 on $2M revenue.",
              },
              {
                icon: Clock,
                title: "Lost productivity",
                desc: "Staff spend 2–4 hours daily counting, reconciling, and securing cash. That's $15,000–$25,000 in annual labor costs.",
              },
              {
                icon: Banknote,
                title: "Vendor payment friction",
                desc: "Paying suppliers in cash requires in-person handoffs, armed escorts, and manual paperwork. One $50K payment can take an entire day.",
              },
              {
                icon: Shield,
                title: "IRS audit exposure",
                desc: "Cash-intensive businesses face 3× higher audit rates. Manual reconciliation is error-prone and expensive to defend.",
              },
              {
                icon: Lock,
                title: "Growth ceiling",
                desc: "Cash-only operations can't scale efficiently. Multi-location expansion multiplies every cost by the number of locations.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <R key={item.title} delay={i * 0.04}>
                  <div
                    className="h-full rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-md"
                    style={{
                      background: p.white,
                      border: cardBorder,
                    }}
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
                  Save{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #10B981, #34D399)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    $58K–$175K
                  </span>{" "}
                  per year
                </h2>
                <p
                  className="mx-auto mt-6 max-w-md text-lg"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Replace cash logistics with 1% digital settlement. No armored
                  cars, no safes, no shrinkage.
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
                    href="/compare"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    Compare All Providers
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
