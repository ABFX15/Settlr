import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Sales — Enterprise Payouts",
  description:
    "Talk to the Settlr team about enterprise payout infrastructure. Custom integrations, volume pricing, and dedicated support for platforms paying globally.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    title: "Contact Sales | Settlr",
    description:
      "Enterprise payout infrastructure. Custom integrations, volume pricing, dedicated support.",
    url: "https://settlr.dev/waitlist",
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
