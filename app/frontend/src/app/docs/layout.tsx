import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Crypto Payment SDK & API Reference",
  description:
    "Integrate Settlr in under 30 minutes. TypeScript SDK, React checkout component, webhooks, and REST API docs for accepting USDC and stablecoin payments on Solana.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Settlr Docs — Crypto Payment SDK & API Reference",
    description:
      "TypeScript SDK, React components, webhooks, and API docs. Integrate in under 30 minutes.",
    url: "https://settlr.dev/docs",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
