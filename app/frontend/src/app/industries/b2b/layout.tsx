import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B2B Settlement — Non-Custodial USDC for Debanked Supply Chains",
  description:
    "Settle B2B invoices without bank interference. 1% flat fee, instant USDC finality, no frozen accounts. Built for cannabis, adult content, and high-risk industries.",
  alternates: { canonical: "/industries/b2b" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/industries/b2b",
    siteName: "Settlr",
    title: "B2B Settlement — Non-Custodial USDC for Debanked Supply Chains",
    description:
      "Settle B2B invoices without bank interference. 1% flat, instant USDC finality.",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr — B2B Settlement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Settlement — Non-Custodial USDC for Debanked Supply Chains",
    description:
      "Settle B2B invoices without bank interference. 1% flat, no frozen accounts.",
    images: ["/twitter-image?v=3"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
