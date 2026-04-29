"use client";

import { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@/components/WalletModal";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Wallet, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const c = {
  bg: "#FFFFFF",
  card: "#f2f2f2",
  navy: "#212121",
  slate: "#5c5c5c",
  muted: "#8a8a8a",
  border: "#d3d3d3",
  green: "#34c759",
  greenBg: "rgba(27,107,74,0.06)",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: c.green }}
          />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { status } = useOnboardingStatus();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Smart routing once we know who this wallet is.
  //   onboarded         → /dashboard
  //   needs-onboarding  → /onboarding (preserve invite token if present)
  useEffect(() => {
    if (!connected) return;
    if (status === "onboarded") {
      router.replace("/dashboard");
    } else if (status === "needs-onboarding") {
      const token = searchParams.get("token");
      router.replace(
        token
          ? `/onboarding?token=${encodeURIComponent(token)}`
          : "/onboarding",
      );
    }
  }, [connected, status, router, searchParams]);

  // Connected and verifying account status
  if (
    connected &&
    (status === "loading" ||
      status === "onboarded" ||
      status === "needs-onboarding")
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: c.bg }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: c.green }}
          />
          <p style={{ color: c.muted }}>Checking your account...</p>
        </motion.div>
      </div>
    );
  }

  // Not connected — show connect wallet prompt
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
        <h1 className="text-3xl font-bold mb-3" style={{ color: c.navy }}>
          Sign In to Offbank
        </h1>
        <p className="mb-2 text-lg" style={{ color: c.slate }}>
          Connect the wallet you used during onboarding.
        </p>
        <p className="mb-8 text-sm" style={{ color: c.muted }}>
          Your wallet is your identity — no passwords, no email login.
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
          onClick={() => setVisible(true)}
          className="inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ background: c.green }}
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </button>
        <p className="mt-4 text-xs" style={{ color: c.muted }}>
          Phantom · Solflare · Hardware wallets supported
        </p>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: c.border }}>
          <p className="text-sm" style={{ color: c.muted }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/onboarding"
              className="font-medium underline"
              style={{ color: c.green }}
            >
              Request access
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
