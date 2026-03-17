"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, DollarSign } from "lucide-react";
import { t, spring, fadeUp, staggerContainer } from "./shared";

/* ── animated counter ──────────────────────────────────── */
function AnimatedValue({
  value,
  prefix = "",
}: {
  value: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...spring, delay: 0.2 }}
    >
      {prefix}
      {value}
    </motion.span>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const dashY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-28 pb-16 sm:pt-40 sm:pb-24"
      style={{ background: t.green }}
    >
      {/* parallax bg shapes */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ y: bgY }}
      >
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-[0.08]"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 -left-40 h-[400px] w-[400px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          }}
        />
      </motion.div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* left copy */}
          <motion.div
            style={{ y: contentY }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeUp}
              className="text-[44px] leading-[1.05] tracking-tight text-white sm:text-[56px] lg:text-[64px]"
              style={{ fontFamily: t.serif, fontWeight: 800 }}
            >
              Take charge of your payments with Settlr!
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/75"
            >
              Settlr helps you settle invoices in seconds with powerful tools
              designed for cannabis wholesalers.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{ color: t.green }}
              >
                Request Access
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/10"
              >
                Watch Demo
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center gap-3"
            >
              <div className="flex -space-x-2.5">
                {["GF", "ME", "SC", "PD"].map((init, i) => (
                  <motion.div
                    key={init}
                    initial={{ opacity: 0, scale: 0, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.5 + i * 0.08 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-white/30 text-[10px] font-bold text-white shadow-md"
                    style={{
                      background: `hsl(${150 + i * 25}, 40%, ${32 + i * 6}%)`,
                    }}
                  >
                    {init}
                  </motion.div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  <AnimatedValue value="$67K+" /> Settled
                </p>
                <p className="text-xs text-white/50">
                  Trusted by cannabis operators nationwide
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* right — dashboard */}
          <motion.div
            style={{ y: dashY }}
            initial={{ opacity: 0, x: 40, rotateY: -4 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ ...spring, delay: 0.3 }}
            className="relative [perspective:1200px]"
          >
            {/* floating card 1 */}
            <motion.div
              className="absolute -left-3 top-6 z-10 rounded-2xl bg-white/95 px-5 py-3 shadow-xl backdrop-blur-sm sm:-left-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <p className="text-[10px] font-medium" style={{ color: t.muted }}>
                Savings
              </p>
              <p className="text-lg font-bold" style={{ color: t.navy }}>
                $47,500
              </p>
              <div className="mt-1 flex items-end gap-0.5">
                {[30, 50, 40, 70, 55, 80, 65].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-3 rounded-sm"
                    initial={{ height: 0 }}
                    animate={{ height: h * 0.35 }}
                    transition={{ ...spring, delay: 0.8 + i * 0.06 }}
                    style={{ background: i === 5 ? t.green : t.greenLight }}
                  />
                ))}
              </div>
            </motion.div>

            {/* floating card 2 */}
            <motion.div
              className="absolute -right-2 bottom-16 z-10 rounded-2xl bg-white/95 px-5 py-3 shadow-xl backdrop-blur-sm sm:-right-5"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: t.greenLight }}
                >
                  <DollarSign className="h-5 w-5" style={{ color: t.green }} />
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: t.muted }}>
                    Volume · 30 Days
                  </p>
                  <p className="text-base font-bold" style={{ color: t.navy }}>
                    $67,200
                  </p>
                </div>
              </div>
            </motion.div>

            {/* main dashboard */}
            <motion.div
              className="overflow-hidden rounded-3xl bg-white shadow-2xl"
              whileHover={{
                rotateY: 2,
                rotateX: -1,
                transition: { duration: 0.4 },
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* stat cards row */}
              <div
                className="grid grid-cols-3 divide-x"
                style={{ borderColor: t.border }}
              >
                {[
                  { label: "Volume (30d)", val: "$2.4M", delta: "+18%" },
                  { label: "Avg. Settlement", val: "3.2s", delta: "-0.4s" },
                  { label: "Transactions", val: "1,847", delta: "+124" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="px-5 py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.6 + i * 0.1 }}
                  >
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: t.muted }}
                    >
                      {s.label}
                    </p>
                    <p
                      className="mt-0.5 text-xl font-bold"
                      style={{ color: t.navy }}
                    >
                      {s.val}
                    </p>
                    <p
                      className="text-[10px] font-semibold"
                      style={{ color: t.green }}
                    >
                      {s.delta}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* chart */}
              <div
                className="flex items-end gap-1 border-t px-5 py-4"
                style={{ borderColor: t.border }}
              >
                {[35, 55, 40, 70, 50, 85, 60, 75, 45, 90, 65, 80].map(
                  (h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: h * 0.7 }}
                      transition={{ ...spring, delay: 0.8 + i * 0.04 }}
                      style={{ background: i >= 9 ? t.green : t.greenLight }}
                    />
                  ),
                )}
              </div>

              {/* settlement rows */}
              {[
                {
                  from: "GreenLeaf Farms",
                  to: "Pacific Dist.",
                  amt: "$47,500",
                  time: "0.6s",
                },
                {
                  from: "Mountain Extracts",
                  to: "Valley Wholesale",
                  amt: "$14,250",
                  time: "0.8s",
                },
              ].map((r, i) => (
                <motion.div
                  key={r.from}
                  className="flex items-center justify-between border-t px-5 py-3"
                  style={{ borderColor: t.border }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 1.2 + i * 0.1 }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: t.greenLight, color: t.green }}
                    >
                      {r.from[0]}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: t.navy }}
                    >
                      {r.from} → {r.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: t.navy }}
                    >
                      {r.amt}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: t.greenLight, color: t.green }}
                    >
                      {r.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <p className="sr-only">
        Settlr is a non-custodial stablecoin settlement platform for B2B
        cannabis distributors at 1% flat fee, built on Solana.
      </p>
    </section>
  );
}
