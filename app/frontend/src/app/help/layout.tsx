import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center — FAQs & Support",
  description:
    "Get help with Settlr settlement infrastructure. FAQs, documentation, and support for non-custodial USDC settlement.",
  keywords: [
    "settlr help",
    "settlement help",
    "USDC settlement support",
    "settlr faq",
    "non-custodial settlement support",
    "high-risk payment help",
  ],
  alternates: { canonical: "/help" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Help Center",
    description:
      "Find answers to common questions about non-custodial USDC settlement with Settlr.",
    url: "https://settlr.dev/help",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr Help Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Help Center",
    description:
      "FAQs and support for non-custodial USDC settlement with Settlr.",
    images: ["/twitter-image?v=3"],
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
