import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Send Global Payouts in 30 Minutes",
  description:
    "Set up your Settlr platform account and start sending USDC payouts globally. Non-custodial, email-only, deploy to production in under 30 minutes.",
  keywords: [
    "payout API setup",
    "USDC payout onboarding",
    "global payout integration",
    "stablecoin payout quickstart",
  ],
  alternates: { canonical: "/onboarding" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Get Started with Settlr — Global Payouts in 30 Minutes",
    description:
      "Set up your platform and send USDC payouts to 180+ countries. Non-custodial, deploy in minutes.",
    url: "https://settlr.dev/onboarding",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Get Started with Settlr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Started with Settlr — Global Payouts in 30 Minutes",
    description:
      "Start sending USDC payouts to anyone, anywhere, with just their email.",
    images: ["/twitter-image"],
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
