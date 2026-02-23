import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cannabis B2B Payments — Stop Getting Debanked",
  description:
    "Pay cannabis cultivators and distributors instantly in USDC. No bank account needed, no debanking risk. 1% flat fee, OFAC-compliant.",
  keywords: [
    "cannabis B2B payments",
    "marijuana payment processing",
    "cannabis vendor payments",
    "debanked dispensary payments",
    "cannabis supply chain payments",
    "cannabis USDC payments",
    "marijuana B2B pay",
    "cannabis cultivator payments",
    "cannabis distributor payments",
    "legal cannabis payment solution",
    "cannabis banking alternative",
    "dispensary payment processing",
    "cannabis cashless payments",
    "hemp B2B payments",
    "cannabis stablecoin payments",
    "marijuana debanking solution",
    "cannabis compliance payments",
    "cannabis 280E tax payments",
    "cannabis cash elimination",
    "cannabis armored transport alternative",
  ],
  alternates: { canonical: "/industries/cannabis" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Cannabis B2B Payments — Stop Getting Debanked",
    description:
      "Pay cannabis suppliers instantly in USDC. No bank account, no debanking risk. 1% flat fee with full compliance.",
    url: "https://settlr.dev/industries/cannabis",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Cannabis Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cannabis B2B Payments",
    description:
      "Stop getting debanked. Pay cannabis suppliers instantly in USDC. 1% flat, full audit trail.",
    images: ["/twitter-image"],
  },
};

export default function CannabisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
