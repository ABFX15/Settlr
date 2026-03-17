"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { t, spring, staggerContainer, fadeUpScale, cardHover } from "./shared";

const smallCards = [
  {
    quote:
      "Our processor shut us down overnight. No warning. $200K stuck for 3 weeks.",
    name: "Cannabis Distributor",
    co: "Colorado",
  },
  {
    quote:
      "We were paying 7.5% per transaction. Settlr cut that to 1%. $78K saved per year.",
    name: "Wholesale Cultivator",
    co: "Oregon",
  },
  {
    quote:
      "Moving cash was a nightmare. Armed guards, insurance. Now it\u2019s a 3-second transfer.",
    name: "Multi-State Operator",
    co: "West Coast",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
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
            Trusted by cannabis operators
          </h2>
          <p
            className="mx-auto mt-4 max-w-md text-base"
            style={{ color: t.slate }}
          >
            Real operators, real results — see how Settlr is helping businesses
            take control of their payments every day.
          </p>
        </motion.div>

        {/* Featured big quote */}
        <motion.div
          className="mt-14 grid gap-5 sm:grid-cols-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <motion.div
            className="flex flex-col justify-between rounded-3xl p-8 shadow-inner sm:p-10"
            style={{ background: t.greenLight }}
            whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
          >
            <div>
              <motion.span
                className="block text-6xl leading-none"
                style={{ color: t.green }}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.2 }}
              >
                &#x201C;
              </motion.span>
              <p
                className="mt-3 text-[22px] font-bold italic leading-snug sm:text-[26px]"
                style={{ color: t.navy, fontFamily: t.serif }}
              >
                Settlr changed the way we move money. It&apos;s fast,
                transparent, and finally free from bank interference.
              </p>
            </div>
            <div className="mt-8">
              <p className="text-sm font-bold" style={{ color: t.navy }}>
                Cannabis Distributor
              </p>
              <p className="text-xs" style={{ color: t.muted }}>
                Colorado
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-center overflow-hidden rounded-3xl shadow-inner"
            style={{ background: t.greenLight, minHeight: 280 }}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <div className="text-center">
              <Shield
                className="mx-auto h-16 w-16"
                style={{ color: t.green, opacity: 0.25 }}
              />
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: t.green }}
              >
                Operator photo
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* 3 small cards */}
        <motion.div
          className="mt-5 grid gap-5 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {smallCards.map((card) => (
            <motion.div
              key={card.co}
              variants={fadeUpScale}
              whileHover={cardHover}
              className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
              style={{ borderColor: t.border }}
            >
              <p
                className="flex-1 text-sm leading-relaxed"
                style={{ color: t.slate }}
              >
                &ldquo;{card.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold shadow-sm"
                  style={{ background: t.greenLight, color: t.green }}
                >
                  {card.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: t.navy }}>
                    {card.name}
                  </p>
                  <p className="text-xs" style={{ color: t.muted }}>
                    {card.co}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
