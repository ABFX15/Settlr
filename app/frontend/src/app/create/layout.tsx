import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Payout Link",
  description:
    "Create a shareable payout link to send USDC to anyone by email. No code required.",
  robots: { index: false, follow: false },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
