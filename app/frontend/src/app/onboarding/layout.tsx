import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Deploy Non-Custodial Settlement in 30 Minutes",
  description:
    "Set up your Settlr account and start settling B2B transactions with non-custodial USDC on Solana. Deploy to production in under 30 minutes.",
  keywords: [
    "settlement API setup",
    "USDC settlement onboarding",
    "non-custodial settlement integration",
    "stablecoin settlement quickstart",
  ],
  alternates: { canonical: "/onboarding" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Get Started with Settlr — Non-Custodial Settlement in 30 Minutes",
    description:
      "Deploy non-custodial USDC settlement for high-risk B2B supply chains. Live in minutes.",
    url: "https://settlr.dev/onboarding",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Get Started with Settlr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Started with Settlr — Non-Custodial Settlement in 30 Minutes",
    description:
      "Deploy non-custodial USDC settlement for your B2B supply chain. No bank interference.",
    images: ["/twitter-image?v=3"],
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
