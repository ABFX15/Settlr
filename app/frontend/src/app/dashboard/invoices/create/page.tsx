"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Save,
  Loader2,
  FileText,
  DollarSign,
  Calendar,
  User,
  Building2,
  Mail,
  AlertCircle,
} from "lucide-react";

/* ─── Palette ─── */
const NAVY = "#0C1829";
const SLATE = "#3B4963";
const MUTED = "#7C8A9E";
const GREEN = "#1B6B4A";
const TOPO = "#E8E4DA";
const CARD_BORDER = "#E2DFD5";

/* ─── Types ─── */
interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const TERMS_OPTIONS = [
  "Due on receipt",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
  "Net 90",
  "Custom",
];

function getDueDateFromTerms(terms: string): Date {
  const now = new Date();
  switch (terms) {
    case "Due on receipt":
      return now;
    case "Net 7":
      return new Date(now.getTime() + 7 * 86400000);
    case "Net 15":
      return new Date(now.getTime() + 15 * 86400000);
    case "Net 30":
      return new Date(now.getTime() + 30 * 86400000);
    case "Net 60":
      return new Date(now.getTime() + 60 * 86400000);
    case "Net 90":
      return new Date(now.getTime() + 90 * 86400000);
    default:
      return new Date(now.getTime() + 30 * 86400000);
  }
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { publicKey, connected } = useActiveWallet();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buyer info
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerCompany, setBuyerCompany] = useState("");

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Invoice details
  const [terms, setTerms] = useState("Net 30");
  const [customDueDate, setCustomDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [memo, setMemo] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Calculations
  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0,
  );
  const tax = taxRate ? subtotal * (parseFloat(taxRate) / 100) : 0;
  const total = subtotal + tax;

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((li, i) => {
        if (i !== index) return li;
        return { ...li, [field]: value };
      }),
    );
  };

  const handleSubmit = async (sendEmail: boolean) => {
    setError(null);

    if (!publicKey) {
      setError(
        "Connect your wallet to create invoices — payments will be sent to your wallet address.",
      );
      return;
    }

    // Validation
    if (!buyerName.trim()) {
      setError("Buyer name is required");
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes("@")) {
      setError("Valid buyer email is required");
      return;
    }
    if (lineItems.some((li) => !li.description.trim())) {
      setError("All line items need a description");
      return;
    }
    if (lineItems.some((li) => li.unitPrice <= 0)) {
      setError("All line items need a price > $0");
      return;
    }

    setSaving(true);

    try {
      const dueDate =
        terms === "Custom" && customDueDate
          ? new Date(customDueDate)
          : getDueDateFromTerms(terms);

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-wallet": publicKey || "",
        },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerCompany: buyerCompany.trim() || undefined,
          lineItems: lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            amount: li.quantity * li.unitPrice,
          })),
          taxRate: taxRate ? parseFloat(taxRate) : undefined,
          memo: memo.trim() || undefined,
          terms,
          dueDate: dueDate.toISOString(),
          invoiceNumber: invoiceNumber.trim() || undefined,
          sendEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create invoice");
      }

      router.push("/dashboard/invoices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/invoices"
          className="mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: MUTED }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
        <h1
          className="text-2xl font-bold"
          style={{ color: NAVY, fontFamily: "var(--font-fraunces)" }}
        >
          Create Invoice
        </h1>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          Send a professional invoice — your buyer pays with USDC via a
          one-click link
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Buyer info */}
      <div
        className="rounded-2xl border p-6"
        style={{ borderColor: CARD_BORDER, background: "white" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4" style={{ color: GREEN }} />
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: MUTED }}
          >
            Bill To
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: SLATE }}
            >
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
              style={{ borderColor: CARD_BORDER, color: NAVY }}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: SLATE }}
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="jane@dispensary.com"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
              style={{ borderColor: CARD_BORDER, color: NAVY }}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: SLATE }}
            >
              Company Name
            </label>
            <input
              type="text"
              value={buyerCompany}
              onChange={(e) => setBuyerCompany(e.target.value)}
              placeholder="Green Valley Dispensary"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
              style={{ borderColor: CARD_BORDER, color: NAVY }}
            />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div
        className="rounded-2xl border p-6"
        style={{ borderColor: CARD_BORDER, background: "white" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" style={{ color: GREEN }} />
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: MUTED }}
          >
            Line Items
          </h2>
        </div>

        <div className="space-y-3">
          {/* Header */}
          <div
            className="hidden grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider sm:grid"
            style={{ color: MUTED }}
          >
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1" />
          </div>

          {lineItems.map((li, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-12 sm:col-span-5">
                <input
                  type="text"
                  value={li.description}
                  onChange={(e) =>
                    updateLineItem(i, "description", e.target.value)
                  }
                  placeholder="Product or service description"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
                  style={{ borderColor: CARD_BORDER, color: NAVY }}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number"
                  value={li.quantity || ""}
                  onChange={(e) =>
                    updateLineItem(i, "quantity", parseInt(e.target.value) || 0)
                  }
                  min={1}
                  className="w-full rounded-lg border px-3 py-2 text-right text-sm outline-none transition-colors focus:border-[#1B6B4A]"
                  style={{ borderColor: CARD_BORDER, color: NAVY }}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number"
                  value={li.unitPrice || ""}
                  onChange={(e) =>
                    updateLineItem(
                      i,
                      "unitPrice",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full rounded-lg border px-3 py-2 text-right text-sm outline-none transition-colors focus:border-[#1B6B4A]"
                  style={{ borderColor: CARD_BORDER, color: NAVY }}
                />
              </div>
              <div
                className="col-span-3 text-right font-mono text-sm font-semibold sm:col-span-2"
                style={{ color: NAVY }}
              >
                $
                {(li.quantity * li.unitPrice).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="col-span-1 text-center">
                <button
                  onClick={() => removeLineItem(i)}
                  disabled={lineItems.length === 1}
                  className="transition-colors disabled:opacity-30"
                  style={{ color: MUTED }}
                >
                  <Trash2 className="h-4 w-4 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addLineItem}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: GREEN }}
        >
          <Plus className="h-4 w-4" />
          Add Line Item
        </button>

        {/* Totals */}
        <div
          className="mt-6 border-t pt-4"
          style={{ borderColor: CARD_BORDER }}
        >
          <div className="ml-auto max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: MUTED }}>Subtotal</span>
              <span className="font-mono font-medium" style={{ color: NAVY }}>
                $
                {subtotal.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span style={{ color: MUTED }}>Tax</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0"
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-16 rounded-lg border px-2 py-1 text-right text-xs outline-none"
                  style={{ borderColor: CARD_BORDER, color: NAVY }}
                />
                <span className="text-xs" style={{ color: MUTED }}>
                  %
                </span>
                <span
                  className="ml-2 font-mono font-medium"
                  style={{ color: NAVY }}
                >
                  $
                  {tax.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div
              className="flex justify-between border-t pt-2 text-lg font-bold"
              style={{ borderColor: CARD_BORDER }}
            >
              <span style={{ color: NAVY }}>Total</span>
              <span className="font-mono" style={{ color: GREEN }}>
                $
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-normal" style={{ color: MUTED }}>
                  USDC
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice details */}
      <div
        className="rounded-2xl border p-6"
        style={{ borderColor: CARD_BORDER, background: "white" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" style={{ color: GREEN }} />
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: MUTED }}
          >
            Details
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: SLATE }}
            >
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Auto-generated"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
              style={{ borderColor: CARD_BORDER, color: NAVY }}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: SLATE }}
            >
              Payment Terms
            </label>
            <select
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{
                borderColor: CARD_BORDER,
                color: NAVY,
                background: "white",
              }}
            >
              {TERMS_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {terms === "Custom" && (
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: SLATE }}
              >
                Due Date
              </label>
              <input
                type="date"
                value={customDueDate}
                onChange={(e) => setCustomDueDate(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
                style={{ borderColor: CARD_BORDER, color: NAVY }}
              />
            </div>
          )}
          <div className={terms === "Custom" ? "" : "sm:col-span-2"}>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: SLATE }}
            >
              Memo / Notes
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Additional notes for the buyer..."
              rows={2}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#1B6B4A]"
              style={{ borderColor: CARD_BORDER, color: NAVY }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
        <Link
          href="/dashboard/invoices"
          className="text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: MUTED }}
        >
          Cancel
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[#F3F2ED] disabled:opacity-50"
            style={{ borderColor: CARD_BORDER, color: NAVY }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: GREEN }}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
