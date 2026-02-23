import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Labeling Payouts — Pay Annotators by Email",
  description:
    "Pay thousands of data labeling annotators in 180+ countries with just their email. 1% flat, instant USDC, no wire fees.",
  keywords: [
    "data labeling payouts",
    "pay annotators globally",
    "annotation worker payments",
    "Remotasks payout alternative",
    "Toloka payout alternative",
    "Scale AI payout",
    "data annotation payouts",
    "labeling platform payouts",
    "USDC annotator payments",
    "emerging market payouts",
    "pay workers by email",
    "cross-border annotator payments",
  ],
  alternates: { canonical: "/industries/data-labeling" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Data Labeling Payouts — Pay Annotators by Email",
    description:
      "Pay annotators in 180+ countries with just their email. 1% flat, instant settlement, no wire fees.",
    url: "https://settlr.dev/industries/data-labeling",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Data Labeling Payouts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Labeling Payouts",
    description:
      "Pay thousands of annotators globally. 1% flat, instant USDC, email-only. Built for annotation platforms.",
    images: ["/twitter-image"],
  },
};

export default function DataLabelingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
