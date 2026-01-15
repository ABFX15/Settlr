"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface PrivateDashboardData {
  encryptedTotalRevenueHandle: string;
  encryptedTotalPayoutsHandle: string;
  transactionCount: number;
  payoutCount: number;
  activeSubscriptions: number;
  privacyMode: {
    individualAmountsHidden: boolean;
    aggregatesOnly: boolean;
    decryptionAvailable: boolean;
  };
  lastUpdated: string;
}

interface PrivateDashboardProps {
  merchantId: string;
  merchantWallet?: string;
}

export default function PrivateDashboard({
  merchantId,
  merchantWallet,
}: PrivateDashboardProps) {
  const [data, setData] = useState<PrivateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [privacyModeEnabled, setPrivacyModeEnabled] = useState(true);
  const [decryptedRevenue, setDecryptedRevenue] = useState<number | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/privacy/dashboard?merchantId=${merchantId}`
      );
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to load dashboard");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDecrypt = async () => {
    if (!data || !merchantWallet) return;

    setDecrypting(true);
    try {
      const response = await fetch("/api/privacy/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: data.encryptedTotalRevenueHandle,
          signature: "demo_signature", // In production: actual wallet signature
          merchantWallet,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setDecryptedRevenue(result.data.decryptedAmount);
      }
    } catch (err) {
      console.error("Decryption failed:", err);
    } finally {
      setDecrypting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 text-sm text-red-400 hover:text-red-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            {privacyModeEnabled ? (
              <ShieldCheck className="h-5 w-5 text-purple-400" />
            ) : (
              <Shield className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">Privacy Mode</h3>
            <p className="text-sm text-gray-400">
              {privacyModeEnabled
                ? "Individual amounts hidden • Aggregates only"
                : "Full transparency enabled"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setPrivacyModeEnabled(!privacyModeEnabled)}
          className={`relative h-8 w-14 rounded-full transition-colors ${
            privacyModeEnabled ? "bg-purple-500" : "bg-gray-600"
          }`}
        >
          <motion.div
            animate={{ x: privacyModeEnabled ? 24 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-md"
          />
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Revenue</span>
            {privacyModeEnabled ? (
              <Lock className="h-4 w-4 text-purple-400" />
            ) : (
              <Unlock className="h-4 w-4 text-green-400" />
            )}
          </div>

          <AnimatePresence mode="wait">
            {privacyModeEnabled && decryptedRevenue === null ? (
              <motion.div
                key="encrypted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <EyeOff className="h-5 w-5 text-gray-500" />
                  <span className="font-mono text-lg text-gray-500">
                    ••••••••
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Encrypted (handle:{" "}
                  {data?.encryptedTotalRevenueHandle.slice(0, 10)}...)
                </p>
                {merchantWallet && (
                  <button
                    onClick={handleDecrypt}
                    disabled={decrypting}
                    className="mt-2 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    {decrypting ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    {decrypting ? "Decrypting..." : "Decrypt"}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="decrypted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-baseline gap-1"
              >
                <span className="text-3xl font-bold text-white">
                  ${decryptedRevenue?.toLocaleString() || "12,450"}
                </span>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Total Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Payouts</span>
            {privacyModeEnabled ? (
              <Lock className="h-4 w-4 text-purple-400" />
            ) : (
              <Unlock className="h-4 w-4 text-green-400" />
            )}
          </div>

          {privacyModeEnabled ? (
            <div className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-gray-500" />
              <span className="font-mono text-lg text-gray-500">••••••••</span>
            </div>
          ) : (
            <span className="text-3xl font-bold text-white">$8,230</span>
          )}
        </motion.div>

        {/* Transaction Count (Public) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">Transactions</span>
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
              Public
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {data?.transactionCount || 147}
            </span>
            <span className="flex items-center text-sm text-green-400">
              <ArrowUpRight className="h-4 w-4" />
              12%
            </span>
          </div>
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-400">Active Subscriptions</span>
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
              Private Pricing
            </span>
          </div>
          <span className="text-3xl font-bold text-white">
            {data?.activeSubscriptions || 23}
          </span>
        </motion.div>
      </div>

      {/* Privacy Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-white">
              Confidential Commerce Enabled
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Your payment amounts are encrypted using Inco FHE (Fully
              Homomorphic Encryption). Competitors cannot see your revenue or
              transaction amounts on-chain.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                FHE Encrypted Amounts
              </span>
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
                Selective Decryption
              </span>
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
                Range Proofs for Compliance
              </span>
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">
                Inco Covalidators
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        Last updated:{" "}
        {data?.lastUpdated
          ? new Date(data.lastUpdated).toLocaleString()
          : "Just now"}
      </div>
    </div>
  );
}
