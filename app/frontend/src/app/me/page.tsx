"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecipientProfile {
  id: string;
  email: string;
  walletAddress: string;
  displayName?: string;
  notificationsEnabled: boolean;
  autoWithdraw: boolean;
  totalReceived: number;
  totalPayouts: number;
  createdAt: string;
  lastPayoutAt?: string;
}

interface PayoutRecord {
  id: string;
  amount: number;
  currency: string;
  memo?: string;
  status: string;
  txSignature?: string;
  createdAt: string;
  claimedAt?: string;
}

interface BalanceInfo {
  currency: string;
  amount: number;
}

type DashboardStep =
  | "email"
  | "check-email"
  | "loading"
  | "dashboard"
  | "error";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function RecipientDashboard() {
  const [step, setStep] = useState<DashboardStep>("email");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<RecipientProfile | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingWallet, setEditingWallet] = useState(false);
  const [newWallet, setNewWallet] = useState("");
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Check for magic link token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      validateToken(token);
    }
  }, []);

  async function validateToken(token: string) {
    setStep("loading");
    try {
      const res = await fetch(`/api/recipients/auth?token=${token}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Invalid or expired link");
        setStep("error");
        return;
      }
      // Store email for subsequent requests
      setEmail(data.email);
      sessionStorage.setItem("settlr_recipient_email", data.email);
      // Clean URL
      window.history.replaceState({}, "", "/me");
      await loadDashboard(data.email);
    } catch {
      setErrorMessage("Failed to validate link");
      setStep("error");
    }
  }

  async function requestMagicLink() {
    if (!email || !email.includes("@")) return;
    try {
      const res = await fetch("/api/recipients/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep("check-email");
      }
    } catch {
      setErrorMessage("Failed to send sign-in link");
      setStep("error");
    }
  }

  const loadDashboard = useCallback(async (recipientEmail: string) => {
    setStep("loading");
    try {
      const res = await fetch("/api/recipients/me", {
        headers: { "x-recipient-email": recipientEmail },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to load dashboard");
        setStep("error");
        return;
      }
      setProfile(data.profile);
      setPayouts(data.payouts || []);
      setBalance(data.balance || null);
      setStep("dashboard");
    } catch {
      setErrorMessage("Failed to load dashboard");
      setStep("error");
    }
  }, []);

  // Check for stored session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("settlr_recipient_email");
    if (stored && step === "email") {
      setEmail(stored);
      loadDashboard(stored);
    }
  }, [step, loadDashboard]);

  async function updatePreferences(updates: Record<string, unknown>) {
    if (!email) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recipients/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-recipient-email": email,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, ...data } : prev));
        setEditingWallet(false);
      }
    } catch {
      // Silently fail preference update
    } finally {
      setSaving(false);
    }
  }

  async function handleWithdraw() {
    if (!email || !balance || balance.amount <= 0) return;
    setWithdrawing(true);
    try {
      const res = await fetch("/api/recipients/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-recipient-email": email,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setBalance({ currency: "USDC", amount: data.remainingBalance });
        // Refresh dashboard
        await loadDashboard(email);
      }
    } catch {
      // Silently fail
    } finally {
      setWithdrawing(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem("settlr_recipient_email");
    setStep("email");
    setProfile(null);
    setPayouts([]);
    setBalance(null);
    setEmail("");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-start justify-center pt-12 px-4 pb-20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-semibold">Settlr</h1>
          </div>
          {step === "dashboard" && (
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-300 transition"
            >
              Sign out
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Email input step ── */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Recipient Dashboard</h2>
              <p className="text-gray-400 mb-8">
                Sign in with the email you received payouts on.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && requestMagicLink()}
                  placeholder="you@example.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={requestMagicLink}
                  disabled={!email.includes("@")}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-medium px-6 py-3 rounded-lg transition"
                >
                  Sign in
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Check email step ── */}
          {step === "check-email" && (
            <motion.div
              key="check-email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-gray-400 mb-4">
                We sent a sign-in link to{" "}
                <strong className="text-white">{email}</strong>
              </p>
              <p className="text-gray-500 text-sm">
                The link expires in 15 minutes. Check your spam folder if you
                don't see it.
              </p>
              <button
                onClick={() => setStep("email")}
                className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition"
              >
                ← Use a different email
              </button>
            </motion.div>
          )}

          {/* ── Loading step ── */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading your dashboard…</p>
            </motion.div>
          )}

          {/* ── Error step ── */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <button
                onClick={() => setStep("email")}
                className="text-blue-400 hover:text-blue-300 transition text-sm"
              >
                ← Try again
              </button>
            </motion.div>
          )}

          {/* ── Dashboard ── */}
          {step === "dashboard" && profile && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                    Total received
                  </p>
                  <p className="text-2xl font-bold">
                    ${profile.totalReceived.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                    Payouts
                  </p>
                  <p className="text-2xl font-bold">{profile.totalPayouts}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                    Balance
                  </p>
                  <p className="text-2xl font-bold">
                    ${balance?.amount.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              {/* Balance card + withdraw */}
              {balance && balance.amount > 0 && (
                <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Available balance</p>
                      <p className="text-3xl font-bold">
                        ${balance.amount.toFixed(2)}{" "}
                        <span className="text-base font-normal text-gray-400">
                          USDC
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition"
                    >
                      {withdrawing ? "Withdrawing…" : "Withdraw all"}
                    </button>
                  </div>
                </div>
              )}

              {/* Settings card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-lg">Settings</h3>

                {/* Wallet */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Wallet address
                  </label>
                  {editingWallet ? (
                    <div className="flex gap-2">
                      <input
                        value={newWallet}
                        onChange={(e) => setNewWallet(e.target.value)}
                        placeholder="Solana wallet address"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                      />
                      <button
                        onClick={() =>
                          updatePreferences({ walletAddress: newWallet })
                        }
                        disabled={saving || newWallet.length < 32}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                      >
                        {saving ? "…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingWallet(false)}
                        className="text-gray-500 hover:text-gray-300 text-sm px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg">
                        {profile.walletAddress
                          ? `${profile.walletAddress.slice(
                              0,
                              6,
                            )}...${profile.walletAddress.slice(-4)}`
                          : "Not set"}
                      </code>
                      <button
                        onClick={() => {
                          setNewWallet(profile.walletAddress || "");
                          setEditingWallet(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm transition"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Instant delivery</p>
                    <p className="text-xs text-gray-500">
                      Auto-send payouts to your saved wallet
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updatePreferences({ autoWithdraw: !profile.autoWithdraw })
                    }
                    className={`w-11 h-6 rounded-full transition ${
                      profile.autoWithdraw ? "bg-blue-500" : "bg-white/10"
                    } relative`}
                  >
                    <span
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                        profile.autoWithdraw ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email notifications</p>
                    <p className="text-xs text-gray-500">
                      Get notified when you receive payouts
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updatePreferences({
                        notificationsEnabled: !profile.notificationsEnabled,
                      })
                    }
                    className={`w-11 h-6 rounded-full transition ${
                      profile.notificationsEnabled
                        ? "bg-blue-500"
                        : "bg-white/10"
                    } relative`}
                  >
                    <span
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                        profile.notificationsEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Payout history */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4">Payout History</h3>
                {payouts.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">
                    No payouts yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {payouts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            ${p.amount.toFixed(2)}{" "}
                            <span className="text-sm text-gray-400">
                              {p.currency}
                            </span>
                          </p>
                          {p.memo && (
                            <p className="text-xs text-gray-500">{p.memo}</p>
                          )}
                          <p className="text-xs text-gray-600">
                            {new Date(p.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "claimed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : p.status === "sent"
                                ? "bg-amber-500/20 text-amber-400"
                                : p.status === "expired"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-white/10 text-gray-400"
                            }`}
                          >
                            {p.status}
                          </span>
                          {p.txSignature &&
                            !p.txSignature.startsWith("demo") && (
                              <a
                                href={`https://explorer.solana.com/tx/${p.txSignature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-400 hover:text-blue-300 mt-1"
                              >
                                View tx ↗
                              </a>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <p className="text-center text-gray-600 text-xs">
                Powered by{" "}
                <a
                  href="https://settlr.dev"
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  Settlr
                </a>{" "}
                — global payout infrastructure
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
