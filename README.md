# Settlr

[![npm version](https://img.shields.io/npm/v/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Global payout infrastructure for platforms.** Pay anyone, anywhere, with just their email.

One API call sends USDC. Recipient claims it with any Solana wallet. No bank details, no forms, no delays.

```bash
npm install @settlr/sdk
```

```typescript
import { PayoutClient } from "@settlr/sdk";

const payouts = new PayoutClient({ apiKey: "sk_live_xxxxxxxxxxxx" });

const payout = await payouts.create({
  email: "alice@example.com",
  amount: 250.0,
  memo: "March data labeling — 500 tasks",
});

console.log(payout.claimUrl); // https://settlr.dev/claim/...
```

Recipient gets an email, clicks the link, enters a wallet address, and receives USDC on-chain in seconds.

[Live site →](https://settlr.dev) · [Docs →](https://settlr.dev/docs) · [npm →](https://www.npmjs.com/package/@settlr/sdk)

---

## Why Settlr?

| Problem                                     | Settlr Solution                     |
| ------------------------------------------- | ----------------------------------- |
| International wires take 3-5 days           | Instant USDC settlement on Solana   |
| Wire fees are $15-45 per transfer           | 1% flat fee                         |
| Need full bank details for each recipient   | Just an email address               |
| Workers in 100+ countries can't receive USD | USDC to any Solana wallet, anywhere |
| Batch payroll is complex to build           | One API call for up to 500 payouts  |

---

## Two Products

### 🔵 Payout API (Core)

Send money to anyone by email. Built for platforms paying workers, creators, and contractors globally.

```typescript
// Single payout
const payout = await payouts.create({
  email: "worker@example.com",
  amount: 150.0,
  memo: "February earnings",
});

// Batch payouts (up to 500)
const batch = await payouts.createBatch([
  { email: "alice@example.com", amount: 250.0, memo: "March" },
  { email: "bob@example.com", amount: 180.0, memo: "March" },
  { email: "carol@example.com", amount: 320.0, memo: "March" },
]);
```

**How it works:**

1. Platform calls `POST /api/payouts` with email + amount
2. Recipient gets an email with a claim link
3. Recipient opens the link, enters any Solana wallet address
4. USDC is transferred on-chain instantly
5. Platform gets a webhook with the tx signature

### 🟢 Checkout SDK (Add-on)

Accept inbound payments with drop-in React components. Customers pay with email — no wallet setup needed.

```tsx
import { SettlrProvider, BuyButton } from "@settlr/sdk";

<SettlrProvider
  config={{ apiKey: "sk_live_xxx", merchant: { name: "My Store" } }}
>
  <BuyButton
    amount={25.0}
    memo="Order #123"
    onSuccess={(r) => console.log(r.signature)}
  >
    Pay $25.00
  </BuyButton>
</SettlrProvider>;
```

---

## Target Verticals

### AI Data Labeling

Pay thousands of global annotators without collecting bank details. Batch 500 payouts per call.

### Creator Platforms

Collect from fans with Checkout SDK, pay creators with Payout API. One integration for both directions.

### Freelance Marketplaces

Milestone-based payouts to contractors in 180+ countries. No international wire fees.

---

## REST API

### Create Payout

```bash
curl -X POST https://settlr.dev/api/payouts \
  -H "X-API-Key: sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@example.com",
    "amount": 150.00,
    "memo": "February payout"
  }'
```

### Batch Payouts

```bash
curl -X POST https://settlr.dev/api/payouts/batch \
  -H "X-API-Key: sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "payouts": [
      { "email": "alice@example.com", "amount": 250.00, "memo": "March" },
      { "email": "bob@example.com", "amount": 180.00, "memo": "March" }
    ]
  }'
```

### List Payouts

```bash
curl https://settlr.dev/api/payouts?status=claimed&limit=50 \
  -H "X-API-Key: sk_live_xxx"
```

### Get Payout

```bash
curl https://settlr.dev/api/payouts/po_abc123 \
  -H "X-API-Key: sk_live_xxx"
```

---

## SDK

### PayoutClient

```typescript
import { PayoutClient } from "@settlr/sdk";

const payouts = new PayoutClient({
  apiKey: "sk_live_xxxxxxxxxxxx",
  baseUrl: "https://settlr.dev", // optional
});
```

#### `payouts.create(options)`

```typescript
const payout = await payouts.create({
  email: "alice@example.com", // required
  amount: 250.0, // required (USDC)
  memo: "March earnings", // optional
  metadata: { invoiceId: "42" }, // optional
});
// Returns: { id, email, amount, status, claimUrl, expiresAt, ... }
```

#### `payouts.createBatch(payouts)`

```typescript
const batch = await payouts.createBatch([
  { email: "alice@example.com", amount: 250.0, memo: "March" },
  { email: "bob@example.com", amount: 180.0, memo: "March" },
]);
// Returns: { id, total, count, payouts: [...] }
```

#### `payouts.get(id)` / `payouts.list(options?)`

```typescript
const payout = await payouts.get("po_abc123");
const result = await payouts.list({ status: "claimed", limit: 50 });
```

### Webhooks

```typescript
import { createWebhookHandler } from "@settlr/sdk";

export const POST = createWebhookHandler({
  secret: process.env.SETTLR_WEBHOOK_SECRET!,
  handlers: {
    "payout.claimed": async (event) => {
      console.log("Payout claimed!", event.payment.id);
    },
    "payment.completed": async (event) => {
      await fulfillOrder(event.payment.orderId);
    },
  },
});
```

| Event                  | Description                                  |
| ---------------------- | -------------------------------------------- |
| `payout.created`       | Payout created, email sent                   |
| `payout.claimed`       | Recipient claimed, USDC transferred on-chain |
| `payout.expired`       | Claim link expired (7 days)                  |
| `payout.failed`        | On-chain transfer failed                     |
| `payment.completed`    | Checkout payment confirmed                   |
| `subscription.renewed` | Subscription charge succeeded                |

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
| Cross-chain       | Mayan (EVM → Solana)     |
| Embedded wallets  | Privy                    |
| Treasury security | Squads multisig          |

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
│       ├── payouts.ts             # PayoutClient — create, batch, get, list
│       ├── client.ts              # Settlr checkout client
│       ├── subscriptions.ts       # SubscriptionClient
│       ├── one-click.ts           # OneClickClient
│       ├── components.tsx         # BuyButton, CheckoutWidget, PaymentModal
│       ├── webhooks.ts            # Webhook handler + verification
│       └── privacy.ts             # MagicBlock PER private payments
├── app/frontend/                  # Next.js app (settlr.dev)
│   └── src/
│       ├── app/api/payouts/       # Payout API (create, batch, claim, get)
│       ├── app/claim/[token]/     # Recipient claim page
│       ├── app/checkout/          # Hosted checkout
│       ├── lib/db.ts              # Database layer (Supabase + in-memory)
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
```

## API Keys

| Key Type | Prefix     | Use Case    |
| -------- | ---------- | ----------- |
| Live     | `sk_live_` | Production  |
| Test     | `sk_test_` | Development |

| Tier       | Rate Limit | Fee  |
| ---------- | ---------- | ---- |
| Free       | 60/min     | 2%   |
| Pro        | 300/min    | 1.5% |
| Enterprise | 1000/min   | 1%   |

Get yours at [settlr.dev/onboarding](https://settlr.dev/onboarding).

## License

ISC

## Links

- **Website:** [settlr.dev](https://settlr.dev)
- **npm:** [@settlr/sdk](https://www.npmjs.com/package/@settlr/sdk)
- **Docs:** [settlr.dev/docs](https://settlr.dev/docs)
- **Twitter:** [@SettlrP](https://twitter.com/SettlrP)
- **GitHub:** [@ABFX15](https://github.com/ABFX15)
