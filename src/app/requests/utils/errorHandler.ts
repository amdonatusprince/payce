export const formatTransactionError = (error: any): string => {
  // MetaMask user rejection
  if (error.code === 4001 || error.message?.includes('User denied transaction')) {
    return 'Transaction was cancelled';
  }

  // Insufficient funds
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }

  // Gas estimation failed
  if (error.message?.includes('gas required exceeds allowance') || 
      error.message?.includes('cannot estimate gas')) {
    return 'Unable to estimate gas for transaction';
  }

  // Network error
  if (error.message?.includes('network') || error.message?.includes('connection')) {
    return 'Network error occurred. Please try again';
  }

  // Contract-specific errors (customize based on your needs)
  if (error.message?.includes('execution reverted')) {
    return 'Transaction failed: Contract execution error';
  }

  // Fallback for unknown errors
  return 'Transaction failed. Please try again';
};
