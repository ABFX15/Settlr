import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Settlr crypto payments. Start free with 2% fees, or go Pro at $29/month with 1.5% fees. Enterprise at 1%. No hidden costs.",
  keywords: [
    "settlr pricing",
    "crypto payment fees",
    "USDC payment pricing",
    "merchant crypto fees",
    "payment gateway pricing",
  ],
  openGraph: {
    title: "Settlr Pricing - Simple & Transparent",
    description:
      "Start free with 2% fees, or go Pro at $29/month with 1.5% fees. Enterprise from 1%.",
    url: "https://settlr.dev/pricing",
  },
  twitter: {
    title: "Settlr Pricing - Simple & Transparent",
    description:
      "Start free with 2% fees, or go Pro at $29/month with 1.5% fees. Enterprise from 1%.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
