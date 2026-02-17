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
    title: "Get Started with Settlr — Global Payouts in 30 Minutes",
    description:
      "Set up your platform and send USDC payouts to 180+ countries. Non-custodial, deploy in minutes.",
    url: "https://settlr.dev/onboarding",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Started with Settlr — Global Payouts in 30 Minutes",
    description:
      "Start sending USDC payouts to anyone, anywhere, with just their email.",
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
