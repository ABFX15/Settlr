"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Key,
  LogIn,
  RefreshCw,
  Loader2,
  X,
  ChevronRight,
  Download,
  Activity,
  BarChart3,
  ArrowDownToLine,
} from "lucide-react";
import Link from "next/link";
import { Transaction } from "@solana/web3.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TreasuryData {
  treasuryBalance: number;
  treasuryBalanceRaw: string;
  platformConfig: {
    authority: string;
    feeBps: number;
    isActive: boolean;
    totalVolume: string;
    totalFees: string;
    usdcMint: string;
  } | null;
  treasuryPDA: string;
  configPDA: string;
  programId: string;
  cluster: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatLamports(lamports: string): string {
  const n = parseInt(lamports, 10);
  if (isNaN(n)) return "$0.00";
  return formatUSD(n / 1_000_000); // USDC has 6 decimals
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { ready, authenticated, login } = usePrivy();
  const { solanaWallet, publicKey, connected } = useActiveWallet();
  const { connection } = useConnection();

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [data, setData] = useState<TreasuryData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [claimTxSig, setClaimTxSig] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Fetch on-chain data ──────────────────────────────────────────────
  const fetchTreasuryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/treasury");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json: TreasuryData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Failed to fetch treasury data:", err);
      setError(err.message || "Failed to load platform data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTreasuryData();
  }, [fetchTreasuryData]);

  // ── Claim fees ───────────────────────────────────────────────────────
  const handleClaimFees = async () => {
    if (!publicKey || !solanaWallet) {
      setError("Connect your wallet first");
      return;
    }

    setClaiming(true);
    setError(null);
    setSuccess(null);
    setClaimTxSig(null);

    try {
      // 1. Ask server to build the unsigned transaction
      const res = await fetch("/api/admin/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authority: publicKey }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to build claim tx");

      // 2. Deserialize the transaction
      const txBuffer = Buffer.from(body.transaction, "base64");
      const tx = Transaction.from(txBuffer);

      // 3. Sign with connected wallet via Privy
      const signedTx = await (solanaWallet as any).signTransaction(tx);

      // 4. Send the signed transaction
      const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      // 5. Confirm
      await connection.confirmTransaction(sig, "confirmed");

      setClaimTxSig(sig);
      setSuccess(
        `Claimed ${formatUSD(body.amount)} USDC! Funds sent to your wallet.`,
      );

      // Refresh data
      fetchTreasuryData();
    } catch (err: any) {
      console.error("Claim error:", err);
      if (err.message?.includes("User rejected")) {
        setError("Transaction cancelled by user");
      } else if (err.message?.includes("Unauthorized")) {
        setError("Your wallet is not the platform authority");
      } else {
        setError(err.message || "Failed to claim fees");
      }
    } finally {
      setClaiming(false);
    }
  };

  const isAuthority =
    publicKey && data?.platformConfig?.authority === publicKey;

  const explorerBase =
    data?.cluster === "mainnet-beta"
      ? "https://explorer.solana.com"
      : "https://explorer.solana.com";
  const clusterParam =
    data?.cluster === "mainnet-beta"
      ? ""
      : `?cluster=${data?.cluster || "devnet"}`;

  // ── Loading / not ready ───────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#a78bfa]" />
      </div>
    );
  }

  // ── Not authenticated — show connect prompt ──────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050507]">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#a78bfa]/10 flex items-center justify-center border border-[#a78bfa]/20">
              <Key className="w-10 h-10 text-[#a78bfa]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Platform Owner Dashboard
            </h1>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Connect the platform authority wallet to view treasury balance and
              claim accumulated fees.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-[#a78bfa] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#9371e8] transition-all"
            >
              <LogIn className="w-5 h-5" />
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Authenticated but wallet still loading ───────────────────────────
  if (!publicKey) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#a78bfa] mx-auto mb-4" />
          <p className="text-white/50">Loading wallet...</p>
        </div>
      </div>
    );
  }

  // ── Main dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050507]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#a78bfa] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#a78bfa]">
                Settlr Admin
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchTreasuryData}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 text-white/50 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Wallet className="w-4 h-4 text-[#a78bfa]" />
              <span className="text-sm text-white/70">
                {shortenAddress(publicKey!)}
              </span>
              {isAuthority && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  Authority
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <X className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-red-300 flex-1">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-green-300 flex-1">{success}</span>
                <button onClick={() => setSuccess(null)} className="ml-auto">
                  <X className="w-4 h-4 text-green-400" />
                </button>
              </div>
              {claimTxSig && (
                <a
                  href={`${explorerBase}/tx/${claimTxSig}${clusterParam}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 ml-8 text-sm text-green-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on Explorer
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authority Warning */}
        {data?.platformConfig && !isAuthority && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Read-Only Mode
                </h2>
                <p className="text-sm text-white/50 mb-2">
                  Your wallet is not the platform authority. You can view
                  treasury data but cannot claim fees.
                </p>
                <p className="text-xs text-white/30">
                  Authority:{" "}
                  <code className="bg-white/10 px-1.5 py-0.5 rounded">
                    {data.platformConfig.authority}
                  </code>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Treasury Balance + Claim */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-[#a78bfa]/[0.06] border border-[#a78bfa]/20 p-6 md:col-span-2"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#a78bfa]/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-[#a78bfa]/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#a78bfa]" />
                </div>
                <div>
                  <p className="text-sm text-white/50">Treasury Balance</p>
                  {loading ? (
                    <div className="h-8 w-32 bg-white/10 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-white">
                      {formatUSD(data?.treasuryBalance ?? 0)}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-white/30 mb-5 ml-15">
                USDC accumulated from platform fees
              </p>

              <button
                onClick={handleClaimFees}
                disabled={
                  claiming ||
                  loading ||
                  !isAuthority ||
                  (data?.treasuryBalance ?? 0) === 0
                }
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isAuthority && (data?.treasuryBalance ?? 0) > 0
                    ? "bg-[#a78bfa] text-white hover:bg-[#9371e8] cursor-pointer"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                {claiming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    {isAuthority
                      ? `Claim ${formatUSD(
                          data?.treasuryBalance ?? 0,
                        )} to Wallet`
                      : "Connect Authority Wallet to Claim"}
                  </>
                )}
              </button>
              {isAuthority && (data?.treasuryBalance ?? 0) > 0 && (
                <p className="text-xs text-white/30 mt-2 text-center">
                  Signs a transaction to transfer USDC from treasury PDA to your
                  wallet
                </p>
              )}
            </div>
          </motion.div>

          {/* Platform Fee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Platform Fee</p>
                {loading ? (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {data?.platformConfig
                      ? `${(data.platformConfig.feeBps / 100).toFixed(1)}%`
                      : "—"}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-white/30">
              Fee collected from each payment
            </p>
          </motion.div>

          {/* Platform Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/5 border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  data?.platformConfig?.isActive
                    ? "bg-green-500/20"
                    : "bg-red-500/20"
                }`}
              >
                <Activity
                  className={`w-6 h-6 ${
                    data?.platformConfig?.isActive
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-white/50">Status</p>
                {loading ? (
                  <div className="h-8 w-20 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {data?.platformConfig?.isActive ? "Active" : "Inactive"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  data?.platformConfig?.isActive ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
              />
              <span className="text-sm text-white/30">
                {data?.platformConfig?.isActive
                  ? "Processing payments"
                  : "Payments paused"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Lifetime Stats */}
        {data?.platformConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-[#a78bfa]" />
                <span className="text-sm text-white/50">
                  Lifetime Volume (on-chain)
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatLamports(data.platformConfig.totalVolume)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-white/50">
                  Lifetime Fees Collected (on-chain)
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatLamports(data.platformConfig.totalFees)}
              </p>
            </div>
          </motion.div>
        )}

        {/* On-Chain Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#a78bfa]" />
            On-Chain Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Platform Authority",
                value: data?.platformConfig?.authority || "Loading...",
                id: "authority",
              },
              {
                label: "Treasury PDA",
                value: data?.treasuryPDA || "Loading...",
                id: "treasury",
              },
              {
                label: "USDC Mint",
                value: data?.platformConfig?.usdcMint || "Loading...",
                id: "mint",
              },
              {
                label: "Program ID",
                value: data?.programId || "Loading...",
                id: "program",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-black/30 border border-white/5"
              >
                <span className="text-sm text-white/50 block mb-2">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-white font-mono flex-1 truncate">
                    {item.value}
                  </code>
                  <button
                    onClick={() => copyToClipboard(item.value, item.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                    title="Copy"
                  >
                    {copied === item.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/50" />
                    )}
                  </button>
                  <a
                    href={`${explorerBase}/address/${item.value}${clusterParam}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-white/50" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Link
            href="/dashboard"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-white/50" />
              <span className="text-white">Merchant Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/docs"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-white/50" />
              <span className="text-white">API Documentation</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={`${explorerBase}/address/${
              data?.programId || ""
            }${clusterParam}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-white/50" />
              <span className="text-white">Program on Explorer</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </main>
    </div>
  );
}
