import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";

export const metadata: Metadata = {
  title: "Sign In — Settlr",
  description: "Connect your wallet to access your Settlr merchant dashboard.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
