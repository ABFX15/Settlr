use anchor_lang::prelude::*;

/// Private Receipt - stores encrypted payment details
/// Only the merchant and customer can decrypt the amount via Inco covalidators
/// 
/// Privacy guarantees:
/// - encrypted_amount_handle is a u128 handle to FHE-encrypted data
/// - Only addresses with allowance grants can decrypt via Inco network
/// - On-chain: amount is hidden; Off-chain: merchant can export for accounting
#[account]
#[derive(InitSpace)]
pub struct PrivateReceipt {
    /// The associated payment ID (links to public Payment account)
    #[max_len(64)]
    pub payment_id: String,
    
    /// Customer wallet (granted decryption access)
    pub customer: Pubkey,
    
    /// Merchant wallet (granted decryption access)
    pub merchant: Pubkey,
    
    /// Encrypted payment amount handle (Inco Euint128.0 stored as u128)
    /// This is a reference to FHE-encrypted data in the Inco covalidator network
    pub encrypted_amount_handle: u128,
    
    /// Optional encrypted metadata handle (e.g., order details)
    pub encrypted_metadata_handle: Option<u128>,
    
    /// Timestamp when receipt was issued
    pub issued_at: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl PrivateReceipt {
    pub const SEED: &'static [u8] = b"private_receipt";
}
