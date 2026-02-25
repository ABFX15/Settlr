"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  Webhook,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: "success" | "failed";
  createdAt: string;
}

const WEBHOOK_EVENTS = [
  {
    id: "payment.completed",
    label: "Payment Completed",
    description: "Triggered when a payment is confirmed on-chain",
  },
  {
    id: "payment.failed",
    label: "Payment Failed",
    description: "Triggered when a payment fails",
  },
  {
    id: "payment.expired",
    label: "Payment Expired",
    description: "Triggered when a payment link expires",
  },
  {
    id: "payment.refunded",
    label: "Payment Refunded",
    description: "Triggered when a payment is refunded",
  },
  {
    id: "subscription.created",
    label: "Subscription Created",
    description: "Triggered when a new subscription starts",
  },
  {
    id: "subscription.renewed",
    label: "Subscription Renewed",
    description: "Triggered when a subscription renews",
  },
  {
    id: "subscription.cancelled",
    label: "Subscription Cancelled",
    description: "Triggered when a subscription is cancelled",
  },
];

export default function WebhooksPage() {
  const { authenticated, login } = usePrivy();
  const { publicKey, connected } = useActiveWallet();

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // New webhook form
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "payment.completed",
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fetchWebhooks = useCallback(async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(`/api/webhooks?merchantId=${publicKey}`);
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchWebhooks();
    } else {
      setLoading(false);
    }
  }, [connected, publicKey, fetchWebhooks]);

  const createWebhook = async () => {
    if (!publicKey || !newUrl) return;

    setCreating(true);
    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: publicKey,
          url: newUrl,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks((prev) => [...prev, data.webhook]);
        setShowCreateModal(false);
        setNewUrl("");
        setSelectedEvents(["payment.completed"]);
        // Show the secret immediately after creation
        setShowSecret(data.webhook.id);
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
    }
  };

  const testWebhook = async (id: string) => {
    setTesting(id);
    try {
      const response = await fetch(`/api/webhooks/${id}/test`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh to get updated delivery status
        await fetchWebhooks();
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
    } finally {
      setTesting(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId],
    );
  };

  // Not connected
  if (!connected) {
    return (
      <div>
        <div className="max-w-4xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1B6B4A]/10 flex items-center justify-center border border-[#a78bfa]/20">
              <Webhook className="w-10 h-10 text-[#1B6B4A]" />
            </div>
            <h1 className="text-3xl font-bold text-[#0C1829] mb-4">
              Webhook Configuration
            </h1>
            <p className="text-[#7C8A9E] mb-8 max-w-md mx-auto">
              Connect your wallet to configure webhooks for payment
              notifications.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-[#FDFBF7] text-[#0C1829] px-8 py-4 rounded-xl font-semibold hover:bg-[#F3F2ED] transition-all "
            >
              <LogIn className="w-5 h-5" />
              Connect Wallet
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-[#F3F2ED] hover:bg-[#F3F2ED] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#7C8A9E]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#0C1829]">Webhooks</h1>
              <p className="text-[#7C8A9E] text-sm">
                Receive real-time payment notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#FDFBF7] text-[#0C1829] px-4 py-2 rounded-xl font-medium hover:bg-[#F3F2ED] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Webhook
          </button>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1B6B4A]/[0.06] border border-[#a78bfa]/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#1B6B4A]/15">
              <Shield className="w-6 h-6 text-[#1B6B4A]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0C1829] mb-2">
                Secure Webhook Delivery
              </h3>
              <p className="text-[#7C8A9E] text-sm">
                All webhook payloads are signed with HMAC-SHA256. Verify the{" "}
                <code className="bg-[#F3F2ED] px-1.5 py-0.5 rounded text-[#1B6B4A]">
                  X-Settlr-Signature
                </code>{" "}
                header to ensure authenticity. See our{" "}
                <Link
                  href="/docs#webhooks"
                  className="text-[#1B6B4A] hover:underline"
                >
                  webhook documentation
                </Link>{" "}
                for implementation details.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Webhooks List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B6B4A]" />
          </div>
        ) : webhooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-[#E2DFD5] rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#F3F2ED] flex items-center justify-center">
              <Webhook className="w-8 h-8 text-[#7C8A9E]" />
            </div>
            <h3 className="text-xl font-semibold text-[#0C1829] mb-2">
              No webhooks configured
            </h3>
            <p className="text-[#7C8A9E] mb-6">
              Add a webhook endpoint to receive payment notifications in
              real-time.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-[#FDFBF7] text-[#0C1829] px-6 py-3 rounded-xl font-medium hover:bg-[#F3F2ED] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Webhook
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook, index) => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/[0.02] border border-[#E2DFD5] rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          webhook.active ? "bg-[#1B6B4A]" : "bg-white/30"
                        }`}
                      />
                      <code className="text-[#0C1829] font-mono text-sm bg-[#F3F2ED] px-3 py-1 rounded-lg">
                        {webhook.url}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#7C8A9E]">
                      <span>{webhook.events.length} events</span>
                      {webhook.lastDeliveryAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {webhook.lastDeliveryStatus === "success" ? (
                              <CheckCircle className="w-3 h-3 text-[#1B6B4A]" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            Last delivery:{" "}
                            {new Date(webhook.lastDeliveryAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testWebhook(webhook.id)}
                      disabled={testing === webhook.id}
                      className="p-2 rounded-lg bg-[#F3F2ED] hover:bg-[#F3F2ED] transition-colors disabled:opacity-50"
                      title="Send test event"
                    >
                      {testing === webhook.id ? (
                        <Loader2 className="w-4 h-4 text-[#7C8A9E] animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-[#7C8A9E]" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteWebhook(webhook.id)}
                      className="p-2 rounded-lg bg-[#F3F2ED] hover:bg-red-500/20 transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4 text-[#7C8A9E] hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Secret */}
                <div className="bg-[#F3F2ED] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#7C8A9E] mb-1">
                        Signing Secret
                      </p>
                      <code className="text-sm text-[#3B4963] font-mono">
                        {showSecret === webhook.id
                          ? webhook.secret
                          : "whsec_••••••••••••••••"}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setShowSecret(
                            showSecret === webhook.id ? null : webhook.id,
                          )
                        }
                        className="p-2 rounded-lg hover:bg-[#F3F2ED] transition-colors"
                      >
                        {showSecret === webhook.id ? (
                          <EyeOff className="w-4 h-4 text-[#7C8A9E]" />
                        ) : (
                          <Eye className="w-4 h-4 text-[#7C8A9E]" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            webhook.secret,
                            `secret-${webhook.id}`,
                          )
                        }
                        className="p-2 rounded-lg hover:bg-[#F3F2ED] transition-colors"
                      >
                        {copied === `secret-${webhook.id}` ? (
                          <Check className="w-4 h-4 text-[#1B6B4A]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#7C8A9E]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events */}
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 bg-[#1B6B4A]/10 text-[#1B6B4A] text-xs rounded-lg"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-[#FDFBF7]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-semibold text-[#0C1829] mb-6">
                Add Webhook Endpoint
              </h2>

              <div className="space-y-6">
                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-[#7C8A9E] mb-2">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://your-site.com/webhooks/settlr"
                    className="w-full bg-[#F3F2ED] border border-[#E2DFD5] rounded-xl px-4 py-3 text-[#0C1829] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent"
                  />
                  <p className="text-xs text-[#7C8A9E] mt-2">
                    Must be a valid HTTPS URL that can receive POST requests
                  </p>
                </div>

                {/* Event Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#7C8A9E] mb-3">
                    Events to Subscribe
                  </label>
                  <div className="space-y-2">
                    {WEBHOOK_EVENTS.map((event) => (
                      <label
                        key={event.id}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          selectedEvents.includes(event.id)
                            ? "bg-[#1B6B4A]/10 border border-[#a78bfa]/20"
                            : "bg-[#F3F2ED] border border-transparent hover:bg-[#F3F2ED]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => toggleEvent(event.id)}
                          className="mt-1 rounded border-[#E2DFD5]/[0.12] text-[#1B6B4A] focus:ring-[#a78bfa]"
                        />
                        <div>
                          <p className="text-sm font-medium text-[#0C1829]">
                            {event.label}
                          </p>
                          <p className="text-xs text-[#7C8A9E]">
                            {event.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#F3F2ED] text-[#3B4963] hover:bg-[#F3F2ED] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createWebhook}
                  disabled={creating || !newUrl || selectedEvents.length === 0}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#FDFBF7] text-[#0C1829] font-medium hover:bg-[#F3F2ED] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Webhook
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
