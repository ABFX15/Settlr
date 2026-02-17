"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing: string;
  icon: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "1",
    name: "Fan",
    description: "Follow your favorite creators",
    price: 4.99,
    billing: "/month",
    icon: "❤️",
    features: [
      "Access free content",
      "Comment & react",
      "Community chat",
      "Creator updates",
    ],
  },
  {
    id: "2",
    name: "Supporter",
    description: "Unlock exclusive creator content",
    price: 9.99,
    billing: "/month",
    icon: "⭐",
    features: [
      "All Fan features",
      "Exclusive posts & media",
      "Behind-the-scenes content",
      "Priority DMs",
      "Supporter badge",
    ],
    badge: "Most Popular",
    popular: true,
  },
  {
    id: "3",
    name: "VIP",
    description: "Get the full creator experience",
    price: 24.99,
    billing: "/month",
    icon: "💎",
    features: [
      "All Supporter features",
      "1-on-1 video calls",
      "Custom content requests",
      "Early access to drops",
      "VIP badge & perks",
      "Private group access",
    ],
  },
  {
    id: "4",
    name: "Lifetime",
    description: "One-time purchase, forever access",
    price: 199.0,
    billing: "one-time",
    icon: "🏆",
    features: [
      "All VIP features forever",
      "Lifetime supporter badge",
      "All future content included",
      "Exclusive merch drops",
      "Creator shout-out",
      "Founding member perks",
    ],
    badge: "Best Value",
  },
];

const addons: Plan[] = [
  {
    id: "a1",
    name: "Tip Jar",
    description: "Send a one-time $10 USDC tip to this creator",
    price: 10.0,
    billing: "one-time",
    icon: "💸",
    features: [],
  },
  {
    id: "a2",
    name: "Custom Content Request",
    description: "Request a personalized video or photo set",
    price: 49.0,
    billing: "one-time",
    icon: "🎨",
    features: [],
  },
];

export default function DemoStorePage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<
    { plan: Plan; quantity: number }[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (plan: Plan) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.plan.id === plan.id);
      if (existing) {
        return prev;
      }
      return [...prev, { plan, quantity: 1 }];
    });
  };

  const removeItem = (planId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.plan.id !== planId));
  };

  const total = selectedItems.reduce(
    (sum, item) => sum + item.plan.price * item.quantity,
    0,
  );

  const itemCount = selectedItems.length;

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    const demoWallet = "DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV";
    const itemNames = selectedItems.map((item) => item.plan.name).join(", ");

    router.push(
      `/checkout?amount=${total.toFixed(
        2,
      )}&merchant=FanVault&to=${demoWallet}&memo=${encodeURIComponent(
        `Creator Sub: ${itemNames}`,
      )}`,
    );
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card-bg)]/95 border-b border-[var(--border-color)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--accent-muted)] transition-colors"
              title="Exit demo"
            >
              <span className="text-xl">✕</span>
            </Link>
            <span className="text-3xl">🎤</span>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                FanVault
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Creator Platform • Pay with USDC
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 rounded-full bg-[var(--accent-muted)] hover:bg-[var(--accent-primary)] transition-colors"
          >
            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[var(--accent-muted)] to-transparent py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Support your favorite creator.
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Subscribe for exclusive content and perks.
            <span className="text-[var(--accent-primary)] font-medium">
              {" "}
              Pay with USDC — zero gas fees.
            </span>
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-6">
          Membership Tiers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedItems.some((e) => e.plan.id === plan.id);
            return (
              <div
                key={plan.id}
                className={`bg-[var(--card-bg)] rounded-2xl border overflow-hidden transition-all hover:shadow-lg group relative ${
                  isSelected
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20"
                    : plan.popular
                    ? "border-[var(--accent-primary)]/50 hover:border-[var(--accent-primary)]"
                    : "border-[var(--border-color)] hover:border-[var(--accent-primary)]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-[var(--accent-primary)] text-white text-xs font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="p-5">
                  <span className="text-3xl mb-3 block">{plan.icon}</span>
                  <h3 className="font-semibold text-[var(--text-primary)] text-lg">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-[var(--accent-primary)]">
                      ${plan.price.toFixed(0)}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      USDC {plan.billing}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="text-[var(--accent-primary)] mt-0.5">
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      isSelected ? removeItem(plan.id) : addItem(plan)
                    }
                    className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                      isSelected
                        ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-red-500/20 hover:text-red-400"
                        : plan.popular
                        ? "bg-[var(--accent-primary)] text-white hover:opacity-90"
                        : "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white"
                    }`}
                  >
                    {isSelected ? "✓ Selected" : "Subscribe"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section className="max-w-6xl mx-auto px-4 py-4 pb-8">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-6">
          Add-ons
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          {addons.map((addon) => {
            const isSelected = selectedItems.some(
              (e) => e.plan.id === addon.id,
            );
            return (
              <div
                key={addon.id}
                className={`bg-[var(--card-bg)] rounded-2xl border p-5 transition-all hover:shadow-lg ${
                  isSelected
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20"
                    : "border-[var(--border-color)] hover:border-[var(--accent-primary)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addon.icon}</span>
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      {addon.name}
                    </h4>
                  </div>
                  <span className="text-lg font-bold text-[var(--accent-primary)]">
                    ${addon.price.toFixed(0)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  {addon.description}
                </p>
                <button
                  onClick={() =>
                    isSelected ? removeItem(addon.id) : addItem(addon)
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    isSelected
                      ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-red-500/20 hover:text-red-400"
                      : "bg-[var(--accent-muted)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white"
                  }`}
                >
                  {isSelected ? "✓ Added" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gasless Badge */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[var(--accent-muted)] to-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Pay with USDC • Zero Gas Fees
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Fans pay with USDC — no SOL required. Settlr covers the gas so
                checkout is frictionless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[var(--card-bg)] h-full overflow-auto animate-slide-in-right">
            <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border-color)] p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Your Order
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[var(--accent-muted)] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedItems.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-6xl mb-4 block">🛒</span>
                <p className="text-[var(--text-muted)]">No plans selected</p>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Pick a subscription plan to get started.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                  {selectedItems.map((item) => (
                    <div
                      key={item.plan.id}
                      className="flex items-center gap-4 p-3 bg-[var(--background)] rounded-xl"
                    >
                      <span className="text-3xl">{item.plan.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text-primary)]">
                          {item.plan.name}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {item.plan.description}
                        </p>
                        <p className="text-sm text-[var(--accent-primary)] font-medium">
                          ${item.plan.price.toFixed(2)} USDC {item.plan.billing}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.plan.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-[var(--card-bg)] border-t border-[var(--border-color)] p-4 space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-[var(--text-secondary)]">Total</span>
                    <div className="text-right">
                      <span className="font-bold text-[var(--text-primary)]">
                        ${total.toFixed(2)}
                      </span>
                      <span className="text-sm text-[var(--text-muted)] ml-1">
                        USDC
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--accent-muted)] rounded-lg p-3">
                    <span>⚡</span>
                    <span>
                      Network fees:{" "}
                      <strong className="text-[var(--accent-primary)]">
                        $0.00
                      </strong>{" "}
                      (gasless)
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
                  >
                    Subscribe & Pay
                  </button>

                  <p className="text-xs text-center text-[var(--text-muted)]">
                    Powered by Settlr. Instant USDC settlement.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
