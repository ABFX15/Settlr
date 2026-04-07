"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { t, spring } from "./shared";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const dashY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      {/* ── background image with parallax ─────────────── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        <Image
          src="/hero-bg.png"
          alt="Dark atmospheric hero background with green lighting"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>

      {/* ── dark overlay ───────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/50" />

      {/* ── volumetric green glow — edges ──────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 0% 50%, rgba(45,106,79,0.25) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 50% at 100% 50%, rgba(45,106,79,0.18) 0%, transparent 60%)",
            "radial-gradient(ellipse 80% 30% at 50% 100%, rgba(45,106,79,0.22) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      {/* ── content ────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-[1400px] px-6 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
            {/* ── left: copy ─────────────────────────────── */}
            <motion.div style={{ y: contentY }}>
              <h1
                className="text-[44px] leading-[1.08] tracking-tight drop-shadow-lg sm:text-[58px] lg:text-[68px]"
                style={{
                  fontFamily: t.sans,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  textShadow: "0 2px 30px rgba(0,0,0,0.7)",
                }}
              >
                Get paid instantly on wholesale orders.
              </h1>

              <p
                className="mt-7 max-w-lg text-[18px] font-normal leading-[1.7]"
                style={{
                  color: "#D1D5DB",
                  textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                }}
              >
                Settle invoices in seconds, not days. No bank needed. No account
                freezes. Just USDC moving directly between you and your
                suppliers. 1% flat.
              </p>

              {/* ── CTAs ───────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.2 }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/waitlist"
                  className="group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
                  style={{ background: t.green }}
                >
                  Start Getting Paid Instantly
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/[0.06]"
                >
                  Watch Demo
                </Link>
              </motion.div>

              {/* ── compliance badges ───────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.35 }}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2"
              >
                {["GENIUS Act Compliant", "Non-Custodial", "BSA/AML"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium"
                      style={{ color: t.green }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {badge}
                    </span>
                  ),
                )}
              </motion.div>
            </motion.div>

            {/* ── right: dashboard mockup ────────────────── */}
            <motion.div
              style={{ y: dashY }}
              initial={{ opacity: 0, x: 50, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ ...spring, delay: 0.35 }}
              className="relative"
            >
              {/* main dashboard image */}
              <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
                <Image
                  src="/dashboard-mock.png"
                  alt="Settlr settlement dashboard showing volumes, transactions, and real-time settlement data"
                  width={960}
                  height={640}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="block w-full"
                />
              </div>

              {/* ── floating card 1: settlement complete ──── */}
              <motion.div
                className="absolute -left-4 top-6 z-20 rounded-2xl border border-white/15 bg-black/60 px-5 py-4 shadow-2xl backdrop-blur-2xl sm:-left-10"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Settlement Complete
                    </p>
                    <p className="text-xs text-white/60">
                      $47,500 · GreenLeaf → Pacific Dist. · 0.6s
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* ── floating card 2: invoice paid ─────────── */}
              <motion.div
                className="absolute -right-3 bottom-10 z-20 rounded-2xl border border-white/15 bg-black/60 px-5 py-4 shadow-2xl backdrop-blur-2xl sm:-right-8"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.5,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Invoice Paid
                    </p>
                    <p className="text-xs text-white/60">
                      $14,250 · Mountain Extracts · 0.8s
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── sr-only for SEO ─────────────────────────────── */}
      <p className="sr-only">
        Settlr is a non-custodial stablecoin settlement platform for B2B
        cannabis distributors at 1% flat fee, built on Solana.
      </p>
    </section>
  );
}
