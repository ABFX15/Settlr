import AuthLayout from "@/components/AuthLayout";

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
