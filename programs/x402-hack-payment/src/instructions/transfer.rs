use anchor_lang::prelude::*;

use crate::state::platform::Platform;
use crate::errors::PaymentError;

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the new authority (can be a wallet or Squads vault)
    pub new_authority: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump,
        has_one = authority @ PaymentError::Unauthorized,
    )]
    pub platform_config: Account<'info, Platform>,
}

impl<'info> TransferAuthority<'info> {
    pub fn transfer_authority(&mut self) -> Result<()> {
        let old_authority = self.platform_config.authority;
        self.platform_config.authority = self.new_authority.key();
        
        msg!(
            "Authority transferred from {} to {}",
            old_authority,
            self.new_authority.key()
        );
        Ok(())
    }
}

pub fn handler(ctx: Context<TransferAuthority>) -> Result<()> {
    ctx.accounts.transfer_authority()
}
