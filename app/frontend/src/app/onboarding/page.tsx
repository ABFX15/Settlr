"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useSignTransaction } from "@privy-io/react-auth/solana";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { buildCreateVaultTransaction, shortenAddress } from "@/lib/squads";
import {
  Store,
  Check,
  Copy,
  Wallet,
  Building2,
  Key,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  AlertCircle,
  ExternalLink,
  Lock,
  Users,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Design tokens ────────────────────────────────────────
const c = {
  bg: "#FDFBF7",
  card: "#F3F2ED",
  navy: "#0C1829",
  slate: "#3B4963",
  muted: "#7C8A9E",
  border: "#E2DFD5",
  green: "#1B6B4A",
  greenBg: "rgba(27,107,74,0.06)",
  red: "#dc2626",
};

const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5;
  businessName: string;
  websiteUrl: string;
  licenseNumber: string;
  webhookUrl: string;
  // Vault state
  vaultPda: string | null;
  multisigPda: string | null;
  // Registration
  merchantId: string | null;
  apiKey: string | null;
  error: string | null;
}

export default function OnboardingPage() {
  const { authenticated, login, ready } = usePrivy();
  const { publicKey, connected, wallet } = useActiveWallet();
  const { signTransaction: privySignTransaction } = useSignTransaction();

  const [state, setState] = useState<OnboardingState>({
    step: 1,
    businessName: "",
    websiteUrl: "",
    licenseNumber: "",
    webhookUrl: "",
    vaultPda: null,
    multisigPda: null,
    merchantId: null,
    apiKey: null,
    error: null,
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // ─── Validation ────────────────────────────────────────
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return connected && !!publicKey;
      case 2:
        return state.businessName.trim().length >= 2;
      case 3:
        return true; // Vault creation (button action, not field validation)
      case 4:
        return true; // Webhook is optional
      default:
        return false;
    }
  };

  // ─── Vault Creation ────────────────────────────────────
  const handleCreateVault = async () => {
    if (!publicKey || !wallet) {
      setState((s) => ({ ...s, error: "Wallet not connected" }));
      return;
    }

    setLoading(true);
    setState((s) => ({ ...s, error: null }));

    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const creatorPubkey = new PublicKey(publicKey);

      // Build the Squads vault creation transaction
      const { multisigPda, vaultPda, transaction } =
        await buildCreateVaultTransaction(creatorPubkey, connection);

      // Serialize the partially-signed transaction (createKey already signed)
      // and use Privy's useSignTransaction hook which works with all wallet types
      const txBytes = new Uint8Array(
        transaction.serialize({ requireAllSignatures: false }),
      );
      const { signedTransaction } = await privySignTransaction({
        transaction: txBytes,
        wallet: wallet as any,
      });
      const signature = await connection.sendRawTransaction(signedTransaction);

      // Confirm
      await connection.confirmTransaction(
        {
          signature,
          blockhash: transaction.recentBlockhash!,
          lastValidBlockHeight: transaction.lastValidBlockHeight!,
        },
        "confirmed",
      );

      setState((s) => ({
        ...s,
        vaultPda: vaultPda.toBase58(),
        multisigPda: multisigPda.toBase58(),
        step: 4,
      }));
    } catch (err) {
      console.error("Vault creation failed:", err);
      setState((s) => ({
        ...s,
        error:
          err instanceof Error
            ? err.message
            : "Vault creation failed. Make sure you have SOL for rent.",
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign a transaction using the connected wallet.
   * Works with both Privy embedded wallets and external wallets (Phantom/Solflare).
   */
  const signTransaction = async (tx: Transaction): Promise<Transaction> => {
    if (!wallet) throw new Error("No wallet connected");

    // Privy wallet adapter approach
    const provider = await (wallet as any).getProvider?.();
    if (provider && provider.signTransaction) {
      return provider.signTransaction(tx);
    }

    // Fallback: try standard wallet adapter
    if ((wallet as any).signTransaction) {
      return (wallet as any).signTransaction(tx);
    }

    throw new Error(
      "Wallet does not support transaction signing. Please use Phantom or Solflare.",
    );
  };

  // ─── Register Merchant (API + on-chain) ────────────────
  const handleRegister = async () => {
    if (!publicKey || !state.vaultPda) {
      setState((s) => ({ ...s, error: "Vault not created" }));
      return;
    }

    setLoading(true);
    setState((s) => ({ ...s, error: null }));

    try {
      const response = await fetch("/api/merchants/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.businessName.trim(),
          websiteUrl: state.websiteUrl || null,
          walletAddress: state.vaultPda, // Vault PDA is the settlement address
          webhookUrl: state.webhookUrl || null,
          multisigPda: state.multisigPda,
          signerWallet: publicKey, // Personal wallet for auth lookups
          licenseNumber: state.licenseNumber || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register merchant");
      }

      // ─── Persist to localStorage so dashboard can find this data ───
      // Vault PDA keyed by signer wallet (for merchant dashboard vault fetch)
      if (state.multisigPda) {
        localStorage.setItem(`settlr_vault_${publicKey}`, state.multisigPda);
      }
      // Merchant ID keyed by signer wallet (for API keys, payments, etc.)
      if (data.merchant?.id) {
        localStorage.setItem(
          `settlr_merchant_id_${publicKey}`,
          data.merchant.id,
        );
      }
      // Store the vault PDA as settlement address
      if (state.vaultPda) {
        localStorage.setItem(`settlr_vault_pda_${publicKey}`, state.vaultPda);
      }

      setState((s) => ({
        ...s,
        step: 5,
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

  // ─── Not authenticated ─────────────────────────────────
  if (ready && !authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: c.bg }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-10 text-center max-w-lg"
          style={{ background: c.card, borderColor: c.border }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: c.greenBg }}
          >
            <Shield className="w-10 h-10" style={{ color: c.green }} />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: c.navy }}>
            Merchant Onboarding
          </h2>
          <p className="mb-2 text-lg" style={{ color: c.slate }}>
            Institutional-grade treasury for cannabis wholesalers.
          </p>
          <p className="mb-8 text-sm" style={{ color: c.muted }}>
            Every merchant gets a Squads multisig vault. Non-custodial.
            Multi-party signing. Full audit trail.
          </p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {[
              ["/circle-logo.svg", "USDC"],
              ["/solana-logo.svg", "Solana"],
              ["/squads-logo.png", "Squads"],
            ].map(([src, label]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Image
                  src={src}
                  alt={label}
                  width={28}
                  height={28}
                  className="opacity-50"
                />
                <span className="text-[10px]" style={{ color: c.muted }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={login}
            className="inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: c.green }}
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet to Start
          </button>
          <p className="mt-4 text-xs" style={{ color: c.muted }}>
            Phantom · Solflare · Backpack · Hardware wallets supported
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Loading ───────────────────────────────────────────
  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: c.bg }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: c.green }} />
      </div>
    );
  }

  // ─── Step definitions ──────────────────────────────────
  const steps = [
    { num: 1, label: "Wallet", icon: Wallet },
    { num: 2, label: "Business", icon: Building2 },
    { num: 3, label: "Vault", icon: Shield },
    { num: 4, label: "Settings", icon: Key },
    { num: 5, label: "Complete", icon: Check },
  ];

  return (
    <div className="min-h-screen py-12 px-4 pt-32" style={{ background: c.bg }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: c.greenBg }}
          >
            <Shield className="w-8 h-8" style={{ color: c.green }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: c.navy }}>
            Merchant Onboarding
          </h1>
          <p className="text-base" style={{ color: c.muted }}>
            Set up your Squads vault and start accepting non-custodial payments.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all"
                  style={{
                    background: state.step >= step.num ? c.green : c.card,
                    color: state.step >= step.num ? "#fff" : c.muted,
                    border: `2px solid ${
                      state.step >= step.num ? c.green : c.border
                    }`,
                  }}
                >
                  {state.step > step.num ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className="text-[10px] mt-1 font-medium"
                  style={{
                    color: state.step >= step.num ? c.green : c.muted,
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-10 h-0.5 mx-1.5 rounded"
                  style={{
                    background: state.step > step.num ? c.green : c.border,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl flex items-start gap-3 border"
              style={{
                background: "rgba(220,38,38,0.05)",
                borderColor: "rgba(220,38,38,0.2)",
              }}
            >
              <AlertCircle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: c.red }}
              />
              <div>
                <p className="text-sm font-medium" style={{ color: c.red }}>
                  {state.error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 1 — Connect Wallet              */}
        {/* ═══════════════════════════════════════ */}
        {state.step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border p-8"
            style={{ background: c.card, borderColor: c.border }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: c.greenBg }}
              >
                <Wallet className="w-5 h-5" style={{ color: c.green }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: c.navy }}>
                  Connect Your Wallet
                </h2>
                <p className="text-sm" style={{ color: c.muted }}>
                  This wallet becomes the primary signer on your vault
                </p>
              </div>
            </div>

            {connected && publicKey ? (
              <div className="space-y-4">
                <div
                  className="rounded-xl border p-4 flex items-center gap-4"
                  style={{ borderColor: c.green, background: c.greenBg }}
                >
                  <CheckCircle2
                    className="w-6 h-6 flex-shrink-0"
                    style={{ color: c.green }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: c.green }}
                    >
                      Wallet Connected
                    </p>
                    <p
                      className="text-xs font-mono truncate mt-0.5"
                      style={{ color: c.slate }}
                    >
                      {publicKey}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(publicKey, "wallet")}
                    className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                  >
                    {copied === "wallet" ? (
                      <Check className="w-4 h-4" style={{ color: c.green }} />
                    ) : (
                      <Copy className="w-4 h-4" style={{ color: c.muted }} />
                    )}
                  </button>
                </div>

                {/* Security note */}
                <div
                  className="rounded-lg p-4 text-sm"
                  style={{ background: c.bg, color: c.muted }}
                >
                  <p className="font-medium mb-1" style={{ color: c.slate }}>
                    <Lock className="w-3.5 h-3.5 inline mr-1" />
                    Why wallet-first?
                  </p>
                  <p className="text-xs leading-relaxed">
                    Your wallet is your identity on Solana — no email/password
                    to phish, no database to hack. We&apos;ll create a Squads
                    multisig vault secured by this wallet so no single key can
                    access your funds without authorization.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: c.muted }}>
                  No wallet detected. Connect Phantom, Solflare, or another
                  Solana wallet.
                </p>
                <button
                  onClick={login}
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ background: c.green }}
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() =>
                  validateStep(1) &&
                  setState((s) => ({ ...s, step: 2, error: null }))
                }
                disabled={!validateStep(1)}
                className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 text-white"
                style={{ background: validateStep(1) ? c.green : c.muted }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 2 — Business Information         */}
        {/* ═══════════════════════════════════════ */}
        {state.step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border p-8"
            style={{ background: c.card, borderColor: c.border }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: c.greenBg }}
              >
                <Building2 className="w-5 h-5" style={{ color: c.green }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: c.navy }}>
                  Business Information
                </h2>
                <p className="text-sm" style={{ color: c.muted }}>
                  Tell us about your operation
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: c.slate }}
                >
                  Business Name *
                </label>
                <input
                  type="text"
                  value={state.businessName}
                  onChange={(e) =>
                    setState((s) => ({ ...s, businessName: e.target.value }))
                  }
                  placeholder="Your Company Name"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.navy,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: c.slate }}
                >
                  Cannabis License Number
                </label>
                <input
                  type="text"
                  value={state.licenseNumber}
                  onChange={(e) =>
                    setState((s) => ({ ...s, licenseNumber: e.target.value }))
                  }
                  placeholder="e.g., 404-00123 (METRC/BioTrack)"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.navy,
                  }}
                />
                <p className="text-xs mt-1" style={{ color: c.muted }}>
                  Optional now. Required for production settlement.
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: c.slate }}
                >
                  Website
                </label>
                <input
                  type="url"
                  value={state.websiteUrl}
                  onChange={(e) =>
                    setState((s) => ({ ...s, websiteUrl: e.target.value }))
                  }
                  placeholder="https://yourcompany.com"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    color: c.navy,
                  }}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() =>
                  setState((s) => ({ ...s, step: 1, error: null }))
                }
                className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-70"
                style={{ color: c.muted }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() =>
                  validateStep(2) &&
                  setState((s) => ({ ...s, step: 3, error: null }))
                }
                disabled={!validateStep(2)}
                className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90 text-white"
                style={{ background: validateStep(2) ? c.green : c.muted }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 3 — Create Squads Vault          */}
        {/* ═══════════════════════════════════════ */}
        {state.step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border p-8"
            style={{ background: c.card, borderColor: c.border }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: c.greenBg }}
              >
                <Shield className="w-5 h-5" style={{ color: c.green }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: c.navy }}>
                  Create Your Vault
                </h2>
                <p className="text-sm" style={{ color: c.muted }}>
                  Squads multisig — institutional treasury security
                </p>
              </div>
            </div>

            {/* Vault explainer */}
            <div className="space-y-4 mb-8">
              <div
                className="rounded-xl border p-5"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: c.navy }}
                >
                  What is a Squads Vault?
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: c.slate }}
                >
                  A Squads Smart Account is an on-chain multisig vault that
                  holds your USDC. Instead of funds sitting in a single wallet
                  (one key = total control), your vault requires authorized
                  signatures before any funds move.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: Lock,
                      title: "1-of-1 to Start",
                      desc: "You're the sole signer. Same UX as a normal wallet.",
                    },
                    {
                      icon: Users,
                      title: "Add Signers Later",
                      desc: "Invite a CFO or partner for 2-of-2 approval on payouts.",
                    },
                    {
                      icon: Shield,
                      title: "Full Audit Trail",
                      desc: "Every transaction is on-chain. Immutable compliance proof.",
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      className="rounded-lg border p-3"
                      style={{ borderColor: c.border }}
                    >
                      <Icon
                        className="w-4 h-4 mb-2"
                        style={{ color: c.green }}
                      />
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: c.navy }}
                      >
                        {title}
                      </p>
                      <p
                        className="text-[11px] leading-relaxed"
                        style={{ color: c.muted }}
                      >
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signer info */}
              <div
                className="rounded-lg border p-4 flex items-center gap-3"
                style={{ borderColor: c.border, background: c.bg }}
              >
                <Wallet
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: c.green }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: c.slate }}>
                    Primary signer
                  </p>
                  <p
                    className="text-xs font-mono truncate"
                    style={{ color: c.muted }}
                  >
                    {publicKey}
                  </p>
                </div>
              </div>
            </div>

            {/* Create button */}
            <button
              onClick={handleCreateVault}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: c.green }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Vault on Solana...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Create Squads Vault
                </>
              )}
            </button>
            <p className="text-center text-xs mt-3" style={{ color: c.muted }}>
              This costs ~0.01 SOL in rent (one-time). You&apos;ll sign one
              transaction.
            </p>

            <div className="mt-6 flex justify-start">
              <button
                onClick={() =>
                  setState((s) => ({ ...s, step: 2, error: null }))
                }
                className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-70"
                style={{ color: c.muted }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 4 — Webhook + Finalize           */}
        {/* ═══════════════════════════════════════ */}
        {state.step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border p-8"
            style={{ background: c.card, borderColor: c.border }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: c.greenBg }}
              >
                <Key className="w-5 h-5" style={{ color: c.green }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: c.navy }}>
                  Integration Settings
                </h2>
                <p className="text-sm" style={{ color: c.muted }}>
                  Configure webhooks (optional)
                </p>
              </div>
            </div>

            {/* Vault created confirmation */}
            <div
              className="rounded-xl border p-4 mb-6 flex items-center gap-3"
              style={{ borderColor: c.green, background: c.greenBg }}
            >
              <CheckCircle2
                className="w-5 h-5 flex-shrink-0"
                style={{ color: c.green }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: c.green }}>
                  Vault Created
                </p>
                <p
                  className="text-xs font-mono truncate mt-0.5"
                  style={{ color: c.slate }}
                >
                  {state.vaultPda}
                </p>
              </div>
              <button
                onClick={() =>
                  state.vaultPda && copyToClipboard(state.vaultPda, "vault")
                }
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              >
                {copied === "vault" ? (
                  <Check className="w-4 h-4" style={{ color: c.green }} />
                ) : (
                  <Copy className="w-4 h-4" style={{ color: c.muted }} />
                )}
              </button>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: c.slate }}
              >
                Webhook Endpoint (Optional)
              </label>
              <input
                type="url"
                value={state.webhookUrl}
                onChange={(e) =>
                  setState((s) => ({ ...s, webhookUrl: e.target.value }))
                }
                placeholder="https://yoursite.com/api/webhooks/settlr"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  color: c.navy,
                }}
              />
              <p className="text-xs mt-2" style={{ color: c.muted }}>
                We&apos;ll POST payment events to this URL. You can configure
                this later from the dashboard.
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() =>
                  setState((s) => ({ ...s, step: 3, error: null }))
                }
                className="flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:opacity-70"
                style={{ color: c.muted }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl disabled:opacity-50 transition-opacity hover:opacity-90 text-white"
                style={{ background: c.green }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/*  STEP 5 — Success                      */}
        {/* ═══════════════════════════════════════ */}
        {state.step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border p-8"
            style={{ background: c.card, borderColor: c.border }}
          >
            <div className="text-center mb-8">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: c.greenBg }}
              >
                <Check className="w-10 h-10" style={{ color: c.green }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: c.navy }}>
                You&apos;re All Set
              </h2>
              <p style={{ color: c.muted }}>
                Your Squads vault is live and your merchant account is
                registered.
              </p>
            </div>

            {/* Vault Address */}
            <div
              className="rounded-xl p-5 mb-4 border"
              style={{ background: c.bg, borderColor: c.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: c.muted }}
                >
                  Settlement Vault
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: c.greenBg, color: c.green }}
                >
                  1-of-1 Multisig
                </span>
              </div>
              <div className="flex items-center gap-3">
                <code
                  className="flex-1 text-xs font-mono break-all"
                  style={{ color: c.slate }}
                >
                  {state.vaultPda}
                </code>
                <button
                  onClick={() =>
                    state.vaultPda &&
                    copyToClipboard(state.vaultPda, "vaultFinal")
                  }
                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                >
                  {copied === "vaultFinal" ? (
                    <Check className="w-4 h-4" style={{ color: c.green }} />
                  ) : (
                    <Copy className="w-4 h-4" style={{ color: c.muted }} />
                  )}
                </button>
              </div>
              <p className="text-[11px] mt-2" style={{ color: c.muted }}>
                All USDC settlements go to this vault. Add signers anytime from
                the dashboard.
              </p>
            </div>

            {/* API Key */}
            <div
              className="rounded-xl p-5 mb-4 border"
              style={{ background: c.bg, borderColor: c.border }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: c.muted }}
                >
                  API Key
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                  }}
                >
                  Save now — shown once
                </span>
              </div>
              <div className="flex items-center gap-3">
                <code
                  className="flex-1 text-xs font-mono break-all"
                  style={{ color: c.green }}
                >
                  {state.apiKey}
                </code>
                <button
                  onClick={() =>
                    state.apiKey && copyToClipboard(state.apiKey, "apiKey")
                  }
                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                >
                  {copied === "apiKey" ? (
                    <Check className="w-4 h-4" style={{ color: c.green }} />
                  ) : (
                    <Copy className="w-4 h-4" style={{ color: c.muted }} />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Start Code */}
            <div
              className="rounded-xl p-5 mb-6 border"
              style={{ background: c.bg, borderColor: c.border }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: c.muted }}
              >
                Quick Start
              </h3>
              <pre
                className="rounded-lg p-4 text-xs overflow-x-auto"
                style={{ background: c.card, color: c.slate }}
              >
                <code>{`npm install @settlr/sdk

import { Settlr } from '@settlr/sdk';

const settlr = new Settlr({
  apiKey: '${state.apiKey?.slice(0, 12)}...',
});

// Create an invoice (B2B cannabis)
const invoice = await settlr.createInvoice({
  amount: 12500.00,
  currency: 'USDC',
  description: 'PO #4521 — Flower delivery',
  // Settles to your Squads vault automatically
});`}</code>
              </pre>
            </div>

            {/* Next Steps */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 p-4 rounded-xl border font-medium text-sm transition-all hover:opacity-80"
                style={{ borderColor: c.green, color: c.green }}
              >
                <Store className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/docs"
                className="flex items-center justify-center gap-2 p-4 rounded-xl border font-medium text-sm transition-all hover:opacity-80"
                style={{ borderColor: c.border, color: c.slate }}
              >
                <ExternalLink className="w-4 h-4" />
                Documentation
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
