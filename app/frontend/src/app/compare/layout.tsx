import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settlr vs Traditional Processors — Settlement Comparison",
  description:
    "Compare Settlr non-custodial USDC settlement with traditional high-risk payment processors. 1% flat vs 5-8% industry average.",
  keywords: [
    "settlement comparison",
    "high-risk payment processor comparison",
    "cannabis payment processor alternative",
    "non-custodial settlement vs traditional",
    "cheapest high-risk processing",
    "best settlement platform",
  ],
  alternates: { canonical: "/compare" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr vs Traditional Processors — Settlement Comparison",
    description:
      "Compare settlement fees, speed, and compliance. 1% flat vs 5-8% traditional high-risk processors.",
    url: "https://settlr.dev/compare",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr Settlement Comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr vs Traditional Processors — Settlement Comparison",
    description:
      "1% flat non-custodial USDC settlement vs 5-8% traditional high-risk processors.",
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
