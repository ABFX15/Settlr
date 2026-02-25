"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Wallet,
  Lock,
  Globe,
  DollarSign,
  TrendingUp,
  X,
  Ban,
  AlertTriangle,
  Leaf,
  Building2,
  Truck,
  FileText,
  Scale,
  BadgeCheck,
  ShieldAlert,
  Banknote,
  HandCoins,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ─────────────── DATA ─────────────── */

const features = [
  {
    icon: Ban,
    title: "Can't Be Debanked",
    description:
      "Non-custodial USDC payments need no bank account. No processor, no merchant account, nothing to freeze.",
    stat: "0",
    statLabel: "bank dependency",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description:
      "Pay cultivators, processors, and distributors in seconds. No more waiting days for ACH or wires to clear.",
    stat: "<1s",
    statLabel: "settlement",
  },
  {
    icon: DollarSign,
    title: "1% Flat — No Surprises",
    description:
      "Stop paying 5-8% to cannabis-friendly processors. One flat fee, no hidden charges, no rolling reserves.",
    stat: "1%",
    statLabel: "flat fee",
  },
  {
    icon: Shield,
    title: "Compliance Built In",
    description:
      "Every wallet screened against OFAC sanctions. Full audit trail on-chain. Give regulators what they need.",
    stat: "OFAC",
    statLabel: "screening",
  },
  {
    icon: Lock,
    title: "Private Transactions",
    description:
      "Competitor intel is real. TEE-private receipts hide supplier volumes and pricing from on-chain observers.",
    stat: "TEE",
    statLabel: "privacy",
  },
  {
    icon: Globe,
    title: "Multi-State, No Hassle",
    description:
      "Operating in multiple states? One payment rail works everywhere. No state-by-state banking headaches.",
    stat: "50",
    statLabel: "states",
  },
];

const painPoints = [
  {
    icon: Ban,
    problem: "Debanked — Again",
    detail: "Average cannabis business loses banking 3x in first 2 years",
  },
  {
    icon: Banknote,
    problem: "Cash-Heavy Operations",
    detail: "Armed transport, vault storage, cash counting = $1000s/month",
  },
  {
    icon: DollarSign,
    problem: "Predatory Fees",
    detail: "5-8% processing from the few willing processors",
  },
  {
    icon: AlertTriangle,
    problem: "Compliance Risk",
    detail: "Inadequate audit trails invite regulatory scrutiny",
  },
  {
    icon: Clock,
    problem: "Slow Supplier Payments",
    detail: "Multi-day ACH delays strain vendor relationships",
  },
];

const stats = [
  { value: "$30B+", label: "US Legal Cannabis Market" },
  { value: "70%+", label: "Still Cash-Dependent" },
  { value: "$0", label: "Debanking Risk with Settlr" },
  { value: "1%", label: "Flat Processing Fee" },
];

const useCases = [
  {
    name: "Cultivators",
    icon: Leaf,
    detail: "Pay trim crews, suppliers, and equipment vendors",
  },
  {
    name: "Processors",
    icon: Building2,
    detail: "Settle with growers and packaging suppliers",
  },
  {
    name: "Distributors",
    icon: Truck,
    detail: "Pay cultivators and manage multi-state logistics",
  },
  {
    name: "Dispensaries",
    icon: HandCoins,
    detail: "Pay distributors and manage vendor invoices",
  },
];

const comparisonRows = [
  {
    feature: "Bank account required?",
    traditional: "Yes (and it gets closed)",
    settlr: "No bank needed",
  },
  {
    feature: "Processing fee",
    traditional: "5-8%",
    settlr: "1% flat",
  },
  {
    feature: "Settlement time",
    traditional: "3-5 business days",
    settlr: "Under 1 second",
  },
  {
    feature: "Cash handling costs",
    traditional: "$1,000-5,000/mo",
    settlr: "$0",
  },
  {
    feature: "Compliance audit trail",
    traditional: "Paper receipts",
    settlr: "On-chain + exportable",
  },
  {
    feature: "Multi-state support",
    traditional: "Re-apply per state",
    settlr: "Works everywhere",
  },
  {
    feature: "Weekend/holiday",
    traditional: "No processing",
    settlr: "24/7/365",
  },
  {
    feature: "Account closure risk",
    traditional: "High — at bank's discretion",
    settlr: "Zero — non-custodial",
  },
];

