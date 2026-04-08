"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Plus,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Send,
  Search,
  Filter,
  Wallet,
  LogIn,
  ChevronRight,
  Loader2,
  DollarSign,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

interface OrderSummary {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  total: number;
  currency: string;
  status: string;
  invoiceId?: string;
  txSignature?: string;
  paidAt?: string;
  expectedDate?: string;
  createdAt: string;
}

interface OrderStats {
  total: number;
  draft: number;
  submitted: number;
  accepted: number;
  invoiced: number;
  paid: number;
  cancelled: number;
  totalValue: number;
  paidValue: number;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Package }
> = {
  draft: {
    label: "Draft",
    color: "#888",
    bg: "rgba(136,136,136,0.1)",
    icon: FileText,
  },
  submitted: {
    label: "Submitted",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    icon: Send,
  },
  accepted: {
    label: "Accepted",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    icon: CheckCircle2,
  },
  invoiced: {
    label: "Invoiced",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    icon: FileText,
  },
  paid: {
    label: "Paid",
    color: "#00ff41",
    bg: "rgba(0,255,65,0.1)",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "#888",
    bg: "rgba(136,136,136,0.1)",
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const { connected: authenticated } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = useCallback(async () => {
    if (!publicKey) return;
    try {
      const headers = { "x-merchant-wallet": publicKey };
      const [ordersRes, statsRes] = await Promise.all([
        fetch(
          `/api/orders?limit=100${
            filterStatus ? `&status=${filterStatus}` : ""
          }`,
          { headers },
        ),
        fetch("/api/orders?stats=true", { headers }),
      ]);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.buyerName.toLowerCase().includes(q) ||
      o.buyerEmail.toLowerCase().includes(q) ||
      (o.buyerCompany || "").toLowerCase().includes(q)
    );
  });

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a] border border-[#333]">
            <Wallet className="h-6 w-6 text-[#666]" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Connect Wallet
          </h2>
          <p className="text-[#888] mb-6 max-w-sm text-sm">
            Connect your wallet to manage purchase orders.
          </p>
          <button
            onClick={() => openWalletModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00ff41] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#00dd38] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="mt-0.5 text-sm text-[#666]">
            Create orders, convert to invoices, track to payment
          </p>
        </div>
        <Link
          href="/dashboard/orders/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00ff41] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#00dd38] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Value",
              value: `$${stats.totalValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`,
              icon: DollarSign,
              color: "#00ff41",
            },
            {
              label: "Active Orders",
              value: (
                stats.draft +
                stats.submitted +
                stats.accepted +
                stats.invoiced
              ).toString(),
              icon: Package,
              color: "#3b82f6",
            },
            {
              label: "Paid",
              value: `$${stats.paidValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`,
              sub: `${stats.paid} order${stats.paid !== 1 ? "s" : ""}`,
              icon: CheckCircle2,
              color: "#00ff41",
            },
            {
              label: "Awaiting Invoice",
              value: (stats.submitted + stats.accepted).toString(),
              icon: Clock,
              color: "#f59e0b",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-4"
            >
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666]">
                  {stat.label}
                </span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">{stat.value}</p>
              {"sub" in stat && stat.sub && (
                <p className="text-xs text-[#666]">{stat.sub}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />
          <input
            type="text"
            placeholder="Search by order #, buyer name, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#555] outline-none focus:border-[#00ff41]/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#666]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-[#333] bg-[#1a1a1a] py-2.5 pl-3 pr-8 text-sm text-white outline-none appearance-none cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="accepted">Accepted</option>
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-[#141414] border border-[#1f1f1f]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-[#666]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-[#333]" />
            <h3 className="mb-2 font-semibold text-white">
              {orders.length === 0
                ? "No purchase orders yet"
                : "No matching orders"}
            </h3>
            <p className="mb-6 text-sm text-[#666]">
              {orders.length === 0
                ? "Create your first purchase order to start the workflow."
                : "Try adjusting your search or filter."}
            </p>
            {orders.length === 0 && (
              <Link
                href="/dashboard/orders/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[#00ff41] px-5 py-2.5 text-sm font-bold text-black"
              >
                <Plus className="h-4 w-4" />
                Create Order
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#111]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Buyer
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Created
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => {
                  const sc = statusConfig[o.status] || statusConfig.draft;
                  const StatusIcon = sc.icon;
                  return (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="group cursor-pointer transition-colors hover:bg-[#1a1a1a] border-b border-[#1f1f1f] last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="font-mono text-sm font-medium text-white hover:text-[#00ff41]"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">
                            {o.buyerName}
                          </p>
                          <p className="text-xs text-[#666]">
                            {o.buyerCompany || o.buyerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                        $
                        {o.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border"
                          style={{
                            background: sc.bg,
                            color: sc.color,
                            borderColor: `${sc.color}30`,
                          }}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#888]">
                          {new Date(o.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/orders/${o.id}`}>
                          <ChevronRight className="h-4 w-4 text-[#555] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Workflow hint */}
      <div className="rounded-xl bg-[#00ff41]/5 border border-[#00ff41]/10 p-5">
        <div className="flex items-start gap-3">
          <ArrowRight className="h-5 w-5 text-[#00ff41] mt-0.5 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-[#00ff41] uppercase tracking-wider">
              Workflow
            </span>
            <p className="text-sm text-[#888] mt-1 leading-relaxed">
              Create a PO → Convert to invoice with one click → Buyer gets
              payment link → Payment settles on-chain → Books updated
              automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
