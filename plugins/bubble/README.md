# Settlr Bubble.io Plugin

Add USDC stablecoin payments to any Bubble.io app — drag and drop.

## Components

### Visual Element: `SettlrCheckout`

A checkout button you drop onto any Bubble page.

**Properties** (configurable in the editor):

- `amount` — USDC amount
- `description` — what the customer is paying for
- `button_text` — button label (default: "Pay with USDC")
- `button_color` — hex color
- `redirect_url` — where to send the customer after payment

**Events** (use in Bubble workflows):

- `payment_created` — fires when the checkout session starts
- `payment_confirmed` — fires when payment is confirmed on-chain
- `payment_failed` — fires on error

**Exposed States** (use in page elements):

- `payment_id` — the Settlr payment ID
- `checkout_url` — the Settlr checkout URL
- `payment_status` — current status
- `tx_signature` — on-chain transaction hash

### API Actions

Use these in Bubble workflows:

| Action              | Description                         |
| ------------------- | ----------------------------------- |
| `create_payment`    | Create a USDC payment/checkout link |
| `send_payout`       | Send USDC to an email address       |
| `send_batch_payout` | Send USDC to multiple recipients    |
| `get_payout`        | Check a payout's status             |
| `get_payment`       | Check a payment's status            |
| `list_payouts`      | List all payouts                    |

## Installation

### In Bubble Plugin Editor

1. Go to [bubble.io/plugins](https://bubble.io/plugins) → Create a new plugin
2. Set the plugin name to "Settlr USDC Payments"
3. Under **Shared headers**, add:

   - `X-API-Key` → map to `api_key` key
   - `Content-Type` → `application/json`

4. **Add API Calls** — copy each call definition from `plugin-definition.json`:

   - `create_payment` (POST)
   - `send_payout` (POST)
   - `send_batch_payout` (POST)
   - `get_payout` (GET)
   - `get_payment` (GET)
   - `list_payouts` (GET)

5. **Add Visual Element** — "SettlrCheckout":

   - Paste `element-checkout.js` into the element code field
   - Define the fields, events, and exposed states from `plugin-definition.json`

6. **Add Server-side Action** — "Send Payout":

   - Paste `action-send-payout.js` into the server-side action code field

7. **Keys** — in the plugin's Keys tab, define:
   - `api_key` (private) — Settlr API key
   - `base_url` (public) — default `https://settlr.dev`

### In Your Bubble App

1. Install the plugin from the Plugins tab
2. Enter your Settlr API key in plugin settings
3. Drag `SettlrCheckout` onto a page → set the amount
4. Use the API actions in workflows

## File Structure

```
plugin-definition.json    # Complete plugin config (API calls, elements, keys)
element-checkout.js       # Client-side code for the SettlrCheckout element
action-send-payout.js     # Server-side code for the Send Payout action
```

## Example Workflow

**Accept a payment:**

1. Drop `SettlrCheckout` on your page
2. Set amount dynamically (e.g., from a product's price field)
3. On `payment_created` event → navigate to `SettlrCheckout's checkout_url`
4. Customer pays USDC on Settlr's hosted checkout (gasless)
5. On redirect back → check `SettlrCheckout's payment_status`

**Send a payout from a workflow:**

1. Workflow trigger: "Button is clicked"
2. Action: Plugins → Settlr → Send Payout
3. Email: Input field's value
4. Amount: Input field's value
5. On success: show "Payment sent!" notification
