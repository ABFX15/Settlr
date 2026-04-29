# Offbank — Idea Context

## Idea

**One-liner:** Stablecoin settlement infrastructure for cannabis — non-custodial USDC rails on Solana that replace cash drops and high-risk processors for B2B wholesale.

**Target user:** Cannabis wholesalers, cultivators, and brands that sell through LeafLink and currently rely on cash, wire transfers, or net-30/60 ACH terms.

**Core value prop:** T+0 USDC settlement at 1% flat fee, replacing 5-12% high-risk processor fees and 30-60 day payment terms.

## Validation

```json
{
  "demand_signals": [
    {
      "signal": "Cannabis operators forced into cash or 8-12% high-risk processors due to federal banking exclusion",
      "strength": "strong",
      "source": "Industry reports (MJBizDaily, NCIA), $34B market with ~60% banking access issues"
    },
    {
      "signal": "SAFE Banking Act has failed for 7+ years despite bipartisan support; Schedule III rescheduling (Dec 2025) did NOT solve banking",
      "strength": "strong",
      "source": "Congressional record, state AG coalition letters"
    },
    {
      "signal": "LeafLink Financial uses ACH with net-30/60 terms — wholesalers wait 30-60 days to get paid",
      "strength": "strong",
      "source": "LeafLink product analysis, industry standard payment terms"
    },
    {
      "signal": "Zero competing stablecoin solution exists in cannabis B2B wholesale (Colosseum search: 2,800+ projects, 0 matches)",
      "strength": "strong",
      "source": "Colosseum Copilot database, web research Apr 2026"
    },
    {
      "signal": "Cannabis operators actively requesting or building crypto workarounds",
      "strength": "weak",
      "source": "No direct evidence found — demand is inferred from pain points, not observed behavior"
    }
  ],
  "risks": [
    {
      "category": "regulatory",
      "description": "SAFE Banking passes -> cannabis gets traditional banking -> stablecoin value prop weakens",
      "severity": "high"
    },
    {
      "category": "market",
      "description": "Cannabis operators resist crypto adoption — UX friction despite embedded wallets",
      "severity": "high"
    },
    {
      "category": "market",
      "description": "LeafLink builds native stablecoin settlement or acquires a crypto payment company",
      "severity": "medium"
    },
    {
      "category": "regulatory",
      "description": "Stablecoin regulation creates compliance burden for USDC on-ramps",
      "severity": "medium"
    },
    {
      "category": "technical",
      "description": "On-ramp friction — cannabis operators can't easily acquire USDC in bulk",
      "severity": "medium"
    },
    {
      "category": "team",
      "description": "Solo builder — limited bandwidth for sales, compliance, and integration support",
      "severity": "medium"
    },
    {
      "category": "technical",
      "description": "Solana downtime or USDC depeg during critical settlement window",
      "severity": "low"
    }
  ],
  "go_no_go": "go",
  "confidence": 0.82,
  "next_steps": [
    "Get 3 real cannabis operators to try the checkout flow (validate crypto willingness)",
    "Deploy to mainnet and run a real $500 settlement",
    "Build the LeafLink partnership or get unofficial integration live with a willing merchant",
    "Find a cannabis-industry co-founder or BD hire with operator relationships",
    "Enforce KYC (Sumsub) before mainnet launch",
    "Apply to Colosseum Accelerator / Solana grants with live mainnet transaction as proof"
  ]
}
```

## Competitors

### Direct (Crypto + Cannabis B2B) — NONE ALIVE

- **CargoBill** — Pivoted to logistics/freight payments (not cannabis). Won $25K Colosseum, C3 Accelerator.
- **MISK.FI** — Dead (hackathon-only)
- **Brace** — Dead (hackathon-only)
- **Moongrow** — Dead (cannabis budtender payouts, not B2B wholesale)

### Adjacent (Generic Stablecoin Rails)

- Sphere Pay, Helio/MoonPay Commerce, Crossmint, Circle — none target cannabis

### Incumbents (Traditional Cannabis Processors)

