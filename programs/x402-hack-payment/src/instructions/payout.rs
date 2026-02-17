use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, Transfer, transfer};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::platform::Platform;
use crate::errors::PaymentError;

/// Process a payout from the platform treasury to any recipient wallet.
/// Only the platform authority can call this instruction.
/// Used by the Settlr Payout API — platforms deposit USDC to treasury,
/// then call this to release funds to recipients who have claimed via email.
#[derive(Accounts)]
pub struct ProcessPayout<'info> {
    /// Platform authority — must sign. Can be a wallet or Squads vault.
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [Platform::SEED],
        bump = platform_config.bump,
        has_one = authority @ PaymentError::Unauthorized,
    )]
    pub platform_config: Account<'info, Platform>,

    /// Platform treasury PDA — holds escrowed USDC for payouts
    #[account(
        mut,
        seeds = [Platform::TREASURY_SEED],
        bump = platform_config.treasury_bump,
        token::mint = usdc_mint,
        token::authority = platform_config,
    )]
    pub platform_treasury_usdc: Account<'info, TokenAccount>,

    /// Recipient's USDC token account — created if needed via init_if_needed
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = usdc_mint,
        associated_token::authority = recipient,
    )]
    pub recipient_usdc: Account<'info, TokenAccount>,

    /// The recipient's wallet (just needs to be a valid account, not a signer)
    /// CHECK: We only need the pubkey to derive the ATA — no data is read.
    pub recipient: UncheckedAccount<'info>,

    pub usdc_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> ProcessPayout<'info> {
    pub fn process_payout(&mut self, amount: u64, payout_id: String) -> Result<()> {
        require!(self.platform_config.is_active, PaymentError::PlatformInactive);
        require!(amount > 0, PaymentError::PaymentBelowMinimum);
        require!(!payout_id.is_empty() && payout_id.len() <= 64, PaymentError::InvalidPaymentId);

        let treasury_balance = self.platform_treasury_usdc.amount;
        require!(treasury_balance >= amount, PaymentError::InsufficientTreasuryBalance);

        // Transfer from treasury PDA to recipient ATA
        let cpi_accounts = Transfer {
            from: self.platform_treasury_usdc.to_account_info(),
            to: self.recipient_usdc.to_account_info(),
            authority: self.platform_config.to_account_info(),
        };

        // PDA signer — platform_config is the token authority for treasury
        let seeds = &[Platform::SEED, &[self.platform_config.bump]];
        let signer = &[&seeds[..]];

        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        transfer(cpi_ctx, amount)?;

        msg!(
            "Payout {} : {} lamports to {}",
            payout_id,
            amount,
            self.recipient.key()
        );

        Ok(())
    }
}

pub fn handler(ctx: Context<ProcessPayout>, amount: u64, payout_id: String) -> Result<()> {
    ctx.accounts.process_payout(amount, payout_id)
}
