// events.rs
use anchor_lang::prelude::*;
#[event]
pub struct RequestCreated {
    pub request_id: String,
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PaymentCompleted {
    pub request_id: String,
    pub payer: Pubkey,
    pub recipient: Pubkey,
    pub usdc_amount: u64, 
    pub token_mint: Pubkey,
    pub usdc_fee: u64,   
    pub timestamp: i64,
}

#[event]
pub struct FeeUpdated {
    pub previous_fee: u16,
    pub new_fee: u16,
    pub timestamp: i64,
}

#[event]
pub struct FeeCollectorUpdated {
    pub previous_collector: Pubkey,
    pub new_collector: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SinglePaymentCompleted {
    pub payer: Pubkey,
    pub payer_name: String,
    pub recipient: Pubkey,
    pub usdc_amount: u64,
    pub token_mint: Pubkey,
    pub usdc_fee: u64,
    pub timestamp: i64,
    pub reason: String,
}