# Settlr Octane Relay

Gasless transaction relay for Solana USDC payments.

## Setup

### 1. Create a Fee Payer Wallet

```bash
# Generate a new keypair for the relay
solana-keygen new -o fee-payer.json

# Get the public key
solana-keygen pubkey fee-payer.json

# Fund it with SOL (devnet)
solana airdrop 2 $(solana-keygen pubkey fee-payer.json) --url devnet
```

### 2. Set Environment Variables

Create a `.env.local` file:

```env
# Required: Fee payer secret key (base58 or JSON array)
FEE_PAYER_SECRET="[1,2,3,...your secret key array]"

# Optional: RPC endpoint
SOLANA_RPC_URL="https://api.devnet.solana.com"

# Optional: Network (devnet or mainnet-beta)
SOLANA_NETWORK="devnet"

# Optional: Rate limit per minute per IP
RATE_LIMIT="60"
```

### 3. Run Locally

```bash
npm install
npm run dev
```

The relay will be available at http://localhost:3001

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or CLI
vercel env add FEE_PAYER_SECRET
```

## API Endpoints

### GET /api

Returns relay configuration.

```json
{
  "feePayer": "ABC123...",
  "endpoints": {
    "transfer": {
      "tokens": [
        {
          "mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
          "symbol": "USDC",
          "decimals": 6,
          "fee": 10000
        }
      ]
    }
  }
}
```

### POST /api/transfer

Submit a gasless transaction.

**Request:**

```json
{
  "transaction": "<base64-encoded-transaction>",
  "mint": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
}
```

**Response:**

```json
{
  "status": "ok",
  "signature": "5KtP..."
}
```

### GET /api/health

Health check endpoint.

```json
{
  "feePayer": "ABC123...",
  "solBalance": "1.234567890",
  "tokenBalances": [...],
  "status": "healthy"
}
```

## How It Works

1. User builds a transaction with:

   - A small USDC fee transfer to the relay's token account
   - Their actual payment/transfer instruction

2. User signs the transaction (partial signature)

3. User submits the partially-signed transaction to the relay

4. Relay validates:

   - Transaction contains fee payment
   - Fee amount is sufficient
   - Relay has enough SOL

5. Relay signs as fee payer and broadcasts

6. User receives the transaction signature

## Security

- The relay only signs transactions that include a fee payment
- Transactions are validated before signing
- Rate limiting prevents abuse
- Fee payer private key never leaves the server

## Costs

On Devnet:

- Fee: 0.01 USDC per transaction
- Relay pays: ~0.000005 SOL per signature

On Mainnet:

- Fee: 0.005 USDC per transaction
- Relay pays: ~0.000005 SOL per signature

The relay earns USDC and spends SOL. Periodically swap USDC → SOL to maintain balance.
