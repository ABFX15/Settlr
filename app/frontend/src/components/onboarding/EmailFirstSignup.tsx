"use client";

/**
 * EmailFirstSignup — top-of-onboarding card. Lets a non-crypto cannabis
 * controller sign up with email/Google, gets a Privy-managed embedded
 * Solana wallet, sets the offbank_session cookie, registers a merchant
 * record, and redirects to /dashboard.
 *
 * Falls through silently if Privy is unconfigured (no NEXT_PUBLIC_PRIVY_APP_ID).
 * The existing wallet-adapter onboarding flow continues to work below.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

interface Props {
  defaultBusinessName?: string;
  onError?: (msg: string) => void;
}

export function EmailFirstSignup({ defaultBusinessName, onError }: Props) {
  // usePrivy will throw if PrivyProvider isn't mounted. Guarded by the
  // env check in PrivyProvider — when no app ID, we render nothing here.
  const enabled = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!enabled) return null;

  return (
    <EmailFirstSignupInner
      defaultBusinessName={defaultBusinessName}
      onError={onError}
    />
  );
}

function EmailFirstSignupInner({ defaultBusinessName, onError }: Props) {
  const router = useRouter();
  const { ready, authenticated, user, login, getAccessToken, logout } =
    usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  const [businessName, setBusinessName] = useState(defaultBusinessName ?? "");
  const [phase, setPhase] = useState<
    "idle" | "verifying" | "registering" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inFlight = useRef(false);

  const failed = useCallback(
    (msg: string) => {
      setErrorMsg(msg);
      setPhase("error");
      onError?.(msg);
      inFlight.current = false;
    },
    [onError],
  );

  const completeSignup = useCallback(async () => {
    if (inFlight.current) return;
    if (!authenticated || !user) return;
    if (!businessName.trim() || businessName.trim().length < 2) return;

    // Wait until Privy has finished provisioning the embedded Solana wallet.
    const embedded = solanaWallets.find(
      (w) => (w as { walletClientType?: string }).walletClientType === "privy",
    );
    const fallback = solanaWallets[0];
    const wallet = (embedded ?? fallback)?.address;
    if (!wallet) {
      // Wallet still being provisioned — try again on next render.
      return;
    }

    inFlight.current = true;
    try {
      setPhase("verifying");
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Privy returned no access token");
      const verifyRes = await fetch("/api/auth/privy/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessToken }),
      });
      if (!verifyRes.ok) {
        const body = await verifyRes.json().catch(() => ({}));
        throw new Error(
          body?.error || `Privy verify failed (${verifyRes.status})`,
        );
      }

      setPhase("registering");
      const regRes = await fetch("/api/merchants/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: businessName.trim(),
          walletAddress: wallet,
          signerWallet: wallet,
        }),
      });
      // 409 = already registered → that's fine, just go to dashboard.
      if (!regRes.ok && regRes.status !== 409) {
        const body = await regRes.json().catch(() => ({}));
        throw new Error(
          body?.error || `Registration failed (${regRes.status})`,
        );
      }

      setPhase("done");
      router.replace("/dashboard");
    } catch (e) {
      failed(e instanceof Error ? e.message : "Sign-up failed");
    }
  }, [
    authenticated,
    user,
    businessName,
    solanaWallets,
    getAccessToken,
    router,
    failed,
  ]);

  // Auto-progress once Privy auth + embedded wallet are both ready.
  useEffect(() => {
    if (phase === "idle" && authenticated && businessName.trim().length >= 2) {
      void completeSignup();
    }
  }, [phase, authenticated, businessName, completeSignup]);

  if (!ready) {
    return (
      <div className="rounded-2xl border p-8 bg-white border-[#d3d3d3]">
        <div className="flex items-center gap-2 text-sm text-[#8a8a8a]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading sign-in…
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 p-8 bg-white border-[#34c759] shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34c759]/10">
          <Mail className="h-5 w-5 text-[#34c759]" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#212121]">
            Sign up with email
          </h2>
          <p className="text-sm text-[#8a8a8a]">
            Recommended — no wallet required. Takes 30 seconds.
          </p>
        </div>
        <span className="rounded-full bg-[#34c759]/10 px-2.5 py-1 text-[11px] font-semibold text-[#2ba048]">
          Recommended
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#5c5c5c]">
            Business name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. GreenLeaf Distribution LLC"
            disabled={authenticated}
            className="w-full rounded-xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-[#212121] outline-none transition focus:border-[#34c759] focus:ring-2 focus:ring-[#34c759]/20 disabled:bg-[#f2f2f2] disabled:text-[#8a8a8a]"
          />
        </div>

        {!authenticated && (
          <button
            type="button"
            disabled={businessName.trim().length < 2}
            onClick={() => login()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#34c759] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Mail className="h-4 w-4" />
            Continue with email
          </button>
        )}

        {authenticated && phase !== "error" && (
          <div className="flex items-center gap-2 rounded-xl border border-[#34c759]/20 bg-[#34c759]/5 px-4 py-3 text-sm text-[#2ba048]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {phase === "verifying" && "Verifying your sign-in…"}
            {phase === "registering" && "Setting up your merchant account…"}
            {phase === "done" && "Done! Redirecting to dashboard…"}
            {phase === "idle" && "Provisioning your secure wallet…"}
          </div>
        )}

        {phase === "error" && (
          <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-medium">Something went wrong</p>
            <p className="text-xs">{errorMsg}</p>
            <button
              type="button"
              onClick={async () => {
                await logout();
                setPhase("idle");
                setErrorMsg(null);
                inFlight.current = false;
              }}
              className="text-xs font-semibold underline"
            >
              Reset and try again
            </button>
          </div>
        )}

        <div className="flex items-start gap-2 pt-1">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#8a8a8a]" />
          <p className="text-[11px] leading-relaxed text-[#8a8a8a]">
            We provision a secure Solana wallet for you behind the scenes
            (powered by Privy). You can export the keys anytime from Settings.
            We never custody your funds.
          </p>
        </div>
      </div>
    </div>
  );
}
