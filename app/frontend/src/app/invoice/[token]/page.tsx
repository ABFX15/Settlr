"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
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
} from "lucide-react";
import Link from "next/link";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

/* ─── Palette ─── */
const CREAM = "#FDFBF7";
const NAVY = "#0C1829";
const SLATE = "#3B4963";
const MUTED = "#7C8A9E";
const GREEN = "#1B6B4A";
const ACCENT = "#2A9D6A";
const TOPO = "#E8E4DA";
const CARD_BORDER = "#E2DFD5";

/* ─── Solana config ─── */
const RPC_ENDPOINT = "https://api.devnet.solana.com";
const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);
const USDC_DECIMALS = 6;
const IS_DEVNET = RPC_ENDPOINT.includes("devnet");

/* ─── Base58 encoder ─── */
const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function encodeBase58(bytes: Uint8Array): string {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = "";
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result += BASE58_ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }
  return result;
}

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

/* ─── Animations ─── */
const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function InvoicePayPage({
  params: paramsPromise,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const [state, setState] = useState<PageState>("loading");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Unwrap params
  useEffect(() => {
    paramsPromise.then((p) => setToken(p.token));
  }, [paramsPromise]);

  // Fetch invoice
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

  // Active Solana wallet — walletClientType isn't on the SDK type,
  // so cast through an intermediate type (same pattern as CheckoutClient).
  type WalletWithClientType = {
    walletClientType?: string;
    connected?: boolean;
    address: string;
  };
  const activeWallet = wallets.find(
    (w) => (w as unknown as WalletWithClientType).walletClientType !== "privy",
  );
  const embeddedWallet = wallets.find(
    (w) => (w as unknown as WalletWithClientType).walletClientType === "privy",
  );
  const payerWallet = activeWallet || embeddedWallet;

  // Handle payment
  const handlePay = async () => {
    if (!invoice || !payerWallet) return;
    setState("paying");
    setError(null);

    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const userPubkey = new PublicKey(payerWallet.address);
      const merchantPubkey = new PublicKey(invoice.merchantWallet);

      // Get associated token accounts
      const userAta = await getAssociatedTokenAddress(USDC_MINT, userPubkey);
      const merchantAta = await getAssociatedTokenAddress(
        USDC_MINT,
        merchantPubkey,
      );

      // Check balance
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
        if (err instanceof Error && err.message.includes("Insufficient")) {
          throw err;
        }
        throw new Error(
          "USDC token account not found. Please fund your wallet.",
        );
      }

      const amountLamports = BigInt(
        Math.round(invoice.total * Math.pow(10, USDC_DECIMALS)),
      );

      const transaction = new Transaction();

      // Ensure merchant ATA exists
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

      // Transfer USDC
      transaction.add(
        createTransferInstruction(
          userAta,
          merchantAta,
          userPubkey,
          amountLamports,
        ),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      const result = await signAndSendTransaction({
        transaction: serializedTx,
        wallet: payerWallet,
        chain: IS_DEVNET ? "solana:devnet" : "solana:mainnet",
        options: { skipPreflight: true, commitment: "confirmed" },
      });

      const sig = encodeBase58(result.signature);
      setTxSignature(sig);

      // Record payment on backend
      await fetch(`/api/invoices/view/${token}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentSignature: sig,
          payerWallet: payerWallet.address,
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

  // Date formatting
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

  /* ─── Render ────────────────────────────────────────────────────── */

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 pb-12 pt-8"
      style={{ background: CREAM }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
          >
            settlr
          </span>
        </Link>
        <p className="mt-1 text-xs" style={{ color: MUTED }}>
          Secure stablecoin payments
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Loading ─── */}
        {state === "loading" && (
          <motion.div
            key="loading"
            {...fadeIn}
            className="flex flex-col items-center gap-3 py-20"
          >
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: GREEN }}
            />
            <p className="text-sm" style={{ color: MUTED }}>
              Loading invoice…
            </p>
          </motion.div>
        )}

        {/* ─── Not found ─── */}
        {state === "not-found" && (
          <motion.div
            key="not-found"
            {...fadeIn}
            className="max-w-md text-center"
          >
            <div
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: TOPO }}
            >
              <FileText className="h-8 w-8" style={{ color: MUTED }} />
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
            >
              Invoice Not Found
            </h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              This invoice link is invalid or has expired.
            </p>
          </motion.div>
        )}

        {/* ─── Cancelled ─── */}
        {state === "cancelled" && invoice && (
          <motion.div
            key="cancelled"
            {...fadeIn}
            className="max-w-md text-center"
          >
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
            >
              Invoice Cancelled
            </h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Invoice #{invoice.invoiceNumber} from{" "}
              <strong>{invoice.merchantName}</strong> has been cancelled.
            </p>
          </motion.div>
        )}

        {/* ─── Error ─── */}
        {state === "error" && (
          <motion.div key="error" {...fadeIn} className="max-w-md text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2
              className="text-xl font-bold"
              style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
            >
              Something Went Wrong
            </h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              {error || "Please try again later."}
            </p>
          </motion.div>
        )}

        {/* ─── Ready / Already Paid / Success ─── */}
        {(state === "ready" ||
          state === "paying" ||
          state === "success" ||
          state === "already-paid") &&
          invoice && (
            <motion.div key="invoice" {...fadeIn} className="w-full max-w-xl">
              {/* Invoice card */}
              <div
                className="overflow-hidden rounded-2xl border shadow-sm"
                style={{
                  borderColor: CARD_BORDER,
                  background: "white",
                }}
              >
                {/* Header stripe */}
                <div className="px-6 py-5" style={{ background: NAVY }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-white/50">
                        Invoice
                      </p>
                      <p
                        className="mt-0.5 text-lg font-bold text-white"
                        style={{ fontFamily: "var(--font-jetbrains)" }}
                      >
                        #{invoice.invoiceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50">From</p>
                      <p className="text-sm font-semibold text-white">
                        {invoice.merchantName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                {(state === "success" || state === "already-paid") && (
                  <div
                    className="flex items-center gap-2 px-6 py-3"
                    style={{ background: "#ECFDF5" }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      {state === "success"
                        ? "Payment Successful!"
                        : "This invoice has been paid"}
                    </span>
                  </div>
                )}

                {isOverdue && state === "ready" && (
                  <div className="flex items-center gap-2 bg-amber-50 px-6 py-3">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">
                      Past due
                    </span>
                  </div>
                )}

                {/* Bill to + dates */}
                <div
                  className="grid grid-cols-2 gap-4 border-b px-6 py-4"
                  style={{ borderColor: CARD_BORDER }}
                >
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: MUTED }}
                    >
                      Bill To
                    </p>
                    <p
                      className="mt-1 text-sm font-medium"
                      style={{ color: NAVY }}
                    >
                      {invoice.buyerName}
                    </p>
                    {invoice.buyerCompany && (
                      <p className="text-xs" style={{ color: SLATE }}>
                        {invoice.buyerCompany}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: MUTED }}
                      >
                        Issued
                      </p>
                      <p className="mt-0.5 text-sm" style={{ color: SLATE }}>
                        {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: isOverdue ? "#D97706" : MUTED }}
                      >
                        Due Date
                      </p>
                      <p
                        className="mt-0.5 text-sm font-medium"
                        style={{
                          color: isOverdue ? "#D97706" : SLATE,
                        }}
                      >
                        {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Line items table */}
                <div className="px-6 py-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="border-b text-xs font-semibold uppercase tracking-wider"
                        style={{
                          borderColor: CARD_BORDER,
                          color: MUTED,
                        }}
                      >
                        <th className="pb-2 text-left">Description</th>
                        <th className="pb-2 text-right">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((li, i) => (
                        <tr
                          key={i}
                          className="border-b"
                          style={{ borderColor: `${CARD_BORDER}80` }}
                        >
                          <td className="py-2.5" style={{ color: NAVY }}>
                            {li.description}
                          </td>
                          <td
                            className="py-2.5 text-right"
                            style={{
                              color: SLATE,
                              fontFamily: "var(--font-jetbrains)",
                            }}
                          >
                            {li.quantity}
                          </td>
                          <td
                            className="py-2.5 text-right"
                            style={{
                              color: SLATE,
                              fontFamily: "var(--font-jetbrains)",
                            }}
                          >
                            $
                            {li.unitPrice.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className="py-2.5 text-right font-medium"
                            style={{
                              color: NAVY,
                              fontFamily: "var(--font-jetbrains)",
                            }}
                          >
                            $
                            {li.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="ml-auto mt-4 max-w-[200px] space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: MUTED }}>Subtotal</span>
                      <span
                        style={{
                          color: NAVY,
                          fontFamily: "var(--font-jetbrains)",
                        }}
                      >
                        $
                        {invoice.subtotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {invoice.taxAmount != null && invoice.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span style={{ color: MUTED }}>
                          Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ""}
                        </span>
                        <span
                          style={{
                            color: NAVY,
                            fontFamily: "var(--font-jetbrains)",
                          }}
                        >
                          $
                          {invoice.taxAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    <div
                      className="flex justify-between border-t pt-2 text-base font-bold"
                      style={{ borderColor: CARD_BORDER }}
                    >
                      <span style={{ color: NAVY }}>Total</span>
                      <span style={{ color: GREEN }}>
                        $
                        {invoice.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <p
                      className="text-right text-[10px] uppercase tracking-wider"
                      style={{ color: MUTED }}
                    >
                      {invoice.currency}
                    </p>
                  </div>
                </div>

                {/* Memo */}
                {invoice.memo && (
                  <div
                    className="border-t px-6 py-3"
                    style={{ borderColor: CARD_BORDER }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: MUTED }}
                    >
                      Notes
                    </p>
                    <p className="mt-1 text-sm" style={{ color: SLATE }}>
                      {invoice.memo}
                    </p>
                  </div>
                )}

                {/* Payment section */}
                <div
                  className="border-t px-6 py-5"
                  style={{ borderColor: CARD_BORDER }}
                >
                  {/* Paying-to disclosure — always visible */}
                  {invoice.merchantWallet &&
                    state !== "already-paid" &&
                    state !== "success" && (
                      <div
                        className="mb-4 flex items-center justify-between rounded-xl px-4 py-2.5"
                        style={{ background: `${TOPO}40` }}
                      >
                        <div className="flex items-center gap-2">
                          <Shield
                            className="h-3.5 w-3.5"
                            style={{ color: GREEN }}
                          />
                          <span
                            className="text-xs font-medium"
                            style={{ color: SLATE }}
                          >
                            Paying to
                          </span>
                        </div>
                        <span
                          className="text-xs"
                          style={{
                            color: NAVY,
                            fontFamily: "var(--font-jetbrains)",
                          }}
                        >
                          {invoice.merchantWallet.slice(0, 4)}…
                          {invoice.merchantWallet.slice(-4)}
                        </span>
                      </div>
                    )}
                  {/* Already paid / Success — show tx */}
                  {(state === "success" || state === "already-paid") &&
                    txSignature && (
                      <div className="space-y-3">
                        <div
                          className="flex items-center justify-between rounded-xl p-3"
                          style={{ background: "#F0FDF4" }}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-green-700">
                              Transaction
                            </p>
                            <p
                              className="truncate text-xs"
                              style={{
                                color: SLATE,
                                fontFamily: "var(--font-jetbrains)",
                              }}
                            >
                              {txSignature}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={copySignature}
                              className="rounded-lg p-2 transition-colors hover:bg-green-100"
                            >
                              {copied ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-green-600" />
                              )}
                            </button>
                            {explorerUrl && (
                              <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 transition-colors hover:bg-green-100"
                              >
                                <ExternalLink className="h-3.5 w-3.5 text-green-600" />
                              </a>
                            )}
                          </div>
                        </div>
                        {invoice.paidAt && (
                          <p
                            className="text-center text-xs"
                            style={{ color: MUTED }}
                          >
                            Paid on {formatDate(invoice.paidAt)}
                          </p>
                        )}
                      </div>
                    )}

                  {/* Ready / Paying — show connect or pay button */}
                  {(state === "ready" || state === "paying") && (
                    <div className="space-y-3">
                      {error && (
                        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {error}
                        </div>
                      )}

                      {!ready || !walletsReady ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Loader2
                            className="h-5 w-5 animate-spin"
                            style={{ color: GREEN }}
                          />
                          <span className="text-sm" style={{ color: MUTED }}>
                            Initializing wallet…
                          </span>
                        </div>
                      ) : !authenticated ? (
                        <button
                          onClick={login}
                          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: GREEN }}
                        >
                          <Wallet className="h-4 w-4" />
                          Connect Wallet to Pay
                        </button>
                      ) : !payerWallet ? (
                        <div className="text-center">
                          <p className="text-sm" style={{ color: MUTED }}>
                            No Solana wallet found.
                          </p>
                          <button
                            onClick={login}
                            className="mt-2 text-sm font-medium underline"
                            style={{ color: GREEN }}
                          >
                            Connect a wallet
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div
                            className="mb-3 flex items-center justify-between rounded-xl px-4 py-2.5"
                            style={{ background: `${TOPO}60` }}
                          >
                            <div className="flex items-center gap-2">
                              <Wallet
                                className="h-4 w-4"
                                style={{ color: GREEN }}
                              />
                              <span
                                className="text-xs"
                                style={{
                                  color: SLATE,
                                  fontFamily: "var(--font-jetbrains)",
                                }}
                              >
                                {payerWallet.address.slice(0, 4)}…
                                {payerWallet.address.slice(-4)}
                              </span>
                            </div>
                            <span className="text-xs" style={{ color: MUTED }}>
                              {(payerWallet as unknown as WalletWithClientType)
                                .walletClientType === "privy"
                                ? "Embedded"
                                : (
                                    payerWallet as unknown as WalletWithClientType
                                  ).walletClientType || "Wallet"}
                            </span>
                          </div>
                          <button
                            onClick={handlePay}
                            disabled={state === "paying"}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: GREEN }}
                          >
                            {state === "paying" ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing Payment…
                              </>
                            ) : (
                              <>
                                Pay $
                                {invoice.total.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                USDC
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Trust footer */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" style={{ color: MUTED }} />
                  <span className="text-xs" style={{ color: MUTED }}>
                    On-chain settlement
                  </span>
                </div>
                <span style={{ color: CARD_BORDER }}>|</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" style={{ color: MUTED }} />
                  <span className="text-xs" style={{ color: MUTED }}>
                    Powered by Settlr
                  </span>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
