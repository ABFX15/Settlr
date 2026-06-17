# How Offbank Works — every step

A technical + operational walkthrough of the whole system. Each section maps to
the real code so you can trace it.

- **Frontend / app:** `app/frontend` (Next.js App Router, TypeScript)
- **On-chain program:** `programs/x402-hack-payment` (Anchor / Solana)
- **DB:** Supabase (Postgres). Most stores fall back to in-memory when Supabase
  isn't configured, so dev/tests run with no DB.

---

## 0. The core idea

Cannabis businesses get paid and pay each other in **USDC** (digital dollars
that no bank can freeze). They only convert to bank USD when they actually need
cash — and that conversion goes through a **cannabis-friendly bank + OTC desk**,
not a normal bank. Two principles run through everything:

1. **Non-custodial** — merchants hold their own funds in a Squads multisig vault.
   We never take custody; they sign their own transactions.
2. **Minimize off-ramp** — the more the network transacts in USDC, the less
   anyone needs to cash out. The off-ramp is the rare, controlled exit.

---

## 1. Onboarding → a settlement vault

**Where:** `/onboarding` · `src/app/onboarding/page.tsx`,
`POST /api/onboarding/vault`, `src/lib/squads.ts`

1. User signs up by **email** (Privy provisions an embedded wallet — no crypto
   needed) or by **connecting a wallet** (Phantom/Solflare).
