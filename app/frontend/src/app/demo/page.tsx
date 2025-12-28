"use client";

import Link from "next/link";

export default function DemoPage() {
  const demoWallet = "Ac52MMouwRypY7WPxMnUGwi6ZDRuBDgbmt9aXKSp43By";

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Gasless Payment Demos
          </h1>
          <p className="text-[var(--text-muted)]">
            Experience USDC payments without gas fees
          </p>
        </div>

        <div className="grid gap-4">
          {/* E-commerce Store Demo */}
          <Link
            href="/demo/store"
            className="block p-6 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-pink-600 flex items-center justify-center text-2xl">
                🛍️
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  E-Commerce Store
                </h2>
                <p className="text-[var(--text-muted)] mt-1">
                  Browse products, add to cart, and checkout with USDC. Full
                  shopping experience.
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-[var(--accent-primary)]">
                  <span>Try the store →</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Quick Payment Demo */}
          <Link
            href={`/checkout?amount=0.10&merchant=Demo%20Coffee%20Shop&to=${demoWallet}&memo=Latte%20%26%20Pastry`}
            className="block p-6 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  Quick Payment
                </h2>
                <p className="text-[var(--text-muted)] mt-1">
                  Skip straight to checkout. Pay $0.10 USDC instantly.
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-[var(--accent-primary)]">
                  <span>Pay now →</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Payment Link Demo */}
          <Link
            href="/create"
            className="block p-6 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                🔗
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  Create Payment Link
                </h2>
                <p className="text-[var(--text-muted)] mt-1">
                  Generate a custom payment link with your own amount and memo.
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-[var(--accent-primary)]">
                  <span>Create link →</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Badge */}
        <div className="bg-[var(--accent-muted)] rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm">
            <p className="text-[var(--text-primary)] font-medium">
              Powered by Kora Gasless
            </p>
            <p className="text-[var(--text-muted)]">
              Users pay only USDC - no SOL needed for transaction fees
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
