import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center — FAQs & Support",
  description:
    "Get help with Settlr payouts. FAQs, documentation, and support for platforms sending USDC payouts globally.",
  keywords: [
    "settlr help",
    "payout help",
    "USDC payout support",
    "settlr faq",
    "global payout support",
    "email payout help",
  ],
  alternates: { canonical: "/help" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Help Center",
    description:
      "Find answers to common questions about sending global payouts with Settlr.",
    url: "https://settlr.dev/help",
    images: [
      {
        url: "/opengraph-image?v=2",
        width: 1200,
        height: 630,
        alt: "Settlr Help Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Help Center",
    description: "FAQs and support for global USDC payouts with Settlr.",
    images: ["/twitter-image?v=2"],
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
