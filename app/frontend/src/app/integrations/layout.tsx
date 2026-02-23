import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — Connect Settlr to Your Stack",
  description:
    "Integrate Settlr payouts with Shopify, WooCommerce, Zapier, Slack, Bubble, and more. Add global payouts to any platform.",
  alternates: { canonical: "/integrations" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/integrations",
    siteName: "Settlr",
    title: "Integrations — Connect Settlr to Your Stack",
    description:
      "Connect Settlr with Shopify, WooCommerce, Zapier, Slack, Bubble, and more.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — Integrations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrations — Connect Settlr to Your Stack",
    description:
      "Connect Settlr with Shopify, WooCommerce, Zapier, Slack, Bubble, and more.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
