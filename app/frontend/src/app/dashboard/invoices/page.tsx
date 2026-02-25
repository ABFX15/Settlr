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
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";

/* ─── Palette ─── */
const CREAM = "#FDFBF7";
const NAVY = "#0C1829";
const SLATE = "#3B4963";
const MUTED = "#7C8A9E";
const GREEN = "#1B6B4A";
const ACCENT = "#2A9D6A";
const TOPO = "#E8E4DA";
const CARD_BORDER = "#E2DFD5";

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
  draft: { label: "Draft", color: MUTED, bg: `${TOPO}`, icon: FileText },
  sent: { label: "Sent", color: "#2563eb", bg: "#eff6ff", icon: Send },
  viewed: { label: "Viewed", color: "#7c3aed", bg: "#f5f3ff", icon: Eye },
  paid: {
    label: "Paid",
    color: GREEN,
    bg: `rgba(27,107,74,0.1)`,
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: AlertTriangle,
  },
  cancelled: {
    label: "Cancelled",
    color: MUTED,
    bg: "#f3f4f6",
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
          <h1
            className="text-2xl font-bold"
            style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
          >
            Invoices
          </h1>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            Create and manage invoices for your buyers
          </p>
        </div>
        <Link
          href="/dashboard/invoices/create"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: GREEN }}
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
              color: GREEN,
            },
            {
              label: "Paid",
              value: stats.paid.toString(),
              icon: CheckCircle2,
              color: GREEN,
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
              color: "#2563eb",
            },
            {
              label: "Overdue",
              value: stats.overdue.toString(),
              icon: AlertTriangle,
              color: stats.overdue > 0 ? "#dc2626" : MUTED,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border p-4"
              style={{ borderColor: CARD_BORDER, background: "white" }}
            >
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: MUTED }}
                >
                  {stat.label}
                </span>
              </div>
              <p className="mt-1 text-xl font-bold" style={{ color: NAVY }}>
                {stat.value}
              </p>
              {stat.sub && (
                <p className="text-xs" style={{ color: MUTED }}>
                  {stat.sub}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: MUTED }}
          />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
            style={{
              borderColor: CARD_BORDER,
              color: NAVY,
              background: "white",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: MUTED }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border py-2.5 pl-3 pr-8 text-sm outline-none"
            style={{
              borderColor: CARD_BORDER,
              color: SLATE,
              background: "white",
            }}
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
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: CARD_BORDER, background: "white" }}
      >
        {loading ? (
          <div className="p-12 text-center" style={{ color: MUTED }}>
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText
              className="mx-auto mb-4 h-12 w-12"
              style={{ color: TOPO }}
            />
            <h3 className="mb-2 font-semibold" style={{ color: NAVY }}>
              {invoices.length === 0
                ? "No invoices yet"
                : "No matching invoices"}
            </h3>
            <p className="mb-6 text-sm" style={{ color: MUTED }}>
              {invoices.length === 0
                ? "Create your first invoice to start getting paid."
                : "Try adjusting your search or filter."}
            </p>
            {invoices.length === 0 && (
              <Link
                href="/dashboard/invoices/create"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: GREEN }}
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
                <tr
                  style={{
                    borderBottom: `1px solid ${CARD_BORDER}`,
                    background: "#F8F7F3",
                  }}
                >
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: MUTED }}
                  >
                    Invoice
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: MUTED }}
                  >
                    Buyer
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: MUTED }}
                  >
                    Amount
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ color: MUTED }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: MUTED }}
                  >
                    Due Date
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv, i) => {
                  const sc = statusConfig[inv.status] || statusConfig.draft;
                  const StatusIcon = sc.icon;
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
                      className="group cursor-pointer transition-colors hover:bg-[#FDFBF7]"
                      style={{
                        borderBottom:
                          i < filteredInvoices.length - 1
                            ? `1px solid ${CARD_BORDER}`
                            : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="font-mono text-sm font-medium"
                          style={{ color: NAVY }}
                        >
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium" style={{ color: NAVY }}>
                            {inv.buyerName}
                          </p>
                          <p className="text-xs" style={{ color: MUTED }}>
                            {inv.buyerCompany || inv.buyerEmail}
                          </p>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-right font-mono font-semibold"
                        style={{ color: NAVY }}
                      >
                        $
                        {inv.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            background: dsc.bg,
                            color: dsc.color,
                          }}
                        >
                          <DStatusIcon className="h-3 w-3" />
                          {dsc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-sm"
                          style={{
                            color: isDue ? "#dc2626" : SLATE,
                          }}
                        >
                          {new Date(inv.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/invoices/${inv.id}`}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ color: GREEN }}
                        >
                          <ExternalLink className="h-4 w-4" />
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
    </div>
  );
}
