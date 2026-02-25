"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  Upload,
  FileSpreadsheet,
  Check,
  X,
  AlertCircle,
  Send,
  ArrowLeft,
  Download,
  Loader2,
  Mail,
  DollarSign,
  Users,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Plus,
} from "lucide-react";

/* ─── Palette ─── */
const CREAM = "#FDFBF7";
const NAVY = "#0C1829";
const SLATE = "#3B4963";
const MUTED = "#7C8A9E";
const GREEN = "#1B6B4A";
const ACCENT = "#2A9D6A";
const TOPO = "#E8E4DA";
const CARD_BORDER = "#E2DFD5";

/* ─── Types ─── */
interface PayoutRow {
  email: string;
  amount: number;
  memo: string;
  valid: boolean;
  error?: string;
}

interface BatchResult {
  id: string;
  status: string;
  total: number;
  count: number;
  payouts: {
    id: string;
    email: string;
    amount: number;
    status: string;
    claimUrl: string;
  }[];
  createdAt: string;
}

type Step = "upload" | "preview" | "sending" | "complete";

/* ─── Sample CSV ─── */
const SAMPLE_CSV = `email,amount,memo
maria@example.com,250.00,February contractor payment
james@example.com,1200.00,Engineering sprint bonus
sofia@example.com,85.50,Content writing — 3 articles
chen@example.com,500.00,Design system audit
priya@example.com,375.00,QA testing — release v2.4`;

/* ─── CSV Parser ─── */
function parseCSV(text: string): PayoutRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Detect header
  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("email") ||
    header.includes("amount") ||
    header.includes("memo");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split(",").map((s) => s.trim());
      const email = parts[0] || "";
      const amount = parseFloat(parts[1] || "0");
      const memo = parts.slice(2).join(",").trim() || "";

      // Validation
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const amountValid = !isNaN(amount) && amount >= 0.01 && amount <= 100000;

      let error: string | undefined;
      if (!emailValid) error = "Invalid email address";
      else if (!amountValid)
        error =
          amount <= 0
            ? "Amount must be > $0"
            : amount > 100000
            ? "Amount exceeds $100,000 limit"
            : "Invalid amount";

      return {
        email,
        amount: amountValid ? amount : 0,
        memo,
        valid: emailValid && amountValid,
        error,
      };
    });
}

/* ─── Animation ─── */
const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

const fadeInProps = {
  variants: fadeIn,
  initial: "hidden" as const,
  animate: "visible" as const,
  exit: "exit" as const,
};

