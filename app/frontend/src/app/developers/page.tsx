"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  Code2,
  Webhook,
  Plug,
  Github,
  ArrowRight,
  Rocket,
  Send,
} from "lucide-react";

/**
 * /developers, developer-facing landing page.
 *
 * Separates the developer persona from the operator persona (/docs).
 * Operators don't need to see REST endpoints; developers don't need to
 * see "how to send an invoice from the dashboard".
 *
 * The actual API + Webhooks reference content still lives in /docs under
 * the `?tab=api` and `?tab=webhooks` deep links, this page links into
 * those tabs so we don't maintain two copies.
 */
export default function DevelopersPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-[#212121] pt-24 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* Hero */}
          <div className="mb-12">
            <p className="text-sm font-semibold text-[#34c759] uppercase tracking-[0.15em] mb-3">
              For developers
            </p>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              Build on Offbank
            </h1>
            <p className="text-xl text-[#5c5c5c] leading-relaxed">
              REST API, webhooks, and SDK references for integrating Offbank
              settlement into your own product. If you're an operator looking to
              send invoices,{" "}
              <Link
                href="/docs"
                className="text-[#34c759] font-medium hover:underline"
              >
                start here instead
              </Link>
              .
            </p>
          </div>

          {/* Quick links */}
          <div className="grid gap-4 sm:grid-cols-2 mb-12">
            <Link
              href="/docs?tab=api"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Code2 className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                REST API
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Create invoices, fetch payments, manage merchants. Full
                reference with curl + TypeScript examples.
              </p>
            </Link>

            <Link
              href="/docs?tab=webhooks"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Webhook className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Webhooks
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Subscribe to settlement events. HMAC-signed deliveries,
                automatic retries, idempotency keys.
              </p>
            </Link>

            <Link
              href="/docs?tab=integrations"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Plug className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Integrations
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                LeafLink, Solana wallets, x402 protocol, Squads multisig.
              </p>
            </Link>

            <Link
              href="/products/instant-cashout"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Send className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                Payouts &amp; Cashouts
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Pay anyone in USDC by email or wallet — affiliate commissions,
                player cashouts, supplier runs. Single or batch, instant.
              </p>
            </Link>

            <a
              href="https://github.com/ABFX15/x402-hack-payment"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-[#d3d3d3] p-6 hover:border-[#34c759] hover:bg-[#34c759]/5 transition-colors"
            >
              <Github className="h-6 w-6 text-[#34c759] mb-3" />
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                GitHub
                <ArrowRight className="h-4 w-4 text-[#8a8a8a] group-hover:text-[#34c759] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-[#5c5c5c]">
                Source for the on-chain program, SDK, and reference frontend.
              </p>
            </a>
          </div>

          {/* Quickstart strip */}
          <div className="rounded-xl bg-[#0a0a0a] text-white p-8">
            <div className="flex items-center gap-2 text-sm text-[#34c759] mb-3">
              <Rocket className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-wider">
                30-second quickstart
              </span>
            </div>
            <pre className="overflow-x-auto text-sm font-mono text-[#d3d3d3] leading-relaxed">
              {`curl https://offbankpay.com/api/invoices \\
  -H "Authorization: Bearer \$OFFBANK_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 47500,
    "currency": "USDC",
    "buyerEmail": "buyer@example.com",
    "memo": "Wholesale order #4421"
  }'`}
            </pre>
            <p className="mt-4 text-sm text-[#8a8a8a]">
              Returns a payment link your buyer can pay with any Solana wallet.
              Settlement webhook fires once the on-chain transaction confirms.
            </p>
          </div>

          {/* Payouts quickstart */}
          <div className="mt-6 rounded-xl bg-[#0a0a0a] text-white p-8">
            <div className="flex items-center gap-2 text-sm text-[#34c759] mb-3">
              <Send className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-wider">
                Pay out in one call
              </span>
            </div>
            <pre className="overflow-x-auto text-sm font-mono text-[#d3d3d3] leading-relaxed">
              {`import { PayoutClient } from "@offbank/sdk";

const payouts = new PayoutClient({ apiKey: "sk_live_..." });

// Affiliate commission, player cashout, supplier payment — same call
await payouts.create({
  email: "alice@example.com",
  amount: 250.0,
  memo: "March affiliate commission",
});

// Or pay a whole run at once
await payouts.createBatch([
  { email: "alice@example.com", amount: 250.0 },
  { email: "bob@example.com",   amount: 180.0 },
]);`}
            </pre>
            <p className="mt-4 text-sm text-[#8a8a8a]">
              Each recipient gets a claim link (and email) and claims with any
              Solana wallet — or one we provision on first claim. Your webhook
              fires when it settles. No minimum amounts, no batch windows.
            </p>
          </div>

          {/* Footer link */}
          <div className="mt-10 text-sm text-[#8a8a8a]">
            Need an API key? Generate one in{" "}
            <Link
              href="/dashboard/settings"
              className="text-[#34c759] font-medium hover:underline"
            >
              Settings → API keys
            </Link>{" "}
            once your merchant account is set up. Prefer no code? Use{" "}
            <Link
              href="/dashboard/affiliates"
              className="text-[#34c759] font-medium hover:underline"
            >
              Affiliate Payouts
            </Link>{" "}
            in the dashboard.
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
