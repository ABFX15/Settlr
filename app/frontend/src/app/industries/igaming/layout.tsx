import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "iGaming Payouts — Instant Crypto Withdrawals",
  description:
    "Pay players and affiliates instantly with USDC. No chargebacks, 1% flat fee, 180+ countries. Built for online gaming platforms.",
  alternates: { canonical: "/industries/igaming" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/industries/igaming",
    siteName: "Settlr",
    title: "iGaming Payouts — Instant Crypto Withdrawals",
    description:
      "Pay players and affiliates instantly with USDC. No chargebacks, 1% flat fee, 180+ countries.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — iGaming Payouts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iGaming Payouts — Instant Crypto Withdrawals",
    description:
      "Pay players and affiliates instantly with USDC. No chargebacks, 1% flat, 180+ countries.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