export default function BatchPayoutDemo() {
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);
  const totalAmount = validRows.reduce((sum, r) => sum + r.amount, 0);
  const totalFee = validRows.reduce(
    (sum, r) => sum + Math.max(r.amount * 0.01, 0.25),
    0,
  );

  /* ─── File handling ─── */
  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError("No valid rows found in CSV");
        return;
      }
      if (parsed.length > 500) {
        setError("Maximum 500 payouts per batch");
        return;
      }
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const loadSample = useCallback(() => {
    const parsed = parseCSV(SAMPLE_CSV);
    setRows(parsed);
    setStep("preview");
  }, []);

  const downloadSample = useCallback(() => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "settlr-batch-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /* ─── Row editing ─── */
  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { email: "", amount: 0, memo: "", valid: false, error: "Empty row" },
    ]);
  };

  const updateRow = (index: number, field: keyof PayoutRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = {
          ...row,
          [field]: field === "amount" ? parseFloat(value) || 0 : value,
        };
        // Re-validate
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email);
        const amountValid =
          !isNaN(updated.amount) &&
          updated.amount >= 0.01 &&
          updated.amount <= 100000;
        updated.valid = emailValid && amountValid;
        updated.error = !emailValid
          ? "Invalid email"
          : !amountValid
          ? "Invalid amount"
          : undefined;
        return updated;
      }),
    );
  };

  /* ─── Send batch ─── */
  const sendBatch = async () => {
    if (validRows.length === 0) return;
    setSending(true);
    setStep("sending");
    setProgress(0);
    setError(null);

    // Simulate progress while API call completes
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const res = await fetch("/api/payouts/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Demo mode — use a demo API key or skip auth
          "x-api-key": "demo_batch_test",
        },
        body: JSON.stringify({
          payouts: validRows.map((r) => ({
            email: r.email,
            amount: r.amount,
            memo: r.memo || undefined,
          })),
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // If API fails (expected in demo without real API key), show mock result
        if (res.status === 401 || res.status === 402) {
          // Generate mock result for demo purposes
          await new Promise((resolve) => setTimeout(resolve, 800));
          const mockResult: BatchResult = {
            id: `batch_${Date.now().toString(36)}`,
            status: "processing",
            total: totalAmount,
            count: validRows.length,
            payouts: validRows.map((r, i) => ({
              id: `po_${Date.now().toString(36)}_${i}`,
              email: r.email,
              amount: r.amount,
              status: "sent",
              claimUrl: `https://settlr.dev/claim/demo_${Math.random()
                .toString(36)
                .slice(2, 10)}`,
            })),
            createdAt: new Date().toISOString(),
          };
          setResult(mockResult);
          setStep("complete");
          return;
        }
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data: BatchResult = await res.json();
      setResult(data);
      setStep("complete");
    } catch (err) {
      clearInterval(progressInterval);
      // Fallback: show mock result for demo
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockResult: BatchResult = {
        id: `batch_${Date.now().toString(36)}`,
        status: "processing",
        total: totalAmount,
        count: validRows.length,
        payouts: validRows.map((r, i) => ({
          id: `po_${Date.now().toString(36)}_${i}`,
          email: r.email,
          amount: r.amount,
          status: "sent",
          claimUrl: `https://settlr.dev/claim/demo_${Math.random()
            .toString(36)
            .slice(2, 10)}`,
        })),
        createdAt: new Date().toISOString(),
      };
      setResult(mockResult);
      setStep("complete");
    } finally {
      setSending(false);
    }
  };

  /* ─── Reset ─── */
  const reset = () => {
    setStep("upload");
    setRows([]);
    setResult(null);
    setProgress(0);
    setError(null);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FDFBF7]">
        {/* Header */}
        <section className="relative overflow-hidden px-4 pb-8 pt-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(27,107,74,0.1),transparent)]" />
          </div>
          <div className="relative mx-auto max-w-4xl">
            <Link
              href="/demo"
              className="mb-6 inline-flex items-center gap-2 text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Demos
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E2DFD5] bg-[#F3F2ED] px-4 py-1.5">
                <Users className="h-4 w-4 text-[#1B6B4A]" />
                <span className="text-sm font-medium text-[#3B4963]">
                  Batch Payouts
                </span>
              </div>
              <h1
                className="mb-3 text-4xl font-bold tracking-tight md:text-5xl"
                style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
              >
                Pay Everyone at Once
              </h1>
              <p className="max-w-2xl text-lg" style={{ color: MUTED }}>
                Upload a CSV with emails and amounts. We&apos;ll send USDC to
                each recipient — no wallets needed. They claim via email link.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main content */}
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-4xl">
            {/* Step indicator */}
            <div className="mb-8 flex items-center gap-3">
              {(
                [
                  { key: "upload", label: "Upload", num: 1 },
                  { key: "preview", label: "Preview", num: 2 },
                  { key: "sending", label: "Send", num: 3 },
                  { key: "complete", label: "Done", num: 4 },
                ] as const
              ).map((s, i) => {
                const isActive = step === s.key;
                const isPast =
                  ["upload", "preview", "sending", "complete"].indexOf(step) >
                  ["upload", "preview", "sending", "complete"].indexOf(s.key);
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    {i > 0 && (
                      <div
                        className="h-px w-8"
                        style={{
                          background: isPast ? GREEN : CARD_BORDER,
                        }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                        style={{
                          background: isPast
                            ? GREEN
                            : isActive
                            ? `${GREEN}20`
                            : `${TOPO}`,
                          color: isPast ? "#fff" : isActive ? GREEN : MUTED,
                        }}
                      >
                        {isPast ? <Check className="h-3.5 w-3.5" /> : s.num}
                      </div>
                      <span
                        className="hidden text-sm font-medium sm:block"
                        style={{
                          color: isActive || isPast ? NAVY : MUTED,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* ─── STEP 1: Upload ─── */}
              {step === "upload" && (
                <motion.div key="upload" {...fadeInProps}>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all"
                    style={{
                      borderColor: dragOver ? GREEN : CARD_BORDER,
                      background: dragOver ? `${GREEN}08` : "white",
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                    <div
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: `${GREEN}15` }}
                    >
                      <Upload className="h-8 w-8" style={{ color: GREEN }} />
                    </div>
                    <h3
                      className="mb-2 text-lg font-semibold"
                      style={{ color: NAVY }}
                    >
                      Drop your CSV here
                    </h3>
                    <p style={{ color: MUTED }} className="text-sm">
                      or click to browse. Format:{" "}
                      <code
                        className="rounded bg-[#F3F2ED] px-1.5 py-0.5 text-xs"
                        style={{ color: SLATE }}
                      >
                        email, amount, memo
                      </code>
                    </p>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      onClick={loadSample}
                      className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#F3F2ED]"
                      style={{
                        borderColor: CARD_BORDER,
                        color: NAVY,
                      }}
                    >
                      <FileSpreadsheet
                        className="h-4 w-4"
                        style={{ color: GREEN }}
                      />
                      Load Sample Data
                    </button>
                    <button
                      onClick={downloadSample}
                      className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#F3F2ED]"
                      style={{
                        borderColor: CARD_BORDER,
                        color: SLATE,
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </button>
                  </div>

                  {/* CSV format guide */}
                  <div
                    className="mt-8 rounded-2xl border p-6"
                    style={{
                      borderColor: CARD_BORDER,
                      background: "white",
                    }}
                  >
                    <h4
                      className="mb-3 text-sm font-semibold uppercase tracking-wider"
                      style={{ color: MUTED }}
                    >
                      CSV Format
                    </h4>
                    <pre
                      className="overflow-x-auto rounded-xl p-4 text-sm leading-relaxed"
                      style={{
                        background: NAVY,
                        color: "#e2e8f0",
                        fontFamily: "var(--font-jetbrains)",
                      }}
                    >
                      <span style={{ color: MUTED }}>
                        # email, amount (USD), memo (optional)
                      </span>
                      {"\n"}
                      <span style={{ color: "#94a3b8" }}>email</span>
                      <span style={{ color: MUTED }}>,</span>
                      <span style={{ color: "#94a3b8" }}>amount</span>
                      <span style={{ color: MUTED }}>,</span>
                      <span style={{ color: "#94a3b8" }}>memo</span>
                      {"\n"}
                      <span style={{ color: ACCENT }}>maria@example.com</span>
                      <span style={{ color: MUTED }}>,</span>
                      <span style={{ color: "#fbbf24" }}>250.00</span>
                      <span style={{ color: MUTED }}>,</span>
                      <span style={{ color: "#94a3b8" }}>
                        February contractor payment
                      </span>
                      {"\n"}
                      <span style={{ color: ACCENT }}>james@example.com</span>
                      <span style={{ color: MUTED }}>,</span>
                      <span style={{ color: "#fbbf24" }}>1200.00</span>
                      <span style={{ color: MUTED }}>,</span>
                      <span style={{ color: "#94a3b8" }}>
                        Engineering sprint bonus
                      </span>
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 2: Preview ─── */}
              {step === "preview" && (
                <motion.div key="preview" {...fadeInProps}>
                  {/* Summary bar */}
                  <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      {
                        label: "Recipients",
                        value: validRows.length.toString(),
                        icon: Users,
                        color: GREEN,
                      },
                      {
                        label: "Total Payout",
                        value: `$${totalAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}`,
                        icon: DollarSign,
                        color: GREEN,
                      },
                      {
                        label: "Fees (1%)",
                        value: `$${totalFee.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}`,
                        icon: DollarSign,
                        color: MUTED,
                      },
                      {
                        label: "Errors",
                        value: invalidRows.length.toString(),
                        icon: AlertCircle,
                        color: invalidRows.length > 0 ? "#dc2626" : GREEN,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border p-4"
                        style={{
                          borderColor: CARD_BORDER,
                          background: "white",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <stat.icon
                            className="h-4 w-4"
                            style={{ color: stat.color }}
                          />
                          <span
                            className="text-xs font-medium uppercase tracking-wider"
                            style={{ color: MUTED }}
                          >
                            {stat.label}
                          </span>
                        </div>
                        <p
                          className="mt-1 text-xl font-bold"
                          style={{ color: NAVY }}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  <div
                    className="overflow-hidden rounded-2xl border"
                    style={{
                      borderColor: CARD_BORDER,
                      background: "white",
                    }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr
                            style={{
                              borderBottom: `1px solid ${CARD_BORDER}`,
                              background: "#F8F7F3",
                            }}
                          >
                            <th
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              #
                            </th>
                            <th
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Email
                            </th>
                            <th
                              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Amount
                            </th>
                            <th
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Memo
                            </th>
                            <th
                              className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Status
                            </th>
                            <th className="w-10 px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr
                              key={i}
                              className="group transition-colors hover:bg-[#FDFBF7]"
                              style={{
                                borderBottom:
                                  i < rows.length - 1
                                    ? `1px solid ${CARD_BORDER}`
                                    : undefined,
                              }}
                            >
                              <td
                                className="px-4 py-3 font-mono text-xs"
                                style={{ color: MUTED }}
                              >
                                {i + 1}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={row.email}
                                  onChange={(e) =>
                                    updateRow(i, "email", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none focus:border-b"
                                  style={{
                                    color: row.valid ? NAVY : "#dc2626",
                                    borderColor: GREEN,
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input
                                  type="text"
                                  value={row.amount || ""}
                                  onChange={(e) =>
                                    updateRow(i, "amount", e.target.value)
                                  }
                                  className="w-20 bg-transparent text-right font-mono outline-none focus:border-b"
                                  style={{
                                    color: row.valid ? NAVY : "#dc2626",
                                    borderColor: GREEN,
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={row.memo}
                                  onChange={(e) =>
                                    updateRow(i, "memo", e.target.value)
                                  }
                                  className="w-full bg-transparent text-sm outline-none focus:border-b"
                                  style={{ color: SLATE, borderColor: GREEN }}
                                  placeholder="Optional memo..."
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                {row.valid ? (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                    style={{
                                      background: `${GREEN}15`,
                                      color: GREEN,
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                    Valid
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                                    title={row.error}
                                  >
                                    <X className="h-3 w-3" />
                                    {row.error || "Error"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => removeRow(i)}
                                  className="opacity-0 transition-opacity group-hover:opacity-100"
                                  style={{ color: MUTED }}
                                >
                                  <Trash2 className="h-4 w-4 hover:text-red-500" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div
                      className="flex items-center justify-between border-t px-4 py-3"
                      style={{ borderColor: CARD_BORDER }}
                    >
                      <button
                        onClick={addRow}
                        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                        style={{ color: GREEN }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Row
                      </button>
                      <span className="text-xs" style={{ color: MUTED }}>
                        {validRows.length} of {rows.length} valid
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#F3F2ED]"
                      style={{ borderColor: CARD_BORDER, color: SLATE }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Start Over
                    </button>
                    <button
                      onClick={sendBatch}
                      disabled={validRows.length === 0}
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: GREEN }}
                    >
                      <Send className="h-4 w-4" />
                      Send {validRows.length} Payout
                      {validRows.length !== 1 ? "s" : ""} — $
                      {totalAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 3: Sending ─── */}
              {step === "sending" && (
                <motion.div key="sending" {...fadeInProps}>
                  <div
                    className="rounded-2xl border p-12 text-center"
                    style={{
                      borderColor: CARD_BORDER,
                      background: "white",
                    }}
                  >
                    <Loader2
                      className="mx-auto mb-6 h-12 w-12 animate-spin"
                      style={{ color: GREEN }}
                    />
                    <h3
                      className="mb-2 text-xl font-semibold"
                      style={{ color: NAVY }}
                    >
                      Sending Payouts...
                    </h3>
                    <p className="mb-8" style={{ color: MUTED }}>
                      Creating batch and sending claim emails to{" "}
                      {validRows.length} recipients
                    </p>

                    {/* Progress bar */}
                    <div className="mx-auto max-w-md">
                      <div
                        className="h-2 overflow-hidden rounded-full"
                        style={{ background: TOPO }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: GREEN }}
                          initial={{ width: "0%" }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="mt-2 text-sm" style={{ color: MUTED }}>
                        {Math.round(progress)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 4: Complete ─── */}
              {step === "complete" && result && (
                <motion.div key="complete" {...fadeInProps}>
                  {/* Success banner */}
                  <div
                    className="mb-6 rounded-2xl p-6"
                    style={{ background: `${GREEN}10` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${GREEN}20` }}
                      >
                        <CheckCircle2
                          className="h-6 w-6"
                          style={{ color: GREEN }}
                        />
                      </div>
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: NAVY }}
                        >
                          Batch Sent Successfully
                        </h3>
                        <p className="mt-1" style={{ color: SLATE }}>
                          {result.count} payouts totaling{" "}
                          <strong>
                            $
                            {result.total.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>{" "}
                          USDC have been sent. Recipients will receive claim
                          emails shortly.
                        </p>
                        <p
                          className="mt-2 font-mono text-xs"
                          style={{ color: MUTED }}
                        >
                          Batch ID: {result.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Results table */}
                  <div
                    className="overflow-hidden rounded-2xl border"
                    style={{
                      borderColor: CARD_BORDER,
                      background: "white",
                    }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr
                            style={{
                              borderBottom: `1px solid ${CARD_BORDER}`,
                              background: "#F8F7F3",
                            }}
                          >
                            <th
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Recipient
                            </th>
                            <th
                              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Amount
                            </th>
                            <th
                              className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Status
                            </th>
                            <th
                              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                              style={{ color: MUTED }}
                            >
                              Claim Link
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.payouts.map((payout, i) => (
                            <tr
                              key={payout.id}
                              style={{
                                borderBottom:
                                  i < result.payouts.length - 1
                                    ? `1px solid ${CARD_BORDER}`
                                    : undefined,
                              }}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Mail
                                    className="h-4 w-4"
                                    style={{ color: GREEN }}
                                  />
                                  <span style={{ color: NAVY }}>
                                    {payout.email}
                                  </span>
                                </div>
                              </td>
                              <td
                                className="px-4 py-3 text-right font-mono"
                                style={{ color: NAVY }}
                              >
                                $
                                {payout.amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                  style={{
                                    background: `${GREEN}15`,
                                    color: GREEN,
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                  {payout.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a
                                  href={payout.claimUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                                  style={{ color: GREEN }}
                                >
                                  Open
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#F3F2ED]"
                      style={{ borderColor: CARD_BORDER, color: NAVY }}
                    >
                      <Plus className="h-4 w-4" />
                      New Batch
                    </button>
                    <Link
                      href="/demo"
                      className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#F3F2ED]"
                      style={{ borderColor: CARD_BORDER, color: SLATE }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Demos
                    </Link>
                  </div>

                  {/* How it works callout */}
                  <div
                    className="mt-8 rounded-2xl border p-6"
                    style={{
                      borderColor: CARD_BORDER,
                      background: "white",
                    }}
                  >
                    <h4
                      className="mb-4 text-sm font-semibold uppercase tracking-wider"
                      style={{ color: MUTED }}
                    >
                      What happens next
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        {
                          step: "1",
                          title: "Email Sent",
                          desc: "Each recipient gets an email with a unique claim link",
                        },
                        {
                          step: "2",
                          title: "Recipient Claims",
                          desc: "They click the link, connect or create a wallet — no crypto knowledge needed",
                        },
                        {
                          step: "3",
                          title: "USDC Delivered",
                          desc: "Funds transfer on Solana in < 1 second. They can off-ramp to local currency.",
                        },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                              background: `${GREEN}15`,
                              color: GREEN,
                            }}
                          >
                            {item.step}
                          </div>
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: NAVY }}
                            >
                              {item.title}
                            </p>
                            <p
                              className="mt-0.5 text-sm"
                              style={{ color: MUTED }}
                            >
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
