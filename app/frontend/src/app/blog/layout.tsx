import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Payouts, Stablecoins & Guides",
  description:
    "Guides and insights on global payouts, stablecoin settlements, cross-border payments, and building payout systems.",
  keywords: [
    "global payout guides",
    "stablecoin payout blog",
    "cross-border payment insights",
    "USDC payout infrastructure",
    "Solana payout guides",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Blog — Payout Guides & Insights",
    description:
      "Guides on global payout infrastructure, stablecoin settlements, and cross-border payments.",
    url: "https://settlr.dev/blog",
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "Settlr Blog" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Blog — Payout Guides & Insights",
    description:
      "Insights on stablecoin payouts, cross-border payments, and payout infrastructure.",
    images: ["/twitter-image"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
