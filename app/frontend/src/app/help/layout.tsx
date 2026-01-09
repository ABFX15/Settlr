import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Get help with Settlr crypto payments. FAQs, documentation, and support for merchants accepting USDC payments.",
  keywords: [
    "settlr help",
    "crypto payment help",
    "USDC payment support",
    "settlr faq",
    "crypto merchant support",
  ],
  openGraph: {
    title: "Settlr Help Center",
    description:
      "Find answers to common questions about accepting crypto payments with Settlr.",
    url: "https://settlr.dev/help",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
