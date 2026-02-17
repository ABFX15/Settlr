import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Dashboard",
  robots: { index: false, follow: false },
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
