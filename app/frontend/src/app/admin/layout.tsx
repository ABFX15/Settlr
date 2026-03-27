import type { Metadata } from "next";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
