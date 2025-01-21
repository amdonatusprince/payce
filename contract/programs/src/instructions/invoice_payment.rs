use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{self, Payment, ProgramState, RequestTracker, PaymentInfo};
use crate::errors::ErrorCode;
use crate::events::PaymentCompleted;

#[derive(Accounts)]
#[instruction(request_id: String)]
pub struct PayRequest<'info> {
    pub program_state: Account<'info, ProgramState>,
    pub request_tracker: Account<'info, RequestTracker>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 32 + 32,
        seeds = [b"payment", request_id.as_bytes()],
        bump
    )]
    pub payment: Account<'info, Payment>,
    
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
    ctx: Context<PayRequest>,
    request_id: String,
) -> Result<()> {
    let request = &ctx.accounts.request_tracker;
    require!(
        request.request_id == request_id,
        ErrorCode::InvalidRequest
    );

    let recipient_amount = request.amount;
    let fee_basis_points = ctx.accounts.program_state.fee_basis_points;

    let calculated_fee = recipient_amount
        .checked_mul(fee_basis_points as u64)
        .unwrap()
        .checked_div(10000)
        .unwrap();
    
    const FEE_CAP: u64 = 5_000_000;
    const LARGE_TX_THRESHOLD: u64 = 1_000_000_000;

    let fee_amount = if recipient_amount > LARGE_TX_THRESHOLD {
        std::cmp::min(calculated_fee, FEE_CAP)
    } else {
        calculated_fee
    };

    // Transfer fee to collector
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

    // Transfer payment to recipient
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_usdc.to_account_info(),
                to: ctx.accounts.recipient_usdc.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        ),
        recipient_amount,
    )?;

    // Record payment
    let payment_info = PaymentInfo {
        request_id: request_id.clone(),
        token_mint: ctx.accounts.program_state.usdc_mint,
        usdc_amount: recipient_amount,
        usdc_fee: fee_amount,
        payer: ctx.accounts.payer.key(),
        recipient: ctx.accounts.request_tracker.recipient,
    };

    state::record_payment(&mut ctx.accounts.payment, &payment_info)?;

    emit!(PaymentCompleted {
        request_id,
        payer: ctx.accounts.payer.key(),
        recipient: ctx.accounts.request_tracker.recipient,
        usdc_amount: recipient_amount,
        token_mint: ctx.accounts.program_state.usdc_mint,
        usdc_fee: fee_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}