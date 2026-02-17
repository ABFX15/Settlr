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
  openGraph: {
    title: "Settlr Help Center",
    description:
      "Find answers to common questions about sending global payouts with Settlr.",
    url: "https://settlr.dev/help",
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Help Center",
    description: "FAQs and support for global USDC payouts with Settlr.",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
