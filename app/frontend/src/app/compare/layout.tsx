import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settlr vs PayPal vs Wire — Payout Comparison",
  description:
    "Compare Settlr fees, speed, and coverage with PayPal, Wise, Payoneer, Stripe Connect, and wire transfers.",
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
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr vs PayPal vs Wire — Payout Comparison",
    description:
      "Compare payout fees, speed, and coverage across Settlr, PayPal, Wise, Payoneer, and wire transfers.",
    url: "https://settlr.dev/compare",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Payout Comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr vs PayPal vs Wire — Payout Comparison",
    description:
      "1% flat vs 5%+ PayPal vs $25+ wire. Compare the best way to pay globally.",
    images: ["/twitter-image"],
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
