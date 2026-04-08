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
  Wallet,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Plus,
  FileText,
  BarChart3,
  ArrowRightLeft,
  Bell,
  Package,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { href: "/dashboard/orders", icon: Package, label: "Orders" },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  {
    href: "/dashboard/settlements",
    icon: ArrowRightLeft,
    label: "Settlements",
  },
  { href: "/dashboard/receivables", icon: BarChart3, label: "Receivables" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#111111]">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-[#1f1f1f]">
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogoWithIcon size="sm" variant="light" />
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-md p-1.5 text-[#666] hover:text-white lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Subtitle */}
      <div className="px-5 pt-3 pb-2">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-[#555] uppercase">
          Wholesale Crypto
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-1">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/20"
                  : "text-[#888] hover:bg-[#1a1a1a] hover:text-white border border-transparent"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="uppercase tracking-wide text-[12px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Create Invoice Button */}
      <div className="px-3 pb-3">
        <Link
          href="/dashboard/invoices/create"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00ff41] px-4 py-3 text-[13px] font-bold text-black uppercase tracking-wider transition-colors hover:bg-[#00dd38]"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1f1f1f] p-3 space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Support</span>
        </Link>

        {connected && publicKey ? (
          <button
            onClick={() => disconnect()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className="mt-2 flex w-full items-center gap-3 rounded-lg bg-[#00ff41] px-3 py-2.5 text-[13px] font-bold text-black transition-colors hover:bg-[#00dd38]"
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
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-[#111111] border-b border-[#1f1f1f] px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-[#888] hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SettlrLogoWithIcon size="sm" variant="light" />
        <Link
          href="/dashboard/invoices/create"
          className="flex items-center gap-1.5 rounded-lg bg-[#00ff41] px-3 py-1.5 text-xs font-bold text-black uppercase"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-[260px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-[220px] border-r border-[#1f1f1f] bg-[#111111] lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Spacer */}
      <div className="hidden w-[220px] flex-shrink-0 lg:block" />
    </>
  );
}

export function DashboardTopBar() {
  const { publicKey } = useActiveWallet();

  return (
    <div className="hidden h-14 items-center justify-end gap-3 border-b border-[#1f1f1f] px-8 lg:flex">
      {/* Network Status */}
      <div className="flex items-center gap-2 mr-auto">
        <span className="text-xs text-[#666] uppercase tracking-wider">
          Network Status
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[#00ff41]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff41] animate-pulse" />
          Synchronized
        </span>
      </div>

      {/* Notification bell */}
      <button className="relative rounded-lg p-2 text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors">
        <Bell className="h-4 w-4" />
      </button>

      {/* User avatar */}
      <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
        <span className="text-xs text-[#888]">
          {publicKey ? publicKey.slice(0, 2).toUpperCase() : "??"}
        </span>
      </div>
    </div>
  );
}