- POSaBIT, Dutchie Pay, CanPay — ALL retail POS, none serve B2B wholesale
- Safe Harbor Financial — Banking partner, not software
- LeafLink Financial — Only B2B player, but ACH with net-30/60 terms

## Technical Status

- **On-chain program:** Deployed to devnet (339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5)
- **Frontend:** Next.js 16, full dashboard, checkout, payment links, Blinks
- **Integrations:** LeafLink webhooks, Privy wallets, Kora gasless, MoonPay on-ramp, MagicBlock PER, Range Security, Supabase
- **SDK:** @offbank/sdk v0.6.0 published
- **KYC:** Sumsub scaffolded, not enforced

## Phase

Idea validation complete. Ready for **Build → Launch** phase (mainnet deployment + first paying customer).

---

## Validation Re-run · 29 April 2026

After ~6 weeks of build + outreach, the previous "go" verdict was re-tested against actual market response.

```json
{
  "demand_signals": [
    {
      "signal": "26–100 cold outreach attempts to cannabis distributors → 0 responses, 0 calls booked",
      "strength": "strong-negative",
      "source": "Founder self-report, Apr 29 2026"
    },
    {
      "signal": "Zero warm intros to any licensed cannabis operator after 6 weeks of attempts",
      "strength": "strong-negative",
      "source": "Founder self-report"
    },
    {
      "signal": "Schedule III rescheduling now applies to medical-only — partially weakens cannabis-B2B-stablecoin pitch (medical operators get better banking access)",
      "strength": "moderate-negative",
      "source": "User update, Apr 2026"
    },
    {
      "signal": "Product technically validated: built, mainnet-ready, managed-wallet onboarding shipped, no direct competitor exists",
      "strength": "strong-positive",
      "source": "This codebase + Colosseum search"
    }
  ],
  "risks": [
    {
      "category": "distribution",
      "description": "Solo founder with no operator network cannot reach licensed cannabis B2B buyers via cold channels — cannabis lives at conferences, private slacks, and via referrals",
      "severity": "critical"
    },
    {
      "category": "runway",
      "description": "3–6 months runway vs cannabis B2B sales cycle of 3–9 months — math doesn't close",
      "severity": "high"
    },
    {
      "category": "regulatory",
      "description": "Schedule III medical-only carve-out partially erodes cannabis pain point",
      "severity": "medium"
    }
  ],
  "go_no_go": "pivot",
  "confidence": 0.74,
  "next_steps": [
    "Stop cold-DMing cannabis distributors immediately — the 100-attempt experiment ran, the result is in",
    "Pick ONE pivot lane by Friday: (A) crypto-native B2B / agencies / DAOs (RECOMMENDED), (B) reachable high-risk verticals (CBD/hemp, firearms, adult), or (C) persist on cannabis with a BD partner who has operator relationships",
    "If A: ship offbankpay.com/agencies, post one X thread with a real settled USDC invoice tx, demo in DMs",
    "If B: un-noindex /cbd-hemp and /firearms, pull 50 CBD brands from Shopify directories, cold-email those",
    "If C: must name 3 people in network who can intro to a cannabis operator THIS WEEK — if you can't name 3, don't pick C",
    "Set a 60-day kill date for the new lane: if revenue is still $0, pivot again or stop"
  ],
  "rerun_artifact": ".superstack/validation-rerun-apr29.html",
  "scoring_against_framework": {
    "demand_score_2plus": false,
    "technical_feasibility": true,
    "time_to_mvp_2_weeks": "n/a — already built",
    "unfair_advantage": false,
    "crypto_necessary": true,
    "go_criteria_met": "2 of 5 (threshold is 3)"
  }
}
```

**Plain-language summary:** Cannabis-B2B is the right product for the wrong wedge given your distribution. The product transfers cleanly to crypto-native B2B (agencies, DAOs, contractor payouts) where you can actually reach buyers on X/Telegram and the "should I use crypto" objection is pre-cleared. Same code, faster cycle, today-reachable ICP. See `.superstack/validation-rerun-apr29.html` for the full report.
