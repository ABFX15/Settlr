import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Set Up Crypto Payments in 30 Minutes",
  description:
    "Create your Settlr merchant account and start accepting USDC payments. Non-custodial, no bank account needed, deploy to production in under 30 minutes.",
  alternates: { canonical: "/onboarding" },
  openGraph: {
    title: "Get Started with Settlr — Crypto Payments in 30 Minutes",
    description:
      "Create your merchant account and accept USDC payments. Non-custodial, deploy in minutes.",
    url: "https://settlr.dev/onboarding",
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
