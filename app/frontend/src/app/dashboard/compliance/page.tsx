"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ArrowLeft,
  Info,
} from "lucide-react";
import Link from "next/link";

interface MerchantSettings {
  kycEnabled: boolean;
  kycLevel: "basic-kyc-level" | "gaming-kyc-level" | "enhanced-kyc-level";
}

const KYC_LEVELS = [
  {
    id: "basic-kyc-level",
    name: "Basic",
    description: "ID verification + selfie. For general merchants.",
    recommended: false,
  },
  {
    id: "gaming-kyc-level",
    name: "Gaming",
    description:
      "ID + selfie + age verification. Required for iGaming operators.",
    recommended: true,
  },
  {
    id: "enhanced-kyc-level",
    name: "Enhanced",
    description: "ID + selfie + proof of address. For high-value transactions.",
    recommended: false,
  },
];

export default function ComplianceSettingsPage() {
  const { authenticated, login, ready } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [settings, setSettings] = useState<MerchantSettings>({
    kycEnabled: false,
    kycLevel: "basic-kyc-level",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load merchant settings
  useEffect(() => {
    async function loadSettings() {
      if (!publicKey) return;

      try {
        const res = await fetch(`/api/merchants/settings?wallet=${publicKey}`);
        if (res.ok) {
          const data = await res.json();
          setSettings({
            kycEnabled: data.kycEnabled || false,
            kycLevel: data.kycLevel || "basic-kyc-level",
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    if (connected) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [publicKey, connected]);

  // Save settings
  const saveSettings = async () => {
    if (!publicKey) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/merchants/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey,
          kycEnabled: settings.kycEnabled,
          kycLevel: settings.kycLevel,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Not authenticated
  if (ready && !authenticated) {
    return (
      <div className="flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-2xl border border-[#E2DFD5] bg-[#F3F2ED] p-8 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B6B4A]/10">
            <Shield className="h-8 w-8 text-[#1B6B4A]" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-[#0C1829]">
            Compliance Settings
          </h2>
          <p className="mb-6 text-[#7C8A9E]">
            Sign in to manage KYC/AML settings for your merchant account.
          </p>
          <button
            onClick={login}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDFBF7] px-6 py-3 font-semibold text-[#0C1829]"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B6B4A]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#7C8A9E] hover:text-[#0C1829]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B6B4A]/10">
              <Shield className="h-6 w-6 text-[#1B6B4A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0C1829]">
                Compliance Settings
              </h1>
              <p className="text-sm text-[#7C8A9E]">
                Configure KYC verification for your customers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-start gap-3 rounded-xl border border-[#38bdf8]/20 bg-[#38bdf8]/5 p-4"
        >
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B6B4A]" />
          <div className="text-sm text-[#1B6B4A]">
            <p className="font-medium">Why enable KYC?</p>
            <p className="mt-1 text-[#1B6B4A]/80">
              KYC (Know Your Customer) verification is required for licensed
              iGaming operators and helps prevent fraud. Customers complete a
              quick ID verification before their first payment.
            </p>
          </div>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#E2DFD5] bg-[#F3F2ED] p-6"
        >
          {/* KYC Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#0C1829]">
                Enable Customer Verification
              </h3>
              <p className="text-sm text-[#7C8A9E]">
                Require customers to verify identity before payment
              </p>
            </div>
            <button
              onClick={() =>
                setSettings((s) => ({ ...s, kycEnabled: !s.kycEnabled }))
              }
              className={`relative h-7 w-12 rounded-full transition-colors ${
                settings.kycEnabled ? "bg-[#1B6B4A]" : "bg-[#F3F2ED]"
              }`}
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-[#FDFBF7] transition-transform ${
                  settings.kycEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* KYC Level Selection */}
          {settings.kycEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-[#E2DFD5] pt-6"
            >
              <h3 className="mb-4 font-semibold text-[#0C1829]">
                Verification Level
              </h3>
              <div className="space-y-3">
                {KYC_LEVELS.map((level) => (
                  <label
                    key={level.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                      settings.kycLevel === level.id
                        ? "border-[#a78bfa] bg-[#1B6B4A]/10"
                        : "border-[#E2DFD5] hover:border-[#E2DFD5]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="kycLevel"
                      value={level.id}
                      checked={settings.kycLevel === level.id}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          kycLevel: e.target.value as any,
                        }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#0C1829]">
                          {level.name}
                        </span>
                        {level.recommended && (
                          <span className="rounded bg-[#1B6B4A]/15 px-2 py-0.5 text-xs text-[#1B6B4A]">
                            Recommended for iGaming
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#7C8A9E]">
                        {level.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex items-center justify-end gap-4">
            {saved && (
              <span className="flex items-center gap-2 text-sm text-[#1B6B4A]">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved
              </span>
            )}
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FDFBF7] px-6 py-3 font-semibold text-[#0C1829] transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </motion.div>

        {/* Pricing Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center text-sm text-[#7C8A9E]"
        >
          KYC verification is billed per successful verification.{" "}
          <Link href="/waitlist" className="text-[#1B6B4A] hover:underline">
            Contact us for pricing
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
