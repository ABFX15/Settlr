# Settlr

**Stablecoin settlement infrastructure for cannabis.** Non-custodial USDC rails on Solana that replace cash drops and 8% high-risk processors with 1% instant settlement and a cryptographic audit trail.

[settlr.dev](https://settlr.dev) · [Waitlist](https://settlr.dev/waitlist) · [Compliance](https://settlr.dev/compliance) · [GitHub](https://github.com/ABFX15)

---

## The Problem

Cannabis operators move **$30B+ annually** through cash or predatory payment processors:

| Today                                                | With Settlr                                     |
| ---------------------------------------------------- | ----------------------------------------------- |
| Banks close your account for being "high-risk"       | Non-custodial — no bank can freeze your funds   |
| High-risk processors charge 8–12% + rolling reserves | 1% flat fee, no reserves, no hidden charges     |
| Wire transfers take 3–5 days + manual reconciliation | T+0 settlement — finality in under 5 seconds    |
| Cash-heavy operations fail compliance audits         | Immutable on-chain audit trail for every dollar |
| Net-30/60 PO terms tie up working capital            | Instant payment on order creation               |

---

## How It Works

### 1. LeafLink Integration (Automated B2B Settlement)

The flagship product. Settlr plugs directly into [LeafLink](https://www.leaflink.com) — the marketplace where cannabis wholesalers already manage purchase orders. No code, no integration work for the operator.

```
LeafLink PO created
        |
Settlr generates USDC payment link automatically
        |
Buyer receives branded email with payment link
        |
Buyer pays in USDC (any wallet — Phantom, Solflare, or Privy embedded)
        |
On-chain proof synced back to LeafLink order
```

**What happens under the hood:**

1. LeafLink fires a webhook when a PO is created or accepted
2. Settlr creates a compliance-stamped invoice (METRC tags, license numbers, PO reference)
3. Payment link is emailed to the buyer via Resend
4. Buyer pays USDC on Solana — settlement in <5 seconds
5. Settlr writes the Solana tx signature back to the LeafLink order as proof
6. If the sync-back fails, an automatic retry mechanism catches it

**LeafLink API Endpoints:**

| Endpoint                                      | Method   | Purpose                                |
| --------------------------------------------- | -------- | -------------------------------------- |
| `/api/integrations/leaflink/webhook`          | POST     | Receives LeafLink order webhooks       |
| `/api/integrations/leaflink/callback`         | POST     | Internal callback when invoice is paid |
| `/api/integrations/leaflink/config`           | GET/POST | Merchant integration settings          |
| `/api/integrations/leaflink/syncs`            | GET      | List sync records (filterable)         |
| `/api/integrations/leaflink/retry`            | POST     | Retry failed sync-backs                |

### 2. Direct Invoices & Payment Links

For settlements outside LeafLink — equipment purchases, consulting fees, one-off supplier payments.

```bash
# Create an invoice
curl -X POST https://settlr.dev/api/invoices \
  -H "X-API-Key: sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "distributor@example.com",
    "amount": 45000.00,
    "memo": "INV-2026-0891 — Bulk Flower + Equipment",
    "complianceLevel": "genius-act"
  }'

# Create a shareable payment link
curl -X POST https://settlr.dev/api/payment-links \
  -H "X-API-Key: sk_live_xxx" \
  -d '{ "amount": 12500.00, "memo": "Equipment deposit", "expiresIn": "7d" }'
```

### 3. Operator Dashboard

Full visibility at [settlr.dev/dashboard](https://settlr.dev/dashboard):

- **Transactions** — Every settlement with on-chain proof (Solscan links)
- **Analytics** — Volume, fees, settlement times
- **Integrations** — Connect LeafLink, configure webhooks
- **Settings** — API keys, team management, webhook URLs

---

## Compliance

Built for the 2026 regulatory landscape:

- **GENIUS Act (2025)** — Full stablecoin payment compliance
- **BSA/AML** — On-chain audit trails satisfy reporting requirements
- **KYB Verification** — All counterparties verified before settlement
- **METRC Integration** — Package tags extracted from LeafLink orders and embedded in settlement memos
- **Non-Custodial** — Settlr never holds funds; no money transmitter risk
- **Range Security** — Wallet risk screening (OFAC, sanctions, address poisoning detection)

[Full compliance documentation ->](https://settlr.dev/compliance)

---

## Tech Stack

| Layer              | Technology                        |
| ------------------ | --------------------------------- |
| Settlement         | Solana, USDC (SPL Token)          |
| Smart contract     | Anchor v0.31.1                    |
| Backend            | Next.js 16 (App Router)           |
| Database           | Supabase                          |
| Email              | Resend                            |
| Gasless            | Kora (Solana Foundation)          |
| Embedded wallets   | Privy                             |
| Treasury security  | Squads multisig                   |
| Privacy            | MagicBlock PER (TEE)              |
| Risk screening     | Range Security                    |
| Cannabis wholesale | LeafLink REST API v2              |

### On-Chain Program

```
Program ID: 339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5 (Devnet)
```

**Instructions:** `initialize_platform` · `register_merchant` · `process_payment` · `process_payout` · `refund_payment` · `update_platform_fee` · `claim_platform_fees`

---

## Project Structure

```
x402-hack-payment/
+-- app/frontend/                    # Next.js app (settlr.dev)
|   +-- src/
|       +-- app/                     # Pages + API routes
|       |   +-- api/invoices/        # Invoice creation
|       |   +-- api/payments/        # Payment processing
|       |   +-- api/payouts/         # Payout management
|       |   +-- api/integrations/    # Third-party integrations
|       |   |   +-- leaflink/        # LeafLink cannabis wholesale
|       |   |       +-- webhook/     # Inbound LL webhooks
|       |   |       +-- callback/    # Internal payment callback
|       |   |       +-- config/      # Merchant config CRUD
|       |   |       +-- syncs/       # Sync record listing
|       |   |       +-- retry/       # Retry failed syncs
|       |   +-- api/checkout/        # Checkout sessions
|       |   +-- api/gasless/         # Kora gasless endpoints
|       |   +-- api/kyc/             # Sumsub KYC
|       |   +-- api/webhooks/        # Webhook management
|       |   +-- dashboard/           # Operator dashboard
|       |   +-- compliance/          # Compliance docs
|       |   +-- blog/                # SEO content
|       +-- lib/
|       |   +-- leaflink/            # LeafLink integration library
|       |   |   +-- types.ts         # Order, webhook, sync types
|       |   |   +-- client.ts        # LeafLink REST API wrapper
|       |   |   +-- db.ts            # Supabase CRUD + in-memory fallback
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
+-- packages/sdk/                    # @settlr/sdk (npm — for external developers)
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
NEXT_PUBLIC_APP_URL=https://settlr.dev
FEE_PAYER_SECRET_KEY=your_fee_payer_keypair
RESEND_API_KEY=re_xxxxxxxxxxxx

# Supabase (optional — falls back to in-memory)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LeafLink Integration
LEAFLINK_CALLBACK_SECRET=your_random_secret
LEAFLINK_RETRY_SECRET=your_cron_secret

# Optional
RANGE_API_KEY=                 # Wallet risk screening
SUMSUB_APP_TOKEN=              # KYC verification
SUMSUB_SECRET_KEY=
```

### LeafLink Setup

1. Run the Supabase migration:
   ```bash
   # Paste supabase/migrations/20260227_leaflink_integration.sql into SQL Editor
   # Or: cd app/frontend && npx supabase db push
   ```
2. Configure a merchant's LeafLink connection:
   ```bash
   curl -X POST https://settlr.dev/api/integrations/leaflink/config \
     -H "Content-Type: application/json" \
     -d '{ "merchant_id": "your_id", "leaflink_api_key": "your_ll_key" }'
   ```
3. Copy the returned webhook URL into LeafLink -> Settings -> Integrations -> Webhooks

---

## Fee Structure

| Tier       | Rate Limit | Fee    |
| ---------- | ---------- | ------ |
| Standard   | 60/min     | 1%     |
| Growth     | 300/min    | 1%     |
| Enterprise | 1000/min   | Custom |

Apply at [settlr.dev/waitlist](https://settlr.dev/waitlist).

---

## For Developers

An npm SDK is available for platforms that want to embed Settlr settlement into their own applications:

```bash
npm install @settlr/sdk
```

See [packages/sdk/README.md](packages/sdk/README.md) for the full API reference. The SDK provides:

- `SettlrClient` — Create invoices, payment links, check settlement status
- `CheckoutButton` / `CheckoutWidget` — Drop-in React components
- `createWebhookHandler` — Type-safe webhook event processing
- `verifyWebhookSignature` — HMAC-SHA256 signature verification

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical deep-dive: database schema, Anchor program details, API route reference, integration details, and deployment guide.

## License

ISC

## Links

- **Website:** [settlr.dev](https://settlr.dev)
- **Twitter:** [@SettlrP](https://twitter.com/SettlrP)
- **GitHub:** [@ABFX15](https://github.com/ABFX15)
- **npm:** [@settlr/sdk](https://www.npmjs.com/package/@settlr/sdk)
