import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";
import { DashboardShell } from "./dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// Dashboard pages use wallet/session context that depends on request data
// (cookies, search params via WalletProvider). Force dynamic rendering so
// Next 16 doesn't try to prerender them at build time and trip the
// useSearchParams() suspense-boundary error.
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      <DashboardShell>{children}</DashboardShell>
    </AuthLayout>
  );
}
