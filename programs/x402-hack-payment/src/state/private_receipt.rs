use anchor_lang::prelude::*;

/// Private Payment Session — payment processed inside MagicBlock's Private Ephemeral Rollup (TEE).
///
/// When delegated to a PER, the account data (amount, memo, etc.) is hidden
/// inside an Intel TDX enclave. Only members with the correct permission flags
/// can read balances or transaction logs. Observers on the base layer see the
/// account is delegated but cannot read its contents.
///
/// On settlement the final state is committed back to Solana, making only the
/// fields you choose publicly visible.
///
/// Privacy guarantees:
/// - During processing: all fields hidden inside TEE
/// - Permission-based access: merchant + customer only
/// - After settlement: committed state visible on-chain
#[account]
#[derive(InitSpace)]
pub struct PrivateReceipt {
    /// The associated payment ID (links to public Payment account)
    #[max_len(64)]
    pub payment_id: String,

    /// Customer wallet
    pub customer: Pubkey,

    /// Merchant wallet
    pub merchant: Pubkey,

    /// Payment amount in USDC lamports (hidden inside PER until settlement)
    pub amount: u64,

    /// Fee amount deducted (hidden inside PER until settlement)
    pub fee_amount: u64,

    /// Current session status
    pub session_status: SessionStatus,

    /// Whether the account is currently delegated to a PER
    pub is_delegated: bool,

    /// Optional memo / order reference
    #[max_len(128)]
    pub memo: String,

    /// Timestamp when session was created
    pub created_at: i64,

    /// Timestamp when session was settled (0 = not settled)
    pub settled_at: i64,

    /// Bump seed for PDA
    pub bump: u8,
}

impl PrivateReceipt {
    pub const SEED: &'static [u8] = b"private_receipt";
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum SessionStatus {
    /// Session created, awaiting delegation to PER
    Pending,
    /// Account delegated to PER — data hidden in TEE
    Active,
    /// Payment processed inside TEE, awaiting commit
    Processed,
    /// State committed back to base layer
    Settled,
}
