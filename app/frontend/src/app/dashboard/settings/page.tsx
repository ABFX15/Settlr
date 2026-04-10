"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Settings,
  Building2,
  CreditCard,
  Bell,
  Shield,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Check,
  AlertCircle,
  Landmark,
  ArrowDownToLine,
  DollarSign,
} from "lucide-react";

/* ─── Types ─── */
interface OfframpSettings {
  enabled: boolean;
  provider: "sphere" | "moonpay" | "manual";
  method: string;
  currency: string;
  accountLabel: string;
  minAmount: number;
  batchMode: boolean;
  batchThreshold: number;
}

interface MerchantSettings {
  businessName: string;
  wallet: string;
  autoOfframp: OfframpSettings;
  notifications: {
    emailOnPayment: boolean;
    emailOnOfframp: boolean;
  };
}

const DEFAULT_SETTINGS: MerchantSettings = {
  businessName: "",
  wallet: "",
  autoOfframp: {
    enabled: false,
    provider: "sphere",
    method: "ach",
    currency: "USD",
    accountLabel: "",
    minAmount: 100,
    batchMode: false,
    batchThreshold: 5000,
  },
  notifications: {
    emailOnPayment: true,
    emailOnOfframp: true,
  },
};

const OFFRAMP_METHODS = [
  {
    value: "ach",
    label: "ACH Transfer",
    region: "US",
    time: "1-2 business days",
  },
  { value: "wire", label: "Wire Transfer", region: "US", time: "Same day" },
  {
    value: "faster_payments",
    label: "Faster Payments",
    region: "UK",
    time: "Instant",
  },
  {
    value: "sepa",
    label: "SEPA Transfer",
    region: "EU",
    time: "1 business day",
  },
  { value: "pix", label: "Pix", region: "BR", time: "Instant" },
  { value: "gcash", label: "GCash", region: "PH", time: "Instant" },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "BRL", label: "Brazilian Real (BRL)" },
  { value: "PHP", label: "Philippine Peso (PHP)" },
  { value: "MXN", label: "Mexican Peso (MXN)" },
];

