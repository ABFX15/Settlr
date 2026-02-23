import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopify Payouts — Pay Vendors via Settlr",
  description:
    "Add instant USDC payouts to your Shopify store. Pay vendors and suppliers globally with 1% flat fee.",
  alternates: { canonical: "/integrations/shopify" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/integrations/shopify",
    siteName: "Settlr",
    title: "Shopify Payouts — Pay Vendors via Settlr",
    description:
      "Add instant USDC payouts to your Shopify store. 1% flat, 180+ countries.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr + Shopify",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify Payouts — Pay Vendors via Settlr",
    description:
      "Add instant USDC payouts to your Shopify store. 1% flat, 180+ countries.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
