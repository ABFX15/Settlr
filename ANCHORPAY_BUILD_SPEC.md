# Anchorpay — Complete Build Specification

> Single source of truth. Hand this entire file to Claude Code. It contains the
> full product, architecture, data model, on-chain program, API, frontend design
> system, every screen, copy, and acceptance criteria to build a **fully working
> product** — not a phased MVP. Build it all.
>
> Keep the existing `x402-hack-payment` / Offbank repo for **cannabis**. This is a
> **separate** product.

---

## 1. Product

**Name (working):** Anchorpay
**One-line:** A non-custodial **stablecoin payout & settlement rail** for high-risk
e-commerce merchants (CBD, vape, hemp, supplements, high-risk DTC) who get frozen,
charged back, and terminated by Stripe / Square / PayPal / Elavon.

**Validated problem (2,570 Reddit pain posts, all-time, PullPush.io):**
High-risk online merchants get terminated without warning, lose frozen balances,
and can't keep a processor. Top phrases: chargeback (1,226), payment processor
(929), merchant account (141), high-risk merchant (116), rolling reserve, funds
held.

**The core insight (never violate this):**
The merchant's **shoppers pay by card.** The painkiller is NOT "let customers pay
in crypto." It is: **settle the merchant's money into a wallet only they control —
instant, irreversible-in-their-favor, un-freezable, un-terminable.** Anchorpay
lives on the **payout side**, not the checkout side.

**Two rails:**

1. **Settlement/payout rail (primary).** Merchant receives funds as stablecoin
   into their own non-custodial wallet. No rolling reserve, no 90-day hold, no
   account termination. This is the product.
2. **Crypto-paying checkout widget (secondary).** A drop-in `<script>` for the
   minority of buyers who hold USDC (B2B/wholesale/repeat). Built in the same repo.

**Wedge go-to-market:** "Backup rail." _Your processor can drop you tomorrow. Your
Anchorpay wallet can't. Run us in parallel._ Low-risk yes → expand.

**Non-negotiable legal moat:** **Non-custodial.** Funds move payer → merchant
directly via on-chain atomic transfer. Anchorpay never holds, pools, or controls
merchant funds. This is what keeps us out of Money Transmitter / MSB licensing.
The off-ramp (stablecoin → bank) is done by a **licensed third party**, never us.

---

## 2. Multichain decision (answer to "will we use multichain?")

**Yes — multichain on the receiving side, single settlement core. Here is exactly how.**

- **Settlement core = Solana.** Cheap (sub-cent), fast (sub-second finality),
  ideal for high-frequency merchant payouts. All merchant payout wallets and the
  settlement program live on Solana. Stablecoin = **USDC (Circle)** as the unit of
  account.
- **Multichain INBOUND via Circle CCTP v2 (Cross-Chain Transfer Protocol).**
  Buyers/payers holding USDC on **Ethereum, Base, Arbitrum, Polygon, Optimism,
  Solana** can pay; CCTP burns USDC on the source chain and mints native USDC on
  Solana into the settlement flow. No wrapped tokens, no bridges holding funds —
  CCTP is burn-and-mint, native USDC everywhere. Custody-safe.
- **USDT/Tron consideration.** Many high-risk/offshore merchants live on
  **USDT (Tron)**. Add a Tron USDT inbound path in v2 via an off-ramp/swap partner
  — but do NOT custody. Flag it; don't build it first.
- **Why not multichain settlement core?** Splitting merchant balances across many
  chains fragments liquidity, multiplies audit surface, and complicates the
  non-custodial story. One settlement chain (Solana) + CCTP inbound gives you
  multichain reach without multichain custody risk.

**Architecture rule:** a `ChainAdapter` interface abstracts inbound chains so
adding a chain = adding an adapter, never touching settlement. Build adapters for
**Solana (native)** and **EVM-via-CCTP (Base + Ethereum)** in v1. Stub the rest.

```
Payer USDC on Base ─┐
Payer USDC on ETH  ─┤ CCTP burn → mint native USDC on Solana ─┐
Payer USDC on Sol  ─┘ (direct)                                 │
                                                               ▼
                                          [Anchorpay settlement program]
                                          atomic split: merchant + platform fee
                                                               │
                                                               ▼
                                   Merchant's own Solana wallet (non-custodial)
                                                               │
                                                               ▼
                                   Optional off-ramp via licensed partner → bank
```

---

## 3. Tech stack (build exactly this)

| Layer       | Choice                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| Monorepo    | pnpm workspaces + Turborepo                                              |
| On-chain    | Anchor (Rust), Solana, SPL Token (USDC)                                  |
| Cross-chain | Circle CCTP v2 + Circle Iris API for attestations                        |
| Backend/API | Next.js Route Handlers (App Router) + tRPC OR REST; Node 20              |
| DB          | Supabase (Postgres) — **metadata only**, never funds/keys                |
| Auth        | Supabase Auth (email magic link) + Solana wallet signature               |
| Frontend    | Next.js 15 App Router, TypeScript, Tailwind v4, shadcn/ui, Framer Motion |
| Wallet      | Solana Wallet Adapter (Phantom, Solflare, Backpack)                      |
| State/data  | TanStack Query, Zustand for local UI state                               |
| Charts      | Recharts                                                                 |
| Widget      | Zero-dependency vanilla TS, bundled to a single IIFE `widget.js`         |
| Email       | Resend (onboarding, receipts, alerts)                                    |
| Hosting     | Vercel (web) + Solana devnet→mainnet                                     |
| Testing     | Anchor mocha/tsx, Vitest (SDK/web), Playwright (e2e)                     |
| CI          | GitHub Actions: cargo check + build + typecheck + test + e2e             |

---

## 4. Monorepo layout (create all of this)

