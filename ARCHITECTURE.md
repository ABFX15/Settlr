# Settlr Architecture Documentation

> **Last Updated:** April 2026  
> **Program ID:** `339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5` (Devnet)

---

## Overview

Settlr is stablecoin settlement infrastructure for cannabis — non-custodial B2B USDC rails on Solana that replace cash drops and high-risk processors. The primary product is automated settlement for LeafLink purchase orders. Secondary paths include direct invoices and Solana Actions pay links (Blinks). An embeddable SDK is planned but not yet published.

```
┌─────────────────────────────────────────────────────────────────┐
│                        LEAFLINK                                 │
│          (Cannabis wholesale marketplace — POs)                 │
└─────────────────────────────────────────────────────────────────┘
                              │ webhook
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SETTLR BACKEND                              │
│                   (Next.js App Router)                          │
│                                                                 │
│  LeafLink Integration:                                          │
│  • Webhook intake → invoice creation → payment link email       │
│  • On-chain proof sync-back to LeafLink order                   │
│  • METRC tag extraction + compliance memos                      │
│                                                                 │
│  Core Settlement:                                               │
│  • Direct invoices & payment links                              │
│  • Solana Actions / Blinks (shareable pay links)                │
│  • Privy embedded wallets (no wallet setup required)            │
│  • Gasless transactions (Kora-sponsored)                        │
│  • Range Security wallet risk screening                         │
│  • Supabase persistence (in-memory fallback)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SOLANA ANCHOR PROGRAM                        │
│                                                                 │
│  • USDC settlement processing + 1% platform fee                 │
│  • Merchant (operator) on-chain registration                    │
│  • MagicBlock PER private settlements (TEE-secured)             │
│  • Immutable audit trail for compliance                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Summary

| Layer       | Technology                           | Status                        |
| ----------- | ------------------------------------ | ----------------------------- |
| Frontend    | Next.js 16 (App Router)              | ✅ Implemented                |
| LeafLink    | LeafLink REST API v2                 | ✅ Fully implemented          |
| Auth        | Privy (embedded wallets)             | ✅ Implemented                |
| Gasless     | Kora + Privy fee payer               | ✅ Implemented                |
| Privacy     | MagicBlock Private Ephemeral Rollups | ✅ Implemented                |
| Security    | Range (wallet risk screening)        | ✅ Implemented                |
| One-Click   | Saved payment methods                | ✅ Implemented                |
| Blinks      | Solana Actions (shareable pay links) | ✅ Implemented                |
| Database    | Supabase (with in-memory fallback)   | ✅ Implemented                |
| SDK         | @settlr/sdk (npm)                    | ⚠️ Planned, not yet published |
| KYC         | Sumsub                               | ⚠️ Scaffolded, not enforced   |
| Cross-chain | Mayan                                | ❌ Not implemented            |
| On-chain    | Anchor (Solana)                      | ✅ Deployed to devnet         |

---

## Directory Structure

```
x402-hack-payment/
├── app/frontend/              # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/           # API routes
│   │   │   │   ├── actions/   # Solana Actions / Blinks
│   │   │   │   │   └── pay/   # Invoice pay-via-Blink endpoint
│   │   │   │   ├── checkout/  # Checkout session management
│   │   │   │   ├── collections/ # Collections & reminders
│   │   │   │   │   ├── route.ts   # GET stats + overdue + reminders
│   │   │   │   │   └── send/      # POST send/schedule/cancel reminders
│   │   │   │   ├── invoices/  # Invoice CRUD
│   │   │   │   ├── orders/    # Purchase order management
│   │   │   │   ├── payments/  # Payment processing
│   │   │   │   ├── receivables/ # AR analytics
│   │   │   │   ├── reports/   # Reporting & exports
│   │   │   │   │   ├── reconciliation/ # Invoice↔Payment matching
│   │   │   │   │   ├── audit-log/      # Chronological event trail
│   │   │   │   │   └── buyers/         # Per-buyer payment history
│   │   │   │   ├── kyc/       # Sumsub KYC integration
│   │   │   │   ├── gasless/   # Kora gasless endpoints
│   │   │   │   ├── merchants/ # Merchant management
│   │   │   │   ├── webhooks/  # Webhook handlers
│   │   │   │   ├── integrations/
│   │   │   │   │   └── leaflink/ # LeafLink cannabis wholesale
│   │   │   │   │       ├── webhook/   # Inbound LL webhooks
│   │   │   │   │       ├── callback/  # Internal payment callback
│   │   │   │   │       ├── config/    # Merchant config CRUD
│   │   │   │   │       ├── syncs/     # List sync records
│   │   │   │   │       └── retry/     # Retry failed syncs
│   │   │   │   └── subscriptions/
│   │   │   ├── .well-known/   # Solana Actions manifest (actions.json)
│   │   │   ├── dashboard/     # Merchant dashboard
│   │   │   │   ├── orders/    # Purchase order management
│   │   │   │   ├── invoices/  # Invoice list + detail
│   │   │   │   ├── settlements/ # Settlement history
│   │   │   │   ├── receivables/ # AR aging + counterparty risk
│   │   │   │   ├── collections/ # Reminders & overdue tracking
│   │   │   │   └── reports/   # Reconciliation, exports, audit log
│   │   │   └── checkout/[id]/ # Hosted checkout page
│   │   ├── components/        # React components
│   │   ├── lib/               # Core utilities
│   │   │   ├── db.ts          # Database service layer
│   │   │   ├── supabase.ts    # Supabase client
│   │   │   ├── kora.ts        # Kora gasless integration
│   │   │   ├── sumsub.ts      # Sumsub KYC integration
│   │   │   ├── solana.ts      # Solana utilities
│   │   │   └── leaflink/      # LeafLink integration
│   │   │       ├── types.ts   # Order, webhook, sync, config types
│   │   │       ├── client.ts  # LeafLink REST API wrapper
│   │   │       ├── db.ts      # Sync & config CRUD (Supabase + in-memory)
│   │   │       └── index.ts   # Barrel export
│   │   ├── providers/         # React context providers
│   │   └── anchor/            # Generated Anchor types
│   └── supabase/
│       └── migrations/        # Database migrations
├── packages/                  # SDK (planned, not yet published)
│   └── src/
│       ├── client.ts          # SettlrClient class
│       ├── components.tsx     # React components
│       ├── react.tsx          # React hooks
│       └── webhooks.ts        # Webhook verification
├── programs/x402-hack-payment/ # Anchor program
│   └── src/
│       ├── lib.rs             # Program entry
│       ├── instructions/      # Instruction handlers
│       │   ├── initialize.rs  # Platform init
│       │   ├── payment.rs     # Process payment
│       │   ├── refund.rs      # Refund payment
│       │   ├── platform.rs    # Platform config
│       │   ├── claim.rs       # Claim fees
│       │   └── transfer.rs    # Transfer authority
│       ├── state/             # Account schemas
│       │   ├── platform.rs    # Platform config
│       │   ├── merchant.rs    # Merchant account
│       │   ├── customer.rs    # Customer account
│       │   └── payment.rs     # Payment record
│       └── errors.rs          # Custom errors
├── scripts/                   # Admin scripts
│   ├── claim-fees.ts
│   ├── update-platform-fee.ts
│   └── init-with-squads.ts
└── kora/                      # Kora gasless config
    ├── kora.toml
    └── signers.toml
