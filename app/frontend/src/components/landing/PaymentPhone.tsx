"use client";

import { Check, ArrowDownLeft, CreditCard, Landmark } from "lucide-react";

/**
 * Pure-CSS phone mockup for the hero — shows payments landing / settling.
 * No image assets (crisp at any size, never breaks), light screen that glows
 * on the dark hero background. Aeropay-style "money moving" visual.
 */
export function PaymentPhone() {
  return (
    <div className="relative mx-auto w-[300px] select-none sm:w-[330px]">
      {/* Phone body */}
      <div className="relative rounded-[3rem] bg-[#0b0b0d] p-3 shadow-[0_40px_100px_-25px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[2.4rem] bg-[#F6F7F9]">
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-3 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-black" />

          <div className="px-5 pb-7 pt-14">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#98A2B3]">
                  Available
                </p>
                <p className="text-2xl font-bold tracking-tight tabular-nums text-[#101828]">
                  $61,750
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#34c759]/10">
                <Landmark className="h-4.5 w-4.5 text-[#2ba048]" />
              </div>
            </div>

            {/* Paid hero card */}
            <div className="mt-5 rounded-2xl bg-white p-5 text-center ring-1 ring-black/[0.04] shadow-[0_2px_8px_rgba(16,24,40,0.05)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759] shadow-[0_6px_16px_-4px_rgba(52,199,89,0.5)]">
                <Check className="h-6 w-6 text-white" strokeWidth={2.6} />
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-[#101828]">
                $47,500
              </p>
              <p className="mt-0.5 text-[13px] text-[#667085]">
                Acme Distribution · settled in 0.6s
              </p>
            </div>

            {/* Today list */}
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-[#98A2B3]">
              Today
            </p>
            <div className="mt-2 space-y-1.5">
              {[
                { icon: ArrowDownLeft, who: "Green Valley", amt: "+$14,250" },
                { icon: CreditCard, who: "Card payment", amt: "+$1,280" },
                { icon: Landmark, who: "Cash-out · bank", amt: "−$20,000" },
              ].map((r) => (
                <div
                  key={r.who}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/[0.03]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F2F4F7]">
                    <r.icon className="h-4 w-4 text-[#475467]" />
                  </div>
                  <p className="flex-1 text-[13px] font-medium text-[#344054]">
                    {r.who}
                  </p>
                  <p className="text-[13px] font-semibold tabular-nums text-[#101828]">
                    {r.amt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
