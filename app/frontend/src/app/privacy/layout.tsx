import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Settlr privacy policy. How we collect, use, store, and protect your data when you use our payout platform.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/privacy",
    siteName: "Settlr",
    title: "Privacy Policy",
    description:
      "Read the Settlr privacy policy. How we collect, use, store, and protect your data when you use our payout platform.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr Privacy Policy",
    description:
      "How Settlr collects, uses, and protects your data when using our payout infrastructure.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
