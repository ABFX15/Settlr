use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod instructions;
pub mod errors;
pub mod state;

use instructions::*;


declare_id!("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

#[ephemeral]
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

    /// Process a payout from the platform treasury to a recipient wallet.
    pub fn process_payout(ctx: Context<ProcessPayout>, amount: u64, payout_id: String) -> Result<()> {
        instructions::payout::handler(ctx, amount, payout_id)
    }

    // ─── MagicBlock Private Ephemeral Rollup (PER) Instructions ──────

    /// Create a private payment session. The account will later be delegated
    /// to a PER where all data is hidden inside Intel TDX.
    pub fn issue_private_receipt<'info>(
        ctx: Context<'_, '_, 'info, 'info, IssuePrivateReceipt<'info>>,
        payment_id: String,
        amount: u64,
        fee_amount: u64,
        memo: String,
    ) -> Result<()> {
        IssuePrivateReceipt::issue_private_receipt(ctx, payment_id, amount, fee_amount, memo)
    }

    /// Delegate the private payment account to MagicBlock's PER (TEE).
    /// After this call the account data is hidden inside Intel TDX.
    pub fn delegate_private_payment(ctx: Context<DelegatePrivatePayment>, payment_id: String) -> Result<()> {
        instructions::private_receipt::delegate_private_payment(ctx, payment_id)
    }

    /// Process the payment inside the PER (runs in TEE — hidden from observers).
    pub fn process_private_payment(ctx: Context<ProcessPrivatePayment>, payment_id: String) -> Result<()> {
        instructions::private_receipt::process_private_payment(ctx, payment_id)
    }

    /// Settle — commit the final state back to Solana base layer and undelegate.
    pub fn settle_private_payment(ctx: Context<SettlePrivatePayment>, payment_id: String) -> Result<()> {
        instructions::private_receipt::settle_private_payment(ctx, payment_id)
    }
}


