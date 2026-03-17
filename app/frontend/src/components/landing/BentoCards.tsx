"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  CreditCard,
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  DollarSign,
} from "lucide-react";
import { t, spring, staggerContainer, fadeUpScale } from "./shared";

/* ── 3D tilt wrapper ───────────────────────────────────── */
function Tilt({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
/*  BENTO GRID — Finex-style asymmetric layout             */
/* ════════════════════════════════════════════════════════ */
export function BentoCards() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* section heading */}
        <motion.div
          className="mx-auto mb-14 max-w-xl text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
        >
          <h2
            className="text-[32px] leading-[1.1] tracking-tight sm:text-[40px]"
            style={{ color: t.navy, fontFamily: t.serif, fontWeight: 800 }}
          >
            Everything You Need to Settle Smarter
          </h2>
          <p
            className="mx-auto mt-4 max-w-md text-base"
            style={{ color: t.slate }}
          >
            Settlr combines non-custodial rails with intuitive tools to help you
            invoice, settle, and grow your business with ease.
          </p>
        </motion.div>

        {/* ── bento grid ─────────────────────────────── */}
        <motion.div
          className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* ── TOP-LEFT: "Instant Settlement" with card image ── */}
          <motion.div variants={fadeUpScale} className="md:row-span-2">
            <Tilt className="flex h-full flex-col overflow-hidden rounded-3xl bg-[#F4F5F7] shadow-sm transition-shadow duration-300 hover:shadow-xl">
              {/* visual: debit-card-style mockup */}
              <div className="relative flex flex-1 items-center justify-center px-6 pt-8">
                <motion.div
                  className="relative w-56 rounded-2xl p-5 shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${t.navy} 0%, #1E3A5F 100%)`,
                  }}
                  initial={{ opacity: 0, y: 20, rotate: -4 }}
                  whileInView={{ opacity: 1, y: 0, rotate: -4 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: 0.2 }}
                  whileHover={{
                    rotate: 0,
                    scale: 1.04,
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-10 items-center justify-center rounded-md bg-amber-400/90">
                      <CreditCard className="h-4 w-4 text-amber-900" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      Settlr
                    </span>
                  </div>
                  <p className="mt-5 font-mono text-sm tracking-widest text-white/80">
                    •••• •••• •••• 4820
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-[8px] uppercase text-white/40">
                        Cardholder
                      </p>
                      <p className="text-xs font-semibold text-white/70">
                        GreenLeaf Farms
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-white/50">USDC</p>
                  </div>
                </motion.div>
              </div>
              {/* text */}
              <div className="p-6">
                <h3
                  className="text-lg font-bold"
                  style={{ color: t.navy, fontFamily: t.serif }}
                >
                  Instant B2B Settlement
                </h3>
                <p
                  className="mt-1.5 text-sm leading-relaxed"
                  style={{ color: t.slate }}
                >
                  Sign up and start settling invoices — send USDC securely and
                  enjoy instant access with zero hassle.
                </p>
              </div>
            </Tilt>
          </motion.div>

          {/* ── TOP-CENTER: "See Your Money" with icon + CTA ── */}
          <motion.div variants={fadeUpScale}>
            <Tilt
              className="flex h-full flex-col justify-between rounded-3xl border bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ borderColor: t.border }}
            >
              <div>
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: t.greenLight }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 8,
                    transition: { duration: 0.2 },
                  }}
                >
                  <BarChart3 className="h-5 w-5" style={{ color: t.green }} />
                </motion.div>
                <h3
                  className="mt-4 text-lg font-bold"
                  style={{ color: t.navy, fontFamily: t.serif }}
                >
                  See Your Money, Clearly.
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: t.slate }}
                >
                  Track settlements, balances, and invoices in one clean
                  dashboard — giving you instant clarity and confidence.
                </p>
              </div>
              <Link
                href="/demo"
                className="group mt-5 inline-flex items-center gap-2 self-start rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: t.green, color: t.green }}
              >
                Learn More
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Tilt>
          </motion.div>

          {/* ── TOP-RIGHT: Phone dashboard mockup ── */}
          <motion.div variants={fadeUpScale} className="md:row-span-2">
            <Tilt
              className="flex h-full items-center justify-center overflow-hidden rounded-3xl p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ background: t.greenLight }}
            >
              {/* phone mockup */}
              <motion.div
                className="w-52 overflow-hidden rounded-[2rem] bg-white shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.25 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                {/* status bar */}
                <div className="flex items-center justify-between px-5 pt-3">
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: t.muted }}
                  >
                    9:41
                  </span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-3 rounded-full bg-gray-300" />
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  </div>
                </div>

                {/* greeting */}
                <div className="px-5 pt-4">
                  <p className="text-[10px]" style={{ color: t.muted }}>
                    Welcome back,
                  </p>
                  <p className="text-base font-bold" style={{ color: t.navy }}>
                    GreenLeaf Farms
                  </p>
                </div>

                {/* balance card */}
                <div
                  className="mx-4 mt-3 rounded-xl p-3"
                  style={{ background: t.green }}
                >
                  <p className="text-[9px] text-white/60">Total Balance</p>
                  <p className="mt-0.5 text-xl font-bold text-white">$67,200</p>
                  <p className="text-[9px] text-white/50">+$14,250 this week</p>
                </div>

                {/* mini transactions */}
                <div className="space-y-2 px-4 py-3">
                  <p
                    className="text-[9px] font-semibold"
                    style={{ color: t.navy }}
                  >
                    Recent
                  </p>
                  {[
                    { name: "Pacific Dist.", amt: "+$47,500", time: "0.6s" },
                    { name: "Valley Wholesale", amt: "+$14,250", time: "0.8s" },
                    { name: "Mountain Ext.", amt: "+$5,450", time: "1.2s" },
                  ].map((tx) => (
                    <div
                      key={tx.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[7px] font-bold"
                          style={{ background: t.greenLight, color: t.green }}
                        >
                          {tx.name[0]}
                        </div>
                        <span className="text-[9px]" style={{ color: t.slate }}>
                          {tx.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-[9px] font-semibold"
                          style={{ color: t.green }}
                        >
                          {tx.amt}
                        </span>
                        <span
                          className="ml-1 text-[7px]"
                          style={{ color: t.muted }}
                        >
                          {tx.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* bottom nav dots */}
                <div className="flex justify-center gap-1.5 pb-4">
                  {[true, false, false, false].map((active, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full"
                      style={{
                        width: active ? 16 : 4,
                        background: active ? t.green : "#D1D5DB",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </Tilt>
          </motion.div>

          {/* ── BOTTOM-LEFT: Phone analytics ── */}
          <motion.div variants={fadeUpScale}>
            <Tilt className="flex h-full flex-col overflow-hidden rounded-3xl bg-[#F4F5F7] shadow-sm transition-shadow duration-300 hover:shadow-xl">
              {/* mini phone mockup */}
              <div className="flex flex-1 items-center justify-center px-4 pt-5">
                <motion.div
                  className="w-36 overflow-hidden rounded-2xl bg-white shadow-lg"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: 0.3 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="px-3 pt-3">
                    <p
                      className="text-[8px] font-semibold"
                      style={{ color: t.navy }}
                    >
                      Analytics
                    </p>
                    <p
                      className="mt-0.5 text-sm font-bold"
                      style={{ color: t.green }}
                    >
                      $2.4M
                    </p>
                  </div>
                  {/* mini chart */}
                  <div className="flex items-end gap-0.5 px-3 pb-2 pt-1">
                    {[25, 40, 35, 55, 45, 70, 50, 65].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t"
                        initial={{ height: 0 }}
                        whileInView={{ height: h * 0.4 }}
                        viewport={{ once: true }}
                        transition={{ ...spring, delay: 0.4 + i * 0.04 }}
                        style={{ background: i >= 6 ? t.green : t.greenLight }}
                      />
                    ))}
                  </div>
                  <div
                    className="flex items-center gap-1 border-t px-3 py-1.5"
                    style={{ borderColor: t.border }}
                  >
                    <TrendingUp
                      className="h-2.5 w-2.5"
                      style={{ color: t.green }}
                    />
                    <span
                      className="text-[7px] font-semibold"
                      style={{ color: t.green }}
                    >
                      +18% this month
                    </span>
                  </div>
                </motion.div>
              </div>
              <div className="p-5 pt-3">
                <h3
                  className="text-base font-bold"
                  style={{ color: t.navy, fontFamily: t.serif }}
                >
                  Get Smarter Insights About Your Money
                </h3>
              </div>
            </Tilt>
          </motion.div>

          {/* ── BOTTOM-CENTER: Green social proof card ── */}
          <motion.div variants={fadeUpScale}>
            <Tilt
              className="flex h-full flex-col justify-between rounded-3xl p-6 text-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ background: t.green }}
            >
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: t.serif }}
                >
                  Trusted by Cannabis Operators
                </h3>
                <p className="mt-1.5 text-sm text-white/70">
                  Simplifying settlement for businesses across the country.
                </p>
              </div>
              <div className="mt-4">
                {/* avatar stack */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/30 text-[10px] font-bold shadow-md"
                        style={{
                          background: `hsl(${140 + i * 22}, 35%, ${
                            28 + i * 8
                          }%)`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ ...spring, delay: 0.3 + i * 0.06 }}
                      >
                        {["GF", "ME", "SC", "PD"][i]}
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...spring, delay: 0.55 }}
                  >
                    10+
                  </motion.div>
                </div>
                {/* stat pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
                    $67K+ Settled
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
                    120+ Invoices
                  </span>
                </div>
              </div>
            </Tilt>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
