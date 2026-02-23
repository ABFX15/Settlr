import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WooCommerce Payouts — USDC Plugin for WordPress",
  description:
    "Add instant USDC payouts to WooCommerce. Pay marketplace sellers globally with 1% flat fee, no wire delays.",
  alternates: { canonical: "/integrations/woocommerce" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/integrations/woocommerce",
    siteName: "Settlr",
    title: "WooCommerce Payouts — USDC Plugin for WordPress",
    description:
      "Add instant USDC payouts to WooCommerce. 1% flat, 180+ countries.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr + WooCommerce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WooCommerce Payouts — USDC Plugin for WordPress",
    description:
      "Add instant USDC payouts to WooCommerce. 1% flat, 180+ countries.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
