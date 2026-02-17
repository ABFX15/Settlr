import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim Your Payout",
  description:
    "Claim your USDC payout — enter your Solana wallet address to receive funds.",
  robots: { index: false, follow: false },
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