const faqItems = [
  {
    q: "Is this legal? How does this comply with cannabis regulations?",
    a: "Settlr processes payments in USDC (a regulated US dollar stablecoin issued by Circle, a licensed money transmitter). Because Settlr is non-custodial — we never hold or touch your funds — we operate as a software tool, not a money services business. Your state cannabis license and existing compliance remain in effect. Every transaction has a full on-chain audit trail that regulators can verify independently.",
  },
  {
    q: "What happens when the SAFE Banking Act passes?",
    a: "When federal banking reform comes, you'll have options. Until then, you need to operate today. Settlr gives you reliable, instant B2B payments right now — and if banks open up, you can still keep using us for the speed, fee savings, and privacy benefits. Most clients find Settlr is better than traditional banking even without the debanking problem.",
  },
  {
    q: "How do my suppliers receive payments? Do they need crypto knowledge?",
    a: "Your suppliers receive USDC to a wallet. They can set up in under 2 minutes using just an email address — no crypto expertise required. From there they can hold USDC (it's always worth $1), convert to cash via integrated offramp partners, or transfer to any other wallet. We handle all the blockchain complexity so they don't have to.",
  },
  {
    q: "How does this compare to paying with cash?",
    a: "Cash costs more than people realize: armored transport ($500-2,000/mo), vault/safe costs, cash counting labor, theft/loss risk, and the compliance headache of documenting everything manually. With Settlr, every payment is instant, trackable, and creates an automatic audit trail. No security vans, no counting rooms, no shrinkage.",
  },
  {
    q: "Can competitors see our payment activity on-chain?",
    a: "Not with privacy mode enabled. Settlr uses TEE-based private transactions (MagicBlock Private Ephemeral Rollups) that hide payment amounts from on-chain observers while transactions are being processed. Your supplier relationships and pricing remain confidential.",
  },
  {
    q: "What about IRS 280E tax requirements?",
    a: "Every Settlr transaction is recorded on-chain with timestamps and amounts, giving you a clean, immutable record for tax purposes. You can export transaction history for your accountant. This is actually better than cash for 280E documentation since every payment is independently verifiable.",
  },
];

/* ─────────────── PAGE ─────────────── */

