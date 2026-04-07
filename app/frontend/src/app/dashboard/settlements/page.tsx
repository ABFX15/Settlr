"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Shield,
  Activity,
  Clock,
  Building2,
} from "lucide-react";

/* ─── Mock Settlement Data ─── */
const SETTLEMENT = {
  id: "ST-9482",
  status: "confirmed",
  amount: 142500.0,
  currency: "USDC",
  completedAt: "October 24, 2023 at 14:22:01 UTC",
  network: "Ethereum Mainnet",
  method: "Layer 2 Rollup",
  confirmations: 1248,
  blockNumber: 18422901,
  txHash:
    "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0fb893db30a3abc0cfc608aacf...",
  from: {
    name: "Settlr Treasury Vault",
    address: "0xZA8...F99L",
  },
  to: {
    name: "Goldman Global Partners",
    address: "0x8B1d...44Z1",
  },
  gasFee: { eth: 0.0042, usd: 8.12 },
  gasPrice: 12.5,
  executionTime: 14.2,
  priorityStatus: "HIGH",
  liquidityRoute: { protocol: 88, direct: 12 },
  compliance: {
    provider: "Chainalysis Oracle",
    status: "No high-risk entities identified in transaction path.",
    ofac: "CLEAN",
    score: 98,
  },
  auditHistory: [
    {
      time: "Oct 24, 14:18:45",
      title: "Settlement Initialized",
      description:
        "Triggered by Smart Contract Auto-Release (Invoice #INV-290)",
    },
    {
      time: "Oct 24, 14:20:12",
      title: "Vault Unlocked & Gas Optimized",
      description:
        "Multi-sig validation complete. Dynamic gas pricing applied at 12.5 Gwei.",
    },
    {
      time: "Oct 24, 14:22:01",
      title: "Broadcast Successful",
      description:
        "Transaction confirmed by network and moved to Immutable Storage.",
      success: true,
    },
  ],
};

