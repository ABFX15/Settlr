"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import {
  Check,
  Loader2,
  Shield,
  ExternalLink,
  AlertCircle,
  Wallet,
  FileText,
  Building2,
  Calendar,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  QrCode,
  HelpCircle,
  Settings,
  Bell,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

/* ─── Solana config ─── */
const RPC_ENDPOINT = "https://api.devnet.solana.com";
const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);
const USDC_DECIMALS = 6;
const IS_DEVNET = RPC_ENDPOINT.includes("devnet");

/* ─── Types ─── */
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  merchantName: string;
  merchantWallet: string;
  buyerName: string;
  buyerCompany?: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  currency: string;
  memo?: string;
  terms: string;
  dueDate: string;
  status: string;
  paymentSignature?: string;
  paidAt?: string;
  createdAt: string;
}

type PageState =
  | "loading"
  | "ready"
  | "paying"
  | "success"
  | "error"
  | "not-found"
  | "already-paid"
  | "cancelled";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const ASSETS = [
  { symbol: "USDC", network: "Solana (SPL Token)", icon: "$", selected: true },
  { symbol: "SOL", network: "Solana Native", icon: "S", selected: false },
  {
    symbol: "PYUSD",
    network: "Solana (SPL Token)",
    icon: "P",
    selected: false,
  },
];

