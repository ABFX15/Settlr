import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelance & Gig Marketplace Payouts — No Wire Fees, No Delays",
  description:
    "Payout infrastructure for freelance marketplaces and gig platforms. Pay contractors in 180+ countries by email. 1% flat, instant USDC settlement — no wire fees, no PayPal holds, no bank details needed.",
  keywords: [
    "freelancer payouts",
    "gig marketplace payouts",
    "pay contractors globally",
    "freelance platform payout infrastructure",
    "Contra payout alternative",
    "Braintrust payout alternative",
    "contractor payments by email",
    "USDC freelancer payments",
    "international contractor payouts",
    "no wire fee payouts",
    "gig economy payout rails",
  ],
  alternates: { canonical: "/industries/freelance" },
  openGraph: {
    title: "Freelance & Gig Marketplace Payouts — No Wire Fees | Settlr",
    description:
      "Pay contractors in 180+ countries by email. 1% flat, instant settlement, no wire fees or PayPal hassles.",
    url: "https://settlr.dev/industries/freelance",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Marketplace Payouts | Settlr",
    description:
      "Pay contractors globally by email. 1% flat, instant USDC, no wire fees or bank details.",
  },
};

export default function FreelanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
