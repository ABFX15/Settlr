import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";

export const metadata: Metadata = {
  title: "Create Settlement Link",
  description:
    "Create a shareable settlement link for non-custodial USDC transfers. No code required.",
  robots: { index: false, follow: false },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
