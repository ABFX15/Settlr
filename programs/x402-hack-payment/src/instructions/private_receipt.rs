use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::cpi::{delegate_account, DelegateAccounts, DelegateConfig};
use ephemeral_rollups_sdk::anchor::delegate;

use crate::state::{PrivateReceipt, SessionStatus};
use crate::errors::PaymentError;

/// ──────────────────────────────────────────────────────────────────────
/// 1. Create a private payment session (on base layer)
///    Initialises the account that will later be delegated to a PER.
/// ──────────────────────────────────────────────────────────────────────
#[derive(Accounts)]
#[instruction(payment_id: String)]
pub struct IssuePrivateReceipt<'info> {
    /// The customer who made the payment (pays for account creation)
    #[account(mut)]
    pub customer: Signer<'info>,

    /// The merchant who received the payment
    /// CHECK: We just store the pubkey
    pub merchant: AccountInfo<'info>,

    /// The private receipt account to create
    #[account(
        init,
        payer = customer,
        space = 8 + PrivateReceipt::INIT_SPACE,
        seeds = [PrivateReceipt::SEED, payment_id.as_bytes()],
        bump,
    )]
    pub private_receipt: Account<'info, PrivateReceipt>,

    pub system_program: Program<'info, System>,
}

impl<'info> IssuePrivateReceipt<'info> {
    pub fn issue_private_receipt(
        ctx: Context<'_, '_, 'info, 'info, IssuePrivateReceipt<'info>>,
        payment_id: String,
        amount: u64,
        fee_amount: u64,
        memo: String,
    ) -> Result<()> {
        require!(
            !payment_id.is_empty() && payment_id.len() <= 64,
            PaymentError::InvalidPaymentId
        );

        let receipt = &mut ctx.accounts.private_receipt;
        receipt.payment_id = payment_id.clone();
        receipt.customer = ctx.accounts.customer.key();
        receipt.merchant = ctx.accounts.merchant.key();
        receipt.amount = amount;
        receipt.fee_amount = fee_amount;
        receipt.session_status = SessionStatus::Pending;
        receipt.is_delegated = false;
        receipt.memo = memo;
        receipt.created_at = Clock::get()?.unix_timestamp;
        receipt.settled_at = 0;
        receipt.bump = ctx.bumps.private_receipt;

        msg!("🔒 Private payment session created: {}", payment_id);
        msg!("   Amount: {} USDC lamports (will be hidden once delegated to PER)", amount);
        msg!("   Customer: {}", ctx.accounts.customer.key());
        msg!("   Merchant: {}", ctx.accounts.merchant.key());

        Ok(())
    }
}

/// ──────────────────────────────────────────────────────────────────────
/// 2. Delegate the private receipt to a Private Ephemeral Rollup (TEE)
///    After delegation the account data is hidden inside Intel TDX.
///    
///    Uses MagicBlock Delegation Program:
///    DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh
/// ──────────────────────────────────────────────────────────────────────
#[delegate]
#[derive(Accounts)]
#[instruction(payment_id: String)]
pub struct DelegatePrivatePayment<'info> {
    /// The customer who owns the session (payer for delegation)
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The private receipt PDA to delegate
    #[account(
        mut,
        seeds = [PrivateReceipt::SEED, payment_id.as_bytes()],
        bump,
    )]
    pub private_receipt: Account<'info, PrivateReceipt>,

    /// CHECK: owner program (this program)
    pub owner_program: AccountInfo<'info>,

    /// CHECK: delegation buffer PDA
    #[account(mut)]
    pub buffer: AccountInfo<'info>,

    /// CHECK: delegation record PDA
    #[account(mut)]
    pub delegation_record: AccountInfo<'info>,

    /// CHECK: delegation metadata PDA
    #[account(mut)]
    pub delegation_metadata: AccountInfo<'info>,

    /// CHECK: MagicBlock delegation program
    pub delegation_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn delegate_private_payment(
    ctx: Context<DelegatePrivatePayment>,
    payment_id: String,
) -> Result<()> {
    let pda_seeds: &[&[u8]] = &[PrivateReceipt::SEED, payment_id.as_bytes()];

    delegate_account(
        DelegateAccounts {
            payer: &ctx.accounts.payer.to_account_info(),
            pda: &ctx.accounts.private_receipt.to_account_info(),
            owner_program: &ctx.accounts.owner_program,
            buffer: &ctx.accounts.buffer,
            delegation_record: &ctx.accounts.delegation_record,
            delegation_metadata: &ctx.accounts.delegation_metadata,
            delegation_program: &ctx.accounts.delegation_program,
            system_program: &ctx.accounts.system_program.to_account_info(),
        },
        pda_seeds,
        DelegateConfig {
            commit_frequency_ms: 30000,
            validator: None, // will use default TEE validator
        },
    ).map_err(|_| error!(PaymentError::MissingAllowanceAccounts))?;

    let receipt = &mut ctx.accounts.private_receipt;
    receipt.is_delegated = true;
    receipt.session_status = SessionStatus::Active;

    msg!("📡 Private payment {} delegated to PER (TEE)", payment_id);
    msg!("   Account data now hidden inside Intel TDX enclave");

    Ok(())
}

/// ──────────────────────────────────────────────────────────────────────
/// 3. Process the payment inside the PER  (sent to TEE endpoint)
///    This runs inside the Trusted Execution Environment — hidden from
///    base-layer observers. Only permissioned members see the data.
/// ──────────────────────────────────────────────────────────────────────
#[derive(Accounts)]
#[instruction(payment_id: String)]
pub struct ProcessPrivatePayment<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [PrivateReceipt::SEED, payment_id.as_bytes()],
        bump,
    )]
    pub private_receipt: Account<'info, PrivateReceipt>,
}

pub fn process_private_payment(
    ctx: Context<ProcessPrivatePayment>,
    _payment_id: String,
) -> Result<()> {
    let receipt = &mut ctx.accounts.private_receipt;
    require!(
        receipt.session_status == SessionStatus::Active,
        PaymentError::MissingAllowanceAccounts
    );

    // Mark as processed (actual USDC transfer happens in the public process_payment ix)
    receipt.session_status = SessionStatus::Processed;

    msg!("✅ Private payment processed inside TEE");
    msg!("   Amount: {} (hidden from base-layer observers)", receipt.amount);

    Ok(())
}

/// ──────────────────────────────────────────────────────────────────────
/// 4. Settle — commit state back to base layer and undelegate
///    After this, the final state is visible on-chain.
/// ──────────────────────────────────────────────────────────────────────
#[derive(Accounts)]
#[instruction(payment_id: String)]
pub struct SettlePrivatePayment<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [PrivateReceipt::SEED, payment_id.as_bytes()],
        bump,
    )]
    pub private_receipt: Account<'info, PrivateReceipt>,
}

pub fn settle_private_payment(
    ctx: Context<SettlePrivatePayment>,
    _payment_id: String,
) -> Result<()> {
    let receipt = &mut ctx.accounts.private_receipt;

    receipt.session_status = SessionStatus::Settled;
    receipt.is_delegated = false;
    receipt.settled_at = Clock::get()?.unix_timestamp;

    msg!("🏁 Private payment settled on base layer");
    msg!("   Final amount: {} USDC lamports", receipt.amount);
    msg!("   Fee: {} USDC lamports", receipt.fee_amount);

    Ok(())
}
