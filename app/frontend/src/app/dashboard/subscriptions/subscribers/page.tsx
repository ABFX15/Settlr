"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Loader2,
  LogIn,
  Pause,
  Play,
  XCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import Link from "next/link";

interface SubscriptionSub {
  id: string;
  planId: string;
  plan?: {
    name: string;
    description?: string;
    features?: string[];
    interval: string;
    intervalCount: number;
  };
  merchantWallet: string;
  customerWallet: string;
  customerEmail?: string;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  pausedAt?: string;
  createdAt: string;
}

interface SubPayment {
  id: string;
  amount: number;
  platformFee: number;
  status: string;
  txSignature?: string;
  periodStart: string;
  periodEnd: string;
  attemptCount: number;
  failureReason?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; label: string; icon: React.ElementType }
> = {
  active: {
    color: "text-[#34c759]",
    bg: "bg-[#34c759]/10",
    label: "Active",
    icon: CheckCircle,
  },
  trialing: {
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    label: "Trialing",
    icon: Clock,
  },
  past_due: {
    color: "text-[#d29500]",
    bg: "bg-[#d29500]/10",
    label: "Past Due",
    icon: AlertTriangle,
  },
  paused: {
    color: "text-[#8a8a8a]",
    bg: "bg-[#f2f2f2]",
    label: "Paused",
    icon: Pause,
  },
  cancelled: {
    color: "text-[#e74c3c]",
    bg: "bg-[#e74c3c]/10",
    label: "Cancelled",
    icon: XCircle,
  },
  expired: {
    color: "text-[#e74c3c]",
    bg: "bg-[#e74c3c]/10",
    label: "Expired",
    icon: XCircle,
  },
};

