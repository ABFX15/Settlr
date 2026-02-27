"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  X,
  Minus,
  Shield,
  Zap,
  Globe,
  Clock,
} from "lucide-react";
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

/* ─── Data ─── */
const providers = [
  { name: "Settlr", highlight: true },
  { name: "Stripe" },
  { name: "Coinbase Commerce" },
  { name: "NOWPayments" },
  { name: "BitPay" },
];

const features: {
  category: string;
  rows: {
    label: string;
    values: (string | boolean | null)[];
    note?: string;
  }[];
}[] = [
  {
    category: "Pricing & Fees",
    rows: [
      {
        label: "Transaction fee",
        values: ["1% flat", "2.9% + 30¢", "1%", "0.5–1%", "1–2%"],
        note: "Stripe source: stripe.com/pricing. Coinbase: commerce.coinbase.com. NOWPayments: nowpayments.io/pricing.",
      },
      {
        label: "Monthly fee",
        values: ["$0", "$0", "$0", "From $0", "From $0"],
      },
      {
        label: "Setup fee",
        values: ["$0", "$0", "$0", "$0", "$0"],
      },
      {
        label: "Chargeback fee",
        values: ["N/A — impossible", "$15 per dispute", "N/A", "N/A", "$15"],
        note: "Stablecoin transactions are final and irreversible on-chain. Stripe chargeback fee: stripe.com/docs/disputes.",
      },
      {
        label: "Cost on $10K/mo",
        values: ["$100", "$320+", "$100", "$50–100", "$100–200"],
      },
    ],
  },
  {
    category: "Settlement & Speed",
    rows: [
      {
        label: "Settlement time",
        values: [
          "< 1 second",
          "2–7 business days",
          "1–2 days",
          "Instant (crypto)",
          "1–2 days",
        ],
        note: "Solana settlement finality is ~400ms. Source: Solana docs (solana.com/docs). Stripe: 2 business days standard, up to 7 for new accounts.",
      },
      {
        label: "Settlement currency",
        values: [
          "USDC/USDT stablecoin",
          "Fiat (bank account)",
          "Crypto or fiat",
          "Crypto",
          "Fiat or BTC",
        ],
      },
      {
        label: "Weekend settlement",
        values: [true, false, false, true, false],
      },
    ],
  },
  {
    category: "Custody & Security",
    rows: [
      {
        label: "Non-custodial",
        values: [true, false, false, false, false],
        note: "Settlr uses on-chain smart contracts — funds flow directly to your wallet. Other providers hold funds temporarily.",
      },
      {
        label: "Chargebacks possible",
        values: [false, true, false, false, true],
      },
      {
        label: "KYC required for buyers",
        values: [false, false, false, false, true],
      },
    ],
  },
  {
    category: "Developer Experience",
    rows: [
      {
        label: "Integration time",
        values: [
          "< 30 minutes",
          "1–3 days",
          "< 1 hour",
          "< 1 hour",
          "1–3 days",
        ],
      },
      {
        label: "React/Next.js SDK",
        values: [true, true, false, false, false],
      },
      {
        label: "Webhook support",
        values: [true, true, true, true, true],
      },
      {
        label: "TypeScript SDK",
        values: [true, true, false, true, false],
      },
      {
        label: "Embedded wallets (email login)",
        values: [true, false, false, false, false],
        note: "Settlr uses Privy for embedded wallets — customers pay with email, no crypto wallet needed.",
      },
      {
        label: "Gasless transactions",
        values: [true, "N/A", false, false, false],
        note: "Settlr uses Kora (backed by Solana Foundation) for gasless transactions.",
      },
    ],
  },
  {
    category: "Payments & Coverage",
    rows: [
      {
        label: "Recurring billing",
        values: [true, true, false, true, true],
      },
      {
        label: "Countries supported",
        values: ["180+", "47 (payout)", "100+", "200+", "229"],
        note: "Stripe payout availability is limited to 47 countries. Source: stripe.com/global.",
      },
      {
        label: "Stablecoin support",
        values: [
          "USDC, USDT, USDG",
          "USDC (limited)",
          "USDC, DAI, + more",
          "USDT, USDC, + more",
          "None",
        ],
      },
      {
        label: "Multi-chain",
        values: [
          "Solana + EVM bridges",
          "No",
          "Ethereum, Polygon, Base",
          "200+ coins",
          "BTC, ETH, + few",
        ],
      },
    ],
  },
];

function CellValue({ value }: { value: string | boolean | null }) {
  if (value === true)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
        <Check className="h-3.5 w-3.5 text-[#10B981]" />
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
        <X className="h-3.5 w-3.5 text-red-400/60" />
      </span>
    );
  if (value === null) return <Minus className="h-4 w-4 text-[#94A3B8]/60" />;
  return <span className="text-sm text-[#4A5568]">{value}</span>;
}

/* ═══════════════════════════════════════
   PAGE
   ═══════════════════════════════════════ */
