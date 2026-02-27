"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  Search,
  Book,
  Code2,
  Webhook,
  HelpCircle,
  Rocket,
  ExternalLink,
  Vault,
  Plug,
  Leaf,
} from "lucide-react";

const docsTabs = [
  { id: "quickstart", label: "Getting Started", icon: Rocket },
  { id: "leaflink", label: "LeafLink", icon: Leaf },
  { id: "invoices", label: "Invoices & Payments", icon: Book },
  { id: "dashboard", label: "Dashboard", icon: Vault },
  { id: "api", label: "REST API", icon: Code2 },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "sdk", label: "SDK", icon: Code2 },
  { id: "troubleshooting", label: "Troubleshooting", icon: HelpCircle },
];

type TabId =
  | "quickstart"
  | "leaflink"
  | "invoices"
  | "dashboard"
  | "api"
  | "webhooks"
  | "integrations"
  | "sdk"
  | "troubleshooting";

export default function DocsPage() {
  const searchParams = useSearchParams();
  const initialTab: TabId = (searchParams.get("tab") as TabId) || "quickstart";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && docsTabs.some((t) => t.id === tab)) {
      setActiveTab(tab as TabId);
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FDFBF7] text-[#0C1829] pt-16">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 border-r border-[#E2DFD5] bg-[#0d0d14] overflow-y-auto">
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7C8A9E]" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#E2DFD5] bg-[#F3F2ED] py-2 pl-10 pr-4 text-sm text-[#0C1829] placeholder:text-[#7C8A9E] focus:border-[#3B82F6]/50 focus:outline-none"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {docsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#1B6B4A]/10 text-[#1B6B4A]"
                          : "text-[#3B4963] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* External Links */}
              <div className="mt-8 border-t border-[#E2DFD5] pt-6">
                <p className="mb-3 text-xs font-semibold uppercase text-[#7C8A9E]">
                  Resources
                </p>
                <div className="space-y-1">
                  <a
                    href="https://github.com/ABFX15/x402-hack-payment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3B4963] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                  >
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://www.npmjs.com/package/@settlr/sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#3B4963] hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                  >
                    npm (SDK)
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64">
            <div className="max-w-4xl mx-auto px-6 py-12">
              {/* Hero */}
              <div className="mb-10">
                <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                <p className="text-xl text-[#3B4963]">
                  Stablecoin settlement infrastructure for cannabis B2B.
                  Connects to your POS, automates invoicing, settles in USDC.
                </p>
              </div>

              {/* Mobile Navigation Tabs */}
              <div className="flex gap-1 mb-8 border-b border-[#E2DFD5] overflow-x-auto lg:hidden">
                {docsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "text-[#1B6B4A] border-b-2 border-[#1B6B4A]"
                        : "text-[#7C8A9E] hover:text-[#0C1829]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none">
                {activeTab === "quickstart" && <QuickStartContent />}
                {activeTab === "leaflink" && <LeafLinkContent />}
                {activeTab === "invoices" && <InvoicesContent />}
                {activeTab === "dashboard" && <DashboardContent />}
                {activeTab === "api" && <APIContent />}
                {activeTab === "webhooks" && <WebhooksContent />}
                {activeTab === "integrations" && <IntegrationsContent />}
                {activeTab === "sdk" && <SDKContent />}
                {activeTab === "troubleshooting" && <TroubleshootingContent />}
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:ml-64">
        <Footer />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   GETTING STARTED
   ═══════════════════════════════════════════════════════════ */

function QuickStartContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Get Started in 5 Minutes</h2>
        <p className="text-[#7C8A9E] mb-6">
          Settlr automates B2B cannabis payments. Connect your POS system and
          invoices settle in USDC on Solana — no bank wires, no 30-day net
          terms, no chargebacks.
        </p>

        {/* Two paths */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="rounded-xl border border-[#1B6B4A]/20 bg-[#1B6B4A]/[0.05] p-5">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-0.5 rounded-full mb-3">
              Flagship
            </span>
            <h3 className="text-lg font-semibold text-[#0C1829] mb-2">
              LeafLink Integration
            </h3>
            <p className="text-sm text-[#7C8A9E] mb-3">
              Connect your LeafLink account. When a purchase order is created,
              Settlr auto-generates a USDC invoice and emails a payment link to
              the buyer.
            </p>
            <span className="text-sm text-[#1B6B4A] font-medium">
              See LeafLink tab →
            </span>
          </div>
          <div className="rounded-xl border border-[#E2DFD5] bg-[#F3F2ED]/50 p-5">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-[#7C8A9E]/10 text-[#7C8A9E] px-2 py-0.5 rounded-full mb-3">
              Manual
            </span>
            <h3 className="text-lg font-semibold text-[#0C1829] mb-2">
              Direct Invoices
            </h3>
            <p className="text-sm text-[#7C8A9E] mb-3">
              Create payment links directly from the dashboard or via API. No
              POS integration required — works for any cannabis B2B transaction.
            </p>
            <span className="text-sm text-[#1B6B4A] font-medium">
              See Invoices tab →
            </span>
          </div>
        </div>

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#1B6B4A]/15 text-[#1B6B4A] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">Create Your Account</h3>
          </div>
          <p className="text-[#7C8A9E] mb-4">
            Sign up and complete merchant onboarding. You&apos;ll get an API key
            and access to the operator dashboard.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B6B4A] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Account →
          </a>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#1B6B4A]/15 text-[#1B6B4A] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">Connect LeafLink</h3>
          </div>
          <p className="text-[#7C8A9E] mb-4">
            Paste your LeafLink API key in the Settlr dashboard. We validate it
            immediately by calling LeafLink&apos;s company endpoint.
          </p>
          <CodeBlock language="bash">{`# Your LeafLink API key lives at:
# LeafLink → Settings → Integrations → API
# Auth format: "Authorization: App {your_key}"`}</CodeBlock>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#1B6B4A]/15 text-[#1B6B4A] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">Orders Auto-Settle</h3>
          </div>
          <p className="text-[#7C8A9E] mb-4">
            When a purchase order hits LeafLink, Settlr receives a webhook,
            creates a USDC invoice, and emails the buyer a one-click payment
            link. Settlement is instant.
          </p>
          <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 font-mono text-sm text-[#3B4963]">
            <div className="space-y-1">
              <p>LeafLink PO #4821 created → webhook fires</p>
              <p>&nbsp;&nbsp;→ Settlr invoice INV-4821 auto-created</p>
              <p>&nbsp;&nbsp;→ Payment link emailed to buyer</p>
              <p>&nbsp;&nbsp;→ Buyer pays in USDC (one click)</p>
              <p>&nbsp;&nbsp;→ Funds settle to your wallet instantly</p>
              <p>&nbsp;&nbsp;→ LeafLink order marked &quot;paid&quot;</p>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon="⚡"
            title="Instant Settlement"
            description="USDC settles in under 1 second on Solana. No 30-day net terms."
          />
          <FeatureCard
            icon="🔒"
            title="Compliance Ready"
            description="METRC tag tracking, license verification, full audit trail."
          />
          <FeatureCard
            icon="🌿"
            title="LeafLink Native"
            description="Auto-syncs with your existing purchase order workflow."
          />
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEAFLINK INTEGRATION
   ═══════════════════════════════════════════════════════════ */

function LeafLinkContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">LeafLink Integration</h2>
        <p className="text-[#7C8A9E] mb-6">
          Connect your LeafLink account to automate B2B cannabis settlement.
          When purchase orders are created in LeafLink, Settlr automatically
          generates USDC invoices and emails payment links to buyers.
        </p>

        {/* How it works */}
        <div className="bg-[#1B6B4A]/10 border border-[#1B6B4A]/30 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-[#1B6B4A] mb-2">
            How it works
          </h3>
          <ol className="text-[#7C8A9E] text-sm space-y-2">
            <li>1. Purchase order created in LeafLink (by buyer or seller)</li>
            <li>2. LeafLink sends a webhook to Settlr</li>
            <li>3. Settlr creates a USDC invoice + payment link</li>
            <li>4. Buyer receives email with one-click payment link</li>
            <li>5. Buyer pays in USDC — settles instantly on Solana</li>
            <li>
              6. Settlr updates the LeafLink order status to &quot;paid&quot;
            </li>
          </ol>
        </div>

        {/* Step 1: Get API Key */}
        <h3 className="text-xl font-semibold mb-4">
          1. Get Your LeafLink API Key
        </h3>
        <p className="text-[#7C8A9E] mb-4">
          In LeafLink, go to{" "}
          <strong className="text-[#3B4963]">
            Settings → Integrations → API
          </strong>{" "}
          and generate an API key. This is a real LeafLink feature — the key
          gives Settlr read access to your orders and the ability to update
          payment status.
        </p>
        <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 mb-6">
          <p className="text-sm text-[#7C8A9E]">
            <strong className="text-[#3B4963]">Auth format:</strong>{" "}
            <code className="text-[#1B6B4A] bg-white px-2 py-0.5 rounded">
              Authorization: App &#123;your_api_key&#125;
            </code>
          </p>
          <p className="text-sm text-[#7C8A9E] mt-2">
            <strong className="text-[#3B4963]">Permissions needed:</strong> Read
            orders, update order status
          </p>
        </div>

        {/* Step 2: Configure */}
        <h3 className="text-xl font-semibold mb-4">2. Configure in Settlr</h3>
        <p className="text-[#7C8A9E] mb-4">
          Save your LeafLink credentials via the dashboard or API. Settlr
          validates the key immediately by calling{" "}
          <code className="text-[#1B6B4A] bg-[#1B6B4A]/10 px-1 rounded">
            GET /api/v2/companies/
          </code>{" "}
          on LeafLink.
        </p>
        <CodeBlock language="typescript">
          {`// POST /api/integrations/leaflink/config
const response = await fetch('/api/integrations/leaflink/config', {
  method: 'POST',
  headers: {
    'X-API-Key': 'sk_live_your_settlr_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    leaflink_api_key: 'your_leaflink_api_key',
    leaflink_company_id: 12345,
    auto_create_invoice: true,   // Auto-create invoice on new PO
    auto_send_link: true,        // Auto-email payment link to buyer
    metrc_sync: true,            // Include METRC tags in metadata
  }),
});`}
        </CodeBlock>

        {/* Step 3: Webhook */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          3. Set Your Webhook URL
        </h3>
        <p className="text-[#7C8A9E] mb-4">
          In LeafLink, configure a webhook pointing to your Settlr instance.
          LeafLink signs webhooks with HMAC-SHA256 — Settlr verifies every
          payload.
        </p>
        <CodeBlock language="bash">
          {`# Webhook URL to configure in LeafLink:
# https://your-domain.com/api/integrations/leaflink/webhook
#
# LeafLink signs with HMAC-SHA256
# Store the signing secret when configuring`}
        </CodeBlock>

        {/* Webhook events */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Webhook Events</h3>
        <p className="text-[#7C8A9E] mb-4">
          Settlr listens for these LeafLink webhook events:
        </p>
        <div className="bg-[#F3F2ED] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Settlr Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD5]">
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  order.created
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Creates invoice + emails payment link to buyer
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  order.accepted
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Creates invoice if not already created
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  order.cancelled
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Marks sync record as cancelled
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* METRC */}
        <h3 className="text-xl font-semibold mb-4 mt-8">METRC Compliance</h3>
        <p className="text-[#7C8A9E] mb-4">
          When{" "}
          <code className="text-[#1B6B4A] bg-[#1B6B4A]/10 px-1 rounded">
            metrc_sync
          </code>{" "}
          is enabled, Settlr extracts METRC package tags, license numbers, and
          manifest data from LeafLink line items and attaches them to the
          invoice metadata. Full audit trail included with every settlement.
        </p>
        <CodeBlock language="json">
          {`{
  "invoice_id": "INV-4821",
  "metadata": {
    "leaflink_order_id": 4821,
    "metrc_tags": "1A4000000000000000012345,1A4000000000000000012346",
    "seller_license": "C11-0000001-LIC",
    "buyer_license": "C10-0000002-LIC"
  }
}`}
        </CodeBlock>

        {/* Config options */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Configuration Options
        </h3>
        <div className="bg-[#F3F2ED] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Option</th>
                <th className="px-4 py-3 font-medium">Default</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD5]">
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  auto_create_invoice
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">true</td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Auto-create Settlr invoice when PO arrives
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  auto_send_link
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">true</td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Auto-email payment link to buyer
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  metrc_sync
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">true</td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Include METRC tags &amp; licenses in metadata
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  webhook_secret
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">—</td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  HMAC secret for verifying LeafLink webhooks
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Retry */}
        <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#0C1829] mb-2">
            Failed Webhook Retry
          </h4>
          <p className="text-[#7C8A9E] text-sm">
            If a webhook fails to process, you can retry it via{" "}
            <code className="text-[#1B6B4A]">
              POST /api/integrations/leaflink/retry
            </code>
            . The retry endpoint re-fetches the order from LeafLink and re-runs
            the invoice creation flow.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INVOICES & PAYMENTS
   ═══════════════════════════════════════════════════════════ */

function InvoicesContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Invoices &amp; Payments</h2>
        <p className="text-[#7C8A9E] mb-6">
          Create USDC invoices for any cannabis B2B transaction. Works
          standalone or alongside the LeafLink integration for orders that
          don&apos;t originate from a POS.
        </p>

        {/* How it works */}
        <div className="bg-[#1B6B4A]/10 border border-[#1B6B4A]/30 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-[#1B6B4A] mb-2">
            Settlement Flow
          </h3>
          <ol className="text-[#7C8A9E] text-sm space-y-2">
            <li>1. You create an invoice (dashboard or API)</li>
            <li>2. Buyer gets an email with a payment link</li>
            <li>3. They click, connect a wallet, and pay in USDC</li>
            <li>4. Funds settle to your wallet instantly on Solana</li>
            <li>5. Both parties get a receipt with on-chain proof</li>
          </ol>
        </div>

        {/* Create Invoice */}
        <h3 className="text-xl font-semibold mb-4">Create an Invoice</h3>
        <CodeBlock language="typescript">
          {`// POST /api/payments
const invoice = await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'X-API-Key': 'sk_live_your_api_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 12500.00,
    currency: 'USDC',
    memo: 'PO #4821 — 500 units Purple Haze',
    metadata: {
      buyer_license: 'C10-0000002-LIC',
      seller_license: 'C11-0000001-LIC',
      metrc_tags: '1A4000000000000000012345',
    },
  }),
});

// Response:
// {
//   "id": "pay_abc123",
//   "status": "pending",
//   "amount": 12500.00,
//   "paymentUrl": "https://settlr.dev/pay/pay_abc123",
//   "expiresAt": "2025-07-15T12:00:00Z"
// }`}
        </CodeBlock>

        {/* Payment Links */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Payment Links</h3>
        <p className="text-[#7C8A9E] mb-4">
          Every invoice generates a unique payment link. Share it via email,
          text, or any channel — the buyer clicks, connects a wallet, and pays.
          No app download required.
        </p>
        <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 mb-6">
          <p className="text-sm text-[#7C8A9E]">
            <strong className="text-[#3B4963]">Payment URL format:</strong>{" "}
            <code className="text-[#1B6B4A]">
              https://settlr.dev/pay/&#123;payment_id&#125;
            </code>
          </p>
          <p className="text-sm text-[#7C8A9E] mt-2">
            Links expire after 7 days by default. The buyer sees the amount,
            memo, and a one-click USDC payment button.
          </p>
        </div>

        {/* Check Status */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Check Payment Status
        </h3>
        <CodeBlock language="typescript">
          {`// GET /api/payments/:id
const payment = await fetch('/api/payments/pay_abc123', {
  headers: { 'X-API-Key': 'sk_live_your_api_key' },
});

// Statuses: "pending" → "completed" → "expired"
// {
//   "id": "pay_abc123",
//   "status": "completed",
//   "amount": 12500.00,
//   "signature": "5xKj...abc",
//   "paidAt": "2025-07-10T14:30:00Z"
// }`}
        </CodeBlock>

        {/* Gasless */}
        <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#0C1829] mb-2">
            Gasless Transactions
          </h4>
          <p className="text-[#7C8A9E] text-sm">
            All Settlr payments are gasless by default. Buyers don&apos;t need
            SOL for transaction fees — the fee payer is handled by Settlr&apos;s
            infrastructure (powered by Kora).
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */

function DashboardContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Operator Dashboard</h2>
        <p className="text-[#7C8A9E] mb-6">
          Monitor your settlement volume, manage integrations, and claim
          platform fees from the admin dashboard.
        </p>

        {/* Overview */}
        <h3 className="text-xl font-semibold mb-4">Dashboard Features</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4">
            <h4 className="font-medium text-[#0C1829] mb-2">
              Settlement Volume
            </h4>
            <p className="text-sm text-[#7C8A9E]">
              Real-time view of total USDC settled, active invoices, and payment
              history across all channels.
            </p>
          </div>
          <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4">
            <h4 className="font-medium text-[#0C1829] mb-2">LeafLink Status</h4>
            <p className="text-sm text-[#7C8A9E]">
              Connection health, last webhook received, sync records, and failed
              webhook retry queue.
            </p>
          </div>
          <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4">
            <h4 className="font-medium text-[#0C1829] mb-2">Treasury</h4>
            <p className="text-sm text-[#7C8A9E]">
              On-chain treasury balance, accumulated platform fees, and
              one-click claim to your wallet.
            </p>
          </div>
          <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4">
            <h4 className="font-medium text-[#0C1829] mb-2">Compliance Logs</h4>
            <p className="text-sm text-[#7C8A9E]">
              METRC tags, license numbers, and on-chain signatures for every
              transaction. Export-ready audit trail.
            </p>
          </div>
        </div>

        {/* Treasury */}
        <h3 className="text-xl font-semibold mb-4">Treasury &amp; Fees</h3>
        <p className="text-[#7C8A9E] mb-4">
          Every payment processed through Settlr collects a configurable
          platform fee (default 2%) into a program-owned treasury PDA on Solana.
          Authorized signers can claim accumulated fees at any time.
        </p>
        <div className="bg-[#F3F2ED] rounded-lg p-6 border border-[#E2DFD5] mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-[#7C8A9E] mb-1">Fee Collection</p>
              <p className="text-lg font-semibold text-[#0C1829]">Automatic</p>
              <p className="text-xs text-[#7C8A9E]">On every payment</p>
            </div>
            <div>
              <p className="text-sm text-[#7C8A9E] mb-1">Claim Method</p>
              <p className="text-lg font-semibold text-[#0C1829]">
                Multisig / Wallet
              </p>
              <p className="text-xs text-[#7C8A9E]">Authority-gated</p>
            </div>
            <div>
              <p className="text-sm text-[#7C8A9E] mb-1">Settlement</p>
              <p className="text-lg font-semibold text-[#0C1829]">USDC</p>
              <p className="text-xs text-[#7C8A9E]">Direct to your wallet</p>
            </div>
          </div>
        </div>

        {/* Treasury API */}
        <h3 className="text-xl font-semibold mb-4">Treasury API</h3>
        <CodeBlock language="typescript">
          {`// GET /api/admin/treasury — Check balance
const treasury = await fetch('/api/admin/treasury', {
  headers: { 'X-API-Key': 'sk_live_your_api_key' },
});

// {
//   "balance": 1250.50,
//   "totalVolume": 62525.00,
//   "totalFees": 1250.50,
//   "feeBps": 200,
//   "isActive": true
// }`}
        </CodeBlock>

        <CodeBlock language="typescript">
          {`// POST /api/admin/claim — Claim platform fees
const claim = await fetch('/api/admin/claim', {
  method: 'POST',
  headers: {
    'X-API-Key': 'sk_live_your_api_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    authority: 'YOUR_AUTHORITY_PUBKEY',
  }),
});

// Returns an unsigned transaction — sign with your wallet`}
        </CodeBlock>

        {/* Dashboard link */}
        <div className="bg-[#1B6B4A]/10 border border-[#1B6B4A]/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#1B6B4A] mb-2">
            Access the Dashboard
          </h4>
          <p className="text-[#7C8A9E] text-sm">
            Visit{" "}
            <a href="/admin" className="text-[#1B6B4A] hover:underline">
              /admin
            </a>{" "}
            to see the live dashboard with real-time on-chain data, claim
            button, and integration status.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REST API
   ═══════════════════════════════════════════════════════════ */

function APIContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">REST API Reference</h2>
        <p className="text-[#7C8A9E] mb-6">
          Server-side API for payments, LeafLink configuration, and treasury
          management.
        </p>

        {/* Base URL */}
        <div className="bg-[#F3F2ED] rounded-lg p-4 mb-6">
          <p className="text-[#7C8A9E] text-sm mb-1">Base URL</p>
          <code className="text-[#1B6B4A]">https://settlr.dev/api</code>
        </div>

        {/* Authentication */}
        <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-[#0C1829] mb-2">
            Authentication
          </h3>
          <p className="text-[#7C8A9E] text-sm mb-3">
            All API requests require your API key from{" "}
            <a href="/onboarding" className="text-[#1B6B4A] hover:underline">
              merchant onboarding
            </a>
            .
          </p>
          <CodeBlock language="bash">
            {`curl https://settlr.dev/api/payments \
  -H "X-API-Key: sk_live_your_api_key" \
  -H "Content-Type: application/json"`}
          </CodeBlock>
        </div>

        {/* LeafLink Endpoints */}
        <h3 className="text-lg font-semibold text-[#3B4963] mb-4">
          LeafLink Integration
        </h3>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#0C1829]">
              /integrations/leaflink/config
            </code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E]">
              Get your current LeafLink integration configuration.
            </p>
          </div>
        </div>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#0C1829]">
              /integrations/leaflink/config
            </code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E] mb-4">
              Create or update your LeafLink integration. Validates the API key
              against LeafLink before saving.
            </p>
            <h4 className="font-medium mb-2">Request Body</h4>
            <CodeBlock language="json">
              {`{
  "leaflink_api_key": "your_leaflink_api_key",
  "leaflink_company_id": 12345,
  "auto_create_invoice": true,
  "auto_send_link": true,
  "metrc_sync": true,
  "webhook_secret": "your_hmac_secret"
}`}
            </CodeBlock>
          </div>
        </div>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#0C1829]">
              /integrations/leaflink/webhook
            </code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E]">
              Receives webhooks from LeafLink. Configure this URL in your
              LeafLink webhook settings. Verifies HMAC-SHA256 signatures.
            </p>
          </div>
        </div>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#0C1829]">/integrations/leaflink/retry</code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E]">
              Retry a failed webhook. Re-fetches the order from LeafLink and
              re-runs invoice creation.
            </p>
          </div>
        </div>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#0C1829]">/integrations/leaflink/syncs</code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E]">
              List all sync records — tracks each LeafLink order through the
              invoice lifecycle.
            </p>
          </div>
        </div>

        {/* Payment Endpoints */}
        <h3 className="text-lg font-semibold text-[#3B4963] mt-10 mb-4">
          Payments &amp; Invoices
        </h3>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#0C1829]">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E] mb-4">
              Create a USDC invoice with a payment link.
            </p>
            <h4 className="font-medium mb-2">Request Body</h4>
            <CodeBlock language="json">
              {`{
  "amount": 12500.00,
  "currency": "USDC",
  "memo": "PO #4821 — 500 units",
  "metadata": {
    "buyer_license": "C10-0000002-LIC",
    "metrc_tags": "1A4000000000000000012345"
  }
}`}
            </CodeBlock>
            <h4 className="font-medium mb-2 mt-4">Response</h4>
            <CodeBlock language="json">
              {`{
  "id": "pay_abc123",
  "status": "pending",
  "amount": 12500.00,
  "currency": "USDC",
  "paymentUrl": "https://settlr.dev/pay/pay_abc123",
  "expiresAt": "2025-07-15T12:00:00Z"
}`}
            </CodeBlock>
          </div>
        </div>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#0C1829]">/payments/:id</code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E]">Retrieve a payment by ID.</p>
          </div>
        </div>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#0C1829]">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E] mb-2">
              List all payments with optional filters.
            </p>
            <div className="bg-[#F3F2ED] rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <tbody className="divide-y divide-[#E2DFD5]">
                  <tr>
                    <td className="px-4 py-2 font-mono text-[#1B6B4A]">
                      status
                    </td>
                    <td className="px-4 py-2 text-[#7C8A9E]">
                      pending | completed | expired
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-[#1B6B4A]">
                      limit
                    </td>
                    <td className="px-4 py-2 text-[#7C8A9E]">
                      Number of results (default: 20, max: 100)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-[#1B6B4A]">
                      cursor
                    </td>
                    <td className="px-4 py-2 text-[#7C8A9E]">
                      Pagination cursor
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Treasury Endpoints */}
        <h3 className="text-lg font-semibold text-[#3B4963] mt-10 mb-4">
          Treasury
        </h3>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden mb-6">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-[#0C1829]">/admin/treasury</code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E] text-sm">
              Returns treasury balance, platform config (fee BPS, authority,
              total volume/fees), and PDA addresses.
            </p>
          </div>
        </div>

        <div className="border border-[#E2DFD5] rounded-lg overflow-hidden">
          <div className="bg-[#F3F2ED] px-4 py-3 flex items-center gap-3">
            <span className="bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-[#0C1829]">/admin/claim</code>
          </div>
          <div className="p-4">
            <p className="text-[#7C8A9E] text-sm">
              Builds an unsigned{" "}
              <code className="text-[#1B6B4A]">claim_platform_fees</code>{" "}
              transaction. Send{" "}
              <code className="text-[#1B6B4A]">{`{ "authority": "PUBKEY" }`}</code>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WEBHOOKS
   ═══════════════════════════════════════════════════════════ */

function WebhooksContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Webhooks</h2>
        <p className="text-[#7C8A9E] mb-6">
          Get notified in real-time when payments settle, invoices are paid, or
          LeafLink orders change state.
        </p>

        {/* Setup */}
        <h3 className="text-xl font-semibold mb-4">Setting Up Webhooks</h3>
        <p className="text-[#7C8A9E] mb-4">
          Configure your webhook endpoint in the Settlr dashboard. We&apos;ll
          send a POST request whenever a payment event occurs.
        </p>

        {/* Payload */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Webhook Payload</h3>
        <CodeBlock language="json">
          {`{
  "event": "payment.completed",
  "data": {
    "id": "pay_abc123",
    "status": "completed",
    "amount": 12500.00,
    "currency": "USDC",
    "signature": "5xKj...abc",
    "paidAt": "2025-07-10T14:30:00Z",
    "metadata": {
      "leaflink_order_id": 4821,
      "buyer_license": "C10-0000002-LIC"
    }
  },
  "timestamp": "2025-07-10T14:30:01Z"
}`}
        </CodeBlock>

        {/* Handler Example */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Example Handler (Next.js)
        </h3>
        <CodeBlock language="typescript">
          {`// app/api/webhooks/settlr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-settlr-signature');

  // Verify the webhook signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.SETTLR_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case 'payment.completed':
      await markInvoicePaid(event.data.id, event.data.signature);
      break;
    case 'payment.expired':
      await handleExpiredInvoice(event.data.id);
      break;
    case 'leaflink.order.synced':
      await logLeafLinkSync(event.data.leaflink_order_id);
      break;
    default:
      console.log('Unhandled event:', event.event);
  }

  return NextResponse.json({ received: true });
}`}
        </CodeBlock>

        {/* Events */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Event Types</h3>
        <div className="bg-[#F3F2ED] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD5]">
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  payment.completed
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Invoice paid and confirmed on-chain
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  payment.expired
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Payment link expired before completion
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  payment.failed
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Payment failed due to an error
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  leaflink.order.synced
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  LeafLink order processed and invoice created
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  leaflink.order.paid
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  LeafLink order invoice settled in USDC
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  leaflink.sync.failed
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  LeafLink webhook processing failed (retryable)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-yellow-600 mb-2">⚠️ Security Note</h4>
          <p className="text-[#7C8A9E]">
            Always verify the webhook signature before processing events. Never
            trust the payload without verification. Both Settlr webhooks and
            LeafLink webhooks use HMAC-SHA256.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTEGRATIONS
   ═══════════════════════════════════════════════════════════ */

function IntegrationsContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">POS Integrations</h2>
        <p className="text-[#7C8A9E] mb-6">
          Settlr connects to the cannabis POS and ordering platforms your
          business already uses. LeafLink is live today — Dutchie and Flowhub
          are on the roadmap.
        </p>

        {/* Integration cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border-2 border-[#1B6B4A]/30 bg-[#1B6B4A]/[0.05] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌿</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#1B6B4A]/15 text-[#1B6B4A] px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <h3 className="font-semibold mb-1">LeafLink</h3>
            <p className="text-sm text-[#7C8A9E]">
              Wholesale B2B ordering. Auto-creates USDC invoices from purchase
              orders, syncs payment status back to LeafLink.
            </p>
          </div>
          <div className="rounded-lg border border-[#E2DFD5] bg-[#F3F2ED]/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛒</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#7C8A9E]/10 text-[#7C8A9E] px-2 py-0.5 rounded-full">
                Planned
              </span>
            </div>
            <h3 className="font-semibold mb-1">Dutchie</h3>
            <p className="text-sm text-[#7C8A9E]">
              Dispensary POS with METRC integration. Planned for Q3 2026.
            </p>
          </div>
          <div className="rounded-lg border border-[#E2DFD5] bg-[#F3F2ED]/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#7C8A9E]/10 text-[#7C8A9E] px-2 py-0.5 rounded-full">
                Planned
              </span>
            </div>
            <h3 className="font-semibold mb-1">Flowhub</h3>
            <p className="text-sm text-[#7C8A9E]">
              Dispensary compliance platform. Planned for Q4 2026.
            </p>
          </div>
        </div>

        {/* LeafLink Detail */}
        <h3 className="text-xl font-semibold mb-4">
          LeafLink Integration Detail
        </h3>
        <p className="text-[#7C8A9E] mb-4">
          The LeafLink integration is fully production-ready. See the LeafLink
          tab for complete setup instructions, webhook events, METRC compliance,
          and configuration options.
        </p>

        <h4 className="font-medium mb-2">API Routes</h4>
        <div className="bg-[#F3F2ED] rounded-lg overflow-hidden mb-6">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD5]">
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A] text-sm">
                  /api/integrations/leaflink/config
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  GET/POST — manage integration config
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A] text-sm">
                  /api/integrations/leaflink/webhook
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  POST — receives LeafLink webhooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A] text-sm">
                  /api/integrations/leaflink/syncs
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  GET — list order sync records
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A] text-sm">
                  /api/integrations/leaflink/retry
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  POST — retry failed webhooks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A] text-sm">
                  /api/integrations/leaflink/callback
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  POST — payment callback from buyer
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Coming Soon */}
        <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#0C1829] mb-2">
            Want a different POS integration?
          </h4>
          <p className="text-[#7C8A9E] text-sm">
            We&apos;re actively building out POS integrations for the cannabis
            industry. If you use a platform not listed here, let us know at{" "}
            <a
              href="mailto:support@settlr.dev"
              className="text-[#1B6B4A] hover:underline"
            >
              support@settlr.dev
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SDK (FOR DEVELOPERS)
   ═══════════════════════════════════════════════════════════ */

function SDKContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">SDK</h2>
        <p className="text-[#7C8A9E] mb-6">
          The{" "}
          <code className="text-[#1B6B4A] bg-[#1B6B4A]/10 px-1 rounded">
            @settlr/sdk
          </code>{" "}
          npm package provides React components and a TypeScript client for
          developers who want to build custom payment experiences on top of
          Settlr.
        </p>

        <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-4 mb-8">
          <p className="text-sm text-[#7C8A9E]">
            <strong className="text-[#3B4963]">Note:</strong> The SDK is
            optional. The LeafLink integration and direct invoices work entirely
            server-side — no SDK required. The SDK is for developers who want
            embeddable React components.
          </p>
        </div>

        {/* Install */}
        <h3 className="text-xl font-semibold mb-4">Install</h3>
        <CodeBlock language="bash">{`npm install @settlr/sdk`}</CodeBlock>

        {/* Quick Example */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Quick Example</h3>
        <CodeBlock language="tsx">
          {`import { PaymentModal, Settlr } from '@settlr/sdk';
import { useState } from 'react';

const settlr = new Settlr({
  apiKey: 'sk_live_your_api_key',
  merchant: { name: 'Green Valley Farms' },
});

function PayInvoice({ invoiceId, amount }: { invoiceId: string; amount: number }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button onClick={() => setShow(true)}>
        Pay Invoice — \${amount.toFixed(2)} USDC
      </button>
      {show && (
        <PaymentModal
          amount={amount}
          merchantName="Green Valley Farms"
          memo={\`Invoice \${invoiceId}\`}
          onSuccess={(result) => {
            console.log('Settled!', result.signature);
            setShow(false);
          }}
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
}`}
        </CodeBlock>

        {/* Exports */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          What&apos;s Included
        </h3>
        <div className="bg-[#F3F2ED] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Export</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD5]">
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">Settlr</td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Main client — payments, payouts, treasury
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  PaymentModal
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Embedded USDC payment modal
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  BuyButton
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  One-click payment button
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  CheckoutWidget
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Full checkout component with wallet connection
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  useSettlr
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  React hook for custom payment UI
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  PayoutClient
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Send payouts by email
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#1B6B4A]">
                  createWebhookHandler
                </td>
                <td className="px-4 py-3 text-[#7C8A9E]">
                  Typed webhook handler factory
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Link to full docs */}
        <div className="bg-[#1B6B4A]/10 border border-[#1B6B4A]/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#1B6B4A] mb-2">
            Full SDK Documentation
          </h4>
          <p className="text-[#7C8A9E] text-sm">
            See the{" "}
            <a
              href="https://www.npmjs.com/package/@settlr/sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B6B4A] hover:underline"
            >
              npm package README
            </a>{" "}
            for complete API reference, props tables, and advanced usage.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TROUBLESHOOTING
   ═══════════════════════════════════════════════════════════ */

function TroubleshootingContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
        <p className="text-[#7C8A9E] mb-6">
          Common issues and how to fix them.
        </p>

        <div className="space-y-4">
          <TroubleshootingItem
            question="LeafLink webhooks not arriving"
            answer={`Check these common issues:\n• Verify the webhook URL in LeafLink points to your domain (not localhost)\n• Ensure your endpoint is publicly accessible over HTTPS\n• Check that your HMAC webhook secret matches between LeafLink and Settlr config\n• Look at /api/integrations/leaflink/syncs for processed webhook records\n• Use /api/integrations/leaflink/retry to re-process a failed webhook`}
          />

          <TroubleshootingItem
            question="LeafLink API key validation failing"
            answer={`When you save your LeafLink config, Settlr validates the key by calling GET /api/v2/companies/ on LeafLink. Common issues:\n• Make sure you copied the full API key from LeafLink (Settings → Integrations → API)\n• The auth format is 'App {key}' — Settlr handles this automatically\n• Check that your LeafLink account has API access enabled\n• Verify the company ID matches your LeafLink account`}
          />

          <TroubleshootingItem
            question="Payment stuck on 'Processing'"
            answer={`This usually means the transaction is waiting for confirmation. Solana transactions typically confirm in 1-2 seconds. If stuck longer:\n• Check your internet connection\n• The RPC endpoint may be congested — try refreshing\n• If using devnet, the network may be slower — wait 30 seconds`}
          />

          <TroubleshootingItem
            question="'Insufficient balance' error"
            answer={`The buyer's wallet doesn't have enough USDC to complete the payment. They can:\n• Transfer USDC from another wallet\n• Buy USDC using the built-in fiat on-ramp\n• Swap another token for USDC via Jupiter (built-in)`}
          />

          <TroubleshootingItem
            question="Invoice not auto-created from LeafLink order"
            answer={`Check these settings:\n• Verify auto_create_invoice is set to true in your LeafLink config\n• Check that the webhook event type is order.created or order.accepted\n• Look for errors in /api/integrations/leaflink/syncs\n• The LeafLink order must have a valid total amount`}
          />

          <TroubleshootingItem
            question="Webhook signature verification failing"
            answer={`Both LeafLink and Settlr webhooks use HMAC-SHA256:\n• Make sure the webhook secret in your config matches LeafLink's signing secret\n• The signature is computed over the raw request body — don't parse before verifying\n• Check for encoding issues — the body must be the exact bytes received`}
          />

          <TroubleshootingItem
            question="How do I test without real money?"
            answer={`Use Solana devnet for testing:\n• Get devnet SOL from faucet.solana.com\n• Get devnet USDC from the test faucet in our demo\n• All payment flows work identically on devnet\n• Use sk_test_ API keys for development`}
          />

          <TroubleshootingItem
            question="How do I get support?"
            answer={`We're here to help:\n• GitHub Issues: github.com/ABFX15/x402-hack-payment\n• Email: support@settlr.dev`}
          />
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function TroubleshootingItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#E2DFD5] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-[#F3F2ED] transition-colors"
      >
        <span className="font-medium">{question}</span>
        <span
          className={`text-[#1B6B4A] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-[#7C8A9E] whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

function CodeBlock({
  children,
  language,
}: {
  children: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string, lang: string) => {
    if (lang === "bash") {
      return code.split("\n").map((line, i) => (
        <div key={i}>
          {line.startsWith("#") ? (
            <span className="text-[#7C8A9E]">{line}</span>
          ) : (
            <>
              <span className="text-[#7C8A9E]">$ </span>
              <span className="text-[#1B6B4A]">{line}</span>
            </>
          )}
        </div>
      ));
    }

    if (lang === "json") {
      return code.split("\n").map((line, i) => {
        const highlighted = line
          .replace(/"([^"]+)":/g, '<span class="text-[#1B6B4A]">"$1"</span>:')
          .replace(/: "([^"]+)"/g, ': <span class="text-[#1B6B4A]">"$1"</span>')
          .replace(/: (\d+)/g, ': <span class="text-orange-400">$1</span>')
          .replace(
            /: (true|false|null)/g,
            ': <span class="text-[#1B6B4A]">$1</span>',
          );
        return (
          <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
        );
      });
    }

    const keywords = [
      "import",
      "export",
      "from",
      "const",
      "let",
      "var",
      "function",
      "async",
      "await",
      "return",
      "if",
      "else",
      "try",
      "catch",
      "throw",
      "new",
      "class",
      "interface",
      "type",
      "extends",
      "implements",
      "default",
      "typeof",
    ];
    const builtins = [
      "console",
      "process",
      "window",
      "document",
      "Promise",
      "Error",
      "JSON",
      "Object",
      "Array",
      "String",
      "Number",
      "Boolean",
      "Date",
      "Math",
      "crypto",
    ];
    const reactKeywords = [
      "useState",
      "useEffect",
      "useCallback",
      "useMemo",
      "useRef",
      "useContext",
    ];

    return code.split("\n").map((line, lineIndex) => {
      if (line.trim().startsWith("//")) {
        return (
          <div key={lineIndex} className="text-[#7C8A9E]">
            {line}
          </div>
        );
      }

      const lineChars = line;
      const tokens: { type: string; value: string }[] = [];
      let i = 0;
      while (i < lineChars.length) {
        if (
          lineChars[i] === '"' ||
          lineChars[i] === "'" ||
          lineChars[i] === "`"
        ) {
          const quote = lineChars[i];
          let str = quote;
          i++;
          while (i < lineChars.length && lineChars[i] !== quote) {
            if (lineChars[i] === "\\" && i + 1 < lineChars.length) {
              str += lineChars[i] + lineChars[i + 1];
              i += 2;
            } else {
              str += lineChars[i];
              i++;
            }
          }
          if (i < lineChars.length) str += lineChars[i++];
          tokens.push({ type: "string", value: str });
          continue;
        }

        if (lineChars[i] === "/" && lineChars[i + 1] === "/") {
          tokens.push({ type: "comment", value: lineChars.slice(i) });
          break;
        }

        if (/[a-zA-Z_$]/.test(lineChars[i])) {
          let word = "";
          while (i < lineChars.length && /[a-zA-Z0-9_$]/.test(lineChars[i])) {
            word += lineChars[i++];
          }
          if (keywords.includes(word)) {
            tokens.push({ type: "keyword", value: word });
          } else if (builtins.includes(word)) {
            tokens.push({ type: "builtin", value: word });
          } else if (reactKeywords.includes(word)) {
            tokens.push({ type: "react", value: word });
          } else if (word[0] === word[0].toUpperCase() && /[a-z]/.test(word)) {
            tokens.push({ type: "class", value: word });
          } else {
            tokens.push({ type: "identifier", value: word });
          }
          continue;
        }

        if (/[0-9]/.test(lineChars[i])) {
          let num = "";
          while (i < lineChars.length && /[0-9._]/.test(lineChars[i])) {
            num += lineChars[i++];
          }
          tokens.push({ type: "number", value: num });
          continue;
        }

        if (lineChars[i] === "<" && /[A-Za-z\/]/.test(lineChars[i + 1] || "")) {
          let tag = "<";
          i++;
          while (
            i < lineChars.length &&
            lineChars[i] !== ">" &&
            lineChars[i] !== " "
          ) {
            tag += lineChars[i++];
          }
          tokens.push({ type: "tag", value: tag });
          continue;
        }

        tokens.push({ type: "punctuation", value: lineChars[i++] });
      }

      return (
        <div key={lineIndex}>
          {tokens.map((token, tokenIndex) => {
            switch (token.type) {
              case "keyword":
                return (
                  <span key={tokenIndex} className="text-pink-400">
                    {token.value}
                  </span>
                );
              case "string":
                return (
                  <span key={tokenIndex} className="text-[#1B6B4A]">
                    {token.value}
                  </span>
                );
              case "comment":
                return (
                  <span key={tokenIndex} className="text-[#7C8A9E]">
                    {token.value}
                  </span>
                );
              case "number":
                return (
                  <span key={tokenIndex} className="text-orange-400">
                    {token.value}
                  </span>
                );
              case "builtin":
                return (
                  <span key={tokenIndex} className="text-[#1B6B4A]">
                    {token.value}
                  </span>
                );
              case "react":
                return (
                  <span key={tokenIndex} className="text-[#1B6B4A]">
                    {token.value}
                  </span>
                );
              case "class":
                return (
                  <span key={tokenIndex} className="text-yellow-300">
                    {token.value}
                  </span>
                );
              case "tag":
                return (
                  <span key={tokenIndex} className="text-[#1B6B4A]">
                    {token.value}
                  </span>
                );
              default:
                return (
                  <span key={tokenIndex} className="text-[#3B4963]">
                    {token.value}
                  </span>
                );
            }
          })}
        </div>
      );
    });
  };

  return (
    <div className="relative bg-[#F3F2ED] rounded-lg overflow-hidden mb-4 border border-[#E2DFD5]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/70 border-b border-[#E2DFD5]">
        <span className="text-xs text-[#7C8A9E] uppercase font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-[#7C8A9E] hover:text-[#0C1829] transition-colors px-2 py-1 rounded hover:bg-[#E8E4Da]"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{highlightCode(children, language)}</code>
      </pre>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#F3F2ED] border border-[#E2DFD5] rounded-lg p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-[#7C8A9E] text-sm">{description}</p>
    </div>
  );
}
