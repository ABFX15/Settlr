import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settlr vs PayPal vs Wire Transfer — Global Payout Comparison",
  description:
    "Compare Settlr with PayPal, Wise, Payoneer, Stripe Connect, and wire transfers for global payouts. See fees, settlement speed, country coverage, and recipient experience side by side.",
  keywords: [
    "payout comparison",
    "PayPal alternative payouts",
    "Wise alternative",
    "Payoneer alternative",
    "Stripe Connect alternative",
    "cheapest international payouts",
    "best payout platform",
  ],
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Best Global Payout Platform Comparison (2026) | Settlr",
    description:
      "Compare payout fees, speed, and coverage across Settlr, PayPal, Wise, Payoneer, and wire transfers.",
    url: "https://settlr.dev/compare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Payout Comparison — Settlr vs PayPal vs Wire",
    description:
      "1% flat vs 5%+ PayPal vs $25+ wire. Compare the best way to pay people globally.",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