2. They create a **Squads multisig vault** — their non-custodial settlement
   account (1-of-1: they're the sole signer).
3. **Gasless creation:** a brand-new email wallet has 0 SOL, so the server
   (`/api/onboarding/vault`) builds the vault transaction with the platform
   **fee-payer** sponsoring it. The fee-payer also atomically tops up the
   creator with the multisig rent (~0.002 SOL), because Squads charges that rent
   to the creator, not the fee-payer. The user signs and pays nothing.
4. Signing is **unified** (`src/hooks/useActiveWallet.ts`): the wallet-adapter
   for extension wallets, Privy's signer for email wallets.

**Env:** `FEE_PAYER_SECRET_KEY` (a funded keypair), `NEXT_PUBLIC_PRIVY_APP_ID`,
`PRIVY_APP_SECRET`.

---

## 2. Getting paid in USDC

### 2a. Invoices
**Where:** `/dashboard/invoices`, `/invoice/[token]` ·
`src/app/invoice/[token]/InvoicePayClient.tsx`, `POST /api/invoices`

Merchant creates an invoice → sends a payment link. The payer settles it:
- **With USDC** from their own wallet (connect or email), or
- **With no crypto** (see 2b), or
- **Privately** via Cloak (ZK-shielded), if enabled.

### 2b. Payer has no crypto → pays in USD (Transak)
**Where:** the "Pay with card or bank (USD)" button on the invoice page ·
`src/lib/transak.ts`, `POST /api/integrations/transak/webhook`

1. Opens the **Transak** hosted widget pointed at the **merchant's wallet**, for
   the invoice amount, with `partnerOrderId = invoice view token`.
2. Payer pays USD (card or bank); Transak converts to USDC and sends it to the
   merchant. The **buyer never needs a wallet**.
3. Transak fires a **signed webhook** → we verify the HMAC/JWT signature, match
   the order to its invoice, sanity-check asset/destination/amount, and mark the
   invoice **paid** (same settlement path as on-chain). The invoice page polls
   until it flips to paid.

**Env:** `NEXT_PUBLIC_TRANSAK_API_KEY`, `NEXT_PUBLIC_TRANSAK_ENVIRONMENT`,
`TRANSAK_WEBHOOK_SECRET`.

### 2c. LeafLink orders → auto-invoices
**Where:** `src/lib/leaflink/*`, `POST /api/integrations/leaflink/webhook`

A LeafLink purchase order webhook auto-creates an Offbank invoice and emails the
payment link. When that invoice is paid, the payment is **synced back** onto the
LeafLink order (`src/lib/leaflink/sync.ts`). Signature-verified, idempotent.

### 2d. Verification + crediting
**Where:** `POST /api/invoices/view/[token]/pay`, `src/lib/verify-payment.ts`

A buyer-submitted on-chain payment is **verified** (the tx must contain the
merchant + platform-fee USDC transfers) before the invoice is marked paid, the
merchant treasury balance is credited, a payment record is written, a pipeline
event is emitted, and any LeafLink order is synced back.

---

## 3. The virtual ledger (USD view)

**Where:** `/dashboard/treasury` · `GET /api/treasury/fiat-view`

The dashboard hides crypto entirely. USDC is shown 1:1 as USD:
- **Available to withdraw** (balance minus pending withdrawals),
- **Pending settlements** (cash-outs clearing to the bank, with a count),
- **Settled to bank** (lifetime).

---

## 4. Paying suppliers in USDC (the flywheel)

**Where:** `/dashboard/suppliers` · `src/lib/payees.ts`,
`src/lib/supplier-payment.ts`, `POST /api/payments/supplier`

1. Merchant saves a supplier once (name + wallet + license #) — an address book.
2. To pay: enter an amount, hit **Pay**. The server **AML-screens** the recipient
   (Range), then builds a **non-custodial, gasless** USDC transfer — the merchant
   pays from their **own** wallet (they sign; we never custody), and the
   fee-payer sponsors gas + the recipient's account rent.
3. Money stays inside the network → no bank, no off-ramp needed. The more
   suppliers on-platform, the rarer cash-out becomes.

---

## 5. Cashing out (off-ramp): USDC → USD in a bank

This is the hard part of the model, and it's deliberately honest — nothing is
ever marked "paid" until real money moves.

### Merchant side
**Where:** Dashboard → **Cash Out** → `/dashboard/offramp` · `POST /api/offramp`,
`src/lib/offramp.ts`

1. Merchant requests a cash-out (amount + bank details).
2. Two gates fire first: **KYB** (Sumsub `isUserVerified`) and **AML** (Range
   `screenWallet`). Fail → blocked.
3. The request is saved `pending` with **compliance metadata** auto-attached
   (cannabis license #, risk score, amount, destination). It **never
   auto-completes**.

### Operator side
**Where:** `/admin/offramp` (admin-gated) · `GET/POST /api/admin/offramp`,
`POST /api/admin/offramp/settle`

4. Operator clicks **Batch pending → export** — groups pending payouts into a
   batch and downloads the **compliance CSV** the OTC desk needs (license #,
   amount, destination, risk per payout). Requests move to `processing`.
5. Operator hands the USDC + CSV to the **OTC desk**, which converts to USD and
   wires it to the **cannabis-friendly bank** (e.g. Safe Harbor). *(Partner step
   — see §8.)*
6. Operator clicks **Settle**, enters the wire reference → every payout in the
   batch flips to `completed`; the merchant sees "settled to bank."

### Provider model
**Where:** `src/lib/offramp-providers.ts`

`OFFBANK_OFFRAMP_PROVIDER` is a fallback chain (e.g. `cybrid,manual`) always
ending in `manual` (the OTC-desk/operator path). `cybrid` is a ready adapter for
an automated API partner. Settlement is always confirmed by the signed webhook
`POST /api/integrations/offramp/webhook` (or the operator settle action) — never
faked.

**Env:** `OFFBANK_REQUIRE_KYB_FOR_OFFRAMP`, `OFFBANK_OFFRAMP_PROVIDER`,
`OFFRAMP_WEBHOOK_SECRET`, `SUMSUB_*`, `RANGE_API_KEY`, (`CYBRID_*` when used).

---

## 6. Compliance dossier (the "yes" artifact)

**Where:** Dashboard → Compliance · `GET /api/compliance/report`,
`src/lib/compliance-report.ts`

One downloadable report proving a merchant's funds are clean: verified identity +
license, **KYB** status, **AML** screening, on-chain transaction volume, and
off-ramp history. This is what you hand a bank/OTC desk to win approval —
transparency, not obfuscation.

---

## 7. Key mechanisms

- **Gasless sponsorship** — a platform `FEE_PAYER_SECRET_KEY` keypair sponsors
  network fees + rent so 0-SOL users can transact (vault creation, supplier
  payments). Production needs a *funded* fee-payer on the active network.
- **Non-custodial signing** — `useActiveWallet` returns a unified
  `signTransaction` (adapter or Privy). The platform never holds keys.
- **Provider adapters + fallback** — on-ramp (Transak), off-ramp (manual/cybrid)
  are swappable behind small adapters; settlement is webhook-confirmed.
- **Persistence** — Supabase when configured, else in-memory. Migrations live in
  `app/frontend/supabase/migrations/` (apply via the Supabase SQL editor).
- **Compliance everywhere** — Sumsub (KYB), Range (AML wallet screening),
  on-chain audit trail, per-payout + per-merchant compliance bundles.

---

## 8. What still needs partners (honest gaps)

The software is built end to end. Two things are **business deals, not code**:

1. **A cannabis-friendly bank** (Safe Harbor / Partner Colorado CU) — the USD
   destination, ideally with an **FBO structure** (per-merchant virtual accounts
   so one flagged merchant can't freeze the rest).
2. **An OTC desk / off-ramp counterparty** willing to convert cannabis-sourced
   USDC to USD into that bank.

The off-ramp console hands them exactly what they need (the compliance CSV) and
records the result. See `OFFRAMP_PARTNERS.md` and `PARTNER_ONEPAGER.md`.

---

## 9. Running it

```bash
cd app/frontend
npm install
cp .env.example .env.local   # fill in keys (most features degrade gracefully if unset)
npm run dev                  # http://localhost:3000
npm test                     # unit tests (no DB / no keys required)
npm run build                # production build + type-check
```

- **DB:** apply the SQL files in `app/frontend/supabase/migrations/` in the
  Supabase SQL editor to persist (payees, off-ramp, invoices, etc.).
- **Fee-payer:** set `FEE_PAYER_SECRET_KEY` to a keypair funded on your network
  (devnet faucet / mainnet SOL) or vault creation + supplier payments can't be
  sponsored.
- **Network:** `NEXT_PUBLIC_SOLANA_RPC_URL` / `NEXT_PUBLIC_SOLANA_NETWORK`
  (defaults to devnet). A dedicated RPC (Helius/QuickNode) is much faster than
  the public devnet endpoint.

---

## 10. Quick reference — key endpoints

| Flow | Endpoint |
|---|---|
| Sponsored vault creation | `POST /api/onboarding/vault` |
| Pay invoice (on-chain) | `POST /api/invoices/view/[token]/pay` |
| USD on-ramp webhook | `POST /api/integrations/transak/webhook` |
| LeafLink order webhook | `POST /api/integrations/leaflink/webhook` |
| USD balance (virtual ledger) | `GET /api/treasury/fiat-view` |
| Saved suppliers | `GET/POST /api/payees`, `DELETE /api/payees/[id]` |
| Pay a supplier | `POST /api/payments/supplier` |
| Request cash-out | `POST /api/offramp` |
| Operator: batch + export | `GET/POST /api/admin/offramp` |
| Operator: settle batch | `POST /api/admin/offramp/settle` |
| Off-ramp settlement webhook | `POST /api/integrations/offramp/webhook` |
| Compliance dossier | `GET /api/compliance/report` |
