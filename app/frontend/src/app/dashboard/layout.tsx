import type { Metadata } from "next";
import AuthLayout from "@/components/AuthLayout";
import { DashboardShell } from "./dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

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
