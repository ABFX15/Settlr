# High-Risk Merchant Payout Rail — Build Prompts

> A new, standalone product. Keep the existing `x402-hack-payment` / Offbank repo
> for the **cannabis** wedge. This document is a sequence of copy‑paste prompts to
> build a **separate** product from scratch with an AI coding agent.

---

## 0. What we are building (read first)

**Product name (working):** _Anchorpay_ (placeholder — rename later).

**One-line:** A non-custodial USDC **payout & settlement rail** for high-risk
e-commerce merchants who keep getting frozen, charged back, and terminated by
Stripe / Square / PayPal / Elavon.

**The validated problem (from Reddit research, 2,570 pain posts):**

- High-risk online merchants (CBD, hemp, vape, kratom, supplements, general
  "high-risk" e-commerce) get **terminated without warning**, lose their
  **frozen balance**, and can't find a processor that won't drop them.
- Dominant pain phrases: **chargeback (1,226)**, **payment processor (929)**,
  **merchant account (141)**, **high risk merchant (116)**, **rolling reserve**,
  **funds held**.
- Real quotes:
  - "Square deactivated my account... no one would tell me why."
  - "Elavon removing all CBD merchants from their system."
  - "Stripe will give you violations and issues" if you're high-risk.

**The key product insight (do not forget):**
The merchant's **shoppers still pay by card.** So the painkiller is **NOT**
"let customers pay in crypto" (that's a vitamin nobody's customers use). The
painkiller is: **"settle the merchant's money somewhere it can't be frozen,
clawed back, or terminated."**

**Therefore the product sits on the PAYOUT side, not the checkout side.**

```
Shopper ──card──▶ [acquirer / processor] ──settles──▶ [Anchorpay payout rail]
                                                         │
                                                         ├─ converts to USDC
                                                         ├─ pays into MERCHANT's
                                                         │  own non-custodial wallet
                                                         │  (instant, no hold,
                                                         │   no rolling reserve)
                                                         └─ optional off-ramp /
                                                            pay-suppliers-in-USDC
```

**Secondary rail (reuse later):** a crypto-paying checkout widget for the
minority of B2B / wholesale / repeat buyers who DO hold USDC. Build this LAST.

**Biggest architectural fork (decide in Phase 1):**

- (A) **Partner model:** integrate an existing high-risk card acquirer; you own
  only the USDC payout + off-ramp layer. Faster to a real customer, less legal
  surface, but you depend on a partner.
- (B) **Crypto-native model:** target merchants whose buyers already hold USDC
  (B2B, wholesale, crypto-native DTC); you skip cards entirely and are pure
  on-chain checkout + settlement. Smaller market, but you ship without a partner
  and with far less compliance risk.

> Recommendation: **Build B first as an MVP to prove the settlement UX and get a
> design partner, while validating a partner (A) in parallel for the card side.**

**Legal gate (the real risk, same lesson as peptides/cannabis):** the moment you
convert USDC↔USD for a merchant you may be a Money Transmitter / MSB. Staying
**non-custodial** (funds flow merchant-to-merchant, you never take custody) is
what keeps you out of that bucket. Treat "do we ever hold funds?" as a hard
no for the MVP.

---

## How to use this file

Each phase is a prompt you can paste into a fresh coding-agent session. Run them
**in order**. After each phase: commit, run the verification step, and only then
move on. Do **not** skip the legal/compliance prompts.

---

## Phase 1 — Decision + spec (do this before any code)

```
You are my technical co-founder. I'm building a non-custodial USDC payout &
settlement rail for high-risk e-commerce merchants (CBD, vape, hemp, supplements,
high-risk general). Their shoppers pay by card; the product settles the
MERCHANT's payouts into their own non-custodial wallet as USDC — instant, no
rolling reserve, no freeze, no termination risk.

Do three things:
1. Help me choose between (A) partner with an existing high-risk card acquirer
   and own only the USDC payout/off-ramp layer, vs (B) go crypto-native and only
   serve merchants whose buyers already hold USDC. Give me the 5 questions that
   decide this and your recommendation for a solo founder with ~3 months runway.
2. Write a one-page product spec: core user (the merchant), the 3 jobs-to-be-done,
   the single "aha" moment, and the smallest possible MVP that delivers it.
3. List every point where I might take custody of funds, and design the flow so
   I NEVER do (non-custodial only). Flag any MTL/MSB/KYC trigger.

Output as markdown. Be blunt about what NOT to build.
```

**Verify:** You have a written decision (A or B), a one-page spec, and a
custody/compliance map. Do not proceed without these.

---

## Phase 2 — Scaffold the new repo

