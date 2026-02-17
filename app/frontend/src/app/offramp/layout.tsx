import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cash Out USDC",
  description:
    "Convert your USDC to local currency. Off-ramp your Settlr payouts to your bank account or mobile money.",
  robots: { index: false, follow: false },
};

export default function OfframpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
