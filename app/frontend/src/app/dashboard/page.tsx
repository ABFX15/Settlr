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
  ArrowDownRight,
  Copy,
  Check,
  ExternalLink,
  Receipt,
  Zap,
  Globe,
  Clock,
  ChevronRight,
  RefreshCw,
  Download,
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
  const { ready, authenticated, login } = usePrivy();
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
          <Wallet className="mx-auto h-12 w-12 text-[#7C8A9E]/60 mb-4" />
          <h2 className="text-xl font-semibold text-[#0C1829] mb-2">
            Welcome to Settlr
          </h2>
          <p className="text-[#7C8A9E] mb-6 max-w-sm">
            Connect your wallet to access your merchant dashboard.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B6B4A] px-6 py-3 text-sm font-semibold text-[#0C1829] hover:bg-[#2A9D6A]/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome + Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1829]">Dashboard</h1>
          <p className="text-sm text-[#7C8A9E] mt-1">
            Welcome back
            {publicKey
              ? `, ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/treasury"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B6B4A] px-4 py-2.5 text-sm font-medium text-[#0C1829] hover:bg-[#2A9D6A]/90 transition-colors"
          >
            <Wallet className="h-4 w-4" />
            Fund Treasury
          </Link>
        </div>
      </div>

      {/* Vault & Balance */}
      <VaultCard />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-5"
        >
          <div className="flex items-center gap-2 text-sm text-[#7C8A9E] mb-1">
            <DollarSign className="h-4 w-4" />
            Total Volume
          </div>
          <div className="text-2xl font-bold text-[#0C1829]">
            {formatUSD(totalVolume)}
          </div>
          <div className="text-xs text-[#1B6B4A] mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {payments.length} payments
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-5"
        >
          <div className="flex items-center gap-2 text-sm text-[#7C8A9E] mb-1">
            <Receipt className="h-4 w-4" />
            Transactions
          </div>
          <div className="text-2xl font-bold text-[#0C1829]">
            {payments.length}
          </div>
          <div className="text-xs text-[#7C8A9E] mt-1">All time</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-5"
        >
          <div className="flex items-center gap-2 text-sm text-[#7C8A9E] mb-1">
            <ArrowLeftRight className="h-4 w-4" />
            Average Payment
          </div>
          <div className="text-2xl font-bold text-[#0C1829]">
            {formatUSD(avgPayment)}
          </div>
          <div className="text-xs text-[#7C8A9E] mt-1">Per transaction</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-5"
        >
          <div className="flex items-center gap-2 text-sm text-[#7C8A9E] mb-1">
            <Clock className="h-4 w-4" />
            Today
          </div>
          <div className="text-2xl font-bold text-[#0C1829]">
            {formatUSD(todayVolume)}
          </div>
          <div className="text-xs text-[#7C8A9E] mt-1">
            {todayPayments.length} payments today
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Treasury",
            href: "/dashboard/treasury",
            icon: Wallet,
            color: "text-[#1B6B4A]",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Invoices",
            href: "/dashboard/invoices",
            icon: Receipt,
            color: "text-[#1B6B4A]",
            bg: "bg-[#1B6B4A]/10",
          },
          {
            label: "Recurring",
            href: "/dashboard/subscriptions",
            icon: RefreshCw,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
          },
          {
            label: "Off-Ramp",
            href: "/dashboard/offramp",
            icon: Download,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
          },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-4 hover:bg-[#F3F2ED] transition-colors"
          >
            <div className={`p-2.5 rounded-lg ${action.bg} w-fit mb-3`}>
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <div className="text-sm font-medium text-[#0C1829] group-hover:text-[#0C1829]">
              {action.label}
            </div>
            <div className="text-xs text-[#7C8A9E] mt-0.5">Manage &rarr;</div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-[#E2DFD5] bg-white/[0.02]"
      >
        <div className="flex items-center justify-between border-b border-[#E2DFD5] px-6 py-4">
          <h3 className="text-sm font-medium text-[#0C1829]">
            Recent Activity
          </h3>
          <Link
            href="/dashboard/transactions"
            className="text-xs text-[#1B6B4A] hover:text-[#c4b5fd] flex items-center gap-1"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-[#7C8A9E]/60" />
          </div>
        ) : payments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Receipt className="mx-auto h-8 w-8 text-[#7C8A9E]/60 mb-3" />
            <p className="text-sm text-[#7C8A9E]">No payments yet</p>
            <p className="text-xs text-[#7C8A9E]/70 mt-1">
              Payments will appear here once customers start paying
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {payments.slice(0, 7).map((payment) => (
              <div
                key={payment.id || payment.sessionId}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <ArrowDownRight className="h-4 w-4 text-[#1B6B4A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#0C1829]">
                      {formatUSD(payment.amount)}
                    </span>
                    <span className="text-xs text-[#7C8A9E]/70 truncate">
                      {payment.description || "Payment"}
                    </span>
                  </div>
                  <div className="text-xs text-[#7C8A9E] mt-0.5 truncate">
                    {payment.customerWallet
                      ? `${payment.customerWallet.slice(
                          0,
                          6,
                        )}...${payment.customerWallet.slice(-4)}`
                      : "Unknown"}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-[#1B6B4A] font-medium">
                    {payment.status || "completed"}
                  </div>
                  <div className="text-xs text-[#7C8A9E]/70">
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
                    className="text-[#7C8A9E]/60 hover:text-[#7C8A9E] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
