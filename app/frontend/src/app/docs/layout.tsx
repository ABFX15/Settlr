import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Payout SDK & API Reference",
  description:
    "Integrate Settlr payouts in under 30 minutes. TypeScript SDK, React components, webhooks, and REST API docs for sending USDC payouts globally on Solana.",
  keywords: [
    "payout API documentation",
    "USDC payout SDK",
    "stablecoin payout API",
    "Solana payout integration",
    "TypeScript payout SDK",
    "email payout API",
  ],
  alternates: { canonical: "/docs" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Docs — Payout SDK & API Reference",
    description:
      "TypeScript SDK, React components, webhooks, and API docs for global USDC payouts. Integrate in under 30 minutes.",
    url: "https://settlr.dev/docs",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Docs — Payout SDK & API Reference",
    description:
      "Integrate global USDC payouts in under 30 minutes. TypeScript SDK, webhooks, REST API.",
    images: ["/twitter-image"],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
