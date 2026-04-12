# Settlr — Idea Context

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
- **SDK:** @settlr/sdk v0.6.0 published
- **KYC:** Sumsub scaffolded, not enforced

## Phase

Idea validation complete. Ready for **Build → Launch** phase (mainnet deployment + first paying customer).
