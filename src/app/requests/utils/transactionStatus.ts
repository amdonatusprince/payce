import { Types } from "@requestnetwork/request-client.js";

export const getTransactionStatus = (tx: Types.IRequestData) => {
  // Check if transaction is paid by verifying balance equals or exceeds expected amount
  if (tx.balance?.balance && 
      BigInt(tx.balance.balance) > 0) {
    return 'paid';
  }
  
  // Check if transaction is overdue
  if (tx.contentData?.dueDate && 
      new Date(tx.contentData.dueDate) < new Date()) {
    return 'overdue';
  }
  
  // Otherwise transaction is pending
  return 'pending';
};