export default function CannabisPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  return (
    <main className="min-h-screen bg-[#FDFBF7]" ref={containerRef}>
      {/* FAQ Schema for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
      {/* Organization + Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Settlr Cannabis B2B Payments",
            description:
              "Non-custodial USDC payment infrastructure for cannabis and marijuana businesses. Pay cultivators, processors, and distributors instantly without bank accounts.",
            provider: {
              "@type": "Organization",
              name: "Settlr",
              url: "https://settlr.dev",
            },
            serviceType: "Cannabis Payment Processing",
            areaServed: "US",
            url: "https://settlr.dev/industries/cannabis",
          }),
        }}
      />
      <Navbar />

      {/* ───── Hero ───── */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-24">
        {/* Gradient background — earthy green */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,197,94,0.25),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
        </div>

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-gradient-to-br from-[#22c55e]/20 to-[#a855f7]/15 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[5%] top-[40%] h-48 w-48 rounded-full bg-gradient-to-br from-[#16a34a]/20 to-[#22d3ee]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-2">
            {/* Left — Hero copy */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-2">
                <Leaf className="h-4 w-4 text-[#22c55e]" />
                <span className="text-sm font-medium text-[#22c55e]">
                  Cannabis & Marijuana B2B Payments
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-[#0C1829] md:text-7xl">
                Stop getting
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#15803d] bg-clip-text text-transparent">
                    debanked.
                  </span>
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                  >
                    <motion.path
                      d="M2 10C50 2 150 2 298 10"
                      stroke="url(#cannabis-underline)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="cannabis-underline"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="50%" stopColor="#16a34a" />
                        <stop offset="100%" stopColor="#15803d" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </h1>

              <p className="mb-8 max-w-lg text-lg text-[#7C8A9E]">
                Pay cultivators, processors, and distributors instantly in USDC.
                No bank account required. No account to freeze. No cash vans.
                Just fast, compliant B2B payments that actually work for
                cannabis.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-6 py-3.5 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#22c55e]/15"
                >
                  Join the Waitlist
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] bg-[#F3F2ED] px-6 py-3.5 font-semibold text-[#0C1829] backdrop-blur-sm transition-all hover:bg-[#F3F2ED]"
                >
                  See How It Works
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-[#7C8A9E]">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-[#22c55e]/60" />
                  OFAC Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[#22c55e]/60" />
                  Non-Custodial
                </span>
                <span className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-[#22c55e]/60" />
                  Full Audit Trail
                </span>
              </div>
            </motion.div>

            {/* Right — Bento preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid gap-4">
                {/* Top row */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#22c55e]/20 bg-gradient-to-br from-[#22c55e]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Ban className="mb-3 h-8 w-8 text-[#22c55e]" />
                    <div className="text-3xl font-bold text-[#0C1829]">Zero</div>
                    <div className="text-sm text-[#7C8A9E]">Bank dependency</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#16a34a]/20 bg-gradient-to-br from-[#16a34a]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <DollarSign className="mb-3 h-8 w-8 text-[#16a34a]" />
                    <div className="text-3xl font-bold text-[#0C1829]">1%</div>
                    <div className="text-sm text-[#7C8A9E]">vs 5-8% typical</div>
                  </motion.div>
                </div>

                {/* Large card */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative overflow-hidden rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-sm"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-[#22c55e]/20 to-transparent" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-[#22c55e]/20 p-2">
                        <Truck className="h-6 w-6 text-[#22c55e]" />
                      </div>
                      <span className="text-lg font-semibold text-[#0C1829]">
                        Eliminate Cash Transport
                      </span>
                    </div>
                    <p className="text-[#7C8A9E]">
                      No more armored vans, counting rooms, or vault storage.
                      Digital payments that settle in seconds with a complete
                      compliance trail.
                    </p>
                  </div>
                </motion.div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#22c55e]/20 bg-gradient-to-br from-[#22c55e]/5 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Zap className="mb-3 h-8 w-8 text-[#22c55e]" />
                    <div className="text-3xl font-bold text-[#0C1829]">&lt;1s</div>
                    <div className="text-sm text-[#7C8A9E]">Settlement</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-[#E2DFD5] bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm"
                  >
                    <Shield className="mb-3 h-8 w-8 text-[#0C1829]" />
                    <div className="text-3xl font-bold text-[#0C1829]">24/7</div>
                    <div className="text-sm text-[#7C8A9E]">Always on</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── Stats Banner — Green ───── */}
      <section className="relative bg-[#22c55e] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-2 text-4xl font-bold text-black md:text-5xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-black/70">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pain Points ───── */}
      <section className="relative overflow-hidden bg-white/[0.01] px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              The cannabis & marijuana banking
              <span className="text-red-500"> crisis is real</span>
            </h2>
            <p className="mx-auto max-w-2xl text-[#7C8A9E]">
              Your business is legal. Your products are tested. Your licenses
              are up to date. Yet banks keep closing your accounts, and the
              processors who'll work with you charge extortionate fees.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {painPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.problem}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl border-2 border-red-500/20 bg-red-500/5 p-6 transition-all hover:border-red-500/40 hover:bg-red-500/10"
                >
                  <div className="absolute right-2 top-2 text-red-500/20">
                    <X className="h-8 w-8" />
                  </div>
                  <Icon className="mb-4 h-8 w-8 text-red-400" />
                  <h3 className="mb-2 font-semibold text-[#0C1829]">
                    {point.problem}
                  </h3>
                  <p className="text-sm text-[#7C8A9E]">{point.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section id="how-it-works" className="relative px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-2">
              <FileText className="h-4 w-4 text-[#22c55e]" />
              <span className="text-sm font-medium text-[#22c55e]">
                Simple Setup
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              How cannabis & marijuana B2B payments work
            </h2>
            <p className="mx-auto max-w-2xl text-[#7C8A9E]">
              No bank relationship needed. No merchant account application. No
              approval wait. Set up in minutes.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Create Invoice",
                desc: "Enter amount, add your supplier's email address. That's it.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Supplier Gets Link",
                desc: "They receive a payment link. Pay with USDC — no wallet or crypto knowledge needed.",
                icon: Wallet,
              },
              {
                step: "03",
                title: "Instant Settlement",
                desc: "Payment settles in under 1 second on Solana. Both parties see confirmation immediately.",
                icon: Zap,
              },
              {
                step: "04",
                title: "Audit Trail Ready",
                desc: "Every payment timestamped on-chain. Export for compliance, taxes, and regulators.",
                icon: Scale,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative rounded-2xl border border-[#E2DFD5] bg-white/[0.02] p-6"
                >
                  <div className="mb-4 text-5xl font-black text-[#22c55e]/20">
                    {item.step}
                  </div>
                  <div className="mb-3 inline-flex rounded-xl bg-[#22c55e]/10 p-3">
                    <Icon className="h-6 w-6 text-[#22c55e]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0C1829]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#7C8A9E]">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Use Cases ───── */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-[#0C1829]">
              Built for every part of the supply chain
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={useCase.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[#22c55e]/20 bg-[#FDFBF7] p-6 text-center shadow-lg transition-all hover:border-[#22c55e] hover:shadow-xl"
                >
                  <div className="rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] p-3">
                    <Icon className="h-6 w-6 text-[#0C1829]" />
                  </div>
                  <span className="font-semibold text-[#0C1829]">
                    {useCase.name}
                  </span>
                  <span className="text-xs text-[#7C8A9E]">
                    {useCase.detail}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Features Grid — Green gradient ───── */}
      <section className="relative bg-gradient-to-br from-[#22c55e] to-[#16a34a] px-4 py-24">
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5]/30 bg-white/10 px-4 py-2">
              <Check className="h-4 w-4 text-[#0C1829]" />
              <span className="text-sm font-medium text-[#0C1829]">
                Why Settlr for Cannabis
              </span>
            </div>
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829] md:text-5xl">
              Payments that can&apos;t be
              <br />
              <span className="text-[#0C1829]">shut down.</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative rounded-2xl border border-[#E2DFD5] bg-white/10 p-8 backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3">
                      <Icon className="h-6 w-6 text-[#0C1829]" />
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-[#0C1829]">
                        {feature.stat}
                      </span>
                      <span className="ml-2 text-sm text-[#3B4963]">
                        {feature.statLabel}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-[#0C1829]">
                      {feature.title}
                    </h3>
                    <p className="text-[#0C1829]">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Comparison Table ───── */}
      <section className="relative bg-[#FDFBF7] px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              Traditional Cannabis Banking vs.{" "}
              <span className="text-[#22c55e]">Settlr</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-[#E2DFD5] bg-white/[0.02]"
          >
            <div className="grid grid-cols-3 border-b border-[#E2DFD5] bg-white/[0.02]">
              <div className="p-4 text-sm font-medium text-[#7C8A9E]">
                Feature
              </div>
              <div className="p-4 text-center text-sm font-medium text-red-400">
                Traditional
              </div>
              <div className="p-4 text-center text-sm font-medium text-[#22c55e]">
                Settlr
              </div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 ${
                  index !== comparisonRows.length - 1
                    ? "border-b border-[#E2DFD5]"
                    : ""
                }`}
              >
                <div className="p-4 text-sm text-[#0C1829]">{row.feature}</div>
                <div className="p-4 text-center text-sm text-[#7C8A9E]">
                  {row.traditional}
                </div>
                <div className="p-4 text-center text-sm font-medium text-[#22c55e]">
                  {row.settlr}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-[#0C1829]">
              Frequently Asked Questions
            </h2>
            <p className="text-[#7C8A9E]">
              We know the cannabis industry has unique concerns. Here are the
              questions we hear most.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group rounded-xl border border-[#E2DFD5] bg-white/[0.02] [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 text-[#0C1829] font-medium hover:text-[#22c55e] transition-colors">
                  <span>{item.q}</span>
                  <span className="ml-4 shrink-0 text-[#7C8A9E] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-[#7C8A9E]">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#22c55e]/10 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-2">
            <TrendingUp className="h-4 w-4 text-[#22c55e]" />
            <span className="text-sm font-medium text-[#22c55e]">
              Ready to ditch the bank drama?
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-[#0C1829] md:text-5xl">
            Your business is legal.
            <br />
            <span className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] bg-clip-text text-transparent">
              Your payments should be too.
            </span>
          </h2>

          <p className="mb-8 text-lg text-[#7C8A9E]">
            Join cannabis operators moving from cash and unreliable banks to
            instant, compliant USDC payments. Set up in minutes, not months.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/waitlist"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-8 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#22c55e]/15"
            >
              Join the Waitlist
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2DFD5] bg-[#F3F2ED] px-8 py-4 font-semibold text-[#0C1829] backdrop-blur-sm transition-all hover:bg-[#F3F2ED]"
            >
              Read the Docs
            </Link>
          </div>

          <p className="mt-6 text-xs text-[#7C8A9E]/60">
            Non-custodial · OFAC compliant · Full audit trail · No bank account
            needed
          </p>
        </motion.div>
      </section>

      {/* ───── Related Reading ───── */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-8"
          >
            <h3 className="mb-3 text-xl font-semibold text-[#0C1829]">
              📖 Related: Your Cannabis Business Got Debanked — Now What?
            </h3>
            <p className="mb-4 text-[#7C8A9E]">
              70% of US cannabis and marijuana businesses have lost banking
              access at least once. Read our deep-dive on why banks keep closing
              accounts, what it costs you, and how B2B stablecoin payments
              eliminate the problem entirely.
            </p>
            <Link
              href="/blog/cannabis-debanked-how-to-pay-suppliers"
              className="inline-flex items-center gap-2 font-medium text-[#22c55e] transition-colors hover:text-[#16a34a]"
            >
              Read the full guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
