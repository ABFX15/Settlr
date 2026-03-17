"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Shield } from "lucide-react";
import { t, spring, fadeUp, staggerContainer, easeOutQuart } from "./shared";

/* ── animated counter ──────────────────────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setVal(Math.round(easeOutQuart(progress) * end));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, end]);

  return (
    <p ref={ref} className="text-3xl font-bold" style={{ color: t.navy }}>
      {val}
      {suffix}
    </p>
  );
}

export function SocialProof() {
  return (
    <section
      className="border-t py-20 sm:py-28"
      style={{ borderColor: t.border }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-3">
          {/* heading + stats */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={spring}
              className="text-[32px] leading-[1.1] tracking-tight sm:text-[40px]"
              style={{ color: t.navy, fontFamily: t.serif, fontWeight: 800 }}
            >
              Built for the businesses banks won&apos;t serve
            </motion.h2>

            <motion.div
              className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {[
                { end: 67, suffix: "K+", label: "Settled", prefix: "$" },
                { end: 1, suffix: "s", label: "Avg. Settlement", prefix: "<" },
                { end: 120, suffix: "+", label: "Invoices", prefix: "" },
                { end: 24, suffix: "/7", label: "Availability", prefix: "" },
              ].map((s) => (
                <motion.div key={s.label} variants={fadeUp}>
                  <p className="text-3xl font-bold" style={{ color: t.navy }}>
                    {s.prefix}
                    <Counter end={s.end} suffix={s.suffix} />
                  </p>
                  <p className="text-xs" style={{ color: t.muted }}>
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* center image placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...spring, delay: 0.15 }}
            className="flex items-center justify-center rounded-3xl shadow-inner"
            style={{ background: t.greenLight, aspectRatio: "3/4" }}
          >
            <div className="text-center">
              <Shield
                className="mx-auto h-16 w-16"
                style={{ color: t.green, opacity: 0.3 }}
              />
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: t.green }}
              >
                Product photo
              </p>
            </div>
          </motion.div>

          {/* right copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: t.slate }}
            >
              With operators across multiple states, Settlr has become the go-to
              platform for cannabis businesses looking to simplify B2B payments
              and eliminate bank dependency.
            </p>
            <p
              className="mt-4 text-[15px] leading-relaxed"
              style={{ color: t.slate }}
            >
              From invoice creation to instant settlement, Settlr makes payments
              easy, reliable, and accessible — helping operators stay in control
              no matter where they are.
            </p>
            <Link
              href="/waitlist"
              className="group mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              style={{ border: `1.5px solid ${t.green}`, color: t.green }}
            >
              About Us
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
