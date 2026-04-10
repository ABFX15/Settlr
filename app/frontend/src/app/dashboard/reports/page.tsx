"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import {
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  ArrowRight,
  Loader2,
  RefreshCw,
  Wallet,
  Search,
  Filter,
  ExternalLink,
  Shield,
  ChevronRight,
  ChevronDown,
  Activity,
  BookOpen,
  Calendar,
  XCircle,
} from "lucide-react";

/* ─── Types ─── */
interface ReconSummary {
  totalRows: number;
  matched: number;
  matchedAmount: number;
  unmatchedInvoices: number;
  unmatchedInvoiceAmount: number;
  unmatchedPayments: number;
  unmatchedPaymentAmount: number;
  overdue: number;
  overdueAmount: number;
  avgDaysToPayment: number;
  matchRate: number;
}

interface ReconRow {
  invoiceId: string | null;
  invoiceNumber: string | null;
  orderNumber: string | null;
  buyerName: string;
  buyerCompany: string | null;
  invoiceAmount: number | null;
  paymentAmount: number | null;
  variance: number;
  invoiceStatus: string | null;
  paymentStatus: string | null;
  paymentSignature: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  paidDate: string | null;
  daysToPayment: number | null;
  matchStatus: string;
}

interface BuyerRow {
  name: string;
  company: string | null;
  email: string;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  overdueAmount: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  avgDaysToPay: number | null;
  lastPayment: string | null;
}

interface AuditEvent {
  timestamp: string;
  type: string;
  action: string;
  reference: string;
  counterparty: string;
  amount: number | null;
  currency: string;
  txSignature: string | null;
  details: string;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

type Tab = "reconciliation" | "buyers" | "audit";

const MATCH_COLORS: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  matched: {
    bg: "bg-[#34c759]/10",
    text: "text-[#34c759]",
    border: "border-[#34c759]/20",
    label: "Matched",
  },
  unmatched_invoice: {
    bg: "bg-[#d29500]/10",
    text: "text-[#d29500]",
    border: "border-[#d29500]/20",
    label: "Awaiting Payment",
  },
  unmatched_payment: {
    bg: "bg-[#7086f2]/10",
    text: "text-[#7086f2]",
    border: "border-[#7086f2]/20",
    label: "No Invoice",
  },
  overdue: {
    bg: "bg-[#e74c3c]/10",
    text: "text-[#e74c3c]",
    border: "border-[#e74c3c]/20",
    label: "Overdue",
  },
};

