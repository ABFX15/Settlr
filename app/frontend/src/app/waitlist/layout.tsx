import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Sales — Enterprise Payouts",
  description:
    "Talk to the Settlr team about enterprise payout infrastructure. Custom integrations, volume pricing, and dedicated support for platforms paying globally.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Contact Sales | Settlr",
    description:
      "Enterprise payout infrastructure. Custom integrations, volume pricing, dedicated support.",
    url: "https://settlr.dev/waitlist",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Enterprise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Sales | Settlr",
    description:
      "Enterprise payout infrastructure. Custom integrations, volume pricing, dedicated support.",
    images: ["/twitter-image"],
  },
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