```
Scaffold a new standalone monorepo called `anchorpay` (separate from any existing
project). Stack:
- Solana program in Anchor (Rust) for non-custodial USDC settlement/payout.
- Next.js (App Router, TypeScript, Tailwind, shadcn/ui) merchant dashboard.
- Supabase (Postgres) for merchant + payout metadata only — NEVER store funds,
  private keys, or seed phrases.
- Shared TypeScript SDK package for the on-chain client.

Create:
- /programs/anchorpay (Anchor program)
- /app/dashboard (Next.js merchant dashboard)
- /packages/sdk (TS client)
- /packages/widget (embeddable checkout — STUB ONLY for now)
- Root: Anchor.toml, Cargo workspace, pnpm workspace, .nvmrc (Node 20),
  .env.example, README, .gitignore
- A GitHub Actions CI: cargo check for the program + build/typecheck/test for
  the dashboard.

Give me the full folder tree and the commands to install + build everything on
macOS. Use devnet by default. Do not write business logic yet — just a clean,
compiling skeleton.
```

**Verify:** `anchor build` compiles, `pnpm -r build` passes, CI is green.

---

## Phase 3 — Core on-chain settlement program

```
In /programs/anchorpay, write an Anchor program for non-custodial USDC payouts.

Requirements:
- A `Merchant` account: owner pubkey, payout wallet (merchant-owned), fee_bps
  (platform fee in basis points, default 100 = 1%, max 1000), created_at, active.
- An instruction `initialize_merchant` (merchant registers their own payout
  wallet — the program NEVER custodies their funds).
- An instruction `settle_payment`: given a payment amount in USDC, transfer
  (amount - fee) directly to the merchant's payout wallet and `fee` to the
  platform fee wallet, ATOMICALLY, in one transaction. The funds move
  payer -> merchant directly; the program never holds them.
- A `PaymentReceipt` PDA (optional, privacy-preserving) recording amount, fee,
  timestamp, and a memo hash — NOT the full memo.
- Custom errors for: inactive merchant, fee too high, amount zero, wrong mint.
- Use the SPL token program for USDC (devnet mint). Validate the mint.

Write the program, the IDL, and Anchor mocha/tsx tests covering: happy path,
fee math, fee-too-high rejection, inactive merchant rejection, wrong-mint
rejection. Run the tests on devnet and show me they pass.
```

**Verify:** All program tests pass on devnet. Fee math is exact. No instruction
ever moves funds into a program-owned account.

---

## Phase 4 — TypeScript SDK

```
In /packages/sdk, build a typed client for the anchorpay program.

Expose:
- `createMerchant({ owner, payoutWallet, feeBps })`
- `settlePayment({ merchant, amount, memo, payer })` -> returns signature
- `getMerchant(pubkey)` and `getReceipt(pubkey)`
- A `simulateSettlement()` helper that returns the exact split (merchant amount,
  fee) without sending, for UI preview.

Constraints:
- Pure functions, no global state. Inject the Connection + wallet.
- Full TS types generated from the IDL.
- Unit tests against devnet with a funded test keypair.
- Zero secrets in code; read RPC + keypair path from env.

Show the test run passing.
```

**Verify:** SDK builds, types resolve, devnet integration test passes.

---

## Phase 5 — Merchant dashboard (the actual product surface)

```
In /app/dashboard, build the merchant dashboard with Next.js App Router +
Tailwind + shadcn/ui. Use the SDK from /packages/sdk.

Screens:
1. Onboarding: connect a Solana wallet (merchant's OWN wallet = their payout
   destination). Set business name + fee tier. Call initialize_merchant.
2. Dashboard home: total settled (USDC), this-month volume, count of payouts,
   current balance in their wallet (read-only from chain). Make crystal clear:
   "Funds are in YOUR wallet. We never hold them."
3. Payouts table: every settle_payment with amount, fee, time, tx link to
   Solana explorer.
4. "Get paid" page: a hosted payment link + copyable snippet the merchant can
   use to receive a USDC settlement (for the crypto-native MVP / B2B reorders).
5. Settings: rotate payout wallet, view fee, export CSV.

Design guidance: this is for non-crypto-native small business owners who are
SCARED of getting frozen. Lead every screen with safety and clarity, not crypto
jargon. Follow good frontend craft (states, empty states, error handling,
mobile). Use DEMO_MODE env to run without a live wallet for tests.

Show it running locally and a screenshot of the dashboard.
```

**Verify:** Onboarding works end-to-end on devnet; a real settle_payment shows up
in the payouts table with a working explorer link.

---

## Phase 6 — The wedge: "deplatforming backup rail" positioning

