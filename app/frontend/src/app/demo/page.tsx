"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  ArrowRight,
  Check,
  FileText,
  Clock,
  Shield,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  Stamp,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ─── spring config ─── */
const spring = { type: "spring" as const, stiffness: 80, damping: 18 };

/* ─── Settlr Verified Seal ─── */
function VerifiedSeal({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/[0.08] px-3 py-1 ${className}`}
    >
      <Stamp className="h-3.5 w-3.5 text-[#059669]" />
      <span
        className="text-[11px] font-semibold uppercase tracking-wider text-[#059669]"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        Settlr Verified
      </span>
    </div>
  );
}

/* ─── Settlement progress animation ─── */
function SettlementProgress() {
  const [settled, setSettled] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (settled) return;
    const interval = setInterval(() => {
      setElapsed((e) => {
        if (e >= 4.0) return 4.0;
        return Math.round((e + 0.1) * 10) / 10;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [settled]);

  useEffect(() => {
    if (settled) setElapsed(4.0);
  }, [settled]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Traditional Rail */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#B8860B]" />
          <span className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
            Traditional Wire
          </span>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
            <motion.div
              className="h-full rounded-full bg-[#B8860B]/40"
              initial={{ width: "0%" }}
              animate={{ width: "12%" }}
              transition={{ duration: 3, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium text-[#B8860B]"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            PENDING
          </span>
          <span className="text-xs text-[#94A3B8]">Est. 3-5 business days</span>
        </div>
        <div className="mt-4 rounded-lg bg-[#FFFBEB] p-3">
          <p className="text-xs text-[#92400E]">
            <strong>⚠ Notice:</strong> Subject to manual bank review. High-risk
            MCC codes may trigger additional holds or account freeze.
          </p>
        </div>
      </div>

      {/* Settlr Rail */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 transition-all duration-500"
        style={{
          borderColor: settled ? "#10B981" : "#E5E7EB",
          background: settled
            ? "linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.01))"
            : "white",
        }}
      >
        {/* Settled pulse ring */}
        <AnimatePresence>
          {settled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.4, 1.8] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl border-2 border-[#10B981]"
            />
          )}
        </AnimatePresence>

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#059669]" />
            <span className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
              Settlr Private Rail
            </span>
          </div>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#10B981]/10">
              <motion.div
                className="h-full rounded-full bg-[#10B981]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {settled ? (
                <motion.div
                  key="settled"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={spring}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5 text-[#059669]" />
                  <span
                    className="text-sm font-bold text-[#059669]"
                    style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                    }}
                  >
                    SETTLED
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="confirming"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium text-[#059669]"
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                  }}
                >
                  CONFIRMING...
                </motion.span>
              )}
            </AnimatePresence>
            <span
              className="text-xs text-[#94A3B8]"
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            >
              T+{elapsed.toFixed(1)}s
            </span>
          </div>

          <AnimatePresence>
            {settled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.3, ...spring }}
                className="mt-4 rounded-lg bg-[#10B981]/[0.08] p-3"
              >
                <p className="text-xs text-[#059669]">
                  <strong>✓ Final.</strong> Non-custodial settlement complete.
                  Funds cannot be frozen, reversed, or clawed back.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Reveal wrapper ─── */
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

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function DemoPage() {
  const txId = "5KQrV...gT8mZ";
  const fullTxId =
    "5KQrVxH9Bc3nGfKpM2wLj7dR4sTv6YhN8aE1uXqW0cFbJmA3iDpZoUy9tXgT8mZ";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-4 pb-20 pt-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.10),transparent)]" />
          </div>
          <div className="absolute right-[15%] top-[20%] h-72 w-72 rounded-full bg-[#10B981]/[0.06] blur-[120px]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F5F5F5] px-4 py-2"
            >
              <Fingerprint className="h-4 w-4 text-[#059669]" />
              <span className="text-sm font-medium text-[#4A5568]">
                Institutional Demo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 text-5xl font-bold leading-[1.08] text-[#0A0F1E] md:text-7xl"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
            >
              Settlement <span className="text-[#059669]">Certainty</span>,
              <br />
              Not Settlement{" "}
              <span className="text-[#94A3B8] line-through decoration-[#B91C1C]/40 decoration-2">
                Anxiety
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#94A3B8]"
            >
              Walk through a real B2B cannabis settlement — from invoice
              generation to final receipt. Non-custodial, instant, with a
              cryptographic trail your auditors will love.
            </motion.p>
          </div>
        </section>

        {/* ──────────────── STEP 1: THE CLEAN INVOICE ──────────────── */}
        <section className="relative px-4 pb-28">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-sm font-bold text-white">
                  1
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
                  The Clean Invoice
                </span>
              </div>
              <h2
                className="mb-4 text-3xl font-bold text-[#0A0F1E] md:text-4xl"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Cryptographically-Secured. Bank-Free.
              </h2>
              <p className="mb-10 max-w-2xl text-[#94A3B8]">
                Generate cryptographically-secured invoices. Your recipient pays
                in USDC/PYUSD. No bank routing numbers to leak, no wire
                instructions to mistype.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              {/* Glassmorphism invoice card */}
              <div className="relative">
                {/* Ledger background pattern */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, #0A0F1E 0px, #0A0F1E 1px, transparent 1px, transparent 32px)",
                  }}
                />

                <div
                  className="relative rounded-2xl border border-white/60 p-8 shadow-xl backdrop-blur-sm md:p-10"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.88))",
                    boxShadow:
                      "0 8px 32px rgba(10,15,30,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  {/* Header */}
                  <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <h3
                          className="text-xl font-bold text-[#0A0F1E]"
                          style={{
                            fontFamily: "var(--font-fraunces), Georgia, serif",
                          }}
                        >
                          Invoice #INV-2026-0891
                        </h3>
                        <VerifiedSeal />
                      </div>
                      <p className="text-sm text-[#94A3B8]">
                        Issued Feb 26, 2026 · Due on receipt
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-[#10B981]/20 bg-[#10B981]/[0.06] px-3 py-1.5">
                      <Shield className="h-3.5 w-3.5 text-[#059669]" />
                      <span className="text-xs font-medium text-[#059669]">
                        Compliant with GENIUS Act (2025)
                      </span>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="mb-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        From
                      </p>
                      <p className="font-semibold text-[#0A0F1E]">
                        Pacific Growers Collective, LLC
                      </p>
                      <p className="text-sm text-[#94A3B8]">
                        License #C12-0004782-LIC · Portland, OR
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        To
                      </p>
                      <p className="font-semibold text-[#0A0F1E]">
                        Emerald Distribution Partners
                      </p>
                      <p className="text-sm text-[#94A3B8]">
                        License #D09-0011294-LIC · Denver, CO
                      </p>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="mb-8 overflow-hidden rounded-2xl border border-[#E5E7EB]">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#E5E7EB] bg-[#F5F5F5]/60">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        <tr>
                          <td className="px-4 py-3 text-sm text-[#0A0F1E]">
                            Bulk Flower — Indoor Premium (Hybrid)
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm text-[#4A5568]"
                            style={{
                              fontFamily: "var(--font-jetbrains), monospace",
                            }}
                          >
                            15 lbs
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm text-[#4A5568]"
                            style={{
                              fontFamily: "var(--font-jetbrains), monospace",
                            }}
                          >
                            $2,800.00
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm font-medium text-[#0A0F1E]"
                            style={{
                              fontFamily: "var(--font-jetbrains), monospace",
                            }}
                          >
                            $42,000.00
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-[#0A0F1E]">
                            Hydroponic Equipment — LED Array (x2)
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm text-[#4A5568]"
                            style={{
                              fontFamily: "var(--font-jetbrains), monospace",
                            }}
                          >
                            2
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm text-[#4A5568]"
                            style={{
                              fontFamily: "var(--font-jetbrains), monospace",
                            }}
                          >
                            $1,500.00
                          </td>
                          <td
                            className="px-4 py-3 text-right text-sm font-medium text-[#0A0F1E]"
                            style={{
                              fontFamily: "var(--font-jetbrains), monospace",
                            }}
                          >
                            $3,000.00
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="flex items-end justify-between">
                    <div className="text-sm text-[#94A3B8]">
                      Payment accepted in USDC or PYUSD
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Total Due
                      </p>
                      <p
                        className="text-4xl font-bold text-[#0A0F1E] md:text-5xl"
                        style={{
                          fontFamily: "var(--font-fraunces), Georgia, serif",
                        }}
                      >
                        $45,000
                        <span className="text-2xl text-[#94A3B8]">.00</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ──────────────── STEP 2: THE MAGIC MOMENT ──────────────── */}
        <section className="relative px-4 pb-28">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-sm font-bold text-white">
                  2
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
                  T+0 Settlement
                </span>
              </div>
              <h2
                className="mb-4 text-3xl font-bold text-[#0A0F1E] md:text-4xl"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                Settled. Not Pending.
              </h2>
              <p className="mb-10 max-w-2xl text-[#94A3B8]">
                In the cannabis world, &ldquo;settled&rdquo; means the money is
                safe — it can&apos;t be frozen, reversed, or clawed back. Watch
                a $45,000 B2B settlement finalize in real time.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <SettlementProgress />
            </Reveal>
          </div>
        </section>

        {/* ──────────────── STEP 3: THE CFO RECEIPT ──────────────── */}
        <section className="relative px-4 pb-28">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-sm font-bold text-white">
                  3
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
                  The Audit Trail
                </span>
              </div>
              <h2
                className="mb-4 text-3xl font-bold text-[#0A0F1E] md:text-4xl"
                style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
              >
                The Receipt Your CFO Actually Wants
              </h2>
              <p className="mb-10 max-w-2xl text-[#94A3B8]">
                Instant reconciliation for your books. Give your auditors a
                clear, immutable trail that proves every dollar is from a
                verified source.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              {/* Receipt card — glassmorphism */}
              <div
                className="relative rounded-2xl border border-white/60 p-8 shadow-xl backdrop-blur-sm md:p-10"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.88))",
                  boxShadow:
                    "0 8px 32px rgba(10,15,30,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                {/* Receipt header */}
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Settlement Receipt
                    </p>
                    <h3
                      className="text-xl font-bold text-[#0A0F1E]"
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                      }}
                    >
                      #INV-2026-0891
                    </h3>
                  </div>
                  <VerifiedSeal />
                </div>

                {/* Receipt grid */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Settlement Amount
                    </p>
                    <p
                      className="text-2xl font-bold text-[#0A0F1E]"
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                      }}
                    >
                      $45,000.00
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      45,000.000000 USDC
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Time to Finality
                    </p>
                    <p
                      className="text-2xl font-bold text-[#059669]"
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                      }}
                    >
                      4.0s
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      vs. 3-5 days traditional
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Platform Fee
                    </p>
                    <p
                      className="text-2xl font-bold text-[#0A0F1E]"
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                      }}
                    >
                      $450.00
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      1.00% flat · No hidden fees
                    </p>
                  </div>
                </div>

                {/* On-chain details */}
                <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      On-Chain Transaction
                    </span>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#059669] hover:underline"
                    >
                      View on Solscan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <code
                      className="flex-1 truncate rounded-md bg-[#0A0F1E]/[0.04] px-3 py-2 text-xs text-[#4A5568]"
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                      }}
                    >
                      {fullTxId}
                    </code>
                    <button className="shrink-0 rounded-md border border-[#E5E7EB] bg-white p-2 text-[#94A3B8] transition-colors hover:text-[#0A0F1E]">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-[#94A3B8]">Block</p>
                      <p
                        className="text-sm font-medium text-[#0A0F1E]"
                        style={{
                          fontFamily: "var(--font-jetbrains), monospace",
                        }}
                      >
                        #298,412,067
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Timestamp</p>
                      <p
                        className="text-sm font-medium text-[#0A0F1E]"
                        style={{
                          fontFamily: "var(--font-jetbrains), monospace",
                        }}
                      >
                        2026-02-26 14:32:08 UTC
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Network Fee</p>
                      <p
                        className="text-sm font-medium text-[#0A0F1E]"
                        style={{
                          fontFamily: "var(--font-jetbrains), monospace",
                        }}
                      >
                        0.000005 SOL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compliance stamps */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    "KYB Verified",
                    "AML Screened",
                    "GENIUS Act Compliant",
                    "BSA Reporting Ready",
                  ].map((stamp) => (
                    <div
                      key={stamp}
                      className="flex items-center gap-1.5 rounded-full border border-[#10B981]/15 bg-[#10B981]/[0.05] px-3 py-1.5"
                    >
                      <Check className="h-3 w-3 text-[#059669]" />
                      <span className="text-xs font-medium text-[#059669]">
                        {stamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden px-4 py-24">
          <div className="absolute inset-0 bg-[#0A0F1E]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.15),transparent)]" />

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
              Stop Paying the Exile Tax
            </h2>
            <p className="mb-8 text-[#94A3B8]">
              Join the operators replacing 8% high-risk processors with a 1%
              non-custodial settlement rail. Apply for early access.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background:
                    "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                }}
              >
                Request Access
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Create a Payment Link
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