```

---

## Anchor Program Architecture

### Program ID

```
339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5 (Devnet)
```

### Instructions

| Instruction           | Description                            | Access                      |
| --------------------- | -------------------------------------- | --------------------------- |
| `set_platform_config` | Initialize or update platform settings | Admin (Squads multisig)     |
| `initialize_merchant` | Register a new merchant                | Any signer                  |
| `process_payment`     | Execute USDC payment with fee split    | Customer (can be sponsored) |
| `claim_platform_fees` | Withdraw accumulated platform fees     | Admin                       |
| `refund_payment`      | Full or partial refund                 | Merchant authority          |
| `transfer_authority`  | Change platform admin                  | Admin                       |

### Account Schemas

#### Platform

```rust
pub struct Platform {
    pub authority: Pubkey,        // Admin (or Squads vault)
    pub treasury: Pubkey,         // Fee destination
    pub usdc_mint: Pubkey,        // SPL token mint
    pub min_payment_amount: u64,  // Minimum in lamports
    pub fee_bps: u64,             // Platform fee (basis points)
    pub is_active: bool,          // Kill switch
    pub bump: u8,
    pub treasury_bump: u8,
}
```

#### Merchant

```rust
pub struct Merchant {
    pub merchant_id: String,      // Unique identifier (max 200 chars)
    pub authority: Pubkey,        // Owner wallet
    pub settlement_wallet: Pubkey,// Where funds go
    pub fee: u16,                 // Reserved (currently 0)
    pub volume: u64,              // Total processed
    pub total_fees: u64,          // Total fees paid
    pub transaction_count: u64,   // Payment count
    pub created_at: i64,
    pub is_active: bool,
    pub bump: u8,
}
```

#### Customer

```rust
pub struct Customer {
    pub customer: Pubkey,         // Wallet address
    pub total_spent: u64,
    pub transaction_count: u64,
    pub created_at: i64,
    pub bump: u8,
}
```

#### Payment

```rust
pub struct Payment {
    pub payment_id: String,       // External reference
    pub customer: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,              // Original amount
    pub fee: u64,                 // Platform fee taken
    pub status: PaymentStatus,    // Completed/Refunded/etc
    pub created_at: i64,
    pub bump: u8,
}
```

### PDAs (Program Derived Addresses)

| Account  | Seeds                                  |
| -------- | -------------------------------------- |
| Platform | `["platform_config"]`                  |
| Treasury | `["platform_treasury"]`                |
| Merchant | `["merchant", merchant_id.as_bytes()]` |
| Customer | `["customer", customer_pubkey]`        |
| Payment  | `["payment", payment_id.as_bytes()]`   |

---

## Database Schema

### Tables (Supabase)

#### merchants

| Column         | Type        | Description           |
| -------------- | ----------- | --------------------- |
| id             | uuid        | Primary key           |
| name           | text        | Business name         |
| website_url    | text        | Optional              |
| wallet_address | text        | Solana pubkey         |
| webhook_url    | text        | Payment notifications |
| webhook_secret | text        | HMAC signing key      |
| kyc_enabled    | boolean     | Require customer KYC  |
| kyc_level      | enum        | basic/gaming/enhanced |
| created_at     | timestamptz |                       |
| updated_at     | timestamptz |                       |

#### checkout_sessions

| Column            | Type        | Description                         |
| ----------------- | ----------- | ----------------------------------- |
| id                | text        | Format: `cs_xxxx...`                |
| merchant_id       | uuid        | FK to merchants                     |
| amount            | numeric     | USDC amount                         |
| currency          | text        | Always "USDC"                       |
| description       | text        | Product description                 |
| metadata          | jsonb       | Custom data                         |
| success_url       | text        | Redirect on success                 |
| cancel_url        | text        | Redirect on cancel                  |
| status            | enum        | pending/completed/expired/cancelled |
| payment_signature | text        | Solana tx sig                       |
| customer_wallet   | text        | Payer address                       |
| expires_at        | timestamptz |                                     |

#### payments

| Column          | Type    | Description                           |
| --------------- | ------- | ------------------------------------- |
| id              | text    | Format: `pay_xxxx...`                 |
| session_id      | text    | FK to checkout_sessions               |
| merchant_id     | uuid    |                                       |
| customer_wallet | text    |                                       |
| amount          | numeric |                                       |
| tx_signature    | text    | Solana tx                             |
| status          | enum    | completed/refunded/partially_refunded |
| refunded_amount | numeric |                                       |

#### api_keys

| Column      | Type    | Description               |
| ----------- | ------- | ------------------------- |
| id          | uuid    |                           |
| merchant_id | uuid    |                           |
| key         | text    | Hashed secret             |
| key_prefix  | text    | First 8 chars for display |
| name        | text    | Key description           |
| tier        | enum    | free/pro/enterprise       |
| rate_limit  | int     | Requests per minute       |
| active      | boolean |                           |

#### customer_kyc

| Column              | Type        | Description                           |
| ------------------- | ----------- | ------------------------------------- |
| id                  | uuid        |                                       |
| external_user_id    | text        | Wallet or email                       |
| merchant_id         | uuid        | null = global                         |
| sumsub_applicant_id | text        |                                       |
| status              | enum        | not_started/pending/verified/rejected |
| verified_at         | timestamptz |                                       |

#### collection_reminders

| Column         | Type        | Description                                       |
| -------------- | ----------- | ------------------------------------------------- |
| id             | text        | Primary key (rem_xxx)                             |
| merchant_id    | text        | FK to merchants                                   |
| invoice_id     | text        | FK to invoices                                    |
| invoice_number | text        | Human-readable invoice number                     |
| buyer_email    | text        | Buyer contact                                     |
| buyer_name     | text        | Buyer display name                                |
| type           | text        | pre_due_nudge/due_today/overdue_gentle/firm/final |
| status         | text        | scheduled/sent/failed/skipped                     |
| scheduled_for  | timestamptz | When to send                                      |
| sent_at        | timestamptz | When actually sent                                |
| failed_reason  | text        | Error message if failed                           |
| created_at     | timestamptz |                                                   |

#### leaflink_syncs

| Column                | Type          | Description                                    |
| --------------------- | ------------- | ---------------------------------------------- |
| id                    | text          | Primary key (sync_xxx)                         |
| merchant_id           | text          | Settlr merchant ID                             |
| leaflink_order_id     | integer       | LeafLink order ID                              |
| leaflink_order_number | text          | Human-readable PO number                       |
| seller_email          | text          | Seller contact                                 |
| buyer_email           | text          | Buyer contact                                  |
| buyer_company         | text          | Buyer company name                             |
| amount                | numeric(12,2) | USDC amount                                    |
| settlr_invoice_id     | text          | FK to invoices                                 |
| settlr_payment_link   | text          | Payment URL sent to buyer                      |
| tx_signature          | text          | Solana transaction signature                   |
| status                | text          | pending/link_sent/paid/synced/failed/cancelled |
| metadata              | jsonb         | METRC tags, license numbers, line items        |
| error                 | text          | Last error message (for failed syncs)          |
| created_at            | timestamptz   |                                                |
| updated_at            | timestamptz   | Auto-updated via trigger                       |

#### leaflink_configs

| Column              | Type        | Description                                 |
| ------------------- | ----------- | ------------------------------------------- |
| merchant_id         | text        | Primary key (FK to merchants)               |
| leaflink_api_key    | text        | LeafLink API key (App auth)                 |
| leaflink_company_id | integer     | LeafLink company ID                         |
| auto_create_invoice | boolean     | Auto-create Settlr invoice (default: true)  |
| auto_send_link      | boolean     | Auto-email payment link (default: true)     |
| webhook_secret      | text        | HMAC secret for verifying LL webhooks       |
| metrc_sync          | boolean     | Include METRC tags in memos (default: true) |
| created_at          | timestamptz |                                             |
| updated_at          | timestamptz | Auto-updated via trigger                    |

---

## API Routes

### Checkout Flow

| Endpoint                | Method | Description               |
| ----------------------- | ------ | ------------------------- |
| `/api/checkout`         | POST   | Create checkout session   |
| `/api/checkout/[id]`    | GET    | Get session details       |
| `/api/payments`         | POST   | Record completed payment  |
| `/api/payments/[id]`    | GET    | Get payment details       |
| `/api/webhooks/payment` | POST   | Merchant webhook delivery |

### Merchant Management

| Endpoint              | Method    | Description         |
| --------------------- | --------- | ------------------- |
| `/api/merchants`      | POST      | Register merchant   |
| `/api/merchants/[id]` | GET/PATCH | Get/update merchant |
| `/api/sdk/merchant`   | GET       | SDK merchant lookup |

### Gasless

| Endpoint                   | Method | Description                     |
| -------------------------- | ------ | ------------------------------- |
| `/api/gasless`             | GET    | Check gasless availability      |
| `/api/gasless`             | POST   | Create/submit gasless tx (Kora) |
| `/api/sponsor-transaction` | GET    | Check Privy fee payer status    |
| `/api/sponsor-transaction` | POST   | Privy-sponsored tx flow         |

### Privacy

| Endpoint              | Method | Description                                                      |
| --------------------- | ------ | ---------------------------------------------------------------- |
| `/api/privacy/gaming` | POST   | MagicBlock PER private payments (create/delegate/process/settle) |

### Security

| Endpoint          | Method | Description              |
| ----------------- | ------ | ------------------------ |
| `/api/risk-check` | GET    | Screen wallet for risk   |
| `/api/risk-check` | POST   | Full payment risk assess |

### One-Click

| Endpoint         | Method | Description                |
| ---------------- | ------ | -------------------------- |
| `/api/one-click` | GET    | Check saved payment method |
| `/api/one-click` | POST   | Execute one-click payment  |

### KYC (Sumsub)

| Endpoint           | Method | Description                  |
| ------------------ | ------ | ---------------------------- |
| `/api/kyc/init`    | POST   | Create Sumsub applicant      |
| `/api/kyc/token`   | POST   | Get Sumsub access token      |
| `/api/kyc/webhook` | POST   | Sumsub verification callback |

### LeafLink Integration

| Endpoint                              | Method   | Description                                              |
| ------------------------------------- | -------- | -------------------------------------------------------- |
| `/api/integrations/leaflink/webhook`  | POST     | Receives LeafLink order webhooks (HMAC-SHA256 verified)  |
| `/api/integrations/leaflink/callback` | POST     | Internal callback when Settlr invoice is paid            |
| `/api/integrations/leaflink/config`   | GET/POST | Merchant LeafLink integration config (validates API key) |
| `/api/integrations/leaflink/syncs`    | GET      | List sync records (filterable by status)                 |
| `/api/integrations/leaflink/retry`    | POST     | Retry failed sync-backs to LeafLink API                  |

### Solana Actions / Blinks

| Endpoint                    | Method  | Description                                                |
| --------------------------- | ------- | ---------------------------------------------------------- |
| `/api/actions/pay`          | GET     | Returns Solana Action card (title, icon, amount, merchant) |
| `/api/actions/pay`          | POST    | Accepts payer wallet, returns unsigned USDC transfer tx    |
| `/api/actions/pay`          | OPTIONS | CORS preflight (required by Solana Actions spec)           |
| `/.well-known/actions.json` | GET     | Actions manifest — maps URL patterns to action endpoints   |

### Purchase Orders

| Endpoint           | Method | Description                                   |
| ------------------ | ------ | --------------------------------------------- |
| `/api/orders`      | GET    | List merchant POs                             |
| `/api/orders`      | POST   | Create purchase order                         |
| `/api/orders/[id]` | GET    | Get PO details                                |
| `/api/orders/[id]` | PATCH  | Update PO status (accept, convert to invoice) |

### Receivables

| Endpoint           | Method | Description                                    |
| ------------------ | ------ | ---------------------------------------------- |
| `/api/receivables` | GET    | AR analytics: aging buckets, counterparty risk |

### Collections & Reminders

| Endpoint                                | Method | Description                                      |
| --------------------------------------- | ------ | ------------------------------------------------ |
| `/api/collections`                      | GET    | Stats, overdue invoices, due-soon, reminder list |
| `/api/collections/send`                 | POST   | Process & send all due reminders                 |
| `/api/collections/send?action=schedule` | POST   | Schedule reminder sequence for an invoice        |
| `/api/collections/send?action=cancel`   | POST   | Cancel pending reminders (e.g. invoice paid)     |

### Reports & Exports

| Endpoint                      | Method | Description                             |
| ----------------------------- | ------ | --------------------------------------- |
| `/api/reports/reconciliation` | GET    | Invoice↔Payment matching (JSON or CSV)  |
| `/api/reports/audit-log`      | GET    | Chronological event trail (JSON or CSV) |
| `/api/reports/buyers`         | GET    | Per-buyer payment history (JSON or CSV) |
| `/api/merchants/[id]/export`  | GET    | QuickBooks-compatible payment CSV       |

---

## Integration Details

### Privy (Authentication)

**Purpose:** Embedded wallets, social login, email login

**Config:**

```typescript
// providers/privy-provider.tsx
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
  config={{
    appearance: { theme: 'dark' },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    loginMethods: ['email', 'wallet', 'google', 'twitter'],
  }}