```
anchorpay/
├── programs/
│   └── anchorpay/                 # Anchor program (Rust)
│       ├── src/
│       │   ├── lib.rs
│       │   ├── errors.rs
│       │   ├── state/             # merchant.rs, receipt.rs, platform.rs
│       │   └── instructions/      # init_platform, init_merchant, settle, update_fee, rotate_wallet, deactivate
│       └── Cargo.toml
├── packages/
│   ├── sdk/                       # TS client over the IDL + ChainAdapters
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── adapters/          # solana.ts, evm-cctp.ts, types.ts
│   │   │   ├── cctp.ts            # Circle CCTP burn/mint + Iris attestation
│   │   │   └── index.ts
│   │   └── package.json
│   ├── widget/                    # embeddable checkout (IIFE)
│   │   ├── src/widget.ts
│   │   └── package.json
│   └── ui/                        # shared shadcn components + theme
├── apps/
│   ├── dashboard/                 # Next.js merchant dashboard + marketing + API
│   │   ├── src/app/
│   │   │   ├── (marketing)/       # public landing
│   │   │   ├── (auth)/            # login, connect-wallet
│   │   │   ├── (app)/dashboard/   # authed product
│   │   │   └── api/               # route handlers
│   │   ├── src/components/
│   │   ├── src/lib/
│   │   └── supabase/migrations/
│   └── docs/                      # developer docs (Nextra) — API + widget
├── Anchor.toml
├── Cargo.toml                     # workspace
├── turbo.json
├── pnpm-workspace.yaml
├── .nvmrc                         # 20
├── .env.example
└── .github/workflows/ci.yml
```

---

## 5. On-chain program (full spec)

**Program: `anchorpay`** (Anchor, Solana). USDC mint validated on every transfer.

### Accounts / State

```rust
// Platform — singleton PDA, seeds = [b"platform"]
pub struct Platform {
    pub authority: Pubkey,        // platform admin (multisig in prod)
    pub fee_wallet: Pubkey,       // where platform fees land
    pub usdc_mint: Pubkey,        // canonical USDC mint
    pub default_fee_bps: u16,     // default 100 = 1%
    pub paused: bool,
    pub bump: u8,
}

// Merchant — PDA, seeds = [b"merchant", owner.key()]
pub struct Merchant {
    pub owner: Pubkey,            // merchant signer
    pub payout_wallet: Pubkey,    // merchant's OWN token account (non-custodial)
    pub fee_bps: u16,             // per-merchant override, default 150 (1.5%), max 1000 (10%)
    pub total_settled: u64,       // lifetime USDC settled (for dashboard)
    pub payment_count: u64,
    pub refunded_count: u64,      // merchant-initiated refunds (see refund_payment)
    pub kyb_status: u8,           // 0=pending,1=approved,2=rejected,3=suspended
    pub active: bool,
    pub created_at: i64,
    pub bump: u8,
}

// PaymentReceipt — PDA, seeds = [b"receipt", merchant.key(), payment_id]
// Privacy-preserving: stores hashes/amounts, NOT raw memo/PII.
pub struct PaymentReceipt {
    pub merchant: Pubkey,
    pub gross_amount: u64,
    pub fee_amount: u64,
    pub net_amount: u64,
    pub memo_hash: [u8; 32],      // sha256(memo), raw memo never on-chain
    pub source_chain: u8,         // 0=Solana,1=Base,2=Ethereum... (CCTP origin)
    pub timestamp: i64,
    pub bump: u8,
}
```

### Instructions

1. `initialize_platform(default_fee_bps, fee_wallet, usdc_mint)` — admin only, once.
   `default_fee_bps` = **150 (1.5%)**.
2. `initialize_merchant(payout_wallet, fee_bps?)` — merchant registers own wallet.
   Validate `payout_wallet` mint == USDC. `fee_bps` defaults to platform default,
   max 1000. Merchant starts `kyb_status = pending`; cannot `settle_payment`
   above the unverified ceiling until admin sets `kyb_status = approved`
   (see §22 KYB).
3. `settle_payment(payment_id, gross_amount, memo_hash, source_chain)` —
   **atomic**: transfer `net = gross - fee` from payer token account → merchant
   `payout_wallet`, and `fee` → platform `fee_wallet`, in ONE instruction. Create
   `PaymentReceipt`. Increment merchant counters. **Funds never enter a
   program-owned account.** Reject if platform paused, merchant inactive, amount
   0, wrong mint, fee math overflow, or (gross > unverified ceiling AND kyb_status
   != approved).
4. `refund_payment(payment_id, amount)` — **merchant-signed** refund. Because
   on-chain settlement is irreversible, a refund is a NEW transfer from the
   merchant's wallet back to the original payer (recorded against the original
   `PaymentReceipt`). Anchorpay does NOT custody, so the merchant must sign and
   fund the refund from their own wallet. Platform fee on the original is
   optionally rebated to the merchant's wallet by the platform authority (config
   flag). Increment `refunded_count`. (See §21 Refunds & Disputes.)
5. `update_merchant_fee(fee_bps)` — admin only (pricing control); enforce max 1000.
6. `set_kyb_status(merchant, status)` — admin only; gates settlement ceiling.
7. `rotate_payout_wallet(new_wallet)` — owner only; validate USDC mint.
8. `deactivate_merchant()` / `reactivate_merchant()` — owner or admin.
9. `set_paused(bool)` — admin kill-switch.

### Errors (errors.rs)

`PlatformPaused`, `MerchantInactive`, `AmountZero`, `FeeTooHigh`, `WrongMint`,
`MathOverflow`, `Unauthorized`, `WalletMintMismatch`, `KybRequired`,
`RefundExceedsOriginal`.

### Tests (must all pass on devnet)

- init platform + merchant happy path
- settle: exact fee math at 1%, 2.5%, 10%
- settle rejects: paused, inactive, amount 0, wrong mint, fee>1000
- rotate wallet, update fee, deactivate/reactivate auth checks
- receipt PDA stores correct hashed memo + source_chain
- fuzz fee math for overflow at u64 max

---

## 6. Cross-chain (CCTP) flow (full spec)

`packages/sdk/src/cctp.ts` + `adapters/evm-cctp.ts`:

1. Payer on Base/ETH approves USDC to CCTP `TokenMessenger`.
2. `depositForBurn(amount, solanaDomain, mintRecipient=settlementPDA)` burns USDC.
3. Poll **Circle Iris API** for the attestation of the burn message.
4. On Solana, call CCTP `receiveMessage(message, attestation)` to mint native
   USDC to the settlement ATA, then immediately `settle_payment` (same client tx
   batch) → merchant. Net effect: cross-chain pay-in, Solana settlement, merchant
   receives USDC, you never custody.

