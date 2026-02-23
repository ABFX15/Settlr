import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iGaming Crypto Payments",
  description:
    "Crypto payment infrastructure for online gaming platforms. Instant deposits, fast withdrawals, zero chargebacks.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: { canonical: "/industries/igaming" },
};

export default function IGamingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
