"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { InteractivePlayground } from "@/components/docs/InteractivePlayground";
import {
  Search,
  Book,
  Code2,
  Webhook,
  HelpCircle,
  Rocket,
  ExternalLink,
  Play,
  RefreshCw,
  Vault,
  Plug,
} from "lucide-react";

const docsTabs = [
  { id: "quickstart", label: "Quick Start", icon: Rocket },
  { id: "payouts", label: "Payout API", icon: Book },
  { id: "react", label: "Checkout SDK", icon: Code2 },
  { id: "subscriptions", label: "Subscriptions", icon: RefreshCw },
  { id: "treasury", label: "Treasury", icon: Vault },
  { id: "playground", label: "Playground", icon: Play },
  { id: "api", label: "REST API", icon: Book },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "troubleshooting", label: "Troubleshooting", icon: HelpCircle },
];

type TabId =
  | "quickstart"
  | "payouts"
  | "playground"
  | "react"
  | "subscriptions"
  | "treasury"
  | "api"
  | "webhooks"
  | "integrations"
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
      <div className="min-h-screen bg-[#050507] text-white pt-16">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 border-r border-white/5 bg-[#0d0d14] overflow-y-auto">
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#3B82F6]/50 focus:outline-none"
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
                          ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* External Links */}
              <div className="mt-8 border-t border-white/5 pt-6">
                <p className="mb-3 text-xs font-semibold uppercase text-white/40">
                  Resources
                </p>
                <div className="space-y-1">
                  <a
                    href="https://www.npmjs.com/package/@settlr/sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    npm Package
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://github.com/ABFX15/x402-hack-payment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    GitHub
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
                <p className="text-xl text-white/60">
                  Send global payouts and embed checkout — one SDK, two
                  products.
                </p>
              </div>

              {/* Mobile Navigation Tabs */}
              <div className="flex gap-1 mb-8 border-b border-white/10 overflow-x-auto lg:hidden">
                {docsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "text-[#3B82F6] border-b-2 border-blue-500"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none">
                {activeTab === "quickstart" && <QuickStartContent />}
                {activeTab === "payouts" && <PayoutsContent />}
                {activeTab === "playground" && <PlaygroundContent />}
                {activeTab === "react" && <ReactSDKContent />}
                {activeTab === "subscriptions" && <SubscriptionsContent />}
                {activeTab === "treasury" && <TreasuryContent />}
                {activeTab === "api" && <APIContent />}
                {activeTab === "webhooks" && <WebhooksContent />}
                {activeTab === "integrations" && <IntegrationsContent />}
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

function QuickStartContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Get Started in 5 Minutes</h2>
        <p className="text-white/50 mb-6">
          Settlr gives you two products in one SDK. Pick your path:
        </p>

        {/* Two paths */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.05] p-5">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-full mb-3">
              Core product
            </span>
            <h3 className="text-lg font-semibold text-white mb-2">
              Payout API
            </h3>
            <p className="text-sm text-white/50 mb-3">
              Send money to anyone by email. One API call, 180+ countries, 1%
              flat.
            </p>
            <span className="text-sm text-[#3B82F6] font-medium">
              See Payout API tab →
            </span>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full mb-3">
              Add-on
            </span>
            <h3 className="text-lg font-semibold text-white mb-2">
              Checkout SDK
            </h3>
            <p className="text-sm text-white/50 mb-3">
              Embeddable React checkout for platforms that also need to collect
              payments.
            </p>
            <span className="text-sm text-emerald-400 font-medium">
              See Checkout SDK tab →
            </span>
          </div>
        </div>

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">Create Your Account</h3>
          </div>
          <p className="text-white/50 mb-4">
            Sign up to get your API key. Takes 30 seconds.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#050507] font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Get API Key →
          </a>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">Install the SDK</h3>
          </div>
          <CodeBlock language="bash">{`npm install @settlr/sdk`}</CodeBlock>
        </div>

        {/* Step 3 - Payout Example */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">Send Your First Payout</h3>
          </div>
          <CodeBlock language="tsx">
            {`import { Settlr } from '@settlr/sdk';

const settlr = new Settlr({
  apiKey: 'sk_live_your_api_key',
});

const payout = await settlr.payouts.create({
  email: 'creator@example.com',
  amount: 150.00,
  currency: 'USDC',
  memo: 'March earnings',
});

console.log(payout.status); // "sent"`}
          </CodeBlock>
          <p className="text-white/30 text-sm mt-3">
            💡 The recipient gets an email with a claim link. No wallet or bank
            details needed.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon="⚡"
            title="Instant Settlement"
            description="Payouts and payments settle in under 1 second."
          />
          <FeatureCard
            icon="🔒"
            title="Non-Custodial"
            description="You control your funds. We never hold your money."
          />
          <FeatureCard
            icon="🌍"
            title="180+ Countries"
            description="Pay anyone, anywhere. No bank details required."
          />
        </div>

        {/* Interactive Playground */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Try the Checkout SDK Live</h2>
          <p className="text-white/50 mb-6">
            Edit the code below and click &quot;Try It&quot; to see how the
            embedded checkout works. No setup required.
          </p>
          <InteractivePlayground showExamples={true} />
        </div>
      </section>
    </div>
  );
}

function PayoutsContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Payout API</h2>
        <p className="text-white/50 mb-6">
          Send USDC to anyone in the world with just their email address. Your
          core integration — one API call per payout.
        </p>

        <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-[#3B82F6] mb-2">
            How it works
          </h3>
          <ol className="text-white/50 text-sm space-y-2">
            <li>
              1. You call{" "}
              <code className="text-[#3B82F6] bg-[#3B82F6]/10 px-1 rounded">
                settlr.payouts.create()
              </code>{" "}
              with an email &amp; amount
            </li>
            <li>2. Recipient gets an email with a claim link</li>
            <li>
              3. They click, connect (or create) a wallet, and funds are theirs
            </li>
          </ol>
        </div>

        {/* Single payout */}
        <h3 className="text-xl font-semibold mb-4">Single Payout</h3>
        <CodeBlock language="tsx">
          {`import { Settlr } from '@settlr/sdk';

const settlr = new Settlr({
  apiKey: 'sk_live_your_api_key',
});

const payout = await settlr.payouts.create({
  email: 'alice@example.com',
  amount: 250.00,
  currency: 'USDC',
  memo: 'March data labeling — 500 tasks',
  metadata: {
    batchId: 'batch_001',
    workerId: 'worker_alice',
  },
});

// payout.id     → "po_abc123"
// payout.status → "sent"
// payout.claimUrl → "https://settlr.dev/claim/po_abc123"`}
        </CodeBlock>

        {/* Batch payouts */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Batch Payouts</h3>
        <p className="text-white/50 mb-4">
          Pay hundreds of people at once. Each recipient gets their own email.
        </p>
        <CodeBlock language="tsx">
          {`const batch = await settlr.payouts.createBatch([
  { email: 'alice@example.com', amount: 250.00, memo: 'March earnings' },
  { email: 'bob@example.com',   amount: 180.00, memo: 'March earnings' },
  { email: 'carol@example.com', amount: 320.00, memo: 'March earnings' },
]);

console.log(batch.id);       // "batch_xyz"
console.log(batch.total);    // 750.00
console.log(batch.count);    // 3
console.log(batch.status);   // "processing"`}
        </CodeBlock>

        {/* Check status */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Check Payout Status</h3>
        <CodeBlock language="tsx">
          {`const payout = await settlr.payouts.get('po_abc123');

// Statuses: "sent" → "claimed" → "settled"
console.log(payout.status);    // "claimed"
console.log(payout.claimedAt); // "2025-06-15T14:30:00Z"`}
        </CodeBlock>

        {/* List payouts */}
        <h3 className="text-xl font-semibold mb-4 mt-8">List Payouts</h3>
        <CodeBlock language="tsx">
          {`const payouts = await settlr.payouts.list({
  status: 'claimed',
  limit: 50,
});

payouts.data.forEach(p => {
  console.log(p.email, p.amount, p.status);
});`}
        </CodeBlock>

        {/* Webhooks */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Payout Webhooks</h3>
        <p className="text-white/50 mb-4">
          Get notified when a recipient claims their payout.
        </p>
        <CodeBlock language="json">
          {`{
  "event": "payout.claimed",
  "data": {
    "id": "po_abc123",
    "email": "alice@example.com",
    "amount": 250.00,
    "status": "claimed",
    "claimedAt": "2025-06-15T14:30:00Z",
    "wallet": "7xKj...abc"
  }
}`}
        </CodeBlock>

        {/* Payout props */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Payout Parameters</h3>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Parameter</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">email</td>
                <td className="px-4 py-3 text-white/50">string</td>
                <td className="px-4 py-3 text-white/50">
                  Recipient&apos;s email address
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">amount</td>
                <td className="px-4 py-3 text-white/50">number</td>
                <td className="px-4 py-3 text-white/50">
                  Payout amount in USDC
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">memo</td>
                <td className="px-4 py-3 text-white/50">string</td>
                <td className="px-4 py-3 text-white/50">
                  Description shown to recipient in the email
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">metadata</td>
                <td className="px-4 py-3 text-white/50">object</td>
                <td className="px-4 py-3 text-white/50">
                  Custom key-value pairs for your records
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">currency</td>
                <td className="px-4 py-3 text-white/50">&apos;USDC&apos;</td>
                <td className="px-4 py-3 text-white/50">
                  Currency (USDC only for now)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Event types */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Payout Event Types</h3>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payout.sent
                </td>
                <td className="px-4 py-3 text-white/50">
                  Email sent to recipient with claim link
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payout.claimed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Recipient claimed the payout
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payout.expired
                </td>
                <td className="px-4 py-3 text-white/50">
                  Payout expired before being claimed
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  batch.completed
                </td>
                <td className="px-4 py-3 text-white/50">
                  All payouts in a batch have been sent
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PlaygroundContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Interactive Playground</h2>
        <p className="text-white/50 mb-6">
          Experiment with the Settlr SDK in real-time. Edit the code, try
          different configurations, and see the checkout flow in action — no
          setup required.
        </p>

        {/* Main Playground */}
        <InteractivePlayground showExamples={true} />

        {/* Tips Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-[#12121a] p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              💡 Pro Tips
            </h3>
            <ul className="text-sm text-white/60 space-y-2">
              <li>
                • Change the{" "}
                <code className="text-[#3B82F6] bg-[#3B82F6]/10 px-1 rounded">
                  amount
                </code>{" "}
                prop to test different prices
              </li>
              <li>
                • Add a{" "}
                <code className="text-[#3B82F6] bg-[#3B82F6]/10 px-1 rounded">
                  memo
                </code>{" "}
                for order descriptions
              </li>
              <li>
                • Use{" "}
                <code className="text-[#3B82F6] bg-[#3B82F6]/10 px-1 rounded">
                  onSuccess
                </code>{" "}
                to handle completed payments
              </li>
              <li>• Try the dropdown to load different examples</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#12121a] p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              🚀 Ready to Integrate?
            </h3>
            <p className="text-sm text-white/60 mb-4">
              When you're ready to accept real payments, create an account to
              get your API key.
            </p>
            <a
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#050507]"
            >
              Get API Key →
            </a>
          </div>
        </div>

        {/* Example Use Cases */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-white mb-6">
            Example Use Cases
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <span className="text-2xl">�️</span>
              <h4 className="font-medium text-white mt-2">AI Data Labeling</h4>
              <p className="text-sm text-white/50 mt-1">
                Annotator payouts, batch payments, global workforce
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <span className="text-2xl">🎨</span>
              <h4 className="font-medium text-white mt-2">Creator Platforms</h4>
              <p className="text-sm text-white/50 mt-1">
                Creator payouts, royalties, international settlements
              </p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <span className="text-2xl">💼</span>
              <h4 className="font-medium text-white mt-2">
                Freelance Marketplaces
              </h4>
              <p className="text-sm text-white/50 mt-1">
                Contractor payouts, invoice settlements, global hiring
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReactSDKContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Checkout SDK</h2>
        <p className="text-white/50 mb-6">
          Embeddable checkout for platforms that also collect payments. React
          hooks and components for full control over the payment flow.
        </p>

        {/* Prerequisites */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            Prerequisites
          </h3>
          <p className="text-white/50 text-sm mb-3">
            Before using the Checkout SDK, you need to:
          </p>
          <ol className="text-white/50 text-sm space-y-2">
            <li>
              1.{" "}
              <a href="/onboarding" className="text-[#3B82F6] hover:underline">
                Create a merchant account
              </a>{" "}
              to get your API key
            </li>
            <li>
              2. Install the SDK:{" "}
              <code className="text-emerald-400 bg-gray-800 px-2 py-0.5 rounded">
                npm install @settlr/sdk
              </code>
            </li>
          </ol>
        </div>

        {/* Payment Modal - NEW */}
        <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-emerald-400 mb-2">
            Add-on product
          </h3>
          <p className="text-white/50 text-sm">
            The Checkout SDK is for platforms that need to{" "}
            <strong className="text-white/70">collect</strong> payments (creator
            tips, iGaming deposits, subscriptions). For{" "}
            <strong className="text-white/70">sending</strong> payouts, use the
            Payout API tab.
          </p>
        </div>

        <h3 className="text-xl font-semibold mb-4">
          1. Payment Modal (Recommended)
        </h3>
        <p className="text-white/50 mb-4">
          Keep users on your site with an embedded payment modal. Perfect for
          platforms, payouts, and global payments.
        </p>
        <CodeBlock language="tsx">
          {`import { usePaymentModal, Settlr } from '@settlr/sdk';

// Initialize with your API key from onboarding
const settlr = new Settlr({
  apiKey: 'sk_live_your_api_key',
  merchant: { name: 'YourPlatform' },
});

function SubscriptionPage() {
  const { openPayment, PaymentModalComponent } = usePaymentModal();

  const handleSubscribe = () => {
    openPayment({
      amount: 49.00,
      memo: "Pro Plan Subscription",
      onSuccess: (result) => {
        console.log("Paid!", result.signature);
        activateSubscription();
      },
    });
  };

  return (
    <>
      <button onClick={handleSubscribe}>
        Subscribe to Pro - $49.00/mo
      </button>
      <PaymentModalComponent />
    </>
  );
}`}
        </CodeBlock>

        {/* Direct Modal Component */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          2. Direct Modal Component
        </h3>
        <p className="text-white/50 mb-4">
          For more control, use the PaymentModal component directly.
        </p>
        <CodeBlock language="tsx">
          {`import { PaymentModal } from '@settlr/sdk';
import { useState } from 'react';

function ProductPage() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Buy Now - $49.99
      </button>

      {showPayment && (
        <PaymentModal
          amount={49.99}
          merchantName="My Store"
          merchantWallet="YOUR_WALLET_ADDRESS"
          memo="Premium Bundle"
          onSuccess={(result) => {
            console.log("Payment complete!", result.signature);
            setShowPayment(false);
            deliverProduct();
          }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}`}
        </CodeBlock>

        {/* Redirect Flow */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          3. Redirect Flow (Alternative)
        </h3>
        <p className="text-white/50 mb-4">
          For simpler integrations, redirect users to Settlr checkout.
        </p>
        <CodeBlock language="tsx">
          {`import { Settlr } from '@settlr/sdk';

const settlr = new Settlr({
  apiKey: "sk_test_demo_xxxxxxxxxxxx",  // Use your key from onboarding
  merchant: {
    name: "My Store",
    // walletAddress auto-fetched from API key
  },
});

// Redirect to Settlr checkout
const url = settlr.getCheckoutUrl({
  amount: 29.99,
  memo: "Order #1234",
  successUrl: "https://mystore.com/success",
});

window.location.href = url;`}
        </CodeBlock>

        {/* Pay Button */}
        <h3 className="text-xl font-semibold mb-4 mt-8">2. Add a Pay Button</h3>
        <p className="text-white/50 mb-4">
          The simplest way to accept payments.
        </p>
        <CodeBlock language="tsx">
          {`import { BuyButton } from '@settlr/sdk';

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>\${product.price}</p>
      
      <BuyButton
        amount={product.price}
        memo={product.name}
        onSuccess={(result) => {
          // Payment complete! Fulfill the order
          fulfillOrder(product.id, result.signature);
        }}
        onError={(error) => {
          toast.error('Payment failed');
        }}
      >
        Buy Now - \${product.price}
      </BuyButton>
    </div>
  );
}`}
        </CodeBlock>

        {/* useSettlr Hook */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          3. Custom UI with useSettlr Hook
        </h3>
        <p className="text-white/50 mb-4">
          Build your own payment UI with full control.
        </p>
        <CodeBlock language="tsx">
          {`import { useSettlr } from '@settlr/sdk';

function CustomCheckout() {
  const { pay, status, error } = useSettlr();
  
  const handlePayment = async () => {
    const result = await pay({
      recipient: 'MERCHANT_WALLET',
      amount: 25.00,
      currency: 'USDC',
      memo: 'Order #12345',
    });
    
    if (result.success) {
      router.push('/thank-you?tx=' + result.signature);
    }
  };
  
  return (
    <div>
      <button 
        onClick={handlePayment}
        disabled={status === 'processing'}
        className="bg-white text-black px-6 py-3 rounded-lg"
      >
        {status === 'processing' ? 'Processing...' : 'Pay $25.00'}
      </button>
      
      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  );
}`}
        </CodeBlock>

        {/* Props Reference */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Props Reference</h3>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Prop</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  recipient
                </td>
                <td className="px-4 py-3 text-white/50">string</td>
                <td className="px-4 py-3 text-white/50">
                  Wallet address to receive payment
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">amount</td>
                <td className="px-4 py-3 text-white/50">number</td>
                <td className="px-4 py-3 text-white/50">
                  Payment amount in the specified currency
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">currency</td>
                <td className="px-4 py-3 text-white/50">'USDC' | 'SOL'</td>
                <td className="px-4 py-3 text-white/50">
                  Token to accept (default: USDC)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  onSuccess
                </td>
                <td className="px-4 py-3 text-white/50">(tx) =&gt; void</td>
                <td className="px-4 py-3 text-white/50">
                  Called when payment succeeds
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">onError</td>
                <td className="px-4 py-3 text-white/50">(err) =&gt; void</td>
                <td className="px-4 py-3 text-white/50">
                  Called when payment fails
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">label</td>
                <td className="px-4 py-3 text-white/50">string</td>
                <td className="px-4 py-3 text-white/50">
                  Button text (default: "Pay with USDC")
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">memo</td>
                <td className="px-4 py-3 text-white/50">string</td>
                <td className="px-4 py-3 text-white/50">
                  Optional memo attached to transaction
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">gasless</td>
                <td className="px-4 py-3 text-white/50">boolean</td>
                <td className="px-4 py-3 text-white/50">
                  Enable gasless transactions (default: true)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function APIContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">REST API Reference</h2>
        <p className="text-white/50 mb-6">
          Use our REST API for server-side payout and payment integrations.
        </p>

        {/* Base URL */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <p className="text-white/30 text-sm mb-1">Base URL</p>
          <code className="text-[#3B82F6]">https://settlr.dev/api</code>
        </div>

        {/* Authentication */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            🔐 Authentication
          </h3>
          <p className="text-white/50 text-sm mb-3">
            All API requests require your API key from{" "}
            <a href="/onboarding" className="text-[#3B82F6] hover:underline">
              merchant onboarding
            </a>
            .
          </p>
          <CodeBlock language="bash">
            {`curl https://settlr.dev/api/payments \\
  -H "X-API-Key: sk_test_demo_xxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`}
          </CodeBlock>
        </div>

        {/* Create Payout */}
        <div className="border border-white/10 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-white">/payouts</code>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-full ml-auto">
              Core
            </span>
          </div>
          <div className="p-4">
            <p className="text-white/50 mb-4">
              Create a new payout. The recipient receives an email with a claim
              link.
            </p>
            <h4 className="font-medium mb-2">Request Body</h4>
            <CodeBlock language="json">
              {`{
  "email": "alice@example.com",
  "amount": 250.00,
  "currency": "USDC",
  "memo": "March earnings",
  "metadata": {
    "workerId": "worker_alice"
  }
}`}
            </CodeBlock>
            <h4 className="font-medium mb-2 mt-4">Response</h4>
            <CodeBlock language="json">
              {`{
  "id": "po_abc123",
  "status": "sent",
  "email": "alice@example.com",
  "amount": 250.00,
  "claimUrl": "https://settlr.dev/claim/po_abc123",
  "createdAt": "2025-06-15T10:00:00Z"
}`}
            </CodeBlock>
          </div>
        </div>

        {/* Create Batch Payout */}
        <div className="border border-white/10 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-white">/payouts/batch</code>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-full ml-auto">
              Core
            </span>
          </div>
          <div className="p-4">
            <p className="text-white/50 mb-4">
              Create multiple payouts at once. Each recipient gets their own
              email.
            </p>
            <h4 className="font-medium mb-2">Request Body</h4>
            <CodeBlock language="json">
              {`{
  "payouts": [
    { "email": "alice@example.com", "amount": 250.00, "memo": "March" },
    { "email": "bob@example.com", "amount": 180.00, "memo": "March" }
  ]
}`}
            </CodeBlock>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white/70 mt-10 mb-4">
          Checkout Endpoints
        </h3>

        {/* Create Payment */}
        <div className="border border-white/10 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-sm font-mono">
              POST
            </span>
            <code className="text-white">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-white/50 mb-4">
              Create a new payment request. The recipient is automatically set
              to your registered payout wallet.
            </p>
            <h4 className="font-medium mb-2">Request Body</h4>
            <CodeBlock language="json">
              {`{
  "amount": 10.00,
  "currency": "USDC",
  "memo": "Order #12345",
  "metadata": {
    "orderId": "12345",
    "customerId": "user_abc"
  }
}`}
            </CodeBlock>
            <h4 className="font-medium mb-2 mt-4">Response</h4>
            <CodeBlock language="json">
              {`{
  "id": "pay_abc123",
  "status": "pending",
  "amount": 10.00,
  "currency": "USDC",
  "paymentUrl": "https://pay.settlr.io/pay_abc123",
  "expiresAt": "2024-01-15T12:00:00Z"
}`}
            </CodeBlock>
          </div>
        </div>

        {/* Get Payment */}
        <div className="border border-white/10 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-blue-500/20 text-[#38bdf8] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-white">/payments/:id</code>
          </div>
          <div className="p-4">
            <p className="text-white/50 mb-4">Retrieve a payment by ID.</p>
            <h4 className="font-medium mb-2">Response</h4>
            <CodeBlock language="json">
              {`{
  "id": "pay_abc123",
  "status": "completed",
  "amount": 10.00,
  "currency": "USDC",
  "recipient": "YOUR_WALLET_ADDRESS",
  "signature": "5xKj...abc",
  "paidAt": "2024-01-15T11:30:00Z"
}`}
            </CodeBlock>
          </div>
        </div>

        {/* List Payments */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <span className="bg-blue-500/20 text-[#38bdf8] px-2 py-1 rounded text-sm font-mono">
              GET
            </span>
            <code className="text-white">/payments</code>
          </div>
          <div className="p-4">
            <p className="text-white/50 mb-4">
              List all payments with optional filters.
            </p>
            <h4 className="font-medium mb-2">Query Parameters</h4>
            <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="px-4 py-2 font-mono text-[#3B82F6]">
                      status
                    </td>
                    <td className="px-4 py-2 text-white/50">
                      pending | completed | expired
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-[#3B82F6]">
                      limit
                    </td>
                    <td className="px-4 py-2 text-white/50">
                      Number of results (default: 20, max: 100)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-[#3B82F6]">
                      cursor
                    </td>
                    <td className="px-4 py-2 text-white/50">
                      Pagination cursor
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WebhooksContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Webhooks</h2>
        <p className="text-white/50 mb-6">
          Get notified in real-time when payments, payouts, and subscriptions
          change state.
        </p>

        {/* Setup */}
        <h3 className="text-xl font-semibold mb-4">Setting Up Webhooks</h3>
        <p className="text-white/50 mb-4">
          Configure your webhook endpoint in the Settlr dashboard. We'll send a
          POST request whenever a payment is completed.
        </p>

        {/* Payload */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Webhook Payload</h3>
        <CodeBlock language="json">
          {`{
  "event": "payment.completed",
  "data": {
    "id": "pay_abc123",
    "status": "completed",
    "amount": 10.00,
    "currency": "USDC",
    "recipient": "YOUR_WALLET_ADDRESS",
    "signature": "5xKj...abc",
    "paidAt": "2025-06-15T11:30:00Z",
    "metadata": {
      "orderId": "12345"
    }
  },
  "timestamp": "2025-06-15T11:30:01Z"
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
      await fulfillOrder(event.data.metadata.orderId, event.data.id);
      break;
    case 'payout.claimed':
      await markPayoutClaimed(event.data.id, event.data.wallet);
      break;
    case 'payout.expired':
      await handleExpiredPayout(event.data.id);
      break;
    case 'subscription.renewed':
      await extendAccess(event.data.customerId, event.data.planId);
      break;
    case 'subscription.cancelled':
      await revokeAccess(event.data.customerId);
      break;
    default:
      console.log('Unhandled event:', event.event);
  }
  
  return NextResponse.json({ received: true });
}`}
        </CodeBlock>

        {/* Events */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Event Types</h3>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payment.completed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Payment was successful and confirmed on-chain
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payment.expired
                </td>
                <td className="px-4 py-3 text-white/50">
                  Payment link expired before completion
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payment.failed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Payment failed due to an error
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payment.refunded
                </td>
                <td className="px-4 py-3 text-white/50">
                  Payment was refunded to the customer
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payout.created
                </td>
                <td className="px-4 py-3 text-white/50">
                  New payout created and email sent to recipient
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payout.claimed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Recipient claimed the payout to their wallet
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payout.expired
                </td>
                <td className="px-4 py-3 text-white/50">
                  Payout expired before being claimed (funds returned)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  payout.failed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Payout failed — email undeliverable or on-chain error
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  subscription.created
                </td>
                <td className="px-4 py-3 text-white/50">
                  New subscription plan activated
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  subscription.renewed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Recurring subscription payment processed
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  subscription.cancelled
                </td>
                <td className="px-4 py-3 text-white/50">
                  Subscription was cancelled by user or merchant
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-yellow-400 mb-2">⚠️ Security Note</h4>
          <p className="text-white/50">
            Always verify the webhook signature before processing events. Never
            trust the payload without verification.
          </p>
        </div>
      </section>
    </div>
  );
}

function SubscriptionsContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Subscriptions</h2>
        <p className="text-white/50 mb-6">
          Recurring USDC billing — create plans, manage subscribers, and handle
          renewals automatically.
        </p>

        {/* Create a Plan */}
        <h3 className="text-xl font-semibold mb-4">Create a Plan</h3>
        <p className="text-white/50 mb-4">
          Define a recurring plan that customers can subscribe to.
        </p>
        <CodeBlock language="tsx">
          {`import { Settlr } from '@settlr/sdk';

const settlr = new Settlr({ apiKey: 'sk_live_your_api_key' });

const plan = await settlr.subscriptions.createPlan({
  name: 'Pro Monthly',
  amount: 29.00,
  currency: 'USDC',
  interval: 'month',       // 'week' | 'month' | 'year'
  trialDays: 7,
  metadata: { tier: 'pro' },
});

console.log(plan.id);   // "plan_abc123"
console.log(plan.active); // true`}
        </CodeBlock>

        {/* Subscribe a Customer */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Subscribe a Customer
        </h3>
        <p className="text-white/50 mb-4">
          Attach a customer to a plan. They&apos;ll be charged automatically
          each billing cycle.
        </p>
        <CodeBlock language="tsx">
          {`const subscription = await settlr.subscriptions.create({
  planId: 'plan_abc123',
  customerEmail: 'alice@example.com',
  // Optional: pre-authorized wallet for auto-debit
  customerWallet: '7xKj...abc',
});

// subscription.id         → "sub_xyz789"
// subscription.status     → "active"
// subscription.nextBillingAt → "2025-07-15T00:00:00Z"`}
        </CodeBlock>

        {/* List Subscriptions */}
        <h3 className="text-xl font-semibold mb-4 mt-8">List Subscriptions</h3>
        <CodeBlock language="tsx">
          {`const subs = await settlr.subscriptions.list({
  status: 'active',
  limit: 50,
});

subs.data.forEach(s => {
  console.log(s.customerEmail, s.planId, s.status);
});`}
        </CodeBlock>

        {/* Cancel */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Cancel a Subscription
        </h3>
        <CodeBlock language="tsx">
          {`await settlr.subscriptions.cancel('sub_xyz789', {
  // 'immediate' ends now, 'end_of_period' lets them use remaining time
  cancelAt: 'end_of_period',
});`}
        </CodeBlock>

        {/* Webhook events */}
        <h3 className="text-xl font-semibold mb-4 mt-8">
          Subscription Webhooks
        </h3>
        <p className="text-white/50 mb-4">
          Listen for subscription lifecycle events to keep your system in sync.
        </p>
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  subscription.created
                </td>
                <td className="px-4 py-3 text-white/50">
                  New subscription activated
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  subscription.renewed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Recurring payment processed
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  subscription.cancelled
                </td>
                <td className="px-4 py-3 text-white/50">
                  Cancelled by user or merchant
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">
                  subscription.payment_failed
                </td>
                <td className="px-4 py-3 text-white/50">
                  Renewal payment failed (will retry)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TreasuryContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Treasury</h2>
        <p className="text-white/50 mb-6">
          Monitor your on-chain treasury, manage platform fees, and claim
          accumulated revenue.
        </p>

        {/* Overview */}
        <h3 className="text-xl font-semibold mb-4">How Treasury Works</h3>
        <p className="text-white/50 mb-4">
          Every payment processed through Settlr collects a configurable
          platform fee (default 2%) into a program-owned treasury PDA.
          Authorized signers can claim accumulated fees at any time.
        </p>
        <div className="bg-gray-900 rounded-lg p-6 border border-white/10 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-white/40 mb-1">Fee Collection</p>
              <p className="text-lg font-semibold text-white">Automatic</p>
              <p className="text-xs text-white/30">On every payment</p>
            </div>
            <div>
              <p className="text-sm text-white/40 mb-1">Claim Method</p>
              <p className="text-lg font-semibold text-white">
                Multisig / Wallet
              </p>
              <p className="text-xs text-white/30">Authority-gated</p>
            </div>
            <div>
              <p className="text-sm text-white/40 mb-1">Settlement</p>
              <p className="text-lg font-semibold text-white">USDC</p>
              <p className="text-xs text-white/30">Direct to your wallet</p>
            </div>
          </div>
        </div>

        {/* Get Balance */}
        <h3 className="text-xl font-semibold mb-4">Check Treasury Balance</h3>
        <CodeBlock language="tsx">
          {`const treasury = await settlr.treasury.getBalance();

console.log(treasury.balance);       // 1250.50 (USDC)
console.log(treasury.totalVolume);   // 62525.00
console.log(treasury.totalFees);     // 1250.50
console.log(treasury.feeBps);        // 200 (2.00%)
console.log(treasury.isActive);      // true`}
        </CodeBlock>

        {/* Claim Fees */}
        <h3 className="text-xl font-semibold mb-4 mt-8">Claim Platform Fees</h3>
        <p className="text-white/50 mb-4">
          Only the on-chain authority (your wallet or Squads multisig) can claim
          fees. The API returns an unsigned transaction for you to sign.
        </p>
        <CodeBlock language="tsx">
          {`// 1. Request unsigned claim transaction
const { transaction } = await settlr.treasury.claim({
  authority: 'YOUR_AUTHORITY_PUBKEY',
});

// 2. Sign with your wallet
const signed = await wallet.signTransaction(transaction);

// 3. Send to network
const sig = await connection.sendRawTransaction(signed.serialize());
console.log('Claimed! Tx:', sig);`}
        </CodeBlock>

        {/* REST API */}
        <h3 className="text-xl font-semibold mb-4 mt-8">REST Endpoints</h3>
        <div className="space-y-4">
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm font-mono">
                GET
              </span>
              <code className="text-white">/api/admin/treasury</code>
            </div>
            <div className="p-4">
              <p className="text-white/50 text-sm">
                Returns treasury balance, platform config (fee BPS, authority,
                total volume/fees), and PDA addresses.
              </p>
            </div>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
              <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-sm font-mono">
                POST
              </span>
              <code className="text-white">/api/admin/claim</code>
            </div>
            <div className="p-4">
              <p className="text-white/50 text-sm mb-2">
                Builds an unsigned{" "}
                <code className="text-[#3B82F6]">claim_platform_fees</code>{" "}
                transaction.
              </p>
              <CodeBlock language="json">
                {`{
  "authority": "YOUR_AUTHORITY_PUBKEY"
}`}
              </CodeBlock>
            </div>
          </div>
        </div>

        {/* Admin Dashboard */}
        <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-4 mt-8">
          <h4 className="font-medium text-[#3B82F6] mb-2">
            💡 Admin Dashboard
          </h4>
          <p className="text-white/50 text-sm">
            Visit{" "}
            <a href="/admin" className="text-[#3B82F6] hover:underline">
              /admin
            </a>{" "}
            to see a visual treasury dashboard with real-time on-chain data,
            claim button, and authority verification.
          </p>
        </div>
      </section>
    </div>
  );
}

function IntegrationsContent() {
  const integrations = [
    {
      name: "Zapier",
      slug: "zapier",
      emoji: "⚡",
      desc: "Connect Settlr to 6,000+ apps. Trigger payouts from form submissions, CRM events, or any Zapier workflow.",
      setup: [
        "Install the Settlr app from the Zapier marketplace",
        "Connect your account with your Settlr API key",
        "Pick a trigger (e.g. new Typeform submission) and an action (Send Payout or Create Batch Payout)",
        "Map fields — recipient email, amount, memo — and enable the Zap",
      ],
      endpoints: [
        "POST /api/payouts — Send a single payout",
        "POST /api/payouts/batch — Send batch payouts",
        "GET /api/payments — Trigger on new payments received",
        "GET /api/payouts?status=completed — Trigger on completed payouts",
      ],
      example: `// Zapier action: Send Payout
// Maps form fields → Settlr payout
{
  "recipient": "{{email}}",
  "amount": {{amount}},
  "memo": "Payment from {{source}}"
}`,
    },
    {
      name: "WooCommerce",
      slug: "woocommerce",
      emoji: "🛒",
      desc: "Accept USDC at checkout in any WooCommerce store. Customers pay stablecoins, you get instant settlement.",
      setup: [
        "Download the Settlr WooCommerce plugin (PHP)",
        "Upload to wp-content/plugins/ and activate",
        'Go to WooCommerce → Settings → Payments → "Settlr — Pay with USDC"',
        "Enter your API key and optional webhook secret",
        "Customers see a USDC payment option at checkout",
      ],
      endpoints: [
        "POST /api/payments — Create a payment session",
        "GET /api/payments/:id — Check payment status",
        "POST /api/payouts — Process refunds via payout",
        "Webhooks — payment.completed marks the order as paid",
      ],
      example: `// Customer selects "Pay with USDC" at checkout
// → Plugin calls POST /api/payments
{
  "amount": 49.99,
  "currency": "USDC",
  "metadata": {
    "orderId": "WC-1234",
    "customer": "jane@example.com"
  }
}
// → Customer scans QR or connects wallet
// → Webhook fires → order marked "Processing"`,
    },
    {
      name: "Shopify",
      slug: "shopify",
      emoji: "🏪",
      desc: "Add USDC payments to your Shopify store via an Express-based Payments App Extension.",
      setup: [
        "Clone the Shopify plugin from the Settlr GitHub repo",
        "Configure SETTLR_API_KEY and SHOPIFY_API_SECRET in .env",
        "Deploy the Express server (Vercel, Railway, etc.)",
        "Install the Payments App Extension in your Shopify admin",
        "Customers see USDC as a payment method at checkout",
      ],
      endpoints: [
        "POST /api/payments — Create payment session",
        "POST /api/payments/:id/confirm — Confirm on-chain",
        "POST /api/payouts — Handle refunds",
        "Webhooks — payment.completed resolves the session",
      ],
      example: `// Shopify sends payment session request
// → Plugin creates Settlr payment
// → Returns redirect URL for customer
{
  "redirect_url": "https://pay.settlr.dev/session/abc123",
  "payment_id": "pay_xyz"
}`,
    },
    {
      name: "Slack",
      slug: "slack",
      emoji: "💬",
      desc: "Send USDC payments from Slack with slash commands. Built-in approval workflows and thread receipts.",
      setup: [
        "Create a Slack App at api.slack.com/apps",
        "Add slash commands: /pay, /pay-batch, /pay-balance, /pay-history",
        "Set SETTLR_API_KEY and SLACK_SIGNING_SECRET in .env",
        "Deploy the bot (Node.js / @slack/bolt)",
        "Install to your workspace — team can send payouts from any channel",
      ],
      endpoints: [
        "POST /api/payouts — /pay command",
        "POST /api/payouts/batch — /pay-batch command",
        "GET /api/balance — /pay-balance command",
        "GET /api/payouts — /pay-history command",
      ],
      example: `// Slash command in Slack:
/pay jane@example.com 50 USDC for design work

// Bot responds in thread:
✅ Payout sent!
Recipient: jane@example.com
Amount: 50.00 USDC
Status: completed
Signature: 5xKj...abc`,
    },
    {
      name: "Bubble.io",
      slug: "bubble",
      emoji: "🫧",
      desc: "Add stablecoin payments to Bubble apps with a no-code plugin. Drop-in actions and visual elements.",
      setup: [
        'Install the "Settlr Payments" plugin from the Bubble marketplace',
        "Enter your API key in the plugin settings",
        "Use the Send Payout or Create Payment actions in workflows",
        "Optionally add the Payout Status visual element to pages",
      ],
      endpoints: [
        "POST /api/payouts — Send Payout action",
        "POST /api/payouts/batch — Batch Payout action",
        "POST /api/payments — Create Payment action",
        "GET /api/payouts/:id — Payout Status element",
      ],
      example: `// Bubble workflow example:
// Trigger: Button "Pay Freelancer" is clicked
// Action: Settlr - Send Payout
//   recipient = Input Freelancer Email's value
//   amount = Input Amount's value
//   memo = Input Memo's value
// 
// On success → show "Payment sent!" popup`,
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Integrations</h2>
        <p className="text-white/50 mb-6">
          Connect Settlr to the tools you already use. Each integration is
          open-source and uses the same REST API documented in the{" "}
          <button
            className="text-[#3B82F6] hover:underline"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("settlr:set-tab", { detail: "api" }),
              )
            }
          >
            API tab
          </button>
          .
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {integrations.map((i) => (
            <a
              key={i.slug}
              href={`/integrations/${i.slug}`}
              className="block rounded-lg border border-white/10 bg-white/[0.02] p-5 hover:border-[#3B82F6]/40 hover:bg-white/[0.04] transition-all"
            >
              <div className="text-2xl mb-2">{i.emoji}</div>
              <h3 className="font-semibold mb-1">{i.name}</h3>
              <p className="text-sm text-white/50 line-clamp-2">{i.desc}</p>
            </a>
          ))}
        </div>

        {/* Detailed sections */}
        {integrations.map((integration) => (
          <div
            key={integration.slug}
            id={`integration-${integration.slug}`}
            className="mb-12 scroll-mt-24"
          >
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">{integration.emoji}</span>
              {integration.name}
            </h3>
            <p className="text-white/50 mb-4">{integration.desc}</p>

            <h4 className="font-medium mb-2">Setup</h4>
            <ol className="list-decimal list-inside space-y-1 text-white/60 mb-4 text-sm">
              {integration.setup.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <h4 className="font-medium mb-2">API Endpoints Used</h4>
            <ul className="space-y-1 mb-4">
              {integration.endpoints.map((ep, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-white/60"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B82F6]" />
                  <code className="text-white/70 text-xs">{ep}</code>
                </li>
              ))}
            </ul>

            <h4 className="font-medium mb-2">Example</h4>
            <CodeBlock language="typescript">{integration.example}</CodeBlock>

            <a
              href={`https://github.com/ABFX15/Settlr/tree/master/plugins/${integration.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#3B82F6] hover:underline"
            >
              View source on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}

        {/* Auth section */}
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6 mt-8">
          <h3 className="text-lg font-semibold mb-3">Authentication</h3>
          <p className="text-white/50 text-sm mb-3">
            All integrations authenticate with your Settlr API key. Pass it as a
            Bearer token:
          </p>
          <CodeBlock language="bash">
            {`curl -H "Authorization: Bearer sk_live_YOUR_KEY" \\
  https://settlr.dev/api/payouts`}
          </CodeBlock>
          <p className="text-white/50 text-sm">
            Use <code className="text-white/70">sk_test_</code> keys for
            development and <code className="text-white/70">sk_live_</code> keys
            for production. Manage keys in the{" "}
            <a href="/dashboard" className="text-[#3B82F6] hover:underline">
              dashboard
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function TroubleshootingContent() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
        <p className="text-white/50 mb-6">Common issues and how to fix them.</p>

        {/* FAQ Items */}
        <div className="space-y-4">
          <TroubleshootingItem
            question="Payment stuck on 'Processing'"
            answer="This usually means the transaction is waiting for confirmation. Solana transactions typically confirm in 1-2 seconds. If it's stuck longer:
• Check your internet connection
• The RPC endpoint may be congested - try refreshing
• If using devnet, the network may be slow - wait 30 seconds and try again"
          />

          <TroubleshootingItem
            question="'Insufficient balance' error"
            answer="The user's wallet doesn't have enough USDC to complete the payment. They can:
• Buy USDC using the built-in fiat on-ramp (card purchase)
• Transfer USDC from another wallet
• Swap another token for USDC via Jupiter (built-in)"
          />

          <TroubleshootingItem
            question="Webhook not receiving events"
            answer="Check these common issues:
• Verify your webhook URL is publicly accessible (not localhost)
• Ensure your endpoint returns 200 status within 5 seconds
• Check your webhook secret matches the one in your dashboard
• Look for HTTPS - webhooks require SSL in production"
          />

          <TroubleshootingItem
            question="'Invalid API key' error"
            answer="Your API key may be incorrect or expired:
• Make sure you're using the full key (starts with sk_test_ or sk_live_)
• Check for extra spaces or newlines
• Verify you're using the right key for your environment (test vs live)
• Generate a new key from the dashboard if needed"
          />

          <TroubleshootingItem
            question="Cross-chain payment taking too long"
            answer="Payments from Ethereum/Base/Arbitrum are bridged via Mayan and take 1-3 minutes:
• Ethereum mainnet: 1-3 min (slower due to block times)
• L2s (Base, Arbitrum, Optimism): 1-2 min
• Check the transaction on the source chain explorer
• Mayan bridge status: bridge.mayan.finance"
          />

          <TroubleshootingItem
            question="BuyButton not rendering"
            answer="Make sure you've wrapped your app with SettlrProvider:

import { SettlrProvider, BuyButton } from '@settlr/sdk';

<SettlrProvider config={{ apiKey: '...', merchant: { name: '...' } }}>
  <BuyButton amount={10}>Pay</BuyButton>
</SettlrProvider>"
          />

          <TroubleshootingItem
            question="Can I test without real money?"
            answer="Yes! Use Solana devnet for testing:
• Get devnet SOL from faucet.solana.com
• Get devnet USDC from the test faucet in our demo
• Use sk_test_ API keys - they skip validation
• All checkout flows work identically on devnet"
          />

          <TroubleshootingItem
            question="How do I get support?"
            answer="We're here to help:
• GitHub Issues: github.com/ABFX15/x402-hack-payment
• Discord: Coming soon
• Email: support@settlr.dev"
          />
        </div>
      </section>
    </div>
  );
}

function TroubleshootingItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <span
          className={`text-[#3B82F6] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-white/50 whitespace-pre-line">{answer}</p>
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

  // Simple syntax highlighting
  const highlightCode = (code: string, lang: string) => {
    if (lang === "bash") {
      return code.split("\n").map((line, i) => (
        <div key={i}>
          {line.startsWith("#") ? (
            <span className="text-white/30">{line}</span>
          ) : (
            <>
              <span className="text-white/30">$ </span>
              <span className="text-[#3B82F6]">{line}</span>
            </>
          )}
        </div>
      ));
    }

    if (lang === "json") {
      return code.split("\n").map((line, i) => {
        // Highlight JSON
        const highlighted = line
          .replace(/"([^"]+)":/g, '<span class="text-[#3B82F6]">"$1"</span>:')
          .replace(/: "([^"]+)"/g, ': <span class="text-[#3B82F6]">"$1"</span>')
          .replace(/: (\d+)/g, ': <span class="text-orange-400">$1</span>')
          .replace(
            /: (true|false|null)/g,
            ': <span class="text-[#38bdf8]">$1</span>',
          );
        return (
          <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
        );
      });
    }

    // TypeScript/TSX highlighting
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
      // Handle comments
      if (line.trim().startsWith("//")) {
        return (
          <div key={lineIndex} className="text-white/30">
            {line}
          </div>
        );
      }

      // Process the line character by character for proper highlighting
      const lineChars = line;

      // Simple tokenizer
      const tokens: { type: string; value: string }[] = [];
      let i = 0;
      while (i < lineChars.length) {
        // String (double quotes)
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

        // Comment
        if (lineChars[i] === "/" && lineChars[i + 1] === "/") {
          tokens.push({ type: "comment", value: lineChars.slice(i) });
          break;
        }

        // Word (identifier or keyword)
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

        // Number
        if (/[0-9]/.test(lineChars[i])) {
          let num = "";
          while (i < lineChars.length && /[0-9._]/.test(lineChars[i])) {
            num += lineChars[i++];
          }
          tokens.push({ type: "number", value: num });
          continue;
        }

        // JSX tags
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

        // Operators and punctuation
        tokens.push({ type: "punctuation", value: lineChars[i++] });
      }

      // Render tokens
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
                  <span key={tokenIndex} className="text-[#3B82F6]">
                    {token.value}
                  </span>
                );
              case "comment":
                return (
                  <span key={tokenIndex} className="text-white/30">
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
                  <span key={tokenIndex} className="text-emerald-400">
                    {token.value}
                  </span>
                );
              case "react":
                return (
                  <span key={tokenIndex} className="text-[#3B82F6]">
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
                  <span key={tokenIndex} className="text-[#38bdf8]">
                    {token.value}
                  </span>
                );
              default:
                return (
                  <span key={tokenIndex} className="text-white/70">
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
    <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/70 border-b border-gray-700">
        <span className="text-xs text-white/50 uppercase font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
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
    <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-white/50 text-sm">{description}</p>
    </div>
  );
}