Adapters expose a uniform interface:

```ts
interface ChainAdapter {
  id: "solana" | "base" | "ethereum" | "arbitrum" | "polygon" | "optimism";
  payAndSettle(params: PaySettleParams): Promise<{ signature: string }>;
  estimate(params: PaySettleParams): Promise<FeeEstimate>;
}
```

v1: implement `solana` (native) and `base` (CCTP). Stub the rest with
`NotImplemented`.

---

## 7. SDK (`packages/sdk`)

Typed client. No global state; inject Connection + wallet.

```ts
createMerchant({ owner, payoutWallet, feeBps? }): Promise<Merchant>
getMerchant(owner): Promise<Merchant | null>
settlePayment({ merchant, gross, memo, payer, sourceChain }): Promise<{ signature }>
simulateSettlement({ merchant, gross }): { net; fee; feeBps }   // for UI preview, no tx
rotatePayoutWallet({ owner, newWallet }): Promise<void>
updateFee({ owner, feeBps }): Promise<void>
listReceipts({ merchant, limit, before? }): Promise<PaymentReceipt[]>
// cross-chain
payFromEvmViaCctp({ adapter, merchant, gross, memo }): Promise<{ signature }>
```

Generate TS types from the IDL. Vitest integration tests on devnet with a funded
keypair. Zero secrets in code (env: `RPC_URL`, `KEYPAIR_PATH`, `IRIS_API_URL`).

---

## 8. Database (Supabase) — metadata ONLY

```sql
-- merchants: mirror of on-chain + business profile + KYB
create table merchants (
  id uuid primary key default gen_random_uuid(),
  owner_pubkey text unique not null,
  payout_wallet text not null,
  business_name text not null,
  business_category text,            -- 'cbd','vape','supplements','ecommerce'...
  legal_entity_name text,
  country text,
  email text,
  fee_bps int not null default 150,
  kyb_status text not null default 'pending', -- pending|approved|rejected|suspended
  risk_tier text not null default 'standard', -- standard|elevated|prohibited
  active boolean not null default true,
  created_at timestamptz default now()
);

-- kyb_records: business verification evidence (KYB provider refs only, no raw docs)
create table kyb_records (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  provider text not null,             -- e.g. 'persona','sumsub','middesk'
  provider_inquiry_id text not null,
  status text not null,               -- pending|approved|rejected|review
  beneficial_owners jsonb,            -- names/roles only; store provider refs, not PII docs
  sanctions_checked boolean default false,
  checked_at timestamptz,
  created_at timestamptz default now()
);

-- sanctions_screenings: OFAC/wallet screening per payer + merchant
create table sanctions_screenings (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,         -- 'wallet'|'merchant'|'payer'
  subject text not null,              -- wallet address or merchant id
  provider text not null,             -- e.g. 'chainalysis','trm','elliptic'
  result text not null,               -- clear|flagged|blocked
  risk_score numeric,
  screened_at timestamptz default now()
);

-- payments: indexed copy of on-chain receipts for fast dashboard queries
create table payments (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  signature text unique not null,
  gross_amount numeric not null,
  fee_amount numeric not null,
  net_amount numeric not null,
  source_chain text not null default 'solana',
  memo text,                          -- raw memo here (off-chain), hash on-chain
  status text not null default 'confirmed',
  created_at timestamptz default now()
);

-- api_keys: for the widget + REST API
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  key_hash text not null,             -- store hash only
  label text,
  last_used_at timestamptz,
  revoked boolean default false,
  created_at timestamptz default now()
);

-- payout_links: hosted "get paid" links
create table payout_links (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  slug text unique not null,
  amount numeric,                     -- null = buyer enters amount
  memo text,
  active boolean default true,
  created_at timestamptz default now()
);
```

**RLS:** every table row-scoped to the authenticated merchant. Never store private
keys, seeds, or fund balances (balance is read from chain).

---

## 9. REST + tRPC API (apps/dashboard/src/app/api)

Public (API-key auth, for widget/integrations):

- `POST /api/v1/payments` — create a settlement intent → returns settlement params
- `GET  /api/v1/payments/:id` — status
- `POST /api/v1/payout-links` — create hosted link
- `GET  /api/v1/merchant` — merchant profile + on-chain stats

Authed dashboard (session):

- `GET /api/merchant`, `PATCH /api/merchant`
- `GET /api/payments?cursor=` — paginated
- `POST /api/api-keys`, `DELETE /api/api-keys/:id`
- `POST /api/rotate-wallet`
- `GET /api/export.csv`

Webhooks OUT (merchant-configured): `payment.confirmed`, signed with HMAC.

Security: rate-limit by API key + IP; validate all inputs with Zod; never log
keys; CORS locked to widget origins.

**Compliance middleware (runs on every `POST /api/v1/payments`):**

- **Sanctions/wallet screening** of the payer wallet AND merchant payout wallet
  via a screening provider (Chainalysis/TRM/Elliptic). Cache results; block on
  `flagged`/`blocked`, write to `sanctions_screenings`.
- **KYB gate**: reject settlements above the unverified ceiling (§22) unless
  `merchants.kyb_status = approved`.
- **Velocity / AML monitoring**: flag structuring patterns (many sub-ceiling
  payments), sudden volume spikes, and new-wallet→high-value; queue for review,
  file SAR via partner if escalated (§20).
- **Prohibited categories**: hard-block merchant categories on the `prohibited`
  list (§19) at onboarding and on every settlement.

---

## 10. Frontend — Design System

**Brand feel:** _Calm, safe, institutional-but-modern._ The buyer is a stressed
small-business owner who has been burned. Lead with **safety and control**, not
crypto hype. Think Stripe's clarity meets a credit-union's trustworthiness.

### Color tokens (shadcn CSS variables — light + dark)

```
--background:        #FBFCFD (light) / #0B0E14 (dark)
--foreground:        #0B1220 / #E6EAF2
--card:              #FFFFFF / #121722
--primary:           #1463FF   (Anchor Blue — trust, action)
--primary-foreground:#FFFFFF
--accent:            #00C2A8   (Mint — "settled / safe")
--success:           #12B76A
--warning:           #F79009
--destructive:       #F04438
--muted:             #5B6577
--border:            #E4E8EF / #232A36
--ring:              #1463FF
radius: 0.75rem
```

