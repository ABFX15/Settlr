import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cannabis B2B Payments — Stop Getting Debanked | Settlr",
  description:
    "Pay cannabis cultivators, processors, and distributors instantly in USDC. No bank account needed. No account to freeze. 1% flat fee vs 5-8% from cannabis-friendly processors. Full OFAC-compliant audit trail.",
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
    title: "Cannabis B2B Payments — Stop Getting Debanked | Settlr",
    description:
      "Pay cannabis cultivators, processors & distributors instantly in USDC. No bank account, no debanking risk. 1% flat fee with full compliance audit trail.",
    url: "https://settlr.dev/industries/cannabis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cannabis B2B Payments | Settlr",
    description:
      "Stop getting debanked. Pay cannabis suppliers instantly in USDC. 1% flat, full audit trail, no bank needed.",
  },
};

export default function CannabisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