```
I want merchants to adopt this as a LOW-RISK BACKUP rail first ("your processor
can drop you tomorrow; your USDC payout wallet can't"), then expand.

Do two things:
1. Build a public landing page (/app/dashboard/(marketing)) targeting high-risk
   e-commerce merchants. Headline on safety: no freezes, no rolling reserves, no
   termination, instant settlement to a wallet only they control. Include a
   "Run us in parallel with your current processor" CTA. Pull real pain quotes
   (CBD/vape merchants getting dropped) as social proof framing.
2. Write a 5-email cold outreach sequence + 3 Reddit-comment templates (helpful,
   not spammy) for r/CBD, r/ecommerce, r/shopify, r/electronic_cigarette where
   merchants ask about getting dropped. The goal is ONE design-partner merchant,
   not scale.

Keep copy honest — we are a settlement/payout rail, not a card processor.
```

**Verify:** Landing page deploys; you have a concrete outreach plan and a list of
~20 target threads/merchants.

---

## Phase 7 — Off-ramp / spend path (retention — only after a design partner)

```
Design (don't fully build yet) the path for a merchant to USE their USDC:
- Option 1: partner off-ramp (USDC -> bank) via a licensed third party so WE
  never touch custody or fiat conversion.
- Option 2: "pay your suppliers in USDC" — merchant-to-supplier transfer using
  the same settlement program.

Produce: an architecture doc, the exact custody/compliance boundary (we stay
non-custodial), a shortlist of off-ramp partners that work for high-risk
merchants, and the smallest integration that lets ONE design-partner merchant
actually spend their balance. Flag every MTL/MSB/KYC trigger and how staying
non-custodial avoids it.
```

**Verify:** You have a written off-ramp architecture with a clear "we never take
custody" boundary, reviewed before any integration.

---

## Phase 8 — Crypto-paying checkout widget (LAST, secondary rail)

```
In /packages/widget, build an embeddable checkout widget (vanilla JS, no
framework, single <script> tag) for the MINORITY of buyers who DO pay in USDC
(B2B/wholesale/repeat). API:

  Anchorpay.checkout({
    merchant: 'MERCHANT_PUBKEY',
    amount: 49.99,
    memo: 'Wholesale reorder #123',
    onSuccess: (sig) => {...}
  })

It opens a modal, connects a wallet, calls settle_payment via the SDK, shows
success + explorer link. This is the SECONDARY rail — do not let it become the
main pitch. Keep it tiny and dependency-free.
```

**Verify:** A test HTML page can load the widget and complete a devnet USDC
settlement.

---

## Guardrails (apply to every phase)

- **Non-custodial only.** If any design has us holding merchant funds, stop and
  redesign. This is the legal moat.
- **Never store keys/seeds.** Supabase holds metadata only.
- **Devnet until a design partner.** No mainnet money until the flow is proven.
- **One design partner before scale.** The goal of Phases 1–6 is a single real
  merchant using it, not a polished platform.
- **Honest positioning.** We are a settlement/payout rail, not a card processor.
  Don't claim to solve card acceptance we don't own.
- **Keep cannabis separate.** This repo is for high-risk e-commerce. The existing
  Offbank repo stays the cannabis product.

---

## Research provenance (why this product)

Source: `scripts/reddit-research/scrape.ts` over 12 high-risk verticals, 2,570
qualifying payment-pain posts (all-time, PullPush.io).

| Vertical             | Posts | Pain  | Notes                              |
| -------------------- | ----- | ----- | ---------------------------------- |
| E-commerce (general) | 1,040 | 2,617 | Real high-risk merchant pain       |
| Crypto-native B2B    | 377   | 1,015 | Mostly news/shill noise — discount |
| Adult / Creators     | 250   | 525   | Real, but harder distribution      |
| Credit / Debt        | 221   | 466   | Adjacent, different problem        |
| Vape / Tobacco       | 189   | 399   | Real, same buyer as CBD            |
| CBD / Hemp           | 155   | 379   | Real, most reachable slice         |
| Gambling             | 159   | 324   | Real, heavier legal                |
| Kratom               | 60    | 129   | Real, niche                        |
| Firearms             | 50    | 105   | Real, heavy legal                  |
| Cannabis B2B         | 36    | 81    | Keep in existing repo              |
| Supplements          | 29    | 62    | Thin                               |
| Peptides             | 4     | 8     | Rejected (legal)                   |

Top phrases: chargeback (1,226), payment processor (929), merchant account
(141), high risk merchant (116), accept crypto (198 — largely noise),
rolling reserve, funds held.

**Conclusion:** CBD/vape/hemp/high-risk-ecommerce are ONE buyer — the
deplatformed high-risk online merchant. Build for that buyer; enter via CBD
because it's the most reachable. The product is a non-custodial USDC **payout
rail**, not a crypto checkout button.
