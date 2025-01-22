// errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid request ID")]
    InvalidRequest,
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Invalid fee amount")]
    InvalidFeeAmount,
    #[msg("String too long")]
    StringTooLong,
    #[msg("Invalid mint - only USDC payments are accepted")]
    InvalidMint,
}