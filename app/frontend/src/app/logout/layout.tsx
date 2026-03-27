import AuthLayout from "@/components/AuthLayout";

export default function LogoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
