# Private Settlr - Confidential Commerce on Solana

> **Hackathon Submission for Privacy Hack**  
> Inco Payments Prize ($2k) + MagicBlock Real-time Private Apps ($2.5k)

## 🎯 What We Built

**Private Settlr** extends our USDC checkout solution with **FHE-encrypted payment flows** using Inco Lightning:

1. **Private Receipts** - Payment amounts encrypted on-chain, only merchant + customer can decrypt
2. **Private Subscriptions** - Recurring payments with hidden pricing (killer feature!)
3. **Private Payouts** - B2B merchant settlements hidden from competitors
4. **Privacy Dashboard** - Shows aggregates only; on-demand decryption for authorized parties

## 🔐 Privacy Features

| Feature            | On-Chain Visibility     | Who Can Decrypt       |
| ------------------ | ----------------------- | --------------------- |
| Payment Amount     | ❌ Hidden (u128 handle) | Merchant + Customer   |
| Subscription Price | ❌ Hidden               | Merchant + Subscriber |
| Payout Amount      | ❌ Hidden               | Merchant + Auditor    |
| Transaction Count  | ✅ Public               | Everyone              |
| Aggregate Totals   | Encrypted               | Merchant only         |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│  Privacy Dashboard  │  Subscription UI  │  Checkout     │
│  - Encrypted totals │  - Hidden pricing │  - Private    │
│  - On-demand decrypt│  - Billing cycles │    receipts   │
└───────────────────────────────┬─────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Privacy API Layer   │
                    │ /api/privacy/dashboard│
                    │ /api/privacy/subs     │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Anchor Program│    │ Inco Lightning  │    │ Inco Covalidators│
│ (Solana)      │◄──►│ (FHE Encrypt)   │◄──►│ (Decrypt)       │
└───────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 New Program Accounts

### PrivateReceipt (existing)

```rust
pub struct PrivateReceipt {
    pub payment_id: String,
    pub customer: Pubkey,
    pub merchant: Pubkey,
    pub encrypted_amount_handle: u128,  // Inco FHE handle
    pub encrypted_metadata_handle: Option<u128>,
    pub issued_at: i64,
    pub bump: u8,
}
```

### PrivateSubscription (NEW - Killer Feature!)

```rust
pub struct PrivateSubscription {
    pub subscription_id: String,
    pub customer: Pubkey,
    pub merchant: Pubkey,
    pub encrypted_amount_handle: u128,  // Price hidden!
    pub billing_cycle_seconds: i64,
    pub created_at: i64,
    pub next_payment_at: i64,
    pub payment_count: u64,
    pub status: SubscriptionStatus,
}
```

### PrivatePayout (NEW - B2B Privacy)

```rust
pub struct PrivatePayout {
    pub payout_id: String,
    pub merchant: Pubkey,
    pub destination_wallet: Pubkey,
    pub encrypted_amount_handle: u128,  // Settlement hidden!
    pub range_proof_handle: Option<u128>,  // Compliance
    pub auditor: Option<Pubkey>,
    pub status: PayoutStatus,
}
```

### MerchantPrivateStats (NEW - Aggregate Privacy)

```rust
pub struct MerchantPrivateStats {
    pub merchant: Pubkey,
    pub encrypted_total_revenue: u128,  // FHE sum!
    pub encrypted_total_payouts: u128,
    pub transaction_count: u64,  // Can be public
    pub payout_count: u64,
}
```

## 🎮 Demo Flow

### For Judges:

1. **Visit Private Dashboard** → `/privacy/dashboard`

   - See Privacy Mode toggle (on by default)
   - Revenue shows "••••••••" (encrypted)
   - Transaction count visible (public by choice)
   - Click "Decrypt" to reveal amounts (requires signature)

2. **Create Private Subscription** → API or UI

   - Customer subscribes with encrypted pricing
   - On-chain: only handle visible
   - Merchant and customer can see $9.99/month
   - Competitors see: `0x7b226964223a22737562...`

