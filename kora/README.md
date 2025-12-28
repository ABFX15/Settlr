# Kora Gasless Transaction Server

This folder contains the configuration for running a Kora RPC server that enables gasless transactions for Settlr.

## What is Kora?

Kora is a Solana Foundation project that allows users to pay transaction fees with SPL tokens (like USDC) instead of SOL. Your server acts as a "fee payer" - it pays the SOL gas fees and users pay you back in USDC.

## Setup

### 1. Install Kora CLI

```bash
cargo install kora-cli
```

### 2. Create Fee Payer Keypair

```bash
solana-keygen new -o fee-payer.json
```

### 3. Fund the Fee Payer (Devnet)

```bash
# Via CLI
solana airdrop 2 <PUBKEY> --url devnet

# Or use the faucet: https://faucet.solana.com
```

### 4. Set Environment Variables

Create a `.env` file:

```bash
FEE_PAYER_SECRET_KEY=[your,keypair,array]
RPC_URL=https://api.devnet.solana.com
```

### 5. Start the Server

```bash
kora rpc start --signers-config signers.toml
```

The server will run at `http://localhost:8080`.

## Configuration

### kora.toml

Defines validation rules:

- `allowed_tokens` - Which tokens can be transferred
- `allowed_spl_paid_tokens` - Which tokens can be used to pay fees
- `allowed_programs` - Which Solana programs can be called
- `price` - Fee pricing (free, margin, or fixed)

### signers.toml

Defines the fee payer keypair(s):

- Single signer for simple setups
- Multiple signers with round-robin for high volume

## Production Deployment

### Railway

1. Push this folder to a separate repo or use a Dockerfile
2. Set `FEE_PAYER_SECRET_KEY` and `RPC_URL` as environment variables
3. Deploy with: `kora rpc start --signers-config signers.toml`

### Environment Variables for Production

```
FEE_PAYER_SECRET_KEY=<base58-encoded-private-key>
RPC_URL=https://api.mainnet-beta.solana.com
```

## Testing

```bash
# Check if server is running
curl http://localhost:8080

# Get config
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getConfig","params":{}}'
```

## Docs

- [Kora Documentation](https://launch.solana.com/docs/kora)
- [Kora GitHub](https://github.com/solana-foundation/kora)
