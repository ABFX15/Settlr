import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "iGaming Settlement — Instant Non-Custodial USDC",
  description:
    "Settle with players and affiliates instantly using non-custodial USDC. No chargebacks, 1% flat fee, no bank interference. Built for online gaming.",
  alternates: { canonical: "/industries/igaming" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/industries/igaming",
    siteName: "Settlr",
    title: "iGaming Settlement — Instant Non-Custodial USDC",
    description:
      "Non-custodial USDC settlement for iGaming. No chargebacks, 1% flat fee, instant finality.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr — iGaming Settlement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iGaming Settlement — Instant Non-Custodial USDC",
    description:
      "Non-custodial USDC settlement for iGaming. No chargebacks, 1% flat, instant finality.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
