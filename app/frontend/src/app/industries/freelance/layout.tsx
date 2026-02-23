import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelance Marketplace Payouts — No Wire Fees",
  description:
    "Payout infrastructure for freelance marketplaces. Pay contractors in 180+ countries by email. 1% flat, instant, no wire fees.",
  keywords: [
    "freelancer payouts",
    "gig marketplace payouts",
    "pay contractors globally",
    "freelance platform payout infrastructure",
    "Contra payout alternative",
    "Braintrust payout alternative",
    "contractor payments by email",
    "USDC freelancer payments",
    "international contractor payouts",
    "no wire fee payouts",
    "gig economy payout rails",
  ],
  alternates: { canonical: "/industries/freelance" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Freelance Marketplace Payouts — No Wire Fees",
    description:
      "Pay contractors in 180+ countries by email. 1% flat, instant settlement, no wire fees.",
    url: "https://settlr.dev/industries/freelance",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Freelance Payouts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Marketplace Payouts",
    description:
      "Pay contractors globally by email. 1% flat, instant USDC, no wire fees or bank details.",
    images: ["/twitter-image"],
  },
};

export default function FreelanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
