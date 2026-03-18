"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { t, spring, springFast } from "./shared";

const faqs = [
  {
    q: "What is Settlr?",
    a: "Non-custodial stablecoin settlement infrastructure for B2B cannabis supply chains. We enable instant USDC payments between wholesalers, distributors, and cultivators without requiring a bank.",
  },
  {
    q: "Do recipients need a crypto wallet?",
    a: "No. Recipients get an email with a claim link. They click it and receive their payment. No wallet, no app download, no crypto knowledge required.",
  },
  {
    q: "Is this legal?",
    a: "Yes. USDC is a regulated stablecoin issued by Circle, a licensed money transmitter. Settlr is GENIUS Act compliant and performs full BSA/AML screening on all users.",
  },
  {
    q: "What if cannabis becomes federally legal?",
    a: "Our value proposition is speed and cost, not just banking access. 1% fees and instant settlement beat ACH regardless of the regulatory environment.",
  },
  {
    q: "How is this different from ACH or wire transfers?",
    a: "Instant settlement vs 3-5 days. 1% flat vs 5-9% high-risk processing fees. Non-custodial means no one can freeze your funds mid-transfer.",
  },
  {
    q: "Who controls the funds?",
    a: "You do. Settlr is non-custodial. Funds move peer-to-peer between multisig vaults that you and your counterparty control.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ ...spring, delay: index * 0.06 }}
      className="border-b"
      style={{ borderColor: t.border }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-6 text-left"
      >
        <span
          className="text-[16px] font-semibold leading-snug"
          style={{ color: t.navy, fontFamily: t.sans }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={springFast}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: open ? t.green : "#F0F0F0" }}
        >
          <ChevronDown
            className="h-4 w-4"
            style={{ color: open ? "#fff" : "#6B7280" }}
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...spring, opacity: { duration: 0.15 } }}
          >
            <p
              className="pb-6 pr-12 text-[15px] leading-relaxed"
              style={{ color: "#6B7280" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="bg-white py-[120px]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          {/* left — heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={spring}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <h2
              className="text-[32px] leading-[1.15] tracking-tight font-extrabold sm:text-[44px]"
              style={{ color: t.navy, fontFamily: t.sans }}
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-4 max-w-sm text-base" style={{ color: "#6B7280" }}>
              Get answers to common questions about Settlr
            </p>
          </motion.div>

          {/* right — accordion */}
          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
