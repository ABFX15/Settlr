# Settlr — Colosseum Frontier Hackathon Submission

> **Hackathon:** Solana Frontier (April 6 – May 11, 2026)
> **Submitted:** April 13, 2026

---

## Project Name

Settlr

## Tagline

Non-custodial stablecoin settlement rails for cannabis B2B — replacing cash drops and 8% processors with 1% instant USDC on Solana.

## Category / Track

**DeFi / Payments**

Also relevant: Infrastructure, Real-World Assets

## Links

| Field                | URL                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Demo**        | https://settlr.dev                                                                                                                              |
| **GitHub**           | https://github.com/ABFX15/Settlr                                                                                                                |
| **Pitch Deck**       | Included in repo (`pitch-deck.html`)                                                                                                            |
| **Demo Video**       | `TODO — Record before final submission`                                                                                                         |
| **Program (Devnet)** | [339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5](https://explorer.solana.com/address/339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5?cluster=devnet) |

---

## Problem (Copy-paste for form)

Cannabis operators move $34B+ annually through cash or predatory payment processors. Over 60% lack stable banking — the SAFE Banking Act has failed for 7+ years, and Schedule III rescheduling didn't solve it. Banks still close cannabis accounts without warning.

The operators who do find payment processors pay 5–12% in fees with rolling reserves that tie up 5–15% of revenue for 6 months. A $10M distributor burns $500K–$1.2M per year just to accept payments. The rest — roughly 30–50% of B2B cannabis transactions — are still done in cash, adding $60K–$120K in annual security, transport, and vault costs.

Settlement is slow (3–10 business days), expensive (8–12%), and fragile (account freezes with no warning). Chargebacks, rolling reserves, and net-30/60 PO terms compound the working capital trap.

No one in crypto has solved this. We searched the Colosseum builder database (5,400+ Solana projects) — zero alive in cannabis B2B stablecoin settlement.

## Solution (Copy-paste for form)

Settlr is non-custodial USDC settlement infrastructure for cannabis, built on Solana. We replace cash drops and high-risk processors with 1% flat-fee instant settlement and a cryptographic audit trail.

**How it works:**

1. **LeafLink PO created** → Settlr receives webhook automatically
2. **Compliance-stamped invoice** generated (METRC tags, license numbers, PO reference)
3. **Payment link emailed** to buyer via Resend
4. **Buyer pays USDC** on Solana — settlement in <5 seconds
5. **On-chain proof** synced back to LeafLink order

**Key differentiators:**

- **Non-custodial** — funds flow directly between counterparties. Settlr never holds assets. Per FinCEN Guidance FIN-2019-G001, no MTL required.
- **Gasless** — Kora-sponsored transactions + Privy embedded wallets. Users pay $0 in gas and don't need a wallet app.
- **Private settlements** — MagicBlock Private Ephemeral Rollups hide amounts and counterparties inside Intel TDX hardware enclaves during processing.
- **GENIUS Act compliant** — USDC is a fully-compliant payment stablecoin under GENIUS Act 2025. Circle reserves backed by U.S. Treasuries.
- **LeafLink integration** — Direct webhook integration with the largest cannabis B2B marketplace. Automatic PO → Invoice → Settlement → Proof sync-back.

**Result:** A $2M-volume operator saves ~$230K/year vs. incumbents.

---

## Description (Long form)

Settlr is stablecoin settlement infrastructure purpose-built for cannabis wholesale. We plug directly into LeafLink — the marketplace where cannabis distributors already manage purchase orders — and automate the entire payment lifecycle: order intake, compliance-stamped invoicing, USDC settlement on Solana, and on-chain proof sync-back.

### Why Cannabis?

The $34B+ US cannabis wholesale market has a unique payments problem that no one else is solving:

- **Banking exclusion is structural.** The SAFE Banking Act has failed for 7 consecutive years. Schedule III rescheduling didn't fix payment access. Banks close cannabis accounts without warning.
- **Incumbents are predatory.** High-risk processors charge 5–12% with rolling reserves. A mid-size distributor ($10M annual volume) pays $500K–$1.2M/year just for payment processing.
- **Cash is still king — and it's dangerous.** 30–50% of B2B cannabis transactions are cash. Armed transport, vault storage, and robbery risk cost $60K–$120K/year per operator.

### Why Stablecoins on Solana?

- **T+0 settlement** — Under 5 seconds, not 3–10 business days
- **1% flat fee** — Not 8–12% + reserves
- **Non-custodial** — No bank can freeze your funds (we never hold them)
- **Immutable audit trail** — Every transaction on-chain for compliance
- **GENIUS Act framework** — Federal stablecoin clarity since 2025

### What's Built

Settlr is a complete settlement stack, not a prototype:

- **Solana Anchor Program** (7 instructions) — deployed to devnet
- **LeafLink Integration** — Webhook intake, invoice creation, payment link emails, on-chain proof sync-back with METRC tags
- **Operator Dashboard** — Revenue analytics, invoices, settlements, AR aging, collections, reports
- **Payment Links / Blinks** — Solana Actions URLs shareable on Twitter/X, Discord, Telegram, SMS
- **Gasless UX** — Kora-sponsored gas + Privy embedded wallets (turn-key for non-crypto users)
- **Private Settlements** — MagicBlock PER (Private Ephemeral Rollups) on Intel TDX enclaves
- **Compliance Suite** — OFAC wallet screening (Range), METRC tag embedding, BSA/AML monitoring
- **Data Pipeline** — Real-time event streaming (SSE), batch aggregation, CSV/JSON export
- **Rate Limiting** — Upstash Redis sliding window on all endpoints
- **Security Hardening** — Full OWASP audit, input validation, CORS, helmet headers

### Market Opportunity

- **TAM:** $20B+ (cannabis operators without stable banking)
- **SAM:** $5–8B (B2B distributors on LeafLink and similar)
- **SOM Year 1:** $100M–$500M in settlement volume
- **Revenue at scale:** 10–20% market penetration = $20M–$100M+ ARR

### Competitive Landscape

We searched the Colosseum builder database (5,400+ projects) and ran landscape checks across The Grid (6,300+ products). **Zero alive competitors** in cannabis B2B stablecoin settlement. Prior attempts (PaySign, CanPay) were traditional payment networks — none used stablecoins or blockchain rails.

---

## Tech Stack

| Layer          | Technology                     | Purpose                                                        |
| -------------- | ------------------------------ | -------------------------------------------------------------- |
| Settlement     | Solana + USDC (SPL Token)      | Sub-5s finality, <$0.0001 gas                                  |
| Smart Contract | Anchor v0.31.1                 | 7 instructions (init, register, payment, payout, refund, fees) |
| Privacy        | MagicBlock PER (Intel TDX TEE) | Hidden amounts/counterparties during processing                |
| Backend        | Next.js 16 (App Router)        | API routes, SSR dashboard                                      |
| Database       | Supabase + in-memory fallback  | 23 migrations, dual-mode storage                               |
| Auth           | Privy                          | Embedded wallets, social login                                 |
| Gasless        | Kora (Solana Foundation)       | Fee-sponsored transactions                                     |
| Email          | Resend                         | Transactional invoice/payment emails                           |
| Security       | Range Security                 | OFAC wallet screening, address poisoning                       |
| Cannabis       | LeafLink REST API v2           | Wholesale marketplace integration                              |
| Pay Links      | Solana Actions / Blinks        | Universal shareable payment URLs                               |
| Treasury       | Squads Multisig                | Multi-sig program authority                                    |
| Pipeline       | Custom event system            | SSE streaming, batch aggregation, CSV/JSON export              |

### On-Chain Program

```
Program ID: 339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5 (Devnet)
```

**Instructions:**

- `initialize_platform` — Set up platform config + fee vault
- `register_merchant` — On-chain operator registration
- `process_payment` — USDC settlement with auto fee deduction
- `process_payout` — Batch disbursements to merchants
- `refund_payment` — Full refund with on-chain audit
- `update_platform_fee` — Governance-controlled fee changes
- `claim_platform_fees` — Withdraw accumulated platform fees

**PER Instructions** (Private Ephemeral Rollups):

- `issue_private_receipt` — Create session on base layer
- `delegate_private_payment` — Delegate to TEE enclave
- `process_private_payment` — Execute inside enclave (sub-10ms)
- `settle_private_payment` — Commit result back to base layer

---

## Team

| Name        | Role          | Links                                                                        |
| ----------- | ------------- | ---------------------------------------------------------------------------- |
| Adam Bryant | Founder & CEO | [GitHub](https://github.com/ABFX15) · [Twitter](https://twitter.com/SettlrP) |

Solo technical founder. Built the entire stack — smart contracts, dashboard, integrations, compliance, privacy, and data pipeline.

---

## What Makes This a Hackathon Project (Not Just an Idea)

Everything is built and deployed:

| Component            | Evidence                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Solana program       | Deployed to devnet — [view on Solscan](https://solscan.io/account/339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5?cluster=devnet) |
| Live frontend        | [settlr.dev](https://settlr.dev) — full dashboard, landing pages, compliance docs                                              |
| LeafLink integration | Webhook intake → invoice → payment → sync-back (5 API endpoints)                                                               |
| Gasless payments     | Kora + Privy integrated and functional                                                                                         |
| Private settlements  | MagicBlock PER with 4 on-chain instructions                                                                                    |
| Compliance           | OFAC screening, METRC tags, BSA/AML monitoring                                                                                 |
| Data pipeline        | Event streaming (SSE), aggregation, CSV/JSON export                                                                            |
| Tests                | 21 pipeline tests passing, Anchor integration tests                                                                            |
| Security             | Rate limiting on all endpoints, input validation, full OWASP audit                                                             |

---

## Weekly Update Template

### Week 1 (April 6–13)

**What was built this week:**

- Complete data pipeline: event emission, batch processing, aggregation, real-time SSE streaming, CSV/JSON export
- Rate limiting on all 23 POST endpoints (Upstash Redis sliding window)
- Full OWASP security audit and hardening
- Pipeline test suite (21/21 passing)
- Investor pitch deck (13-slide HTML)
- Hackathon submission materials

**What's planned for next week:**

- Record demo video walkthrough
- Deploy to Solana mainnet (or maintain devnet demo with full test coverage)
- First outreach to LeafLink operators for pilot testing
- Colosseum Copilot competitive landscape research

**Blockers:**

- None currently

---

## Judging Criteria Alignment

Based on Colosseum's evaluation framework:

### 1. Functionality

- Fully functional product — not a prototype. Dashboard, invoicing, payments, compliance, analytics all work end-to-end.
- Smart contract deployed and tested on devnet.

### 2. Potential Impact

- $34B+ addressable market with zero crypto competitors.
- Saves operators $140K–$230K annually per $2M in volume.
- Every cannabis operator in the US is a potential customer.

### 3. Novelty

- First B2B stablecoin settlement for cannabis on any chain.
- MagicBlock PER privacy integration is unique — no other payment project uses TEE-secured private transactions.
- LeafLink integration is first-of-kind (largest cannabis B2B marketplace).

### 4. Design

- Clean operator dashboard with revenue analytics, AR aging, collections automation.
- Gasless UX — payers don't need wallets or crypto knowledge.
- Compliance-first design (METRC, OFAC, BSA/AML built in from Day 1).

### 5. Composability

- Solana Actions / Blinks — payment links work in any platform that supports Actions.
- REST API for third-party integrations.
- Planned SDK (@settlr/sdk) for white-label settlement.

---

## Submission Checklist

- [x] Project name and tagline
- [x] Problem statement
- [x] Solution description
- [x] GitHub repository (public)
- [x] Live demo URL (settlr.dev)
- [x] Program deployed to devnet
- [x] Tech stack documented
- [x] Team information
- [x] Pitch deck (pitch-deck.html)
- [x] Weekly update #1
- [ ] **TODO: Demo video** (record Loom walkthrough of dashboard → invoice → payment → settlement → compliance)
- [ ] **TODO: Logo/screenshots** (export from settlr.dev)
- [x] ARCHITECTURE.md (technical deep-dive)
- [x] README.md (comprehensive docs)
