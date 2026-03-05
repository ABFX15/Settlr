import { Metadata } from "next";

export const metadata: Metadata = {
  title: "iGaming Settlement — Non-Custodial USDC",
  description:
    "Non-custodial USDC settlement for online gaming. Instant deposits, instant withdrawals, zero chargebacks, no bank interference.",
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
