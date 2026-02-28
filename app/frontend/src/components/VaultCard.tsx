"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useSignTransaction } from "@privy-io/react-auth/solana";
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
  Shield,
  Check,
  Copy,
  Wallet,
  Loader2,
  Banknote,
  Users,
  Plus,
  Lock,
  RefreshCw,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;
const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";

/**
 * Self-contained vault overview card for the dashboard.
 * Shows vault status, signers, balances, and add-signer modal.
 */
export function VaultCard() {
  const { solanaWallet, publicKey, connected, wallet } = useActiveWallet();
  const { signTransaction: privySignTx } = useSignTransaction();

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
      const walletPubkey = new PublicKey(publicKey);
      const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
      try {
        const account = await getAccount(connection, ata);
        setBalance(Number(account.amount) / Math.pow(10, USDC_DECIMALS));
      } catch {
        setBalance(0);
      }
      const vaultPdaStr =
        merchantData?.walletAddress ||
        localStorage.getItem(`settlr_vault_pda_${publicKey}`);
      if (vaultPdaStr) {
        try {
          const vaultPubkey = new PublicKey(vaultPdaStr);
          const vaultAta = await getAssociatedTokenAddress(
            USDC_MINT,
            vaultPubkey,
            true,
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

  useEffect(() => {
    if (connected) fetchMerchant();
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

  const isValidSolanaAddress = (address: string): boolean =>
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

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
      // Use Privy's signTransaction hook + manual send instead
      for (const tx of txs) {
        const txBytes = new Uint8Array(
          tx.serialize({ requireAllSignatures: false }),
        );
        const { signedTransaction } = await privySignTx({
          transaction: txBytes,
          wallet: solanaWallet as any,
        });
        const signature = await connection.sendRawTransaction(
          signedTransaction,
        );
        console.log("Add-signer tx:", signature);
      }
      setShowAddSigner(false);
      setNewSignerAddress("");
      setNewThreshold(2);
      setTimeout(() => fetchVault(), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add signer");
    } finally {
      setAddingMember(false);
    }
  };

  if (!connected) return null;

  return (
    <>
      {/* ═══════════════════════════════════════ */}
      {/*  VAULT + BALANCE ROW                   */}
      {/* ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Vault Status */}
        <div className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2.5">
                <Shield className="h-5 w-5 text-[#1B6B4A]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#0C1829]">
                  Squads Vault
                </h3>
                <p className="text-xs text-[#7C8A9E]">
                  {vaultInfo
                    ? `${vaultInfo.threshold}-of-${vaultInfo.members.length} multisig`
                    : loadingVault
                    ? "Loading..."
                    : "Not configured"}
                </p>
              </div>
            </div>
            <button
              onClick={fetchVault}
              disabled={loadingVault}
              className="p-1.5 rounded-lg hover:bg-[#F3F2ED] transition-colors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#7C8A9E] ${
                  loadingVault ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {vaultInfo ? (
            <div className="space-y-3">
              {/* Vault PDA */}
              <div className="rounded-lg bg-[#FDFBF7] border border-[#E2DFD5] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7C8A9E] mb-0.5">
                  Settlement Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-[#3B4963] truncate">
                    {vaultInfo.vaultPda.toBase58()}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        vaultInfo.vaultPda.toBase58(),
                        "vaultAddr",
                      )
                    }
                    className="p-1 rounded hover:opacity-70"
                  >
                    {copied === "vaultAddr" ? (
                      <Check className="h-3 w-3 text-[#1B6B4A]" />
                    ) : (
                      <Copy className="h-3 w-3 text-[#7C8A9E]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Signers row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-[#7C8A9E]" />
                  <span className="text-xs text-[#7C8A9E]">
                    {vaultInfo.members.length} signer
                    {vaultInfo.members.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddSigner(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1B6B4A] hover:opacity-70 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>

              {/* Member list */}
              <div className="space-y-1.5">
                {vaultInfo.members.map((member, i) => (
                  <div
                    key={member.key.toBase58()}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-[#1B6B4A] flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <code className="font-mono text-[#3B4963] truncate flex-1">
                      {shortenAddress(member.key.toBase58(), 6)}
                    </code>
                    <span className="text-[10px] text-[#7C8A9E]">
                      {permissionsLabel(member.permissions)}
                    </span>
                    {member.key.toBase58() === publicKey && (
                      <span className="text-[10px] font-medium text-[#1B6B4A]">
                        (you)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#7C8A9E] pt-1">
                <Lock className="h-3 w-3" />
                {vaultInfo.threshold} of {vaultInfo.members.length} signatures
                required
              </div>
            </div>
          ) : !loadingVault ? (
            <div className="text-center py-4">
              <Shield className="h-6 w-6 text-[#7C8A9E]/30 mx-auto mb-2" />
              <p className="text-xs text-[#7C8A9E] mb-2">No vault found</p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B6B4A] hover:opacity-70"
              >
                <Shield className="h-3 w-3" />
                Set Up Vault
              </Link>
            </div>
          ) : (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#7C8A9E]" />
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2.5">
                <Wallet className="h-5 w-5 text-[#1B6B4A]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#0C1829]">
                  {vaultInfo ? "Vault Balance" : "Wallet Balance"}
                </h3>
                <p className="text-xs text-[#7C8A9E]">USDC on Devnet</p>
              </div>
            </div>
            <button
              onClick={fetchBalance}
              disabled={loadingBalance}
              className="p-1.5 rounded-lg hover:bg-[#F3F2ED] transition-colors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#7C8A9E] ${
                  loadingBalance ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-3xl font-bold text-[#0C1829]">
              {vaultInfo
                ? vaultBalance !== null
                  ? vaultBalance.toFixed(2)
                  : "—"
                : balance !== null
                ? balance.toFixed(2)
                : "—"}
            </span>
            <span className="text-sm text-[#7C8A9E] mb-1">USDC</span>
          </div>

          {vaultInfo && balance !== null && (
            <p className="text-xs text-[#7C8A9E] mb-4">
              Signer wallet: {balance.toFixed(2)} USDC
            </p>
          )}
          {!vaultInfo && <div className="mb-4" />}

          <Link
            href={`/offramp?wallet=${publicKey}&amount=${
              (vaultInfo ? vaultBalance : balance) || ""
            }`}
            className="block w-full"
          >
            <button className="w-full py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white bg-[#1B6B4A]">
              <Banknote className="h-4 w-4" />
              Cash Out to Bank
            </button>
          </Link>
        </div>
      </div>

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
              className="rounded-2xl border border-[#E2DFD5] bg-[#F3F2ED] p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#1B6B4A]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0C1829]">
                      Add Signer
                    </h3>
                    <p className="text-xs text-[#7C8A9E]">
                      Add a co-signer to protect your treasury
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSigner(false)}
                  className="p-2 rounded-lg hover:opacity-70"
                >
                  <X className="w-4 h-4 text-[#7C8A9E]" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-xs bg-red-500/5 text-red-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#3B4963] mb-1.5">
                    New Signer Wallet Address
                  </label>
                  <input
                    type="text"
                    value={newSignerAddress}
                    onChange={(e) => setNewSignerAddress(e.target.value)}
                    placeholder="Paste Solana address"
                    className="w-full px-3 py-2.5 rounded-lg text-xs font-mono bg-[#FDFBF7] border border-[#E2DFD5] text-[#0C1829] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#3B4963] mb-1.5">
                    New Threshold
                  </label>
                  <select
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-lg text-xs bg-[#FDFBF7] border border-[#E2DFD5] text-[#0C1829] focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]/30"
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
                  <p className="text-[10px] mt-1 text-[#7C8A9E]">
                    Recommended: 2-of-2 for partners, 2-of-3 for boards.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddSigner}
                disabled={
                  addingMember || !isValidSolanaAddress(newSignerAddress)
                }
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl text-white bg-[#1B6B4A] disabled:opacity-40 transition-opacity hover:opacity-90"
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
    </>
  );
}
