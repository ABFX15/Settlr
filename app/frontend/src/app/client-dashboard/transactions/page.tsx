"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  BarChart3,
  Code2,
  Gift,
  Key,
  HelpCircle,
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check,
  Wallet,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  Download,
  Shield,
} from "lucide-react";

interface PaymentRecord {
  id: string;
  sessionId?: string;
  merchantId: string;
  merchantName: string;
  merchantWallet: string;
  customerWallet: string;
  amount: number;
  currency: string;
  description?: string;
  txSignature: string;
  status: string;
  completedAt: number;
  isPrivate?: boolean;
}

// Sidebar navigation items
const sidebarNavItems = [
  { href: "/client-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    href: "/client-dashboard/transactions",
    icon: ArrowLeftRight,
    label: "Transactions",
  },
  { href: "/client-dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/client-dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/api-keys", icon: Code2, label: "API Keys" },
  { href: "/client-dashboard/promotions", icon: Gift, label: "Promotions" },
  { href: "/client-dashboard/integrations", icon: Key, label: "Integrations" },
  { href: "/help", icon: HelpCircle, label: "Support" },
];

export default function TransactionsPage() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { publicKey, connected } = useActiveWallet();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  // Fetch payments
  useEffect(() => {
    async function fetchPayments() {
      if (!publicKey) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/payments?wallet=${publicKey}`);
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a78bfa]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#FDFBF7]/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#0d0d14] border-r border-[#E2DFD5]/[0.04] transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2DFD5]/[0.04]">
          {!sidebarCollapsed && <SettlrLogoWithIcon />}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-[#F3F2ED] transition-colors hidden lg:block"
          >
            <Menu className="w-5 h-5 text-[#7C8A9E]" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-[#F3F2ED] transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-[#7C8A9E]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#1B6B4A]/15 text-[#1B6B4A]"
                    : "text-[#7C8A9E] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Wallet Section */}
        <div className="p-4 border-t border-[#E2DFD5]/[0.04]">
          {authenticated && connected ? (
            <div className="space-y-3">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F3F2ED] rounded-xl">
                  <Wallet className="w-4 h-4 text-[#1B6B4A]" />
                  <span className="text-sm text-[#3B4963] truncate">
                    {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(publicKey || "")}
                    className="ml-auto"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#1B6B4A]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#7C8A9E] hover:text-[#3B4963]" />
                    )}
                  </button>
                </div>
              )}
              <button
                onClick={logout}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-[#7C8A9E] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all ${
                  sidebarCollapsed ? "justify-center" : ""
                }`}
              >
                <LogOut className="w-5 h-5" />
                {!sidebarCollapsed && <span>Disconnect</span>}
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className={`flex items-center gap-3 w-full px-3 py-2.5 bg-[#1B6B4A] hover:bg-[#2A9D6A] text-white rounded-xl transition-all ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <Wallet className="w-5 h-5" />
              {!sidebarCollapsed && <span>Connect</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-[#F3F2ED]"
          >
            <Menu className="w-6 h-6 text-[#7C8A9E]" />
          </button>
          <SettlrLogoWithIcon />
          <div className="w-10" />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0C1829] mb-2">
            Transactions
          </h1>
          <p className="text-[#7C8A9E]">View and manage your payment history</p>
        </div>

        {!authenticated ? (
          <div className="bg-white/[0.02] border border-[#E2DFD5] rounded-2xl p-8 text-center">
            <Wallet className="w-12 h-12 text-[#7C8A9E]/60 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0C1829] mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-[#7C8A9E] mb-6">
              Sign in to view your transaction history
            </p>
            <button
              onClick={login}
              className="px-6 py-3 bg-[#1B6B4A] hover:bg-[#2A9D6A] text-white font-medium rounded-xl transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex gap-2">
                {(["all", "completed", "pending"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === f
                        ? "bg-[#1B6B4A] text-white"
                        : "bg-[#F3F2ED] text-[#7C8A9E] hover:text-[#0C1829]"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <button className="flex items-center gap-2 px-4 py-2 bg-[#F3F2ED] hover:bg-[#F3F2ED] text-[#3B4963] rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/[0.02] border border-[#E2DFD5] rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a78bfa] mx-auto"></div>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="p-8 text-center">
                  <ArrowLeftRight className="w-12 h-12 text-[#7C8A9E]/60 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#0C1829] mb-2">
                    No transactions yet
                  </h3>
                  <p className="text-[#7C8A9E]">
                    Your payment history will appear here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E2DFD5]">
                        <th className="text-left text-[#7C8A9E] font-medium px-6 py-4">
                          Date
                        </th>
                        <th className="text-left text-[#7C8A9E] font-medium px-6 py-4">
                          Description
                        </th>
                        <th className="text-left text-[#7C8A9E] font-medium px-6 py-4">
                          Customer
                        </th>
                        <th className="text-right text-[#7C8A9E] font-medium px-6 py-4">
                          Amount
                        </th>
                        <th className="text-left text-[#7C8A9E] font-medium px-6 py-4">
                          Status
                        </th>
                        <th className="text-left text-[#7C8A9E] font-medium px-6 py-4">
                          TX
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-[#E2DFD5]/[0.04] hover:bg-[#F3F2ED]/30"
                        >
                          <td className="px-6 py-4">
                            <span className="text-[#3B4963]">
                              {new Date(
                                payment.completedAt,
                              ).toLocaleDateString()}
                            </span>
                            <span className="block text-xs text-[#7C8A9E]">
                              {new Date(
                                payment.completedAt,
                              ).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[#0C1829]">
                                {payment.description || "Payment"}
                              </span>
                              {payment.isPrivate && (
                                <span title="Private payment">
                                  <Shield className="w-4 h-4 text-[#1B6B4A]" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[#7C8A9E] font-mono text-sm">
                              {payment.customerWallet.slice(0, 4)}...
                              {payment.customerWallet.slice(-4)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[#1B6B4A] font-semibold">
                              +${payment.amount.toFixed(2)}
                            </span>
                            <span className="block text-xs text-[#7C8A9E]">
                              {payment.currency}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.status === "completed"
                                  ? "bg-[#1B6B4A]/15 text-[#1B6B4A]"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={`https://solscan.io/tx/${payment.txSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#1B6B4A] hover:text-[#2A9D6A]"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
