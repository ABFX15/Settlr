import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Commerce Payouts — Pay Sellers Worldwide",
  description:
    "Payout infrastructure for marketplaces and e-commerce platforms. Pay sellers in 180+ countries with 1% flat fee, instant settlement.",
  alternates: { canonical: "/industries/ecommerce" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/industries/ecommerce",
    siteName: "Settlr",
    title: "E-Commerce Payouts — Pay Sellers Worldwide",
    description:
      "Payout infrastructure for marketplaces. Pay sellers in 180+ countries, 1% flat, instant.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — E-Commerce Payouts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Commerce Payouts — Pay Sellers Worldwide",
    description:
      "Pay marketplace sellers in 180+ countries. 1% flat, instant USDC settlement.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
