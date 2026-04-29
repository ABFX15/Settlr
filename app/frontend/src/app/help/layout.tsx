import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center, FAQs & Support",
  description:
    "Get help with Offbank settlement infrastructure. FAQs, documentation, and support for non-custodial USDC settlement.",
  keywords: [
    "offbank help",
    "settlement help",
    "USDC settlement support",
    "offbank faq",
    "non-custodial settlement support",
    "high-risk payment help",
  ],
  alternates: { canonical: "/help" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Offbank",
    title: "Offbank Help Center",
    description:
      "Find answers to common questions about non-custodial USDC settlement with Offbank.",
    url: "https://offbankpay.com/help",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Offbank Help Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offbank Help Center",
    description:
      "FAQs and support for non-custodial USDC settlement with Offbank.",
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
