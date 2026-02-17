"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PayoutInfo {
  id: string;
  amount: number;
  currency: string;
  memo?: string;
  status: string;
  expiresAt: string;
  senderName?: string;
}

type ClaimStep =
  | "loading"
  | "ready"
  | "wallet"
  | "claiming"
  | "success"
  | "error"
  | "expired";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string>("");
  const [step, setStep] = useState<ClaimStep>("loading");
  const [payout, setPayout] = useState<PayoutInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Unwrap params
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Fetch payout info
  useEffect(() => {
    if (!token) return;

    async function fetchPayout() {
      try {
        const res = await fetch(`/api/payouts/claim?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          if (data.error?.toLowerCase().includes("expired")) {
            setStep("expired");
          } else {
            setErrorMessage(data.error || "Payout not found");
            setStep("error");
          }
          return;
        }

        setPayout(data);
        setStep("ready");
      } catch {
        setErrorMessage("Failed to load payout. Please try again.");
        setStep("error");
      }
    }

    fetchPayout();
  }, [token]);

  // Claim the payout
  const claimPayout = useCallback(async () => {
    if (!walletAddress || !token) return;

    setStep("claiming");
    try {
      const res = await fetch("/api/payouts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, recipientWallet: walletAddress }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Claim failed");
        setStep("error");
        return;
      }

      setTxSignature(data.txSignature || "");
      setStep("success");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStep("error");
    }
  }, [walletAddress, token]);

  // Validate Solana address (base58 check)
  const isValidAddress =
    walletAddress.length >= 32 &&
    walletAddress.length <= 44 &&
    /^[1-9A-HJ-NP-Za-km-z]+$/.test(walletAddress);

  const expiresAt = payout?.expiresAt
    ? new Date(payout.expiresAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">settlr</span>
            <span className="text-blue-400">.</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Global Payout Infrastructure
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Loading payout details…</p>
              </motion.div>
            )}

            {/* Ready — show amount + enter wallet */}
            {step === "ready" && payout && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Amount header */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-b border-zinc-800 p-8 text-center">
                  <p className="text-zinc-400 text-sm mb-2">
                    You&apos;ve been sent
                  </p>
                  <div className="text-5xl font-bold text-white mb-1">
                    ${payout.amount.toFixed(2)}
                  </div>
                  <p className="text-blue-400 text-sm font-medium">USDC</p>
                  {payout.memo && (
                    <p className="text-zinc-500 text-sm mt-3 italic">
                      &ldquo;{payout.memo}&rdquo;
                    </p>
                  )}
                </div>

                {/* Wallet input */}
                <div className="p-6">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your Solana wallet address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value.trim())}
                    placeholder="e.g. 7xKX…mN4p"
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition font-mono text-sm"
                  />
                  {walletAddress && !isValidAddress && (
                    <p className="text-red-400 text-xs mt-2">
                      Please enter a valid Solana wallet address
                    </p>
                  )}

                  <button
                    onClick={() => {
                      if (isValidAddress) {
                        claimPayout();
                      }
                    }}
                    disabled={!isValidAddress}
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Claim ${payout.amount.toFixed(2)} USDC
                  </button>

                  {expiresAt && (
                    <p className="text-zinc-600 text-xs text-center mt-3">
                      Expires {expiresAt}
                    </p>
                  )}

                  <p className="text-zinc-600 text-xs text-center mt-4">
                    Don&apos;t have a wallet?{" "}
                    <a
                      href="https://phantom.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Get Phantom →
                    </a>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Claiming */}
            {step === "claiming" && (
              <motion.div
                key="claiming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-medium mb-1">
                  Processing your payout…
                </p>
                <p className="text-zinc-500 text-sm">
                  Sending USDC on-chain. This takes a few seconds.
                </p>
              </motion.div>
            )}

            {/* Success */}
            {step === "success" && payout && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Payout claimed!
                </h2>
                <p className="text-zinc-400 text-sm mb-4">
                  ${payout.amount.toFixed(2)} USDC has been sent to your wallet.
                </p>

                {txSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                  >
                    View on Solana Explorer
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </motion.div>
            )}

            {/* Expired */}
            {step === "expired" && (
              <motion.div
                key="expired"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Payout expired
                </h2>
                <p className="text-zinc-400 text-sm">
                  This payout link has expired. Please contact the sender to
                  request a new one.
                </p>
              </motion.div>
            )}

            {/* Error */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Something went wrong
                </h2>
                <p className="text-zinc-400 text-sm mb-4">{errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition cursor-pointer"
                >
                  Try again →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-6">
          Powered by{" "}
          <a
            href="https://settlr.dev"
            className="text-zinc-500 hover:text-zinc-400 transition"
          >
            Settlr
          </a>{" "}
          · Solana USDC
        </p>
      </motion.div>
    </div>
  );
}
