import type { Metadata } from "next";
import InternationalWholesaleClient from "./Client";

export const metadata: Metadata = {
  title: "International B2B Wholesale Payments, USDC Settlement | Offbank",
  description:
    "Cross-border B2B wholesale settlement in USDC. Skip SWIFT delays, FX spreads, and correspondent bank fees. 1% flat, instant, anywhere.",
  alternates: { canonical: "/industries/international-wholesale" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "International B2B Wholesale Payments, USDC Settlement",
    description:
      "Cross-border B2B settlement in USDC at 1%. Skip SWIFT, correspondent fees, and 5-day waits.",
    url: "https://offbankpay.com/industries/international-wholesale",
  },
};

export default function InternationalWholesalePage() {
  return <InternationalWholesaleClient />;
}