export default function SettingsPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() || "";

  const [settings, setSettings] = useState<MerchantSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings
  useEffect(() => {
    if (!wallet) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/merchant/settings?wallet=${wallet}`);
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data, wallet }));
        } else {
          setSettings((prev) => ({ ...prev, wallet }));
        }
      } catch {
        setSettings((prev) => ({ ...prev, wallet }));
      } finally {
        setLoading(false);
      }
    })();
  }, [wallet]);

  const handleSave = useCallback(async () => {
    if (!wallet) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/merchant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[settings] save error:", err);
    } finally {
      setSaving(false);
    }
  }, [wallet, settings]);

  const updateOfframp = (patch: Partial<OfframpSettings>) =>
    setSettings((prev) => ({
      ...prev,
      autoOfframp: { ...prev.autoOfframp, ...patch },
    }));

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#34c759]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#212121]">Settings</h1>
        <p className="text-sm text-[#8a8a8a] mt-1">
          Configure your business profile, payment settlement, and
          notifications.
        </p>
      </div>

      {/* ─── Business Profile ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              Business Profile
            </h2>
            <p className="text-xs text-[#8a8a8a]">Your public business info</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
              Business Name
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  businessName: e.target.value,
                }))
              }
              placeholder="Acme Cannabis Co."
              className="w-full rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
              Settlement Wallet
            </label>
            <div className="rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm font-mono text-[#8a8a8a]">
              {wallet || "Connect wallet to configure"}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Auto Off-Ramp ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5 text-[#34c759]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#212121]">
                Auto Off-Ramp
              </h2>
              <p className="text-xs text-[#8a8a8a]">
                Automatically convert USDC to fiat after each payment
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              updateOfframp({ enabled: !settings.autoOfframp.enabled })
            }
            className="text-[#34c759]"
            aria-label="Toggle auto off-ramp"
          >
            {settings.autoOfframp.enabled ? (
              <ToggleRight className="h-8 w-8" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-[#d3d3d3]" />
            )}
          </button>
        </div>

        {settings.autoOfframp.enabled && (
          <div className="space-y-4 border-t border-[#d3d3d3] pt-5">
            {/* How it works */}
            <div className="rounded-xl bg-[#34c759]/5 border border-[#34c759]/20 p-4">
              <p className="text-xs text-[#5c5c5c] leading-relaxed">
                <span className="font-semibold text-[#212121]">
                  How it works:
                </span>{" "}
                When you receive a USDC payment, Settlr automatically initiates
                an off-ramp to your bank account. You&apos;ll receive{" "}
                {settings.autoOfframp.currency} without ever touching crypto.
              </p>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["sphere", "moonpay", "manual"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateOfframp({ provider: p })}
                    className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      settings.autoOfframp.provider === p
                        ? "border-[#34c759] bg-[#34c759]/5 text-[#212121]"
                        : "border-[#d3d3d3] bg-[#f7f7f7] text-[#8a8a8a] hover:border-[#8a8a8a]"
                    }`}
                  >
                    {p === "sphere"
                      ? "Sphere"
                      : p === "moonpay"
                      ? "MoonPay"
                      : "Manual"}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                Receive Currency
              </label>
              <select
                value={settings.autoOfframp.currency}
                onChange={(e) => updateOfframp({ currency: e.target.value })}
                className="w-full rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] px-4 py-2.5 text-sm text-[#212121] focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Method */}
            <div>
              <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                Payout Method
              </label>
              <div className="space-y-2">
                {OFFRAMP_METHODS.filter(
                  (m) =>
                    m.region === "US" ||
                    (settings.autoOfframp.currency === "GBP" &&
                      m.region === "UK") ||
                    (settings.autoOfframp.currency === "EUR" &&
                      m.region === "EU") ||
                    (settings.autoOfframp.currency === "BRL" &&
                      m.region === "BR") ||
                    (settings.autoOfframp.currency === "PHP" &&
                      m.region === "PH"),
                ).map((m) => (
                  <button
                    key={m.value}
                    onClick={() => updateOfframp({ method: m.value })}
                    className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                      settings.autoOfframp.method === m.value
                        ? "border-[#34c759] bg-[#34c759]/5"
                        : "border-[#d3d3d3] bg-[#f7f7f7] hover:border-[#8a8a8a]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Landmark className="h-4 w-4 text-[#8a8a8a]" />
                      <div>
                        <p className="text-sm font-medium text-[#212121]">
                          {m.label}
                        </p>
                        <p className="text-xs text-[#8a8a8a]">{m.time}</p>
                      </div>
                    </div>
                    {settings.autoOfframp.method === m.value && (
                      <Check className="h-4 w-4 text-[#34c759]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Account label */}
            <div>
              <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                Bank Account (label)
              </label>
              <input
                type="text"
                value={settings.autoOfframp.accountLabel}
                onChange={(e) =>
                  updateOfframp({ accountLabel: e.target.value })
                }
                placeholder="Chase ****1234"
                className="w-full rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
              />
              <p className="text-xs text-[#8a8a8a] mt-1">
                Full bank details are securely managed by{" "}
                {settings.autoOfframp.provider === "sphere"
                  ? "Sphere"
                  : "MoonPay"}
                . You&apos;ll complete KYB verification with them once.
              </p>
            </div>

            {/* Min amount */}
            <div>
              <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                Minimum Balance to Trigger Off-Ramp
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                <input
                  type="number"
                  min={1}
                  step={10}
                  value={settings.autoOfframp.minAmount}
                  onChange={(e) =>
                    updateOfframp({
                      minAmount: Math.max(1, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] pl-9 pr-4 py-2.5 text-sm text-[#212121] focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
                />
              </div>
              <p className="text-xs text-[#8a8a8a] mt-1">
                Off-ramp triggers only when your USDC balance exceeds this
                amount.
              </p>
            </div>

            {/* Batch mode */}
            <div className="rounded-xl border border-[#d3d3d3] p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-[#212121]">
                    Batch Mode
                  </p>
                  <p className="text-xs text-[#8a8a8a]">
                    Accumulate payments and off-ramp in bulk (saves fees)
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateOfframp({
                      batchMode: !settings.autoOfframp.batchMode,
                    })
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.autoOfframp.batchMode
                      ? "bg-[#34c759]"
                      : "bg-[#d3d3d3]"
                  }`}
                  aria-label="Toggle batch mode"
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      settings.autoOfframp.batchMode
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {settings.autoOfframp.batchMode && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
                    Batch Threshold ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                    <input
                      type="number"
                      min={100}
                      step={500}
                      value={settings.autoOfframp.batchThreshold}
                      onChange={(e) =>
                        updateOfframp({
                          batchThreshold: Math.max(
                            100,
                            parseFloat(e.target.value) || 0,
                          ),
                        })
                      }
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] pl-9 pr-4 py-2.5 text-sm text-[#212121] focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
                    />
                  </div>
                  <p className="text-xs text-[#8a8a8a] mt-1">
                    Payments accumulate until this total is reached, then
                    off-ramp as one transfer. Reduces per-transaction fees.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ─── Notifications ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              Notifications
            </h2>
            <p className="text-xs text-[#8a8a8a]">
              Email alerts for payments and off-ramps
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-[#d3d3d3] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#212121]">
                Payment received
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Get notified when someone pays you
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailOnPayment: !prev.notifications.emailOnPayment,
                  },
                }))
              }
              className={
                settings.notifications.emailOnPayment
                  ? "text-[#34c759]"
                  : "text-[#d3d3d3]"
              }
            >
              {settings.notifications.emailOnPayment ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#d3d3d3] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#212121]">
                Off-ramp completed
              </p>
              <p className="text-xs text-[#8a8a8a]">
                Get notified when USDC converts to fiat
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailOnOfframp: !prev.notifications.emailOnOfframp,
                  },
                }))
              }
              className={
                settings.notifications.emailOnOfframp
                  ? "text-[#34c759]"
                  : "text-[#d3d3d3]"
              }
            >
              {settings.notifications.emailOnOfframp ? (
                <ToggleRight className="h-7 w-7" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Save ─── */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[#34c759]">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !wallet}
          className="rounded-xl bg-[#34c759] px-8 py-3 text-sm font-semibold text-white hover:bg-[#2ba048] transition-colors disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </span>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}
