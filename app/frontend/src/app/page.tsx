"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  ChevronRight,
  Globe,
  Clock,
  Shield,
  Lock,
  Mail,
  DollarSign,
  Building2,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

/* ═══════════════════════════════════════════════════════════════════════════
   Design System — "Infrastructure Authority"
   ═══════════════════════════════════════════════════════════════════════════
   Palette:
     Cream   #FDFBF7  (page bg)
     Navy    #0C1829  (headings, strong text)
     Slate   #3B4963  (body text)
     Muted   #7C8A9E  (tertiary text)
     Green   #1B6B4A  (primary accent — "money green")
     Gold    #B8860B  (live data accents)
     Topo    #E8E4DA  (borders, topo texture lines)
   Fonts:
     Headings  → var(--font-fraunces)  (Fraunces serif)
     Body      → var(--font-inter)     (Inter)
     Data/Code → var(--font-jetbrains) (JetBrains Mono)
   ═══════════════════════════════════════════════════════════════════════════ */

const palette = {
  cream: "#FDFBF7",
  navy: "#0C1829",
  slate: "#3B4963",
  muted: "#7C8A9E",
  green: "#1B6B4A",
  greenLight: "#E6F2EC",
  gold: "#B8860B",
  topo: "#E8E4DA",
  white: "#FFFFFF",
  cardBorder: "#E2DFD5",
};

/* --- Glass card styles --- */
const glass = {
  card: {
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow:
      "0 8px 32px rgba(12, 24, 41, 0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
  },
  cardHover: {
    boxShadow:
      "0 12px 40px rgba(12, 24, 41, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
    border: "1px solid rgba(27, 107, 74, 0.2)",
  },
  strong: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow:
      "0 12px 48px rgba(12, 24, 41, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
  },
} as const;

/* --- Gradient button styles --- */
const greenGradient = {
  background: "linear-gradient(180deg, #2A9D6A 0%, #1B6B4A 100%)",
  boxShadow:
    "0 2px 12px rgba(27, 107, 74, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
};
const greenGradientHover = {
  boxShadow:
    "0 4px 20px rgba(27, 107, 74, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
  transform: "translateY(-1px)",
};

/* --- Reveal on scroll --- */
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
      initial={{ opacity: 0, y: 32, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* --- Copy-to-clipboard code block --- */
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre
        className="rounded-lg border px-5 py-4 text-sm leading-relaxed overflow-x-auto"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          background: palette.navy,
          color: "#c9d1d9",
          borderColor: "#1e2d3d",
        }}
      >
        <code>{code}</code>
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* --- Live network pulse (simulated) --- */
function LivePulse() {
  const cities = [
    { city: "Lagos", country: "Nigeria", amount: 14.2, time: 0.8 },
    { city: "Manila", country: "Philippines", amount: 47.5, time: 0.6 },
    { city: "São Paulo", country: "Brazil", amount: 125.0, time: 0.9 },
    { city: "Nairobi", country: "Kenya", amount: 32.0, time: 0.7 },
    { city: "Mumbai", country: "India", amount: 89.0, time: 0.5 },
    { city: "Mexico City", country: "Mexico", amount: 210.0, time: 0.8 },
    { city: "Buenos Aires", country: "Argentina", amount: 63.5, time: 1.1 },
    { city: "London", country: "UK", amount: 500.0, time: 0.4 },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % cities.length),
      3200,
    );
    return () => clearInterval(timer);
  }, []);

  const tx = cities[index];

  return (
    <div
      className="inline-flex items-center gap-3 rounded-full px-5 py-2.5"
      style={{
        ...glass.strong,
        boxShadow:
          "0 4px 16px rgba(12, 24, 41, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ background: palette.green }}
        />
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: palette.green }}
        />
      </span>
      <span
        className="text-sm"
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          color: palette.slate,
        }}
      >
        <span style={{ color: palette.gold, fontWeight: 600 }}>
          ${tx.amount.toFixed(2)}
        </span>{" "}
        → {tx.city}, {tx.country}{" "}
        <span style={{ color: palette.muted }}>({tx.time}s)</span>
      </span>
    </div>
  );
}

