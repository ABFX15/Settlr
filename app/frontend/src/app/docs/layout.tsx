import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Settlement SDK & API Reference",
  description:
    "Integrate Settlr non-custodial USDC settlement in under 30 minutes. TypeScript SDK, React components, webhooks, and REST API for high-risk B2B settlement on Solana.",
  keywords: [
    "settlement API documentation",
    "USDC settlement SDK",
    "stablecoin settlement API",
    "Solana settlement integration",
    "TypeScript settlement SDK",
    "non-custodial settlement API",
  ],
  alternates: { canonical: "/docs" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Docs — Settlement SDK & API Reference",
    description:
      "TypeScript SDK, React components, webhooks, and API docs for non-custodial USDC settlement. Integrate in under 30 minutes.",
    url: "https://settlr.dev/docs",
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: "Settlr Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Docs — Settlement SDK & API Reference",
    description:
      "Integrate non-custodial USDC settlement in under 30 minutes. TypeScript SDK, webhooks, REST API.",
    images: ["/twitter-image?v=3"],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
