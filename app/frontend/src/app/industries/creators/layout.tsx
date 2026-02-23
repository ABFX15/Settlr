import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Payouts — Pay Creators in 180+ Countries",
  description:
    "Payout infrastructure for creator platforms. Pay creators globally with just their email. 1% flat, instant USDC settlement, 180+ countries.",
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
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Creator Payouts — Pay Creators in 180+ Countries",
    description:
      "Pay creators globally by email. 1% flat, instant settlement, 180+ countries.",
    url: "https://settlr.dev/industries/creators",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Creator Payouts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Payouts",
    description:
      "Pay creators globally with just their email. 1% flat, instant USDC, no country restrictions.",
    images: ["/twitter-image"],
  },
};

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
