"use client";

/**
 * Embeddable checkout — rendered inside an iframe on a merchant's own site
 * (via /embed.js). Two ways to pay USDC straight to the merchant's wallet:
 *
 *   1. Pay with wallet — connect an injected browser wallet (Phantom/Solflare)
 *      and approve the transfer in-page.
 *   2. Scan the Solana Pay QR — pay from any wallet on another device.
 *
 * Either way we confirm on-chain, close out the checkout session (which fires
 * the merchant webhook), and postMessage the result to the parent page. No
 * Settlr login required of the buyer.
 */

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Status = "loading" | "awaiting" | "paying" | "paid" | "error";

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function postToParent(msg: Record<string, unknown>) {
  try {
    window.parent?.postMessage(msg, "*");
  } catch {
    /* not framed — ignore */
  }
}

/** The injected Solana wallet provider, if the buyer has one (Phantom/Solflare). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSolanaProvider(): any | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.phantom?.solana || (w.solana?.isPhantom && w.solana) || w.solflare || w.solana || null;
}

function EmbedCheckout() {
  const params = useSearchParams();
  const merchant = params.get("merchant") || "";
  const name = params.get("name") || "Merchant";
  const order = params.get("order") || "";
  const webhook = params.get("webhook") || "";
  const amount = parseFloat(params.get("amount") || "");

  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [solanaUrl, setSolanaUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const referenceRef = useRef<PublicKey | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const doneRef = useRef(false);

  // ── Set up the payment request (best-effort session + Solana Pay URL) ──
  useEffect(() => {
    let valid = true;
    try {
      // eslint-disable-next-line no-new
      new PublicKey(merchant);
    } catch {
      valid = false;
    }
    if (!valid || !amount || amount <= 0) {
      setError("This payment link is misconfigured.");
      setStatus("error");
      return;
    }

    setHasWallet(!!getSolanaProvider());

    const reference = Keypair.generate().publicKey;
    referenceRef.current = reference;

    const spParams = new URLSearchParams({
      amount: amount.toString(),
      "spl-token": USDC_MINT_ADDRESS,
      reference: reference.toBase58(),
      label: name,
      message: `Payment to ${name}${order ? ` · ${order}` : ""}`,
    });
    setSolanaUrl(`solana:${merchant}?${spParams.toString()}`);
    setStatus("awaiting");

    (async () => {
      try {
        const referrer =
          document.referrer || window.location.origin || "https://settlr.dev";
        const res = await fetch("/api/checkout/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId: merchant,
            merchantName: name,
            merchantWallet: merchant,
            amount,
            description: order || undefined,
            metadata: order ? { orderId: order } : undefined,
            successUrl: referrer,
            cancelUrl: referrer,
            webhookUrl: webhook || undefined,
          }),
        });
        if (res.ok) sessionIdRef.current = (await res.json()).id;
      } catch {
        /* session is optional — confirmation still works without it */
      }
    })();
  }, [merchant, name, order, webhook, amount]);

  // Shared success path: record the payment (fires webhook) + notify parent.
  const closeOut = useCallback(
    (signature: string, customerWallet: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      if (sessionIdRef.current) {
        fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            signature,
            customerWallet,
          }),
        }).catch(() => {});
      }
      setStatus("paid");
      postToParent({
        type: "settlr:checkout:success",
        sessionId: sessionIdRef.current,
        signature,
        amount,
      });
    },
    [amount],
  );

  // ── Path 1: pay with an injected browser wallet ──
  const payWithWallet = useCallback(async () => {
    setError(null);
    const provider = getSolanaProvider();
    if (!provider) {
      setError("No browser wallet found — scan the QR with your phone instead.");
      return;
    }
    setStatus("paying");
    try {
      const resp = await provider.connect();
      const buyer = new PublicKey(
        (resp?.publicKey || provider.publicKey).toString(),
      );
      const merchantPk = new PublicKey(merchant);
      const mint = new PublicKey(USDC_MINT_ADDRESS);
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");

      const buyerAta = await getAssociatedTokenAddress(mint, buyer);
      const merchantAta = await getAssociatedTokenAddress(mint, merchantPk);

      const tx = new Transaction();
      try {
        await getAccount(connection, merchantAta);
      } catch {
        // First time this merchant receives USDC — buyer covers the rent.
        tx.add(
          createAssociatedTokenAccountInstruction(
            buyer,
            merchantAta,
            merchantPk,
            mint,
          ),
        );
      }
      tx.add(
        createTransferInstruction(
          buyerAta,
          merchantAta,
          buyer,
          BigInt(Math.round(amount * 1_000_000)),
        ),
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = buyer;

      const out = await provider.signAndSendTransaction(tx);
      const signature: string = typeof out === "string" ? out : out.signature;

      const conf = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      if (conf.value.err) {
        throw new Error("Payment didn't settle — check your USDC balance.");
      }
      closeOut(signature, buyer.toBase58());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment failed.";
      setError(
        /reject|declin|cancel/i.test(msg) ? "Payment cancelled." : msg,
      );
      setStatus("awaiting");
    }
  }, [merchant, amount, closeOut]);

  // ── Path 2: watch the chain for a QR payment carrying this reference ──
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
        if (
          sig.confirmationStatus !== "confirmed" &&
          sig.confirmationStatus !== "finalized"
        )
          return;

        cancelled = true;
        clearInterval(id);
        const signature = sig.signature;

        let customerWallet = "unknown";
        try {
          const tx = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
          });
          const payer = tx?.transaction.message.accountKeys.find(
            (k) => k.signer,
          )?.pubkey;
          if (payer) customerWallet = payer.toBase58();
        } catch {
          /* ignore */
        }
        closeOut(signature, customerWallet);
      } catch {
        /* transient RPC error — keep polling */
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status, closeOut]);

  const copyLink = useCallback(() => {
    navigator.clipboard?.writeText(solanaUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }, [solanaUrl]);

  const cancel = () => postToParent({ type: "settlr:checkout:close" });

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-7 text-[#101828]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold tracking-tight">Settlr</span>
        <button
          onClick={cancel}
          aria-label="Close"
          className="rounded-full p-1.5 text-[#98a2b3] transition-colors hover:bg-[#f2f4f7] hover:text-[#475467]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {status === "error" && (
          <p className="max-w-xs text-sm text-[#d92d20]">{error}</p>
        )}

        {status === "loading" && (
          <p className="text-sm text-[#667085]">Preparing checkout…</p>
        )}

        {(status === "awaiting" || status === "paying") && (
          <>
            <p className="text-[13px] font-medium uppercase tracking-wide text-[#98a2b3]">
              Pay {name}
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {fmtUSD(amount)}
            </p>
            <p className="mb-5 mt-0.5 text-[13px] text-[#667085]">in USDC</p>

            {/* Path 1: pay with wallet (primary) */}
            <button
              onClick={payWithWallet}
              disabled={status === "paying"}
              className="flex w-full max-w-[18rem] items-center justify-center gap-2 rounded-xl bg-[#34c759] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048] disabled:opacity-60"
            >
              {status === "paying" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Confirm in your wallet…
                </>
              ) : (
                "Pay with wallet"
              )}
            </button>
            {!hasWallet && status === "awaiting" && (
              <p className="mt-2 max-w-[16rem] text-[12px] text-[#98a2b3]">
                No browser wallet detected — scan below with your phone.
              </p>
            )}
            {error && status === "awaiting" && (
              <p className="mt-2 max-w-[16rem] text-[12px] text-[#d92d20]">
                {error}
              </p>
            )}

            {/* divider */}
            <div className="my-5 flex w-full max-w-[18rem] items-center gap-3 text-[12px] text-[#98a2b3]">
              <span className="h-px flex-1 bg-[#eaecf0]" />
              or scan to pay
              <span className="h-px flex-1 bg-[#eaecf0]" />
            </div>

            {/* Path 2: QR */}
            <div className="rounded-2xl border border-[#eaecf0] p-3 shadow-sm">
              <QRCodeSVG value={solanaUrl} size={168} level="M" />
            </div>
            <button
              onClick={copyLink}
              className="mt-3 text-[12px] font-medium text-[#475467] underline-offset-2 hover:underline"
            >
              {copied ? "Link copied" : "Copy payment link"}
            </button>

            <div className="mt-5 flex items-center gap-2 text-[12px] text-[#98a2b3]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34c759]" />
              </span>
              Waiting for payment…
            </div>
          </>
        )}

        {status === "paid" && (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#34c759]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="m5 13 4 4L19 7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-5 text-xl font-bold">Payment received</p>
            <p className="mt-1 text-sm text-[#667085]">
              {fmtUSD(amount)} paid to {name}
            </p>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-[#98a2b3]">
        Secured by Settlr · settlr.dev
      </p>
    </div>
  );
}

export default function EmbedCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-[#667085]">
          Loading…
        </div>
      }
    >
      <EmbedCheckout />
    </Suspense>
  );
}
