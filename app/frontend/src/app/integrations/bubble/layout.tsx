import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bubble Plugin — No-Code USDC Payouts",
  description:
    "Add instant USDC payouts to your Bubble app. No code required — drag-and-drop global payment infrastructure.",
  alternates: { canonical: "/integrations/bubble" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/integrations/bubble",
    siteName: "Settlr",
    title: "Bubble Plugin — No-Code USDC Payouts",
    description:
      "Add instant USDC payouts to your Bubble app. No code required.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr + Bubble",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bubble Plugin — No-Code USDC Payouts",
    description:
      "Add instant USDC payouts to your Bubble app. No code required.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
