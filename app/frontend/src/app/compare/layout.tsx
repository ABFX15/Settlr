import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Settlr vs Stripe vs Coinbase Commerce — Crypto Payment Gateway Comparison",
  description:
    "Compare Settlr with Stripe, Coinbase Commerce, NOWPayments, and BitPay. See fees, settlement speed, custody model, and supported stablecoins side by side. Find the best crypto payment gateway for your business.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Best Crypto Payment Gateway Comparison (2026) | Settlr",
    description:
      "Compare fees, speed, and features across Settlr, Stripe, Coinbase Commerce, NOWPayments, and BitPay.",
    url: "https://settlr.dev/compare",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
