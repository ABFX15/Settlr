import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — 1% Flat Crypto Payment Fees",
  description:
    "Settlr charges 1% flat per transaction. No setup fees, no monthly fees, no hidden costs. Compare with Stripe (2.9% + 30¢) and save up to 66% on payment processing.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Settlr Pricing — 1% Flat Crypto Payment Fees",
    description:
      "1% flat per transaction. No setup fees, no monthly fees. Save up to 66% vs Stripe.",
    url: "https://settlr.dev/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
