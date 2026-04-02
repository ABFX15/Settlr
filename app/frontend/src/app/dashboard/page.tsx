"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  ArrowDownRight,
  ExternalLink,
  Receipt,
  Clock,
  ChevronRight,
  RefreshCw,
  LogIn,
  ArrowLeftRight,
} from "lucide-react";
import { VaultCard } from "@/components/VaultCard";

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function DashboardPage() {
  const { connected: authenticated } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      if (!publicKey) return;
      try {
        const res = await fetch(`/api/payments?wallet=${publicKey}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (e) {
        console.error("Failed to fetch payments:", e);
      } finally {
        setLoading(false);
      }
    }
    if (connected && publicKey) {
      fetchPayments();
    } else {
      setLoading(false);
    }
  }, [connected, publicKey]);

  const totalVolume = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const todayPayments = payments.filter(
    (p) => new Date(p.completedAt).toDateString() === new Date().toDateString(),
  );
  const todayVolume = todayPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0,
  );
  const avgPayment = payments.length > 0 ? totalVolume / payments.length : 0;

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Wallet className="h-6 w-6 text-[#94A3B8]" />
          </div>
          <h2 className="text-xl font-semibold text-[#0C1829] mb-2">
            Welcome to Settlr
          </h2>
          <p className="text-[#64748B] mb-6 max-w-sm text-sm">
            Connect your wallet to access your merchant dashboard.
          </p>
          <button
            onClick={() => openWalletModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0C1829] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a2d47] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Volume",
      value: formatUSD(totalVolume),
      sub: `${payments.length} payments`,
      icon: DollarSign,
    },
    {
      label: "Transactions",
      value: payments.length.toString(),
      sub: "All time",
      icon: Receipt,
    },
    {
      label: "Avg. Payment",
      value: formatUSD(avgPayment),
      sub: "Per transaction",
      icon: ArrowLeftRight,
    },
    {
      label: "Today",
      value: formatUSD(todayVolume),
      sub: `${todayPayments.length} today`,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1829]">Overview</h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Vault */}
      <VaultCard />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5"
          >
            <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] mb-2">
              <stat.icon className="h-4 w-4" />
              {stat.label}
            </div>
            <div className="text-2xl font-semibold text-[#0C1829] tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-[#E2E8F0] bg-white"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-sm font-semibold text-[#0C1829]">
            Recent Activity
          </h3>
          <Link
            href="/dashboard/transactions"
            className="text-xs font-medium text-[#64748B] hover:text-[#0C1829] flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="border-t border-[#F1F5F9]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 animate-spin text-[#94A3B8]" />
            </div>
          ) : payments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Receipt className="mx-auto h-8 w-8 text-[#CBD5E1] mb-3" />
              <p className="text-sm text-[#64748B]">No payments yet</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Payments will appear here once customers start paying
              </p>
            </div>
          ) : (
            <div>
              {payments.slice(0, 7).map((payment, i) => (
                <div
                  key={payment.id || payment.sessionId}
                  className={`flex items-center gap-4 px-6 py-3 hover:bg-[#F8FAFC] transition-colors ${
                    i > 0 ? "border-t border-[#F1F5F9]" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#0C1829]">
                      {formatUSD(payment.amount)}
                    </span>
                    <span className="ml-2 text-xs text-[#94A3B8] truncate">
                      {payment.description || "Payment"}
                    </span>
                    <div className="text-xs text-[#94A3B8] mt-0.5 font-mono">
                      {payment.customerWallet
                        ? `${payment.customerWallet.slice(
                            0,
                            6,
                          )}...${payment.customerWallet.slice(-4)}`
                        : "Unknown"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      {payment.status || "completed"}
                    </span>
                    <div className="text-[11px] text-[#94A3B8] mt-1">
                      {payment.completedAt
                        ? new Date(payment.completedAt).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                  {payment.txSignature && (
                    <a
                      href={`https://explorer.solana.com/tx/${payment.txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#CBD5E1] hover:text-[#64748B] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
