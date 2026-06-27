"use client";

/**
 * Embeddable checkout — rendered inside an iframe on a merchant's own site
 * (via /embed.js). The BUYER scans a Solana Pay QR and pays USDC straight to
 * the merchant's wallet; we watch the chain for a unique reference key, close
 * out the session (fires the merchant webhook), and postMessage the result to
 * the parent page. No login, no wallet connection required of the buyer.
 */

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Status = "loading" | "awaiting" | "paid" | "error";

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function postToParent(msg: Record<string, unknown>) {
  try {
    window.parent?.postMessage(msg, "*");
  } catch {
    /* not framed — ignore */
  }
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
  const referenceRef = useRef<PublicKey | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // ── Set up the payment request (best-effort session + Solana Pay URL) ──
  useEffect(() => {
    let valid = true;
    try {
      // Throws if the merchant address is malformed.
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

    // Create a checkout session so the payment is recorded and the merchant's
    // webhook fires on completion. Best-effort — the QR still works without it.
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
        /* session is optional — reference polling still confirms payment */
      }
    })();
  }, [merchant, name, order, webhook, amount]);

  // ── Watch the chain for the payment carrying this reference ──
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

        // Best-effort: derive payer + close out the session (fires webhook).
        let customerWallet = "unknown";
        try {
          const tx = await connection.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
          });
          const payer =
            tx?.transaction.message.accountKeys.find((k) => k.signer)?.pubkey;
          if (payer) customerWallet = payer.toBase58();
        } catch {
          /* ignore */
        }
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
      } catch {
        /* transient RPC error — keep polling */
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status, amount]);

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
      {/* Header */}
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

        {status === "awaiting" && (
          <>
            <p className="text-[13px] font-medium uppercase tracking-wide text-[#98a2b3]">
              Pay {name}
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {fmtUSD(amount)}
            </p>
            <p className="mb-5 mt-0.5 text-[13px] text-[#667085]">in USDC</p>

            <div className="rounded-2xl border border-[#eaecf0] p-4 shadow-sm">
              <QRCodeSVG value={solanaUrl} size={208} level="M" />
            </div>

            <p className="mt-5 max-w-[15rem] text-[13px] leading-relaxed text-[#667085]">
              Scan with any Solana wallet (Phantom, Solflare…) to pay. Settles
              instantly.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <a
                href={solanaUrl}
                className="rounded-lg bg-[#34c759] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2ba048]"
              >
                Open in wallet
              </a>
              <button
                onClick={copyLink}
                className="rounded-lg border border-[#d0d5dd] px-4 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-[12px] text-[#98a2b3]">
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
