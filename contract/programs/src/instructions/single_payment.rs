use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{ProgramState, SinglePaymentRecord};
use crate::errors::ErrorCode;
use crate::events::SinglePaymentCompleted;

#[derive(Accounts)]
#[instruction(payer_name: String, reason: String)]
pub struct SinglePayment<'info> {
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + // discriminator
                32 + // payer
                50 + // payer_name string
                32 + // recipient
                8 +  // usdc_amount
                32 + // token_mint
                8 +  // usdc_fee
                8 +  // timestamp
                200, // reason string
        seeds = [
            b"single_payment",
            payer.key().as_ref(),
            Clock::get()?.unix_timestamp.to_be_bytes().as_ref()
        ],
        bump
    )]
    pub payment_record: Account<'info, SinglePaymentRecord>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        constraint = payer_usdc.mint == program_state.usdc_mint
    )]
    pub payer_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub fee_collector_usdc: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn process(
    ctx: Context<SinglePayment>,
    amount_usdc: u64,
    payer_name: String,
    reason: String,
) -> Result<()> {
    require!(
        payer_name.len() <= 50,
        ErrorCode::StringTooLong
    );
    require!(
        reason.len() <= 200,
        ErrorCode::StringTooLong
    );

    let fee_basis_points = ctx.accounts.program_state.fee_basis_points;

    // Calculate fee with cap
    let calculated_fee = amount_usdc
        .checked_mul(fee_basis_points as u64)
        .unwrap()
        .checked_div(10000)
        .unwrap();
    
    const FEE_CAP: u64 = 5_000_000;
    const LARGE_TX_THRESHOLD: u64 = 1_000_000_000;

    let fee_amount = if amount_usdc > LARGE_TX_THRESHOLD {
        std::cmp::min(calculated_fee, FEE_CAP)
    } else {
        calculated_fee
    };

    // Transfer fee
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_usdc.to_account_info(),
                to: ctx.accounts.fee_collector_usdc.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        ),
        fee_amount,
    )?;

    // Transfer to recipient
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_usdc.to_account_info(),
                to: ctx.accounts.recipient_usdc.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        ),
        amount_usdc,
    )?;

    // Record payment with cloned strings for storage
    let payment_record = &mut ctx.accounts.payment_record;
    payment_record.payer = ctx.accounts.payer.key();
    payment_record.payer_name = payer_name.clone();
    payment_record.recipient = ctx.accounts.recipient_usdc.owner;
    payment_record.usdc_amount = amount_usdc;
    payment_record.token_mint = ctx.accounts.program_state.usdc_mint;
    payment_record.usdc_fee = fee_amount;
    payment_record.timestamp = Clock::get()?.unix_timestamp;
    payment_record.reason = reason.clone();

    emit!(SinglePaymentCompleted {
        payer: ctx.accounts.payer.key(),
        payer_name,
        recipient: ctx.accounts.recipient_usdc.owner,
        usdc_amount: amount_usdc,
        token_mint: ctx.accounts.program_state.usdc_mint,
        usdc_fee: fee_amount,
        timestamp: Clock::get()?.unix_timestamp,
        reason,
    });

    Ok(())
}