/* --- Savings calculator --- */
function SavingsCalculator() {
  const [volume, setVolume] = useState(25000);

  const paypal = volume * 0.05;
  const wire = (volume / 200) * 30;
  const settlr = volume * 0.01;
  const saving = Math.max(paypal, wire) - settlr;

  return (
    <div
      className="rounded-2xl p-8"
      style={{
        ...glass.strong,
      }}
    >
      <label
        className="block text-sm font-medium mb-3"
        style={{
          fontFamily: "var(--font-inter)",
          color: palette.slate,
        }}
      >
        Monthly payout volume
      </label>
      <div className="flex items-center gap-4 mb-6">
        <input
          type="range"
          min={1000}
          max={500000}
          step={1000}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-[#1B6B4A] h-2"
        />
        <span
          className="text-lg font-semibold tabular-nums min-w-[100px] text-right"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            color: palette.navy,
          }}
        >
          ${volume.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "PayPal International", cost: paypal, pct: "5%" },
          { label: "Wire Transfers", cost: wire, pct: "$30/ea" },
          { label: "Settlr", cost: settlr, pct: "1%", highlight: true },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border p-4 text-center"
            style={{
              background: item.highlight ? palette.greenLight : "#F7F6F1",
              borderColor: item.highlight ? palette.green : palette.cardBorder,
            }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: palette.muted }}
            >
              {item.label}
            </p>
            <p
              className="text-xl font-bold tabular-nums"
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
                color: item.highlight ? palette.green : palette.navy,
              }}
            >
              $
              {item.cost.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: palette.muted }}>
              {item.pct}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-4 text-center"
        style={{ background: palette.greenLight }}
      >
        <p className="text-sm" style={{ color: palette.green }}>
          You save{" "}
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            ${saving.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          /month with Settlr
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Interactive Playground — Code on left, Phone mockup on right
   ═══════════════════════════════════════════════════════════════════════════ */
function InteractivePlayground() {
  const [amount, setAmount] = useState(50);
  const [recipient, setRecipient] = useState("maria@example.com");
  const [memo, setMemo] = useState("March invoice");

  const codeString = `import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({ apiKey: "sk_live_..." });

await settlr.payout.create({
  amount: ${amount},
  currency: "USDC",
  recipient: "${recipient}",
  memo: "${memo}",
});`;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Code editor side */}
      <div>
        <div
          className="rounded-t-xl border border-b-0 px-4 py-2.5 flex items-center gap-2"
          style={{
            background: "#0d1117",
            borderColor: "#1e2d3d",
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span
            className="text-xs ml-2"
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              color: "#7C8A9E",
            }}
          >
            send-payout.ts
          </span>
        </div>
        <pre
          className="rounded-b-xl border px-5 py-5 text-sm leading-relaxed overflow-x-auto"
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            background: palette.navy,
            color: "#c9d1d9",
            borderColor: "#1e2d3d",
          }}
        >
          <code>
            <span style={{ color: "#ff7b72" }}>import</span>
            {" { Settlr } "}
            <span style={{ color: "#ff7b72" }}>from</span>
            {' "'}
            <span style={{ color: "#a5d6ff" }}>@settlr/sdk</span>
            {'";'}
            {"\n\n"}
            <span style={{ color: "#ff7b72" }}>const</span>
            {" settlr = "}
            <span style={{ color: "#ff7b72" }}>new</span>{" "}
            <span style={{ color: "#d2a8ff" }}>Settlr</span>
            {"({ "}
            <span style={{ color: "#79c0ff" }}>apiKey</span>
            {': "sk_live_..." });'}
            {"\n\n"}
            <span style={{ color: "#ff7b72" }}>await</span>
            {" settlr."}
            <span style={{ color: "#d2a8ff" }}>payout</span>
            {"."}
            <span style={{ color: "#d2a8ff" }}>create</span>
            {"({\n"}
            {"  "}
            <span style={{ color: "#79c0ff" }}>amount</span>
            {": "}
            <span style={{ color: "#79c0ff" }}>{amount}</span>
            {",\n"}
            {"  "}
            <span style={{ color: "#79c0ff" }}>currency</span>
            {': "'}
            <span style={{ color: "#a5d6ff" }}>USDC</span>
            {'",\n'}
            {"  "}
            <span style={{ color: "#79c0ff" }}>recipient</span>
            {': "'}
            <span style={{ color: "#a5d6ff" }}>{recipient}</span>
            {'",\n'}
            {"  "}
            <span style={{ color: "#79c0ff" }}>memo</span>
            {': "'}
            <span style={{ color: "#a5d6ff" }}>{memo}</span>
            {'",\n'});
          </code>
        </pre>

        {/* Editable controls */}
        <div
          className="mt-4 rounded-xl border p-4 space-y-3"
          style={{
            background: palette.white,
            borderColor: palette.cardBorder,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: palette.muted }}
          >
            Try it — edit the values
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                className="text-[11px] font-medium block mb-1"
                style={{ color: palette.muted }}
              >
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full rounded-lg border px-3 py-2 text-sm tabular-nums"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  borderColor: palette.cardBorder,
                  color: palette.navy,
                  background: "#F7F6F1",
                }}
              />
            </div>
            <div>
              <label
                className="text-[11px] font-medium block mb-1"
                style={{ color: palette.muted }}
              >
                Recipient
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  borderColor: palette.cardBorder,
                  color: palette.navy,
                  background: "#F7F6F1",
                }}
              />
            </div>
            <div>
              <label
                className="text-[11px] font-medium block mb-1"
                style={{ color: palette.muted }}
              >
                Memo
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  borderColor: palette.cardBorder,
                  color: palette.navy,
                  background: "#F7F6F1",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Phone mockup side */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Green glow behind phone */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[500px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(27,107,74,0.1) 0%, rgba(27,107,74,0.03) 50%, transparent 80%)",
              filter: "blur(30px)",
            }}
          />
          <div
            className="relative w-[300px] rounded-[2rem] border-[6px] overflow-hidden"
            style={{
              borderColor: palette.navy,
              background: "#FDFBF7",
              boxShadow:
                "0 25px 60px -12px rgba(12,24,41,0.2), 0 8px 24px -8px rgba(12,24,41,0.12)",
            }}
          >
            {/* Phone status bar */}
            <div
              className="flex items-center justify-between px-5 py-2"
              style={{ background: palette.white }}
            >
              <span
                className="text-[11px] font-semibold"
                style={{ color: palette.navy }}
              >
                9:41
              </span>
              <div className="flex gap-1">
                <div
                  className="w-4 h-2.5 rounded-sm border"
                  style={{ borderColor: palette.navy }}
                >
                  <div
                    className="w-3 h-1.5 rounded-[1px] m-[1px]"
                    style={{ background: palette.green }}
                  />
                </div>
              </div>
            </div>

            {/* Claim card */}
            <div className="px-5 py-6 space-y-4">
              <div className="text-center">
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold mb-2"
                  style={{ background: palette.green }}
                >
                  S
                </div>
                <p className="text-[11px]" style={{ color: palette.muted }}>
                  Settlr Payout
                </p>
              </div>

              <div
                className="rounded-xl p-4 text-center"
                style={{
                  background: "rgba(243, 242, 237, 0.7)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              >
                <p className="text-xs mb-1" style={{ color: palette.muted }}>
                  Payment for you
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    color: palette.navy,
                  }}
                >
                  ${amount.toFixed(2)}
                </p>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>
                  USDC — {recipient}
                </p>
                {memo && (
                  <p
                    className="text-xs mt-2 italic"
                    style={{ color: palette.slate }}
                  >
                    &ldquo;{memo}&rdquo;
                  </p>
                )}
              </div>

              <button
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-300"
                style={{ ...greenGradient }}
              >
                Cash Out to Bank
              </button>
              <button
                className="w-full rounded-xl border py-3 text-sm font-semibold transition-colors"
                style={{
                  borderColor: palette.cardBorder,
                  color: palette.navy,
                }}
              >
                Keep in USD Balance
              </button>

              <p
                className="text-center text-[10px]"
                style={{ color: palette.muted }}
              >
                Powered by Settlr · Non-custodial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOMEPAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  return (
    <>
      {/* ── Structured Data ── */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Settlr",
            url: "https://settlr.dev",
            applicationCategory: "FinanceApplication",
            operatingSystem: "All",
            description:
              "Pay contractors and freelancers in 180+ countries — no bank details, no wire fees, no frozen accounts. 1% flat, instant settlement on Solana.",
            offers: {
              "@type": "AggregateOffer",
              lowPrice: "0",
              highPrice: "0",
              priceCurrency: "USD",
              offerCount: "3",
              itemListElement: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "1% per transaction. Up to 500 payouts/month. No setup fees.",
                  url: "https://settlr.dev/pricing",
                },
                {
                  "@type": "Offer",
                  name: "Growth",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "0.75% per transaction. Unlimited payouts, batch payouts, recurring subscriptions.",
                  url: "https://settlr.dev/pricing",
                },
                {
                  "@type": "Offer",
                  name: "Enterprise",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "0.5% per transaction. Custom SLAs, white-labeling, dedicated support.",
                  url: "https://settlr.dev/pricing",
                },
              ],
            },
            featureList: [
              "Send USDC by email address",
              "Instant settlement on Solana",
              "Gasless transactions — recipients pay nothing",
              "Built-in off-ramp to 180+ countries",
              "Confidential transfers (SPL Token 2022)",
              "Non-custodial multisig treasury",
            ],
            sameAs: ["https://twitter.com/SettlrPay"],
          }),
        }}
      />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Settlr?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Settlr is a stablecoin payout API. Businesses use it to send USD-pegged stablecoin (USDC) to contractors, freelancers, or partners in 180+ countries using just an email address. No bank details, no wire fees, no frozen accounts.",
                },
              },
              {
                "@type": "Question",
                name: "Do recipients need a crypto wallet?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Settlr creates an embedded wallet automatically when someone receives their first stablecoin payment. Recipients can hold USDC, offramp to local currency, or transfer to any wallet.",
                },
              },
              {
                "@type": "Question",
                name: "What are Settlr's fees?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Transaction-based pricing from 0.5–1% depending on tier. No FX fees, no wire fees, no hidden charges. Compare that to PayPal's 5%+ for international transfers or $25+ per wire.",
                },
              },
              {
                "@type": "Question",
                name: "How fast do stablecoin payments settle?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Under one second. Settlr uses Solana for instant finality — no holds, no pending status, no multi-day bank processing.",
                },
              },
            ],
          }),
        }}
      />

      <div
        ref={containerRef}
        className="min-h-screen"
        style={{
          background: palette.cream,
          color: palette.slate,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        <Navbar />

        {/* ── Global transparent world map background ── */}
        <div
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
          style={{ opacity: 0.06 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sl_070722_51460_23.jpg"
            alt=""
            className="w-full h-full object-cover mix-blend-multiply"
            style={{ filter: "grayscale(1) contrast(1.1)" }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — HERO  (Layered Depth: topo → grain → content → floating UI)
           ═══════════════════════════════════════════════════════════════ */}
        <section className="relative pt-36 pb-28 sm:pt-44 sm:pb-36 overflow-hidden">
          {/* Layer 1 — Topographic contour lines (subtle global-logistics feel) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.045,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 300 Q75 270 150 300 T300 300 T450 300 T600 300' fill='none' stroke='%23004D40' stroke-width='0.8'/%3E%3Cpath d='M0 330 Q75 300 150 330 T300 330 T450 330 T600 330' fill='none' stroke='%23004D40' stroke-width='0.8'/%3E%3Cpath d='M0 270 Q75 240 150 270 T300 270 T450 270 T600 270' fill='none' stroke='%23004D40' stroke-width='0.8'/%3E%3Cpath d='M0 360 Q75 330 150 360 T300 360 T450 360 T600 360' fill='none' stroke='%23004D40' stroke-width='0.8'/%3E%3Cpath d='M0 240 Q75 210 150 240 T300 240 T450 240 T600 240' fill='none' stroke='%23004D40' stroke-width='0.8'/%3E%3Cpath d='M0 390 Q100 360 200 390 T400 390 T600 390' fill='none' stroke='%23004D40' stroke-width='0.6'/%3E%3Cpath d='M0 210 Q100 180 200 210 T400 210 T600 210' fill='none' stroke='%23004D40' stroke-width='0.6'/%3E%3Cpath d='M0 420 Q120 390 240 420 T480 420 T600 420' fill='none' stroke='%23004D40' stroke-width='0.4'/%3E%3Cpath d='M0 180 Q120 150 240 180 T480 180 T600 180' fill='none' stroke='%23004D40' stroke-width='0.4'/%3E%3C/svg%3E")`,
              backgroundSize: "600px 600px",
            }}
          />

          {/* Layer 2 — Film grain texture (2% noise for premium physical weight) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />

          {/* Layer 3 — Subtle radial gradient giving depth to center */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(253,251,247,0) 0%, rgba(232,228,218,0.3) 100%)",
            }}
          />

          <div className="container mx-auto max-w-7xl px-6 relative z-10">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
              {/* Left column — Copy + CTAs (3 cols) */}
              <div className="lg:col-span-3 text-center lg:text-left">
                {/* Live pulse badge */}
                <Reveal className="flex justify-center lg:justify-start mb-8">
                  <LivePulse />
                </Reveal>

                {/* Headline */}
                <Reveal>
                  <h1
                    className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
                    style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      color: palette.navy,
                    }}
                  >
                    The global rail
                    <br />
                    for moving{" "}
                    <span
                      style={{
                        color: palette.green,
                        textDecorationColor: palette.green + "30",
                        textUnderlineOffset: "6px",
                      }}
                    >
                      money
                    </span>
                    .
                  </h1>
                  <p
                    className="text-lg sm:text-xl leading-relaxed max-w-2xl mb-10"
                    style={{ color: palette.slate }}
                  >
                    Send stablecoins to anyone in 180+ countries with just their
                    email. No bank details. No wire fees. No frozen accounts.
                    Recipients cash out to local currency — instantly.
                  </p>
                </Reveal>

                {/* CTAs */}
                <Reveal className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-12">
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={{ ...greenGradient }}
                    onMouseEnter={(e) =>
                      Object.assign(e.currentTarget.style, greenGradientHover)
                    }
                    onMouseLeave={(e) =>
                      Object.assign(e.currentTarget.style, greenGradient)
                    }
                  >
                    View Integration Docs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 rounded-xl border px-8 py-4 text-sm font-semibold transition-all duration-300 hover:bg-[#F3F2ED] hover:-translate-y-0.5"
                    style={{
                      borderColor: palette.cardBorder,
                      color: palette.navy,
                      boxShadow: "0 2px 8px rgba(12, 24, 41, 0.06)",
                    }}
                  >
                    Try Live Demo
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Reveal>

                {/* Proof metrics row */}
                <Reveal>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10">
                    {[
                      { value: "180+", label: "Countries" },
                      { value: "<1s", label: "Settlement" },
                      { value: "1%", label: "Flat fee" },
                      { value: "$0", label: "Recipient cost" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="text-center lg:text-left"
                      >
                        <span
                          className="text-2xl sm:text-3xl font-bold block"
                          style={{
                            fontFamily: "var(--font-jetbrains), monospace",
                            color: palette.navy,
                          }}
                        >
                          {stat.value}
                        </span>
                        <span
                          className="text-xs mt-0.5 block"
                          style={{ color: palette.muted }}
                        >
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* Right column — Floating product mockups (2 cols) */}
              <div className="lg:col-span-2 relative hidden lg:flex items-center justify-center min-h-[520px]">
                {/* Green glow behind cards */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(27,107,74,0.12) 0%, rgba(27,107,74,0.04) 40%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                />

                {/* Floating Claim Card — the "hero image" IS the product */}
                <Reveal delay={0.2} className="absolute top-4 right-0 z-20">
                  <div
                    className="w-[280px] rounded-2xl overflow-hidden transition-all duration-500"
                    style={{
                      ...glass.strong,
                      boxShadow:
                        "0 25px 60px -12px rgba(12,24,41,0.15), 0 8px 24px -8px rgba(12,24,41,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
                      transform: "rotate(2deg)",
                    }}
                  >
                    {/* Card header */}
                    <div
                      className="px-5 py-4 border-b flex items-center gap-3"
                      style={{
                        borderColor: palette.cardBorder,
                        background: "#FAFAF5",
                      }}
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: palette.green }}
                      >
                        S
                      </div>
                      <div>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: palette.navy }}
                        >
                          You&apos;ve been paid
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: palette.muted }}
                        >
                          via Acme Corp
                        </p>
                      </div>
                    </div>
                    {/* Amount */}
                    <div className="px-5 py-6 text-center">
                      <p
                        className="text-4xl font-bold"
                        style={{
                          fontFamily: "var(--font-jetbrains), monospace",
                          color: palette.navy,
                        }}
                      >
                        $250.00
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: palette.muted }}
                      >
                        USDC · Instant settlement
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="px-5 pb-5 space-y-2">
                      <div
                        className="rounded-xl py-3 text-center text-sm font-semibold text-white"
                        style={{ ...greenGradient }}
                      >
                        Cash Out to Bank
                      </div>
                      <div
                        className="rounded-xl py-3 text-center text-sm font-semibold border"
                        style={{
                          borderColor: palette.cardBorder,
                          color: palette.navy,
                        }}
                      >
                        Keep in USDC
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Floating Code Snippet card — behind and offset */}
                <Reveal delay={0.35} className="absolute bottom-4 left-0 z-10">
                  <div
                    className="w-[260px] rounded-xl overflow-hidden"
                    style={{
                      boxShadow:
                        "0 20px 50px -15px rgba(12,24,41,0.15), 0 6px 20px -6px rgba(12,24,41,0.1)",
                      transform: "rotate(-1.5deg)",
                    }}
                  >
                    {/* Editor header */}
                    <div
                      className="flex items-center gap-1.5 px-4 py-2.5"
                      style={{ background: "#0d1117" }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      <span
                        className="text-[10px] ml-2"
                        style={{
                          fontFamily: "var(--font-jetbrains), monospace",
                          color: "#7C8A9E",
                        }}
                      >
                        payout.ts
                      </span>
                    </div>
                    <pre
                      className="px-4 py-4 text-[11px] leading-relaxed"
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        background: palette.navy,
                        color: "#c9d1d9",
                      }}
                    >
                      <code>
                        <span style={{ color: "#ff7b72" }}>await</span>
                        {" settlr."}
                        <span style={{ color: "#d2a8ff" }}>payout</span>
                        {"."}
                        <span style={{ color: "#d2a8ff" }}>create</span>
                        {"({\n"}
                        {"  "}
                        <span style={{ color: "#79c0ff" }}>amount</span>
                        {": "}
                        <span style={{ color: "#79c0ff" }}>250</span>
                        {",\n"}
                        {"  "}
                        <span style={{ color: "#79c0ff" }}>recipient</span>
                        {': "'}
                        <span style={{ color: "#a5d6ff" }}>maria@acme.co</span>
                        {'",\n});'}
                      </code>
                    </pre>
                  </div>
                </Reveal>

                {/* Decorative floating badge — settlement confirmation */}
                <Reveal
                  delay={0.5}
                  className="absolute top-[45%] left-[-10px] z-30"
                >
                  <div
                    className="flex items-center gap-2 rounded-full px-4 py-2"
                    style={{
                      ...glass.strong,
                      boxShadow:
                        "0 8px 30px -8px rgba(12,24,41,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
                    }}
                  >
                    <div
                      className="h-5 w-5 rounded-full flex items-center justify-center"
                      style={{ background: palette.greenLight }}
                    >
                      <Check
                        className="h-3 w-3"
                        style={{ color: palette.green }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        color: palette.green,
                      }}
                    >
                      Settled in 0.4s
                    </span>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — HOW IT WORKS (Follow the Money — vertical timeline)
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-24 sm:py-32"
          style={{ background: palette.white }}
        >
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: palette.green }}
              >
                How It Works
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                Follow the money.
              </h2>
            </Reveal>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
                style={{
                  background: `linear-gradient(180deg, ${palette.topo} 0%, ${palette.green}40 50%, ${palette.topo} 100%)`,
                }}
              />

              {/* Animated pulse traveling down the line */}
              <motion.div
                className="absolute left-8 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-20"
                style={{
                  background: palette.green,
                  boxShadow: `0 0 16px 4px ${palette.green}50, 0 0 32px 8px ${palette.green}20`,
                }}
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              {[
                {
                  step: "01",
                  title: "You call our API",
                  description:
                    "One POST request with an amount, email, and optional memo. Our compliance engine screens the recipient (OFAC, high-risk jurisdictions) before anything moves.",
                  icon: <Zap className="h-5 w-5" />,
                  detail: "3 lines of code. That's it.",
                },
                {
                  step: "02",
                  title: "We deliver privately",
                  description:
                    "The recipient gets a white-labeled email — your brand, not ours. Under the hood, Settlr initiates a private USDC transfer using SPL Token 2022 so the amount stays hidden on-chain.",
                  icon: <Mail className="h-5 w-5" />,
                  detail: "No wallet needed. No seed phrase.",
                },
                {
                  step: "03",
                  title: "They claim in one tap",
                  description:
                    "Click the link, see the balance. We create an embedded wallet automatically — zero gas fees, zero crypto knowledge required. The claim page is your brand, not a 'DeFi' interface.",
                  icon: <Shield className="h-5 w-5" />,
                  detail: "Gasless. Instant. Non-custodial.",
                },
                {
                  step: "04",
                  title: "Money hits their bank",
                  description:
                    "Recipients choose: cash out to GCash, M-Pesa, Pix, UPI, or their local bank. Or hold in USDC as a hedge against inflation. Their money, their choice.",
                  icon: <Building2 className="h-5 w-5" />,
                  detail: "30+ off-ramp partners worldwide.",
                },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.1}>
                  <div
                    className={`relative flex items-start gap-6 mb-16 last:mb-0 ${
                      i % 2 === 0
                        ? "md:flex-row"
                        : "md:flex-row-reverse md:text-right"
                    }`}
                  >
                    {/* Content */}
                    <div className="flex-1 ml-16 md:ml-0">
                      <div
                        className={`rounded-2xl p-7 sm:p-9 transition-all duration-300 ${
                          i % 2 === 0 ? "md:mr-12" : "md:ml-12"
                        }`}
                        style={{
                          ...glass.card,
                          borderColor: undefined,
                        }}
                      >
                        <span
                          className="text-xs font-bold uppercase tracking-widest block mb-2"
                          style={{
                            fontFamily: "var(--font-jetbrains), monospace",
                            color: palette.green,
                          }}
                        >
                          Step {item.step}
                        </span>
                        <h3
                          className="text-xl sm:text-2xl font-bold mb-3"
                          style={{
                            fontFamily: "var(--font-fraunces), Georgia, serif",
                            color: palette.navy,
                          }}
                        >
                          {item.title}
                        </h3>
                        <p
                          className="text-sm leading-relaxed mb-3"
                          style={{ color: palette.slate }}
                        >
                          {item.description}
                        </p>
                        <p
                          className="text-xs font-semibold"
                          style={{
                            fontFamily: "var(--font-jetbrains), monospace",
                            color: palette.green,
                          }}
                        >
                          {item.detail}
                        </p>
                      </div>
                    </div>

                    {/* Timeline node */}
                    <div
                      className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full border-2 z-10"
                      style={{
                        borderColor: palette.green,
                        background: palette.white,
                        boxShadow: `0 0 20px 4px ${palette.green}20, 0 0 8px 2px ${palette.green}10`,
                      }}
                    >
                      <span style={{ color: palette.green }}>{item.icon}</span>
                    </div>

                    {/* Spacer for the other side on desktop */}
                    <div className="hidden md:block flex-1" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — INTERACTIVE PLAYGROUND
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-28 sm:py-36"
          style={{ background: palette.cream }}
        >
          <div className="container mx-auto max-w-6xl px-6">
            <Reveal className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: palette.green }}
              >
                Developer Experience
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                Write code. Watch it land.
              </h2>
              <p
                className="mt-4 text-base max-w-xl mx-auto"
                style={{ color: palette.slate }}
              >
                Edit the values below and see the recipient&apos;s claim screen
                update in real time.
              </p>
            </Reveal>

            <Reveal>
              <InteractivePlayground />
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — WHY SETTLR (feature pillars)
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-28 sm:py-36"
          style={{ background: palette.white }}
        >
          <div className="container mx-auto max-w-6xl px-6">
            <Reveal className="text-center mb-20">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: palette.green }}
              >
                Why Businesses Choose Settlr
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                Built for the weight of money.
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-7">
              {[
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "180+ Countries",
                  desc: "Recipients only need an email and internet. No bank account, no KYC on their end, no geographic restrictions.",
                },
                {
                  icon: <Clock className="h-6 w-6" />,
                  title: "Sub-Second Settlement",
                  desc: "Solana finality in under one second. No holds, no pending status, no multi-day bank processing windows.",
                },
                {
                  icon: <Lock className="h-6 w-6" />,
                  title: "On-Chain Privacy",
                  desc: "Confidential transfers via SPL Token 2022. Payment amounts are encrypted on-chain — only sender and recipient can see them.",
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "Non-Custodial",
                  desc: "Funds move through program-owned accounts, never Settlr wallets. Squads multisig for treasury governance.",
                },
                {
                  icon: <DollarSign className="h-6 w-6" />,
                  title: "1% Flat Fee",
                  desc: "No FX fees, no wire fees, no receiving fees, no hidden charges. Recipients pay zero. Compare to PayPal's 5%+ or $25/wire.",
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Gasless for Recipients",
                  desc: "Kora relayer covers all transaction fees. Recipients never need SOL, never see gas, never touch a blockchain.",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div
                    className="rounded-2xl p-8 h-full transition-all duration-300 hover:-translate-y-1 group"
                    style={{
                      ...glass.card,
                    }}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, glass.cardHover);
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.currentTarget.style, {
                        boxShadow: glass.card.boxShadow,
                        border: glass.card.border,
                      });
                    }}
                  >
                    <div
                      className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                      style={{
                        background: palette.greenLight,
                        color: palette.green,
                      }}
                    >
                      {f.icon}
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{
                        fontFamily: "var(--font-fraunces), Georgia, serif",
                        color: palette.navy,
                      }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: palette.slate }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — SAVINGS CALCULATOR
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-28 sm:py-36"
          style={{ background: palette.cream }}
        >
          <div className="container mx-auto max-w-3xl px-6">
            <Reveal className="text-center mb-14">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: palette.green }}
              >
                Cost Comparison
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                Calculate your savings.
              </h2>
            </Reveal>

            <Reveal>
              <SavingsCalculator />
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6 — COMPLIANCE & TRUST
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-28 sm:py-36"
          style={{ background: palette.white }}
        >
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal className="text-center mb-20">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: palette.green }}
              >
                Compliance & Security
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                Institutional-grade infrastructure.
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "OFAC Screening",
                  detail:
                    "Every recipient is screened against OFAC SDN lists and high-risk jurisdiction databases before funds move.",
                },
                {
                  label: "Squads Multisig",
                  detail:
                    "Treasury governed by Squads Protocol. No single key can move funds. On-chain governance for every dollar.",
                },
                {
                  label: "Non-Custodial",
                  detail:
                    "Funds flow through program-derived accounts. Settlr never holds, controls, or has signing authority over user funds.",
                },
                {
                  label: "Kora Gasless",
                  detail:
                    "Transaction fees covered by Kora fee relayer. Recipients never need SOL or crypto to claim payments.",
                },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 0.08}>
                  <div
                    className="rounded-2xl p-7 h-full transition-all duration-300 hover:-translate-y-1"
                    style={{
                      ...glass.card,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                      style={{
                        background: palette.greenLight,
                        color: palette.green,
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <h4
                      className="font-bold mb-2"
                      style={{ color: palette.navy }}
                    >
                      {item.label}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: palette.slate }}
                    >
                      {item.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 7 — PRICING SNAPSHOT
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-28 sm:py-36"
          style={{ background: palette.cream }}
        >
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: palette.green }}
              >
                Simple Pricing
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                No surprises. No hidden fees.
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Starter",
                  fee: "1%",
                  description: "For early-stage platforms",
                  features: [
                    "Up to 500 payouts/month",
                    "Email-based claiming",
                    "Webhook notifications",
                    "Devnet sandbox",
                    "Community support",
                  ],
                  cta: "Get Started",
                  href: "/onboarding",
                  highlighted: false,
                },
                {
                  name: "Growth",
                  fee: "0.75%",
                  description: "For scaling businesses",
                  features: [
                    "Unlimited payouts",
                    "Batch & recurring payouts",
                    "Custom branding",
                    "Priority support",
                    "Advanced analytics",
                  ],
                  cta: "Contact Sales",
                  href: "/waitlist",
                  highlighted: true,
                },
                {
                  name: "Enterprise",
                  fee: "0.5%",
                  description: "For high-volume operations",
                  features: [
                    "Volume-based pricing",
                    "White-label everything",
                    "Dedicated account manager",
                    "Custom SLAs & uptime",
                    "On-premise deployment",
                  ],
                  cta: "Talk to Us",
                  href: "/waitlist",
                  highlighted: false,
                },
              ].map((plan, i) => (
                <Reveal key={plan.name} delay={i * 0.1}>
                  <div
                    className={`rounded-2xl p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                      plan.highlighted ? "ring-2 ring-[#1B6B4A]" : ""
                    }`}
                    style={{
                      ...(plan.highlighted ? glass.strong : glass.card),
                      ...(plan.highlighted
                        ? {
                            boxShadow: `0 12px 48px rgba(12,24,41,0.08), 0 0 0 1px ${palette.green}30, 0 0 40px ${palette.green}10, inset 0 1px 0 rgba(255,255,255,0.9)`,
                          }
                        : {}),
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="font-bold"
                        style={{
                          fontFamily: "var(--font-fraunces), Georgia, serif",
                          color: palette.navy,
                        }}
                      >
                        {plan.name}
                      </span>
                      {plan.highlighted && (
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={{
                            background: palette.greenLight,
                            color: palette.green,
                          }}
                        >
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span
                        className="text-4xl font-bold"
                        style={{
                          fontFamily: "var(--font-jetbrains), monospace",
                          color: palette.navy,
                        }}
                      >
                        {plan.fee}
                      </span>
                      <span
                        className="text-sm ml-1"
                        style={{ color: palette.muted }}
                      >
                        per transaction
                      </span>
                    </div>

                    <p
                      className="text-sm mb-6"
                      style={{ color: palette.slate }}
                    >
                      {plan.description}
                    </p>

                    <ul className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2.5 text-sm"
                          style={{ color: palette.slate }}
                        >
                          <Check
                            className="h-4 w-4 mt-0.5 shrink-0"
                            style={{ color: palette.green }}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.href}
                      className={`block text-center rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 ${
                        plan.highlighted
                          ? "text-white hover:-translate-y-0.5"
                          : "hover:bg-[#F3F2ED]"
                      }`}
                      style={{
                        ...(plan.highlighted
                          ? greenGradient
                          : {
                              background: "transparent",
                              border: `1px solid ${palette.cardBorder}`,
                              color: palette.navy,
                            }),
                        ...(plan.highlighted ? {} : { color: palette.navy }),
                      }}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 8 — FAQ
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-28 sm:py-36"
          style={{ background: palette.white }}
        >
          <div className="container mx-auto max-w-3xl px-6">
            <Reveal className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: palette.green }}
              >
                FAQ
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                Common questions.
              </h2>
            </Reveal>

            <div className="space-y-4">
              {[
                {
                  q: "Do recipients need a crypto wallet?",
                  a: "No. We create an embedded wallet automatically when someone receives their first payment. They never see a seed phrase, never need SOL, never touch a blockchain. The experience is: get an email, click a link, see your balance.",
                },
                {
                  q: "What countries do you support?",
                  a: "180+ countries. Recipients only need an email address and internet connection. No bank account required on their end, no geographic restrictions.",
                },
                {
                  q: "What are the fees?",
                  a: "From 0.5–1% per transaction depending on your tier. No FX fees, no wire fees, no receiving fees, no hidden charges. On $25,000/month in payouts you'd save over $1,000 vs PayPal international transfers.",
                },
                {
                  q: "How fast are payouts?",
                  a: "Instant. Stablecoin payments settle in under one second on Solana. No holds, no processing delays, no multi-day bank settlement windows.",
                },
                {
                  q: "How do recipients cash out?",
                  a: "They choose from geo-localized options: GCash in the Philippines, M-Pesa in Kenya, Pix in Brazil, UPI in India, or bank transfer in 30+ countries. Or they can hold in USDC as a dollar-pegged savings account.",
                },
                {
                  q: "Is it really non-custodial?",
                  a: "Yes. Funds flow through Solana program-derived accounts. Settlr never holds, controls, or has signing authority over user funds. Treasury is governed by Squads multisig — no single key can move money.",
                },
              ].map((faq, i) => (
                <Reveal key={faq.q} delay={i * 0.05}>
                  <FAQItem question={faq.q} answer={faq.a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 9 — CTA
           ═══════════════════════════════════════════════════════════════ */}
        <section
          className="py-28 sm:py-36"
          style={{ background: palette.cream }}
        >
          <div className="container mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-6"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: palette.navy,
                }}
              >
                Ready to move money
                <br />
                like it&apos;s 2026?
              </h2>
              <p
                className="text-base sm:text-lg mb-10 max-w-xl mx-auto"
                style={{ color: palette.slate }}
              >
                Start sending stablecoin payouts in minutes — not weeks. One
                API, 180+ countries, zero wire fees.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-xl px-9 py-4.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{ ...greenGradient }}
                  onMouseEnter={(e) =>
                    Object.assign(e.currentTarget.style, greenGradientHover)
                  }
                  onMouseLeave={(e) =>
                    Object.assign(e.currentTarget.style, greenGradient)
                  }
                >
                  Start Integrating
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 rounded-xl border px-9 py-4.5 text-sm font-semibold transition-all duration-300 hover:bg-[#F3F2ED] hover:-translate-y-0.5"
                  style={{
                    borderColor: palette.cardBorder,
                    color: palette.navy,
                    boxShadow: "0 2px 8px rgba(12, 24, 41, 0.06)",
                  }}
                >
                  Compare to Alternatives
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

/* --- FAQ accordion item --- */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        ...glass.card,
        ...(open
          ? {
              boxShadow: `0 8px 32px rgba(12, 24, 41, 0.08), 0 0 0 1px ${palette.green}30, inset 0 1px 0 rgba(255,255,255,0.8)`,
            }
          : {}),
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
      >
        <span
          className="text-sm font-semibold pr-4"
          style={{ color: palette.navy }}
        >
          {question}
        </span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
          style={{ color: palette.muted }}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p
            className="text-sm leading-relaxed"
            style={{ color: palette.slate }}
          >
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
