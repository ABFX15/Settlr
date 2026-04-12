"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { solscanUrl } from "@/lib/constants";
import { useWalletModal } from "@/components/WalletModal";
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
  const { connected: authenticated } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
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

  if (!authenticated) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Wallet className="h-6 w-6 text-[#94A3B8]" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[#212121]">
          Connect Your Wallet
        </h2>
        <p className="mb-6 text-sm text-[#64748B]">
          Sign in to view your transaction history
        </p>
        <button
          onClick={() => openWalletModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#212121] px-5 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#1a2d47] transition-colors"
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Transactions</h1>
        <p className="mt-0.5 text-sm text-[#94A3B8]">
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
                  ? "bg-[#212121] text-[#212121]"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#212121]"
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
            className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-medium text-[#64748B] transition-colors hover:text-[#212121]"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#94A3B8] border-t-transparent" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <ArrowLeftRight className="mx-auto mb-3 h-8 w-8 text-[#CBD5E1]" />
            <p className="text-sm text-[#64748B]">No transactions yet</p>
            <p className="text-xs text-[#94A3B8]">
              Your payment history will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94A3B8]">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94A3B8]">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94A3B8]">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#94A3B8]">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94A3B8]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94A3B8]">
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
                    className="border-b border-[#F1F5F9] transition-colors hover:bg-[#F8FAFC]"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#212121]">
                        {new Date(payment.completedAt).toLocaleDateString()}
                      </span>
                      <span className="block text-[10px] text-[#94A3B8]">
                        {new Date(payment.completedAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#212121]">
                          {payment.description || "Payment"}
                        </span>
                        {payment.isPrivate && (
                          <Shield className="h-3.5 w-3.5 text-[#34c759]" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-[#64748B]">
                        {payment.customerWallet.slice(0, 4)}...
                        {payment.customerWallet.slice(-4)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-[#34c759]">
                        +${payment.amount.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-[#94A3B8]">
                        {payment.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                          payment.status === "completed"
                            ? "bg-[#34c759]/15 text-[#34c759]"
                            : "bg-[#d29500]/15 text-[#d29500]"
                        }`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${
                            payment.status === "completed"
                              ? "bg-[#34c759]"
                              : "bg-[#ffc107]"
                          }`}
                        />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={solscanUrl(payment.txSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-[#CBD5E1] transition-colors hover:bg-[#F8FAFC] hover:text-[#64748B]"
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