export default function SettlementsPage() {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(SETTLEMENT.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settlements
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <span className="text-[11px] text-[#00ff41] uppercase tracking-[0.15em] font-semibold">
            Transaction Verified
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-1">
            Settlement <span className="text-[#00ff41]">#{SETTLEMENT.id}</span>
          </h1>
          <p className="text-sm text-[#666] mt-1">
            Completed on {SETTLEMENT.completedAt}. Fully settled on{" "}
            {SETTLEMENT.network} via {SETTLEMENT.method}.
          </p>
        </div>
        <div className="rounded-xl bg-[#00ff41] px-6 py-4 text-center shrink-0">
          <div className="text-[10px] text-black/60 uppercase tracking-wider font-semibold mb-1">
            Settled Amount
          </div>
          <div className="text-2xl font-bold text-black">
            {SETTLEMENT.amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}{" "}
            USDC
          </div>
        </div>
      </div>

      {/* Confirmation + Technical Signature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confirmation Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6"
        >
          <span className="text-[10px] text-[#555] uppercase tracking-wider font-semibold">
            Confirmation Status
          </span>
          <div className="flex items-center gap-3 mt-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-[#00ff41]/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-[#00ff41]" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Confirmed</span>
              <div className="text-xs text-[#666]">
                {SETTLEMENT.confirmations.toLocaleString()} Network
                Confirmations
              </div>
            </div>
          </div>
          <div className="space-y-3 border-t border-[#1f1f1f] pt-4">
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Block Number</span>
              <span className="text-sm font-mono text-white">
                {SETTLEMENT.blockNumber.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#666]">Network</span>
              <span className="text-sm text-white">{SETTLEMENT.network}</span>
            </div>
          </div>
        </motion.div>

        {/* Technical Signature */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6"
        >
          <span className="text-[10px] text-[#555] uppercase tracking-wider font-semibold">
            Technical Signature
          </span>

          <div className="mt-4 space-y-4">
            {/* TX Hash */}
            <div>
              <span className="text-[10px] text-[#555] uppercase tracking-wider">
                Transaction Hash
              </span>
              <div className="flex items-center gap-2 mt-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] px-3 py-2">
                <code className="flex-1 truncate text-xs text-[#aaa] font-mono">
                  {SETTLEMENT.txHash}
                </code>
                <button
                  onClick={copyHash}
                  className="shrink-0 text-[#666] hover:text-[#00ff41] transition-colors"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[#555] uppercase tracking-wider">
                  From (Sender)
                </span>
                <div className="text-sm font-medium text-white mt-1">
                  {SETTLEMENT.from.name}
                </div>
                <div className="text-xs text-[#666] font-mono">
                  {SETTLEMENT.from.address}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#555] uppercase tracking-wider">
                  To (Recipient)
                </span>
                <div className="text-sm font-medium text-white mt-1">
                  {SETTLEMENT.to.name}
                </div>
                <div className="text-xs text-[#666] font-mono">
                  {SETTLEMENT.to.address}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gas Info + Priority */}
      <div className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
              Gas Fee Paid
            </span>
            <span className="text-sm font-semibold text-white">
              {SETTLEMENT.gasFee.eth} ETH (${SETTLEMENT.gasFee.usd})
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
              Gas Price
            </span>
            <span className="text-sm font-semibold text-white">
              {SETTLEMENT.gasPrice} Gwei
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
              Execution Time
            </span>
            <span className="text-sm font-semibold text-white">
              {SETTLEMENT.executionTime} Seconds
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
              Priority Status
            </span>
            <span className="text-sm font-bold text-[#00ff41]">
              {SETTLEMENT.priorityStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Liquidity Route + KYC/AML + Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Liquidity Route */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-[#00ff41]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#888]">
              Liquidity Route
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#00ff41] rounded-full"
              style={{ width: `${SETTLEMENT.liquidityRoute.protocol}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#666]">
            <span>Settlr Pool ({SETTLEMENT.liquidityRoute.protocol}%)</span>
            <span>Direct LP ({SETTLEMENT.liquidityRoute.direct}%)</span>
          </div>
        </motion.div>

        {/* KYC/AML */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-[#00ff41]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#888]">
              KYC/AML Checked
            </span>
          </div>
          <p className="text-xs text-[#888] mb-3 leading-relaxed">
            Validated via {SETTLEMENT.compliance.provider}.{" "}
            {SETTLEMENT.compliance.status}
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#00ff41]/10 border border-[#00ff41]/20 px-2 py-1 text-[10px] font-bold text-[#00ff41] uppercase">
              OFAC {SETTLEMENT.compliance.ofac}
            </span>
            <span className="rounded-md bg-[#00ff41]/10 border border-[#00ff41]/20 px-2 py-1 text-[10px] font-bold text-[#00ff41] uppercase">
              Score: {SETTLEMENT.compliance.score}/100
            </span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="rounded-xl bg-[#00ff41] p-6 flex flex-col justify-center gap-3"
        >
          <button className="flex items-center justify-center gap-2 rounded-lg bg-black/20 px-4 py-3 text-sm font-bold text-black hover:bg-black/30 transition-colors">
            <Download className="h-4 w-4" />
            Download Receipt
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-black/20 px-4 py-3 text-sm font-medium text-black hover:bg-black/10 transition-colors">
            <ExternalLink className="h-4 w-4" />
            View on Etherscan
          </button>
        </motion.div>
      </div>

      {/* Internal Audit History */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-bold text-white mb-6">
          Internal Audit History
        </h2>
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#1f1f1f]" />

          <div className="space-y-8">
            {SETTLEMENT.auditHistory.map((event, i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                    event.success
                      ? "bg-[#00ff41] border-[#00ff41]/30"
                      : "bg-[#00ff41] border-[#00ff41]/30"
                  }`}
                />
                <div className="text-xs text-[#555] mb-1">{event.time}</div>
                <h3
                  className={`text-sm font-semibold ${
                    event.success ? "text-[#00ff41]" : "text-white"
                  }`}
                >
                  {event.title}
                </h3>
                <p className="text-xs text-[#666] mt-0.5">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="flex items-center justify-between py-6 border-t border-[#1f1f1f] text-[10px] text-[#444] uppercase tracking-wider">
        <span>
          &copy; 2023 Settlr Finance. All Transactions are Cryptographically
          Signed
        </span>
        <div className="flex items-center gap-6">
          <span>Privacy Protocol</span>
          <span>Node Status: Healthy</span>
        </div>
      </div>
    </div>
  );
}
