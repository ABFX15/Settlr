# Offbank

**Stablecoin settlement infrastructure for cannabis.** Non-custodial USDC rails on Solana that replace cash drops and 8% high-risk processors with 1% instant settlement and a cryptographic audit trail.

[offbankpay.com](https://offbankpay.com) · [Waitlist](https://offbankpay.com/waitlist) · [Compliance](https://offbankpay.com/compliance) · [GitHub](https://github.com/ABFX15)

---

## The Problem

Cannabis operators move **$34B+ annually** through cash or predatory payment processors:

| Today                                                | With Offbank                                    |
| ---------------------------------------------------- | ----------------------------------------------- |
| Banks close your account for being "high-risk"       | Non-custodial — no bank can freeze your funds   |
| High-risk processors charge 8–12% + rolling reserves | 1% flat fee, no reserves, no hidden charges     |
| Wire transfers take 3–5 days + manual reconciliation | T+0 settlement — finality in under 5 seconds    |
| Cash-heavy operations fail compliance audits         | Immutable on-chain audit trail for every dollar |
| Net-30/60 PO terms tie up working capital            | Instant payment on order creation               |

---

## How It Works

### 1. Direct Invoices & Payment Links

The core product. Settlements for B2B cannabis flows — wholesale orders, equipment purchases, consulting fees, supplier payments.

```bash
# Create an invoice
curl -X POST https://offbankpay.com/api/invoices \
  -H "X-API-Key: sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "distributor@example.com",
    "amount": 45000.00,
    "memo": "INV-2026-0891 — Bulk Flower + Equipment",
    "complianceLevel": "genius-act"
  }'

# Create a shareable payment link
curl -X POST https://offbankpay.com/api/payment-links \
  -H "X-API-Key: sk_live_xxx" \
  -d '{ "amount": 12500.00, "memo": "Equipment deposit", "expiresIn": "7d" }'
```

**What happens under the hood:**

1. Operator creates an invoice in the dashboard or via API
2. Offbank generates a compliance-stamped record (license numbers, PO reference, optional METRC tags)
3. Payment link is emailed to the buyer via Resend
4. Buyer pays USDC on Solana — settlement in <5 seconds
5. Operator sees the on-chain settlement confirmation in the dashboard

### 2. Solana Pay Links (Blinks)

Every invoice automatically generates a [Solana Actions](https://solana.com/docs/advanced/actions) URL — a universal payment link that works in any wallet, browser, or social platform that supports Blinks.

```
Invoice created
        |
Blink URL generated automatically
        |
Share via Twitter/X, Discord, Telegram, SMS — anywhere
        |
Recipient clicks → wallet prompts unsigned USDC transfer
        |
One signature → settlement in <5 seconds
```

**How it works:**

- `GET /api/actions/pay?invoice=<token>` returns a Solana Action card (title, icon, amount, merchant name)
- `POST /api/actions/pay?invoice=<token>` accepts the payer's wallet address and returns an unsigned USDC transfer transaction
- The payer signs in their wallet — no account needed, no login required
- Settlement memo encodes `offbank:<invoiceNumber>:<id>` for on-chain traceability
- Works with [dial.to](https://dial.to) for rich link previews on Twitter/X

Blink URLs are displayed in the dashboard after invoice creation and can be copied from the invoice list.

### 3. LeafLink Integration (Beta)

For cannabis wholesalers using [LeafLink](https://www.leaflink.com), Offbank plugs directly into your existing PO workflow — no manual invoice creation.

```
LeafLink PO created
        |
Webhook → Offbank generates USDC payment link automatically
        |
Buyer receives email with payment link
        |
Buyer pays in USDC (Phantom, Solflare, or Privy embedded wallet)
        |
On-chain settlement → status synced back to LeafLink order
```

**Setup (Settings → LeafLink Integration):**

1. Toggle on “Enable LeafLink sync”
2. Paste your LeafLink API key + Company ID
3. Copy the generated webhook URL into LeafLink → Settings → Integrations → Webhooks
4. Optionally set an HMAC signing secret

**LeafLink API Endpoints:**

| Endpoint                              | Method   | Purpose                                |
| ------------------------------------- | -------- | -------------------------------------- |
| `/api/integrations/leaflink/webhook`  | POST     | Receives LeafLink order webhooks       |
| `/api/integrations/leaflink/callback` | POST     | Internal callback when invoice is paid |
| `/api/integrations/leaflink/config`   | GET/POST | Merchant integration settings          |
| `/api/integrations/leaflink/syncs`    | GET      | List sync records (filterable)         |
| `/api/integrations/leaflink/retry`    | POST     | Retry failed sync-backs                |

### 4. Cash Out (USDC → USD Off-Ramp)

Offbank partners with [Sphere](https://spherepay.co) — a licensed money transmitter — for fiat off-ramp. Operators can convert USDC to USD via ACH, Wire, SEPA, Faster Payments, or Pix without leaving the dashboard.

**How it works:**

1. Operator clicks **Cash Out** in dashboard → routes to `/offramp` with wallet pre-filled
2. Sphere handles KYC, bank linking, and the fiat leg
3. USDC → USD lands in operator’s bank account in 1–2 business days (ACH) or same-day (Wire)
4. Reconciliation receipts surface back in `/dashboard/reports`

Auto cash-out (Beta): operators can configure a minimum threshold; settlements above the threshold trigger automatic conversion via Sphere.

### 5. Operator Dashboard

Full visibility at [offbankpay.com/dashboard](https://offbankpay.com/dashboard):

- **Dashboard** — Revenue overview, outstanding invoices, overdue alerts
- **Orders** — Purchase order management with PO→Invoice conversion
- **Invoices** — Create, send, and track invoice lifecycle
- **Settlements** — Every settlement with on-chain proof (Solscan links)
- **Receivables** — AR aging buckets, counterparty risk, cash flow analytics
- **Collections** — Automated payment reminders (pre-due nudge → due today → 3/7/14 day escalation), overdue tracking, collection performance metrics
- **Reports** — Invoice↔payment reconciliation, audit log, buyer payment history, CSV exports (QuickBooks/Xero ready)

---

## Compliance

Built for the 2026 regulatory landscape:

- **GENIUS Act (2025)** — Full stablecoin payment compliance
- **BSA/AML** — On-chain audit trails satisfy reporting requirements
- **KYB Verification** — All counterparties verified before settlement
- **METRC Integration** — Package tags can be embedded in settlement memos for chain-of-custody traceability
- **Non-Custodial** — Offbank never holds funds; no money transmitter risk
- **Range Security** — Wallet risk screening (OFAC, sanctions, address poisoning detection)

[Full compliance documentation ->](https://offbankpay.com/compliance)

---

## Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Settlement         | Solana, USDC (SPL Token) |
| Smart contract     | Anchor v0.31.1           |
| Backend            | Next.js 16 (App Router)  |
| Database           | Supabase                 |
| Email              | Resend                   |
| Gasless            | Kora (Solana Foundation) |
| Embedded wallets   | Privy                    |
| Treasury security  | Squads multisig          |
| Privacy            | MagicBlock PER (TEE)     |
| Risk screening     | Range Security           |
| Cannabis wholesale | LeafLink REST API v2     |
| Fiat off-ramp      | Sphere (USDC → USD)      |
| Pay links          | Solana Actions / Blinks  |

### On-Chain Program

```
Program ID: 339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5 (Devnet)
```

**Instructions:** `initialize_platform` · `register_merchant` · `process_payment` · `process_payout` · `refund_payment` · `update_platform_fee` · `claim_platform_fees`

---

## Project Structure

```
x402-hack-payment/
+-- app/frontend/                    # Next.js app (offbankpay.com)
|   +-- src/
|       +-- app/                     # Pages + API routes
|       |   +-- api/invoices/        # Invoice creation
|       |   +-- api/payments/        # Payment processing
|       |   +-- api/payouts/         # Payout management
|       |   |   +-- api/integrations/    # Third-party integrations (roadmap)
|       |   +-- api/actions/pay/     # Solana Actions / Blinks endpoint
|       |   +-- api/checkout/        # Checkout sessions
|       |   +-- api/gasless/         # Kora gasless endpoints
|       |   +-- api/kyc/             # Sumsub KYC
|       |   +-- api/webhooks/        # Webhook management
|       |   +-- .well-known/         # actions.json manifest
|       |   +-- dashboard/           # Operator dashboard
|       |   +-- compliance/          # Compliance docs
|       |   +-- blog/                # SEO content
|       +-- lib/
|       |   +-- db.ts                # Core database service
|       |   +-- supabase.ts          # Supabase client
|       |   +-- email.ts             # Transactional email (Resend)
|       +-- components/              # React components
+-- programs/x402-hack-payment/      # Solana program (Anchor)
|   +-- src/
|       +-- lib.rs                   # 7 instructions
|       +-- instructions/            # payment, payout, refund, merchant, platform
|       +-- state/                   # Platform, Merchant, Payment, Customer
|       +-- errors.rs
+-- packages/                        # (SDK — planned, not yet published)
+-- supabase/migrations/             # Database migrations
+-- scripts/                         # Admin scripts (claim fees, etc.)
+-- tests/                           # Anchor program tests
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Solana CLI + Anchor v0.31.1 (for program development)
- Supabase project (or run with in-memory fallback)

### Setup

```bash
git clone https://github.com/ABFX15/x402-hack-payment.git
cd x402-hack-payment

npm install                    # Anchor deps
cd app/frontend && npm install # Frontend deps
npm run dev                    # Start dev server -> localhost:3000
```

### Environment Variables (`app/frontend/.env.local`)

```env
# Required
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_APP_URL=https://offbankpay.com
FEE_PAYER_SECRET_KEY=your_fee_payer_keypair
RESEND_API_KEY=re_xxxxxxxxxxxx

# Supabase (optional — falls back to in-memory)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
RANGE_API_KEY=                 # Wallet risk screening
SUMSUB_APP_TOKEN=              # KYC verification
SUMSUB_SECRET_KEY=
```

---

## Fee Structure

| Tier       | Rate Limit | Fee    |
| ---------- | ---------- | ------ |
| Standard   | 60/min     | 1%     |
| Growth     | 300/min    | 1%     |
| Enterprise | 1000/min   | Custom |

Apply at [offbankpay.com/waitlist](https://offbankpay.com/waitlist).

---

## For Developers

An embeddable SDK (`@offbank/sdk`) is planned but not yet published. If you're interested in integrating Offbank settlement into your platform, reach out via the waitlist or GitHub issues.

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical deep-dive: database schema, Anchor program details, API route reference, integration details, and deployment guide.

## License

ISC

## Links

- **Website:** [offbankpay.com](https://offbankpay.com)
- **Twitter:** [@OffbankP](https://twitter.com/OffbankP)
- **GitHub:** [@ABFX15](https://github.com/ABFX15)
- **SDK:** Planned (not yet published)
