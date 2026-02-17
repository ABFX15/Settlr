"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Store,
  Check,
  Copy,
  Wallet,
  Building2,
  Key,
  ArrowRight,
  Loader2,
  LogIn,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type PayoutMethod = "wallet" | "exchange";

interface OnboardingState {
  step: 1 | 2 | 3 | 4;
  businessName: string;
  websiteUrl: string;
  payoutMethod: PayoutMethod;
  payoutAddress: string;
  webhookUrl: string;
  merchantId: string | null;
  apiKey: string | null;
  error: string | null;
}

export default function OnboardingPage() {
  const { authenticated, login, ready } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [state, setState] = useState<OnboardingState>({
    step: 1,
    businessName: "",
    websiteUrl: "",
    payoutMethod: "wallet",
    payoutAddress: "",
    webhookUrl: "",
    merchantId: null,
    apiKey: null,
    error: null,
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Auto-fill wallet address if connected
  useEffect(() => {
    if (
      connected &&
      publicKey &&
      state.payoutMethod === "wallet" &&
      !state.payoutAddress
    ) {
      setState((s) => ({ ...s, payoutAddress: publicKey }));
    }
  }, [connected, publicKey, state.payoutMethod, state.payoutAddress]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return state.businessName.trim().length >= 2;
      case 2:
        return isValidSolanaAddress(state.payoutAddress);
      case 3:
        return true; // Webhook is optional
      default:
        return false;
    }
  };

  const isValidSolanaAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setState((s) => ({ ...s, error: "Please fill in all required fields" }));
      return;
    }

    setLoading(true);
    setState((s) => ({ ...s, error: null }));

    try {
      const response = await fetch("/api/merchants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.businessName,
          websiteUrl: state.websiteUrl || null,
          walletAddress: state.payoutAddress,
          webhookUrl: state.webhookUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register merchant");
      }

      setState((s) => ({
        ...s,
        step: 4,
        merchantId: data.merchant.id,
        apiKey: data.apiKey,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Registration failed",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Not authenticated
  if (ready && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050507]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-[#a855f7]/10 flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Become a Merchant
          </h2>
          <p className="text-white/50 mb-6">
            Sign in to set up non-custodial payments. Full control of your funds
            — no middlemen.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#050507] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Continue
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050507]">
        <Loader2 className="w-8 h-8 text-[#a855f7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 pt-32 bg-[#050507]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#22d3ee] flex items-center justify-center mx-auto mb-6">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Merchant Onboarding
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Set up non-custodial payments. Funds settle directly to your wallet
            — instant and secure.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  state.step >= step
                    ? "bg-white text-white"
                    : "bg-white/[0.06] text-white/30"
                }`}
              >
                {state.step > step ? <Check className="w-5 h-5" /> : step}
              </div>
              {i < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    state.step > step ? "bg-[#22d3ee]" : "bg-white/[0.06]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{state.error}</p>
          </motion.div>
        )}

        {/* Step 1: Business Info */}
        {state.step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#a855f7]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Business Information
                </h2>
                <p className="text-white/30 text-sm">
                  Tell us about your business
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={state.businessName}
                  onChange={(e) =>
                    setState((s) => ({ ...s, businessName: e.target.value }))
                  }
                  placeholder="Your Company Name"
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={state.websiteUrl}
                  onChange={(e) =>
                    setState((s) => ({ ...s, websiteUrl: e.target.value }))
                  }
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                />
                <p className="text-xs text-white/30 mt-1">
                  Optional — helps us verify your business
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() =>
                  validateStep(1) && setState((s) => ({ ...s, step: 2 }))
                }
                disabled={!validateStep(1)}
                className="flex items-center gap-2 px-6 py-3 bg-[#050507] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Payout Settings */}
        {state.step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#22d3ee]/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#22d3ee]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Payout Settings
                </h2>
                <p className="text-white/30 text-sm">
                  Where should we send your payments?
                </p>
              </div>
            </div>

            {/* Payout Method Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    payoutMethod: "wallet",
                    payoutAddress: publicKey || "",
                  }))
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  state.payoutMethod === "wallet"
                    ? "border-[#a855f7] bg-[#a855f7]/10"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
              >
                <Wallet
                  className={`w-6 h-6 mx-auto mb-2 ${
                    state.payoutMethod === "wallet"
                      ? "text-[#a855f7]"
                      : "text-white/50"
                  }`}
                />
                <p
                  className={`font-medium ${
                    state.payoutMethod === "wallet"
                      ? "text-white"
                      : "text-white/50"
                  }`}
                >
                  Solana Wallet
                </p>
                <p className="text-xs text-white/30 mt-1">
                  Receive USDC directly
                </p>
              </button>

              <button
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    payoutMethod: "exchange",
                    payoutAddress: "",
                  }))
                }
                className={`p-4 rounded-xl border-2 transition-all ${
                  state.payoutMethod === "exchange"
                    ? "border-[#22d3ee] bg-[#22d3ee]/10"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
              >
                <Building2
                  className={`w-6 h-6 mx-auto mb-2 ${
                    state.payoutMethod === "exchange"
                      ? "text-[#22d3ee]"
                      : "text-white/50"
                  }`}
                />
                <p
                  className={`font-medium ${
                    state.payoutMethod === "exchange"
                      ? "text-white"
                      : "text-white/50"
                  }`}
                >
                  Exchange Address
                </p>
                <p className="text-xs text-white/30 mt-1">
                  Coinbase, Kraken, etc.
                </p>
              </button>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {state.payoutMethod === "wallet"
                  ? "Wallet Address *"
                  : "Exchange Deposit Address *"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={state.payoutAddress}
                  onChange={(e) =>
                    setState((s) => ({ ...s, payoutAddress: e.target.value }))
                  }
                  placeholder={
                    state.payoutMethod === "wallet"
                      ? "Your Solana wallet address"
                      : "Your Coinbase/Kraken USDC deposit address"
                  }
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 font-mono text-sm"
                />
                {connected && state.payoutMethod === "wallet" && (
                  <button
                    onClick={() =>
                      publicKey &&
                      setState((s) => ({ ...s, payoutAddress: publicKey }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#22d3ee] hover:text-white transition-colors"
                  >
                    Use connected wallet
                  </button>
                )}
              </div>
              {state.payoutAddress &&
                !isValidSolanaAddress(state.payoutAddress) && (
                  <p className="text-red-400 text-sm mt-2">
                    Invalid Solana address
                  </p>
                )}
              {state.payoutMethod === "exchange" && (
                <p className="text-white/30 text-xs mt-2">
                  💡 Tip: Use your exchange&apos;s Solana USDC deposit address.
                  Funds will auto-convert if your exchange supports it.
                </p>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setState((s) => ({ ...s, step: 1 }))}
                className="px-6 py-3 text-white/50 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() =>
                  validateStep(2) && setState((s) => ({ ...s, step: 3 }))
                }
                disabled={!validateStep(2)}
                className="flex items-center gap-2 px-6 py-3 bg-[#050507] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Webhook (Optional) */}
        {state.step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Webhook URL
                </h2>
                <p className="text-white/30 text-sm">
                  Optional: Get notified of payments
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Webhook Endpoint (Optional)
              </label>
              <input
                type="url"
                value={state.webhookUrl}
                onChange={(e) =>
                  setState((s) => ({ ...s, webhookUrl: e.target.value }))
                }
                placeholder="https://yoursite.com/api/webhooks/settlr"
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
              />
              <p className="text-white/30 text-xs mt-2">
                We&apos;ll POST payment events to this URL. You can configure
                this later in your dashboard.
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setState((s) => ({ ...s, step: 2 }))}
                className="px-6 py-3 text-white/50 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#050507] text-white font-semibold rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {state.step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[#050507] flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                You&apos;re All Set! 🎉
              </h2>
              <p className="text-white/50">
                Your merchant account has been created. Save your API key below.
              </p>
            </div>

            {/* API Key */}
            <div className="bg-white/[0.06] rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/70">
                  Your API Key
                </span>
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                  Save this now - shown only once
                </span>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 p-3 bg-white/[0.03] rounded-lg text-[#22d3ee] font-mono text-sm break-all">
                  {state.apiKey}
                </code>
                <button
                  onClick={() =>
                    state.apiKey && copyToClipboard(state.apiKey, "apiKey")
                  }
                  className="p-3 bg-white/[0.08] rounded-lg hover:bg-white/[0.12] transition-colors"
                >
                  {copied === "apiKey" ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-white/70" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Start Code */}
            <div className="bg-white/[0.06] rounded-xl p-6 mb-6">
              <h3 className="text-sm font-medium text-white/70 mb-3">
                Quick Start
              </h3>
              <pre className="bg-white/[0.03] rounded-lg p-4 text-sm overflow-x-auto">
                <code className="text-white/70">
                  {`npm install @settlr/sdk

import { Settlr } from '@settlr/sdk';

const settlr = new Settlr({
  apiKey: '${state.apiKey?.slice(0, 12)}...',
  merchant: {
    name: '${state.businessName}',
  }
});

// Create a payment
const payment = await settlr.createPayment({
  amount: 29.99,
  successUrl: 'https://yoursite.com/success',
});

// Redirect to checkout
window.location.href = payment.checkoutUrl;`}
                </code>
              </pre>
            </div>

            {/* Next Steps */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 p-4 bg-white/[0.06] rounded-xl hover:bg-white/[0.08] transition-colors"
              >
                <Store className="w-5 h-5 text-[#a855f7]" />
                <span className="text-white font-medium">Go to Dashboard</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center justify-center gap-2 p-4 bg-white/[0.06] rounded-xl hover:bg-white/[0.08] transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-[#22d3ee]" />
                <span className="text-white font-medium">View Docs</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
