// instructions/register.rs
use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;

#[derive(Accounts)]
#[instruction(request_id: String)]
pub struct RegisterRequest<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 200 + 8 + 32 + 8,
        seeds = [b"request", request_id.as_bytes()],
        bump
    )]
    pub request_tracker: Account<'info, RequestTracker>,
    pub system_program: Program<'info, System>,
}

pub fn process(
    ctx: Context<RegisterRequest>,
    request_id: String,
    amount_usdc: u64,
    recipient: Pubkey,
) -> Result<()> {
    let request_tracker = &mut ctx.accounts.request_tracker;
    request_tracker.creator = ctx.accounts.creator.key();
    request_tracker.request_id = request_id.clone();
    request_tracker.amount = amount_usdc;
    request_tracker.recipient = recipient;
    request_tracker.created_at = Clock::get()?.unix_timestamp;

    emit!(RequestCreated {
        request_id,
        creator: ctx.accounts.creator.key(),
        recipient,
        amount: amount_usdc,
        timestamp: request_tracker.created_at,
    });

    Ok(())
}