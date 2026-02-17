import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Dashboard",
  robots: { index: false, follow: false },
};

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
