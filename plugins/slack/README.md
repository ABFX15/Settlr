# Settlr Slack Bot

Send USDC payments from Slack with slash commands.

## Commands

| Command                        | Description           | Example                             |
| ------------------------------ | --------------------- | ----------------------------------- |
| `/pay <email> <amount> [memo]` | Send USDC to an email | `/pay alice@co.com 250 March bonus` |
| `/pay-batch`                   | Batch payout from CSV | Paste rows: `email,amount,memo`     |
| `/pay-status <id>`             | Check payout status   | `/pay-status po_abc123`             |
| `/pay-balance`                 | Check wallet balance  | `/pay-balance`                      |

## Features

- **Approval workflows** — payments above a threshold require manager approval via interactive buttons
- **Thread receipts** — confirmations posted in-channel with payout ID and claim link
- **Batch payouts** — paste CSV directly into the command
- **On-chain links** — claimed payouts include Solscan transaction links

## Setup

### 1. Create a Slack App

Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app from the manifest:

```bash
# Use the included manifest
cat slack-app-manifest.json
```

Or create from scratch — you need:

- Bot token scopes: `commands`, `chat:write`, `chat:write.public`
- Slash commands: `/pay`, `/pay-batch`, `/pay-status`, `/pay-balance`
- Interactivity enabled (for approval buttons)
- Socket Mode enabled (recommended for development)

### 2. Install dependencies

```bash
cd plugins/slack
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in:

- `SLACK_BOT_TOKEN` — from OAuth & Permissions page (`xoxb-...`)
- `SLACK_SIGNING_SECRET` — from Basic Information page
- `SLACK_APP_TOKEN` — from Basic Information > App-Level Tokens (`xapp-...`)
- `SETTLR_API_KEY` — from [settlr.dev/dashboard/api-keys](https://settlr.dev/dashboard/api-keys)

### 4. Run

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

## Approval Workflows

Set these env vars to enable approval flows:

```bash
APPROVAL_CHANNEL=#payment-approvals
APPROVAL_THRESHOLD=1000
```

Payments ≥ threshold post an approval request to the channel. A manager clicks **Approve** or **Reject**. On approval, the payout sends automatically and both the approval channel and requester's channel get confirmations.

## Deploy

The bot runs as a standalone Node.js process. Deploy anywhere:

- **Railway/Render** — push to git, set env vars
- **Docker** — `FROM node:20-slim`, `npm ci && npm run build`, `CMD ["npm", "start"]`
- **AWS Lambda** — use the `aws-serverless-express` adapter with Bolt's receiver

Socket Mode (recommended) requires a persistent connection. For serverless, use HTTP mode and point the Request URL to your endpoint.
