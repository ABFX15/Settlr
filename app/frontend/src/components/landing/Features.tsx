"use client";

import { motion } from "framer-motion";
import { Receipt, ShieldCheck, Ban, Eye, Mail } from "lucide-react";
import { t, spring, staggerContainer, fadeUpScale, cardHover } from "./shared";

const wide = [
  {
    icon: Receipt,
    title: "Invoice & Pay",
    desc: "Create invoices, send payment links, settle instantly. Everything in one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Built In",
    desc: "Automated KYB verification, OFAC screening, real-time BSA/AML monitoring.",
  },
];

const narrow = [
  {
    icon: Ban,
    title: "No Account Freezes",
    desc: "Non-custodial means no one holds your funds. No one can freeze them.",
  },
  {
    icon: Eye,
    title: "On-Chain Transparency",
    desc: "Every settlement is verifiable on Solana. Real-time proof.",
  },
  {
    icon: Mail,
    title: "Email-Based Claiming",
    desc: "Recipients don\u2019t need a wallet. Email, click, paid.",
  },
];

export function Features() {
  return (
    <section className="py-20 sm:py-28" style={{ background: t.bgOff }}>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
        >
          <h2
            className="text-[32px] leading-[1.1] tracking-tight sm:text-[40px]"
            style={{ color: t.navy, fontFamily: t.serif, fontWeight: 800 }}
          >
            Everything you need to settle
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-base"
            style={{ color: t.slate }}
          >
            Discover how our platform streamlines B2B settlement, making smart
            choices easier than ever.
          </p>
        </motion.div>

        {/* 2 wide */}
        <motion.div
          className="mt-14 grid gap-5 sm:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {wide.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUpScale}
              whileHover={cardHover}
              className="rounded-3xl border bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg"
              style={{ borderColor: t.border }}
            >
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: t.greenLight }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.2 },
                }}
              >
                <f.icon className="h-5 w-5" style={{ color: t.green }} />
              </motion.div>
              <h3
                className="mt-5 text-lg font-bold"
                style={{ color: t.navy, fontFamily: t.serif }}
              >
                {f.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: t.slate }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 3 narrow */}
        <motion.div
          className="mt-5 grid gap-5 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {narrow.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUpScale}
              whileHover={cardHover}
              className="rounded-3xl border bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg"
              style={{ borderColor: t.border }}
            >
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: t.greenLight }}
                whileHover={{
                  scale: 1.1,
                  rotate: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <f.icon className="h-5 w-5" style={{ color: t.green }} />
              </motion.div>
              <h3
                className="mt-4 text-base font-bold"
                style={{ color: t.navy, fontFamily: t.serif }}
              >
                {f.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: t.slate }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