Gradient (hero + key CTAs): `linear-gradient(135deg,#1463FF 0%,#00C2A8 100%)`.

### Typography

- Display/headings: **Geist** (or Inter Tight) — tight, confident.
- Body/UI: **Inter**.
- Numbers/amounts/tx: **Geist Mono** (tabular figures for money).
- Scale: 48/36/28/22/18/16/14/12. Headings tracking -0.02em.

### Motion (Framer Motion)

- Page/section: fade+rise 12px, 200ms, ease-out.
- "Settled" success: mint check draw-on + subtle confetti burst (one-shot).
- Number counters animate up on load.
- Respect `prefers-reduced-motion`.

### Components (shadcn/ui + custom)

Button, Card, Badge (status pills: Settled=mint, Pending=amber, Failed=red),
Table (tabular-nums, hover row, tx-link), StatCard, EmptyState, Sheet, Dialog,
Toast (Sonner), CommandPalette (cmd+k), WalletButton, ChainSelector, AmountInput
(mono, big), CopyField, CodeBlock (for snippets), Stepper (onboarding).

---

## 11. Frontend — Every Screen (with layout + copy)

### A. Marketing / Landing — `/(marketing)/page.tsx`

**Hero**

- Eyebrow: `For high-risk merchants`
- H1: **"Get paid in a wallet no one can freeze."**
- Sub: "Stripe, Square, and PayPal can drop you tomorrow and hold your money for
  90 days. Anchorpay settles your sales into a USDC wallet that only you control —
  instant, irreversible, un-terminable."
- Primary CTA: **Start free** → connect wallet. Secondary: **See how it works**.
- Right: animated settlement diagram (card → Anchorpay → your wallet) with a live
  "Settled $X" counter.
- Trust strip: "Non-custodial · No rolling reserves · No chargebacks · Solana +
  multichain."

**Problem section** — 3 cards pulled from real pain:

- "Frozen without warning" — _Square deactivated my account, no one would say why._
- "90-day rolling reserves" — _They hold 25% of every sale for three months._
- "Dropped for your industry" — _Elavon is removing all CBD merchants._

**How it works** — 3 steps: Connect your wallet → Share your pay link or embed the
widget → Funds settle to you instantly in USDC. Run it alongside your current
processor as a backup rail.

**Multichain band** — logos: Solana, Base, Ethereum, Arbitrum, Polygon. "Accept
USDC from any major chain. Settled to you on Solana in seconds via Circle CCTP."

**Pricing** — simple table:

- **Standard 1.5%** per settlement. No monthly fee, no reserve, no setup.
- **Pro $99/mo** — 1.0% + webhooks + multiple wallets + priority support.
- **Scale (custom)** — sub-1% for >$250k/mo GMV, dedicated support, SLA.
- **Off-ramp** — partner rate (USDC→bank via licensed provider; we earn a
  referral share, we never custody fiat). See §17–18.

