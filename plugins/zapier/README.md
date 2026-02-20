# Settlr Zapier Integration

Connect Settlr stablecoin payments to 8,000+ apps.

## Triggers

| Trigger              | Description                                             |
| -------------------- | ------------------------------------------------------- |
| **Payout Claimed**   | Fires when a recipient claims a USDC payout             |
| **Payment Received** | Fires when a customer completes a USDC checkout payment |

## Actions

| Action                  | Description                       |
| ----------------------- | --------------------------------- |
| **Send Payout**         | Send USDC to a recipient by email |
| **Create Payment Link** | Generate a hosted checkout link   |

## Example Zaps

- **Google Sheets → Send Payout** — add a row, auto-pay
- **Typeform → Send Payout** — form submission triggers payment
- **Payment Received → Slack notification** — post to a channel
- **Payout Claimed → Airtable** — log claimed payouts in a table
- **HubSpot Deal Won → Create Payment Link** — auto-generate invoice

## Setup

### 1. Install dependencies

```bash
cd plugins/zapier
npm install
```

### 2. Authenticate

Log in to the Zapier CLI:

```bash
npx zapier login
```

### 3. Register the app

```bash
npx zapier register "Settlr"
```

### 4. Push

```bash
npm run build
npx zapier push
```

### 5. Test

```bash
npx zapier test
```

## Development

```bash
# Validate structure
npx zapier validate

# Describe the app
npx zapier describe

# Test a single trigger
npx zapier invoke trigger payout_claimed
```

## Architecture

```
src/
├── index.ts                     # App entry point
├── authentication/
│   └── api-key.ts               # API key auth handler
├── triggers/
│   ├── payout-claimed.ts        # Trigger: payout claimed
│   └── payment-received.ts      # Trigger: payment confirmed
└── creates/
    ├── send-payout.ts           # Action: send USDC by email
    └── create-payment-link.ts   # Action: generate checkout URL
```

## Authentication

Uses **Custom Auth** with the `X-API-Key` header. The test endpoint (`GET /api/auth/me`) validates the key on connection.

Users enter their Settlr API key when connecting the integration — the same key they get from the dashboard at `settlr.dev/dashboard/api-keys`.
