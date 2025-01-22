// instructions/initialize.rs
use anchor_lang::prelude::*;
use crate::state::*;
use std::str::FromStr;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 +    // discriminator
                32 +   // authority pubkey
                32 +   // usdc_mint pubkey
                32 +   // fee_collector pubkey
                2      // fee_basis_points (u16)
    )]
    pub state: Account<'info, ProgramState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn process(ctx: Context<Initialize>) -> Result<()> {
    let state = &mut ctx.accounts.state;
    state.authority = ctx.accounts.authority.key();
    state.usdc_mint = Pubkey::from_str("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v").unwrap();
    state.fee_collector = Pubkey::from_str("FeeC0LLector111111111111111111111111111111").unwrap();
    state.fee_basis_points = 50;  // Initial fee of 0.5% as default
    Ok(())
}