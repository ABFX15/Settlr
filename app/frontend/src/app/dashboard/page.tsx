"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Copy,
  Check,
  ExternalLink,
  Receipt,
  Zap,
  Globe,
  Shield,
  Clock,
  ChevronRight,
  Webhook,
  RefreshCw,
  Download,
  Key,
  LogIn,
  Home,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

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
}

export default function DashboardPage() {
  const { ready, authenticated, login } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalTransactions: 0,
    avgTransaction: 0,
    todayVolume: 0,
  });

  // Fetch payments for this merchant
  useEffect(() => {
    async function fetchPayments() {
      if (!publicKey) {
        setLoading(false);
        return;
      }

      try {
        // Filter by merchant wallet
        const res = await fetch(`/api/payments?wallet=${publicKey}`);
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);

          // Calculate stats
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
          });
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Unified Navbar */}
      <Navbar />

      <div className="min-h-screen bg-[#050507] text-white p-8 pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header with Visa News Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Merchant Dashboard</h1>
                <p className="text-white/50">
                  {connected
                    ? `Connected: ${formatAddress(publicKey!)}`
                    : "Sign in to view your payments"}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/create">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-[#050507] text-white font-semibold rounded-xl flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Create Payment
                  </motion.button>
                </Link>
                <Link href="/offramp">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl flex items-center gap-2 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <DollarSign className="w-4 h-4" />
                    Cash Out
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Volume",
                value: `$${stats.totalVolume.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                icon: DollarSign,
                color: "from-[#a78bfa] to-[#a78bfa]",
                change: "+12.5%",
              },
              {
                label: "Transactions",
                value: stats.totalTransactions.toString(),
                icon: Receipt,
                color: "from-blue-500 to-blue-600",
                change: "+8",
              },
              {
                label: "Avg. Transaction",
                value: `$${stats.avgTransaction.toFixed(2)}`,
                icon: TrendingUp,
                color: "from-[#a78bfa] to-[#a78bfa]",
                change: "+5.2%",
              },
              {
                label: "Today",
                value: `$${stats.todayVolume.toFixed(2)}`,
                icon: Clock,
                color: "from-amber-500 to-amber-600",
                change: "Live",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="pop-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-cyan-400 text-sm font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              {
                title: "Payment Links",
                description: "Create & share links",
                icon: Globe,
                href: "/create",
                color:
                  "bg-[#38bdf8]/10 border-[#38bdf8]/20 hover:border-blue-500/50",
              },
              {
                title: "Subscriptions",
                description: "Recurring payments",
                icon: RefreshCw,
                href: "/dashboard/subscriptions",
                color:
                  "bg-[#a78bfa]/10 border-[#a78bfa]/30 hover:border-[#a78bfa]/50",
              },
              {
                title: "Webhooks",
                description: "Payment notifications",
                icon: Webhook,
                href: "/dashboard/webhooks",
                color:
                  "bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50",
              },
              {
                title: "API Keys",
                description: "Manage SDK access",
                icon: Key,
                href: "/dashboard/api-keys",
                color:
                  "bg-[#a78bfa]/10 border-[#a78bfa]/30 hover:border-[#a78bfa]/50",
              },
              {
                title: "Compliance",
                description: "KYC/AML settings",
                icon: Shield,
                href: "/dashboard/compliance",
                color:
                  "bg-green-500/10 border-green-500/30 hover:border-green-500/50",
              },
              {
                title: "Export CSV",
                description: "Download for accounting",
                icon: Download,
                href: publicKey ? `/api/merchants/${publicKey}/export` : "#",
                color:
                  "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50",
                download: true,
              },
              {
                title: "Gasless Payments",
                description: "Zero gas for customers",
                icon: Zap,
                href: "/demo",
                color:
                  "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50",
              },
              {
                title: "SDK Docs",
                description: "npm install @settlr/sdk",
                icon: Globe,
                href: "https://github.com/ABFX15/x402-hack-payment",
                color:
                  "bg-[#a78bfa]/10 border-[#a78bfa]/30 hover:border-[#a78bfa]/50",
              },
            ].map((action, i) => {
              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`p-6 rounded-2xl border ${action.color} transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <action.icon className="w-8 h-8 text-white" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {action.title}
                        </h3>
                        <p className="text-white/50 text-sm">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              );

              // Use anchor tag for downloads, Link for navigation
              if ("download" in action && action.download) {
                return (
                  <a key={action.title} href={action.href} download>
                    {content}
                  </a>
                );
              }

              return (
                <Link key={action.title} href={action.href}>
                  {content}
                </Link>
              );
            })}
          </div>

          {/* Recent Payments Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pop-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Payments</h2>
              <span className="text-white/50 text-sm">
                Last 10 transactions
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : !connected ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 mb-4">
                  Sign in to view your payments
                </p>
                <button
                  onClick={login}
                  className="px-6 py-3 bg-[#050507] text-white font-semibold rounded-xl flex items-center gap-2 mx-auto"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 mb-4">No payments yet</p>
                <Link href="/create">
                  <button className="px-6 py-2 bg-[#050507] text-black rounded-lg font-medium">
                    Create your first payment
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-white/30 text-sm border-b border-white/[0.06]">
                      <th className="pb-4 font-medium">Payment ID</th>
                      <th className="pb-4 font-medium">Customer</th>
                      <th className="pb-4 font-medium">Amount</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 10).map((payment, i) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-white/70">
                              {payment.id.slice(0, 12)}...
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(payment.id, `id-${payment.id}`)
                              }
                              className="text-white/30 hover:text-white"
                            >
                              {copied === `id-${payment.id}` ? (
                                <Check className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-white/70 font-mono text-sm">
                            {formatAddress(payment.customerWallet)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-white">
                            ${payment.amount.toFixed(2)}
                          </span>
                          <span className="text-white/30 text-sm ml-1">
                            USDC
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === "completed"
                                ? "bg-[#a78bfa]/20 text-cyan-400"
                                : payment.status === "refunded"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-white/[0.06] text-white/50"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 text-white/50 text-sm">
                          {formatDate(payment.completedAt)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://explorer.solana.com/tx/${payment.txSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-white/30 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Integration Code Snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pop-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Quick Integration</h2>
              <button
                onClick={() =>
                  copyToClipboard(
                    `const session = await fetch('/api/checkout/sessions', {
  method: 'POST',
  body: JSON.stringify({
    merchantId: 'your-store',
    merchantWallet: '${publicKey || "YOUR_WALLET"}',
    amount: 29.99,
    successUrl: 'https://yoursite.com/success',
    cancelUrl: 'https://yoursite.com/cancel'
  })
});
// Redirect to session.url`,
                    "code",
                  )
                }
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white"
              >
                {copied === "code" ? (
                  <>
                    <Check className="w-4 h-4 text-cyan-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-white/[0.03] rounded-xl p-4 overflow-x-auto text-sm">
              <code>
                <span className="text-[#a78bfa]">const</span>{" "}
                <span className="text-cyan-300">session</span>{" "}
                <span className="text-pink-400">=</span>{" "}
                <span className="text-[#a78bfa]">await</span>{" "}
                <span className="text-yellow-300">fetch</span>
                <span className="text-white/70">(</span>
                <span className="text-green-400">
                  &apos;/api/checkout/sessions&apos;
                </span>
                <span className="text-white/70">, {"{"}</span>
                {"\n"}
                {"  "}
                <span className="text-cyan-300">method</span>
                <span className="text-white/70">: </span>
                <span className="text-green-400">&apos;POST&apos;</span>
                <span className="text-white/70">,</span>
                {"\n"}
                {"  "}
                <span className="text-cyan-300">body</span>
                <span className="text-white/70">: </span>
                <span className="text-yellow-300">JSON</span>
                <span className="text-white/70">.</span>
                <span className="text-yellow-300">stringify</span>
                <span className="text-white/70">({"{"}</span>
                {"\n"}
                {"    "}
                <span className="text-cyan-300">merchantId</span>
                <span className="text-white/70">: </span>
                <span className="text-green-400">&apos;your-store&apos;</span>
                <span className="text-white/70">,</span>
                {"\n"}
                {"    "}
                <span className="text-cyan-300">merchantWallet</span>
                <span className="text-white/70">: </span>
                <span className="text-green-400">
                  &apos;{publicKey?.slice(0, 20) || "YOUR_WALLET"}...&apos;
                </span>
                <span className="text-white/70">,</span>
                {"\n"}
                {"    "}
                <span className="text-cyan-300">amount</span>
                <span className="text-white/70">: </span>
                <span className="text-orange-400">29.99</span>
                <span className="text-white/70">,</span>
                {"\n"}
                {"    "}
                <span className="text-cyan-300">successUrl</span>
                <span className="text-white/70">: </span>
                <span className="text-green-400">
                  &apos;https://yoursite.com/success&apos;
                </span>
                <span className="text-white/70">,</span>
                {"\n"}
                {"    "}
                <span className="text-cyan-300">cancelUrl</span>
                <span className="text-white/70">: </span>
                <span className="text-green-400">
                  &apos;https://yoursite.com/cancel&apos;
                </span>
                {"\n"}
                {"  "}
                <span className="text-white/70">{"}"})</span>
                {"\n"}
                <span className="text-white/70">{"}"});</span>
                {"\n"}
                <span className="text-white/30">
                  // Redirect customer to session.url
                </span>
              </code>
            </pre>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
