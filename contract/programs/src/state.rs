use anchor_lang::prelude::*;

#[account]
pub struct ProgramState {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub fee_collector: Pubkey,
    pub fee_basis_points: u16,  // txn fees: 100 = 1%, 50 = 0.5% (default)
}
#[account]
pub struct RequestTracker {
    pub creator: Pubkey,
    pub request_id: String,
    pub amount: u64,    
    pub recipient: Pubkey,
    pub created_at: i64,
}

#[account]
pub struct Payment {
    pub request_id: String,
    pub token_mint: Pubkey,  // The SPL token used to pay
    pub usdc_amount: u64,    // Changed from amount to usdc_amount
    pub usdc_fee: u64,      // Changed from fee to usdc_fee
    pub timestamp: i64,
    pub payer: Pubkey,
    pub recipient: Pubkey,
}

pub struct PaymentInfo {
    pub request_id: String,
    pub token_mint: Pubkey,  
    pub usdc_amount: u64,    // Already correct
    pub usdc_fee: u64,       // Already correct
    pub payer: Pubkey,
    pub recipient: Pubkey,
}

pub fn record_payment(
    payment: &mut Account<Payment>,
    info: &PaymentInfo,
) -> Result<()> {
    payment.request_id = info.request_id.clone();
    payment.token_mint = info.token_mint;
    payment.usdc_amount = info.usdc_amount;  // Updated to match struct fields
    payment.usdc_fee = info.usdc_fee;        // Updated to match struct fields
    payment.timestamp = Clock::get()?.unix_timestamp;
    payment.payer = info.payer;
    payment.recipient = info.recipient;
    Ok(())
}

#[account]
pub struct SinglePaymentRecord {
    pub payer: Pubkey,
    pub payer_name: String,        // Max 50 chars
    pub recipient: Pubkey,
    pub usdc_amount: u64,
    pub token_mint: Pubkey,        // Token used to pay
    pub usdc_fee: u64,
    pub timestamp: i64,
    pub reason: String,            // Max 200 chars
}
