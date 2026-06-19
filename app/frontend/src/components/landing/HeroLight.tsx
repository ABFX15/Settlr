"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

/**
 * Aeropay-style LIGHT hero — modeled from goaeropay.com:
 * cream + pastel-gradient background, colossal near-black headline, a soft
 * mint pill, a single black CTA, and a clean product mockup with light
 * floating status chips. Lives on its own preview route for side-by-side
 * comparison with the current dark hero.
 */
export function HeroLight() {
  return (
    <section className="relative overflow-hidden bg-[#FBFAF7]">
      {/* soft pastel gradient washes (mint / lavender / peach) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(60% 50% at 8% 0%, rgba(52,199,89,0.14) 0%, transparent 60%)",
            "radial-gradient(55% 50% at 100% 8%, rgba(124,108,242,0.12) 0%, transparent 55%)",
            "radial-gradient(70% 60% at 90% 100%, rgba(255,176,120,0.10) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          {/* ── left: copy ─────────────────────────────── */}
          <div>
            <span className="inline-flex items-center rounded-full bg-[#34c759]/12 px-3.5 py-1.5 text-[13px] font-semibold text-[#2ba048]">
              For cannabis &amp; high-risk B2B
            </span>

            <h1 className="mt-6 text-[52px] font-extrabold leading-[0.98] tracking-[-0.02em] text-[#0E1116] sm:text-[64px] lg:text-[76px]">
              Your processor
              <br />
              can&apos;t shut
              <br />
              you down.
            </h1>

            <p className="mt-7 max-w-md text-[18px] leading-[1.6] text-[#475467]">
              <span className="font-semibold text-[#0E1116]">
                Get paid in seconds
              </span>{" "}
              on a rail no bank can freeze. 1% flat, settles instantly, cash out
              to your business account when you&apos;re ready.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/onboarding"
                className="group inline-flex items-center gap-2 rounded-full bg-[#0E1116] px-7 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-100 ease-out hover:bg-[#1d2939] active:scale-[0.98]"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center rounded-full px-5 py-3.5 text-[15px] font-semibold text-[#344054] transition-colors duration-100 hover:text-[#0E1116]"
              >
                Watch demo →
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2">
              {["Non-custodial", "1% all-in", "No debanking"].map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475467]"
                >
                  <Check className="h-3.5 w-3.5 text-[#2ba048]" strokeWidth={2.5} />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* ── right: product mockup + light status chips ─ */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.05] shadow-[0_2px_8px_rgba(16,24,40,0.04),0_24px_64px_-24px_rgba(16,24,40,0.18)]">
              <Image
                src="/dashboard-mock.png"
                alt="Offbank settlement dashboard — payments and balances in USD"
                width={960}
                height={640}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="block w-full"
              />
            </div>

            {/* floating chip — paid */}
            <div className="absolute -left-4 top-8 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/[0.05] shadow-[0_8px_28px_-8px_rgba(16,24,40,0.22)] sm:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#34c759]/12">
                  <Check className="h-4.5 w-4.5 text-[#2ba048]" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0E1116]">
                    Invoice paid
                  </p>
                  <p className="text-[12px] tabular-nums text-[#667085]">
                    $47,500 · settled in 0.6s
                  </p>
                </div>
              </div>
            </div>

            {/* floating chip — cash-out */}
            <div className="absolute -right-3 bottom-10 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/[0.05] shadow-[0_8px_28px_-8px_rgba(16,24,40,0.22)] sm:-right-7">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6CF2]/12">
                  <ArrowRight className="h-4.5 w-4.5 text-[#6457d6]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0E1116]">
                    Cash-out to bank
                  </p>
                  <p className="text-[12px] tabular-nums text-[#667085]">
                    $14,250 · next day
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
