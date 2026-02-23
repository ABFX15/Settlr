import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — See Instant Global Payouts in Action",
  description:
    "Try Settlr's payout infrastructure live. Send a test USDC payout to any email — see instant settlement, zero gas fees, and email-based claiming in action.",
  keywords: [
    "payout demo",
    "USDC payout demo",
    "instant settlement demo",
    "global payout live demo",
    "email payout demo",
  ],
  alternates: { canonical: "/demo" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Demo — Instant Global Payouts in Action",
    description:
      "See how one API call sends a payout to any email in the world. Instant settlement, zero gas, 180+ countries.",
    url: "https://settlr.dev/demo",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Live Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Demo — Instant Global Payouts",
    description: "One API call, one email, instant settlement. Try it live.",
    images: ["/twitter-image"],
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