export default function ComparePage() {
  return (
    <main
      className="relative min-h-screen bg-[#FFFFFF] text-[#4A5568] antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* JSON-LD for comparison page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Crypto Payment Gateway Comparison — Settlr vs Stripe vs Coinbase Commerce",
            description:
              "Detailed comparison of crypto payment gateways including fees, settlement speed, custody model, developer experience, and global coverage.",
            url: "https://settlr.dev/compare",
            mainEntity: {
              "@type": "Table",
              about:
                "Comparison of crypto payment processors: Settlr, Stripe, Coinbase Commerce, NOWPayments, BitPay",
            },
          }),
        }}
      />

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10B981]/[0.04] blur-[150px]" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#10B981]">
              Payment gateway comparison
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl font-semibold tracking-tight text-[#0A0F1E] md:text-5xl lg:text-6xl">
              Best crypto payment gateway{" "}
              <span className="text-[#10B981]">for 2026</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#94A3B8]">
              How does Settlr compare to Stripe, Coinbase Commerce, NOWPayments,
              and BitPay? We break down fees, settlement speed, custody model,
              developer experience, and global coverage so you can make an
              informed decision.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Quick wins summary ── */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: "66% lower fees",
              text: "1% flat vs Stripe's 2.9% + 30¢",
              color: "#3B82F6",
            },
            {
              icon: Clock,
              title: "604,800× faster",
              text: "< 1s settlement vs 7-day bank hold",
              color: "#3B82F6",
            },
            {
              icon: Shield,
              title: "Fully non-custodial",
              text: "Only Settlr among major providers",
              color: "#34d399",
            },
            {
              icon: Globe,
              title: "180+ countries",
              text: "vs Stripe's 47 payout countries",
              color: "#fbbf24",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div
                className="rounded-xl border-l-2 bg-[#FAFAFA] p-5"
                style={{ borderColor: item.color }}
              >
                <item.icon
                  className="mb-2 h-5 w-5"
                  style={{ color: item.color }}
                />
                <p className="text-sm font-semibold text-[#0A0F1E]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {features.map((section, si) => (
          <Reveal key={section.category} delay={si * 0.05}>
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-[#0A0F1E]">
                {section.category}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                      <th className="py-3 pl-5 pr-3 text-left text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                        Feature
                      </th>
                      {providers.map((p) => (
                        <th
                          key={p.name}
                          className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                            p.highlight ? "text-[#10B981]" : "text-[#94A3B8]"
                          }`}
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, ri) => (
                      <tr
                        key={row.label}
                        className={`border-b border-[#E5E7EB] ${
                          ri % 2 === 0 ? "" : "bg-[#FAFAFA]"
                        }`}
                      >
                        <td className="py-3.5 pl-5 pr-3">
                          <span className="text-sm text-[#4A5568]">
                            {row.label}
                          </span>
                          {row.note && (
                            <p className="mt-0.5 text-[10px] leading-tight text-[#94A3B8]/60">
                              {row.note}
                            </p>
                          )}
                        </td>
                        {row.values.map((val, vi) => (
                          <td
                            key={vi}
                            className={`px-3 py-3.5 text-center ${
                              vi === 0 ? "bg-[#10B981]/[0.03]" : ""
                            }`}
                          >
                            <CellValue value={val} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        ))}

        {/* Sources */}
        <Reveal>
          <div className="mt-8 rounded-xl bg-[#FAFAFA] p-6">
            <h3 className="mb-3 text-sm font-semibold text-[#94A3B8]">
              Sources &amp; methodology
            </h3>
            <ul className="space-y-1.5 text-xs leading-relaxed text-[#94A3B8]">
              <li>
                • Stripe pricing and settlement data from{" "}
                <a
                  href="https://stripe.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#4A5568]"
                >
                  stripe.com/pricing
                </a>{" "}
                and{" "}
                <a
                  href="https://stripe.com/global"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#4A5568]"
                >
                  stripe.com/global
                </a>
                . Accessed February 2026.
              </li>
              <li>
                • Coinbase Commerce data from{" "}
                <a
                  href="https://commerce.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#4A5568]"
                >
                  commerce.coinbase.com
                </a>
                . Accessed February 2026.
              </li>
              <li>
                • NOWPayments pricing from{" "}
                <a
                  href="https://nowpayments.io/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#4A5568]"
                >
                  nowpayments.io/pricing
                </a>
                . Accessed February 2026.
              </li>
              <li>
                • Global crypto ownership: 562M+ owners per{" "}
                <a
                  href="https://triple-a.io/cryptocurrency-ownership-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#4A5568]"
                >
                  Triple-A Cryptocurrency Ownership Data (2024)
                </a>
                .
              </li>
              <li>
                • Solana settlement finality (~400ms) per{" "}
                <a
                  href="https://solana.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#4A5568]"
                >
                  Solana documentation
                </a>
                .
              </li>
              <li>
                • Traditional bank settlement (2–7 days) per{" "}
                <a
                  href="https://www.federalreserve.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#4A5568]"
                >
                  Federal Reserve payment system data
                </a>
                .
              </li>
              <li>
                • All data verified as of February 2026. Pricing may vary by
                plan and volume.
              </li>
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#E5E7EB] bg-gradient-to-b from-[#FAFAFA] to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A0F1E] md:text-4xl">
              Ready to ditch card network gatekeeping?
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-4 max-w-lg text-[#94A3B8]">
              Switch to Settlr in under 30 minutes. No content restrictions,
              instant settlement, 1% flat. Built for creator platforms.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#10B981]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                }}
              >
                Start integrating
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-7 py-3.5 text-[15px] font-medium text-[#4A5568] transition-colors hover:bg-[#F5F5F5] hover:text-[#0A0F1E]"
              >
                Read the docs
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
