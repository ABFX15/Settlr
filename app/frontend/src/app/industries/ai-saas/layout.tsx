import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI & SaaS Payouts — Pay Global Contributors",
  description:
    "Pay AI trainers, data annotators, and SaaS affiliates worldwide. 1% flat fee, instant USDC settlement, no bank details needed.",
  alternates: { canonical: "/industries/ai-saas" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/industries/ai-saas",
    siteName: "Settlr",
    title: "AI & SaaS Payouts — Pay Global Contributors",
    description:
      "Pay AI trainers, data annotators, and SaaS affiliates worldwide. 1% flat, instant settlement.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — AI & SaaS Payouts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI & SaaS Payouts — Pay Global Contributors",
    description:
      "Pay AI trainers and SaaS affiliates worldwide. 1% flat, instant USDC settlement.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
