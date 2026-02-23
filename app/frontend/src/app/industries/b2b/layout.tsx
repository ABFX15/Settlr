import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B2B Payments — Pay Vendors and Suppliers Globally",
  description:
    "Send B2B payments to vendors and suppliers in 180+ countries. 1% flat fee, instant USDC settlement, no wire fees or frozen accounts.",
  alternates: { canonical: "/industries/b2b" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev/industries/b2b",
    siteName: "Settlr",
    title: "B2B Payments — Pay Vendors and Suppliers Globally",
    description:
      "Send B2B payments to vendors and suppliers in 180+ countries. 1% flat, instant settlement.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — B2B Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Payments — Pay Vendors and Suppliers Globally",
    description:
      "Send B2B payments to vendors in 180+ countries. 1% flat, no wire fees.",
    images: ["/twitter-image"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
