import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Platform Payouts — Pay Creators in 180+ Countries",
  description:
    "Payout infrastructure for creator platforms. Pay creators, artists, and digital product sellers globally with just their email. 1% flat, instant USDC settlement, no country restrictions.",
  keywords: [
    "creator payouts",
    "pay creators globally",
    "creator platform payout infrastructure",
    "digital product payouts",
    "Gumroad payout alternative",
    "Ko-fi payout alternative",
    "Fourthwall payout alternative",
    "creator economy payouts",
    "artist payouts by email",
    "USDC creator payments",
    "international creator payouts",
  ],
  alternates: { canonical: "/industries/creators" },
  openGraph: {
    title: "Creator Platform Payouts — Pay Creators in 180+ Countries | Settlr",
    description:
      "Payout infrastructure for creator platforms. Pay anyone by email, 1% flat, instant settlement, 180+ countries.",
    url: "https://settlr.dev/industries/creators",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Platform Payouts | Settlr",
    description:
      "Pay creators globally with just their email. 1% flat, instant USDC, no country restrictions.",
  },
};

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
