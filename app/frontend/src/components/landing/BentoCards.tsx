"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { t, spring, staggerContainer, fadeUpScale } from "./shared";

/* ── 3D tilt card wrapper ──────────────────────────────── */
function TiltCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), {
    stiffness: 300,
    damping: 30,
  });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BentoCards() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="grid gap-5 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Card 1 — light bg with mini dashboard */}
          <motion.div variants={fadeUpScale}>
            <TiltCard
              className="flex h-full flex-col justify-between overflow-hidden rounded-3xl p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ background: "#F1F5F9", minHeight: 320 }}
            >
              <div>
                <motion.div
                  className="mx-auto w-48 rounded-2xl bg-white p-3 shadow-md"
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ ...spring, delay: 0.2 }}
                >
                  <p
                    className="text-[9px] font-medium"
                    style={{ color: t.muted }}
                  >
                    Total Balance
                  </p>
                  <p className="text-lg font-bold" style={{ color: t.navy }}>
                    $67,200
                  </p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: t.slate }}>
                        GreenLeaf
                      </span>
                      <span
                        className="text-[9px] font-semibold"
                        style={{ color: t.green }}
                      >
                        +$47,500
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: t.slate }}>
                        Mountain Ext.
                      </span>
                      <span
                        className="text-[9px] font-semibold"
                        style={{ color: t.green }}
                      >
                        +$14,250
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="mt-5">
                <h3
                  className="text-lg font-bold"
                  style={{ color: t.navy, fontFamily: t.serif }}
                >
                  Instant B2B Settlement
                </h3>
                <p className="mt-1 text-sm" style={{ color: t.slate }}>
                  Invoice to cash in seconds, not 3–5 business days.
                </p>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 2 — green bg */}
          <motion.div variants={fadeUpScale}>
            <TiltCard
              className="flex h-full flex-col justify-between rounded-3xl p-7 text-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ background: t.green, minHeight: 320 }}
            >
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: t.serif }}
                >
                  No Wallet Required
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  Simplifying settlement for cannabis operators everywhere.
                </p>
              </div>
              <div className="mt-6">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/25 text-[10px] font-bold shadow-md"
                      style={{
                        background: `hsl(${140 + i * 20}, 35%, ${28 + i * 8}%)`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ ...spring, delay: 0.3 + i * 0.06 }}
                    >
                      {["GF", "ME", "SC", "PD", "VW"][i]}
                    </motion.div>
                  ))}
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/25 bg-white/20 text-[10px] font-bold backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...spring, delay: 0.6 }}
                  >
                    10+
                  </motion.div>
                </div>
                <div className="mt-5 flex gap-3">
                  <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
                    $67K+ Settled
                  </span>
                  <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-semibold backdrop-blur-sm">
                    Email-Based
                  </span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 3 — dark bg */}
          <motion.div variants={fadeUpScale}>
            <TiltCard
              className="relative flex h-full flex-col justify-end overflow-hidden rounded-3xl p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl"
              style={{ background: t.navy, minHeight: 320 }}
            >
              {/* animated gradient mesh */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  background: [
                    `radial-gradient(circle at 30% 20%, ${t.green} 0%, transparent 50%)`,
                    `radial-gradient(circle at 70% 80%, ${t.green} 0%, transparent 50%)`,
                    `radial-gradient(circle at 30% 20%, ${t.green} 0%, transparent 50%)`,
                  ],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${t.navy}00 0%, ${t.navy} 60%)`,
                }}
              />
              <div className="relative">
                <h3
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: t.serif }}
                >
                  Unstoppable Payment Rails
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  Non-custodial USDC on Solana. No bank can freeze, reverse, or
                  block your payments.
                </p>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
