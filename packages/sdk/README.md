# @settlr/sdk

[![npm version](https://img.shields.io/npm/v/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Global payout infrastructure for platforms.** Pay anyone, anywhere, with just their email. One API call sends USDC — recipient claims it with any Solana wallet.

🌐 [settlr.dev](https://settlr.dev) · 📖 [Docs](https://settlr.dev/docs) · 💻 [GitHub](https://github.com/ABFX15/x402-hack-payment)

## Install

```bash
npm install @settlr/sdk
```

## Payout API — Send Money by Email

The core product. Send USDC to anyone with just their email address. No bank details, no forms, no delays.

### Quick Start

```typescript
import { PayoutClient } from "@settlr/sdk";

const payouts = new PayoutClient({ apiKey: "sk_live_xxxxxxxxxxxx" });

// Send a payout — recipient gets an email with a claim link
const payout = await payouts.create({
  email: "alice@example.com",
  amount: 250.0,
  memo: "March data labeling — 500 tasks",
});

console.log(payout.id); // "po_abc123"
console.log(payout.status); // "sent"
console.log(payout.claimUrl); // "https://settlr.dev/claim/..."
```

### Batch Payouts

Send up to 500 payouts in a single call:

```typescript
const batch = await payouts.createBatch([
  { email: "alice@example.com", amount: 250.0, memo: "March" },
  { email: "bob@example.com", amount: 180.0, memo: "March" },
  { email: "carol@example.com", amount: 320.0, memo: "March" },
]);

console.log(batch.total); // 750.00
console.log(batch.count); // 3
```

### Check Status

```typescript
const payout = await payouts.get("po_abc123");
console.log(payout.status); // "claimed"
console.log(payout.claimedAt); // "2026-02-15T14:30:00Z"
console.log(payout.txSignature); // "5KtP..."
```

### List Payouts

```typescript
const result = await payouts.list({ status: "claimed", limit: 50 });
result.data.forEach((p) => console.log(p.email, p.amount, p.status));
```

### How It Works

```
Platform calls POST /api/payouts
        ↓
Recipient gets email with claim link
        ↓
Recipient enters any Solana wallet address
        ↓
USDC transferred on-chain instantly
        ↓
Platform gets webhook with tx signature
```

---

## Checkout SDK — Accept Inbound Payments

Drop-in React components for accepting USDC payments. Customers pay with email — no wallet setup needed.

### BuyButton

```tsx
import { SettlrProvider, BuyButton } from "@settlr/sdk";

<SettlrProvider
  config={{ apiKey: "sk_live_xxx", merchant: { name: "My Store" } }}
>
  <BuyButton
    amount={49.99}
    memo="Premium Game Bundle"
    onSuccess={(result) => console.log("Paid!", result.signature)}
  >
    Buy Now — $49.99
  </BuyButton>
</SettlrProvider>;
```

### CheckoutWidget

```tsx
import { CheckoutWidget } from "@settlr/sdk";

<CheckoutWidget
  amount={149.99}
  productName="Annual Subscription"
  productDescription="Full access to all premium features"
  onSuccess={(result) => router.push("/success")}
  theme="dark"
/>;
```

### Checkout Session (Server-Side)

```typescript
import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({
  apiKey: "sk_live_xxxxxxxxxxxx",
  merchant: { name: "My Store" },
});

const payment = await settlr.createPayment({
  amount: 29.99,
  memo: "Premium subscription",
  successUrl: "https://mystore.com/success",
});

// Redirect to hosted checkout
window.location.href = payment.checkoutUrl;
```

### React Hook

```tsx
import { SettlrProvider, useSettlr } from "@settlr/sdk";

function CheckoutButton() {
  const { getCheckoutUrl } = useSettlr();
  const url = getCheckoutUrl({ amount: 29.99, memo: "Premium Pack" });
  return <a href={url}>Pay $29.99</a>;
}
```

---

## Webhooks

Handle payout and payment events:

```typescript
import { createWebhookHandler } from "@settlr/sdk";

// Next.js App Router
export const POST = createWebhookHandler({
  secret: process.env.SETTLR_WEBHOOK_SECRET!,
  handlers: {
    "payout.claimed": async (event) => {
      console.log("Payout claimed:", event.payment.id);
      await markPaid(event.payment.id);
    },
    "payout.expired": async (event) => {
      await resendPayout(event.payment.id);
    },
    "payment.completed": async (event) => {
      await fulfillOrder(event.payment.orderId);
    },
  },
});
```

### Events

| Event                    | Description                                   |
| ------------------------ | --------------------------------------------- |
| `payout.created`         | Payout created, claim email sent              |
| `payout.sent`            | Email delivered                               |
| `payout.claimed`         | Recipient claimed — USDC transferred on-chain |
| `payout.expired`         | Claim link expired (7 days)                   |
| `payout.failed`          | On-chain transfer failed                      |
| `payment.created`        | Checkout payment link created                 |
| `payment.completed`      | Payment confirmed on-chain                    |
| `payment.failed`         | Payment failed                                |
| `payment.refunded`       | Payment refunded                              |
| `subscription.created`   | Subscription started                          |
| `subscription.renewed`   | Subscription charge succeeded                 |
| `subscription.cancelled` | Subscription cancelled                        |

### Manual Verification

```typescript
import { verifyWebhookSignature } from "@settlr/sdk";

const isValid = verifyWebhookSignature(body, signature, secret);
```

---

## Subscriptions

Recurring USDC payments:

```typescript
import { createSubscriptionClient } from "@settlr/sdk";

const subs = createSubscriptionClient({ apiKey: "sk_live_xxx" });

// Create a plan
const plan = await subs.createPlan({
  name: "Pro",
  amount: 29.99,
  interval: "monthly",
});

// Subscribe a customer
const subscription = await subs.subscribe({
  planId: plan.id,
  customerWallet: "7xKX...",
  customerEmail: "user@example.com",
});
```

---

## One-Click Payments

Pre-approved spending for returning customers:

```typescript
import { createOneClickClient } from "@settlr/sdk";

const oneClick = createOneClickClient();

// Customer approves once
await oneClick.approve({
  customerWallet: "...",
  merchantWallet: "...",
  spendingLimit: 100,
});

// Merchant charges later — no popups
const result = await oneClick.charge({
  customerWallet: "...",
  merchantWallet: "...",
  amount: 25,
});
```

---

## API Keys

| Type | Prefix     | Use         |
| ---- | ---------- | ----------- |
| Live | `sk_live_` | Production  |
| Test | `sk_test_` | Development |

| Tier       | Rate Limit | Fee  |
| ---------- | ---------- | ---- |
| Free       | 60/min     | 2%   |
| Pro        | 300/min    | 1.5% |
| Enterprise | 1000/min   | 1%   |

Get yours at [settlr.dev/onboarding](https://settlr.dev/onboarding).

---

## Multichain Support

Checkout accepts USDC from any major EVM chain — automatically bridged to Solana via Mayan:

| Chain    | Bridge Time | Gas Cost       |
| -------- | ----------- | -------------- |
| Solana   | Instant     | Free (gasless) |
| Base     | ~1-2 min    | ~$0.01         |
| Arbitrum | ~1-2 min    | ~$0.01         |
| Ethereum | ~1-3 min    | ~$1-5          |

---

## Full API Reference

### PayoutClient

| Method                 | Description               |
| ---------------------- | ------------------------- |
| `create(options)`      | Send payout by email      |
| `createBatch(payouts)` | Batch send (up to 500)    |
| `get(id)`              | Get payout by ID          |
| `list(options?)`       | List payouts with filters |

### Settlr (Checkout)

| Method                      | Description            |
| --------------------------- | ---------------------- |
| `createPayment(options)`    | Create payment link    |
| `buildTransaction(options)` | Build tx for signing   |
| `pay(options)`              | Execute direct payment |
| `getPaymentStatus(sig)`     | Check payment status   |
| `getMerchantBalance()`      | Get USDC balance       |

### Utilities

```typescript
import { formatUSDC, parseUSDC, shortenAddress } from "@settlr/sdk";

formatUSDC(29990000n); // "29.99"
parseUSDC(29.99); // 29990000n
shortenAddress("ABC...XYZ"); // "ABC...XYZ"
```

---

## License

MIT