>
```

**Status:** ✅ Fully implemented

---

### Kora (Gasless Transactions)

**Purpose:** Sponsor transaction fees so customers pay $0 gas

**Location:** `app/frontend/src/lib/kora.ts`

**Key Functions:**

```typescript
getKoraClient(): KoraClient
createGaslessTransfer(): VersionedTransaction
signAndSendWithKora(tx): signature
```

**Config Files:**

- `kora/kora.toml` - Client configuration
- `kora/signers.toml` - Fee payer keypairs
- `kora/fee-payer.json` - Fee payer wallet

**Status:** ✅ Fully implemented

---

### Sumsub (KYC)

**Purpose:** Identity verification for regulated merchants

**Location:** `app/frontend/src/lib/sumsub.ts`

**Key Functions:**

```typescript
createApplicant(externalUserId, level): applicantId
generateAccessToken(applicantId): token
getApplicantByExternalId(id): applicant
verifyWebhookSignature(body, signature): boolean
```

**KYC Levels:**

- `basic-kyc-level` - Name, DOB, address
- `gaming-kyc-level` - + Document verification
- `enhanced-kyc-level` - + Liveness check

**Webhook Events Handled:**

- `applicantReviewed` - Verification complete
- `applicantActivated` - User started flow
- `applicantActionPending` - Additional docs needed

**Status:** ⚠️ Scaffolded but NOT enforced (merchants can enable per-account)

---

### Range Security (Wallet Risk Screening)

**Purpose:** Screen merchant wallets before payments to block malicious actors

**Location:** `app/frontend/src/app/api/risk-check/route.ts`

**Key Functions:**

```typescript
GET /api/risk-check?address={wallet}&network=solana
POST /api/risk-check (full payment risk assessment)
```

**Risk Scoring:**

| Score | Level              | Action            |
| ----- | ------------------ | ----------------- |
| 1-4   | Low risk           | ✅ Allow payment  |
| 5-6   | Medium risk        | ⚠️ Warn but allow |
| 7-10  | High/Critical risk | 🚫 Block payment  |

**Features:**

- Sanctions list checking (OFAC, EU, UK, UN)
- Address poisoning detection
- ML-based behavioral analysis
- Distance-to-malicious scoring

**Status:** ✅ Fully implemented

---

### Privacy (MagicBlock Private Ephemeral Rollups)

**Purpose:** Private payments where amount and sender-recipient data are hidden inside TEE during processing

**Locations:**

- `app/frontend/src/lib/privacy/` - Privacy helpers (planned for SDK)
- `app/frontend/src/app/api/privacy/gaming/route.ts` - Private payments API
- `app/frontend/src/app/privacy/page.tsx` - Interactive demo UI
- `programs/x402-hack-payment/src/instructions/private_receipt.rs` - On-chain (4 instructions)

**Privacy Architecture:**

1. **Create** - Payment session created on Solana base layer
2. **Delegate** - Account delegated to PER (data moves into Intel TDX TEE)
3. **Process** - Payment executed inside TEE (hidden from all observers)
4. **Settle** - Final state committed back to Solana base layer

**Key Programs:**

- Delegation: `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`
- Permission: `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- PER Endpoint: `https://tee.magicblock.app`

