# Off-ramp partners — USDC → USD for cannabis (research)

The off-ramp is the existential problem: getting paid in USDC is debank-proof,
but converting USDC → USD and landing it in a cannabis business's bank account
re-enters the traditional system, where two gates appear:

1. The off-ramp/settlement provider's **banking partner** must accept
   cannabis-derived funds (generic crypto off-ramps — MoonPay, Coinbase,
   Sphere — will not).
2. The merchant's **own bank** can freeze a large crypto-sourced cannabis
   deposit (crypto + cannabis = double AML flag, SAR reporting).

This is *why cannabis is cash-heavy*. The way through is a **cannabis-compliant
settlement partner**, not a consumer crypto off-ramp — and our on-chain audit
trail + Sumsub KYB are the provenance that makes such a partner willing to
accept the funds.

## Two layers: an API off-ramp provider + a cannabis-compliant bank

The realistic flow is **two parties**: a high-risk-friendly API provider that
converts USDC→USD and runs KYB/AML, settling into a **cannabis-compliant bank**
where the merchant holds a USD account.

### API off-ramp providers (the adapter we plug in)

| Provider | What they are | Fit |
|---|---|---|
| **Cybrid** (cybrid.xyz) | White-label off-ramp inside *your own* API; integrated KYB + multi-rail ACH/domestic wire. | **Top API pick** — slots straight into our provider adapter; keeps the flow in-product. |
| **BVNK** (bvnk.com) | Enterprise on/off-ramp; virtual accounts USD/EUR/GBP; deep B2B banking orchestration. | Strong for multi-currency / larger volume. |
| **Rain** (rain.xyz) | Virtual accounts + automated programmatic stablecoin-treasury → fiat. | Good for automated, recurring treasury sweeps. |
| **BitPay** | Established crypto→fiat processor, next-day settlement. | Vet cannabis acceptance — historically avoids it. |

> Mainstream (Circle, Bridge/Stripe, Coinbase, MoonPay) will reject cannabis on
> AML/federal grounds — do not build on them for this.

### Cannabis-compliant banks (the USD destination)

| Bank | Notes |
|---|---|
| **Safe Harbor Financial** (NASDAQ: SHFS) | Leading cannabis banking platform; expanded payments Jan 2026 (next-day ACH). |
| **Partner Colorado Credit Union** | Safe Harbor's chartering CU — real, verifiable cannabis rail. |
| **Continental Bank** | Underwrites state-legal cannabis. |
| **Cannabis-friendly CUs** (Affinity FCU, Salal CU, North Bay CU) | Merchant USD deposit accounts. |
| **Green Check Verified / Shield Compliance** | Compliance connectors that make a bank/CU comfortable — feed them our audit trail + KYB. |

## Recommended 3-step architecture (matches what we've built)

```
[Merchant Solana wallet]
   │  payout request in dashboard (KYB-gated)
   ▼
[High-risk off-ramp API: Cybrid / BVNK / Rain]   ← provider adapter
   │  KYB + BSA/AML, sender+receiver wallet screen (Range/Elliptic/Chainalysis)
   │  + cannabis license # and invoice metadata attached
   ▼
[Cannabis-compliant ACH/Fedwire: Safe Harbor / Partner Colorado CU]
   │  next-day settle
   ▼
[Merchant business USD bank account]
```

Build redundancy: support a **multi-provider fallback** so traffic can shift if
a partner changes its risk policy.

## How the code is built around this

- Off-ramp requests are **honest**: they stay `pending` until a real partner
  confirms USD settled. No fake auto-completion (removed).
- Settlement is confirmed via a **signed webhook**
  (`/api/integrations/offramp/webhook`, HMAC `x-offramp-signature`).
- `OFFBANK_OFFRAMP_PROVIDER=manual` (default): partner processes off our audit
  trail + KYB and calls the webhook. A future direct-API partner is a new
  adapter on the same flow.
- `OFFBANK_REQUIRE_KYB_FOR_OFFRAMP=true` gates every off-ramp on Sumsub KYB.

## Strategic note

The strongest version of the product **minimizes off-ramp**: keep value in
USDC and circulate it B2B (suppliers, wholesalers, payroll) so merchants rarely
need a bank. Off-ramp becomes a KYB-gated, cannabis-partner-only exception —
not the default path.

_Sources: shfinancial.org; Safe Harbor Jan 2026 payments expansion (GlobeNewswire);
cannabisregulations.ai 2026 payments guide; bankcardinternationalgroup.com;
Affinity FCU cannabis banking; NCUA stablecoin rule proposal._
