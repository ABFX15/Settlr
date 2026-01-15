use anchor_lang::prelude::*;

/// Private Payout - confidential merchant settlement
/// 
/// B2B use case: Merchants can receive settlements without revealing
/// individual transaction amounts on-chain. Perfect for:
/// - Hiding revenue from competitors
/// - Payroll privacy (Solana Confidential Balances aligned)
/// - B2B wholesale payments with protected pricing
/// 
/// The encrypted_amount_handle references FHE ciphertext in Inco network.
/// Only the merchant and an optional auditor can decrypt.
#[account]
#[derive(InitSpace)]
pub struct PrivatePayout {
    /// Unique payout ID
    #[max_len(64)]
    pub payout_id: String,
    
    /// Merchant receiving the payout
    pub merchant: Pubkey,
    
    /// Merchant's destination wallet
    pub destination_wallet: Pubkey,
    
    /// Encrypted payout amount (Inco handle to FHE ciphertext)
    pub encrypted_amount_handle: u128,
    
    /// Optional: Range proof for compliance
    /// Proves amount is within [min, max] without revealing exact value
    pub range_proof_handle: Option<u128>,
    
    /// Auditor address (optional - can decrypt for compliance)
    pub auditor: Option<Pubkey>,
    
    /// Status of the payout
    pub status: PayoutStatus,
    
    /// When payout was initiated
    pub initiated_at: i64,
    
    /// When payout was completed (if applicable)
    pub completed_at: Option<i64>,
    
    /// Bump seed
    pub bump: u8,
}

impl PrivatePayout {
    pub const SEED: &'static [u8] = b"private_payout";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PayoutStatus {
    /// Payout initiated, awaiting processing
    Pending,
    /// Payout completed
    Completed,
    /// Payout cancelled
    Cancelled,
}

/// Merchant Private Stats - aggregate totals with privacy
/// 
/// Stores encrypted running totals so the dashboard can show
/// "Total Revenue: $XXX,XXX" without revealing individual tx amounts.
/// 
/// Pattern:
/// - Each payment adds encrypted amount to encrypted_total via FHE addition
/// - Only merchant can decrypt their total
/// - Competitors see only ciphertext handle
#[account]
#[derive(InitSpace)]
pub struct MerchantPrivateStats {
    /// The merchant this belongs to
    pub merchant: Pubkey,
    
    /// Encrypted total revenue (running sum via FHE homomorphic addition)
    pub encrypted_total_revenue: u128,
    
    /// Encrypted total payouts (running sum)
    pub encrypted_total_payouts: u128,
    
    /// Number of transactions (can be public or private based on config)
    pub transaction_count: u64,
    
    /// Number of payouts
    pub payout_count: u64,
    
    /// Last updated timestamp
    pub last_updated: i64,
    
    /// Bump seed
    pub bump: u8,
}

impl MerchantPrivateStats {
    pub const SEED: &'static [u8] = b"merchant_private_stats";
}

/// Private Subscription - recurring payments with hidden amounts
/// 
/// Killer feature for Inco Payments prize:
/// - Subscription amounts hidden from chain observers
/// - Only merchant + customer know the price
/// - Supports billing cycles with encrypted payment amounts
#[account]
#[derive(InitSpace)]
pub struct PrivateSubscription {
    /// Unique subscription ID
    #[max_len(64)]
    pub subscription_id: String,
    
    /// Customer (subscriber)
    pub customer: Pubkey,
    
    /// Merchant receiving payments
    pub merchant: Pubkey,
    
    /// Encrypted recurring amount (hidden from observers)
    pub encrypted_amount_handle: u128,
    
    /// Billing cycle in seconds (e.g., 2592000 = 30 days)
    pub billing_cycle_seconds: i64,
    
    /// When subscription was created
    pub created_at: i64,
    
    /// Last successful payment timestamp
    pub last_payment_at: i64,
    
    /// Next payment due timestamp
    pub next_payment_at: i64,
    
    /// Total payments made
    pub payment_count: u64,
    
    /// Subscription status
    pub status: SubscriptionStatus,
    
    /// Bump seed
    pub bump: u8,
}

impl PrivateSubscription {
    pub const SEED: &'static [u8] = b"private_subscription";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum SubscriptionStatus {
    /// Active subscription
    Active,
    /// Paused by customer
    Paused,
    /// Cancelled
    Cancelled,
    /// Payment failed
    PastDue,
}
