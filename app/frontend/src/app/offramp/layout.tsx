import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cash Out USDC",
  description:
    "Convert USDC to fiat via Sphere (third-party off-ramp provider). Settlr does not handle off-ramp directly.",
  robots: { index: false, follow: false },
};

export default function OfframpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
