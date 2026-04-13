import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Settlement API Reference",
  description:
    "Integrate Settlr non-custodial USDC settlement in under 30 minutes. REST API, webhooks, and React components for high-risk B2B settlement on Solana.",
  keywords: [
    "settlement API documentation",
    "USDC settlement API",
    "stablecoin settlement API",
    "Solana settlement integration",
    "non-custodial settlement API",
    "B2B payment API",
  ],
  alternates: { canonical: "/docs" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Settlr",
    title: "Settlr Docs — Settlement API Reference",
    description:
      "REST API, webhooks, and React components for non-custodial USDC settlement. Integrate in under 30 minutes.",
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
    title: "Settlr Docs — Settlement API Reference",
    description:
      "Integrate non-custodial USDC settlement in under 30 minutes. REST API, webhooks, React components.",
    images: ["/twitter-image?v=3"],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* SSR-visible content for crawlers — the client page renders over this */}
      <div className="sr-only" aria-hidden="true">
        <h1>Settlr Documentation — Settlement API Reference</h1>
        <p>
          Integrate Settlr non-custodial USDC settlement in under 30 minutes.
          REST API, webhooks, and React components for high-risk B2B settlement
          on Solana. Topics include: Getting Started, LeafLink integration,
          Invoices &amp; Payments, Dashboard, REST API reference, Webhooks,
          Integrations, and Troubleshooting.
        </p>
      </div>
      {children}
    </>
  );
}
