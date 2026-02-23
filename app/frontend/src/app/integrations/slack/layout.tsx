import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slack Notifications — Payout Alerts in Slack",
  description:
    "Get real-time Settlr payout notifications in Slack. Know instantly when payments are sent, confirmed, and claimed.",
  alternates: { canonical: "/integrations/slack" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/integrations/slack",
    siteName: "Settlr",
    title: "Slack Notifications — Payout Alerts in Slack",
    description:
      "Get real-time payout notifications in Slack. Know when payments land.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr + Slack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Slack Notifications — Payout Alerts in Slack",
    description:
      "Real-time payout notifications in Slack. Know when payments land.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
