"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import {
  getVaultInfo,
  buildAddMemberTransactions,
  shortenAddress,
  permissionsLabel,
  type VaultInfo,
} from "@/lib/squads";
import {
  Store,
  Check,
  Copy,
  Wallet,
  Zap,
  Shield,
  Globe,
  Code,
  LogIn,
  Loader2,
  Banknote,
  Key,
  Users,
  Plus,
  Lock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;
const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

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

export default function MerchantPage() {
  const { authenticated, login } = usePrivy();
  const { solanaWallet, publicKey, connected, wallet } = useActiveWallet();

  const [copied, setCopied] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [vaultBalance, setVaultBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [loadingVault, setLoadingVault] = useState(false);
  const [merchantData, setMerchantData] = useState<{
    id: string;
    name: string;
    walletAddress: string;
    signerWallet?: string;
    multisigPda?: string;
  } | null>(null);
  const [showAddSigner, setShowAddSigner] = useState(false);
  const [newSignerAddress, setNewSignerAddress] = useState("");
  const [newThreshold, setNewThreshold] = useState(2);
  const [addingMember, setAddingMember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch Merchant Data from API ───────────────────────
  const fetchMerchant = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/merchants/register?wallet=${publicKey}`);
      const data = await res.json();
      if (data.registered && data.merchant) {
        setMerchantData(data.merchant);
        // Persist vault info to localStorage for quick access
        if (data.merchant.multisigPda) {
          localStorage.setItem(
            `settlr_vault_${publicKey}`,
            data.merchant.multisigPda,
          );
        }
      }
    } catch (err) {
      console.error("Error fetching merchant data:", err);
    }
  }, [publicKey]);

  // ─── Fetch USDC Balance (wallet + vault) ───────────────
  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setLoadingBalance(true);
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      // Wallet balance
      const walletPubkey = new PublicKey(publicKey);
      const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
      try {
        const account = await getAccount(connection, ata);
        setBalance(Number(account.amount) / Math.pow(10, USDC_DECIMALS));
      } catch {
        setBalance(0);
      }
      // Vault balance (if vault exists)
      const vaultPdaStr =
        merchantData?.walletAddress ||
        localStorage.getItem(`settlr_vault_pda_${publicKey}`);
      if (vaultPdaStr) {
        try {
          const vaultPubkey = new PublicKey(vaultPdaStr);
          const vaultAta = await getAssociatedTokenAddress(
            USDC_MINT,
            vaultPubkey,
            true, // allowOwnerOffCurve for PDA
          );
          const vaultAccount = await getAccount(connection, vaultAta);
          setVaultBalance(
            Number(vaultAccount.amount) / Math.pow(10, USDC_DECIMALS),
          );
        } catch {
          setVaultBalance(0);
        }
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  }, [publicKey, merchantData?.walletAddress]);

  // ─── Fetch Vault Info ──────────────────────────────────
  const fetchVault = useCallback(async () => {
    if (!publicKey) return;
    setLoadingVault(true);
    try {
      // Try merchant data first (from API), then localStorage
      const multisigPdaStr =
        merchantData?.multisigPda ||
        localStorage.getItem(`settlr_vault_${publicKey}`);
      if (multisigPdaStr) {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const multisigPda = new PublicKey(multisigPdaStr);
        const info = await getVaultInfo(connection, multisigPda);
        setVaultInfo(info);
      }
    } catch (err) {
      console.error("Error fetching vault:", err);
    } finally {
      setLoadingVault(false);
    }
  }, [publicKey, merchantData?.multisigPda]);

  // Fetch merchant data first, then vault and balance
  useEffect(() => {
    if (connected) {
      fetchMerchant();
    }
  }, [connected, fetchMerchant]);

  useEffect(() => {
    if (connected) {
      fetchBalance();
      fetchVault();
    }
  }, [connected, fetchBalance, fetchVault]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const isValidSolanaAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  // ─── Add Signer ────────────────────────────────────────
  const handleAddSigner = async () => {
    if (!vaultInfo || !publicKey || !wallet) return;
    if (!isValidSolanaAddress(newSignerAddress)) {
      setError("Invalid Solana address");
      return;
    }

    setAddingMember(true);
    setError(null);

    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const txs = await buildAddMemberTransactions(
        connection,
        vaultInfo.multisigPda,
        new PublicKey(publicKey),
        new PublicKey(newSignerAddress),
        newThreshold,
      );

      // Sign and send each transaction
      for (const tx of txs) {
        const provider = await (wallet as any).getProvider?.();
        let signedTx;
        if (provider && provider.signTransaction) {
          signedTx = await provider.signTransaction(tx);
        } else if ((wallet as any).signTransaction) {
          signedTx = await (wallet as any).signTransaction(tx);
        } else {
          throw new Error("Wallet does not support signing");
        }

        const sig = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        await connection.confirmTransaction(
          {
            signature: sig,
            blockhash: tx.recentBlockhash!,
            lastValidBlockHeight: tx.lastValidBlockHeight!,
          },
          "confirmed",
        );
      }

      // Refresh vault state
      await fetchVault();
      setShowAddSigner(false);
      setNewSignerAddress("");
    } catch (err) {
      console.error("Add signer failed:", err);
      setError(err instanceof Error ? err.message : "Failed to add signer");
    } finally {
      setAddingMember(false);
    }
  };

  // ─── Not connected ─────────────────────────────────────
  if (!connected) {
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
          <h2 className="text-2xl font-bold mb-4" style={{ color: c.navy }}>
            Merchant Dashboard
          </h2>
          <p className="mb-6" style={{ color: c.muted }}>
            Connect your wallet to access your Squads vault and merchant
            settings.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: c.green }}
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed Header */}
      <header
        className="fixed left-0 right-0 top-0 z-50 border-b px-4 py-4 backdrop-blur-xl md:px-8"
        style={{
          borderColor: c.border,
          background: `${c.bg}cc`,
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <SettlrLogoWithIcon size="sm" variant="dark" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: c.muted }}
            >
              Home
            </Link>
            <Link
              href="/create"
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: c.muted }}
            >
              Payment Links
            </Link>
            <Link
              href="/docs"
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: c.muted }}
            >
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {vaultInfo && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
                style={{ borderColor: c.green, color: c.green }}
              >
                <Shield className="w-3 h-3" />
                {vaultInfo.threshold}-of-{vaultInfo.members.length} Vault
              </span>
            )}
            <span
              className="text-xs font-mono px-3 py-1.5 rounded-lg border"
              style={{ borderColor: c.border, color: c.muted }}
            >
              {publicKey ? shortenAddress(publicKey, 6) : "..."}
            </span>
          </div>
        </div>
      </header>

      <div
        className="min-h-screen py-12 px-4 pt-32"
        style={{ background: c.bg }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-1" style={{ color: c.navy }}>
              Merchant Dashboard
            </h1>
            <p className="text-sm" style={{ color: c.muted }}>
              Manage your Squads vault, balances, and settings.
            </p>
          </motion.div>

          {/* ═══════════════════════════════════════ */}
          {/*  VAULT STATUS CARD                     */}
          {/* ═══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border p-6 mb-6"
            style={{ background: c.card, borderColor: c.border }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: c.greenBg }}
                >
                  <Shield className="w-5 h-5" style={{ color: c.green }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: c.navy }}
                  >
                    Squads Vault
                  </h2>
                  <p className="text-xs" style={{ color: c.muted }}>
                    {vaultInfo
                      ? `${vaultInfo.threshold}-of-${vaultInfo.members.length} multisig`
                      : "Loading..."}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchVault}
                disabled={loadingVault}
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingVault ? "animate-spin" : ""}`}
                  style={{ color: c.muted }}
                />
              </button>
            </div>

            {vaultInfo ? (
              <div className="space-y-4">
                {/* Vault address */}
                <div
                  className="rounded-xl border p-4"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: c.muted }}
                  >
                    Settlement Address (Vault PDA)
                  </p>
                  <div className="flex items-center gap-2">
                    <code
                      className="flex-1 text-xs font-mono break-all"
                      style={{ color: c.slate }}
                    >
                      {vaultInfo.vaultPda.toBase58()}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          vaultInfo.vaultPda.toBase58(),
                          "vaultAddr",
                        )
                      }
                      className="p-1.5 rounded hover:opacity-70 transition-opacity"
                    >
                      {copied === "vaultAddr" ? (
                        <Check
                          className="w-3.5 h-3.5"
                          style={{ color: c.green }}
                        />
                      ) : (
                        <Copy
                          className="w-3.5 h-3.5"
                          style={{ color: c.muted }}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Signers */}
                <div
                  className="rounded-xl border p-4"
                  style={{ background: c.bg, borderColor: c.border }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: c.muted }}
                    >
                      Signers ({vaultInfo.members.length})
                    </p>
                    <button
                      onClick={() => setShowAddSigner(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
                      style={{ color: c.green, background: c.greenBg }}
                    >
                      <Plus className="w-3 h-3" />
                      Add Signer
                    </button>
                  </div>
                  <div className="space-y-2">
                    {vaultInfo.members.map((member, i) => (
                      <div
                        key={member.key.toBase58()}
                        className="flex items-center gap-3 rounded-lg border p-3"
                        style={{ borderColor: c.border }}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: c.greenBg, color: c.green }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-mono truncate"
                            style={{ color: c.slate }}
                          >
                            {member.key.toBase58()}
                          </p>
                          <p
                            className="text-[10px] mt-0.5"
                            style={{ color: c.muted }}
                          >
                            {permissionsLabel(member.permissions)}
                            {member.key.toBase58() === publicKey && (
                              <span
                                className="ml-2 font-medium"
                                style={{ color: c.green }}
                              >
                                (you)
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              member.key.toBase58(),
                              `member-${i}`,
                            )
                          }
                          className="p-1.5 rounded hover:opacity-70 transition-opacity"
                        >
                          {copied === `member-${i}` ? (
                            <Check
                              className="w-3 h-3"
                              style={{ color: c.green }}
                            />
                          ) : (
                            <Copy
                              className="w-3 h-3"
                              style={{ color: c.muted }}
                            />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Threshold info */}
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: c.muted }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    Threshold: {vaultInfo.threshold} of{" "}
                    {vaultInfo.members.length} signatures required to move funds
                  </span>
                </div>
              </div>
            ) : !loadingVault ? (
              /* No vault found */
              <div
                className="rounded-xl border p-6 text-center"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <Shield
                  className="w-8 h-8 mx-auto mb-3 opacity-30"
                  style={{ color: c.muted }}
                />
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: c.navy }}
                >
                  No vault found
                </p>
                <p className="text-xs mb-4" style={{ color: c.muted }}>
                  Complete onboarding to create your Squads vault.
                </p>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: c.green }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Set Up Vault
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  className="w-6 h-6 animate-spin"
                  style={{ color: c.muted }}
                />
              </div>
            )}
          </motion.div>

          {/* ═══════════════════════════════════════ */}
          {/*  ADD SIGNER MODAL                      */}
          {/* ═══════════════════════════════════════ */}
          <AnimatePresence>
            {showAddSigner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(12,24,41,0.6)" }}
                onClick={() => setShowAddSigner(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border p-6 max-w-md w-full"
                  style={{ background: c.card, borderColor: c.border }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: c.greenBg }}
                      >
                        <Users className="w-5 h-5" style={{ color: c.green }} />
                      </div>
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: c.navy }}
                        >
                          Add Signer
                        </h3>
                        <p className="text-xs" style={{ color: c.muted }}>
                          Add a co-signer to protect your treasury
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddSigner(false)}
                      className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                    >
                      <X className="w-4 h-4" style={{ color: c.muted }} />
                    </button>
                  </div>

                  {error && (
                    <div
                      className="mb-4 p-3 rounded-lg flex items-center gap-2 text-xs"
                      style={{
                        background: "rgba(220,38,38,0.05)",
                        color: c.red,
                      }}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-xs font-medium mb-1.5"
                        style={{ color: c.slate }}
                      >
                        New Signer Wallet Address
                      </label>
                      <input
                        type="text"
                        value={newSignerAddress}
                        onChange={(e) => setNewSignerAddress(e.target.value)}
                        placeholder="Paste Solana address (e.g., your CFO's Phantom wallet)"
                        className="w-full px-3 py-2.5 rounded-lg text-xs font-mono focus:outline-none focus:ring-2"
                        style={{
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                          color: c.navy,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-xs font-medium mb-1.5"
                        style={{ color: c.slate }}
                      >
                        New Threshold
                      </label>
                      <select
                        value={newThreshold}
                        onChange={(e) =>
                          setNewThreshold(Number(e.target.value))
                        }
                        className="w-full px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:ring-2"
                        style={{
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                          color: c.navy,
                        }}
                      >
                        {vaultInfo &&
                          Array.from(
                            { length: vaultInfo.members.length + 1 },
                            (_, i) => i + 1,
                          ).map((t) => (
                            <option key={t} value={t}>
                              {t}-of-{vaultInfo.members.length + 1} signatures
                              required
                            </option>
                          ))}
                      </select>
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: c.muted }}
                      >
                        Recommended: 2-of-2 for business partners, 2-of-3 for
                        boards.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleAddSigner}
                    disabled={
                      addingMember || !isValidSolanaAddress(newSignerAddress)
                    }
                    className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                    style={{ background: c.green }}
                  >
                    {addingMember ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding Signer...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Signer
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════ */}
          {/*  BALANCE CARD                          */}
          {/* ═══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border p-6 mb-6"
            style={{ background: c.card, borderColor: c.border }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: c.navy }}>
                {vaultInfo ? "Vault Balance" : "Wallet Balance"}
              </h2>
              <button
                onClick={fetchBalance}
                disabled={loadingBalance}
                className="text-xs flex items-center gap-1 transition-colors hover:opacity-70"
                style={{ color: c.muted }}
              >
                <RefreshCw
                  className={`w-3 h-3 ${loadingBalance ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* Show vault balance if vault exists, otherwise wallet balance */}
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold" style={{ color: c.navy }}>
                {vaultInfo
                  ? vaultBalance !== null
                    ? vaultBalance.toFixed(2)
                    : "—"
                  : balance !== null
                  ? balance.toFixed(2)
                  : "—"}
              </span>
              <span className="text-xl mb-1" style={{ color: c.muted }}>
                USDC
              </span>
            </div>

            {/* Show both balances if vault exists */}
            {vaultInfo && balance !== null && (
              <p className="text-xs mb-4" style={{ color: c.muted }}>
                Signer wallet: {balance.toFixed(2)} USDC
              </p>
            )}
            {!vaultInfo && <div className="mb-4" />}

            <Link
              href={`/offramp?wallet=${publicKey}&amount=${
                (vaultInfo ? vaultBalance : balance) || ""
              }`}
            >
              <button
                className="w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white"
                style={{ background: c.green }}
              >
                <Banknote className="w-5 h-5" />
                Cash Out to Bank
              </button>
            </Link>
          </motion.div>

          {/* ═══════════════════════════════════════ */}
          {/*  QUICK ACTIONS                         */}
          {/* ═══════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              {
                href: "/dashboard/api-keys",
                icon: Key,
                color: "#f59e0b",
                title: "API Keys",
                desc: "For SDK integration",
                delay: 0.15,
              },
              {
                href: "/create",
                icon: Zap,
                color: c.green,
                title: "Payment Link",
                desc: "Generate invoice or QR",
                delay: 0.2,
              },
              {
                href: "/docs",
                icon: Code,
                color: "#6366f1",
                title: "Docs",
                desc: "Integration guides",
                delay: 0.25,
              },
            ].map(({ href, icon: Icon, color, title, desc, delay }) => (
              <Link key={href} href={href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-sm"
                  style={{ background: c.card, borderColor: c.border }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: c.navy }}
                      >
                        {title}
                      </h3>
                      <p className="text-xs" style={{ color: c.muted }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* ═══════════════════════════════════════ */}
          {/*  SECURITY FEATURES                     */}
          {/* ═══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border p-6"
            style={{ background: c.card, borderColor: c.border }}
          >
            <h2
              className="text-lg font-semibold mb-5"
              style={{ color: c.navy }}
            >
              Vault Security
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Shield,
                  title: "Non-Custodial",
                  desc: "Funds settle directly to your Squads vault. Settlr never holds your money.",
                },
                {
                  icon: Users,
                  title: "Multi-Party Signing",
                  desc: "Add your CFO, partner, or board as co-signers. No single person can drain funds.",
                },
                {
                  icon: Lock,
                  title: "On-Chain Audit Trail",
                  desc: "Every signed transaction is an immutable Solana record. BSA/AML ready.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: c.greenBg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: c.green }} />
                  </div>
                  <h3
                    className="font-medium text-sm mb-1"
                    style={{ color: c.navy }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: c.muted }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pricing note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 text-center"
          >
            <p style={{ color: c.muted }}>
              <span className="font-semibold" style={{ color: c.green }}>
                1% flat per transaction
              </span>{" "}
              · No monthly fees · No payment holds
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
