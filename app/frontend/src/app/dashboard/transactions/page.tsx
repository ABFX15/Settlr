"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  ArrowLeftRight,
  ExternalLink,
  Download,
  Shield,
  Wallet,
  LogIn,
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

export default function TransactionsPage() {
  const { ready, authenticated, login } = usePrivy();
  const { publicKey, connected } = useActiveWallet();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

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

  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  if (!ready) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Wallet className="mx-auto mb-6 h-12 w-12 text-white/15" />
        <h2 className="mb-2 text-xl font-bold">Connect Your Wallet</h2>
        <p className="mb-6 text-sm text-white/50">
          Sign in to view your transaction history
        </p>
        <button
          onClick={login}
          className="inline-flex items-center gap-2 rounded-xl bg-[#a78bfa] px-6 py-3 text-sm font-semibold text-white"
        >
          <LogIn className="h-4 w-4" />
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Transactions</h1>
        <p className="mt-1 text-sm text-white/50">
          View and manage your payment history
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(["all", "completed", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-[#a78bfa] text-white"
                  : "bg-white/[0.04] text-white/50 hover:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {publicKey && (
          <a
            href={`/api/merchants/${publicKey}/export`}
            download
            className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d14] overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#a78bfa] border-t-transparent" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <ArrowLeftRight className="mx-auto mb-3 h-8 w-8 text-white/15" />
            <p className="text-sm text-white/50">No transactions yet</p>
            <p className="text-xs text-white/30">
              Your payment history will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/40">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/40">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/40">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-white/40">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/40">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white/40">
                    TX
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, i) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">
                        {new Date(payment.completedAt).toLocaleDateString()}
                      </span>
                      <span className="block text-[10px] text-white/30">
                        {new Date(payment.completedAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">
                          {payment.description || "Payment"}
                        </span>
                        {payment.isPrivate && (
                          <Shield className="h-3.5 w-3.5 text-[#a78bfa]" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-white/50">
                        {payment.customerWallet.slice(0, 4)}...
                        {payment.customerWallet.slice(-4)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-green-400">
                        +${payment.amount.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-white/30">
                        {payment.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          payment.status === "completed"
                            ? "bg-green-500/15 text-green-400"
                            : "bg-yellow-500/15 text-yellow-400"
                        }`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${
                            payment.status === "completed"
                              ? "bg-green-400"
                              : "bg-yellow-400"
                          }`}
                        />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://solscan.io/tx/${payment.txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/5 hover:text-[#a78bfa]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
