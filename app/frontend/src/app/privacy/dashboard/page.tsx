"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { Shield, ArrowLeft, Settings, Download, Bell } from "lucide-react";
import PrivateDashboard from "@/components/PrivateDashboard";

export default function PrivateDashboardPage() {
  const { authenticated, login, user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const [merchantId, setMerchantId] = useState<string>("demo_merchant");

  // Get wallet address
  const wallet = wallets?.[0];
  const walletAddress = wallet?.address;

  useEffect(() => {
    // In production: fetch merchant ID from user's linked accounts
    if (user?.id) {
      setMerchantId(`merchant_${user.id.slice(0, 8)}`);
    }
  }, [user]);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        {/* Header */}
        <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-new.png"
                alt="Settlr"
                width={100}
                height={28}
                quality={100}
                className="object-contain"
              />
            </Link>
          </div>
        </header>

        <div className="flex min-h-screen items-center justify-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Private Dashboard</h1>
            <p className="mb-6 text-gray-400">
              Sign in to access your confidential commerce dashboard with
              FHE-encrypted revenue metrics.
            </p>
            <button
              onClick={login}
              className="w-full rounded-xl bg-gradient-to-r from-[#a855f7] to-[#22d3ee] px-6 py-3 font-semibold transition-all hover:opacity-90"
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </Link>
          </div>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-new.png"
              alt="Settlr"
              width={100}
              height={28}
              quality={100}
              className="object-contain"
            />
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
              Private Mode
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              <Bell className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              <Download className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-28 md:px-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold">Private Dashboard</h1>
            <span className="rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 px-3 py-1 text-sm font-medium text-purple-300">
              Inco FHE
            </span>
          </div>
          <p className="text-gray-400">
            View your encrypted revenue metrics. Only you can decrypt the
            amounts.
          </p>
        </motion.div>

        {/* Private Dashboard Component */}
        <PrivateDashboard
          merchantId={merchantId}
          merchantWallet={walletAddress}
        />

        {/* Privacy Info Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-2 font-semibold text-white">🔐 B2B Privacy</h3>
            <p className="text-sm text-gray-400">
              Settlement amounts hidden from competitors. Perfect for wholesale
              pricing and enterprise payouts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-2 font-semibold text-white">
              📊 Compliant Exports
            </h3>
            <p className="text-sm text-gray-400">
              Export decrypted data for accounting and tax purposes. Privacy
              without sacrificing compliance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <h3 className="mb-2 font-semibold text-white">
              🔄 Private Subscriptions
            </h3>
            <p className="text-sm text-gray-400">
              Recurring payments with hidden pricing. Subscribers and merchants
              see the amount; no one else.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-gray-500">
          <span>Powered by Inco FHE + Solana</span>
          <Link href="/docs" className="hover:text-gray-300">
            Documentation
          </Link>
        </div>
      </footer>
    </main>
  );
}
