"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet,
  Loader2,
  BarChart3,
} from "lucide-react";
import { PrivyLoginButton } from "@/components/PrivyLoginButton";

// USDC mint on devnet
const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

interface Transaction {
  signature: string;
  timestamp: number;
  type: "sent" | "received";
  amount: number;
  otherParty: string;
  status: "confirmed" | "finalized";
}

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsPage() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!publicKey || !connection) return;

    setLoading(true);
    setError(null);

    try {
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 50,
      });

      const txs: Transaction[] = [];

      for (const sig of signatures) {
        try {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx?.meta || tx.meta.err) continue;

          const preBalances = tx.meta.preTokenBalances || [];
          const postBalances = tx.meta.postTokenBalances || [];

          // Find USDC transfers
          for (let i = 0; i < postBalances.length; i++) {
            const post = postBalances[i];
            const pre = preBalances.find(
              (p) => p.accountIndex === post.accountIndex
            );

            if (post.mint !== USDC_MINT) continue;

            const postAmount = post.uiTokenAmount.uiAmount || 0;
            const preAmount = pre?.uiTokenAmount.uiAmount || 0;
            const diff = postAmount - preAmount;

            if (Math.abs(diff) < 0.001) continue;

            const isReceived = post.owner === publicKey.toBase58() && diff > 0;
            const isSent = post.owner === publicKey.toBase58() && diff < 0;

            if (isReceived || isSent) {
              const otherPartyBalance = postBalances.find(
                (b) => b.owner !== publicKey.toBase58() && b.mint === USDC_MINT
              );

              txs.push({
                signature: sig.signature,
                timestamp: sig.blockTime || 0,
                type: isReceived ? "received" : "sent",
                amount: Math.abs(diff),
                otherParty: otherPartyBalance?.owner || "Unknown",
                status: sig.confirmationStatus as "confirmed" | "finalized",
              });
              break;
            }
          }
        } catch {
          // Skip failed transactions
        }
      }

      setTransactions(txs);
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactions();
    }
  }, [connected, publicKey, fetchTransactions]);

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    if (timeRange === "all") return transactions;

    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    return transactions.filter(
      (tx) => now - tx.timestamp * 1000 < ranges[timeRange]
    );
  }, [transactions, timeRange]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const received = filteredTransactions.filter((t) => t.type === "received");
    const totalVolume = received.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction =
      received.length > 0 ? totalVolume / received.length : 0;
    const uniqueCustomers = new Set(
      filteredTransactions.map((t) => t.otherParty)
    ).size;

    return {
      totalVolume,
      transactions: received.length,
      avgTransaction,
      customers: uniqueCustomers,
    };
  }, [filteredTransactions]);

  // Generate daily data for chart
  const dailyData = useMemo(() => {
    const data: { date: string; volume: number; transactions: number }[] = [];
    const days =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
        ? 30
        : timeRange === "90d"
        ? 90
        : 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTxs = filteredTransactions.filter((tx) => {
        const txDate = new Date(tx.timestamp * 1000)
          .toISOString()
          .split("T")[0];
        return txDate === dateStr && tx.type === "received";
      });

      data.push({
        date: dateStr,
        volume: dayTxs.reduce((sum, tx) => sum + tx.amount, 0),
        transactions: dayTxs.length,
      });
    }

    return data;
  }, [filteredTransactions, timeRange]);

  const chartMax = Math.max(...dailyData.map((d) => d.volume), 1);

  const shortenAddress = (addr: string) => {
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen p-4 md:p-8 pt-24 md:pt-28 bg-[#0a0a12]">
      <div className="max-w-7xl mx-auto mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              Analytics Dashboard
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Track your payment performance and customer insights
            </p>
          </div>

          {connected && (
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center gap-1 bg-[#12121a] rounded-lg p-1 border border-white/10">
                {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-muted)] hover:text-white"
                    }`}
                  >
                    {range === "all" ? "All" : range}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchTransactions}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#12121a] border border-white/10 rounded-lg text-[var(--text-muted)] hover:text-white hover:border-white/20 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Not connected state */}
        {!mounted ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : !connected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#12121a] border border-white/10 rounded-xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
              Connect your Solana wallet to view your payment analytics and
              transaction history
            </p>
            <PrivyLoginButton />
          </motion.div>
        ) : loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mb-4" />
            <p className="text-[var(--text-muted)]">
              Loading your transactions...
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Volume"
                value={`$${stats.totalVolume.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                icon={DollarSign}
                delay={0}
              />
              <StatCard
                title="Payments Received"
                value={stats.transactions.toString()}
                icon={ShoppingCart}
                delay={0.1}
              />
              <StatCard
                title="Avg. Payment"
                value={`$${stats.avgTransaction.toFixed(2)}`}
                icon={TrendingUp}
                delay={0.2}
              />
              <StatCard
                title="Unique Senders"
                value={stats.customers.toString()}
                icon={Users}
                delay={0.3}
              />
            </div>

            {/* Chart Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#12121a] border border-white/10 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Payment Volume
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                    <span className="text-[var(--text-muted)]">
                      Volume (USDC)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-64 flex items-end gap-1">
                {dailyData.map((day, i) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div className="relative w-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: `${(day.volume / chartMax) * 200}px`,
                        }}
                        transition={{ delay: i * 0.02, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--primary)]/60 rounded-t-sm hover:from-[var(--primary)]/80 hover:to-[var(--primary)] transition-colors cursor-pointer min-h-[2px]"
                      />

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-[#1a1a24] border border-white/10 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                          <p className="text-xs text-[var(--text-muted)]">
                            {day.date}
                          </p>
                          <p className="text-sm font-semibold text-white">
                            ${day.volume.toFixed(2)}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {day.transactions} payment
                            {day.transactions !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
                <span>{dailyData[0]?.date}</span>
                <span>{dailyData[Math.floor(dailyData.length / 2)]?.date}</span>
                <span>{dailyData[dailyData.length - 1]?.date}</span>
              </div>
            </motion.div>

            {/* Recent Transactions Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Recent Transactions
                  </h2>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-[var(--text-muted)]">
                    No transactions found for this time period
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-muted)]">
                            Type
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-muted)]">
                            Amount
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-muted)]">
                            From/To
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-muted)]">
                            Status
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-[var(--text-muted)]">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.slice(0, 10).map((tx, i) => (
                          <motion.tr
                            key={tx.signature}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  tx.type === "received"
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {tx.type === "received" ? (
                                  <ArrowDownRight className="w-3 h-3" />
                                ) : (
                                  <ArrowUpRight className="w-3 h-3" />
                                )}
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-white">
                                ${tx.amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-[var(--text-muted)]">
                                {shortenAddress(tx.otherParty)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-[var(--text-muted)]">
                                {formatTime(tx.timestamp)}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">
                      Showing {Math.min(10, filteredTransactions.length)} of{" "}
                      {filteredTransactions.length} transactions
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}

function StatCard({ title, value, icon: Icon, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#12121a] border border-white/10 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[var(--primary)]" />
        </div>
      </div>

      <h3 className="text-sm text-[var(--text-muted)] mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}
