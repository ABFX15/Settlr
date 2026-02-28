"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Webhook,
  Key,
  RefreshCw,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  LogOut,
  Menu,
  X,
  Bell,
  Plus,
  FileText,
  ArrowDownToLine,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        exact: true,
      },
      {
        href: "/dashboard/transactions",
        icon: ArrowLeftRight,
        label: "Transactions",
      },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/dashboard/treasury", icon: Wallet, label: "Treasury" },
      { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
      {
        href: "/dashboard/subscriptions",
        icon: RefreshCw,
        label: "Recurring",
      },
      { href: "/dashboard/offramp", icon: ArrowDownToLine, label: "Off-Ramp" },
    ],
  },
  {
    label: "Developer",
    items: [
      { href: "/dashboard/api-keys", icon: Key, label: "API Keys" },
      { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/compliance", icon: Shield, label: "Compliance" },
      { href: "/help", icon: HelpCircle, label: "Support" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { authenticated, login, logout } = usePrivy();
  const { publicKey, connected } = useActiveWallet();
  const [collapsed, setCollapsed] = useState(false);
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
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[#E2E2D1] px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <SettlrLogoWithIcon size="sm" variant="dark" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-2 text-[#7C8A9E] transition-colors hover:bg-[#F5F5F5] hover:text-[#0C1829] lg:block"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-[#7C8A9E] transition-colors hover:bg-[#F5F5F5] hover:text-[#0C1829] lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            {!collapsed && (
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#7C8A9E]/70">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(
                  item.href,
                  (item as { exact?: boolean }).exact,
                );
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-[#1B6B4A]/15 text-[#155939]"
                        : "text-[#7C8A9E] hover:bg-[#F5F5F5] hover:text-[#0C1829]"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <item.icon
                      className={`h-[18px] w-[18px] flex-shrink-0 ${
                        active ? "text-[#155939]" : ""
                      }`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                    {active && !collapsed && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1B6B4A]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Wallet + Logout */}
      <div className="border-t border-[#E2E2D1] p-3">
        {authenticated && connected && publicKey ? (
          <div className="space-y-2">
            {!collapsed && (
              <div className="flex items-center gap-2 rounded-xl bg-[#F5F5F5] px-3 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B6B4A]/15">
                  <Wallet className="h-3.5 w-3.5 text-[#155939]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#3B4963]">
                    {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={copyWallet}
                  className="text-[#7C8A9E] transition-colors hover:text-[#3B4963]"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-[#155939]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
            <button
              onClick={logout}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#7C8A9E] transition-colors hover:bg-red-500/10 hover:text-red-400 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <LogOut className="h-[18px] w-[18px]" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className={`flex w-full items-center gap-3 rounded-xl bg-[#1B6B4A] px-3 py-2.5 text-sm font-semibold text-[#0C1829] transition-colors hover:bg-[#1B6B4A]/80 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Wallet className="h-[18px] w-[18px]" />
            {!collapsed && <span>Connect Wallet</span>}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu trigger — placed top-left on mobile */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#E2E2D1] bg-white/95 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-[#3B4963] transition-colors hover:bg-[#F5F5F5]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SettlrLogoWithIcon size="sm" variant="dark" />
        <Link
          href="/create"
          className="flex items-center gap-1.5 rounded-lg bg-[#1B6B4A] px-3 py-1.5 text-xs font-semibold text-[#0C1829]"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 border-r border-[#E2E2D1] bg-[#0a0a12] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-full flex-col border-r border-[#E2E2D1] bg-[#0a0a12] transition-all duration-300 lg:flex ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Spacer so main content isn't behind sidebar */}
      <div
        className={`hidden flex-shrink-0 lg:block transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      />
    </>
  );
}

export function DashboardTopBar() {
  const { publicKey } = useActiveWallet();

  return (
    <div className="hidden h-14 items-center justify-between border-b border-[#E2E2D1] px-8 lg:flex">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-[#7C8A9E] transition-colors hover:bg-[#F5F5F5] hover:text-[#0C1829]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#1B6B4A]" />
        </button>
        <Link
          href="/create"
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0C1829] shadow-lg shadow-white/5 transition-all hover:shadow-[#0C1829]/5"
        >
          <Plus className="h-4 w-4" />
          New Payment
        </Link>
      </div>
    </div>
  );
}
