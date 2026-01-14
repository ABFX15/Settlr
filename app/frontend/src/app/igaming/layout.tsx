import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iGaming Crypto Payments",
  description:
    "Crypto payment infrastructure for online gaming platforms. Instant deposits, fast withdrawals, zero chargebacks. Non-custodial, from 1% fees.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Settlr for iGaming | Crypto Payments for Gaming Platforms",
    description:
      "Instant deposits, fast withdrawals, zero chargebacks. Non-custodial crypto payments for online gaming.",
    url: "https://settlr.dev/igaming",
  },
  twitter: {
    title: "Settlr for iGaming",
    description:
      "Crypto payment infrastructure for gaming platforms. Instant deposits, zero chargebacks.",
  },
};

export default function IGamingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
