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
  HelpCircle,
  Settings,
  Bell,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

import {
  SOLANA_RPC_URL,
  USDC_MINT,
  USDC_MINT_ADDRESS,
  IS_DEVNET,
} from "@/lib/constants";

/* ─── Solana config ─── */
const RPC_ENDPOINT = SOLANA_RPC_URL;
const USDC_DECIMALS = 6;

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

const PAYMENT_METHODS = [
  { symbol: "USDC", label: "US Dollar (USDC)", icon: "$", selected: true },
  { symbol: "SOL", label: "SOL Balance", icon: "S", selected: false },
  { symbol: "PYUSD", label: "PayPal USD", icon: "P", selected: false },
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
      setError(
        "Your account does not support payments. Please try a different sign-in method.",
      );
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
            `Insufficient balance. You have $${balance.toFixed(
              2,
            )} but need $${invoice.total.toFixed(2)}`,
          );
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("Insufficient"))
          throw err;
        throw new Error(
          "Payment account not found. Please ensure your account is funded.",
        );
      }

      const amountLamports = BigInt(
        Math.round(invoice.total * Math.pow(10, USDC_DECIMALS)),
      );
      const PLATFORM_FEE_BPS = BigInt(100); // 1%
      const PROGRAM_ID = new PublicKey(
        "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5",
      );
      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID,
      );
      const platformFee = (amountLamports * PLATFORM_FEE_BPS) / BigInt(10000);
      const merchantAmount = amountLamports - platformFee;
      const treasuryBalanceBefore = platformFee
        ? BigInt(
            (await connection
              .getTokenAccountBalance(treasuryPDA)
              .then((b) => b.value.amount)
              .catch(() => "0")) || "0",
          )
        : BigInt(0);

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
          merchantAmount,
        ),
      );

      if (platformFee > BigInt(0)) {
        transaction.add(
          createTransferInstruction(
            userAta,
            treasuryPDA,
            userPubkey,
            platformFee,
          ),
        );
      }

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

      const status = await connection.getSignatureStatuses([sig], {
        searchTransactionHistory: true,
      });
      const txStatus = status.value[0];
      if (!txStatus || txStatus.err) {
        throw new Error("Invoice payment failed on-chain confirmation");
      }

      if (platformFee > BigInt(0)) {
        const treasuryBalanceAfter = BigInt(
          (await connection
            .getTokenAccountBalance(treasuryPDA)
            .then((b) => b.value.amount)
            .catch(() => "0")) || "0",
        );
        const feeCredited = treasuryBalanceAfter - treasuryBalanceBefore;
        if (feeCredited < platformFee) {
          throw new Error(
            `Platform fee not credited: expected >= ${platformFee}, got ${feeCredited}`,
          );
        }
      }

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

      // Trigger auto off-ramp for the merchant (fire-and-forget)
      if (invoice.merchantWallet && invoice.total > 0 && sig) {
        fetch("/api/auto-offramp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantWallet: invoice.merchantWallet,
            amount: invoice.total,
            txSignature: sig,
          }),
        }).catch(() => {});
      }
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
    <div className="min-h-screen bg-[#f7f7f7] text-[#212121]">
      {/* Header */}
      <header className="border-b border-[#d3d3d3] px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold text-[#34c759] tracking-tight"
            >
              Settlr
            </Link>
            <span className="text-sm font-medium text-[#212121] underline underline-offset-4">
              Payment
            </span>
            <Link
              href="/help"
              className="text-sm text-[#5c5c5c] hover:text-[#212121] transition-colors"
            >
              Help Center
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#5c5c5c] hover:text-[#212121] transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <button className="text-[#5c5c5c] hover:text-[#212121] transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <div className="h-8 w-8 rounded-full bg-[#f2f2f2] border border-[#d3d3d3] flex items-center justify-center">
              <span className="text-xs text-[#8a8a8a]">
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
              <Loader2 className="h-8 w-8 animate-spin text-[#34c759]" />
              <p className="text-sm text-[#5c5c5c]">Loading invoice...</p>
            </motion.div>
          )}

          {/* Not found */}
          {state === "not-found" && (
            <motion.div
              key="not-found"
              {...fadeIn}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f2f2f2]">
                <FileText className="h-8 w-8 text-[#5c5c5c]" />
              </div>
              <h2 className="text-xl font-bold text-[#212121]">
                Invoice Not Found
              </h2>
              <p className="mt-2 text-sm text-[#5c5c5c]">
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
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#e74c3c]/10">
                <XCircle className="h-8 w-8 text-[#e74c3c]" />
              </div>
              <h2 className="text-xl font-bold text-[#212121]">
                Invoice Cancelled
              </h2>
              <p className="mt-2 text-sm text-[#5c5c5c]">
                Invoice #{invoice.invoiceNumber} from{" "}
                <strong className="text-[#212121]">
                  {invoice.merchantName}
                </strong>{" "}
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
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#e74c3c]/10">
                <AlertCircle className="h-8 w-8 text-[#e74c3c]" />
              </div>
              <h2 className="text-xl font-bold text-[#212121]">
                Something Went Wrong
              </h2>
              <p className="mt-2 text-sm text-[#5c5c5c]">
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
                  <div className="text-[11px] text-[#34c759] uppercase tracking-[0.15em] font-semibold mb-2">
                    Invoice #{invoice.invoiceNumber}
                  </div>
                  <h1 className="text-3xl font-bold text-[#212121] tracking-tight mb-2">
                    {invoice.lineItems[0]?.description || "Invoice Payment"}
                  </h1>
                  <p className="text-sm text-[#8a8a8a]">
                    From{" "}
                    <span className="text-[#212121] font-medium">
                      {invoice.merchantName}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left — Invoice Details */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Amount Due Card */}
                    <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider font-semibold">
                          Amount Due
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-4xl font-bold text-[#212121] tracking-tight">
                          $
                          {invoice.total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-lg text-[#5c5c5c]">USD</span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#d3d3d3]">
                        <div>
                          <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">
                            Due Date
                          </span>
                          <span className="text-sm font-medium text-[#212121]">
                            {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">
                            Status
                          </span>
                          <span
                            className={`text-sm font-medium flex items-center gap-1.5 ${
                              state === "success" || state === "already-paid"
                                ? "text-[#34c759]"
                                : isOverdue
                                ? "text-[#d29500]"
                                : "text-[#34c759]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                state === "success" || state === "already-paid"
                                  ? "bg-[#34c759]"
                                  : isOverdue
                                  ? "bg-[#ffc107]"
                                  : "bg-[#34c759]"
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
                    <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
                      <span className="text-[10px] text-[#8a8a8a] uppercase tracking-wider font-semibold block mb-4">
                        Line Items
                      </span>
                      <div className="space-y-3">
                        {invoice.lineItems.map((li, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2"
                          >
                            <span className="text-sm text-[#212121]">
                              {li.description}
                            </span>
                            <span className="text-sm font-mono text-[#212121]">
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
                    <div className="flex items-center gap-2 text-xs text-[#8a8a8a]">
                      <Shield className="h-3.5 w-3.5 text-[#34c759]" />
                      Secured by Settlr · Payments settle instantly
                    </div>

                    {/* Success / Already paid TX info */}
                    {(state === "success" || state === "already-paid") &&
                      txSignature && (
                        <div className="rounded-xl bg-[#34c759]/5 border border-[#34c759]/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-[#34c759]" />
                            <span className="text-sm font-semibold text-[#34c759]">
                              {state === "success"
                                ? "Payment Successful!"
                                : "This invoice has been paid"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-[#f2f2f2] border border-[#d3d3d3] px-3 py-2">
                            <code className="flex-1 truncate text-xs text-[#5c5c5c] font-mono">
                              {txSignature}
                            </code>
                            <button
                              onClick={copySignature}
                              className="text-[#34c759] hover:text-[#2ba048] transition-colors"
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
                                className="text-[#34c759] hover:text-[#2ba048]"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {invoice.paidAt && (
                            <p className="text-center text-xs text-[#5c5c5c] mt-2">
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
                        {/* Payment Method */}
                        <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5">
                          <h3 className="text-sm font-semibold text-[#212121] mb-4">
                            Payment Method
                          </h3>
                          <div className="space-y-2">
                            {PAYMENT_METHODS.map((method, i) => (
                              <button
                                key={method.symbol}
                                onClick={() => setSelectedAsset(i)}
                                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                                  selectedAsset === i
                                    ? "bg-[#34c759]/5 border border-[#34c759]/30"
                                    : "bg-[#f2f2f2] border border-[#d3d3d3] hover:border-[#8a8a8a]"
                                }`}
                              >
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    selectedAsset === i
                                      ? "bg-[#34c759] text-black"
                                      : "bg-[#5c5c5c] text-[#8a8a8a]"
                                  }`}
                                >
                                  {method.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-[#212121]">
                                    {method.label}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-mono text-[#212121]">
                                    $
                                    {i === 0
                                      ? invoice.total.toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                        })
                                      : i === 1
                                      ? `~${(invoice.total / 170).toFixed(2)}`
                                      : invoice.total.toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                        })}
                                  </div>
                                </div>
                                {selectedAsset === i && (
                                  <CheckCircle2 className="h-4 w-4 text-[#34c759] shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Pay Button */}
                        <div>
                          {error && (
                            <div className="flex items-start gap-2 rounded-lg bg-[#e74c3c]/10 border border-[#e74c3c]/20 p-3 text-xs text-[#e74c3c] mb-3">
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {error}
                            </div>
                          )}

                          {connecting ? (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-[#34c759]" />
                              <span className="text-sm text-[#5c5c5c]">
                                Connecting...
                              </span>
                            </div>
                          ) : !connected ? (
                            <div className="space-y-3">
                              <button
                                onClick={() => openWalletModal(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#34c759] py-4 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
                              >
                                <Wallet className="h-4 w-4" />
                                Sign In to Pay
                              </button>
                              {
                                <>
                                  <div className="flex items-center gap-3 text-[#8a8a8a] text-xs">
                                    <div className="flex-1 h-px bg-[#d3d3d3]" />
                                    <span>no crypto?</span>
                                    <div className="flex-1 h-px bg-[#d3d3d3]" />
                                  </div>

                                  {/* Card — up to $5K */}
                                  {(invoice?.total || 0) <= 5000 && (
                                    <button
                                      onClick={() => {
                                        const params = new URLSearchParams({
                                          apiKey:
                                            process.env
                                              .NEXT_PUBLIC_MOONPAY_API_KEY ||
                                            "",
                                          currencyCode: "usdc_sol",
                                          baseCurrencyCode: "usd",
                                          baseCurrencyAmount: (
                                            invoice?.total || 0
                                          ).toString(),
                                          colorCode: "#34c759",
                                          language: "en",
                                          redirectURL: window.location.href,
                                          showWalletAddressForm: "true",
                                        });
                                        window.open(
                                          `https://buy.moonpay.com?${params.toString()}`,
                                          "moonpay-onramp",
                                          "width=500,height=700,toolbar=no,menubar=no,scrollbars=yes",
                                        );
                                      }}
                                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f2f2f2] py-4 text-sm font-semibold text-[#212121] border border-[#d3d3d3] hover:bg-[#d3d3d3]/50 transition-colors"
                                    >
                                      <CreditCard className="h-4 w-4" />
                                      Pay with Card (~5 min)
                                    </button>
                                  )}

                                  {/* Bank transfer — $100–$100K */}
                                  {(invoice?.total || 0) >= 100 &&
                                    (invoice?.total || 0) <= 100000 && (
                                      <button
                                        onClick={() => {
                                          const params = new URLSearchParams({
                                            amount: (
                                              invoice?.total || 0
                                            ).toString(),
                                            currency: "usdc",
                                            network: "solana",
                                          });
                                          window.open(
                                            `https://spherepay.co/buy?${params.toString()}`,
                                            "sphere-onramp",
                                            "width=600,height=750,toolbar=no,menubar=no,scrollbars=yes",
                                          );
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f2f2f2] py-4 text-sm font-semibold text-[#212121] border border-[#d3d3d3] hover:bg-[#d3d3d3]/50 transition-colors"
                                      >
                                        <Building2 className="h-4 w-4" />
                                        Bank Transfer / ACH
                                        {(invoice?.total || 0) > 5000
                                          ? " (Recommended)"
                                          : ""}
                                      </button>
                                    )}

                                  {/* OTC — $25K+ */}
                                  {(invoice?.total || 0) >= 25000 && (
                                    <button
                                      onClick={() => {
                                        // For invoices, direct to contact for OTC
                                        window.open(
                                          `mailto:otc@settlr.app?subject=OTC Quote Request — Invoice ${
                                            invoice?.invoiceNumber || ""
                                          }&body=Amount: $${(
                                            invoice?.total || 0
                                          ).toLocaleString()} USDC`,
                                          "_blank",
                                        );
                                      }}
                                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f2f2f2] py-4 text-sm font-semibold text-[#212121] border border-[#d3d3d3] hover:bg-[#d3d3d3]/50 transition-colors"
                                    >
                                      <Building2 className="h-4 w-4" />
                                      OTC Desk — Large Transfer
                                      {(invoice?.total || 0) >= 100000
                                        ? " (Recommended)"
                                        : ""}
                                    </button>
                                  )}

                                  {(invoice?.total || 0) > 5000 && (
                                    <p className="text-center text-[#8a8a8a] text-xs">
                                      Card limited to $5K. Bank transfer or OTC
                                      recommended for this amount.
                                    </p>
                                  )}
                                </>
                              }
                            </div>
                          ) : (
                            <button
                              onClick={handlePay}
                              disabled={state === "paying"}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#34c759] py-4 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors disabled:opacity-50"
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

                        {/* Share options */}
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                window.location.href,
                              );
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex items-center gap-1.5 text-xs text-[#5c5c5c] hover:text-[#212121] transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copied ? "Copied!" : "Copy Payment Link"}
                          </button>
                        </div>

                        {/* Payment info */}
                        <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-[#34c759]" />
                            <span className="text-sm font-semibold text-[#212121]">
                              Instant Settlement
                            </span>
                          </div>
                          <p className="text-xs text-[#5c5c5c] leading-relaxed">
                            Your payment settles in seconds — no hold periods,
                            no processing delays. A small network fee (typically
                            &lt;$0.01) applies.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center py-8 border-t border-[#d3d3d3] mt-8 text-[10px] text-[#d3d3d3] uppercase tracking-wider">
                  <span>
                    Powered by{" "}
                    <Link
                      href="/"
                      className="text-[#8a8a8a] hover:text-[#212121] transition-colors"
                    >
                      Settlr
                    </Link>{" "}
                    · Instant business payments
                  </span>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
