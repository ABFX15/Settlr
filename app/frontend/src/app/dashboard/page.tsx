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
  ArrowRight,
  ExternalLink,
  RefreshCw,
  LogIn,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Building2,
  Cloud,
  Package,
} from "lucide-react";

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/* ─── Mock data for demo ─── */
const MOCK_BALANCE = 4892104.2;
const MOCK_AVAILABLE = 1204500.0;
const MOCK_ESCROWED = 3687604.2;
const MOCK_CHANGE = 12.4;
const MOCK_PENDING_INVOICES = 14;

const VOLUME_DATA = [
  { day: "MON", value: 420000, height: 35 },
  { day: "TUE", value: 580000, height: 48 },
  { day: "WED", value: 650000, height: 54 },
  { day: "THU", value: 520000, height: 43 },
  { day: "FRI (PEAK)", value: 912000, height: 76, peak: true },
  { day: "SAT", value: 380000, height: 32 },
  { day: "SUN", value: 350000, height: 29 },
];

const SETTLEMENT_QUEUE = [
  {
    id: "SET-88219",
    name: "Global Logistics Inc.",
    amount: 450000.0,
    fee: 12.5,
    status: "FINALIZING",
    statusColor: "#00ff41",
    time: "2 mins ago",
    icon: Building2,
  },
  {
    id: "SET-88220",
    name: "Aether Cloud Services",
    amount: 128400.0,
    fee: 8.2,
    status: "IN QUEUE",
    statusColor: "#888",
    time: "15 mins ago",
    icon: Cloud,
  },
  {
    id: "SET-88221",
    name: "Prime Wholesale Dist.",
    amount: 2100000.0,
    fee: 45.0,
    status: "CONFIRMED",
    statusColor: "#00ff41",
    time: "1 hour ago",
    icon: Package,
  },
];

export default function DashboardPage() {
  const { connected: authenticated } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const { publicKey, connected } = useActiveWallet();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [volumeView, setVolumeView] = useState<"daily" | "weekly">("daily");

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
            Welcome to Settlr
          </h2>
          <p className="text-[#888] mb-6 max-w-sm text-sm">
            Connect your wallet to access your merchant dashboard.
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
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Vault Overview
        </h1>
        <p className="text-sm text-[#666] mt-1 uppercase tracking-wider">
          Institutional Settlement Portal
        </p>
      </div>

      {/* Balance + Pending Invoices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Liquid Balance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-xl bg-[#141414] border border-[#1f1f1f] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-[#666] uppercase tracking-[0.15em] font-semibold">
              Total Liquid Balance
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#00ff41]/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#00ff41]" />
            </div>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-white tracking-tight">
              {formatUSD(MOCK_BALANCE)}
            </span>
            <span className="text-lg font-semibold text-[#00ff41]">USDC</span>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#1f1f1f]">
            <div>
              <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                Available to Settle
              </span>
              <span className="text-lg font-semibold text-white">
                {formatUSD(MOCK_AVAILABLE)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                Escrowed Funds
              </span>
              <span className="text-lg font-semibold text-white">
                {formatUSD(MOCK_ESCROWED)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                24h Change
              </span>
              <span className="text-lg font-semibold text-[#00ff41]">
                +{MOCK_CHANGE}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pending Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6 flex flex-col justify-between"
        >
          <div>
            <span className="text-[11px] text-[#666] uppercase tracking-[0.15em] font-semibold">
              Pending Invoices
            </span>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-[#aaa]">Awaiting Payment</span>
              <span className="text-2xl font-bold text-white">
                {MOCK_PENDING_INVOICES}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-[#666] mb-2">
                <span>Target: 20 Invoices</span>
                <span>65% Volume</span>
              </div>
              <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ff41] rounded-full transition-all"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/invoices"
            className="mt-6 flex items-center justify-between rounded-lg border border-[#333] px-4 py-3 text-sm font-medium text-white hover:bg-[#1a1a1a] transition-colors group"
          >
            <span className="uppercase tracking-wider text-[12px]">View Ledger</span>
            <ArrowRight className="h-4 w-4 text-[#666] group-hover:text-[#00ff41] transition-colors" />
          </Link>
        </motion.div>
      </div>

      {/* Payment Volume Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] text-[#666] uppercase tracking-[0.15em] font-semibold">
            Payment Volume Analysis (7D)
          </span>
          <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
            <button
              onClick={() => setVolumeView("daily")}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                volumeView === "daily"
                  ? "bg-[#00ff41] text-black"
                  : "text-[#888] hover:text-white"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setVolumeView("weekly")}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                volumeView === "weekly"
                  ? "bg-[#00ff41] text-black"
                  : "text-[#888] hover:text-white"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between gap-3 h-48 px-2">
          {VOLUME_DATA.map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
              {bar.peak && (
                <div className="bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-[10px] text-[#00ff41] font-mono mb-1">
                  912K USDC
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-all ${
                  bar.peak ? "bg-[#00ff41]" : "bg-[#2a2a2a]"
                }`}
                style={{ height: `${bar.height}%` }}
              />
              <span
                className={`text-[10px] font-semibold tracking-wider ${
                  bar.peak ? "text-[#00ff41]" : "text-[#555]"
                }`}
              >
                {bar.day}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Active Settlement Queue */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl bg-[#141414] border border-[#1f1f1f]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
          <span className="text-[11px] text-[#666] uppercase tracking-[0.15em] font-semibold">
            Active Settlement Queue
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors">
              <Filter className="h-4 w-4" />
            </button>
            <button className="rounded-full h-8 w-8 bg-[#00ff41] flex items-center justify-center text-black hover:bg-[#00dd38] transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#1f1f1f]">
          {SETTLEMENT_QUEUE.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <div className="h-10 w-10 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                <item.icon className="h-4 w-4 text-[#888]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{item.name}</div>
                <div className="text-[11px] text-[#555] font-mono">
                  ID: {item.id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {formatUSD(item.amount)} USDC
                </div>
                <div className="text-[11px] text-[#555]">
                  Network Fee: {item.fee.toFixed(2)}
                </div>
              </div>
              <div className="w-24 text-center">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border"
                  style={{
                    color: item.statusColor,
                    borderColor:
                      item.statusColor === "#00ff41"
                        ? "rgba(0,255,65,0.2)"
                        : "rgba(136,136,136,0.2)",
                    backgroundColor:
                      item.statusColor === "#00ff41"
                        ? "rgba(0,255,65,0.05)"
                        : "rgba(136,136,136,0.05)",
                  }}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-[11px] text-[#555] w-20 text-right">
                {item.time}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1f1f1f] px-6 py-4 text-center">
          <button className="text-[11px] text-[#666] uppercase tracking-wider font-semibold hover:text-[#00ff41] transition-colors flex items-center gap-2 mx-auto">
            <Download className="h-3.5 w-3.5" />
            Download Transaction History (CSV)
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="flex items-center justify-between py-6 border-t border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider">
        <span>&copy; 2024 Settlr Protocol. Institutional Grade Infrastructure.</span>
        <div className="flex items-center gap-6">
          <Link href="/docs" className="hover:text-[#888] transition-colors">API Docs</Link>
          <Link href="/compliance" className="hover:text-[#888] transition-colors">Security Audit</Link>
          <Link href="/privacy" className="hover:text-[#888] transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
