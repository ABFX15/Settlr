# Demo runbook — the 5-minute happy path

Goal: a tight, reliable walkthrough that makes one point — *"I invoice you, you
pay, the money's in my account in seconds, and no bank can freeze it."* Lead
with the core loop; don't tour 20 pages.

---

## 1. One-time setup (mostly done)

| Thing | Status | Action |
|---|---|---|
| `FEE_PAYER_SECRET_KEY` (funded) | ✅ set, 10 SOL devnet | none |
| Privy email login | ✅ set | none |
| Supabase | ✅ set | **run the new migration** (below) |
| Transak (USD pay) | ✅ staging key | optional in demo |
| Devnet RPC | ✅ set | consider a dedicated RPC (below) |

**Run the migration** (so payees + off-ramp persist): Supabase → SQL Editor →
paste `app/frontend/supabase/migrations/20260616_offramp_payees.sql` → Run.

**Faster RPC (recommended):** the public devnet endpoint is slow and can make
payment confirmation lag mid-demo. Drop a free Helius/QuickNode **devnet** URL
into `NEXT_PUBLIC_SOLANA_RPC_URL` and restart `npm run dev`.

---

## 2. Prep two wallets (do this BEFORE the demo — never live)

**A) Merchant account** — your demo account. Either onboard fresh (impressive:
email → gasless vault) or reuse one you've already created. Keep a
**pre-onboarded backup account** in case live onboarding hiccups on devnet.

**B) Customer wallet** — the one that *pays* the invoice. This is the #1 thing
that breaks demos, so fund it ahead of time:
- **Devnet USDC** → https://faucet.circle.com (select **Solana Devnet**). It
  mints the exact USDC this app uses
  (`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`).
- **Devnet SOL** for gas → https://faucet.solana.com (a little, ~0.05).
- Put both in a Phantom/Solflare wallet you'll pay from (or a phone wallet if
  you're demoing the Terminal QR).

---

## 3. The happy path (~4 min)

1. **(Optional, strong opener) Sign up with email.** Onboarding → email →
   "no wallet, no SOL" → a settlement vault is created gaslessly.
   > *"They just signed up with an email and they already have a bank-grade
   > settlement account. No crypto knowledge, no gas."*

2. **Create an invoice.** Dashboard → Invoices → new, e.g. **$4,500**, a buyer
   name → send. Copy the pay link.

3. **Pay it as the customer.** Open the pay link in the customer wallet's
   browser (or scan the **Terminal** QR with a funded phone wallet) → approve.
   > *"They're paying in seconds — final, no chargeback."*

4. **Show it land.** Back on the merchant dashboard → the payment is there, the
   **USD balance** updated.
   > *"Seconds, not net-30. And that balance can't be frozen — it's not sitting
   > in a bank."*

5. **(Optional) Pay a supplier.** Dashboard → Pay Suppliers → pick one → amount
   → Pay → sign. Money moves merchant-to-merchant, instantly, no bank.

6. **(Optional, for the compliance-minded) Compliance dossier.** Dashboard →
   Compliance → Generate → Download.
   > *"This is what we hand a bank or settlement partner — full proof the money
   > is clean."*

**Tightest version if short on time:** steps 2 → 3 → 4 only. Three minutes,
one undeniable point.

---

## 4. Do NOT touch / claim during a demo

- **Off-ramp "Settle"** (operator console) — it updates status only; **no real
  USD moves.** Fine to *show the workflow* ("we hand the desk this compliance
  file"), but never say "the money wired."
- **Don't claim cash-out is live.** Honest line: *"USD settlement runs through a
  licensed banking partner — that's the integration we're finalizing."*
- Anything needing a key you haven't set will say "not configured" rather than
  break — but don't click into it live.

---

## 5. Dry run (non-negotiable)

Run the **entire** path once, start to finish, ~30 min before the real demo, on
the same machine/network. Devnet is occasionally slow; you want to hit any lag
in rehearsal, not live. If confirmation drags, that's the RPC — switch to the
dedicated one.

---

## 6. The story, not the tour

You have ~30 features. Show **one loop**. The pitch isn't "look how much it
does" — it's *"getting paid is instant and unfreezable, and your customer
didn't need crypto to do it."* Everything else is answered in conversation, not
clicked through.
