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
    title: "Settlr Docs — Payout SDK & API Reference",
    description:
      "TypeScript SDK, React components, webhooks, and API docs for global USDC payouts. Integrate in under 30 minutes.",
    url: "https://settlr.dev/docs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Docs — Payout SDK & API Reference",
    description:
      "Integrate global USDC payouts in under 30 minutes. TypeScript SDK, webhooks, REST API.",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
