"use client";

import { useState, useEffect, useRef } from "react";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { QRCodeSVG } from "qrcode.react";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { useWalletModal } from "@/components/WalletModal";
import {
  Loader2,
  CheckCircle2,
  Wallet,
  QrCode,
  RotateCcw,
  Smartphone,
} from "lucide-react";

type Status = "idle" | "awaiting" | "paid";

const PRESETS = [25, 50, 100, 250];

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function TerminalPage() {
  const { publicKey, connected } = useActiveWallet();
  const { setVisible: openWalletModal } = useWalletModal();

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [solanaUrl, setSolanaUrl] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const referenceRef = useRef<PublicKey | null>(null);

  const startSale = () => {
    const value = parseFloat(amount);
    if (!publicKey || !value || value <= 0) return;

    // A unique reference key lets us watch the chain for THIS exact payment
    // (standard Solana Pay pattern).
    const reference = Keypair.generate().publicKey;
    referenceRef.current = reference;

    const params = new URLSearchParams({
      amount: value.toString(),
      "spl-token": USDC_MINT_ADDRESS,
      reference: reference.toBase58(),
      label: "Offbank",
      message: `Payment of ${fmtUSD(value)}`,
    });
    setSolanaUrl(`solana:${publicKey}?${params.toString()}`);
    setPaidAmount(value);
    setStatus("awaiting");
  };

  const reset = () => {
    referenceRef.current = null;
    setSolanaUrl("");
    setAmount("");
    setStatus("idle");
  };

  // Watch the chain for the payment to this sale's reference.
  useEffect(() => {
    if (status !== "awaiting" || !referenceRef.current) return;
    const reference = referenceRef.current;
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    let cancelled = false;

    const id = setInterval(async () => {
      try {
        const sigs = await connection.getSignaturesForAddress(reference, {
          limit: 1,
        });
        if (cancelled || sigs.length === 0) return;
        const sig = sigs[0];
        if (sig.err) return;
        // Confirmed payment carrying our reference → done.
        if (sig.confirmationStatus === "confirmed" || sig.confirmationStatus === "finalized") {
          cancelled = true;
          clearInterval(id);
          setStatus("paid");
        }
      } catch {
        /* transient RPC error — keep polling */
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status]);

  if (!connected || !publicKey) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <QrCode className="mx-auto h-10 w-10 text-[#94A3B8]" />
        <h1 className="mt-4 text-xl font-bold text-[#212121]">Terminal</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Connect your wallet to take payments.
        </p>
        <button
          onClick={() => openWalletModal(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#34c759] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2ba048]"
        >
          <Wallet className="h-4 w-4" />
          Connect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#212121]">Terminal</h1>
        <p className="mt-0.5 text-sm text-[#94A3B8]">
          Take a payment — customer scans, pays in seconds, settles instantly.
        </p>
      </div>

      {/* ── PAID ─────────────────────────────────────── */}
      {status === "paid" ? (
        <div className="rounded-2xl border border-[#34c759]/30 bg-[#34c759]/5 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34c759]">
            <CheckCircle2 className="h-9 w-9 text-white" />
          </div>
          <p className="mt-4 text-sm font-medium text-[#2ba048]">Payment received</p>
          <p className="mt-1 text-4xl font-bold text-[#212121]">{fmtUSD(paidAmount)}</p>
          <p className="mt-1 text-sm text-[#64748B]">Settled instantly · no chargebacks</p>
          <button
            onClick={reset}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#212121] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            New sale
          </button>
        </div>
      ) : status === "awaiting" ? (
        /* ── AWAITING ──────────────────────────────── */
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center">
          <p className="text-sm text-[#64748B]">Amount due</p>
          <p className="text-4xl font-bold text-[#212121]">{fmtUSD(paidAmount)}</p>
          <div className="mx-auto mt-6 w-fit rounded-xl border border-[#E2E8F0] bg-white p-4">
            <QRCodeSVG value={solanaUrl} size={220} level="M" />
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#64748B]">
            <Smartphone className="h-4 w-4" />
            Scan with any Solana wallet to pay
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for payment…
          </div>
          <button
            onClick={reset}
            className="mt-6 text-sm text-[#94A3B8] hover:text-[#212121]"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* ── IDLE (enter amount) ───────────────────── */
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
          <label className="text-sm font-medium text-[#64748B]">Amount</label>
          <div className="mt-2 flex items-center rounded-xl border border-[#E2E8F0] px-4 py-3">
            <span className="text-2xl font-semibold text-[#94A3B8]">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full bg-transparent pl-2 text-3xl font-bold text-[#212121] outline-none"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="rounded-lg border border-[#E2E8F0] py-2 text-sm font-semibold text-[#212121] hover:bg-[#F8FAFC]"
              >
                ${p}
              </button>
            ))}
          </div>
          <button
            onClick={startSale}
            disabled={!amount || parseFloat(amount) <= 0}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#34c759] py-3.5 text-sm font-semibold text-white hover:bg-[#2ba048] disabled:opacity-50"
          >
            <QrCode className="h-4 w-4" />
            Charge {amount ? fmtUSD(parseFloat(amount)) : ""}
          </button>
        </div>
      )}
    </div>
  );
}