**Key Endpoints:**

```typescript
POST / api / privacy / gaming; // action: create | delegate | process | settle | status
GET / api / privacy / gaming; // API info and endpoint details
```

**Status:** ✅ Implemented (SolanaBlitz Hackathon — MagicBlock Weekend)

---

### One-Click Payments

**Purpose:** Save payment method for returning customers

**Location:** `app/frontend/src/app/api/one-click/route.ts`

**Database Table:** `one_click_payments`

**Flow:**

1. Customer completes first payment
2. System saves wallet + approval for merchant
3. Future checkouts show "One-Click Pay" button
4. Customer confirms without re-entering details

**Status:** ✅ Fully implemented

---

### LeafLink (Cannabis B2B Wholesale Settlement)

**Purpose:** Automated USDC settlement for LeafLink purchase orders. Replaces net-30/60 invoice terms with instant on-chain payment, syncs proof back to LeafLink.

**Locations:**

- `app/frontend/src/lib/leaflink/types.ts` — Full type system (orders, webhooks, syncs, configs)
- `app/frontend/src/lib/leaflink/client.ts` — LeafLink REST API v2 wrapper
- `app/frontend/src/lib/leaflink/db.ts` — Sync & config CRUD (Supabase + in-memory fallback)
- `app/frontend/src/app/api/integrations/leaflink/` — 5 API route handlers

