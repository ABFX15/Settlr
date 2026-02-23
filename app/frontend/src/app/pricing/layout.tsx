import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — 1% Flat Global Payout Fees",
  description:
    "1% flat per payout. No setup fees, no monthly fees, no FX markup. Compare with PayPal, wire transfers, and Stripe Connect.",
  keywords: [
    "payout pricing",
    "1% payout fees",
    "cheap international payouts",
    "USDC payout cost",
    "PayPal alternative pricing",
    "wire transfer alternative",
  ],
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Pricing — 1% Flat Global Payout Fees",
    description:
      "1% flat per payout. No setup fees, no FX markup. Save 80%+ vs PayPal and wire transfers.",
    url: "https://settlr.dev/pricing",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Pricing — 1% Flat Payout Fees",
    description:
      "1% flat per payout to 180+ countries. No FX fees, no wire fees, no hidden charges.",
    images: ["/twitter-image"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
