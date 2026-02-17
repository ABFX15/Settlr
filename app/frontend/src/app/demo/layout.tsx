import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — See Instant Global Payouts in Action",
  description:
    "Try Settlr's payout infrastructure live. Send a test USDC payout to any email — see instant settlement, zero gas fees, and email-based claiming in action.",
  keywords: [
    "payout demo",
    "USDC payout demo",
    "instant settlement demo",
    "global payout live demo",
    "email payout demo",
  ],
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Settlr Demo — Instant Global Payouts in Action",
    description:
      "See how one API call sends a payout to any email in the world. Instant settlement, zero gas, 180+ countries.",
    url: "https://settlr.dev/demo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Demo — Instant Global Payouts",
    description: "One API call, one email, instant settlement. Try it live.",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
