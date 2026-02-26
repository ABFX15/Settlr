import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — B2B Settlement Rail for Restricted Commerce",
  description:
    "See how Settlr settles B2B invoices in under 5 seconds. Non-custodial, 1% flat, with a cryptographic audit trail. Try payment links and invoice settlement live.",
  keywords: [
    "cannabis B2B settlement demo",
    "stablecoin invoice settlement",
    "non-custodial payment demo",
    "USDC B2B payment link",
    "restricted commerce settlement",
  ],
  alternates: { canonical: "/demo" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Demo — B2B Settlement Rail in Action",
    description:
      "Create a payment link or settle a B2B invoice. Non-custodial, instant, with an on-chain audit trail.",
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
    title: "Settlr Demo — B2B Settlement Rail",
    description:
      "Non-custodial B2B settlement in under 5 seconds. Try payment links and invoice settlement live.",
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
