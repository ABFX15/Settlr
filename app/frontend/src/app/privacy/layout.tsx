import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Settlr privacy policy. How we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/privacy",
    siteName: "Settlr",
    title: "Privacy Policy",
    description:
      "Settlr privacy policy. How we collect, use, and protect your data.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — Privacy Policy",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
