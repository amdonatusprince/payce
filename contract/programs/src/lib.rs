use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod errors;
pub mod events;

use instructions::*;

declare_id!("URMK39HrCR54mssQa2tub7596Y3M5VcLVLEgX1wZe56");

#[program]
pub mod payment_proxy {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::process(ctx)
    }

    // Invoice Payment Functions
    pub fn register_request(
        ctx: Context<RegisterRequest>,
        request_id: String,
        amount_usdc: u64,
        recipient: Pubkey,
    ) -> Result<()> {
        instructions::register::process(ctx, request_id, amount_usdc, recipient)
    }

    pub fn pay_request(
        ctx: Context<PayRequest>,
        request_id: String,
    ) -> Result<()> {
        instructions::invoice_payment::process(ctx, request_id)
    }

    // Single Payment Function
    pub fn make_single_payment(
        ctx: Context<SinglePayment>,
        amount_usdc: u64,
        payer_name: String,
        reason: String,
    ) -> Result<()> {
        instructions::single_payment::process(ctx, amount_usdc, payer_name, reason)
    }

    // Admin Functions
    pub fn update_fees(
        ctx: Context<UpdateFees>,
        new_fee_basis_points: u16,
    ) -> Result<()> {
        instructions::update_fees::process(ctx, new_fee_basis_points)
    }

    pub fn update_fee_collector(
        ctx: Context<UpdateFeeCollector>,
        new_fee_collector: Pubkey,
    ) -> Result<()> {
        instructions::update_fee_collector::process(ctx, new_fee_collector)
    }

}