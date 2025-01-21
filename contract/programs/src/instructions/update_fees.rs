// instructions/update_fees.rs
use anchor_lang::prelude::*;
use crate::state::ProgramState;
use crate::errors::ErrorCode;
use crate::events::FeeUpdated;

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    #[account(
        mut,
        has_one = authority @ ErrorCode::UnauthorizedAccess,
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn process(
    ctx: Context<UpdateFees>,
    new_fee_basis_points: u16,
) -> Result<()> {
    require!(
        new_fee_basis_points <= 1000, // Max 10%
        ErrorCode::InvalidFeeAmount
    );

    let state = &mut ctx.accounts.program_state;
    state.fee_basis_points = new_fee_basis_points;

    emit!(FeeUpdated {
        previous_fee: state.fee_basis_points,
        new_fee: new_fee_basis_points,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}