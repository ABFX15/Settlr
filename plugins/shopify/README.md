# Settlr Shopify App

Accept USDC stablecoin payments on any Shopify store.

## Architecture

This is a **Shopify Payments App Extension** — it registers as a payment method in Shopify's checkout flow.

```
Customer selects "Pay with USDC"
  → Shopify calls POST /payment
  → App creates a Settlr payment & returns redirect URL
  → Customer pays on Settlr hosted checkout (gasless)
  → Settlr webhook hits POST /webhook
  → App resolves the Shopify payment session via GraphQL
  → Order is marked as paid
```

## Endpoints

| Endpoint                | Purpose                                           |
| ----------------------- | ------------------------------------------------- |
| `POST /payment`         | Shopify calls this to start a payment session     |
| `GET /payment/complete` | Customer landing after Settlr checkout            |
| `POST /webhook`         | Settlr calls this when payment is confirmed       |
| `POST /refund`          | Shopify calls this for merchant-initiated refunds |

## Setup

### 1. Create a Shopify app

Go to [partners.shopify.com](https://partners.shopify.com) and create an app.

Under **Extensions**, add a **Payments App Extension** with:

- Payment session URL: `https://your-app.com/payment`
- Refund session URL: `https://your-app.com/refund`

### 2. Install dependencies

```bash
cd plugins/shopify
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Fill in:

- `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` — from Partners dashboard
- `SHOPIFY_HOST` — your app's public URL
- `SETTLR_API_KEY` — from [settlr.dev/dashboard](https://settlr.dev/dashboard/api-keys)

### 4. Run

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

### 5. Install on a store

From Partners dashboard, install the app on your development store. The "Pay with USDC" option will appear at checkout.

## Production Notes

- Replace the in-memory `paymentSessions` map with Redis or a database
- Implement proper Shopify OAuth for multi-store support
- Call the `paymentSessionResolve` / `paymentSessionReject` GraphQL mutations with the shop's access token
- Add proper HMAC verification in production
- Deploy behind HTTPS (required by Shopify)

## Requirements

- Node.js 18+
- Shopify Partner account
- Settlr API key
