# Settlr Architecture Documentation

> **Last Updated:** January 2026  
> **SDK Version:** @settlr/sdk@0.6.0  
> **Program ID:** `339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5` (Devnet)

---

## Overview

Settlr is a USDC checkout solution built on Solana. It provides merchants with an embeddable payment widget, gasless transactions for customers, privacy-preserving payments, and optional KYC integration.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMER                                │
│                    (Email or Wallet)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SETTLR CHECKOUT WIDGET                        │
│                    (@settlr/sdk)                                │
│  • React component or hosted page                               │
│  • Privy embedded wallets                                       │
│  • Gasless transactions                                         │
│  • Privacy mode (MagicBlock PER private payments)                │
│  • One-click payments                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SETTLR BACKEND                              │
│                 (Next.js App Router)                            │
│  • API routes for checkout, payments, webhooks                  │
│  • Supabase for persistence                                     │
│  • Kora for gasless sponsorship (external wallets)              │
│  • Privy for gasless sponsorship (embedded wallets)             │
│  • Range Security for wallet risk screening                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SOLANA ANCHOR PROGRAM                        │
│                    (payments + privacy)                         │
│  • On-chain payment processing                                  │
│  • Platform fee collection                                      │
│  • Merchant management                                          │
│  • MagicBlock PER private payments (TEE-secured)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Summary

| Layer       | Technology                           | Status                            |
| ----------- | ------------------------------------ | --------------------------------- |
| Frontend    | Next.js 16 (App Router)              | ✅ Implemented                    |
| SDK         | @settlr/sdk (npm)                    | ✅ v0.6.0 published               |
| Auth        | Privy (embedded wallets)             | ✅ Implemented                    |
| Gasless     | Kora + Privy fee payer               | ✅ Implemented                    |
| Privacy     | MagicBlock Private Ephemeral Rollups | ✅ Implemented                    |
| Security    | Range (wallet risk screening)        | ✅ Implemented                    |
| One-Click   | Saved payment methods                | ✅ Implemented                    |
| Database    | Supabase (with in-memory fallback)   | ✅ Implemented                    |
| KYC         | Sumsub                               | ⚠️ Scaffolded, not enforced       |
| Cross-chain | Mayan                                | ❌ Documented but NOT implemented |
| On-chain    | Anchor (Solana)                      | ✅ Deployed to devnet             |

---

## Directory Structure

```
x402-hack-payment/
├── app/frontend/              # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/           # API routes
│   │   │   │   ├── checkout/  # Checkout session management
│   │   │   │   ├── payments/  # Payment processing
│   │   │   │   ├── kyc/       # Sumsub KYC integration
│   │   │   │   ├── gasless/   # Kora gasless endpoints
│   │   │   │   ├── merchants/ # Merchant management
│   │   │   │   ├── webhooks/  # Webhook handlers
│   │   │   │   └── subscriptions/
│   │   │   └── checkout/[id]/ # Hosted checkout page
│   │   ├── components/        # React components
│   │   ├── lib/               # Core utilities
│   │   │   ├── db.ts          # Database service layer
│   │   │   ├── supabase.ts    # Supabase client
│   │   │   ├── kora.ts        # Kora gasless integration
│   │   │   ├── sumsub.ts      # Sumsub KYC integration
│   │   │   └── solana.ts      # Solana utilities
│   │   ├── providers/         # React context providers
│   │   └── anchor/            # Generated Anchor types
│   └── supabase/
│       └── migrations/        # Database migrations
├── packages/sdk/              # Published npm package
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

- `packages/sdk/src/privacy.ts` - PER SDK helpers (PDAs, connections, permissions)
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

### Mayan (Cross-Chain)

**Purpose:** Bridge USDC from Ethereum/Base/Arbitrum to Solana

**Documented in:** README.md, packages/sdk/README.md

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

### Installation

```bash
npm install @settlr/sdk
```

### Client Usage

```typescript
import { SettlrClient } from "@settlr/sdk";

const settlr = new SettlrClient({
  apiKey: "sk_test_...",
  baseUrl: "https://settlr.xyz",
});

const session = await settlr.createCheckoutSession({
  amount: 49.99,
  currency: "USDC",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});
```

### React Component

```tsx
import { CheckoutButton } from "@settlr/sdk";

<CheckoutButton
  apiKey="sk_test_..."
  amount={49.99}
  currency="USDC"
  successUrl="/success"
  cancelUrl="/cancel"
/>;
```

### Webhook Verification

```typescript
import { verifyWebhookSignature } from "@settlr/sdk";

const isValid = verifyWebhookSignature(payload, signature, secret);
```

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

## Known Gaps / TODOs

1. **Cross-chain (Mayan)** - Documented but not implemented
2. **KYC Enforcement** - Sumsub integrated but not blocking payments
3. **Subscriptions** - Database schema exists, full flow incomplete
4. **Webhook Retry** - No automatic retry on webhook delivery failure
5. **Rate Limiting** - Basic implementation, needs Redis for production
6. **Multi-sig** - Squads integration scaffolded in `init-with-squads.ts`
7. **Privacy Cash Production** - Currently in demo mode (devnet simulation)
8. **Kora Local Server** - Requires running Kora locally for gasless (Privy works independently)

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

```bash
cd packages/sdk
npm version patch
npm publish --access public
```

---

## Quick Reference

| What            | Where                               |
| --------------- | ----------------------------------- |
| Program source  | `programs/x402-hack-payment/src/`   |
| Frontend        | `app/frontend/`                     |
| SDK source      | `packages/sdk/src/`                 |
| API routes      | `app/frontend/src/app/api/`         |
| Database types  | `app/frontend/src/lib/db.ts`        |
| Anchor IDL      | `target/idl/x402_hack_payment.json` |
| Generated types | `target/types/x402_hack_payment.ts` |

---

_This document should be updated whenever significant architectural changes are made._
