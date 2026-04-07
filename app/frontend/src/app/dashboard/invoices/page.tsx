"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Plus,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  ExternalLink,
  Search,
  Filter,
  Link2,
  Copy,
  Check,
} from "lucide-react";

/* ─── Types ─── */
interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  total: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  viewToken?: string;
}

interface InvoiceStats {
  total: number;
  paid: number;
  outstanding: number;
  overdue: number;
  totalRevenue: number;
  outstandingAmount: number;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof FileText }
> = {
  draft: {
    label: "Draft",
    color: "#888",
    bg: "rgba(136,136,136,0.1)",
    icon: FileText,
  },
  sent: {
    label: "Sent",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    icon: Send,
  },
  viewed: {
    label: "Viewed",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    icon: Eye,
  },
  paid: {
    label: "Paid",
    color: "#00ff41",
    bg: "rgba(0,255,65,0.1)",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    icon: AlertTriangle,
  },
  cancelled: {
    label: "Cancelled",
    color: "#888",
    bg: "rgba(136,136,136,0.1)",
    icon: XCircle,
  },
};

export default function InvoicesPage() {
  const { publicKey, connected } = useActiveWallet();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendResult, setResendResult] = useState<{
    id: string;
    success: boolean;
  } | null>(null);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://settlr.dev";

  const copyPayLink = (inv: InvoiceSummary) => {
    if (!inv.viewToken) return;
    const url = `${appUrl}/invoice/${inv.viewToken}`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resendInvoice = async (inv: InvoiceSummary) => {
    if (!publicKey || resendingId) return;
    setResendingId(inv.id);
    setResendResult(null);
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-wallet": publicKey,
        },
        body: JSON.stringify({ action: "resend" }),
      });
      const data = await res.json();
      setResendResult({ id: inv.id, success: data.emailSent !== false });
      setTimeout(() => setResendResult(null), 3000);
    } catch {
      setResendResult({ id: inv.id, success: false });
      setTimeout(() => setResendResult(null), 3000);
    } finally {
      setResendingId(null);
    }
  };

  const fetchInvoices = useCallback(async () => {
    if (!publicKey) return;
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      params.set("limit", "100");
      const headers = { "x-merchant-wallet": publicKey };
      const [invRes, statsRes] = await Promise.all([
        fetch(`/api/invoices?${params}`, { headers }),
        fetch("/api/invoices?stats=true", { headers }),
      ]);
      if (invRes.ok) {
        const data = await invRes.json();
        setInvoices(data.invoices || []);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, publicKey]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.buyerName.toLowerCase().includes(q) ||
      inv.buyerEmail.toLowerCase().includes(q) ||
      (inv.buyerCompany || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="mt-0.5 text-sm text-[#666]">
            Create and manage invoices for your buyers
          </p>
        </div>
        <Link
          href="/dashboard/invoices/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00ff41] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#00dd38] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Revenue",
              value: `$${stats.totalRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`,
              icon: DollarSign,
              color: "#00ff41",
            },
            {
              label: "Paid",
              value: stats.paid.toString(),
              icon: CheckCircle2,
              color: "#00ff41",
            },
            {
              label: "Outstanding",
              value: `$${stats.outstandingAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}`,
              sub: `${stats.outstanding} invoice${
                stats.outstanding !== 1 ? "s" : ""
              }`,
              icon: Clock,
              color: "#3b82f6",
            },
            {
              label: "Overdue",
              value: stats.overdue.toString(),
              icon: AlertTriangle,
              color: stats.overdue > 0 ? "#ef4444" : "#888",
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
              {stat.sub && <p className="text-xs text-[#666]">{stat.sub}</p>}
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
            placeholder="Search invoices..."
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
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoice table */}
      <div className="overflow-hidden rounded-xl bg-[#141414] border border-[#1f1f1f]">
        {loading ? (
          <div className="p-12 text-center text-[#666]">
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-[#333]" />
            <h3 className="mb-2 font-semibold text-white">
              {invoices.length === 0
                ? "No invoices yet"
                : "No matching invoices"}
            </h3>
            <p className="mb-6 text-sm text-[#666]">
              {invoices.length === 0
                ? "Create your first invoice to start getting paid."
                : "Try adjusting your search or filter."}
            </p>
            {invoices.length === 0 && (
              <Link
                href="/dashboard/invoices/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[#00ff41] px-5 py-2.5 text-sm font-bold text-black"
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#111]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Invoice
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
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Pay Link
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Email
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv, i) => {
                  const isDue =
                    !["paid", "cancelled"].includes(inv.status) &&
                    new Date(inv.dueDate) < new Date();
                  const displayStatus = isDue ? "overdue" : inv.status;
                  const dsc = statusConfig[displayStatus] || statusConfig.draft;
                  const DStatusIcon = dsc.icon;

                  return (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="group cursor-pointer transition-colors hover:bg-[#1a1a1a] border-b border-[#1f1f1f] last:border-0"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-white">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">
                            {inv.buyerName}
                          </p>
                          <p className="text-xs text-[#666]">
                            {inv.buyerCompany || inv.buyerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                        $
                        {inv.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border"
                          style={{
                            background: dsc.bg,
                            color: dsc.color,
                            borderColor: `${dsc.color}30`,
                          }}
                        >
                          <DStatusIcon className="h-3 w-3" />
                          {dsc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${
                            isDue ? "text-red-400" : "text-[#888]"
                          }`}
                        >
                          {new Date(inv.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {inv.viewToken &&
                        !["paid", "cancelled"].includes(inv.status) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPayLink(inv);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#00ff41] hover:bg-[#00ff41]/10 transition-colors"
                          >
                            {copiedId === inv.id ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Link2 className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        ) : inv.status === "paid" ? (
                          <span className="text-xs text-[#666]">Paid</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!["paid", "cancelled", "draft"].includes(
                          inv.status,
                        ) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resendInvoice(inv);
                            }}
                            disabled={resendingId === inv.id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-colors disabled:opacity-50"
                          >
                            {resendingId === inv.id ? (
                              <>
                                <Clock className="h-3 w-3 animate-spin" />
                                Sending...
                              </>
                            ) : resendResult?.id === inv.id ? (
                              resendResult.success ? (
                                <>
                                  <Check className="h-3 w-3 text-[#00ff41]" />
                                  <span className="text-[#00ff41]">Sent!</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-3 w-3 text-red-400" />
                                  <span className="text-red-400">Failed</span>
                                </>
                              )
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                Resend
                              </>
                            )}
                          </button>
                        ) : inv.status === "draft" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resendInvoice(inv);
                            }}
                            disabled={resendingId === inv.id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#00ff41] hover:bg-[#00ff41]/10 transition-colors disabled:opacity-50"
                          >
                            {resendingId === inv.id ? (
                              <>
                                <Clock className="h-3 w-3 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                Send
                              </>
                            )}
                          </button>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {inv.viewToken ? (
                          <Link
                            href={`/invoice/${inv.viewToken}`}
                            target="_blank"
                            className="opacity-0 transition-opacity group-hover:opacity-100 text-[#00ff41]"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="opacity-0 transition-opacity group-hover:opacity-100 text-[#666]">
                            <ExternalLink className="h-4 w-4" />
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
