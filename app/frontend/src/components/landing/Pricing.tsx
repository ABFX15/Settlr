"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { t, spring, staggerContainer, fadeUpScale, cardHover } from "./shared";

const plans = [
  {
    name: "Explorer",
    desc: "Free tools to get started",
    price: "$0",
    suffix: "/month",
    features: [
      "Create invoices",
      "View settlement history",
      "Basic compliance",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Settlement",
    desc: "Full settlement infrastructure",
    price: "1%",
    suffix: "/transaction",
    features: [
      "All Explorer features",
      "Instant USDC settlement",
      "Email-based claiming",
      "Full compliance suite",
      "Priority support",
    ],
    cta: "Request Access",
    highlighted: true,
  },
  {
    name: "Enterprise",
    desc: "For high-volume operators",
    price: "Custom",
    suffix: "",
    features: [
      "All Settlement features",
      "Volume discounts",
      "Multi-entity support",
      "Dedicated manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="py-[120px]" style={{ background: t.bgOff }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
        >
          <h2
            className="text-[32px] leading-[1.15] tracking-tight font-extrabold sm:text-[40px]"
            style={{ color: t.navy, fontFamily: t.sans }}
          >
            Simple and transparent pricing
          </h2>
          <p
            className="mx-auto mt-4 max-w-lg text-base font-normal"
            style={{ color: t.bodyLight }}
          >
            Choose the plan that fits your goals — simple, transparent pricing
            with no hidden fees.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-5 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUpScale}
              whileHover={
                plan.highlighted
                  ? { y: -8, scale: 1.02, transition: { duration: 0.25 } }
                  : cardHover
              }
              className={`flex flex-col rounded-3xl p-7 transition-shadow duration-300 ${
                plan.highlighted
                  ? "text-white shadow-xl hover:shadow-2xl"
                  : "border bg-white shadow-sm hover:shadow-lg"
              }`}
              style={
                plan.highlighted
                  ? { background: t.green }
                  : { borderColor: t.border }
              }
            >
              <p
                className={`text-lg font-bold ${plan.highlighted ? "" : ""}`}
                style={plan.highlighted ? {} : { color: t.navy }}
              >
                {plan.name}
              </p>
              <p
                className={`mt-1 text-xs ${
                  plan.highlighted ? "text-white/70" : ""
                }`}
                style={plan.highlighted ? {} : { color: t.muted }}
              >
                {plan.desc}
              </p>
              <p className="mt-5">
                <span
                  className={`text-4xl font-bold ${plan.highlighted ? "" : ""}`}
                  style={plan.highlighted ? {} : { color: t.navy }}
                >
                  {plan.price}
                </span>
                {plan.suffix && (
                  <span
                    className={`text-sm ${
                      plan.highlighted ? "text-white/70" : ""
                    }`}
                    style={plan.highlighted ? {} : { color: t.muted }}
                  >
                    {plan.suffix}
                  </span>
                )}
              </p>
              <div className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        plan.highlighted ? "text-white/80" : ""
                      }`}
                      style={plan.highlighted ? {} : { color: t.green }}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-white/90" : ""
                      }`}
                      style={plan.highlighted ? {} : { color: t.slate }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/waitlist"
                className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                  plan.highlighted
                    ? "bg-white shadow-md hover:shadow-lg"
                    : "border hover:shadow-md"
                }`}
                style={
                  plan.highlighted
                    ? { color: t.green }
                    : { borderColor: t.green, color: t.green }
                }
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
