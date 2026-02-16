import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — Try Crypto Checkout in 30 Seconds",
  description:
    "Try Settlr's crypto payment checkout live. No signup required. See how USDC payments work with email-based wallets, zero gas fees, and instant settlement on Solana.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Settlr Demo — Try Crypto Checkout in 30 Seconds",
    description:
      "Experience USDC checkout live. Email-based wallets, zero gas, instant settlement.",
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
