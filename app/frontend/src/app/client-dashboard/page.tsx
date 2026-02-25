"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { PrivacyBadge } from "@/components/ui/PrivacyBadge";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  BarChart3,
  Code2,
  Gift,
  Key,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  ExternalLink,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Wallet,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface PaymentRecord {
  id: string;
  sessionId: string;
  merchantId: string;
  merchantName: string;
  customerWallet: string;
  amount: number;
  currency: string;
  description?: string;
  txSignature: string;
  status: string;
  completedAt: number;
  isPrivate?: boolean;
  encryptedHandle?: string;
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

// Quick action items
const quickActions = [
  { label: "Create Payment", href: "/create", icon: Plus },
  { label: "View Docs", href: "/docs", icon: Code2 },
  { label: "Get API Key", href: "/dashboard/api-keys", icon: Key },
];

export default function ClientDashboardPage() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { publicKey, connected } = useActiveWallet();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalTransactions: 0,
    avgTransaction: 0,
    todayVolume: 0,
    weeklyGrowth: 12.5,
    monthlyGrowth: 24.8,
  });

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

          const total =
            data.payments?.reduce(
              (sum: number, p: PaymentRecord) => sum + p.amount,
              0,
            ) || 0;
          const count = data.payments?.length || 0;
          const today = new Date().toDateString();
          const todayPayments =
            data.payments?.filter(
              (p: PaymentRecord) =>
                new Date(p.completedAt).toDateString() === today,
            ) || [];
          const todayTotal = todayPayments.reduce(
            (sum: number, p: PaymentRecord) => sum + p.amount,
            0,
          );

          setStats({
            totalVolume: total,
            totalTransactions: count,
            avgTransaction: count > 0 ? total / count : 0,
            todayVolume: todayTotal,
            weeklyGrowth: 12.5,
            monthlyGrowth: 24.8,
          });
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auth check
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] px-4">
        <div className="text-center">
          <div className="mx-auto mb-8 flex justify-center">
            <SettlrLogoWithIcon size="md" variant="dark" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-[#0C1829]">
            Welcome to Settlr
          </h1>
          <p className="mb-8 text-[#3B4963]">
            Sign in to access your merchant dashboard
          </p>
          <button
            onClick={login}
            className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[#0C1829] shadow-lg shadow-[#0C1829]/5 transition-all hover:shadow-[#0C1829]/5"
          >
            Sign In to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-full border-r border-[#E2DFD5] bg-[#0d0d14] transition-all duration-300 md:block ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#E2DFD5] px-4">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <SettlrLogoWithIcon size="sm" variant="dark" />
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg p-2 text-[#7C8A9E] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829]"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                sidebarCollapsed ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-1 p-3">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#F3F2ED] text-[#0C1829]"
                    : "text-[#3B4963] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-[#1B6B4A]" : ""
                  }`}
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {isActive && !sidebarCollapsed && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-[#1B6B4A]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#E2DFD5] p-4">
          {!sidebarCollapsed && connected && publicKey && (
            <div className="mb-4 rounded-xl bg-[#F3F2ED] p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B6B4A]">
                  <Wallet className="h-4 w-4 text-[#0C1829]" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-[#3B4963]">Wallet</p>
                  <p className="truncate text-sm font-medium text-[#0C1829]">
                    {formatAddress(publicKey)}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(publicKey)}
                  className="rounded-lg p-1.5 text-[#7C8A9E] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[#1B6B4A]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#3B4963] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829] ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#E2DFD5] bg-[#FDFBF7]/90 px-4 backdrop-blur-xl md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <SettlrLogoWithIcon size="sm" variant="dark" />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-[#3B4963] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829]"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#FDFBF7]/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 border-r border-[#E2DFD5] bg-[#0d0d14] pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1 p-3">
              {sidebarNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#F3F2ED] text-[#0C1829]"
                        : "text-[#3B4963] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-[#1B6B4A]" : ""}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 pt-16 md:pt-0 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top Bar */}
        <div className="hidden h-16 items-center justify-between border-b border-[#E2DFD5] px-8 md:flex">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-[#0C1829]">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-[#3B4963] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#1B6B4A]" />
            </button>
            <Link
              href="/create"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0C1829] shadow-lg shadow-[#0C1829]/5 transition-all hover:shadow-[#0C1829]/5"
            >
              <Plus className="h-4 w-4" />
              New Payment
            </Link>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 md:p-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-[#0C1829] md:text-3xl">
              Welcome to Settlr
            </h2>
            <p className="mt-1 text-[#3B4963]">
              User friendly blockchain payment solutions
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Transaction Volume",
                value: `$${stats.totalVolume.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                change: `+${stats.monthlyGrowth}%`,
                positive: true,
                icon: DollarSign,
              },
              {
                label: "Total Transactions",
                value: stats.totalTransactions.toString(),
                change: "+18%",
                positive: true,
                icon: ArrowLeftRight,
              },
              {
                label: "Average Transaction",
                value: `$${stats.avgTransaction.toFixed(2)}`,
                change: "+5.2%",
                positive: true,
                icon: TrendingUp,
              },
              {
                label: "Today's Volume",
                value: `$${stats.todayVolume.toFixed(2)}`,
                change: "Live",
                positive: true,
                icon: BarChart3,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-[#E2DFD5] bg-[#12121a] p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-xl bg-[#1B6B4A]/10 p-3">
                    <stat.icon className="h-5 w-5 text-[#1B6B4A]" />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.positive ? "text-[#1B6B4A]" : "text-red-400"
                    }`}
                  >
                    {stat.positive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-[#3B4963]">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-[#0C1829]">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Overview Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-[#E2DFD5] bg-[#12121a] p-6 lg:col-span-2"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0C1829]">Overview</h3>
                <select className="rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-3 py-1.5 text-sm text-[#0C1829]">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              {/* Chart Placeholder */}
              <div className="flex h-64 items-end justify-between gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, i) => {
                    const heights = [60, 80, 45, 90, 70, 85, 65];
                    return (
                      <div
                        key={day}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#a78bfa] to-[#a78bfa]/60"
                          style={{ height: `${heights[i]}%` }}
                        />
                        <span className="text-xs text-[#7C8A9E]">{day}</span>
                      </div>
                    );
                  },
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-[#E2DFD5] bg-[#12121a] p-6"
            >
              <h3 className="mb-6 text-lg font-semibold text-[#0C1829]">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-[#F3F2ED] p-4">
                  <span className="text-sm text-[#3B4963]">Success Rate</span>
                  <span className="text-lg font-bold text-[#1B6B4A]">
                    99.8%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F3F2ED] p-4">
                  <span className="text-sm text-[#3B4963]">Avg. Settlement</span>
                  <span className="text-lg font-bold text-[#0C1829]">~2 sec</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F3F2ED] p-4">
                  <span className="text-sm text-[#3B4963]">Active Links</span>
                  <span className="text-lg font-bold text-[#0C1829]">
                    {payments.length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F3F2ED] p-4">
                  <span className="text-sm text-[#3B4963]">Webhooks</span>
                  <span className="text-lg font-bold text-[#1B6B4A]">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-2xl border border-[#E2DFD5] bg-[#12121a] p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0C1829]">
                Recent Activity
              </h3>
              <Link
                href="/client-dashboard/transactions"
                className="text-sm text-[#1B6B4A] hover:text-[#2A9D6A]"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <p className="text-[#3B4963]">No transactions yet</p>
                <Link
                  href="/create"
                  className="mt-2 text-sm text-[#1B6B4A] hover:text-[#2A9D6A]"
                >
                  Create your first payment link →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2DFD5] text-left text-sm text-[#7C8A9E]">
                      <th className="pb-4 font-medium">Transaction</th>
                      <th className="pb-4 font-medium">Amount</th>
                      <th className="pb-4 font-medium">Privacy</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {payments.slice(0, 5).map((payment) => (
                      <tr key={payment.id} className="border-b border-[#E2DFD5]">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B6B4A]/10">
                              <DollarSign className="h-5 w-5 text-[#1B6B4A]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#0C1829]">
                                {payment.merchantName || "Payment"}
                              </p>
                              <p className="text-[#7C8A9E]">
                                {formatAddress(payment.txSignature)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-[#0C1829]">
                            ${payment.amount.toFixed(2)}
                          </span>
                          <span className="ml-1 text-[#7C8A9E]">
                            {payment.currency}
                          </span>
                        </td>
                        <td className="py-4">
                          <PrivacyBadge
                            isPrivate={payment.isPrivate || false}
                            encryptedHandle={payment.encryptedHandle}
                            decryptedAmount={`$${payment.amount.toFixed(2)} ${
                              payment.currency
                            }`}
                            canDecrypt={true}
                            size="sm"
                          />
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1B6B4A]/10 px-3 py-1 text-xs font-medium text-[#1B6B4A]">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 text-[#3B4963]">
                          {formatDate(payment.completedAt)}
                        </td>
                        <td className="py-4">
                          <a
                            href={`https://solscan.io/tx/${payment.txSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-[#7C8A9E] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
