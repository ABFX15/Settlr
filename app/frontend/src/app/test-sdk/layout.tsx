import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SDK Test",
  robots: { index: false, follow: false },
};

export default function TestSdkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
