"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
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
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
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
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "Past Due",
    icon: AlertTriangle,
  },
  paused: {
    color: "text-white/50",
    bg: "bg-white/[0.06]",
    label: "Paused",
    icon: Pause,
  },
  cancelled: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Cancelled",
    icon: XCircle,
  },
  expired: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Expired",
    icon: XCircle,
  },
};

export default function SubscribersPage() {
  const { authenticated, login } = usePrivy();
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#a78bfa]/10 flex items-center justify-center border border-[#a78bfa]/20">
              <Users className="w-10 h-10 text-[#a78bfa]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Subscribers</h1>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Connect your wallet to manage your subscribers and billing.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-[#050507] text-[#050507] px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all "
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
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/50" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Subscribers</h1>
              <p className="text-white/50 text-sm">
                Manage active subscriptions and billing
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/subscriptions"
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/10 transition-all text-sm"
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
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-white/50 text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-white">{activeSubs.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#a78bfa]/10">
                <DollarSign className="w-5 h-5 text-[#a78bfa]" />
              </div>
              <span className="text-white/50 text-sm">MRR</span>
            </div>
            <p className="text-2xl font-bold text-white">${mrr.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-white/50 text-sm">Past Due</span>
            </div>
            <p className="text-2xl font-bold text-white">{pastDueCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-white/50 text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">
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
                    ? "bg-white text-[#050507]"
                    : "bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08]"
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
            <Loader2 className="w-8 h-8 animate-spin text-[#a78bfa]" />
          </div>
        ) : subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/[0.06] flex items-center justify-center">
              <Users className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No subscribers yet
            </h3>
            <p className="text-white/50 mb-6">
              Share your plan checkout links to start getting subscribers.
            </p>
            <Link
              href="/dashboard/subscriptions"
              className="inline-flex items-center gap-2 bg-[#050507] text-[#050507] px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors"
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
                  className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden"
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
                          <h3 className="text-white font-semibold truncate">
                            {sub.plan?.name || sub.planId}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                          >
                            {config.label}
                          </span>
                          {sub.cancelAtPeriodEnd && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                              Cancels at period end
                            </span>
                          )}
                        </div>
                        <p className="text-white/50 text-sm truncate mt-1">
                          {sub.customerWallet.slice(0, 8)}...
                          {sub.customerWallet.slice(-4)}
                          {sub.customerEmail && (
                            <span className="ml-2 text-white/30">
                              ({sub.customerEmail})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-white font-semibold">
                          ${sub.amount} {sub.currency}
                        </p>
                        <p className="text-white/50 text-xs">
                          per {sub.interval}
                        </p>
                      </div>

                      <div className="text-right hidden md:block">
                        <p className="text-white/70 text-sm">Next charge</p>
                        <p className="text-white/50 text-xs">
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
                              className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.08] transition-colors"
                              title="Pause subscription"
                            >
                              <Pause className="w-4 h-4 text-white/50" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(sub.id, "cancel");
                              }}
                              disabled={actionLoading === sub.id}
                              className="p-2 rounded-lg bg-white/[0.06] hover:bg-red-500/20 transition-colors"
                              title="Cancel at period end"
                            >
                              <XCircle className="w-4 h-4 text-white/50 hover:text-red-400" />
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
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                            title="Resume subscription"
                          >
                            <Play className="w-4 h-4 text-emerald-400" />
                          </button>
                        )}
                        {sub.status === "past_due" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(sub.id, "charge");
                            }}
                            disabled={actionLoading === sub.id}
                            className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                            title="Retry charge"
                          >
                            <RefreshCw className="w-4 h-4 text-amber-400" />
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-white/30" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/30" />
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
                      className="border-t border-white/[0.06]"
                    >
                      <div className="p-6 bg-[#050507]/50">
                        <div className="flex items-center gap-2 mb-4">
                          <Receipt className="w-4 h-4 text-white/50" />
                          <h4 className="text-sm font-medium text-white/70">
                            Payment History
                          </h4>
                        </div>

                        {subPayments.length === 0 ? (
                          <p className="text-white/30 text-sm">
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
                                        ? "bg-emerald-400"
                                        : payment.status === "failed"
                                        ? "bg-red-400"
                                        : "bg-amber-400"
                                    }`}
                                  />
                                  <div>
                                    <span className="text-white text-sm font-medium">
                                      ${payment.amount.toFixed(2)} USDC
                                    </span>
                                    <span className="text-white/30 text-xs ml-2">
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
                                        ? "text-emerald-400"
                                        : payment.status === "failed"
                                        ? "text-red-400"
                                        : "text-amber-400"
                                    }`}
                                  >
                                    {payment.status}
                                  </span>
                                  {payment.txSignature && (
                                    <a
                                      href={`https://explorer.solana.com/tx/${payment.txSignature}?cluster=devnet`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#a78bfa] hover:text-[#c4b5fd]"
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
                        <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-white/30">Created</span>
                            <p className="text-white/70">
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/30">Period Start</span>
                            <p className="text-white/70">
                              {new Date(
                                sub.currentPeriodStart,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/30">Period End</span>
                            <p className="text-white/70">
                              {new Date(
                                sub.currentPeriodEnd,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-white/30">
                              Subscription ID
                            </span>
                            <p className="text-white/70 font-mono truncate">
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
