import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Sales — Enterprise Settlement",
  description:
    "Talk to the Settlr team about enterprise non-custodial settlement infrastructure. Custom integrations, volume pricing, and dedicated support for high-risk industries.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Contact Sales | Settlr",
    description:
      "Enterprise non-custodial settlement infrastructure. Custom integrations, volume pricing, dedicated support.",
    url: "https://settlr.dev/waitlist",
    images: [
      {
        url: "/opengraph-image?v=3",
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
      "Enterprise non-custodial settlement infrastructure. Custom integrations, volume pricing, dedicated support.",
    images: ["/twitter-image?v=3"],
  },
};

import AuthLayout from "@/components/AuthLayout";

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
