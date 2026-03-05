import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI & SaaS Settlement — Non-Custodial USDC for Platforms",
  description:
    "Settle with AI trainers, data annotators, and SaaS affiliates using non-custodial USDC. 1% flat fee, instant finality, no bank interference.",
  alternates: { canonical: "/industries/ai-saas" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/industries/ai-saas",
    siteName: "Settlr",
    title: "AI & SaaS Settlement — Non-Custodial USDC for Platforms",
    description:
      "Non-custodial USDC settlement for AI and SaaS platforms. 1% flat, instant finality.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr — AI & SaaS Settlement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI & SaaS Settlement — Non-Custodial USDC for Platforms",
    description:
      "Non-custodial USDC settlement for AI and SaaS platforms. 1% flat, instant finality.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
