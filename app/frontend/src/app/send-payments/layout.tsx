import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send Payments — Pay Anyone With Just an Email",
  description:
    "Send USDC payments to anyone in 180+ countries using just their email. 1% flat fee, instant settlement, no bank details required.",
  alternates: { canonical: "/send-payments" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/send-payments",
    siteName: "Settlr",
    title: "Send Payments — Pay Anyone With Just an Email",
    description:
      "Send USDC to anyone in 180+ countries using just their email. 1% flat, instant settlement.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — Send Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Send Payments — Pay Anyone With Just an Email",
    description:
      "Send USDC to anyone in 180+ countries. 1% flat fee, instant settlement.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
