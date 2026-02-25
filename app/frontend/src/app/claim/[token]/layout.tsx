import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim Your Payment",
  description:
    "You've received a payment. Claim it and cash out to your bank, e-wallet, or keep it in USD.",
  robots: { index: false, follow: false },
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
