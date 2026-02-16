import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Crypto Payments, Solana, and Stablecoin Guides",
  description:
    "Guides, comparisons, and insights on accepting crypto payments, Solana integrations, stablecoin checkout, and building global-first payment infrastructure.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Settlr Blog — Crypto Payment Guides & Insights",
    description:
      "Guides on accepting crypto payments, Solana integrations, and stablecoin checkout.",
    url: "https://settlr.dev/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
