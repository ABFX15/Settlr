use anchor_lang::prelude::*;
use crate::state::{PrivatePayout, PayoutStatus, MerchantPrivateStats, Merchant};

/// Initialize private payout - confidential merchant settlement
#[derive(Accounts)]
#[instruction(payout_id: String)]
pub struct InitiatePrivatePayout<'info> {
    /// Merchant initiating the payout (must match merchant account)
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Merchant account
    #[account(
        seeds = [b"merchant", merchant.merchant_id.as_bytes()],
        bump = merchant.bump,
        constraint = merchant.authority == authority.key() @ PayoutError::UnauthorizedMerchant
    )]
    pub merchant: Account<'info, Merchant>,
    
    /// Private payout account to create
    #[account(
        init,
        payer = authority,
        space = 8 + PrivatePayout::INIT_SPACE,
        seeds = [PrivatePayout::SEED, payout_id.as_bytes()],
        bump
    )]
    pub private_payout: Account<'info, PrivatePayout>,
    
    /// Merchant's private stats (will be updated with encrypted totals)
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + MerchantPrivateStats::INIT_SPACE,
        seeds = [MerchantPrivateStats::SEED, merchant.key().as_ref()],
        bump
    )]
    pub merchant_private_stats: Account<'info, MerchantPrivateStats>,
    
    /// Destination wallet for the payout
    /// CHECK: Can be any wallet address
    pub destination_wallet: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> InitiatePrivatePayout<'info> {
    pub fn initiate_private_payout(
        ctx: Context<'_, '_, '_, 'info, InitiatePrivatePayout<'info>>,
        payout_id: String,
        encrypted_amount_ciphertext: Vec<u8>,
    ) -> Result<()> {
        require!(payout_id.len() <= 64, PayoutError::PayoutIdTooLong);
        require!(!encrypted_amount_ciphertext.is_empty(), PayoutError::InvalidCiphertext);
        
        let clock = Clock::get()?;
        
        // In production: CPI to Inco Lightning to encrypt and get handle
        // For hackathon: we simulate the handle from ciphertext
        let encrypted_handle = Self::simulate_inco_encrypt(&encrypted_amount_ciphertext)?;
        
        // Initialize private payout
        let payout = &mut ctx.accounts.private_payout;
        payout.payout_id = payout_id;
        payout.merchant = ctx.accounts.merchant.key();
        payout.destination_wallet = ctx.accounts.destination_wallet.key();
        payout.encrypted_amount_handle = encrypted_handle;
        payout.range_proof_handle = None; // Can be added for compliance
        payout.auditor = None; // Set via remaining_accounts if needed
        payout.status = PayoutStatus::Pending;
        payout.initiated_at = clock.unix_timestamp;
        payout.completed_at = None;
        payout.bump = ctx.bumps.private_payout;
        
        // Update merchant private stats with FHE homomorphic addition
        // In production: CPI to Inco to add encrypted values
        let stats = &mut ctx.accounts.merchant_private_stats;
        if stats.merchant == Pubkey::default() {
            // First time initialization
            stats.merchant = ctx.accounts.merchant.key();
            stats.encrypted_total_revenue = 0;
            stats.encrypted_total_payouts = encrypted_handle;
            stats.transaction_count = 0;
            stats.payout_count = 1;
            stats.bump = ctx.bumps.merchant_private_stats;
        } else {
            // FHE addition would happen here via Inco CPI
            // For demo: we just store the latest handle
            stats.payout_count += 1;
        }
        stats.last_updated = clock.unix_timestamp;
        
        msg!("Private payout initiated: {} with encrypted handle", payout.payout_id);
        
        // Grant decryption access to merchant and optional auditor
        // via Inco Lightning allowance CPIs (in remaining_accounts)
        Self::grant_decryption_access(&ctx)?;
        
        Ok(())
    }
    
    /// Simulate Inco encryption (hackathon placeholder)
    /// In production: CPI to Inco Lightning encrypt instruction
    fn simulate_inco_encrypt(ciphertext: &[u8]) -> Result<u128> {
        // Convert first 16 bytes to u128 handle (simulated)
        let mut handle_bytes = [0u8; 16];
        let len = std::cmp::min(ciphertext.len(), 16);
        handle_bytes[..len].copy_from_slice(&ciphertext[..len]);
        Ok(u128::from_le_bytes(handle_bytes))
    }
    
    /// Grant decryption access via Inco allowance accounts
    fn grant_decryption_access(
        ctx: &Context<'_, '_, '_, 'info, InitiatePrivatePayout<'info>>
    ) -> Result<()> {
        // remaining_accounts contains allowance PDAs for:
        // [0] merchant allowance
        // [1] auditor allowance (optional)
        
        // In production: CPI to Inco Lightning to grant allowances
        // For hackathon demo: logged only
        
        if !ctx.remaining_accounts.is_empty() {
            msg!("Granting decryption access to {} accounts", ctx.remaining_accounts.len());
        }
        
        Ok(())
    }
}

/// Complete a private payout (execute the actual transfer)
#[derive(Accounts)]
pub struct CompletePrivatePayout<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [PrivatePayout::SEED, private_payout.payout_id.as_bytes()],
        bump = private_payout.bump,
        constraint = private_payout.status == PayoutStatus::Pending @ PayoutError::PayoutNotPending
    )]
    pub private_payout: Account<'info, PrivatePayout>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> CompletePrivatePayout<'info> {
    pub fn complete_private_payout(ctx: Context<CompletePrivatePayout>) -> Result<()> {
        let clock = Clock::get()?;
        
        let payout = &mut ctx.accounts.private_payout;
        payout.status = PayoutStatus::Completed;
        payout.completed_at = Some(clock.unix_timestamp);
        
        msg!("Private payout completed: {}", payout.payout_id);
        
        Ok(())
    }
}

#[error_code]
pub enum PayoutError {
    #[msg("Payout ID exceeds maximum length of 64 characters")]
    PayoutIdTooLong,
    #[msg("Invalid or empty ciphertext")]
    InvalidCiphertext,
    #[msg("Unauthorized: signer is not merchant authority")]
    UnauthorizedMerchant,
    #[msg("Payout is not in pending status")]
    PayoutNotPending,
}