const ACTION_ICONS: Record<string, string> = {
  created: "📄",
  sent: "📧",
  paid: "✅",
  received: "💰",
  refunded: "↩️",
  cancelled: "❌",
  converted: "🔄",
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  PAGE                                                                  */
/* ═══════════════════════════════════════════════════════════════════════ */

export default function ReportsPage() {
  const { publicKey, connected } = useActiveWallet();
  const { setVisible } = useWalletModal();

  const [tab, setTab] = useState<Tab>("reconciliation");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  // Reconciliation state
  const [reconSummary, setReconSummary] = useState<ReconSummary | null>(null);
  const [reconRows, setReconRows] = useState<ReconRow[]>([]);
  const [reconFilter, setReconFilter] = useState("all");

  // Buyers state
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);

  // Audit state
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditTypeFilter, setAuditTypeFilter] = useState("all");

  // Date range
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const headers: Record<string, string> = publicKey
    ? { "x-merchant-wallet": publicKey }
    : {};

  const fetchRecon = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reconFilter !== "all") params.set("status", reconFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`/api/reports/reconciliation?${params}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setReconSummary(data.summary);
        setReconRows(data.rows);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, reconFilter, dateFrom, dateTo]);

  const fetchBuyers = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reports/buyers", { headers });
      if (res.ok) {
        const data = await res.json();
        setBuyers(data.buyers || []);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  const fetchAudit = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (auditTypeFilter !== "all") params.set("type", auditTypeFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`/api/reports/audit-log?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAuditEvents(data.events);
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, auditTypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (tab === "reconciliation") fetchRecon();
    else if (tab === "buyers") fetchBuyers();
    else if (tab === "audit") fetchAudit();
  }, [tab, fetchRecon, fetchBuyers, fetchAudit]);

  const handleExport = async (endpoint: string, filename: string) => {
    if (!publicKey) return;
    setExporting(endpoint);
    try {
      const params = new URLSearchParams({ format: "csv" });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/reports/${endpoint}?${params}`, {
        headers,
      });
      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const handlePaymentExport = async () => {
    if (!publicKey) return;
    setExporting("payments");
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/merchants/${publicKey}/export?${params}`);
      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `settlr-payments-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  /* Auth gate */
  if (!connected || !publicKey) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Wallet className="h-10 w-10 text-[#5c5c5c]" />
        <p className="text-sm text-[#5c5c5c]">
          Connect your wallet to view reports
        </p>
        <button
          onClick={() => setVisible(true)}
          className="rounded-lg bg-[#34c759] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-[11px] text-[#34c759] uppercase tracking-[0.15em] font-semibold">
            Payment Operations
          </span>
          <h1 className="text-3xl font-bold text-[#212121] tracking-tight mt-1">
            Reports
          </h1>
          <p className="text-sm text-[#8a8a8a] mt-1">
            Reconciliation, audit logs, and accounting exports
          </p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() =>
            handleExport(
              "reconciliation",
              `settlr-reconciliation-${
                new Date().toISOString().split("T")[0]
              }.csv`,
            )
          }
          disabled={!!exporting}
          className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5 text-left hover:border-[#d3d3d3] transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34c759]/10">
              <CheckCircle2 className="h-4 w-4 text-[#34c759]" />
            </div>
            <Download
              className={`h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] transition-colors ${
                exporting === "reconciliation" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="text-sm font-semibold text-[#212121]">Reconciliation</div>
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">
            Invoice↔Payment matching
          </div>
        </button>

        <button
          onClick={handlePaymentExport}
          disabled={!!exporting}
          className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5 text-left hover:border-[#d3d3d3] transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <FileText className="h-4 w-4 text-purple-400" />
            </div>
            <Download
              className={`h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] transition-colors ${
                exporting === "payments" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="text-sm font-semibold text-[#212121]">Payments CSV</div>
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">
            QuickBooks / Xero ready
          </div>
        </button>

        <button
          onClick={() =>
            handleExport(
              "audit-log",
              `settlr-audit-log-${new Date().toISOString().split("T")[0]}.csv`,
            )
          }
          disabled={!!exporting}
          className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5 text-left hover:border-[#d3d3d3] transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7086f2]/10">
              <Activity className="h-4 w-4 text-[#7086f2]" />
            </div>
            <Download
              className={`h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] transition-colors ${
                exporting === "audit-log" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="text-sm font-semibold text-[#212121]">Audit Log</div>
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">Full event trail</div>
        </button>

        <button
          onClick={() =>
            handleExport(
              "buyers",
              `settlr-buyer-history-${
                new Date().toISOString().split("T")[0]
              }.csv`,
            )
          }
          disabled={!!exporting}
          className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5 text-left hover:border-[#d3d3d3] transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d29500]/10">
              <Users className="h-4 w-4 text-[#d29500]" />
            </div>
            <Download
              className={`h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] transition-colors ${
                exporting === "buyers" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="text-sm font-semibold text-[#212121]">Buyer History</div>
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">
            Per-buyer payment data
          </div>
        </button>
      </div>

      {/* Tab Bar + Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex rounded-lg bg-[#ffffff] border border-[#d3d3d3] p-1">
          {[
            {
              id: "reconciliation" as Tab,
              label: "Reconciliation",
              icon: CheckCircle2,
            },
            { id: "buyers" as Tab, label: "Buyers", icon: Users },
            { id: "audit" as Tab, label: "Audit Log", icon: Activity },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === t.id
                  ? "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20"
                  : "text-[#5c5c5c] hover:text-[#212121] border border-transparent"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2 text-xs text-[#212121] outline-none focus:border-[#34c759]/50"
            placeholder="From"
          />
          <span className="text-[#8a8a8a] text-xs">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2 text-xs text-[#212121] outline-none focus:border-[#34c759]/50"
            placeholder="To"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#34c759]" />
        </div>
      ) : (
        <>
          {/* ════ RECONCILIATION TAB ════ */}
          {tab === "reconciliation" && (
            <div className="space-y-4">
              {/* Summary Cards */}
              {reconSummary && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-4">
                    <div className="text-2xl font-bold text-[#34c759] font-mono">
                      {reconSummary.matchRate}%
                    </div>
                    <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                      Match Rate
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-4">
                    <div className="text-2xl font-bold text-[#212121] font-mono">
                      {reconSummary.matched}
                    </div>
                    <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                      Matched
                    </div>
                    <div className="text-[11px] text-[#5c5c5c] font-mono">
                      ${fmt(reconSummary.matchedAmount)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#ffffff] border border-[#d29500]/10 p-4">
                    <div className="text-2xl font-bold text-[#d29500] font-mono">
                      {reconSummary.unmatchedInvoices}
                    </div>
                    <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                      Awaiting Payment
                    </div>
                    <div className="text-[11px] text-[#5c5c5c] font-mono">
                      ${fmt(reconSummary.unmatchedInvoiceAmount)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#ffffff] border border-[#e74c3c]/10 p-4">
                    <div className="text-2xl font-bold text-[#e74c3c] font-mono">
                      {reconSummary.overdue}
                    </div>
                    <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                      Overdue
                    </div>
                    <div className="text-[11px] text-[#5c5c5c] font-mono">
                      ${fmt(reconSummary.overdueAmount)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-4">
                    <div className="text-2xl font-bold text-[#212121] font-mono">
                      {reconSummary.avgDaysToPayment}
                      <span className="text-sm text-[#5c5c5c] ml-0.5">d</span>
                    </div>
                    <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wider mt-1">
                      Avg Days to Pay
                    </div>
                  </div>
                </div>
              )}

              {/* Filter */}
              <div className="flex gap-2">
                {(
                  [
                    "all",
                    "matched",
                    "unmatched_invoice",
                    "overdue",
                    "unmatched_payment",
                  ] as const
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReconFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      reconFilter === f
                        ? "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20"
                        : "text-[#5c5c5c] border border-[#d3d3d3] hover:text-[#212121]"
                    }`}
                  >
                    {f === "all"
                      ? "All"
                      : f === "unmatched_invoice"
                      ? "Awaiting"
                      : f === "unmatched_payment"
                      ? "No Invoice"
                      : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#d3d3d3] text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                        <th className="px-4 py-3 text-left font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Invoice
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Buyer
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Invoiced
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Paid
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Due
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Paid Date
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Days
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Tx
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d3d3d3]">
                      {reconRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-12 text-center text-[#8a8a8a]"
                          >
                            No reconciliation data found
                          </td>
                        </tr>
                      ) : (
                        reconRows.map((r, i) => {
                          const mc =
                            MATCH_COLORS[r.matchStatus] || MATCH_COLORS.matched;
                          return (
                            <tr
                              key={i}
                              className="hover:bg-[#f2f2f2] transition-colors"
                            >
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mc.bg} ${mc.text} ${mc.border}`}
                                >
                                  {mc.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-[#212121]">
                                {r.invoiceNumber || "—"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-xs text-[#212121]">
                                  {r.buyerName}
                                </div>
                                {r.buyerCompany && (
                                  <div className="text-[11px] text-[#8a8a8a]">
                                    {r.buyerCompany}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-[#212121]">
                                {r.invoiceAmount !== null
                                  ? `$${fmt(r.invoiceAmount)}`
                                  : "—"}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-[#34c759]">
                                {r.paymentAmount !== null
                                  ? `$${fmt(r.paymentAmount)}`
                                  : "—"}
                              </td>
                              <td className="px-4 py-3 text-center text-xs text-[#5c5c5c]">
                                {r.dueDate || "—"}
                              </td>
                              <td className="px-4 py-3 text-center text-xs text-[#5c5c5c]">
                                {r.paidDate || "—"}
                              </td>
                              <td className="px-4 py-3 text-center text-xs text-[#8a8a8a]">
                                {r.daysToPayment !== null
                                  ? `${r.daysToPayment}d`
                                  : "—"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {r.paymentSignature ? (
                                  <a
                                    href={`https://explorer.solana.com/tx/${r.paymentSignature}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#8a8a8a] hover:text-[#34c759] transition-colors"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 inline" />
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ BUYERS TAB ════ */}
          {tab === "buyers" && (
            <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#d3d3d3] text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                      <th className="px-4 py-3 text-left font-semibold">
                        Buyer
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Invoiced
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Paid
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Outstanding
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Invoices
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Overdue
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Avg Days
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Last Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d3d3d3]">
                    {buyers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center text-[#8a8a8a]"
                        >
                          No buyer data yet
                        </td>
                      </tr>
                    ) : (
                      buyers.map((b, i) => (
                        <tr
                          key={i}
                          className="hover:bg-[#f2f2f2] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm text-[#212121] font-medium">
                              {b.company || b.name}
                            </div>
                            <div className="text-[11px] text-[#8a8a8a]">
                              {b.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#212121]">
                            ${fmt(b.totalInvoiced)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#34c759]">
                            ${fmt(b.totalPaid)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {b.outstanding > 0 ? (
                              <span className="text-[#d29500]">
                                ${fmt(b.outstanding)}
                              </span>
                            ) : (
                              <span className="text-[#8a8a8a]">$0.00</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-[#8a8a8a]">
                            {b.invoiceCount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {b.overdueCount > 0 ? (
                              <span className="text-[#e74c3c] font-semibold">
                                {b.overdueCount}
                              </span>
                            ) : (
                              <span className="text-[#8a8a8a]">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-[#8a8a8a]">
                            {b.avgDaysToPay !== null
                              ? `${b.avgDaysToPay}d`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-[#5c5c5c]">
                            {b.lastPayment
                              ? new Date(b.lastPayment).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ AUDIT LOG TAB ════ */}
          {tab === "audit" && (
            <div className="space-y-4">
              {/* Type filter */}
              <div className="flex gap-2">
                {(["all", "invoice", "payment", "order"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setAuditTypeFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      auditTypeFilter === f
                        ? "bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20"
                        : "text-[#5c5c5c] border border-[#d3d3d3] hover:text-[#212121]"
                    }`}
                  >
                    {f === "all"
                      ? "All Events"
                      : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
                  </button>
                ))}
              </div>

              {/* Event List */}
              <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] divide-y divide-[#d3d3d3]">
                {auditEvents.length === 0 ? (
                  <div className="px-4 py-12 text-center text-[#8a8a8a]">
                    No audit events found
                  </div>
                ) : (
                  auditEvents.slice(0, 100).map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-[#f2f2f2] transition-colors"
                    >
                      <span className="text-lg w-8 text-center">
                        {ACTION_ICONS[e.action] || "📋"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#34c759]">
                            {e.reference}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              e.type === "invoice"
                                ? "bg-purple-500/10 text-purple-400"
                                : e.type === "payment"
                                ? "bg-[#34c759]/10 text-[#34c759]"
                                : "bg-[#7086f2]/10 text-[#7086f2]"
                            }`}
                          >
                            {e.type}
                          </span>
                          <span className="text-[10px] text-[#8a8a8a] uppercase">
                            {e.action}
                          </span>
                        </div>
                        <div className="text-xs text-[#5c5c5c] mt-0.5 truncate">
                          {e.details}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {e.amount !== null && (
                          <div className="text-sm font-mono text-[#212121]">
                            ${fmt(e.amount)}
                          </div>
                        )}
                        <div className="text-[10px] text-[#8a8a8a]">
                          {new Date(e.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          {new Date(e.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {e.txSignature && (
                        <a
                          href={`https://explorer.solana.com/tx/${e.txSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8a8a8a] hover:text-[#34c759] transition-colors shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
