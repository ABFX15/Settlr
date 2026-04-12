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
  Link2,
  Copy,
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
          <span className="rounded-full bg-[#f59e0b]/10 px-3 py-1 text-xs font-semibold text-[#f59e0b]">
            Coming Soon
          </span>
        </div>

        <div className="rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/20 p-4">
          <p className="text-xs text-[#5c5c5c] leading-relaxed">
            <span className="font-semibold text-[#212121]">Coming soon:</span>{" "}
            Automatic USDC-to-fiat conversion after each payment. We&apos;re
            integrating with licensed off-ramp providers to enable this feature.
          </p>
        </div>
      </section>

      {/* ─── LeafLink Integration ─── */}
      <section className="mb-8 rounded-2xl border border-[#d3d3d3] bg-white p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-[#34c759]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#212121]">
              LeafLink Integration
            </h2>
            <p className="text-xs text-[#8a8a8a]">
              Connect your LeafLink account to auto-settle purchase orders
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
              LeafLink API Key
            </label>
            <input
              type="password"
              placeholder="ll_api_xxxxxxxxxxxxxxxx"
              className="w-full rounded-lg border border-[#d3d3d3] bg-[#f7f7f7] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] focus:border-[#34c759] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
              disabled
            />
            <p className="mt-1 text-xs text-[#8a8a8a]">
              Find your API key at{" "}
              <a
                href="https://www.leaflink.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#34c759] hover:underline"
              >
                LeafLink Settings → API
              </a>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5c5c5c] mb-1.5">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm font-mono text-[#8a8a8a] truncate">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/integrations/leaflink/webhook`
                  : "/api/integrations/leaflink/webhook"}
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/api/integrations/leaflink/webhook`;
                  navigator.clipboard.writeText(url);
                }}
                className="rounded-lg border border-[#d3d3d3] p-2.5 text-[#8a8a8a] hover:text-[#212121] hover:bg-[#f7f7f7] transition-colors"
                title="Copy webhook URL"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-[#8a8a8a]">
              Add this URL to your LeafLink webhook settings to receive order
              updates automatically.
            </p>
          </div>
          <div className="rounded-xl bg-[#34c759]/5 border border-[#34c759]/20 p-4">
            <p className="text-xs text-[#5c5c5c] leading-relaxed">
              <span className="font-semibold text-[#212121]">
                How it works:
              </span>{" "}
              When an order is created or updated in LeafLink, the webhook
              triggers automatic USDC settlement via your Settlr vault. No
              manual intervention required.
            </p>
          </div>
        </div>
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
