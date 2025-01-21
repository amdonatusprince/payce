use anchor_lang::prelude::*;
use crate::state::ProgramState;
use crate::errors::ErrorCode;
use crate::events::FeeCollectorUpdated;

#[derive(Accounts)]
pub struct UpdateFeeCollector<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::UnauthorizedAccess,
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn process(
    ctx: Context<UpdateFeeCollector>,
    new_fee_collector: Pubkey,
) -> Result<()> {
    let state = &mut ctx.accounts.program_state;
    let previous_collector = state.fee_collector;
    state.fee_collector = new_fee_collector;

    emit!(FeeCollectorUpdated {
        previous_collector,
        new_collector: new_fee_collector,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}