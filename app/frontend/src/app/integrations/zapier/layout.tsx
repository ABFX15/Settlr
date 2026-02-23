import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zapier Integration — Automate Payouts",
  description:
    "Trigger Settlr payouts from any Zapier workflow. Connect 5,000+ apps to instant global payments.",
  alternates: { canonical: "/integrations/zapier" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/integrations/zapier",
    siteName: "Settlr",
    title: "Zapier Integration — Automate Payouts",
    description:
      "Trigger Settlr payouts from any Zapier workflow. Connect 5,000+ apps.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr + Zapier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zapier Integration — Automate Payouts",
    description:
      "Trigger Settlr payouts from any Zapier workflow. Connect 5,000+ apps.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