**FAQ** — custody ("we never hold your money"), legality ("you control the wallet;
we're a settlement rail, not a bank"), volatility ("USDC = 1:1 USD"), chargebacks
("crypto settlement is final — no fraudulent reversals"), taxes ("export CSV").

**Footer CTA band** (gradient): "Stop building your business on someone who can
cut you off." → Start free.

### B. Auth — `/(auth)/login`, `/(auth)/connect`

- Email magic-link OR "Connect wallet." Minimal, centered card, logo, one line of
  reassurance: "Your wallet is your account. We never see your keys."

### C. Onboarding (Stepper) — `/(app)/onboarding`

1. **Connect wallet** (this becomes your payout destination).
2. **Business profile**: name, category (CBD/vape/supplements/ecommerce/other),
   email for receipts.
3. **Confirm payout wallet** — show address, "Funds land HERE. Only you can move
   them." Calls `initialize_merchant`.
4. **Done** — confetti, "You're live on devnet. Here's your pay link + widget
   snippet."

### D. Dashboard Home — `/(app)/dashboard`

- Top: 4 StatCards (tabular mono): **Total settled**, **This month**, **Payments**,
  **Wallet balance** (read live from chain). Each animates up.
- Banner (dismissible): "🔒 Your funds are in your own wallet. Anchorpay never
  holds them."
- Chart: settled volume over time (Recharts area, mint gradient fill).
- Recent payments table (last 10) with status pills + explorer tx links.
- Right rail: "Get paid" quick actions — copy pay link, copy widget snippet,
  create payout link.

### E. Payments — `/(app)/dashboard/payments`

- Full filterable table: date, gross, fee, net, source chain (chain badge),
  memo, status, tx. Cursor pagination. CSV export button. Empty state with a
  friendly illustration + "Share your pay link to receive your first settlement."

### F. Get Paid — `/(app)/dashboard/get-paid`

- Tab 1 **Payment link**: amount (optional), memo → generates hosted
  `/pay/:slug` link + QR. Copy/share.
- Tab 2 **Widget**: live config (amount, memo, button label) → generated
  `<script>` snippet in a CodeBlock + live preview of the modal.
- Tab 3 **API**: create/revoke API keys, show REST examples.

### G. Hosted Pay Page — `/pay/[slug]` (public, buyer-facing)

- Clean checkout: merchant name/logo, amount, ChainSelector (Solana/Base/ETH...),
  "Connect wallet & pay." On success: mint check animation, "Paid — settled
  directly to {merchant}." This is the secondary (crypto-paying) rail.

### H. Settings — `/(app)/dashboard/settings`

- Profile, payout wallet rotation (with scary-good confirmation modal), fee tier,
  webhooks (URL + secret), team email, danger zone (deactivate).

### I. Developer Docs — `apps/docs`

- Quickstart, widget reference, REST reference, CCTP/multichain guide, webhook
  signing, going-live checklist.

**Accessibility:** WCAG AA contrast, full keyboard nav, focus rings (use --ring),
aria labels on all interactive elements, reduced-motion variants, mobile-first.

---

## 12. Widget (`packages/widget`)

Single `<script>` IIFE, zero deps. API:

```html
<script src="https://cdn.anchorpay.xyz/widget.js"></script>
<script>
  Anchorpay.checkout({
    merchant: "MERCHANT_PUBKEY",
    apiKey: "pk_live_...",
    amount: 49.99,
    memo: "Order #1234",
    chains: ["solana", "base", "ethereum"], // shopper picks
    onSuccess: (sig) => {
      /* fulfill */
    },
    onClose: () => {},
  });
</script>
```

Opens overlay modal → wallet connect → chain select → pay → settle via SDK →
success animation + explorer link. Matches the design system. Bundled < 40kb.

---

## 13. Environment (.env.example)

```
# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=
ANCHORPAY_PROGRAM_ID=
USDC_MINT=
PLATFORM_FEE_WALLET=
PLATFORM_KEYPAIR_PATH=          # admin only, never in client

# Circle CCTP
IRIS_API_URL=https://iris-api-sandbox.circle.com
CCTP_TOKEN_MESSENGER_BASE=
CCTP_MESSAGE_TRANSMITTER_SOLANA=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_MODE=false                 # true = run UI/tests without live wallet
```

---

## 14. CI/CD (.github/workflows/ci.yml)

Two jobs, triggered on push/PR to main:

- **program**: Rust stable + cache → `anchor build` → `cargo test` (or anchor test on a local validator).
- **web**: Node 20 → `pnpm install` → `pnpm -r build` → `pnpm -r typecheck` →
  `pnpm -r test` → `pnpm --filter dashboard e2e` (Playwright, DEMO_MODE=true).
- Build BEFORE typecheck (regenerates `.next/types`). Concurrency cancel-in-progress.

---

## 15. Build order for Claude Code (do all, in this order)

1. Scaffold monorepo (§4), tooling, CI skeleton, `.env.example`. Everything compiles.
2. Anchor program (§5) + full test suite green on devnet (incl. `refund_payment`,
   `set_kyb_status`, KYB-ceiling gating, fee = 150 bps).
3. SDK (§7) + CCTP module (§6), Vitest devnet tests green.
4. Supabase migrations + RLS (§8) incl. `kyb_records`, `sanctions_screenings`.
5. API route handlers (§9) with Zod + API-key auth + rate limiting + **compliance
   middleware** (sanctions screening, KYB gate, AML velocity rules, category block).
6. Compliance + onboarding: KYB provider integration (§22), sanctions provider
   (§20), prohibited/elevated category config (§19.4), AML monitoring rules.
7. Billing: Stripe Billing for Pro tier (§18); off-ramp partner referral stub (§18).
8. Design system (§10) in `packages/ui` (theme, tokens, components, fonts, motion).
9. Dashboard app — all screens (§11 A–H) + KYB onboarding + refund flow (§21) +
   admin/compliance + metrics views (§26), wired to SDK + API, DEMO_MODE supported.
10. Hosted pay page (§11G) + widget (§12).
11. Developer docs (§11I) + legal docs (ToS/AUP/Privacy/Merchant Agreement/AML, §19.5).
12. Playwright e2e: onboarding → KYB → settle (devnet) → refund → payments → CSV.
13. Polish pass: empty/loading/error states, mobile, a11y, reduced-motion.
14. Deploy: Vercel preview + devnet. Produce GOING_LIVE.md mainnet + compliance
    checklist (counsel sign-off, MSB read, screening live, KYB live, multisig).
15. Produce `STATUS.md` per §16a: the full ✅/🔌/🚧 component table + a "Founder
    activation checklist" of every env key/account/partner deal still needed.
    There must be **zero 🚧** items.

---

## 16. Acceptance criteria (definition of "fully working")

- [ ] `anchor build` + all program tests pass on devnet; fee math exact; no
      instruction routes funds through a program-owned account.
- [ ] A merchant can onboard with their own wallet and `initialize_merchant`
      succeeds on devnet.
- [ ] A real `settle_payment` moves net→merchant + fee→platform atomically and
      appears in the dashboard payments table with a working explorer link.
- [ ] Cross-chain: a USDC payment from **Base** lands as native USDC settled to
      the merchant on Solana via CCTP (sandbox).
- [ ] Hosted pay link works end-to-end; widget completes a devnet settlement.
- [ ] CSV export, API keys, wallet rotation, webhooks all function.
- [ ] **KYB onboarding works**: merchant submits business details, KYB inquiry is
      created, `kyb_status` gates mainnet settlement above the unverified ceiling.
- [ ] **Sanctions screening runs** on every payment (payer + merchant wallet) and
      blocks flagged addresses; results recorded.
- [ ] **AML monitoring** flags structuring/velocity anomalies into a review queue.
- [ ] **Prohibited categories** are hard-blocked at onboarding and settlement.
- [ ] **Refund flow works**: merchant refunds a payment via `refund_payment` (new
      transfer from merchant wallet to original payer), recorded against the receipt.
- [ ] **Pro billing** subscribes via Stripe and lowers effective fee to 1.0%.
- [ ] Metrics/admin view shows GMV, take rate, active merchants, refund rate,
      screening blocks, KYB pass rate.
- [ ] Legal docs (ToS/AUP/Privacy/Merchant Agreement/AML) are present (drafts).
- [ ] Landing + all screens match the design system; AA a11y; mobile clean;
      reduced-motion respected.
- [ ] CI green (program + web + e2e).
- [ ] No secrets in code; non-custodial verified (funds never held); off-ramp
      never custodied by Anchorpay.

---

## 16a. Definition of Done & stub policy (NO demos, NO silent placeholders)

> **Mandatory for every component.** "Done" means a real test or e2e proves it.
> Demo data, mocked-as-real, or unfinished UI passed off as complete is a defect.

**Every component is exactly one of three states — track them in a STATUS table
you keep updated in `STATUS.md` and restate after each build step:**

- ✅ **FULLY WORKING** — real implementation with a passing test/e2e that proves
  the live path. No mocks in the assertion.
- 🔌 **STUBBED-BLOCKED** — code is real and complete, but the live path needs an
  external account/API key I (the founder) must provide. Allowed ONLY for:
  sanctions provider (Chainalysis/TRM), KYB provider (Persona/Sumsub/Middesk),
  Circle CCTP/Iris sandbox, Stripe Billing, off-ramp partner, email (Resend).
- 🚧 **STUBBED-INCOMPLETE** — not finished. **This state is NOT acceptable at
  hand-off.** Either finish it or explicitly tell me why you cannot.

**Rules for every 🔌 STUBBED-BLOCKED integration:**
1. Hide it behind a clean interface (`SanctionsProvider`, `KybProvider`,
   `BillingProvider`, `OfframpProvider`, `BridgeProvider`, `EmailProvider`).
2. Ship TWO implementations: a working **mock** (for dev/tests) and a **real**
   one that activates automatically when its env key is present.
3. In production with the key missing, it must **throw a loud error** — never
   silently pass a payment, KYB, or screening.
4. Mark the seam with `// STUB: needs <EXACT_ENV_KEY / account>` so I can grep
   `STUB:` and get the full list of what's left to wire up.
5. List it in `STATUS.md` under "What's left for the founder to activate," with
   the exact provider, the env var name, and where to paste the key.

**Anti-faking rules:**
- No hard-coded fake balances, fake tx hashes, or seeded "demo" payments shown as
  real. `DEMO_MODE` is allowed ONLY behind an explicit flag and must be visibly
  labelled "Demo" in the UI.
- Tests must assert against the real implementation, not the mock, for anything
  marked ✅. A test that only exercises the mock keeps the item at 🔌, not ✅.
- Never check an §16 acceptance box you cannot prove with a named test/file/output.

**Hand-off requirement:** there must be **zero 🚧 items**. Produce `STATUS.md`
with the full ✅/🔌/🚧 table and a "Founder activation checklist" (every env key,
account, and signed deal still required to go fully live).

---

## 17. Business model & unit economics

**How we make money — four streams, ranked by reliability:**

| #   | Stream                | Mechanism                                                 | Build status      | Reality                                                                |
| --- | --------------------- | --------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| 1   | **Transaction fee**   | 1.5% skimmed on-chain per `settle_payment`                | ✅ core, coded    | Primary revenue. Automatic, scales with GMV, no invoicing.             |
| 2   | **SaaS subscription** | $99/mo Pro (drops fee to 1.0% + webhooks/multi-wallet)    | ⚙️ Stripe Billing | High margin; add once merchants trust us.                              |
| 3   | **Off-ramp referral** | Revenue share from licensed off-ramp partner on USDC→bank | ⚙️ partner deal   | Real but **partner's** license; we take a referral cut, never custody. |
| 4   | **Float/yield**       | ❌ **NOT pursued**                                        | —                 | Would require custody → MSB. Explicitly rejected.                      |

**Why 1.5% (not 1%):** High-risk card processors charge **3.5–8%** plus rolling
reserves. Our value is not "cheaper" — it's "**un-freezable, un-terminable, final
settlement.**" 1.5% is still a massive discount, leaves margin for the Pro
discount lever, and respects that on-chain settlement has near-zero marginal cost.

**Unit economics per merchant (illustrative, Standard tier @ 1.5%):**

| Merchant GMV/mo | Revenue/mo to us | Notes                              |
| --------------- | ---------------- | ---------------------------------- |
| $10k            | $150             | Small DTC store                    |
| $50k            | $750             | Typical established CBD/vape store |
| $150k           | $2,250           | Multi-SKU operator                 |
| $500k           | $7,500           | Scale-tier (negotiate sub-1%)      |

**Cost to serve per merchant ≈ near-zero variable:** Solana network fees are
sub-cent per settlement (see §23 — _we sponsor gas, budget ~$5–20/merchant/mo at
volume_). Main costs are fixed: RPC, Supabase, screening API calls
(~$0.10–0.50/screen), KYB (~$1–5/merchant one-time), support.

**Path to ramen-profitable (solo founder):**

- Break-even on personal burn (~$4–6k/mo) ≈ **8–10 merchants at $50k GMV** (~$6–7.5k MRR-equivalent).
- That is the **entire near-term goal.** Not 1,000 merchants — _ten good ones._

**CAC reality:** Cannabis cold outreach failed (0/100). The difference here:
CBD/vape merchants are reachable (Shopify/email/Reddit), and the pitch is a
_backup rail_ (low-risk yes), not "rip out your processor." Target **blended CAC
< $300/merchant** via content + community + direct outreach (§25). At $750/mo
revenue, payback < 1 month. That ratio is what makes it bulletproof.

---

## 18. Pricing & packaging (build the pricing UI to match)

- **Standard — 1.5% / settlement.** No monthly, no setup, no reserve. Default
  `fee_bps = 150` on-chain.
- **Pro — $99/mo → 1.0% / settlement.** Webhooks, multiple payout wallets,
  priority support, higher unverified ceiling. Billed via Stripe Billing
  (SaaS subscription is fiat and fine — it's not money transmission).
- **Scale — custom (<1%)** for >$250k/mo GMV, SLA, dedicated support.
- **Off-ramp — partner rate** (e.g. ~1% spread), of which we earn a referral
  share. Displayed transparently; we never quote it as ours.

**Fee transparency:** every settlement shows gross / fee / net in the dashboard
and on the receipt. No hidden reserves, ever — that's the whole brand.

---

## 19. Legal, regulatory & compliance (the existential section)

> **Read this before writing a line of mainnet code.** A payments business that
> hand-waves compliance is not bulletproof — it is a liability that gets seized or
> becomes a laundering vector. Engage a fintech/crypto attorney before mainnet.
> Nothing here is legal advice; it is the build/operating posture.

**19.1 The non-custodial money-transmission question (be honest):**
The claim "non-custodial ⇒ no MSB license" is **mostly** supported by FinCEN's
2019 guidance (a person who only provides software/communications and never
accepts and transmits value for others is generally not a money transmitter).
**But it is not automatic.** If we ever (a) take custody, (b) control private
keys, (c) pool/route funds through accounts we control, or (d) integrate fiat
conversion ourselves, we likely become an MSB and trigger **FinCEN registration +
state Money Transmitter Licenses (≈ all 50 states, $$$, months)**. Therefore the
architecture's non-custodial atomic transfer is not just engineering — **it is the
license-avoidance strategy.** Any design that breaks it must go through counsel.

**19.2 What we register/do regardless (defensive posture):**

- **FinCEN MSB registration** — get a legal read on whether our model requires it;
  many crypto rails register defensively even when arguably exempt.
- **Written AML/BSA program** — designated compliance officer (founder initially),
  documented policies, risk assessment, recordkeeping, annual review.
- **OFAC sanctions compliance** — screen every payer + merchant wallet (§9
  middleware); block sanctioned addresses; no service to sanctioned jurisdictions.
- **KYB on every merchant** (§22) — you must know who you settle for.
- **Travel Rule** — for transfers ≥ threshold, have a partner/VASP solution ready.

**19.3 Off-ramp = licensed partner, full stop.** USDC↔fiat is done by a regulated
provider (e.g. an established off-ramp/VASP). We integrate via API and earn a
referral share. We never touch fiat or convert ourselves. This keeps MTL off us.

**19.4 Prohibited & elevated categories (enforced at onboarding + per settlement):**

- **Prohibited (hard block):** anything illegal federally (incl. marijuana —
  _that's the OTHER product, kept legally separate_), unlicensed pharma/Rx,
  weapons/ammo where restricted, CSAM/illegal adult, unlicensed gambling, Ponzi/
  fraud, sanctioned entities.
- **Elevated (allowed with extra KYB + monitoring):** CBD/hemp (must be ≤0.3% THC,
  Farm-Bill compliant), vape/nicotine (age-gated), supplements/nootropics,
  high-ticket DTC. **CBD is our wedge — but only compliant hemp-derived CBD.**
- Maintain this list in config; screen `business_category` against it.

**19.5 Documents to ship (in `apps/dashboard` + `apps/docs`):**
Terms of Service, Acceptable Use Policy (the category list), Privacy Policy,
Merchant Agreement, AML/KYC Policy, refund/dispute policy. Generate drafts; have
counsel finalize before mainnet.

**19.6 Data & privacy:** GDPR/CCPA basics — minimize PII, store KYB provider
_references_ not raw documents, encrypt at rest, RLS per merchant, data-deletion
flow. Never store keys/seeds.

---

## 20. Risk, fraud & AML operations

- **Chargeback immunity is the feature** — on-chain settlement is final, so the
  fraudulent-chargeback problem (the #1 merchant pain, 1,226 posts) literally
  cannot happen to settled funds. Say this loudly; it's the core value.
- **New fraud vectors we DO inherit:**
  - **Stolen-funds / tainted USDC** → mitigated by payer-wallet sanctions/risk
    screening (§9) before settlement.
  - **Merchant-side laundering** (a bad actor using us to wash funds) → mitigated
    by KYB (§22), category limits (§19.4), and velocity monitoring.
  - **Refund abuse** (merchant refunds to a different wallet to exfiltrate) →
    `refund_payment` records against the original payer; flag mismatches.
- **Transaction monitoring:** rules engine flags structuring (many sub-ceiling
  payments), velocity spikes, sanctioned-adjacent wallets, and first-time
  high-value. Queue → manual review → escalate → **SAR via partner** if needed.
- **Risk tiers** (`merchants.risk_tier`): `standard` / `elevated` / `prohibited`
  set ceilings and monitoring intensity.
- **Kill-switches:** program `set_paused` (global) + per-merchant `deactivate` +
  per-wallet block list. Document an incident-response runbook.

---

## 21. Refunds & disputes (crypto irreversibility — solved explicitly)

The hard truth: **on-chain settlement is irreversible.** A merchant WILL need to
refund a legitimate customer (wrong size, returns). Design for it:

- **`refund_payment` instruction (§5):** merchant signs a NEW transfer from their
  own wallet back to the original payer wallet, recorded against the original
  receipt. Anchorpay never reverses or custodies — the merchant funds the refund.
- **Dashboard refund flow:** from any payment row → "Refund" → pre-fills original
  payer + amount → merchant approves in their wallet. Partial refunds supported.
- **Fee handling:** platform fee on the original is optionally rebated to the
  merchant on full refund (config flag) — fair, and a trust signal.
- **Disputes:** since there are no card-network chargebacks, disputes are
  merchant↔customer. We provide the receipt + tx proof and an optional
  mediation/escrow add-on later (out of v1 scope, note it).
- **Policy doc:** ship a clear refund policy template merchants can adopt.

---

## 22. Merchant onboarding & KYB

- **KYB provider** (Persona / Sumsub / Middesk): verify legal entity, beneficial
  owners, business category, and (for CBD/hemp) Farm-Bill/COA compliance.
- **Flow:** sign up → connect wallet → submit business details → KYB inquiry →
  `kyb_status = pending`. Merchant can test on devnet immediately but mainnet
  settlement above the **unverified ceiling (e.g. $1,000 lifetime)** is blocked
  until `approved` (enforced on-chain §5 + API §9).
- **Sanctions:** screen the merchant's wallet + beneficial owners at onboarding.
- **Store references, not raw docs** (privacy, §19.6). KYB result + provider
  inquiry id only.
- **Re-KYB** on risk events (volume spike, category change, sanctions hit).

---

## 23. Treasury & gas operations

- **Who pays Solana network fees?** To keep merchant UX frictionless, **Anchorpay
  sponsors transaction fees** via a fee-payer/relayer service. Budget: Solana fees
  are ~$0.0005–0.005/tx; even at high volume this is single-digit dollars per
  merchant/month. Fund a hot relayer wallet; alert + auto-top-up at low balance.
- **Fee-collection wallet:** platform fees accrue to `Platform.fee_wallet`. In
  production this is a **Squads multisig** (2-of-3+), never a single hot key.
- **Sweeps:** periodic, documented sweeps from fee wallet to treasury multisig.
- **Stablecoin treasury:** hold operating runway in USDC + fiat; do NOT speculate.
- **Key management:** admin authority = multisig; relayer = limited hot wallet with
  capped balance; merchant keys = never touched.
- **Monitoring:** balance alerts, anomaly alerts on fee wallet, RPC failover.

---

## 24. Competitive landscape

| Competitor                                                             | What they do                         | Why we win                                                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **High-risk card processors** (PaymentCloud, Easy Pay Direct, Durango) | Get you a high-risk merchant account | 3.5–8% + rolling reserves + can still drop you. We're final settlement, no reserve, no termination.                     |
| **BitPay / Coinbase Commerce**                                         | Crypto checkout for merchants        | Checkout-side (shopper must pay crypto) + custodial conversion. We're payout-side + non-custodial + multichain inbound. |
| **Zodaka / FCFPay**                                                    | Crypto payment processors            | Often custodial, thin trust, churny. Our moat: non-custodial + KYB + compliance-first + niche focus.                    |
| **Stripe/Square/PayPal**                                               | Mainstream processors                | They _ban_ this segment — that's our entire TAM.                                                                        |

**Honest risk:** crypto payments are a crowded, often-failed category. We win by
**narrow focus (deplatformed high-risk merchants)** + **non-custodial trust** +
**compliance done right** + **backup-rail wedge** — not by being a generic
"accept crypto" button (explicitly the thing we are NOT, §1).

---

## 25. Go-to-market & distribution

**Goal: ONE design partner, then ten paying merchants.** Not scale.

1. **Direct, helpful outreach** in the exact threads the research found:
   r/CBD, r/ecommerce, r/shopify, r/electronic_cigarette — answer "I got dropped"
   posts with genuine help, mention the backup rail. (Templates in §11.6 build.)
2. **Content wedge:** "What to do when Stripe/Square drops your CBD store" guides;
   rank for the exact pain searches. SEO on deplatforming keywords.
3. **Backup-rail offer:** "Run Anchorpay in parallel with your current processor —
   zero switching cost, never lose a day of revenue if you get dropped." This
   removes the scariest objection (changing payment infra).
4. **Shopify/WooCommerce presence** later (app/plugin) — that's where these
   merchants live.
5. **Referral loop:** deplatformed merchants know other deplatformed merchants
   (same forums, same suppliers). Incentivize referrals.
6. **Land via CBD, expand to vape/supplements/high-risk DTC** (one buyer, §18).

**First-90-days success metric:** 1 merchant settling real volume on mainnet.

---

## 26. Metrics, KPIs & financial model

**Track from day one (build into an internal `/dashboard/admin` view):**

- **GMV settled** (the north star), **take rate** (effective %), **net revenue**.
- **Active merchants**, **new merchants/week**, **activation rate** (onboard →
  first settlement), **churn**.
- **Revenue/merchant**, **CAC**, **CAC payback**, **gross margin**.
- **Ops:** settlement success rate, avg settlement time, screening block rate,
  refund rate, support tickets, gas spend/merchant.
- **Compliance:** KYB pass rate, sanctions flags, SARs filed, review queue depth.

**Simple model to ramen-profit:** 10 merchants × $50k GMV × 1.5% = **$7.5k/mo**.
That clears a solo founder's burn. Everything in this spec is in service of
getting those ten merchants live and retained.

---

## 27. Moat & defensibility

- **Compliance + non-custodial architecture** — hard for a "move fast" competitor
  to replicate without doing the legal work; hard for a custodial competitor to
  match the trust story.
- **Trust brand in a low-trust niche** — "the rail that won't freeze you" with
  real merchants vouching.
- **Vertical depth** — Farm-Bill/COA-aware KYB, category expertise, the exact
  language deplatformed merchants use.
- **Network effects** — referrals within tight high-risk-merchant communities;
  multichain inbound widens reachable payers over time.
- **Switching cost grows** — once payouts, refunds, and reporting run through us,
  we're infrastructure, not a button.

---

## 28. Guardrails (apply throughout)

- **Non-custodial only.** If any flow has Anchorpay holding funds, redesign. Moat
  AND license-avoidance (§19.1).
- **Never store keys/seeds.** Supabase = metadata only; balances read from chain.
- **Compliance is not optional.** KYB, sanctions screening, AML monitoring, and
  category limits ship in v1 — not "later" (§19–22).
- **Off-ramp = licensed partner**, never us. We never touch fiat.
- **Devnet until a design partner.** No mainnet money until proven + counsel-reviewed.
- **Honest positioning.** We are a settlement/payout rail, not a card processor.
- **Keep cannabis in the existing repo.** This product = legal high-risk
  e-commerce (compliant CBD/hemp, vape, supplements), entered via CBD.
- **No demos passed off as real (§16a).** Every component is ✅ / 🔌 / 🚧;
  zero 🚧 at hand-off; mock-blocked integrations throw loudly without their key.

---

## 29. Research provenance

`scripts/reddit-research/scrape.ts`, 12 verticals, 2,570 payment-pain posts
(all-time, PullPush.io):

| Vertical             | Posts | Pain  | Note                               |
| -------------------- | ----- | ----- | ---------------------------------- |
| E-commerce (general) | 1,040 | 2,617 | Real high-risk merchant pain       |
| Crypto-native B2B    | 377   | 1,015 | Mostly news/shill noise — discount |
| Adult / Creators     | 250   | 525   | Real, harder distribution          |
| Credit / Debt        | 221   | 466   | Adjacent, different problem        |
| Vape / Tobacco       | 189   | 399   | Real, same buyer as CBD            |
| CBD / Hemp           | 155   | 379   | Real, most reachable slice         |
| Gambling             | 159   | 324   | Real, heavier legal                |
| Kratom               | 60    | 129   | Real, niche                        |
| Firearms             | 50    | 105   | Real, heavy legal                  |
| Cannabis B2B         | 36    | 81    | Keep in existing repo              |
| Supplements          | 29    | 62    | Thin                               |
| Peptides             | 4     | 8     | Rejected (legal)                   |

Top phrases: chargeback (1,226), payment processor (929), merchant account (141),
high-risk merchant (116), rolling reserve, funds held.

**Conclusion:** CBD / vape / hemp / high-risk e-commerce are ONE buyer — the
deplatformed high-risk online merchant. Build a non-custodial USDC **payout rail**
on Solana with multichain (CCTP) inbound. Enter via CBD. The crypto checkout
button is secondary; the un-freezable payout wallet is the product.
