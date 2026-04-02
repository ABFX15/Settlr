"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Webhook,
  RefreshCw,
  Shield,
  HelpCircle,
  Copy,
  Check,
  LogOut,
  Menu,
  X,
  Plus,
  FileText,
  ArrowDownToLine,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  {
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
    label: "Transactions",
  },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  { href: "/dashboard/treasury", icon: Wallet, label: "Treasury" },
  { href: "/dashboard/subscriptions", icon: RefreshCw, label: "Recurring" },
  { href: "/dashboard/offramp", icon: ArrowDownToLine, label: "Off-Ramp" },
  { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/dashboard/compliance", icon: Shield, label: "Compliance" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const copyWallet = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogoWithIcon size="sm" variant="dark" />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-md p-1.5 text-[#94A3B8] hover:text-[#0C1829] lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => {
          const active = isActive(
            item.href,
            (item as { exact?: boolean }).exact,
          );
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#0C1829] text-white"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0C1829]"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#F1F5F9] p-3">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0C1829]"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support</span>
        </Link>

        {connected && publicKey ? (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="flex-1 truncate font-mono text-xs text-[#64748B]">
                {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
              </span>
              <button
                onClick={copyWallet}
                className="text-[#94A3B8] transition-colors hover:text-[#64748B]"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <button
              onClick={disconnect}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#94A3B8] transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className="mt-2 flex w-full items-center gap-3 rounded-lg bg-[#0C1829] px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a2d47]"
          >
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-[#64748B] hover:text-[#0C1829]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SettlrLogoWithIcon size="sm" variant="dark" />
        <Link
          href="/create"
          className="flex items-center gap-1.5 rounded-lg bg-[#0C1829] px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-[260px] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-[240px] border-r border-[#E2E8F0] bg-white lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Spacer */}
      <div className="hidden w-[240px] flex-shrink-0 lg:block" />
    </>
  );
}

export function DashboardTopBar() {
  const { publicKey } = useActiveWallet();

  return (
    <div className="hidden h-14 items-center justify-end gap-3 border-b border-[#E2E8F0] px-8 lg:flex">
      <Link
        href="/create"
        className="flex items-center gap-2 rounded-lg bg-[#0C1829] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a2d47]"
      >
        <Plus className="h-4 w-4" />
        New Payment
      </Link>
    </div>
  );
}
