use anchor_lang::prelude::*;
use crate::state::{PrivateSubscription, SubscriptionStatus, Merchant};

/// Create a private subscription - recurring payments with hidden amounts
/// 
/// This is the killer feature for Inco Payments prize:
/// - Subscription amount is FHE-encrypted
/// - Only merchant and customer can see the price
/// - Competitors/observers cannot track subscription pricing
#[derive(Accounts)]
#[instruction(subscription_id: String)]
pub struct CreatePrivateSubscription<'info> {
    /// Customer creating the subscription
    #[account(mut)]
    pub customer: Signer<'info>,
    
    /// Merchant receiving subscription payments
    #[account(
        seeds = [b"merchant", merchant.merchant_id.as_bytes()],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,
    
    /// Private subscription account
    #[account(
        init,
        payer = customer,
        space = 8 + PrivateSubscription::INIT_SPACE,
        seeds = [PrivateSubscription::SEED, subscription_id.as_bytes()],
        bump
    )]
    pub private_subscription: Account<'info, PrivateSubscription>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> CreatePrivateSubscription<'info> {
    pub fn create_private_subscription(
        ctx: Context<'_, '_, '_, 'info, CreatePrivateSubscription<'info>>,
        subscription_id: String,
        encrypted_amount_ciphertext: Vec<u8>,
        billing_cycle_seconds: i64,
    ) -> Result<()> {
        require!(subscription_id.len() <= 64, SubscriptionError::SubscriptionIdTooLong);
        require!(!encrypted_amount_ciphertext.is_empty(), SubscriptionError::InvalidCiphertext);
        require!(billing_cycle_seconds > 0, SubscriptionError::InvalidBillingCycle);
        
        let clock = Clock::get()?;
        
        // Encrypt amount via Inco (simulated for hackathon)
        let encrypted_handle = Self::simulate_inco_encrypt(&encrypted_amount_ciphertext)?;
        
        // Initialize subscription
        let subscription = &mut ctx.accounts.private_subscription;
        subscription.subscription_id = subscription_id;
        subscription.customer = ctx.accounts.customer.key();
        subscription.merchant = ctx.accounts.merchant.key();
        subscription.encrypted_amount_handle = encrypted_handle;
        subscription.billing_cycle_seconds = billing_cycle_seconds;
        subscription.created_at = clock.unix_timestamp;
        subscription.last_payment_at = clock.unix_timestamp;
        subscription.next_payment_at = clock.unix_timestamp + billing_cycle_seconds;
        subscription.payment_count = 0;
        subscription.status = SubscriptionStatus::Active;
        subscription.bump = ctx.bumps.private_subscription;
        
        msg!(
            "Private subscription created: {} (cycle: {} seconds)",
            subscription.subscription_id,
            billing_cycle_seconds
        );
        
        // Grant decryption access to both customer and merchant
        Self::grant_decryption_access(&ctx, encrypted_handle)?;
        
        Ok(())
    }
    
    fn simulate_inco_encrypt(ciphertext: &[u8]) -> Result<u128> {
        let mut handle_bytes = [0u8; 16];
        let len = std::cmp::min(ciphertext.len(), 16);
        handle_bytes[..len].copy_from_slice(&ciphertext[..len]);
        Ok(u128::from_le_bytes(handle_bytes))
    }
    
    fn grant_decryption_access(
        ctx: &Context<'_, '_, '_, 'info, CreatePrivateSubscription<'info>>,
        _handle: u128,
    ) -> Result<()> {
        // In production: CPI to Inco Lightning for allowances
        // remaining_accounts: [customer_allowance, merchant_allowance]
        if !ctx.remaining_accounts.is_empty() {
            msg!("Granting decryption access to {} parties", ctx.remaining_accounts.len());
        }
        Ok(())
    }
}

/// Process a subscription payment (charge the recurring amount)
#[derive(Accounts)]
pub struct ProcessSubscriptionPayment<'info> {
    /// Can be merchant or automated keeper
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Customer being charged
    /// CHECK: Validated against subscription
    #[account(mut)]
    pub customer: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [PrivateSubscription::SEED, private_subscription.subscription_id.as_bytes()],
        bump = private_subscription.bump,
        constraint = private_subscription.status == SubscriptionStatus::Active @ SubscriptionError::SubscriptionNotActive,
        constraint = private_subscription.customer == customer.key() @ SubscriptionError::CustomerMismatch
    )]
    pub private_subscription: Account<'info, PrivateSubscription>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> ProcessSubscriptionPayment<'info> {
    pub fn process_subscription_payment(ctx: Context<ProcessSubscriptionPayment>) -> Result<()> {
        let clock = Clock::get()?;
        let subscription = &mut ctx.accounts.private_subscription;
        
        // Check if payment is due
        require!(
            clock.unix_timestamp >= subscription.next_payment_at,
            SubscriptionError::PaymentNotDue
        );
        
        // In production: Decrypt amount via Inco, then process SPL token transfer
        // For hackathon: we just update the subscription state
        
        subscription.last_payment_at = clock.unix_timestamp;
        subscription.next_payment_at = clock.unix_timestamp + subscription.billing_cycle_seconds;
        subscription.payment_count += 1;
        
        msg!(
            "Subscription payment #{} processed for {}",
            subscription.payment_count,
            subscription.subscription_id
        );
        
        Ok(())
    }
}

/// Cancel a subscription
#[derive(Accounts)]
pub struct CancelSubscription<'info> {
    /// Must be the customer who owns the subscription
    #[account(mut)]
    pub customer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [PrivateSubscription::SEED, private_subscription.subscription_id.as_bytes()],
        bump = private_subscription.bump,
        constraint = private_subscription.customer == customer.key() @ SubscriptionError::UnauthorizedCancellation
    )]
    pub private_subscription: Account<'info, PrivateSubscription>,
}

impl<'info> CancelSubscription<'info> {
    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        let subscription = &mut ctx.accounts.private_subscription;
        subscription.status = SubscriptionStatus::Cancelled;
        
        msg!("Subscription cancelled: {}", subscription.subscription_id);
        
        Ok(())
    }
}

#[error_code]
pub enum SubscriptionError {
    #[msg("Subscription ID exceeds maximum length of 64 characters")]
    SubscriptionIdTooLong,
    #[msg("Invalid or empty ciphertext")]
    InvalidCiphertext,
    #[msg("Billing cycle must be greater than 0")]
    InvalidBillingCycle,
    #[msg("Subscription is not active")]
    SubscriptionNotActive,
    #[msg("Customer does not match subscription")]
    CustomerMismatch,
    #[msg("Payment is not yet due")]
    PaymentNotDue,
    #[msg("Only the customer can cancel their subscription")]
    UnauthorizedCancellation,
}
