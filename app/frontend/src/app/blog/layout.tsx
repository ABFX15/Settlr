import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Global Payouts, Stablecoins & Infrastructure Guides",
  description:
    "Guides, comparisons, and insights on global payout infrastructure, USDC settlements, cross-border payments, and building payout systems with stablecoins on Solana.",
  keywords: [
    "global payout guides",
    "stablecoin payout blog",
    "cross-border payment insights",
    "USDC payout infrastructure",
    "Solana payout guides",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Settlr Blog — Global Payout Guides & Insights",
    description:
      "Guides on global payout infrastructure, stablecoin settlements, and cross-border payments.",
    url: "https://settlr.dev/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Blog — Global Payout Guides & Insights",
    description:
      "Insights on stablecoin payouts, cross-border payments, and payout infrastructure.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
