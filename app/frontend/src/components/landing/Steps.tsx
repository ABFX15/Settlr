"use client";

import { motion } from "framer-motion";
import { FileCheck, Send, Zap } from "lucide-react";
import { t, spring, staggerContainer, fadeUpScale } from "./shared";

const steps = [
  {
    step: "Step 1",
    title: "Connect Your Business",
    desc: "Complete KYB verification — state licences, cannabis permits, beneficial owners.",
    icon: FileCheck,
  },
  {
    step: "Step 2",
    title: "Create an Invoice",
    desc: "Send to any supplier or buyer. They get a simple email with a payment link.",
    icon: Send,
  },
  {
    step: "Step 3",
    title: "Settlement in Seconds",
    desc: "Recipient clicks, claims USDC, done. You both get a cryptographic receipt.",
    icon: Zap,
  },
];

export function Steps() {
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
            Get started with Settlr in three simple steps
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-base"
            style={{ color: t.slate }}
          >
            In just a few minutes, start settling invoices and taking control.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={fadeUpScale}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ borderColor: t.border }}
            >
              {/* mockup area */}
              <div
                className="flex items-center justify-center py-10 transition-colors duration-300 group-hover:bg-[#DCF0E4]"
                style={{ background: t.greenLight }}
              >
                <motion.div
                  className="w-48 rounded-2xl bg-white p-5 shadow-md"
                  whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                >
                  <s.icon className="h-8 w-8" style={{ color: t.green }} />
                  <p
                    className="mt-3 text-sm font-bold"
                    style={{ color: t.navy }}
                  >
                    {s.title}
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: t.muted }}>
                    {s.desc.slice(0, 60)}...
                  </p>
                </motion.div>
              </div>
              {/* label */}
              <div className="px-6 py-5">
                <p className="text-xs font-bold" style={{ color: t.green }}>
                  {s.step}
                </p>
                <h3
                  className="mt-1 text-base font-bold"
                  style={{ color: t.navy, fontFamily: t.serif }}
                >
                  {s.title}
                </h3>
                <p className="mt-1 text-sm" style={{ color: t.slate }}>
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* dots */}
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: i === 0 ? t.green : "#D1D5DB" }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: 0.3 + i * 0.08 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