**LeafLink API:**

- Base URL: `https://www.leaflink.com/api/v2`
- Auth: `Authorization: App {api_key}`
- Endpoints used: `orders-received/{id}`, `orders-received/{id}/notes`, `companies/`

**Data Flow:**

```
┌──────────┐     webhook      ┌──────────────┐    create     ┌──────────┐
│ LeafLink │ ───────────────→ │ /ll/webhook   │ ──────────→  │ Supabase │
│ (PO)     │                  │              │    invoice    │ invoices │
└──────────┘                  └──────┬───────┘              └──────────┘
                                     │
                              email payment link
                                     │
                                     ▼
                              ┌──────────────┐    pay USDC   ┌──────────┐
                              │  Buyer inbox  │ ──────────→  │  Solana  │
                              └──────────────┘              └────┬─────┘
                                                                 │
                                                          settlement confirmed
                                                                 │
                                                                 ▼
┌──────────┐   set external_id  ┌──────────────┐  mark paid  ┌──────────┐
│ LeafLink │ ←─────────────── │ /ll/callback  │ ←────────── │  Settlr  │
│ (order)  │    + add note      │              │   webhook    │ backend  │
└──────────┘                    └──────────────┘              └──────────┘
```

**Sync Statuses:**

| Status      | Meaning                                   |
| ----------- | ----------------------------------------- |
| `pending`   | Webhook received, processing              |
| `link_sent` | Payment link emailed to buyer             |
| `paid`      | On-chain settlement confirmed             |
| `synced`    | Proof written back to LeafLink API        |
| `failed`    | LeafLink API sync-back failed (retryable) |
| `cancelled` | LeafLink order was cancelled              |

