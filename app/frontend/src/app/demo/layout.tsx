import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — Creator Platform Checkout in 30 Seconds",
  description:
    "Try Settlr's creator platform checkout live. See how fans subscribe and pay creators with USDC — email-based wallets, zero gas fees, instant settlement, no content restrictions.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Settlr Demo — Creator Platform Checkout in 30 Seconds",
    description:
      "See how fans pay creators with USDC. Email-based wallets, zero gas, no content restrictions.",
    url: "https://settlr.dev/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
