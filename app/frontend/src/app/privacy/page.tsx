"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Check,
  Loader2,
  Server,
  Layers,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react";

// ── Types ──

type SessionStatus = "idle" | "pending" | "active" | "processed" | "settled";

interface SessionState {
  paymentId: string | null;
  status: SessionStatus;
  amount: number;
  feeAmount: number;
  memo: string;
  customerPubkey: string;
  merchantPubkey: string;
  txSignatures: {
    create?: string;
    delegate?: string;
    process?: string;
    settle?: string;
  };
  settledAt: number | null;
}

const API = "/api/privacy/gaming";

const STEPS = [
  {
    key: "create" as const,
    label: "Create Session",
    description: "Create private payment on base layer",
    icon: Layers,
  },
  {
    key: "delegate" as const,
    label: "Delegate to PER",
    description: "Move data into Intel TDX TEE",
    icon: Shield,
  },
  {
    key: "process" as const,
    label: "Process in TEE",
    description: "Execute payment (hidden from observers)",
    icon: EyeOff,
  },
  {
    key: "settle" as const,
    label: "Settle on Solana",
    description: "Commit final state to base layer",
    icon: CheckCircle2,
  },
];

function randomPubkey() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from(
    { length: 44 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export default function PrivacyPage() {
  const [session, setSession] = useState<SessionState>({
    paymentId: null,
    status: "idle",
    amount: 25_000_000, // 25 USDC
    feeAmount: 250_000, // 0.25 USDC
    memo: "Private payment demo",
    customerPubkey: "",
    merchantPubkey: "",
    txSignatures: {},
    settledAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Step handlers ──

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    const customer = randomPubkey();
    const merchant = randomPubkey();
    addLog("Creating private payment session on base layer...");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          customerPubkey: customer,
          merchantPubkey: merchant,
          amount: session.amount,
          feeAmount: session.feeAmount,
          memo: session.memo,
        }),
      }).then((r) => r.json());

      if (!res.success) throw new Error(res.error);

      setSession((s) => ({
        ...s,
        paymentId: res.session.paymentId,
        status: "pending",
        customerPubkey: customer,
        merchantPubkey: merchant,
        txSignatures: { create: res.txSignature },
      }));
      setCurrentStep(0);
      addLog(`✅ Session created: ${res.session.paymentId}`);
      addLog(`   Tx: ${res.txSignature.slice(0, 16)}...`);
    } catch (e: any) {
      setError(e.message);
      addLog(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelegate = async () => {
    if (!session.paymentId) return;
    setLoading(true);
    setError(null);
    addLog("Delegating to Private Ephemeral Rollup...");
    addLog("  → Moving account into Intel TDX TEE");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delegate",
          sessionId: session.paymentId,
        }),
      }).then((r) => r.json());

      if (!res.success) throw new Error(res.error);

      setSession((s) => ({
        ...s,
        status: "active",
        txSignatures: { ...s.txSignatures, delegate: res.txSignature },
      }));
      setCurrentStep(1);
      addLog("✅ Delegated! Data now hidden inside TEE");
      addLog("   🔐 Base-layer observers see nothing");
    } catch (e: any) {
      setError(e.message);
      addLog(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!session.paymentId) return;
    setLoading(true);
    setError(null);
    addLog("Processing payment inside TEE...");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process",
          sessionId: session.paymentId,
        }),
      }).then((r) => r.json());

      if (!res.success) throw new Error(res.error);

      setSession((s) => ({
        ...s,
        status: "processed",
        txSignatures: { ...s.txSignatures, process: res.txSignature },
      }));
      setCurrentStep(2);
      addLog("✅ Payment processed (hidden in TEE)");
      addLog(
        `   Amount: ${session.amount / 1e6} USDC — invisible to observers`,
      );
    } catch (e: any) {
      setError(e.message);
      addLog(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!session.paymentId) return;
    setLoading(true);
    setError(null);
    addLog("Settling — committing state to Solana...");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "settle",
          sessionId: session.paymentId,
        }),
      }).then((r) => r.json());

      if (!res.success) throw new Error(res.error);

      setSession((s) => ({
        ...s,
        status: "settled",
        settledAt: res.session.settledAt,
        txSignatures: { ...s.txSignatures, settle: res.txSignature },
      }));
      setCurrentStep(3);
      addLog("✅ Payment settled on Solana base layer!");
      addLog(
        `   Merchant receives: ${
          (session.amount - session.feeAmount) / 1e6
        } USDC`,
      );
      addLog(`   Platform fee: ${session.feeAmount / 1e6} USDC`);
    } catch (e: any) {
      setError(e.message);
      addLog(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSession({
      paymentId: null,
      status: "idle",
      amount: 25_000_000,
      feeAmount: 250_000,
      memo: "Private payment demo",
      customerPubkey: "",
      merchantPubkey: "",
      txSignatures: {},
      settledAt: null,
    });
    setCurrentStep(-1);
    setLogs([]);
    setError(null);
  };

  const handleRunAll = async () => {
    await handleCreate();
    await new Promise((r) => setTimeout(r, 600));
    // Need to re-read session state
  };

  const nextAction = () => {
    if (session.status === "idle") return handleCreate;
    if (session.status === "pending") return handleDelegate;
    if (session.status === "active") return handleProcess;
    if (session.status === "processed") return handleSettle;
    return null;
  };

  const nextLabel = () => {
    if (session.status === "idle") return "Create Session";
    if (session.status === "pending") return "Delegate to PER";
    if (session.status === "active") return "Process in TEE";
    if (session.status === "processed") return "Settle on Solana";
    return null;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FDFBF7]">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-12 pt-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
          </div>
          <div className="absolute right-[15%] top-[25%] h-64 w-64 rounded-full bg-purple-500/[0.07] blur-[100px]" />
          <div className="absolute left-[10%] top-[35%] h-48 w-48 rounded-full bg-[#1B6B4A]/[0.05] blur-[100px]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/[0.08] px-4 py-2"
            >
              <Shield className="h-4 w-4 text-[#1B6B4A]" />
              <span className="text-sm font-medium text-purple-300">
                MagicBlock Private Ephemeral Rollups
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 text-4xl font-bold tracking-tight text-[#0C1829] sm:text-5xl"
            >
              Private Payments{" "}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                on Solana
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-lg text-[#7C8A9E]"
            >
              Payment data hidden inside Intel TDX hardware enclaves. Only
              permissioned parties see state. Sub-10ms latency, gasless
              transactions, full Solana composability.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: Shield, label: "Intel TDX TEE" },
                { icon: Zap, label: "Sub-10ms" },
                { icon: EyeOff, label: "Hidden state" },
                { icon: Lock, label: "Permissioned" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-[#E2DFD5] bg-[#F3F2ED] px-3 py-1.5 text-sm text-[#7C8A9E]"
                >
                  <Icon className="h-3.5 w-3.5 text-[#1B6B4A]" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Flow Steps */}
        <section className="relative mx-auto max-w-5xl px-4 pb-8">
          <div className="mb-8 grid grid-cols-4 gap-3">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isCompleted =
                i < currentStep + 1 && session.status !== "idle";
              const isCurrent = i === currentStep + 1;
              const isActive = i <= currentStep;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isCompleted
                      ? "border-[#1B6B4A]/30 bg-purple-500/[0.08]"
                      : isCurrent
                      ? "border-[#1B6B4A]/30 bg-[#1B6B4A]/[0.06]"
                      : "border-[#E2DFD5] bg-white/[0.02]"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-purple-500/20 text-[#1B6B4A]"
                          : isCurrent
                          ? "bg-[#1B6B4A]/15 text-[#1B6B4A]"
                          : "bg-[#F3F2ED] text-[#7C8A9E]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCompleted
                          ? "text-purple-300"
                          : isCurrent
                          ? "text-blue-300"
                          : "text-[#7C8A9E]"
                      }`}
                    >
                      Step {i + 1}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-semibold ${
                      isActive || isCurrent ? "text-[#0C1829]" : "text-[#7C8A9E]"
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="mt-1 text-xs text-[#7C8A9E]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Main Demo Panel */}
        <section className="relative mx-auto max-w-5xl px-4 pb-16">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Control Panel */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#0C1829]">
                  Payment Details
                </h2>

                {/* Amount */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs text-[#7C8A9E]">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={session.amount / 1e6}
                    onChange={(e) =>
                      setSession((s) => ({
                        ...s,
                        amount: Math.round(
                          parseFloat(e.target.value || "0") * 1e6,
                        ),
                        feeAmount: Math.round(
                          parseFloat(e.target.value || "0") * 1e6 * 0.01,
                        ),
                      }))
                    }
                    disabled={session.status !== "idle"}
                    className="w-full rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-3 py-2 text-sm text-[#0C1829] placeholder-white/20 outline-none focus:border-purple-500/40 disabled:opacity-40"
                    placeholder="25.00"
                  />
                </div>

                {/* Memo */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs text-[#7C8A9E]">
                    Memo
                  </label>
                  <input
                    type="text"
                    value={session.memo}
                    onChange={(e) =>
                      setSession((s) => ({ ...s, memo: e.target.value }))
                    }
                    disabled={session.status !== "idle"}
                    className="w-full rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-3 py-2 text-sm text-[#0C1829] placeholder-white/20 outline-none focus:border-purple-500/40 disabled:opacity-40"
                    placeholder="Payment memo"
                  />
                </div>

                {/* Fee display */}
                <div className="mb-6 rounded-lg border border-[#E2DFD5] bg-white/[0.02] p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7C8A9E]">Amount</span>
                    <span className="text-[#3B4963]">
                      {(session.amount / 1e6).toFixed(2)} USDC
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-[#7C8A9E]">Platform fee (1%)</span>
                    <span className="text-[#3B4963]">
                      {(session.feeAmount / 1e6).toFixed(2)} USDC
                    </span>
                  </div>
                  <div className="mt-2 border-t border-[#E2DFD5] pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#7C8A9E]">Merchant receives</span>
                      <span className="text-purple-300">
                        {((session.amount - session.feeAmount) / 1e6).toFixed(
                          2,
                        )}{" "}
                        USDC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <AnimatePresence mode="wait">
                  {session.status === "settled" ? (
                    <motion.button
                      key="reset"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={handleReset}
                      className="w-full rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] px-4 py-3 text-sm font-medium text-[#0C1829] transition-colors hover:bg-white/[0.1]"
                    >
                      Reset Demo
                    </motion.button>
                  ) : (
                    <motion.button
                      key="action"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={nextAction() || undefined}
                      disabled={loading || !nextAction()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {loading ? "Processing..." : nextLabel()}
                    </motion.button>
                  )}
                </AnimatePresence>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                {/* Status badge */}
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      session.status === "idle"
                        ? "bg-white/20"
                        : session.status === "settled"
                        ? "bg-green-400"
                        : session.status === "active"
                        ? "bg-purple-400 animate-pulse"
                        : "bg-blue-400"
                    }`}
                  />
                  <span className="text-xs text-[#7C8A9E]">
                    {session.status === "idle" && "Ready"}
                    {session.status === "pending" &&
                      "Session created — awaiting delegation"}
                    {session.status === "active" &&
                      "Hidden inside TEE — processing..."}
                    {session.status === "processed" &&
                      "Processed — ready to settle"}
                    {session.status === "settled" && "Settled on Solana ✓"}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Visualization + Log */}
            <div className="space-y-6 lg:col-span-3">
              {/* Privacy state visualization */}
              <div className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#0C1829]">
                  <Eye className="h-5 w-5 text-[#1B6B4A]" />
                  Base-Layer Observer View
                </h2>

                <div className="rounded-lg border border-[#E2DFD5] bg-[#FDFBF7]/40 p-4 font-mono text-xs">
                  {session.status === "idle" && (
                    <div className="text-[#7C8A9E]">
                      <p>// No active session</p>
                      <p>// Click &quot;Create Session&quot; to begin</p>
                    </div>
                  )}

                  {session.status === "pending" && (
                    <div className="space-y-1">
                      <p className="text-[#1B6B4A]">
                        // Session created on base layer
                      </p>
                      <p className="text-[#3B4963]">
                        payment_id:{" "}
                        <span className="text-[#1B6B4A]">
                          &quot;{session.paymentId}&quot;
                        </span>
                      </p>
                      <p className="text-[#3B4963]">
                        amount:{" "}
                        <span className="text-yellow-400">
                          {(session.amount / 1e6).toFixed(2)} USDC
                        </span>
                        <span className="text-[#7C8A9E]">
                          {" "}
                          // visible on-chain
                        </span>
                      </p>
                      <p className="text-[#3B4963]">
                        status: <span className="text-[#1B6B4A]">Pending</span>
                      </p>
                      <p className="text-[#3B4963]">
                        delegated: <span className="text-red-400">false</span>
                      </p>
                    </div>
                  )}

                  {(session.status === "active" ||
                    session.status === "processed") && (
                    <div className="space-y-1">
                      <p className="text-[#1B6B4A]">
                        // ⚠️ Account delegated to PER — data hidden
                      </p>
                      <p className="text-[#3B4963]">
                        payment_id:{" "}
                        <span className="text-[#1B6B4A]">
                          &quot;{session.paymentId}&quot;
                        </span>
                      </p>
                      <p className="text-[#7C8A9E]">
                        amount:{" "}
                        <span className="text-[#1B6B4A]/60">██████████</span>
                        <span className="text-[#1B6B4A]">
                          {" "}
                          // hidden in TEE
                        </span>
                      </p>
                      <p className="text-[#7C8A9E]">
                        fee:{" "}
                        <span className="text-[#1B6B4A]/60">████████</span>
                        <span className="text-[#1B6B4A]">
                          {" "}
                          // hidden in TEE
                        </span>
                      </p>
                      <p className="text-[#7C8A9E]">
                        customer:{" "}
                        <span className="text-[#1B6B4A]/60">████████████</span>
                        <span className="text-[#1B6B4A]">
                          {" "}
                          // hidden in TEE
                        </span>
                      </p>
                      <p className="text-[#7C8A9E]">
                        merchant:{" "}
                        <span className="text-[#1B6B4A]/60">████████████</span>
                        <span className="text-[#1B6B4A]">
                          {" "}
                          // hidden in TEE
                        </span>
                      </p>
                      <p className="text-[#3B4963]">
                        delegated: <span className="text-[#1B6B4A]">true</span>
                      </p>
                      <p className="text-[#3B4963]">
                        status:{" "}
                        <span className="text-[#1B6B4A]">
                          {session.status === "active"
                            ? "Active (in TEE)"
                            : "Processed (in TEE)"}
                        </span>
                      </p>
                      <div className="mt-3 rounded border border-purple-500/20 bg-purple-500/[0.06] p-2">
                        <p className="text-purple-300">
                          🔐 State encrypted inside Intel TDX enclave
                        </p>
                        <p className="text-purple-300/60">
                          Only permissioned members can observe
                        </p>
                      </div>
                    </div>
                  )}

                  {session.status === "settled" && (
                    <div className="space-y-1">
                      <p className="text-[#1B6B4A]">
                        // ✅ Payment settled — final state on-chain
                      </p>
                      <p className="text-[#3B4963]">
                        payment_id:{" "}
                        <span className="text-[#1B6B4A]">
                          &quot;{session.paymentId}&quot;
                        </span>
                      </p>
                      <p className="text-[#3B4963]">
                        amount:{" "}
                        <span className="text-yellow-400">
                          {(session.amount / 1e6).toFixed(2)} USDC
                        </span>
                        <span className="text-[#7C8A9E]"> // revealed</span>
                      </p>
                      <p className="text-[#3B4963]">
                        fee:{" "}
                        <span className="text-yellow-400">
                          {(session.feeAmount / 1e6).toFixed(2)} USDC
                        </span>
                      </p>
                      <p className="text-[#3B4963]">
                        merchant_receives:{" "}
                        <span className="text-[#1B6B4A]">
                          {((session.amount - session.feeAmount) / 1e6).toFixed(
                            2,
                          )}{" "}
                          USDC
                        </span>
                      </p>
                      <p className="text-[#3B4963]">
                        status: <span className="text-[#1B6B4A]">Settled</span>
                      </p>
                      <p className="text-[#3B4963]">
                        delegated: <span className="text-red-400">false</span>
                      </p>
                      <p className="text-[#7C8A9E]">
                        // Processing history remains private
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction log */}
              <div className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0C1829]">
                  <Server className="h-4 w-4 text-[#1B6B4A]" />
                  Transaction Log
                </h2>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-[#E2DFD5] bg-[#FDFBF7]/40 p-3 font-mono text-xs">
                  {logs.length === 0 ? (
                    <p className="text-[#7C8A9E]/60">Waiting for first action...</p>
                  ) : (
                    logs.map((log, i) => (
                      <p key={i} className="text-[#7C8A9E]">
                        {log}
                      </p>
                    ))
                  )}
                </div>

                {/* Tx signatures */}
                {Object.entries(session.txSignatures).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-xs font-medium text-[#7C8A9E]">
                      Signatures
                    </h3>
                    {Object.entries(session.txSignatures).map(([step, sig]) =>
                      sig ? (
                        <div
                          key={step}
                          className="flex items-center justify-between rounded-lg border border-[#E2DFD5]/[0.04] bg-white/[0.02] px-3 py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs capitalize text-[#7C8A9E]">
                              {step}
                            </span>
                            <span className="font-mono text-xs text-[#7C8A9E]">
                              {sig.slice(0, 16)}...{sig.slice(-8)}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(sig, step)}
                            className="text-[#7C8A9E] transition-colors hover:text-[#3B4963]"
                          >
                            {copied === step ? (
                              <Check className="h-3 w-3 text-[#1B6B4A]" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative mx-auto max-w-5xl px-4 pb-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#0C1829]">
            How Private Payments Work
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Private Ephemeral Rollups",
                description:
                  "MagicBlock's PER runs your payment inside an Intel TDX hardware enclave. Account state is delegated from Solana's base layer into the TEE where it's processed privately.",
                icon: Shield,
                color: "purple",
              },
              {
                title: "Permissioned Access Control",
                description:
                  "Only the merchant and customer can observe payment state during processing. The Permission program enforces access flags: TX_LOGS, BALANCES, MESSAGE.",
                icon: Lock,
                color: "blue",
              },
              {
                title: "Sub-10ms Latency",
                description:
                  "Inside the ephemeral rollup, transactions execute in under 10ms with zero gas fees. No block time waiting — instant confirmation for payment processing.",
                icon: Zap,
                color: "yellow",
              },
              {
                title: "Solana Composability",
                description:
                  "Final state is committed back to Solana's base layer. Your program's state remains on-chain, composable with all of Solana's DeFi ecosystem.",
                icon: Layers,
                color: "green",
              },
            ].map(({ title, description, icon: Icon, color }) => (
              <div
                key={title}
                className="rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-6"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                    color === "purple"
                      ? "bg-[#1B6B4A]/10 text-[#1B6B4A]"
                      : color === "blue"
                      ? "bg-[#1B6B4A]/10 text-[#1B6B4A]"
                      : color === "yellow"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-[#1B6B4A]/10 text-[#1B6B4A]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[#0C1829]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#7C8A9E]">
                  {description}
                </p>
              </div>
            ))}
          </div>

          {/* Hackathon badge */}
          <div className="mt-12 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/[0.06] to-blue-500/[0.06] p-6 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/[0.08] px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-[#1B6B4A]" />
              <span className="text-xs font-medium text-purple-300">
                SolanaBlitz Hackathon
              </span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#0C1829]">
              Built for MagicBlock Weekend Hackathon
            </h3>
            <p className="mx-auto max-w-xl text-sm text-[#7C8A9E]">
              Private payments powered by MagicBlock&apos;s Private Ephemeral
              Rollups. Real-world use case: stablecoin payouts where payment
              data is hidden during processing — only the merchant and customer
              see state.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#7C8A9E]">
              <span>ephemeral-rollups-sdk 0.8</span>
              <span>•</span>
              <span>Anchor 0.31.1</span>
              <span>•</span>
              <span>Intel TDX TEE</span>
              <span>•</span>
              <span>Solana Devnet</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
