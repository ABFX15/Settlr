# @settlr/sdk

[![npm version](https://img.shields.io/npm/v/@settlr/sdk.svg)](https://www.npmjs.com/package/@settlr/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **USDC settlement SDK for Solana.** Create invoices, accept payments, and handle webhooks. Built for cannabis B2B and other restricted-commerce verticals.

```bash
npm install @settlr/sdk
```

---

## Core Client

```typescript
import { Settlr } from "@settlr/sdk";

const settlr = new Settlr({
  apiKey: "sk_live_xxxxxxxxxxxx",
  merchant: { name: "My Company", walletAddress: "7xKX..." },
});
```

### Create a Payment

```typescript
const payment = await settlr.createPayment({
  amount: 45000.00,
  memo: "INV-2026-0891 — Bulk Flower + Equipment",
  successUrl: "https://example.com/success",
});

// Redirect buyer to hosted checkout
window.location.href = payment.checkoutUrl;
```

### Build a Transaction (Low-Level)

```typescript
const tx = await settlr.buildTransaction({
  amount: 12500.00,
  customerWallet: "DjLF...",
});

// Sign with customer's wallet and submit
const signature = await wallet.signAndSendTransaction(tx);
```

### Check Payment Status

```typescript
const status = await settlr.getPaymentStatus("5KtP...");
console.log(status); // "completed"
```

---

## React Components

### BuyButton

```tsx
import { SettlrProvider, BuyButton } from "@settlr/sdk";

<SettlrProvider config={{ apiKey: "sk_live_xxx", merchant: { name: "My Store" } }}>
  <BuyButton
    amount={49.99}
    memo="Premium Bundle"
    onSuccess={(result) => console.log("Paid!", result.signature)}
  >
    Pay $49.99
  </BuyButton>
</SettlrProvider>
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
/>
```

### React Hook

```tsx
import { useSettlr } from "@settlr/sdk";

function PayButton() {
  const { getCheckoutUrl } = useSettlr();
  const url = getCheckoutUrl({ amount: 29.99, memo: "Premium Pack" });
  return <a href={url}>Pay $29.99</a>;
}
```

---

## Webhooks

```typescript
import { createWebhookHandler } from "@settlr/sdk";

// Drop into a Next.js App Router route.ts
export const POST = createWebhookHandler({
  secret: process.env.SETTLR_WEBHOOK_SECRET!,
  handlers: {
    "payment.completed": async (event) => {
      await fulfillOrder(event.payment.orderId);
    },
    "payout.claimed": async (event) => {
      await markPaid(event.payment.id);
    },
    "invoice.paid": async (event) => {
      await markInvoicePaid(event.invoice.id);
    },
  },
});
```

### Manual Verification

```typescript
import { verifyWebhookSignature } from "@settlr/sdk";

const isValid = verifyWebhookSignature(body, signature, secret);
```

### Webhook Events

| Event                | Description                                   |
| -------------------- | --------------------------------------------- |
| `payment.completed`  | Payment confirmed on-chain                    |
| `payment.failed`     | Payment failed                                |
| `payment.refunded`   | Payment refunded                              |
| `invoice.created`    | Invoice generated and sent                    |
| `invoice.paid`       | Invoice paid, settlement confirmed            |
| `invoice.expired`    | Invoice expired                               |
| `payout.created`     | Payout created, claim email sent              |
| `payout.claimed`     | Recipient claimed — USDC on-chain             |
| `payout.expired`     | Claim link expired                            |

---

## Payouts

Send USDC to anyone by email:

```typescript
import { PayoutClient } from "@settlr/sdk";

const payouts = new PayoutClient({ apiKey: "sk_live_xxx" });

// Single payout
const payout = await payouts.create({
  email: "alice@example.com",
  amount: 250.00,
  memo: "March data labeling — 500 tasks",
});

console.log(payout.claimUrl); // Recipient gets email with claim link

// Batch payouts (up to 500)
const batch = await payouts.createBatch([
  { email: "alice@example.com", amount: 250.0, memo: "March" },
  { email: "bob@example.com", amount: 180.0, memo: "March" },
]);
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

## Utilities

```typescript
import { formatUSDC, parseUSDC, shortenAddress } from "@settlr/sdk";

formatUSDC(29990000n);              // "29.99"
parseUSDC(29.99);                   // 29990000n
shortenAddress("ABC...XYZ");        // "ABC...XYZ"
```

---

## API Keys

| Type | Prefix     | Use         |
| ---- | ---------- | ----------- |
| Live | `sk_live_` | Production  |
| Test | `sk_test_` | Development |

Get yours at [settlr.dev/onboarding](https://settlr.dev/onboarding).

---

## Full API Reference

### Settlr (Core Client)

| Method                      | Description            |
| --------------------------- | ---------------------- |
| `createPayment(options)`    | Create payment link    |
| `buildTransaction(options)` | Build tx for signing   |
| `pay(options)`              | Execute direct payment |
| `getPaymentStatus(sig)`     | Check payment status   |
| `getMerchantBalance()`      | Get USDC balance       |

### PayoutClient

| Method                 | Description               |
| ---------------------- | ------------------------- |
| `create(options)`      | Send payout by email      |
| `createBatch(payouts)` | Batch send (up to 500)    |
| `get(id)`              | Get payout by ID          |
| `list(options?)`       | List payouts with filters |

### OneClickClient

| Method               | Description                  |
| -------------------- | ---------------------------- |
| `approve(options)`   | Customer pre-approves spend  |
| `charge(options)`    | Merchant charges (no popup)  |
| `getApproval(opts)`  | Check approval status        |
| `revoke(opts)`       | Revoke approval              |

---

## Also Exports

These modules are available but targeted at specific use cases:

- **`SubscriptionClient`** — Recurring USDC payments (plans, subscriptions, renewals)
- **Privacy (MagicBlock PER)** — Private payments via Trusted Execution Environments (TEE)
- **Mobile** — `generateCheckoutUrl()`, `generateDeepLinkCheckout()` for Unity/React Native

See [ARCHITECTURE.md](../../ARCHITECTURE.md) for full technical documentation.

---

## License

MIT
