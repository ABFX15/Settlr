# Settlr WooCommerce Plugin

Accept USDC stablecoin payments on any WooCommerce store.

## Features

- **USDC payment gateway** — appears alongside Stripe, PayPal at checkout
- **Hosted checkout** — redirects to Settlr's gasless checkout page
- **Webhook verification** — HMAC-SHA256 signature validation
- **Automatic order updates** — order status changes on payment confirm/fail/expire
- **Refund support** — process refunds from the WooCommerce admin
- **HPOS compatible** — works with WooCommerce High-Performance Order Storage

## Installation

### From WordPress Admin

1. Download this folder as a zip (or clone the repo)
2. Go to **Plugins → Add New → Upload Plugin**
3. Upload the zip, activate
4. Go to **WooCommerce → Settings → Payments → Settlr USDC**

### Manual

```bash
cp -r plugins/woocommerce /path/to/wordpress/wp-content/plugins/settlr-woocommerce
```

Activate from **Plugins** in WordPress admin.

## Configuration

Navigate to **WooCommerce → Settings → Payments → Settlr USDC**:

| Setting            | Description                                                                            |
| ------------------ | -------------------------------------------------------------------------------------- |
| **API Key**        | Your Settlr API key from [settlr.dev/dashboard](https://settlr.dev/dashboard/api-keys) |
| **Wallet Address** | Your USDC receiving wallet (Solana)                                                    |
| **Webhook Secret** | For verifying callback signatures (from dashboard)                                     |
| **Title**          | Payment method name shown at checkout (default: "Pay with USDC")                       |
| **Description**    | Text below the payment method                                                          |

## How It Works

1. Customer selects "Pay with USDC" at checkout
2. Plugin creates a payment via Settlr API (`POST /api/payments`)
3. Customer is redirected to the Settlr hosted checkout page
4. Customer pays USDC (gasless — no gas fees)
5. Settlr sends a webhook to `/wc-api/settlr_webhook`
6. Plugin verifies the signature and marks the order as paid
7. On-chain transaction signature is stored as an order note

## Webhook URL

Set this in your Settlr dashboard:

```
https://your-store.com/wc-api/settlr_webhook
```

## File Structure

```
settlr-woocommerce.php          # Plugin entry point
includes/
  class-settlr-gateway.php      # WC_Payment_Gateway implementation
assets/
  usdc-logo.svg                 # Payment method icon
```

## Requirements

- WordPress 6.0+
- WooCommerce 6.0+
- PHP 7.4+
- Settlr API key
