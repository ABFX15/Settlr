import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Docs, Offbank API & Webhooks",
  description:
    "REST API, webhooks, and SDK references for building on Offbank, non-custodial USDC settlement for restricted commerce.",
  alternates: { canonical: "/developers" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Offbank",
    title: "Build on Offbank, Developer Docs",
    description:
      "REST API, webhooks, and SDK references for non-custodial USDC settlement.",
    url: "https://offbankpay.com/developers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build on Offbank",
    description:
      "REST API, webhooks, and SDK references for non-custodial USDC settlement.",
  },
};

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
