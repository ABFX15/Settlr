import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Payments — Non-Custodial USDC Checkout",
  description:
    "Accept USDC payments with non-custodial settlement. No chargebacks, instant finality, 1% flat fee. Built for high-risk industries.",
  alternates: { canonical: "/accept-payments" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/accept-payments",
    siteName: "Settlr",
    title: "Accept Payments — Non-Custodial USDC Checkout",
    description:
      "Non-custodial USDC checkout for high-risk industries. No chargebacks, instant finality, 1% flat.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr — Non-Custodial Checkout",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Accept Payments — Non-Custodial USDC Checkout",
    description:
      "Non-custodial USDC settlement for high-risk B2B payments. No chargebacks, instant finality.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
