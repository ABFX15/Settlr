"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  RefreshCw,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Home,
  ChevronRight,
  ExternalLink,
  LogIn,
} from "lucide-react";

interface Balance {
  available: number;
  pending: number;
  reserved: number;
  total: number;
}

interface Lifetime {
  totalDeposited: number;
  totalPayouts: number;
  totalFees: number;
  totalWithdrawn: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  payoutId?: string;
  txSignature?: string;
  description?: string;
  balanceAfter: number;
  createdAt: string;
}

interface DepositInfo {
  depositAddress: string;
  usdcMint: string;
  network: string;
  cluster: string;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const TX_TYPE_LABELS: Record<
  string,
  { label: string; color: string; icon: typeof ArrowUpRight }
> = {
  deposit: {
    label: "Deposit",
    color: "text-[#1B6B4A]",
    icon: ArrowDownRight,
  },
  payout_reserved: { label: "Reserved", color: "text-yellow-400", icon: Clock },
  payout_released: {
    label: "Payout Sent",
    color: "text-[#1B6B4A]",
    icon: ArrowUpRight,
  },
  payout_refund: {
    label: "Refund",
    color: "text-[#1B6B4A]",
    icon: ArrowDownRight,
  },
  fee_deducted: {
    label: "Platform Fee",
    color: "text-red-400",
    icon: DollarSign,
  },
  withdrawal: {
    label: "Withdrawal",
    color: "text-orange-400",
    icon: ArrowUpRight,
  },
};

export default function TreasuryPage() {
  const { authenticated, login } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [balance, setBalance] = useState<Balance | null>(null);
  const [lifetime, setLifetime] = useState<Lifetime | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTx, setDepositTx] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState("");

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/treasury/balance?wallet=${publicKey}&history=true&limit=50`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch balance");
      }
      const data = await res.json();
      setBalance(data.balance);
      setLifetime(data.lifetime);
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  const fetchDepositInfo = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch("/api/treasury/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: publicKey }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setDepositInfo(data);
    } catch {
      // Silent fail for deposit info
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
      fetchDepositInfo();
    }
  }, [publicKey, fetchBalance, fetchDepositInfo]);

  const handleDeposit = async () => {
    if (!depositTx || !depositAmount || !publicKey) return;
    setDepositing(true);
    setDepositSuccess("");
    setError("");
    try {
      const res = await fetch("/api/treasury/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey,
          amount: parseFloat(depositAmount),
          txSignature: depositTx,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record deposit");
      setDepositSuccess(
        `Deposit of ${formatUSD(data.amount)} credited successfully`,
      );
      setDepositAmount("");
      setDepositTx("");
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setDepositing(false);
    }
  };

  const copyAddress = async () => {
    if (!depositInfo?.depositAddress) return;
    await navigator.clipboard.writeText(depositInfo.depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Not authenticated — show login prompt
  if (!authenticated) {
    return (
      <div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-[#7C8A9E] hover:text-[#3B4963] transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Dashboard
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#3B4963]">Treasury</span>
            </Link>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Treasury
          </h1>
          <p className="text-[#7C8A9E] mb-8">
            Fund your payout balance and track deposits.
          </p>

          <div className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-8 text-center">
            <Wallet className="mx-auto h-10 w-10 text-[#7C8A9E]/60 mb-4" />
            <p className="text-sm text-[#7C8A9E] mb-6">
              Connect your wallet to view your treasury balance.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1B6B4A] px-6 py-3 text-sm font-medium text-[#0C1829] hover:bg-[#1B6B4A]/90 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wallet not connected yet (still loading)
  if (!connected || !publicKey || !balance) {
    return (
      <div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-[#7C8A9E] hover:text-[#3B4963] transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Dashboard
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#3B4963]">Treasury</span>
            </Link>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Treasury
          </h1>
          <p className="text-[#7C8A9E] mb-8">
            Fund your payout balance and track deposits.
          </p>

          <div className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-8 text-center">
            {loading ? (
              <>
                <RefreshCw className="mx-auto h-8 w-8 text-[#7C8A9E]/60 mb-4 animate-spin" />
                <p className="text-sm text-[#7C8A9E]">Loading treasury...</p>
              </>
            ) : (
              <>
                <Wallet className="mx-auto h-8 w-8 text-[#7C8A9E]/60 mb-4" />
                <p className="text-sm text-[#7C8A9E]">
                  Waiting for wallet connection...
                </p>
              </>
            )}
            {error && (
              <p className="mt-4 text-sm text-red-400 flex items-center justify-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#7C8A9E] hover:text-[#3B4963] transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Dashboard
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#3B4963]">Treasury</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Treasury</h1>
            <p className="text-[#7C8A9E] mt-1">Manage your payout balance</p>
          </div>
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-4 py-2 text-sm text-[#3B4963] hover:bg-[#F3F2ED] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6"
          >
            <div className="flex items-center gap-2 text-sm text-[#1B6B4A]/70 mb-1">
              <Wallet className="h-4 w-4" />
              Available
            </div>
            <div className="text-2xl font-semibold text-[#1B6B4A]">
              {formatUSD(balance.available)}
            </div>
            <div className="text-xs text-[#7C8A9E] mt-1">Ready for payouts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] p-6"
          >
            <div className="flex items-center gap-2 text-sm text-yellow-400/70 mb-1">
              <Clock className="h-4 w-4" />
              Reserved
            </div>
            <div className="text-2xl font-semibold text-yellow-400">
              {formatUSD(balance.reserved)}
            </div>
            <div className="text-xs text-[#7C8A9E] mt-1">In-flight payouts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[#1B6B4A]/20 bg-[#1B6B4A]/[0.05] p-6"
          >
            <div className="flex items-center gap-2 text-sm text-[#1B6B4A]/70 mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Deposited
            </div>
            <div className="text-2xl font-semibold text-[#1B6B4A]">
              {formatUSD(lifetime?.totalDeposited || 0)}
            </div>
            <div className="text-xs text-[#7C8A9E] mt-1">Lifetime deposits</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-6"
          >
            <div className="flex items-center gap-2 text-sm text-[#1B6B4A]/70 mb-1">
              <DollarSign className="h-4 w-4" />
              Total Fees
            </div>
            <div className="text-2xl font-semibold text-[#1B6B4A]">
              {formatUSD(lifetime?.totalFees || 0)}
            </div>
            <div className="text-xs text-[#7C8A9E] mt-1">1% platform fee</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Deposit + Fund */}
          <div className="lg:col-span-1 space-y-6">
            {/* Deposit Address */}
            {depositInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-6"
              >
                <h3 className="text-sm font-medium text-[#0C1829] mb-4">
                  Fund Your Balance
                </h3>
                <p className="text-xs text-[#7C8A9E] mb-3">
                  Send USDC to this address on Solana {depositInfo.cluster}:
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-3 py-2.5">
                  <code className="flex-1 text-xs text-[#3B4963] break-all font-mono">
                    {depositInfo.depositAddress}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="shrink-0 text-[#7C8A9E] hover:text-[#3B4963] transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-[#1B6B4A]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="mt-2 text-xs text-[#7C8A9E]">
                  Network: Solana • Token: USDC
                </div>
              </motion.div>
            )}

            {/* Record Deposit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-6"
            >
              <h3 className="text-sm font-medium text-[#0C1829] mb-4">
                Confirm Deposit
              </h3>
              <p className="text-xs text-[#7C8A9E] mb-4">
                After sending USDC, enter the transaction signature to credit
                your balance.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#7C8A9E] mb-1">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-3 py-2.5 text-sm text-[#0C1829] placeholder-[#7C8A9E] focus:border-[#3B82F6]/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7C8A9E] mb-1">
                    Transaction Signature
                  </label>
                  <input
                    type="text"
                    value={depositTx}
                    onChange={(e) => setDepositTx(e.target.value)}
                    placeholder="5Uh8..."
                    className="w-full rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-3 py-2.5 text-sm text-[#0C1829] placeholder-[#7C8A9E] focus:border-[#3B82F6]/50 focus:outline-none font-mono"
                  />
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount || !depositTx}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500/90 disabled:opacity-40 transition-colors"
                >
                  {depositing ? "Verifying..." : "Confirm Deposit"}
                </button>
                {depositSuccess && (
                  <p className="text-xs text-[#1B6B4A] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    {depositSuccess}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Transaction History */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-[#E2DFD5] bg-white/[0.02]"
            >
              <div className="border-b border-[#E2DFD5] px-6 py-4">
                <h3 className="text-sm font-medium text-[#0C1829]">
                  Transaction History
                </h3>
              </div>

              {transactions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Wallet className="mx-auto h-8 w-8 text-[#7C8A9E]/60 mb-3" />
                  <p className="text-sm text-[#7C8A9E]">No transactions yet</p>
                  <p className="text-xs text-[#7C8A9E]/70 mt-1">
                    Fund your balance to start sending payouts
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {transactions.map((tx) => {
                    const meta = TX_TYPE_LABELS[tx.type] || {
                      label: tx.type,
                      color: "text-[#3B4963]",
                      icon: DollarSign,
                    };
                    const Icon = meta.icon;
                    const isCredit = ["deposit", "payout_refund"].includes(
                      tx.type,
                    );

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                      >
                        <div
                          className={`rounded-lg p-2 ${
                            isCredit ? "bg-emerald-500/10" : "bg-[#F3F2ED]"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${meta.color}`}
                            >
                              {meta.label}
                            </span>
                            {tx.payoutId && (
                              <span className="text-xs text-[#7C8A9E]/70 truncate">
                                {tx.payoutId}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#7C8A9E] mt-0.5">
                            {tx.description || tx.type}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={`text-sm font-medium ${
                              isCredit ? "text-[#1B6B4A]" : "text-[#3B4963]"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatUSD(tx.amount)}
                          </div>
                          <div className="text-xs text-[#7C8A9E]/70">
                            {new Date(tx.createdAt).toLocaleDateString()}{" "}
                            {new Date(tx.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        {tx.txSignature && (
                          <a
                            href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7C8A9E]/60 hover:text-[#7C8A9E] transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
