import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settlr vs Legacy Cannabis Payment Workflows — Comparison",
  description:
    "Compare Settlr order-to-cash workflow with LeafLink + ACH, high-risk processors, and generic crypto gateways for cannabis wholesale.",
  keywords: [
    "cannabis wholesale payments comparison",
    "cannabis payment processor alternative",
    "order-to-cash cannabis",
    "cannabis invoicing",
    "cannabis receivables",
    "time-to-cash cannabis",
    "cannabis B2B settlement",
  ],
  alternates: { canonical: "/compare" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr vs Legacy Cannabis Payment Workflows",
    description:
      "How Settlr compares to LeafLink + ACH, high-risk processors, and generic crypto gateways for cannabis wholesale order-to-cash.",
    url: "https://settlr.dev/compare",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr Cannabis Wholesale Payment Comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr vs Legacy Cannabis Payment Workflows",
    description:
      "Cannabis wholesalers need faster invoicing, collections, and settlement — not another generic payment gateway.",
    images: ["/twitter-image?v=3"],
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
