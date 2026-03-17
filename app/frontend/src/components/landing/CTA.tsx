"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { t, spring } from "./shared";

export function CTA() {
  return (
    <section className="py-20 sm:py-28" style={{ background: "#E0F2FE" }}>
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="overflow-hidden rounded-3xl px-8 py-20 text-center shadow-2xl sm:px-16 sm:py-24"
          style={{ background: t.navy }}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={spring}
        >
          {/* animated gradient mesh */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-15"
            animate={{
              background: [
                `radial-gradient(ellipse at 20% 30%, ${t.green} 0%, transparent 50%)`,
                `radial-gradient(ellipse at 80% 70%, ${t.green} 0%, transparent 50%)`,
                `radial-gradient(ellipse at 20% 30%, ${t.green} 0%, transparent 50%)`,
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.h2
            className="relative mx-auto max-w-xl text-[32px] leading-[1.1] tracking-tight text-white sm:text-[44px]"
            style={{ fontFamily: t.serif, fontWeight: 800 }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.15 }}
          >
            Stop paying the high-risk tax.{" "}
            <span style={{ color: t.green }}>Start settling in seconds.</span>
          </motion.h2>

          <motion.p
            className="relative mx-auto mt-5 max-w-md text-base text-white/60"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.25 }}
          >
            A settlement platform designed to simplify how you move money in
            cannabis. Low fees. Instant finality.
          </motion.p>

          <motion.div
            className="relative mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.35 }}
          >
            <Link
              href="/waitlist"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: t.green }}
            >
              Request Access
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10"
            >
              Watch Demo
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
