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

## Candidate partners (verify cannabis + crypto acceptance directly)

| Partner | What they are | Fit |
|---|---|---|
| **Safe Harbor Financial** (NASDAQ: SHFS, shfinancial.org) | The leading cannabis banking/fintech platform — banks cannabis operators nationwide, expanded payments in Jan 2026 (GreenCard, Lüt: ACH debit, next-day ACH settlement). | **Top pick.** Already banks cannabis + has compliance infra. Likely the account the merchant off-ramps *into*. Partnership/onboarding, not self-serve API. |
| **Green Check Verified / Shield Compliance** | Compliance connectors between cannabis businesses and banks/credit unions. | The layer that makes a bank/CU comfortable; feed them our audit trail + KYB. |
| **Cannabis-friendly credit unions** (Affinity FCU, Salal CU, North Bay CU) | CUs that explicitly bank cannabis. NCUA stablecoin-issuer rule in comment period (through Jul 17 2026). | The merchant's USD deposit account. |
| **BitPay** | Established crypto→fiat processor, next-business-day bank settlement. | Worth exploring, but **confirm cannabis acceptance** — historically avoids it. |
| **Bankcard International Group** | Writes about cannabis stablecoin payments; high-risk processor. | Possible processor partner — vet. |

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