3. **Merchant Payout** → API
   - Initiate settlement with encrypted amount
   - Optional auditor can decrypt for compliance
   - Competitors cannot see payout amounts

## 🔧 Technical Integration

### SDK Usage

```typescript
import {
  encryptAmount,
  findPrivateSubscriptionPda,
  BillingCycles,
  generateSubscriptionId,
} from "@settlr/sdk/privacy";

// Create encrypted subscription
const subscriptionId = generateSubscriptionId();
const encryptedAmount = await encryptAmount(BigInt(9_990_000)); // $9.99

const [subscriptionPda] = findPrivateSubscriptionPda(subscriptionId);

await program.methods
  .createPrivateSubscription(
    subscriptionId,
    Buffer.from(encryptedAmount),
    BillingCycles.MONTHLY
  )
  .accounts({
    customer: customerWallet,
    merchant: merchantPda,
    privateSubscription: subscriptionPda,
    systemProgram: SystemProgram.programId,
  })
  .remainingAccounts([
    { pubkey: customerAllowancePda, isSigner: false, isWritable: true },
    { pubkey: merchantAllowancePda, isSigner: false, isWritable: true },
  ])
  .rpc();
```

### API Endpoints

```bash
# Get private dashboard (encrypted aggregates)
GET /api/privacy/dashboard?merchantId=demo_merchant

# Decrypt a handle (requires signature)
POST /api/privacy/dashboard
{ "handle": "0x...", "signature": "...", "merchantWallet": "..." }

# List subscriptions (prices hidden)
GET /api/privacy/subscriptions?merchantId=demo_merchant

# Create subscription
POST /api/privacy/subscriptions
{ "subscriptionId": "sub_...", "merchantId": "...", "amount": 9.99, "billingCycleSeconds": 2592000 }
```

## 🏆 Why This Wins

### Differentiators

1. **Not "boring checkout"** - Privacy rails enabling new behaviors
2. **Real commerce use case** - B2B hiding settlement amounts
3. **Killer feature** - Private subscriptions (first on Solana!)
4. **Solana aligned** - Complements Confidential Balances roadmap

### Prize Alignment

| Prize                            | How We Qualify                                          |
| -------------------------------- | ------------------------------------------------------- |
| **Inco Payments ($2k)**          | Private subscriptions with FHE-encrypted pricing        |
| **MagicBlock Real-time ($2.5k)** | Live privacy dashboard with real-time encrypted updates |

### Business Value

- **For Merchants**: Hide revenue from competitors
- **For B2B**: Confidential wholesale pricing
- **For Creators**: Private subscription tiers
- **For Gaming**: Hidden micro-transaction amounts
- **For Compliance**: Range proofs + auditor access

## 🚀 What's Next

1. [ ] Full Inco Lightning CPI integration (currently simulated)
2. [ ] Range proof generation for compliance
3. [ ] Private refund flow
4. [ ] Encrypted payment links
5. [ ] Privacy analytics export (decrypted CSV)

## 📁 Files Changed

```
programs/x402-hack-payment/src/
├── state/
│   ├── private_payout.rs      # NEW: PrivatePayout, MerchantPrivateStats, PrivateSubscription
│   └── mod.rs                 # Updated exports
├── instructions/
│   ├── private_payout.rs      # NEW: InitiatePrivatePayout, CompletePrivatePayout
│   ├── private_subscription.rs# NEW: CreatePrivateSubscription, ProcessPayment, Cancel
│   └── mod.rs                 # Updated exports
└── lib.rs                     # NEW: 5 instructions added

packages/sdk/src/
└── privacy.ts                 # Extended with subscription/payout helpers

app/frontend/src/
├── app/
│   ├── api/privacy/
│   │   ├── dashboard/route.ts # NEW: Private dashboard API
│   │   └── subscriptions/route.ts # NEW: Subscription API
│   └── privacy/
│       └── dashboard/page.tsx # NEW: Privacy dashboard page
└── components/
    └── PrivateDashboard.tsx   # NEW: Privacy-aware dashboard component
```

---

Built with ❤️ for Privacy Hack by the Settlr team