**Key Features:**

- HMAC-SHA256 webhook signature verification (per-merchant secrets)
- METRC tag extraction from line items for compliance memos
- License number tracking (seller + buyer) in metadata
- Automatic retry endpoint for failed sync-backs
- In-memory fallback when Supabase is not configured
- Branded HTML payment emails via Resend
- Validates LeafLink API key against real API on config save

**Database Tables:** `leaflink_syncs`, `leaflink_configs` (see Database Schema section)

**Migration:** `supabase/migrations/20260227_leaflink_integration.sql`

**Status:** ✅ Fully implemented

---

### Solana Actions / Blinks (Shareable Pay Links)

**Purpose:** Generate universal payment links for invoices that work in any Solana-compatible wallet, browser, or social platform. Implements the [Solana Actions](https://solana.com/docs/advanced/actions) specification.

**Locations:**

- `app/frontend/src/app/api/actions/pay/route.ts` — GET/POST/OPTIONS endpoint
- `app/frontend/src/app/api/actions/pay/helpers.ts` — CORS response helpers
- `app/frontend/src/app/.well-known/actions.json/route.ts` — Actions manifest

**Endpoints:**

```typescript
GET  /api/actions/pay?invoice=<viewToken>   // Returns Action card metadata
POST /api/actions/pay?invoice=<viewToken>   // Returns unsigned USDC transfer tx
OPTIONS /api/actions/pay                     // CORS preflight
GET  /.well-known/actions.json              // URL pattern → action mapping
```

**Flow:**

1. Invoice is created → Blink URL generated automatically (`/api/actions/pay?invoice=<viewToken>`)
2. Merchant copies Blink URL from dashboard and shares it anywhere (Twitter/X, Discord, SMS, email)
3. Payer opens the link → wallet renders an Action card showing amount, merchant name, and icon
4. Payer clicks "Pay" → `POST` returns an unsigned USDC transfer transaction
5. Payer signs once → settlement in <5 seconds
6. Transaction memo encodes `settlr:<invoiceNumber>:<id>` for on-chain traceability

**CORS Headers (required by spec):**

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, x-action-version, x-blockchain-ids
Access-Control-Expose-Headers: x-action-version, x-blockchain-ids
```

**Actions Manifest (`/.well-known/actions.json`):**

```json
{
  "rules": [
    { "pathPattern": "/api/actions/pay**", "apiPath": "/api/actions/pay**" },
    { "pathPattern": "/pay/**", "apiPath": "/api/actions/pay**" }
  ]
}
```

**CORS config:** Also set in `next.config.ts` `headers()` for `/api/actions/:path*` and `/.well-known/actions.json`.

**Status:** ✅ Fully implemented

---

### Mayan (Cross-Chain)

**Purpose:** Bridge USDC from Ethereum/Base/Arbitrum to Solana

**Documented in:** README.md

**Actual Implementation:** ❌ **NONE**

**Note:** The READMEs claim cross-chain support via Mayan Protocol, but there is NO mayan.ts file and NO implementation exists in the codebase. This is purely aspirational documentation.

---

### Supabase (Database)

**Purpose:** Persistent storage for merchants, sessions, payments

**Location:** `app/frontend/src/lib/supabase.ts`

**Fallback:** If `NEXT_PUBLIC_SUPABASE_URL` is not set, the system uses in-memory storage (defined in `lib/db.ts`).

**Status:** ✅ Implemented with graceful degradation

---

## SDK (@settlr/sdk)

An embeddable SDK for external developers is planned but **not yet published**. The `packages/` directory is currently empty.

When available, the SDK will provide: `Settlr` client, checkout components, webhook handlers, and privacy utilities.

---

## Environment Variables

### Required

```env
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=
NEXT_PUBLIC_PROGRAM_ID=339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5

# Supabase (optional - falls back to in-memory)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Optional

```env
# Sumsub KYC
SUMSUB_APP_TOKEN=
SUMSUB_SECRET_KEY=

# Kora Gasless
KORA_RPC_URL=
KORA_FEE_PAYER_KEYPAIR=

# Range Security (wallet risk screening)
RANGE_API_KEY=

# MagicBlock PER (TEE-based private payments)
# PER_ENDPOINT=https://tee.magicblock.app

# LeafLink Integration (cannabis B2B wholesale)
LEAFLINK_CALLBACK_SECRET=       # Secret for internal payment callback auth
LEAFLINK_RETRY_SECRET=          # Secret for cron-triggered retry endpoint
# RESEND_FROM_EMAIL=            # Sender address for payment emails (default: noreply@settlr.dev)
```

---

## Demo Credentials

| Resource     | Value                                          |
| ------------ | ---------------------------------------------- |
| Demo Wallet  | `DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV` |
| Network      | Devnet                                         |
| Airdrop      | 2 SOL                                          |
| Demo API Key | `sk_test_demo_xxxxxxxxxxxx`                    |

---

## Fee Structure

- **Platform Fee:** 0.5% (50 basis points)
- **Configurable:** Yes, via `set_platform_config` instruction
- **Collection:** Automatic on each payment to treasury PDA
- **Claim:** Admin can call `claim_platform_fees` anytime

---

## Squads Vault-First Settlement Architecture

Every Settlr merchant settles into a **Squads v4 Smart Account** — not a raw wallet. This is not an optional add-on; vaults are the default settlement destination.

### Why Vault-First

A raw keypair wallet is unsuitable for commercial treasury:

| Concern             | Raw Wallet                    | Squads Smart Account                              |
| ------------------- | ----------------------------- | ------------------------------------------------- |
| **Governance**      | Single signer can drain funds | Configurable M-of-N signing threshold             |
| **Recovery**        | Lost seed phrase = lost funds | Social recovery + backup signers                  |
| **Spending limits** | All-or-nothing                | Per-tx and daily limits enforced on-chain         |
| **Audit trail**     | Address visible, no identity  | Full log: who signed, when, what amount, for what |
| **Compliance**      | Hard to prove authorization   | Immutable proof of board-approved disbursements   |

### Progressive Onboarding (3 Phases)

The vault complexity scales with the operator's volume. Onboarding feels like a normal app, then grows into enterprise governance.

#### Phase 1 — Soft Start (1-of-1)

- New merchant signs up → Settlr creates a Squads Smart Account with **1-of-1 signing** (the merchant's own key).
- UX is identical to a standard wallet. Merchant doesn't need to know "multisig" exists.
- All settlements flow into this vault by default.

#### Phase 2 — Growth Threshold ($5K+)

- When cumulative vault deposits exceed **$5,000**, Settlr prompts: _"Add a second signer to protect your funds."_
- Merchant adds a CFO, partner, or accountant as a second signer → vault upgrades to **2-of-2**.
- Spending limits can be configured (e.g., auto-approve < $500, require 2 signatures above).

#### Phase 3 — Enterprise Governance

For operators processing $50K+/month:

- **N-of-M signing** (e.g., 2-of-3 board members for disbursements > $5K)
- **Whitelisted suppliers** — pre-approved addresses (e.g., verified LeafLink invoices) settle automatically with 1 signature
- **Recurring payroll** — scheduled USDC payroll with time-locked approval
- **Tiered authority** — different threshold for petty cash ($200, any signer) vs. equipment purchase ($10K, quorum required)
- **On-chain audit export** — every signed transaction generates an immutable receipt suitable for BSA/AML reporting

### Technical Integration

```
scripts/
├── init-with-squads.ts       # Scaffold: initialize Squads vault as platform authority
├── claim-fees.ts             # Admin fee claims require Squads vault signature
programs/x402-hack-payment/
└── src/
    └── state/
        └── platform_config.rs    # authority: Pubkey → points to Squads vault
```

- The `authority` field in `PlatformConfig` is set to the Squads vault address (not a personal keypair).
- Fee claims (`claim_platform_fees`) require a valid Squads transaction proposal signed by the vault's threshold.
- Merchant settlement addresses are Squads vault PDAs, not raw wallets.

### Current Status

- [x] Squads integration scaffolded (`init-with-squads.ts`)
- [x] `PlatformConfig.authority` designed to accept vault addresses
- [ ] Auto-provision Squads vault on merchant signup
- [ ] Progressive signer upgrade prompts (Phase 2/3)
- [ ] LeafLink invoice → whitelisted address auto-settlement
- [ ] On-chain audit trail export

---

## Known Gaps / TODOs

1. **Cross-chain (Mayan)** - Documented but not implemented
2. **KYC Enforcement** - Sumsub integrated but not blocking payments
3. **Subscriptions** - Database schema exists, full flow incomplete
4. **Webhook Retry** - No automatic retry on webhook delivery failure (LeafLink integration has its own retry)
5. **Rate Limiting** - Basic implementation, needs Redis for production
6. **Multi-sig (Squads)** - Scaffolded in `init-with-squads.ts`; vault-first architecture designed (see section above) but auto-provisioning not yet implemented
7. **Privacy Cash Production** - Currently in demo mode (devnet simulation)
8. **Kora Local Server** - Requires running Kora locally for gasless (Privy works independently)
9. **Dutchie Integration** - Content pages exist; no API integration (Dutchie building own payments)
10. **Flowhub Integration** - Content pages exist; no API integration yet (receipt sync planned)
11. **Collection Reminders Cron** - Reminders are sent on-demand via dashboard button; needs cron job or Vercel CRON for fully automated daily sends
12. **Supabase Migration for Collections** - `collection_reminders` table migration not yet created (works via in-memory fallback)

---

## Deployment

### Frontend (Vercel)

```json
// vercel.json
{
  "buildCommand": "cd app/frontend && npm install && npm run build",
  "outputDirectory": "app/frontend/.next"
}
```

### Anchor Program

```bash
anchor build
anchor deploy --provider.cluster devnet
```

### SDK Publishing

SDK is planned but not yet implemented. The `packages/` directory is reserved for the future `@settlr/sdk` npm package.

---

## Quick Reference

| What               | Where                                                                |
| ------------------ | -------------------------------------------------------------------- |
| Program source     | `programs/x402-hack-payment/src/`                                    |
| Frontend           | `app/frontend/`                                                      |
| SDK source         | `packages/` (planned, not yet published)                             |
| API routes         | `app/frontend/src/app/api/`                                          |
| LeafLink routes    | `app/frontend/src/app/api/integrations/leaflink/`                    |
| LeafLink library   | `app/frontend/src/lib/leaflink/`                                     |
| LeafLink migration | `app/frontend/supabase/migrations/20260227_leaflink_integration.sql` |
| Database types     | `app/frontend/src/lib/db.ts`                                         |
| Email templates    | `app/frontend/src/lib/email.ts`                                      |
| Collections        | `app/frontend/src/app/api/collections/`                              |
| Reports            | `app/frontend/src/app/api/reports/`                                  |
| Anchor IDL         | `target/idl/x402_hack_payment.json`                                  |
| Generated types    | `target/types/x402_hack_payment.ts`                                  |

---

_This document should be updated whenever significant architectural changes are made._