export default function InvoicePayClient({
  token: tokenProp,
}: {
  token: string;
}) {
  const [token] = useState<string | null>(tokenProp);
  const {
    publicKey,
    connected,
    connecting,
    signTransaction: walletSignTransaction,
    sendTransaction,
  } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [state, setState] = useState<PageState>("loading");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(0);

  const fetchInvoice = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/invoices/view/${token}`);
      if (res.status === 404) {
        setState("not-found");
        return;
      }
      if (!res.ok) throw new Error("Failed to load invoice");
      const data: InvoiceData = await res.json();
      setInvoice(data);
      if (data.status === "paid") {
        setTxSignature(data.paymentSignature || null);
        setState("already-paid");
      } else if (data.status === "cancelled") {
        setState("cancelled");
      } else {
        setState("ready");
      }
    } catch {
      setError("Could not load this invoice. Please try again.");
      setState("error");
    }
  }, [token]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const payerAddress = publicKey?.toBase58() ?? null;

  const handlePay = async () => {
    if (!invoice) return;
    if (!publicKey || !payerAddress) {
      openWalletModal(true);
      return;
    }
    if (!walletSignTransaction && !sendTransaction) {
      setError("Your wallet does not support transaction signing.");
      return;
    }
    setState("paying");
    setError(null);

    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const userPubkey = publicKey;
      const merchantPubkey = new PublicKey(invoice.merchantWallet);

      const userAta = await getAssociatedTokenAddress(USDC_MINT, userPubkey);
      const merchantAta = await getAssociatedTokenAddress(
        USDC_MINT,
        merchantPubkey,
        true,
      );

      try {
        const account = await getAccount(connection, userAta);
        const balance = Number(account.amount) / Math.pow(10, USDC_DECIMALS);
        if (balance < invoice.total) {
          throw new Error(
            `Insufficient USDC balance. You have $${balance.toFixed(
              2,
            )} but need $${invoice.total.toFixed(2)}`,
          );
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("Insufficient"))
          throw err;
        throw new Error(
          "USDC token account not found. Please fund your wallet.",
        );
      }

      const amountLamports = BigInt(
        Math.round(invoice.total * Math.pow(10, USDC_DECIMALS)),
      );
      const transaction = new Transaction();

      try {
        await getAccount(connection, merchantAta);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPubkey,
            merchantAta,
            merchantPubkey,
            USDC_MINT,
          ),
        );
      }

      transaction.add(
        createTransferInstruction(
          userAta,
          merchantAta,
          userPubkey,
          amountLamports,
        ),
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      let sig: string;
      if (walletSignTransaction) {
        const signedTx = await walletSignTransaction(transaction);
        sig = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: true,
        });
      } else {
        sig = await sendTransaction!(transaction, connection, {
          skipPreflight: true,
        });
      }
      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed",
      );

      setTxSignature(sig);

      await fetch(`/api/invoices/view/${token}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentSignature: sig,
          payerWallet: payerAddress,
        }),
      });

      setState("success");
    } catch (err) {
      console.error("[invoice] Payment error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
      setState("ready");
    }
  };

  const copySignature = () => {
    if (!txSignature) return;
    navigator.clipboard.writeText(txSignature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = txSignature
    ? `https://explorer.solana.com/tx/${txSignature}${
        IS_DEVNET ? "?cluster=devnet" : ""
      }`
    : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const isOverdue =
    invoice &&
    new Date(invoice.dueDate) < new Date() &&
    !["paid", "cancelled"].includes(invoice.status);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#1f1f1f] px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold text-[#00ff41] tracking-tight"
            >
              Settlr
            </Link>
            <span className="text-sm font-medium text-white underline underline-offset-4">
              Payment
            </span>
            <Link
              href="/help"
              className="text-sm text-[#666] hover:text-white transition-colors"
            >
              Help Center
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#666] hover:text-white transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <button className="text-[#666] hover:text-white transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
              <span className="text-xs text-[#888]">
                {payerAddress ? payerAddress.slice(0, 2).toUpperCase() : "?"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {state === "loading" && (
            <motion.div
              key="loading"
              {...fadeIn}
              className="flex flex-col items-center gap-3 py-20"
            >
              <Loader2 className="h-8 w-8 animate-spin text-[#00ff41]" />
              <p className="text-sm text-[#666]">Loading invoice...</p>
            </motion.div>
          )}

          {/* Not found */}
          {state === "not-found" && (
            <motion.div
              key="not-found"
              {...fadeIn}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a]">
                <FileText className="h-8 w-8 text-[#666]" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Invoice Not Found
              </h2>
              <p className="mt-2 text-sm text-[#666]">
                This invoice link is invalid or has expired.
              </p>
            </motion.div>
          )}

          {/* Cancelled */}
          {state === "cancelled" && invoice && (
            <motion.div
              key="cancelled"
              {...fadeIn}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Invoice Cancelled
              </h2>
              <p className="mt-2 text-sm text-[#666]">
                Invoice #{invoice.invoiceNumber} from{" "}
                <strong className="text-white">{invoice.merchantName}</strong>{" "}
                has been cancelled.
              </p>
            </motion.div>
          )}

          {/* Error */}
          {state === "error" && (
            <motion.div
              key="error"
              {...fadeIn}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Something Went Wrong
              </h2>
              <p className="mt-2 text-sm text-[#666]">
                {error || "Please try again later."}
              </p>
            </motion.div>
          )}

          {/* Ready / Paying / Success / Already Paid */}
          {(state === "ready" ||
            state === "paying" ||
            state === "success" ||
            state === "already-paid") &&
            invoice && (
              <motion.div key="invoice" {...fadeIn}>
                {/* Invoice Number + Title */}
                <div className="mb-8">
                  <div className="text-[11px] text-[#00ff41] uppercase tracking-[0.15em] font-semibold mb-2">
                    Invoice #{invoice.invoiceNumber}
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                    {invoice.lineItems[0]?.description || "Invoice Payment"}
                  </h1>
                  <p className="text-sm text-[#888]">
                    From{" "}
                    <span className="text-white font-medium">
                      {invoice.merchantName}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left — Invoice Details */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Amount Due Card */}
                    <div className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#555] uppercase tracking-wider font-semibold">
                          Amount Due
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl font-bold text-white tracking-tight">
                          $
                          {invoice.total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-lg text-[#666]">USD</span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#1f1f1f]">
                        <div>
                          <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                            Due Date
                          </span>
                          <span className="text-sm font-medium text-white">
                            {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#555] uppercase tracking-wider block mb-1">
                            Status
                          </span>
                          <span
                            className={`text-sm font-medium flex items-center gap-1.5 ${
                              state === "success" || state === "already-paid"
                                ? "text-[#00ff41]"
                                : isOverdue
                                ? "text-amber-400"
                                : "text-[#00ff41]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                state === "success" || state === "already-paid"
                                  ? "bg-[#00ff41]"
                                  : isOverdue
                                  ? "bg-amber-400"
                                  : "bg-[#00ff41]"
                              }`}
                            />
                            {state === "success"
                              ? "Paid"
                              : state === "already-paid"
                              ? "Paid"
                              : isOverdue
                              ? "Overdue"
                              : "Pending Payment"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-6">
                      <span className="text-[10px] text-[#555] uppercase tracking-wider font-semibold block mb-4">
                        Line Items
                      </span>
                      <div className="space-y-3">
                        {invoice.lineItems.map((li, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2"
                          >
                            <span className="text-sm text-white">
                              {li.description}
                            </span>
                            <span className="text-sm font-mono text-white">
                              $
                              {li.amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trust footer */}
                    <div className="flex items-center gap-2 text-xs text-[#555]">
                      <Shield className="h-3.5 w-3.5 text-[#00ff41]" />
                      Secured by Settlr Decentralized Clearing Protocol
                    </div>

                    {/* Success / Already paid TX info */}
                    {(state === "success" || state === "already-paid") &&
                      txSignature && (
                        <div className="rounded-xl bg-[#00ff41]/5 border border-[#00ff41]/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-[#00ff41]" />
                            <span className="text-sm font-semibold text-[#00ff41]">
                              {state === "success"
                                ? "Payment Successful!"
                                : "This invoice has been paid"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] border border-[#333] px-3 py-2">
                            <code className="flex-1 truncate text-xs text-[#aaa] font-mono">
                              {txSignature}
                            </code>
                            <button
                              onClick={copySignature}
                              className="text-[#00ff41] hover:text-[#00dd38] transition-colors"
                            >
                              {copied ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            {explorerUrl && (
                              <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00ff41] hover:text-[#00dd38]"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {invoice.paidAt && (
                            <p className="text-center text-xs text-[#666] mt-2">
                              Paid on {formatDate(invoice.paidAt)}
                            </p>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Right — Select Asset + Pay */}
                  <div className="lg:col-span-2 space-y-4">
                    {(state === "ready" || state === "paying") && (
                      <>
                        {/* Select Asset */}
                        <div className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-5">
                          <h3 className="text-sm font-semibold text-white mb-4">
                            Select Asset
                          </h3>
                          <div className="space-y-2">
                            {ASSETS.map((asset, i) => (
                              <button
                                key={asset.symbol}
                                onClick={() => setSelectedAsset(i)}
                                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                  selectedAsset === i
                                    ? "bg-[#00ff41]/5 border border-[#00ff41]/30"
                                    : "bg-[#1a1a1a] border border-[#333] hover:border-[#555]"
                                }`}
                              >
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    selectedAsset === i
                                      ? "bg-[#00ff41] text-black"
                                      : "bg-[#333] text-[#888]"
                                  }`}
                                >
                                  {asset.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-white">
                                    {asset.symbol}
                                  </div>
                                  <div className="text-[11px] text-[#666]">
                                    {asset.network}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-mono text-white">
                                    {i === 0
                                      ? invoice.total.toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                        })
                                      : i === 1
                                      ? `~${(invoice.total / 170).toFixed(2)}`
                                      : `~${(invoice.total / 67000).toFixed(
                                          3,
                                        )}`}
                                  </div>
                                </div>
                                {selectedAsset === i && (
                                  <CheckCircle2 className="h-4 w-4 text-[#00ff41] shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Pay Button */}
                        <div>
                          {error && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 mb-3">
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {error}
                            </div>
                          )}

                          {connecting ? (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-[#00ff41]" />
                              <span className="text-sm text-[#666]">
                                Initializing wallet...
                              </span>
                            </div>
                          ) : !connected ? (
                            <button
                              onClick={() => openWalletModal(true)}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00ff41] py-4 text-sm font-bold text-black hover:bg-[#00dd38] transition-colors"
                            >
                              <Wallet className="h-4 w-4" />
                              Connect Wallet to Pay
                            </button>
                          ) : (
                            <button
                              onClick={handlePay}
                              disabled={state === "paying"}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00ff41] py-4 text-sm font-bold text-black hover:bg-[#00dd38] transition-colors disabled:opacity-50"
                            >
                              {state === "paying" ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Processing Payment...
                                </>
                              ) : (
                                <>
                                  Pay $
                                  {invoice.total.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  })}
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Copy Address / QR */}
                        <div className="flex items-center justify-center gap-4">
                          <button className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition-colors">
                            <Copy className="h-3.5 w-3.5" />
                            Copy Address
                          </button>
                          <button className="flex items-center gap-1.5 text-xs text-[#666] hover:text-white transition-colors">
                            <QrCode className="h-3.5 w-3.5" />
                            View QR
                          </button>
                        </div>

                        {/* Network Fees Info */}
                        <div className="rounded-xl bg-[#141414] border border-[#1f1f1f] p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-[#00ff41]" />
                            <span className="text-sm font-semibold text-white">
                              Network Fees
                            </span>
                          </div>
                          <p className="text-xs text-[#666] leading-relaxed">
                            Payments are processed instantly on-chain. Gas fees
                            are calculated at execution. Ensure your wallet has
                            sufficient balance for network overhead.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* SETTLR watermark */}
                <div className="mt-16 text-[80px] font-bold text-[#141414] tracking-tight leading-none select-none">
                  SETTLR
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between py-6 border-t border-[#1f1f1f] mt-4 text-[10px] text-[#444] uppercase tracking-wider">
                  <span>Clearing Node: US-WEST-B1 // 8.192.12.4</span>
                  <span>
                    System Time:{" "}
                    {new Date().toISOString().replace("T", " ").slice(0, 19)}{" "}
                    UTC
                  </span>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
