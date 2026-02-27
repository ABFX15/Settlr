# Settlr

[![npm version](https://img.shields.io/npm/v/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**The settlement layer for restricted commerce.** Non-custodial B2B stablecoin rails for industries abandoned by traditional finance.

Cannabis operators, adult content platforms, and other high-risk verticals lose 8–12% to predatory processors — or can't get banked at all. Settlr replaces that with a 1% flat-fee, non-custodial settlement rail on Solana with instant finality and a cryptographic audit trail.

```bash
npm install @settlr/sdk
```

```typescript
import { SettlrClient } from "@settlr/sdk";

const settlr = new SettlrClient({ apiKey: "sk_live_xxxxxxxxxxxx" });

const invoice = await settlr.createInvoice({
  to: "emerald-distribution@example.com",
  amount: 45000.0,
  memo: "INV-2026-0891 — Bulk Flower + Equipment",
  complianceLevel: "genius-act",
});

console.log(invoice.paymentUrl); // https://settlr.dev/invoice/...
```

Recipient receives a cryptographically-secured invoice, pays in USDC/PYUSD, and settlement finalizes in under 5 seconds. On-chain receipt generated automatically for auditors.

[Live Demo →](https://settlr.dev/demo) · [Docs →](https://settlr.dev/docs) · [npm →](https://www.npmjs.com/package/@settlr/sdk)

---

## Why Settlr?

| The Problem                                          | The Settlr Rail                                 |
| ---------------------------------------------------- | ----------------------------------------------- |
| Banks close your account for being "high-risk"       | Non-custodial — no bank can freeze your funds   |
| High-risk processors charge 8–12% + rolling reserves | 1% flat fee, no reserves, no hidden charges     |
| Wire transfers take 3–5 days + manual review         | T+0 settlement — finality in under 5 seconds    |
| Cash-heavy operations fail compliance audits         | Immutable on-chain audit trail for every dollar |
| Payments get clawed back or reversed                 | Settled means settled — cryptographic finality  |

---

## Two Products

### Settlement Rail (Core)

Non-custodial B2B payment rail for invoices, supplier payments, and distributor settlements. Built for operators who need money to actually arrive.

```typescript
// Create a settlement invoice
const invoice = await settlr.createInvoice({
  to: "distributor@example.com",
  amount: 45000.0,
  memo: "Q1 bulk order — License #C12-0004782-LIC",
  complianceLevel: "genius-act",
});

// Create a shareable payment link
const link = await settlr.createPaymentLink({
  amount: 12500.0,
  memo: "Equipment deposit",
  expiresIn: "7d",
});
```

**How it works:**

1. Operator generates a cryptographically-secured invoice or payment link
2. Counterparty pays in USDC or PYUSD — no wallet setup required
3. Settlement finalizes on-chain in under 5 seconds
4. Both parties get an immutable receipt with compliance stamps (KYB, AML, GENIUS Act)
5. Operator receives a webhook with the on-chain transaction signature

### Multisig Vaults (Add-on)

Treasury management with Squads multisig. Require multiple signers for large settlements, set spending limits, and maintain institutional-grade custody without a bank.

---

## Target Verticals

### Cannabis & Wholesalers

B2B settlements for growers, distributors, dispensaries, and equipment suppliers. Replace cash drops and 8% processors with a 1% digital rail that produces audit-ready receipts.

### Adult Content Platforms

Creator payouts and platform settlements without the constant threat of payment processor deplatforming. Non-custodial means no middleman can cut you off.

---

## Integrations

### LeafLink (Cannabis B2B Wholesale)

Automated settlement for LeafLink purchase orders. When a PO is created on LeafLink, Settlr generates a USDC payment link, emails it to the buyer, and syncs the on-chain proof back to the LeafLink order — no manual invoicing or net-30/60 float.

**Lifecycle:**

```
LeafLink PO → Settlr Invoice → Payment link emailed → Buyer pays USDC → Proof synced to LeafLink
```

**API Endpoints:**

| Endpoint                              | Method   | Description                            |
| ------------------------------------- | -------- | -------------------------------------- |
| `/api/integrations/leaflink/webhook`  | POST     | Receives LeafLink order webhooks       |
| `/api/integrations/leaflink/callback` | POST     | Internal callback when invoice is paid |
| `/api/integrations/leaflink/config`   | GET/POST | Merchant integration settings          |
| `/api/integrations/leaflink/syncs`    | GET      | List sync records with status filter   |
| `/api/integrations/leaflink/retry`    | POST     | Retry failed LeafLink API syncs        |

**Setup:**

1. Add env vars to `.env.local`:
   ```env
   LEAFLINK_CALLBACK_SECRET=your_random_secret
   ```
2. Run the Supabase migration:
   ```bash
   # Via SQL Editor: paste contents of supabase/migrations/20260227_leaflink_integration.sql
   # Or via CLI:
   cd app/frontend && npx supabase db push
   ```
3. Configure via API:
   ```bash
   curl -X POST https://settlr.dev/api/integrations/leaflink/config \
     -H "Content-Type: application/json" \
     -d '{ "merchant_id": "your_id", "leaflink_api_key": "your_ll_key" }'
   ```
4. Set the returned webhook URL in your LeafLink account settings

**Features:**

- HMAC-SHA256 webhook signature verification
- METRC tag extraction and inclusion in compliance memos
- Automatic retry for failed sync-backs
- In-memory fallback when Supabase is not configured
- Branded HTML payment emails via Resend

---

## REST API

### Create Invoice

```bash
curl -X POST https://settlr.dev/api/invoices \
  -H "X-API-Key: sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "distributor@example.com",
    "amount": 45000.00,
    "memo": "INV-2026-0891 — Bulk Flower",
    "complianceLevel": "genius-act"
  }'
```

### Create Payment Link

```bash
curl -X POST https://settlr.dev/api/payment-links \
  -H "X-API-Key: sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 12500.00,
    "memo": "Equipment deposit",
    "expiresIn": "7d"
  }'
```

### List Settlements

```bash
curl https://settlr.dev/api/settlements?status=completed&limit=50 \
  -H "X-API-Key: sk_live_xxx"
```

### Get Settlement Receipt

```bash
curl https://settlr.dev/api/settlements/stl_abc123 \
  -H "X-API-Key: sk_live_xxx"
```

---

## SDK

### SettlrClient

```typescript
import { SettlrClient } from "@settlr/sdk";

const settlr = new SettlrClient({
  apiKey: "sk_live_xxxxxxxxxxxx",
  baseUrl: "https://settlr.dev", // optional
});
```

#### `settlr.createInvoice(options)`

```typescript
const invoice = await settlr.createInvoice({
  to: "distributor@example.com", // required
  amount: 45000.0, // required (USDC)
  memo: "Q1 Bulk Order", // optional
  complianceLevel: "genius-act", // optional
  metadata: { poNumber: "PO-891" }, // optional
});
// Returns: { id, paymentUrl, amount, status, expiresAt, ... }
```

#### `settlr.createPaymentLink(options)`

```typescript
const link = await settlr.createPaymentLink({
  amount: 12500.0,
  memo: "Equipment deposit",
  expiresIn: "7d",
});
// Returns: { id, url, amount, expiresAt, ... }
```

### Webhooks

```typescript
import { createWebhookHandler } from "@settlr/sdk";

export const POST = createWebhookHandler({
  secret: process.env.SETTLR_WEBHOOK_SECRET!,
  handlers: {
    "settlement.completed": async (event) => {
      console.log("Settlement finalized!", event.settlement.id);
      await updateBooks(event.settlement);
    },
    "invoice.paid": async (event) => {
      await markInvoicePaid(event.invoice.id);
    },
  },
});
```

| Event                  | Description                                   |
| ---------------------- | --------------------------------------------- |
| `invoice.created`      | Invoice generated and sent                    |
| `invoice.paid`         | Recipient paid, settlement confirmed on-chain |
| `invoice.expired`      | Invoice expired (configurable)                |
| `settlement.completed` | On-chain settlement finalized                 |
| `settlement.failed`    | Settlement failed (insufficient funds, etc.)  |

---

## Tech Stack

| Layer             | Technology               |
| ----------------- | ------------------------ |
| Settlement        | Solana, USDC (SPL Token) |
| Smart contract    | Anchor v0.31.1           |
| Backend           | Next.js 16 (App Router)  |
| Database          | Supabase                 |
| Email             | Resend                   |
| Gasless           | Kora (Solana Foundation) |
| Embedded wallets  | Privy                    |
| Treasury security | Squads multisig          |
| Privacy           | MagicBlock PER (TEE)     |
| Risk screening    | Range Security           |

### On-Chain Program

```
Program ID: 339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5
```

**Instructions:** `initialize_platform` · `register_merchant` · `process_payment` · `process_payout` · `refund_payment` · `update_platform_fee` · `claim_platform_fees`

---

## Project Structure

```
x402-hack-payment/
├── programs/x402-hack-payment/    # Solana program (Anchor)
│   └── src/
│       ├── lib.rs                 # 7 instructions
│       ├── instructions/          # payment, payout, refund, merchant, platform
│       ├── state/                 # Platform, Merchant, Payment, Customer
│       └── errors.rs
├── packages/sdk/                  # @settlr/sdk (published on npm)
│   └── src/
│       ├── client.ts              # SettlrClient — invoices, payment links, settlements
│       ├── components.tsx         # React components
│       ├── webhooks.ts            # Webhook handler + verification
│       └── privacy.ts            # MagicBlock PER private settlements
├── app/frontend/                  # Next.js app (settlr.dev)
│   └── src/
│       ├── app/api/               # API routes (invoices, settlements, webhooks)
│       ├── app/api/integrations/  # Third-party integrations
│       │   └── leaflink/          # LeafLink cannabis wholesale integration
│       ├── app/demo/              # Interactive institutional demo
│       ├── app/create/            # Payment link creation
│       ├── app/invoice/[token]/   # Invoice settlement page
│       ├── lib/db.ts              # Database layer (Supabase + in-memory)
│       ├── lib/leaflink/          # LeafLink API client, types, DB layer
│       └── lib/email.ts           # Transactional email (Resend)
└── tests/                         # Anchor program tests
```

## Getting Started

```bash
git clone https://github.com/ABFX15/x402-hack-payment.git
cd x402-hack-payment

npm install                   # Anchor deps
cd app/frontend && npm install # Frontend deps

anchor build                  # Build Solana program
cd app/frontend && npm run dev # Start dev server → localhost:3000
```

### Environment Variables (`app/frontend/.env.local`)

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5
FEE_PAYER_SECRET_KEY=your_fee_payer_keypair
RESEND_API_KEY=re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://settlr.dev
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# LeafLink Integration (optional)
LEAFLINK_CALLBACK_SECRET=your_random_secret
LEAFLINK_RETRY_SECRET=your_cron_secret
```

## Compliance

Settlr is built for the 2026 regulatory landscape:

- **GENIUS Act (2025)** — Full stablecoin payment compliance
- **BSA/AML** — On-chain audit trails satisfy reporting requirements
- **KYB Verification** — All counterparties verified before settlement
- **Non-Custodial** — Settlr never holds your funds; no money transmitter risk

---

## Fee Structure

| Tier       | Rate Limit | Fee    |
| ---------- | ---------- | ------ |
| Standard   | 60/min     | 1%     |
| Growth     | 300/min    | 1%     |
| Enterprise | 1000/min   | Custom |

Apply at [settlr.dev/waitlist](https://settlr.dev/waitlist).

## License

ISC

## Links

- **Website:** [settlr.dev](https://settlr.dev)
- **npm:** [@settlr/sdk](https://www.npmjs.com/package/@settlr/sdk)
- **Docs:** [settlr.dev/docs](https://settlr.dev/docs)
- **Twitter:** [@SettlrP](https://twitter.com/SettlrP)
- **GitHub:** [@ABFX15](https://github.com/ABFX15)