export default function SubscribersPage() {
  const { connected: authenticated } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();

  const [subscriptions, setSubscriptions] = useState<SubscriptionSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [payments, setPayments] = useState<Record<string, SubPayment[]>>({});

  const fetchSubscriptions = useCallback(async () => {
    if (!publicKey) return;

    try {
      const params = new URLSearchParams({ merchantId: publicKey });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/subscriptions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }, [publicKey, statusFilter]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [connected, publicKey, fetchSubscriptions]);

  const fetchPayments = async (subId: string) => {
    if (payments[subId]) return; // Already loaded

    try {
      const response = await fetch(`/api/subscriptions/${subId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments((prev) => ({
          ...prev,
          [subId]: data.payments || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const handleAction = async (
    subId: string,
    action: "cancel" | "pause" | "resume" | "charge",
    extra?: Record<string, unknown>,
  ) => {
    setActionLoading(subId);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, subscriptionId: subId, ...extra }),
      });

      if (response.ok) {
        await fetchSubscriptions(); // Refresh
      } else {
        const err = await response.json();
        alert(err.error || "Action failed");
      }
    } catch (error) {
      console.error(`Error ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (subId: string) => {
    if (expandedSub === subId) {
      setExpandedSub(null);
    } else {
      setExpandedSub(subId);
      fetchPayments(subId);
    }
  };

  // Stats
  const activeSubs = subscriptions.filter(
    (s) => s.status === "active" || s.status === "trialing",
  );
  const mrr = activeSubs.reduce((sum, s) => {
    if (s.interval === "monthly") return sum + s.amount;
    if (s.interval === "yearly") return sum + s.amount / 12;
    if (s.interval === "weekly") return sum + s.amount * 4.33;
    if (s.interval === "daily") return sum + s.amount * 30;
    return sum;
  }, 0);
  const pastDueCount = subscriptions.filter(
    (s) => s.status === "past_due",
  ).length;

  if (!connected) {
    return (
      <div>
        <div className="max-w-4xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#34c759]/10 flex items-center justify-center border border-[#8e24aa]/20">
              <Users className="w-10 h-10 text-[#34c759]" />
            </div>
            <h1 className="text-3xl font-bold text-[#212121] mb-4">
              Subscribers
            </h1>
            <p className="text-[#8a8a8a] mb-8 max-w-md mx-auto">
              Connect your wallet to manage your subscribers and billing.
            </p>
            <button
              onClick={() => openWalletModal(true)}
              className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#212121] px-8 py-4 rounded-xl font-semibold hover:bg-[#f2f2f2] transition-all "
            >
              <LogIn className="w-5 h-5" />
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-[#f2f2f2] hover:bg-[#f2f2f2] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#8a8a8a]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#212121]">Subscribers</h1>
              <p className="text-[#8a8a8a] text-sm">
                Manage active subscriptions and billing
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/subscriptions"
            className="flex items-center gap-2 bg-[#f2f2f2] border border-[#d3d3d3] text-[#212121] px-4 py-2 rounded-xl font-medium hover:bg-[#f2f2f2] transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Manage Plans
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-[#d3d3d3] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#34c759]/10">
                <Users className="w-5 h-5 text-[#34c759]" />
              </div>
              <span className="text-[#8a8a8a] text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-[#212121]">
              {activeSubs.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-[#d3d3d3] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#34c759]/10">
                <DollarSign className="w-5 h-5 text-[#34c759]" />
              </div>
              <span className="text-[#8a8a8a] text-sm">MRR</span>
            </div>
            <p className="text-2xl font-bold text-[#212121]">
              ${mrr.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.02] border border-[#d3d3d3] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#d29500]/10">
                <AlertTriangle className="w-5 h-5 text-[#d29500]" />
              </div>
              <span className="text-[#8a8a8a] text-sm">Past Due</span>
            </div>
            <p className="text-2xl font-bold text-[#212121]">{pastDueCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-[#d3d3d3] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-[#8a8a8a] text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold text-[#212121]">
              {subscriptions.length}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "active", "trialing", "past_due", "paused", "cancelled"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setLoading(true);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter
                    ? "bg-white text-[#212121]"
                    : "bg-[#f2f2f2] text-[#8a8a8a] hover:text-[#212121] hover:bg-[#f2f2f2]"
                }`}
              >
                {filter === "all"
                  ? "All"
                  : filter === "past_due"
                  ? "Past Due"
                  : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#34c759]" />
          </div>
        ) : subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-[#d3d3d3] rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#f2f2f2] flex items-center justify-center">
              <Users className="w-8 h-8 text-[#8a8a8a]" />
            </div>
            <h3 className="text-xl font-semibold text-[#212121] mb-2">
              No subscribers yet
            </h3>
            <p className="text-[#8a8a8a] mb-6">
              Share your plan checkout links to start getting subscribers.
            </p>
            <Link
              href="/dashboard/subscriptions"
              className="inline-flex items-center gap-2 bg-[#FFFFFF] text-[#212121] px-6 py-3 rounded-xl font-medium hover:bg-[#f2f2f2] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              View Plans
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub, index) => {
              const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
              const StatusIcon = config.icon;
              const isExpanded = expandedSub === sub.id;
              const subPayments = payments[sub.id] || [];

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/[0.02] border border-[#d3d3d3] rounded-2xl overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => toggleExpand(sub.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[#212121] font-semibold truncate">
                            {sub.plan?.name || sub.planId}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                          >
                            {config.label}
                          </span>
                          {sub.cancelAtPeriodEnd && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#d29500]/10 text-[#d29500]">
                              Cancels at period end
                            </span>
                          )}
                        </div>
                        <p className="text-[#8a8a8a] text-sm truncate mt-1">
                          {sub.customerWallet.slice(0, 8)}...
                          {sub.customerWallet.slice(-4)}
                          {sub.customerEmail && (
                            <span className="ml-2 text-[#8a8a8a]">
                              ({sub.customerEmail})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[#212121] font-semibold">
                          ${sub.amount} {sub.currency}
                        </p>
                        <p className="text-[#8a8a8a] text-xs">
                          per {sub.interval}
                        </p>
                      </div>

                      <div className="text-right hidden md:block">
                        <p className="text-[#5c5c5c] text-sm">Next charge</p>
                        <p className="text-[#8a8a8a] text-xs">
                          {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {(sub.status === "active" ||
                          sub.status === "trialing") && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(sub.id, "pause");
                              }}
                              disabled={actionLoading === sub.id}
                              className="p-2 rounded-lg bg-[#f2f2f2] hover:bg-[#f2f2f2] transition-colors"
                              title="Pause subscription"
                            >
                              <Pause className="w-4 h-4 text-[#8a8a8a]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(sub.id, "cancel");
                              }}
                              disabled={actionLoading === sub.id}
                              className="p-2 rounded-lg bg-[#f2f2f2] hover:bg-[#e74c3c]/20 transition-colors"
                              title="Cancel at period end"
                            >
                              <XCircle className="w-4 h-4 text-[#8a8a8a] hover:text-[#e74c3c]" />
                            </button>
                          </>
                        )}
                        {sub.status === "paused" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(sub.id, "resume");
                            }}
                            disabled={actionLoading === sub.id}
                            className="p-2 rounded-lg bg-[#34c759]/10 hover:bg-[#34c759]/20 transition-colors"
                            title="Resume subscription"
                          >
                            <Play className="w-4 h-4 text-[#34c759]" />
                          </button>
                        )}
                        {sub.status === "past_due" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(sub.id, "charge");
                            }}
                            disabled={actionLoading === sub.id}
                            className="p-2 rounded-lg bg-[#d29500]/10 hover:bg-[#d29500]/20 transition-colors"
                            title="Retry charge"
                          >
                            <RefreshCw className="w-4 h-4 text-[#d29500]" />
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#8a8a8a]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#8a8a8a]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Payment History */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#d3d3d3]"
                    >
                      <div className="p-6 bg-[#FFFFFF]/50">
                        <div className="flex items-center gap-2 mb-4">
                          <Receipt className="w-4 h-4 text-[#8a8a8a]" />
                          <h4 className="text-sm font-medium text-[#5c5c5c]">
                            Payment History
                          </h4>
                        </div>

                        {subPayments.length === 0 ? (
                          <p className="text-[#8a8a8a] text-sm">
                            No payments yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {subPayments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      payment.status === "completed"
                                        ? "bg-[#34c759]"
                                        : payment.status === "failed"
                                        ? "bg-[#e74c3c]/80"
                                        : "bg-[#ffc107]"
                                    }`}
                                  />
                                  <div>
                                    <span className="text-[#212121] text-sm font-medium">
                                      ${payment.amount.toFixed(2)} USDC
                                    </span>
                                    <span className="text-[#8a8a8a] text-xs ml-2">
                                      {new Date(
                                        payment.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-xs font-medium ${
                                      payment.status === "completed"
                                        ? "text-[#34c759]"
                                        : payment.status === "failed"
                                        ? "text-[#e74c3c]"
                                        : "text-[#d29500]"
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                  {payment.txSignature && (
                                    <a
                                      href={`https://explorer.solana.com/tx/${payment.txSignature}?cluster=devnet`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#34c759] hover:text-[#c4b5fd]"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Subscription metadata */}
                        <div className="mt-4 pt-4 border-t border-[#d3d3d3] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-[#8a8a8a]">Created</span>
                            <p className="text-[#5c5c5c]">
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#8a8a8a]">Period Start</span>
                            <p className="text-[#5c5c5c]">
                              {new Date(
                                sub.currentPeriodStart,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#8a8a8a]">Period End</span>
                            <p className="text-[#5c5c5c]">
                              {new Date(
                                sub.currentPeriodEnd,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#8a8a8a]">
                              Subscription ID
                            </span>
                            <p className="text-[#5c5c5c] font-mono truncate">
                              {sub.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
