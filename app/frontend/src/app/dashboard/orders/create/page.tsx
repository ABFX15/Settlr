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
  Package,
  DollarSign,
  Calendar,
  User,
  AlertCircle,
  Check,
  FileText,
} from "lucide-react";

interface LineItem {
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

const TERMS_OPTIONS = [
  "Due on Receipt",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 60",
  "Net 90",
];

export default function CreateOrderPage() {
  const router = useRouter();
  const { publicKey } = useActiveWallet();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    orderNumber: string;
    id: string;
  } | null>(null);

  // Buyer
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerCompany, setBuyerCompany] = useState("");

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", sku: "", quantity: 1, unitPrice: 0 },
  ]);

  // Details
  const [terms, setTerms] = useState("Net 30");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState("");

  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.quantity * li.unitPrice,
    0,
  );
  const tax = taxRate ? subtotal * (parseFloat(taxRate) / 100) : 0;
  const total = subtotal + tax;

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", sku: "", quantity: 1, unitPrice: 0 },
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
      prev.map((li, i) => (i !== index ? li : { ...li, [field]: value })),
    );
  };

  const handleSubmit = async (submitOrder: boolean) => {
    setError(null);
    if (!publicKey) {
      setError("Connect your wallet first.");
      return;
    }
    if (!buyerName.trim()) {
      setError("Buyer name is required");
      return;
    }
    if (!buyerEmail.trim() || !buyerEmail.includes("@")) {
      setError("Valid email is required");
      return;
    }
    if (lineItems.some((li) => !li.description.trim())) {
      setError("All items need a description");
      return;
    }
    if (lineItems.some((li) => li.unitPrice <= 0)) {
      setError("All items need a price > $0");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-wallet": publicKey,
        },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerCompany: buyerCompany.trim() || undefined,
          lineItems: lineItems.map((li) => ({
            description: li.description,
            sku: li.sku || undefined,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          })),
          taxRate: taxRate || undefined,
          notes: notes.trim() || undefined,
          terms,
          expectedDate: expectedDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create order");
      }

      const data = await res.json();
      setSuccess({ orderNumber: data.orderNumber, id: data.id });

      // If submitting, update status
      if (submitOrder) {
        await fetch(`/api/orders/${data.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-merchant-wallet": publicKey,
          },
          body: JSON.stringify({
            action: "update_status",
            status: "submitted",
          }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34c759]/10">
          <Check className="h-8 w-8 text-[#34c759]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Order Created</h1>
          <p className="mt-2 text-sm text-[#8a8a8a]">
            <span className="font-mono font-medium text-[#212121]">
              {success.orderNumber}
            </span>{" "}
            for{" "}
            <span className="font-mono font-semibold text-[#34c759]">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
              USDC
            </span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard/orders"
            className="rounded-lg border border-[#d3d3d3] px-5 py-2.5 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors"
          >
            View All Orders
          </Link>
          <Link
            href={`/dashboard/orders/${success.id}`}
            className="rounded-lg bg-[#34c759] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors"
          >
            View Order → Convert to Invoice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-sm text-[#5c5c5c] hover:text-[#212121] transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <span className="block text-[11px] text-[#34c759] uppercase tracking-[0.15em] font-semibold">
            New Purchase Order
          </span>
          <h1 className="text-3xl font-bold text-[#212121] tracking-tight mt-1">
            Create Order
          </h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-[#e74c3c]/10 border border-[#e74c3c]/20 p-4 text-sm text-[#e74c3c]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-4 w-4 text-[#34c759]" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
                Buyer Information
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Buyer Name / Business
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Green Valley Dispensary"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Email
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="buyer@example.com"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#5c5c5c]">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  value={buyerCompany}
                  onChange={(e) => setBuyerCompany(e.target.value)}
                  placeholder="Company name"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#34c759]" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
                  Order Items
                </h2>
              </div>
              <button
                onClick={addLineItem}
                className="text-[11px] font-semibold text-[#34c759] hover:text-[#2ba048] transition-colors flex items-center gap-1"
              >
                + Add Item
              </button>
            </div>

            <div className="hidden grid-cols-12 gap-3 text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a] mb-3 sm:grid">
              <div className="col-span-4">Description</div>
              <div className="col-span-2">SKU</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2" />
            </div>

            <div className="space-y-3">
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      value={li.description}
                      onChange={(e) =>
                        updateLineItem(i, "description", e.target.value)
                      }
                      placeholder="Product name"
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="text"
                      value={li.sku}
                      onChange={(e) => updateLineItem(i, "sku", e.target.value)}
                      placeholder="SKU"
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      value={li.quantity || ""}
                      onChange={(e) =>
                        updateLineItem(
                          i,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min={1}
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2.5 text-center text-sm text-[#212121] outline-none focus:border-[#34c759]/50"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
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
                      className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-3 py-2.5 text-center text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      onClick={() => removeLineItem(i)}
                      disabled={lineItems.length === 1}
                      className="rounded-lg p-2 text-[#8a8a8a] hover:text-[#e74c3c] hover:bg-[#e74c3c]/80/10 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Notes */}
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6">
            <div className="mb-5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#34c759]" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8a8a8a]">
                Terms & Details
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Payment Terms
                </label>
                <select
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] outline-none appearance-none cursor-pointer focus:border-[#34c759]/50"
                >
                  {TERMS_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Expected Delivery
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] outline-none focus:border-[#34c759]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  min={0}
                  max={50}
                  step={0.1}
                  placeholder="0"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes or PO reference"
                  className="w-full rounded-lg border border-[#d3d3d3] bg-[#f2f2f2] px-4 py-2.5 text-sm text-[#212121] placeholder-[#8a8a8a] outline-none focus:border-[#34c759]/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-xl bg-[#ffffff] border border-[#d3d3d3] p-6 sticky top-20">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5c5c5c] mb-5">
              Order Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8a8a8a]">Subtotal</span>
                <span className="text-[#212121] font-mono">
                  $
                  {subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8a8a8a]">Tax ({taxRate || "0"}%)</span>
                <span className="text-[#212121] font-mono">
                  ${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-[#d3d3d3] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#5c5c5c] uppercase tracking-wider">
                    Total
                  </span>
                </div>
                <div className="text-right mt-1">
                  <span className="text-3xl font-bold text-[#34c759]">
                    $
                    {total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <div className="text-[11px] text-[#5c5c5c] mt-0.5">USDC</div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#34c759] px-5 py-3 text-sm font-bold text-black hover:bg-[#2ba048] transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Create & Submit
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#d3d3d3] px-5 py-3 text-sm font-medium text-[#212121] hover:bg-[#f2f2f2] transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-[#f2f2f2] border border-[#d3d3d3] p-3">
              <p className="text-[11px] text-[#8a8a8a] italic leading-relaxed">
                After creating, you can convert this order to an invoice with
                one click. The buyer will receive a payment link automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
