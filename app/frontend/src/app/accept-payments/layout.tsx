import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Payments — USDC Checkout for Any Platform",
  description:
    "Accept USDC payments on your platform with a simple checkout link. No chargebacks, instant settlement, 1% flat fee.",
  alternates: { canonical: "/accept-payments" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/accept-payments",
    siteName: "Settlr",
    title: "Accept Payments — USDC Checkout for Any Platform",
    description:
      "Accept USDC payments with a simple checkout link. No chargebacks, instant settlement, 1% flat.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — Accept Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Accept Payments — USDC Checkout for Any Platform",
    description:
      "Accept USDC payments with checkout links. No chargebacks, instant settlement.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
