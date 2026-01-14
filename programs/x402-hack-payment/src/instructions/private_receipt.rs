use anchor_lang::prelude::*;
use inco_lightning::cpi::accounts::{Operation, Allow};
use inco_lightning::cpi::{new_euint128, allow};
use inco_lightning::ID as INCO_LIGHTNING_ID;

use crate::state::PrivateReceipt;
use crate::errors::PaymentError;

/// Issue a private receipt for a payment with FHE-encrypted amount
/// 
/// The receipt stores the payment amount encrypted using Inco Lightning.
/// Only merchant and customer are granted decryption access via allowance PDAs.
/// 
/// remaining_accounts must contain:
/// [0] customer_allowance_pda (mut) - PDA for customer decryption access
/// [1] merchant_allowance_pda (mut) - PDA for merchant decryption access
#[derive(Accounts)]
#[instruction(payment_id: String)]
pub struct IssuePrivateReceipt<'info> {
    /// The customer who made the payment (pays for account creation)
    #[account(mut)]
    pub customer: Signer<'info>,
    
    /// The merchant who received the payment
    /// CHECK: We just store the pubkey and grant decryption access
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
    
    /// Inco Lightning program for encrypted operations
    /// CHECK: Verified by address constraint
    #[account(address = INCO_LIGHTNING_ID)]
    pub inco_lightning_program: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> IssuePrivateReceipt<'info> {
    /// Issue a private receipt with encrypted amount
    /// 
    /// # Arguments
    /// * `payment_id` - Unique identifier for the payment
    /// * `encrypted_amount_ciphertext` - Client-encrypted amount (FHE ciphertext)
    /// * `bumps` - PDA bumps
    /// 
    /// # Remaining Accounts
    /// The client must pass allowance PDAs via remaining_accounts:
    /// - [0] customer_allowance_pda (derived from [handle_bytes, customer_pubkey])
    /// - [1] merchant_allowance_pda (derived from [handle_bytes, merchant_pubkey])
    pub fn issue_private_receipt(
        ctx: Context<'_, '_, 'info, 'info, IssuePrivateReceipt<'info>>,
        payment_id: String,
        encrypted_amount_ciphertext: Vec<u8>,
    ) -> Result<()> {
        require!(!payment_id.is_empty() && payment_id.len() <= 64, PaymentError::InvalidPaymentId);
        
        // Validate remaining accounts for allowance PDAs
        require!(ctx.remaining_accounts.len() >= 2, PaymentError::MissingAllowanceAccounts);
        let customer_allowance = &ctx.remaining_accounts[0];
        let merchant_allowance = &ctx.remaining_accounts[1];
        
        // Create CPI context for creating encrypted value
        let operation_ctx = CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Operation {
                signer: ctx.accounts.customer.to_account_info(),
            },
        );
        
        // Create encrypted amount from client-provided ciphertext
        // The third argument (0) indicates the input is ciphertext, not plaintext
        let encrypted_amount = new_euint128(
            operation_ctx,
            encrypted_amount_ciphertext,
            0_u8, // 0 = ciphertext input, 1 = plaintext input
        )?;
        
        // Extract the u128 handle from Euint128
        let handle: u128 = encrypted_amount.0;
        
        // Grant decryption access to customer
        let customer_allow_ctx = CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Allow {
                allowance_account: customer_allowance.to_account_info(),
                signer: ctx.accounts.customer.to_account_info(),
                allowed_address: ctx.accounts.customer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        );
        allow(
            customer_allow_ctx,
            handle,
            true, // is_self = true (granting access)
            ctx.accounts.customer.key(),
        )?;
        
        // Grant decryption access to merchant
        let merchant_allow_ctx = CpiContext::new(
            ctx.accounts.inco_lightning_program.to_account_info(),
            Allow {
                allowance_account: merchant_allowance.to_account_info(),
                signer: ctx.accounts.customer.to_account_info(),
                allowed_address: ctx.accounts.merchant.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
        );
        allow(
            merchant_allow_ctx,
            handle,
            true, // is_self = true (granting access)
            ctx.accounts.merchant.key(),
        )?;
        
        // Initialize the private receipt with the encrypted handle
        let receipt = &mut ctx.accounts.private_receipt;
        receipt.payment_id = payment_id.clone();
        receipt.customer = ctx.accounts.customer.key();
        receipt.merchant = ctx.accounts.merchant.key();
        receipt.encrypted_amount_handle = handle;
        receipt.encrypted_metadata_handle = None;
        receipt.issued_at = Clock::get()?.unix_timestamp;
        receipt.bump = ctx.bumps.private_receipt;
        
        msg!("🔒 Private receipt issued for payment: {}", payment_id);
        msg!("   Handle: {}", handle);
        msg!("   Customer {} granted decrypt access", ctx.accounts.customer.key());
        msg!("   Merchant {} granted decrypt access", ctx.accounts.merchant.key());
        
        Ok(())
    }
}
