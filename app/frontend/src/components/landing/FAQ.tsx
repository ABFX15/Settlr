"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { t, spring, springFast, fadeUp, staggerContainer } from "./shared";

const faqs = [
  {
    q: "What is Settlr and how does it work?",
    a: "Non-custodial stablecoin settlement for B2B cannabis supply chains. We\u2019re a software layer \u2014 not a bank. Funds move peer-to-peer between multisig vaults on Solana.",
  },
  {
    q: "Do recipients need a crypto wallet?",
    a: "No. They get an email and click a link. The USDC is claimed through a simple web interface \u2014 no wallet, no app, no crypto knowledge required.",
  },
  {
    q: "Is this legal?",
    a: "Yes. USDC is a regulated stablecoin issued by Circle under the GENIUS Act 2025 framework. Settlr performs full BSA/AML screening and KYB verification on every operator.",
  },
  {
    q: "What if cannabis becomes federally legal?",
    a: "Our value is speed and cost, not just banking access. 1% and instant settlement beats ACH regardless of regulation.",
  },
  {
    q: "How is this different from ACH?",
    a: "Instant settlement (not 3\u20135 days), no intermediary, no freeze risk, 1% vs 5\u20139%. Plus a cryptographic audit trail.",
  },
];

function FAQItem({ q, a, num }: { q: string; a: string; num: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border bg-white transition-all duration-200"
      style={{ borderColor: open ? t.green : t.border }}
      whileHover={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-5 px-6 py-5 text-left"
      >
        <motion.span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
          style={{ background: t.greenLight, color: t.green }}
          animate={open ? { scale: 1.08 } : { scale: 1 }}
          transition={springFast}
        >
          {num}
        </motion.span>
        <span
          className="flex-1 text-base font-semibold"
          style={{ color: t.navy }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={springFast}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
          style={{
            border: `1.5px solid ${t.green}`,
            background: open ? t.green : "transparent",
          }}
        >
          <ChevronDown
            className="h-4 w-4"
            style={{ color: open ? "#fff" : t.green }}
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
            <div className="px-6 pb-6 pl-[4.75rem]">
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: t.slate }}
              >
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
        >
          <h2
            className="text-[32px] leading-[1.1] tracking-tight sm:text-[40px]"
            style={{ color: t.navy, fontFamily: t.serif, fontWeight: 800 }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="mx-auto mt-4 max-w-md text-base"
            style={{ color: t.slate }}
          >
            Find answers to the most common questions about using Settlr.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 space-y-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {faqs.map((faq, i) => (
            <motion.div key={faq.q} variants={fadeUp}>
              <FAQItem q={faq.q} a={faq.a} num={i + 1} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
