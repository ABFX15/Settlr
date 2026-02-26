"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  ArrowRight,
  Shield,
  Scale,
  FileCheck,
  Fingerprint,
  Building2,
  Eye,
  Lock,
  CheckCircle2,
  BookOpen,
  Globe,
  AlertTriangle,
  Stamp,
} from "lucide-react";

/* ─── palette ─── */
const palette = {
  cream: "#FFFFFF",
  navy: "#0A0F1E",
  slate: "#4A5568",
  muted: "#94A3B8",
  green: "#059669",
  gold: "#B8860B",
  cardBorder: "#E5E7EB",
  red: "#B91C1C",
};

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 80, damping: 18 };

/* ─── Reveal wrapper ─── */
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
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section anchor component ─── */
function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-32" />;
}

/* ─── Compliance badge ─── */
function ComplianceBadge({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/[0.08] px-3 py-1">
      <Icon className="h-3.5 w-3.5 text-[#059669]" />
      <span
        className="text-[11px] font-semibold uppercase tracking-wider text-[#059669]"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Timeline item ─── */
function TimelineItem({
  step,
  title,
  description,
  children,
  last = false,
}: {
  step: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="relative pl-10">
      {/* connector line */}
      {!last && (
        <div
          className="absolute left-[15px] top-10 h-[calc(100%_-_8px)] w-px"
          style={{ backgroundColor: palette.cardBorder }}
        />
      )}
      {/* dot */}
      <div
        className="absolute left-2 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: palette.green }}
      >
        {step}
      </div>
      <h4
        className="text-base font-semibold leading-snug"
        style={{
          color: palette.navy,
          fontFamily: "var(--font-fraunces), serif",
        }}
      >
        {title}
      </h4>
      <p
        className="mt-1 text-sm leading-relaxed"
        style={{ color: palette.slate }}
      >
        {description}
      </p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPLIANCE WHITEPAPER PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function CompliancePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.cream }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pb-20 pt-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="mb-6 flex items-center justify-center gap-3">
              <ComplianceBadge label="2026 Whitepaper" icon={BookOpen} />
              <ComplianceBadge label="v2.1" icon={FileCheck} />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1
              className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-fraunces), serif",
              }}
            >
              Compliance Without
              <br />
              <span style={{ color: palette.green }}>Compromise</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
              style={{ color: palette.slate }}
            >
              How Settlr achieves full regulatory compliance for
              restricted-commerce B2B settlements — without custody, without
              banks, and without compromising on speed or privacy.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-4">
              {[
                { href: "#genius-act", label: "GENIUS Act" },
                { href: "#bsa-aml", label: "BSA/AML" },
                { href: "#kyb", label: "KYB Process" },
                { href: "#architecture", label: "Architecture" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-white/60"
                  style={{
                    borderColor: palette.cardBorder,
                    color: palette.navy,
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── EXECUTIVE SUMMARY ── */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div
              className="rounded-2xl border p-8 sm:p-10"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5" style={{ color: palette.green }} />
                <h2
                  className="text-xl font-bold"
                  style={{
                    color: palette.navy,
                    fontFamily: "var(--font-fraunces), serif",
                  }}
                >
                  Executive Summary
                </h2>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: palette.slate }}
              >
                Settlr is a <strong>non-custodial</strong> settlement protocol —
                a software layer, not a money services business. We never hold,
                pool, or have unilateral control over user funds. Payments move
                directly between counterparties via on-chain smart contracts on
                Solana.
              </p>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: palette.slate }}
              >
                This architecture means Settlr is{" "}
                <strong>not a money transmitter</strong> under federal FinCEN
                guidance (FIN-2019-G001) or the majority of state money
                transmission statutes. We are a technology provider that
                facilitates peer-to-peer stablecoin transfers with embedded
                compliance tooling.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Non-Custodial", icon: Lock },
                  { label: "No MTL Required", icon: Building2 },
                  { label: "GENIUS Act Ready", icon: Shield },
                  { label: "Full Audit Trail", icon: Eye },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center"
                    style={{ borderColor: palette.cardBorder }}
                  >
                    <item.icon
                      className="h-4 w-4"
                      style={{ color: palette.green }}
                    />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: palette.navy }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 1 — GENIUS ACT
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="genius-act" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 1
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-fraunces), serif",
              }}
            >
              GENIUS Act of 2025
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              The{" "}
              <strong>
                Guiding and Establishing National Innovation for U.S.
                Stablecoins (GENIUS) Act
              </strong>
              , signed into law in 2025, established the first comprehensive
              federal framework for payment stablecoins in the United States.
              Here is how Settlr aligns with every major provision.
            </p>
          </Reveal>

          <div className="mt-12 space-y-8">
            {[
              {
                title: "Permitted Payment Stablecoins Only",
                description:
                  "Settlr exclusively uses USDC issued by Circle — a fully reserved, audited, and GENIUS Act-compliant payment stablecoin. We do not support algorithmic, offshore, or unregistered stablecoins. Every dollar that flows through Settlr is backed 1:1 by U.S. Treasury obligations and cash equivalents.",
                badge: "§3 — Definitions",
              },
              {
                title: "Issuer Compliance Requirements",
                description:
                  "Circle, as the USDC issuer, maintains registration with FinCEN, state-level licenses, and undergoes monthly reserve attestations by a Big Four accounting firm. Settlr verifies that all stablecoins routed through our protocol originate from compliant issuers — a check embedded at the smart contract level.",
                badge: "§4 — Registration",
              },
              {
                title: "Redemption Guarantees",
                description:
                  "USDC provides 1:1 redemption to U.S. dollars on demand. Because Settlr is non-custodial, recipients can redeem their USDC directly through Circle or any compliant on-ramp/off-ramp. We never create a redemption bottleneck — there is no pooling, no lock-up, and no withdrawal queue.",
                badge: "§5 — Redemption",
              },
              {
                title: "Reserve & Transparency Requirements",
                description:
                  "Circle publishes monthly reserve reports and undergoes annual audits under the GENIUS Act's transparency mandate. Settlr surfaces this information in our compliance dashboard, giving operators direct visibility into the backing of every dollar settled on our rails.",
                badge: "§6 — Reserves",
              },
              {
                title: "Consumer & Business Protection",
                description:
                  "By operating non-custodially on public blockchain infrastructure (Solana), every Settlr transaction produces an immutable, timestamped receipt. Both counterparties can independently verify settlement status, amount, and timing — no reliance on Settlr's systems for proof of payment.",
                badge: "§8 — Protection",
              },
              {
                title: "Interoperability & Open Standards",
                description:
                  "Settlr is built on Solana's public, permissionless infrastructure using open-source smart contracts. Our protocol is interoperable with any wallet, exchange, or DeFi protocol that supports SPL tokens. No vendor lock-in, no proprietary rails, no walled gardens.",
                badge: "§10 — Interoperability",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h3
                      className="text-lg font-bold"
                      style={{
                        color: palette.navy,
                        fontFamily: "var(--font-fraunces), serif",
                      }}
                    >
                      {item.title}
                    </h3>
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        borderColor: palette.green + "33",
                        color: palette.green,
                        fontFamily: "var(--font-jetbrains), monospace",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — BSA/AML
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="bsa-aml" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Eye className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 2
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-fraunces), serif",
              }}
            >
              BSA/AML Framework
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              While Settlr is not a money transmitter, we proactively implement
              Bank Secrecy Act and Anti-Money Laundering controls as a matter of
              principles — and because our customers in restricted industries
              need this protection to operate confidently.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Fingerprint,
                title: "OFAC Screening",
                description:
                  "Every wallet address is screened against the OFAC SDN (Specially Designated Nationals) list before a transaction is processed. Blocked wallets cannot initiate or receive payments through Settlr. Screening runs in real-time, not in batch.",
              },
              {
                icon: AlertTriangle,
                title: "Transaction Monitoring",
                description:
                  "Settlr monitors settlement patterns for anomalous activity — unusual volumes, rapid-fire transactions, structuring patterns, and sanctioned-jurisdiction exposure. Flagged transactions are held for manual review before settlement.",
              },
              {
                icon: FileCheck,
                title: "Suspicious Activity Reporting",
                description:
                  "When transaction monitoring surfaces activity consistent with money laundering, structuring, or sanctions evasion, Settlr files Suspicious Activity Reports (SARs) with FinCEN. Our compliance team maintains direct filing capability.",
              },
              {
                icon: Globe,
                title: "Jurisdiction Controls",
                description:
                  "Settlr enforces geographic restrictions at the protocol level. IP geolocation and wallet provenance checks block transactions originating from OFAC-sanctioned jurisdictions (Cuba, Iran, North Korea, Syria, Crimea, et al.).",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <item.icon
                    className="mb-3 h-5 w-5"
                    style={{ color: palette.green }}
                  />
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: palette.navy,
                      fontFamily: "var(--font-fraunces), serif",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* AML compliance timeline */}
          <Reveal delay={0.1}>
            <div
              className="mt-10 rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <h3
                className="mb-6 text-lg font-bold"
                style={{
                  color: palette.navy,
                  fontFamily: "var(--font-fraunces), serif",
                }}
              >
                Transaction Lifecycle — AML Controls
              </h3>
              <div className="space-y-6">
                <TimelineItem
                  step="1"
                  title="Pre-Transaction Screening"
                  description="Both sender and receiver wallets are screened against OFAC SDN, UN sanctions lists, and known high-risk addresses. Blocked wallets are rejected before any on-chain activity occurs."
                />
                <TimelineItem
                  step="2"
                  title="Real-Time Risk Scoring"
                  description="Each transaction receives a risk score based on amount, counterparty history, geographic signals, and pattern analysis. Scores above threshold trigger enhanced review."
                />
                <TimelineItem
                  step="3"
                  title="Settlement Execution"
                  description="Approved transactions are routed through on-chain smart contracts. The settlement instruction, compliance metadata, and timestamps are embedded in the transaction — immutable and auditable."
                />
                <TimelineItem
                  step="4"
                  title="Post-Settlement Audit"
                  description="Completed settlements are logged with full compliance stamps (KYB status, OFAC screening result, risk score, timestamp). This data is available via API and dashboard for auditor access."
                  last
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — KYB PROCESS
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="kyb" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 3
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-fraunces), serif",
              }}
            >
              KYB Verification Process
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Every business on Settlr goes through Know Your Business
              verification before their first settlement. This is non-negotiable
              — even for industries that banks refuse to serve.
            </p>
          </Reveal>

          <div className="mt-12 space-y-6">
            {[
              {
                step: "1",
                title: "Business Entity Verification",
                description:
                  "We verify the legal existence and good standing of the business entity — articles of incorporation, state registrations, EIN confirmation, and operating licenses. For cannabis operators, this includes state cannabis license verification.",
              },
              {
                step: "2",
                title: "Beneficial Ownership Identification",
                description:
                  "All individuals with 25%+ ownership or significant management control are identified and verified. We collect government-issued ID, proof of address, and run identity verification checks against public records and watchlists.",
              },
              {
                step: "3",
                title: "Industry-Specific Compliance",
                description:
                  "For cannabis businesses: state license verification, Metrc/BioTrack integration capability, and confirmation of operation within legal state boundaries. For adult content platforms: age verification systems audit and content moderation policy review.",
              },
              {
                step: "4",
                title: "Bank & Financial Verification",
                description:
                  "We verify that the business has a legitimate banking relationship (or is actively seeking one — many of our customers are underbanked by design of the traditional system). Off-ramp and on-ramp pathways are established during onboarding.",
              },
              {
                step: "5",
                title: "Ongoing Monitoring",
                description:
                  "KYB is not a one-time check. Settlr performs periodic re-verification (quarterly for restricted industries), monitors for adverse media, regulatory actions, and changes in ownership structure. License expirations trigger automatic review.",
                last: true,
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <TimelineItem
                  step={item.step}
                  title={item.title}
                  description={item.description}
                  last={item.last || false}
                />
              </Reveal>
            ))}
          </div>

          {/* KYB data table */}
          <Reveal delay={0.15}>
            <div
              className="mt-10 overflow-hidden rounded-2xl border"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <div
                className="border-b p-4 sm:p-6"
                style={{ borderColor: palette.cardBorder }}
              >
                <h3
                  className="text-base font-bold"
                  style={{
                    color: palette.navy,
                    fontFamily: "var(--font-fraunces), serif",
                  }}
                >
                  Required KYB Documentation
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#FAFAFA" }}>
                      <th
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                        style={{ color: palette.muted }}
                      >
                        Document
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                        style={{ color: palette.muted }}
                      >
                        Standard
                      </th>
                      <th
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider sm:px-6"
                        style={{ color: palette.muted }}
                      >
                        Cannabis
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        doc: "Articles of Incorporation",
                        standard: true,
                        cannabis: true,
                      },
                      { doc: "EIN / Tax ID", standard: true, cannabis: true },
                      {
                        doc: "State Business License",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Cannabis License (State)",
                        standard: false,
                        cannabis: true,
                      },
                      {
                        doc: "Beneficial Owner IDs",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Proof of Address",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Bank Account Verification",
                        standard: true,
                        cannabis: true,
                      },
                      {
                        doc: "Metrc/BioTrack License #",
                        standard: false,
                        cannabis: true,
                      },
                    ].map((row, i) => (
                      <tr
                        key={row.doc}
                        className="border-t"
                        style={{ borderColor: palette.cardBorder }}
                      >
                        <td
                          className="px-4 py-3 font-medium sm:px-6"
                          style={{ color: palette.navy }}
                        >
                          {row.doc}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          {row.standard ? (
                            <CheckCircle2
                              className="h-4 w-4"
                              style={{ color: palette.green }}
                            />
                          ) : (
                            <span style={{ color: palette.muted }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          {row.cannabis ? (
                            <CheckCircle2
                              className="h-4 w-4"
                              style={{ color: palette.green }}
                            />
                          ) : (
                            <span style={{ color: palette.muted }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — ARCHITECTURE
         ═══════════════════════════════════════════ */}
      <SectionAnchor id="architecture" />
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5" style={{ color: palette.green }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: palette.green }}
              >
                Section 4
              </span>
            </div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                color: palette.navy,
                fontFamily: "var(--font-fraunces), serif",
              }}
            >
              Compliance Architecture
            </h2>
            <p
              className="mt-4 max-w-2xl text-sm leading-relaxed"
              style={{ color: palette.slate }}
            >
              Compliance is not a feature bolted on after the fact — it is
              embedded in every layer of the Settlr protocol. Here is how it
              works end-to-end.
            </p>
          </Reveal>

          {/* Architecture diagram (text-based) */}
          <Reveal delay={0.05}>
            <div
              className="mt-10 overflow-x-auto rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <pre
                className="text-[11px] leading-relaxed sm:text-xs"
                style={{
                  color: palette.slate,
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                {`┌─────────────────────────────────────────────────────┐
│                   SETTLR PROTOCOL                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐   │
│  │  SENDER  │──▶│  SETTLR  │──▶│   RECEIVER   │   │
│  │  WALLET  │   │  SMART   │   │   WALLET     │   │
│  └──────────┘   │ CONTRACT │   └──────────────┘   │
│       │         └──────────┘          │            │
│       │              │                │            │
│       ▼              ▼                ▼            │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │   OFAC   │  │ COMPLIANCE│  │   ON-CHAIN   │   │
│  │ SCREENING│  │  STAMPS   │  │   RECEIPT    │   │
│  └──────────┘  │  ├─ KYB   │  │  ├─ Amount   │   │
│                │  ├─ AML   │  │  ├─ Time     │   │
│                │  ├─ OFAC  │  │  ├─ Parties  │   │
│                │  └─ GENIUS│  │  └─ TX Hash  │   │
│                └───────────┘  └──────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │              AUDIT TRAIL (IMMUTABLE)         │   │
│  │  Every transaction → on-chain + off-chain    │   │
│  │  Exportable via API for regulatory review    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </Reveal>

          {/* Key architectural decisions */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Non-Custodial by Design",
                description:
                  "Settlr smart contracts are escrow programs — funds move atomically from sender to receiver in a single transaction. At no point does Settlr (or any Settlr-controlled wallet) have unilateral control over user funds.",
              },
              {
                title: "On-Chain Compliance Stamps",
                description:
                  "Every settlement embeds compliance metadata directly in the transaction: KYB verification status, OFAC screening result, and GENIUS Act compliance flag. This data is immutable and auditable by any third party.",
              },
              {
                title: "Gasless via Kora Fee Payer",
                description:
                  "Users don't need SOL for gas. Settlr's Kora integration covers transaction fees, removing friction while maintaining full self-custody. The fee payer is a signing service, not a custodian.",
              },
              {
                title: "Privacy via TEE (MagicBlock PER)",
                description:
                  "Sensitive transaction details (pricing, counterparty identities) can be encrypted using Trusted Execution Environments via MagicBlock PER. This protects trade secrets while maintaining the compliance audit trail.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: palette.cardBorder,
                    backgroundColor: "white",
                  }}
                >
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: palette.navy,
                      fontFamily: "var(--font-fraunces), serif",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: palette.slate }}
                  >
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGULATORY LANDSCAPE ── */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: palette.cardBorder,
                backgroundColor: "white",
              }}
            >
              <h3
                className="mb-6 text-xl font-bold"
                style={{
                  color: palette.navy,
                  fontFamily: "var(--font-fraunces), serif",
                }}
              >
                Regulatory Landscape — 2026
              </h3>
              <div className="space-y-4">
                {[
                  {
                    regulation: "GENIUS Act (2025)",
                    status: "Enacted",
                    impact:
                      "Federal stablecoin framework. Settlr uses only compliant payment stablecoins (USDC). Non-custodial providers are software providers, not regulated entities.",
                    color: palette.green,
                  },
                  {
                    regulation: "FinCEN MSB Guidance (2019)",
                    status: "Active",
                    impact:
                      'FIN-2019-G001 clarifies that non-custodial software providers are not money transmitters. Settlr\'s architecture aligns with the "non-custodial wallet" classification.',
                    color: palette.green,
                  },
                  {
                    regulation: "Bank Secrecy Act (BSA)",
                    status: "Active",
                    impact:
                      "Settlr voluntarily implements BSA-grade controls (OFAC screening, transaction monitoring, SAR filing) as a best practice for operating in restricted industries.",
                    color: palette.green,
                  },
                  {
                    regulation: "MiCA (EU, 2024)",
                    status: "Active",
                    impact:
                      "Markets in Crypto-Assets regulation governs EU operations. USDC (Circle) is MiCA-compliant. Settlr's European operations leverage this established framework.",
                    color: palette.green,
                  },
                  {
                    regulation: "State Cannabis Regulations",
                    status: "Varies by State",
                    impact:
                      "Each state has unique cannabis compliance requirements. Settlr's KYB process verifies state-specific licenses and integrates with track-and-trace systems (Metrc, BioTrack).",
                    color: palette.gold,
                  },
                ].map((item, i) => (
                  <div
                    key={item.regulation}
                    className="flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-start sm:gap-4"
                    style={{ borderColor: palette.cardBorder }}
                  >
                    <div className="flex shrink-0 items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: item.color,
                          fontFamily: "var(--font-jetbrains), monospace",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <h4
                        className="text-sm font-bold"
                        style={{ color: palette.navy }}
                      >
                        {item.regulation}
                      </h4>
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: palette.slate }}
                      >
                        {item.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-32">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div
              className="rounded-2xl p-10 text-center sm:p-14"
              style={{ backgroundColor: palette.navy }}
            >
              <Stamp className="mx-auto mb-4 h-8 w-8 text-white/60" />
              <h2
                className="text-2xl font-bold text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                Compliance Should Not Be a Competitive Disadvantage
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/70">
                Your industry was abandoned by banks — not by regulators. Settlr
                gives you the compliance infrastructure that traditional finance
                refused to build for you.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/waitlist"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  }}
                >
                  Request Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
                >
                  See the Demo
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
