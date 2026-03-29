"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useRouter } from "next/navigation";
import { Shield, Wallet, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const c = {
  bg: "#FFFFFF",
  card: "#F3F4F6",
  navy: "#0C1829",
  slate: "#3B4963",
  muted: "#7C8A9E",
  border: "#E5E7EB",
  green: "#1B6B4A",
  greenBg: "rgba(27,107,74,0.06)",
};

export default function LoginPage() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { status } = useOnboardingStatus();
  const router = useRouter();

  // Once connected and onboarded, redirect to dashboard
  useEffect(() => {
    if (connected && status === "onboarded") {
      router.push("/dashboard");
    }
  }, [connected, status, router]);

  // Connected but not onboarded
  if (connected && status === "needs-onboarding") {
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
          <h2 className="text-3xl font-bold mb-3" style={{ color: c.navy }}>
            Complete Onboarding
          </h2>
          <p className="mb-6" style={{ color: c.slate }}>
            Your wallet is connected but you haven&apos;t completed merchant
            onboarding yet. You need an invite link from your approval email to
            set up your account.
          </p>
          <p className="mb-6 text-sm" style={{ color: c.muted }}>
            Check your email for the sign-in link, or request access below.
          </p>
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-3 px-8 py-4 font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: c.green }}
          >
            Request Access
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // Connected and loading onboarding status
  if (connected && status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: c.bg }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
        <h2 className="text-3xl font-bold mb-3" style={{ color: c.navy }}>
          Sign In to Settlr
        </h2>
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
              href="/waitlist"
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
