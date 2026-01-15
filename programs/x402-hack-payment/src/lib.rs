use anchor_lang::prelude::*;

pub mod instructions;
pub mod errors;
pub mod state;

use instructions::*;


declare_id!("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

#[program]
pub mod x402_hack_payment {
    use super::*;

    pub fn set_platform_config(ctx: Context<InitializePlatform>, fee_bps: u64, min_payment_amount: u64) -> Result<()> {
        instructions::platform::handler(ctx, fee_bps, min_payment_amount)
    }

    pub fn initialize_merchant(ctx: Context<InitializeMerchant>, merchant_id: String, fee_bps: u16) -> Result<()> {
        instructions::initialize::handler(ctx, merchant_id, fee_bps)
    }

    pub fn process_payment(ctx: Context<ProcessPayment>, payment_id: String, amount: u64) -> Result<()> {
        instructions::payment::handler(ctx, payment_id, amount)
    }

    pub fn claim_platform_fees(ctx: Context<ClaimPlatformFees>) -> Result<()> {
        instructions::claim::handler(ctx)
    }

    pub fn refund_payment(ctx: Context<RefundPayment>) -> Result<()> {
        instructions::refund::handler(ctx)
    }

    pub fn transfer_authority(ctx: Context<TransferAuthority>) -> Result<()> {
        instructions::transfer::handler(ctx)
    }

    /// Issue a private receipt for a payment using Inco Lightning
    /// The payment amount is encrypted - only merchant and customer can decrypt
    /// 
    /// # Remaining Accounts
    /// Client must pass allowance PDAs:
    /// - [0] customer_allowance_pda (mut)
    /// - [1] merchant_allowance_pda (mut)
    pub fn issue_private_receipt<'info>(
        ctx: Context<'_, '_, 'info, 'info, IssuePrivateReceipt<'info>>,
        payment_id: String,
        encrypted_amount_ciphertext: Vec<u8>,
    ) -> Result<()> {
        IssuePrivateReceipt::issue_private_receipt(ctx, payment_id, encrypted_amount_ciphertext)
    }

    // ============================================================================
    // PRIVATE SETTLR - Confidential Commerce Features
    // ============================================================================

    /// Initiate a private payout (confidential merchant settlement)
    /// Amount is FHE-encrypted - only merchant and optional auditor can decrypt
    /// B2B use case: hide settlement amounts from competitors
    /// 
    /// # Remaining Accounts
    /// - [0] merchant_allowance_pda (mut)
    /// - [1] auditor_allowance_pda (mut, optional)
    pub fn initiate_private_payout<'info>(
        ctx: Context<'_, '_, 'info, 'info, InitiatePrivatePayout<'info>>,
        payout_id: String,
        encrypted_amount_ciphertext: Vec<u8>,
    ) -> Result<()> {
        InitiatePrivatePayout::initiate_private_payout(ctx, payout_id, encrypted_amount_ciphertext)
    }

    /// Complete a pending private payout
    pub fn complete_private_payout(ctx: Context<CompletePrivatePayout>) -> Result<()> {
        CompletePrivatePayout::complete_private_payout(ctx)
    }

    /// Create a private subscription (recurring payments with hidden amounts)
    /// Killer feature: subscription pricing hidden from chain observers
    /// 
    /// # Remaining Accounts
    /// - [0] customer_allowance_pda (mut)
    /// - [1] merchant_allowance_pda (mut)
    pub fn create_private_subscription<'info>(
        ctx: Context<'_, '_, 'info, 'info, CreatePrivateSubscription<'info>>,
        subscription_id: String,
        encrypted_amount_ciphertext: Vec<u8>,
        billing_cycle_seconds: i64,
    ) -> Result<()> {
        CreatePrivateSubscription::create_private_subscription(
            ctx,
            subscription_id,
            encrypted_amount_ciphertext,
            billing_cycle_seconds,
        )
    }

    /// Process a subscription payment when due
    pub fn process_subscription_payment(ctx: Context<ProcessSubscriptionPayment>) -> Result<()> {
        ProcessSubscriptionPayment::process_subscription_payment(ctx)
    }

    /// Cancel a subscription (customer only)
    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        CancelSubscription::cancel_subscription(ctx)
    }
}


