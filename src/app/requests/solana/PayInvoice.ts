import { sendInvoicePayment } from './SendInvoicePayment';
type RequestStatus = 'pending' | 'completed' | 'failed';

export const payInvoice = async (
  invoice: any,
  connection: any,
  walletProvider: any,
  network: string,
  onStatusChange?: (status: RequestStatus) => void
) => {
  try {
    onStatusChange?.('pending');
    if (walletProvider.publicKey.toString() !== invoice.invoice.payer) {
      throw new Error('Connected wallet is not the invoice payer');
    }

    const paymentResult = await sendInvoicePayment({
      connection,
      walletProvider,
      amount: invoice.invoice.amount,
      recipient: invoice.invoice.payee,
      payer: invoice.invoice.payer,
      network,
      transactionId: invoice.transactionId
    });

    if (paymentResult.success) {
      onStatusChange?.('completed');
      return {
        status: 'completed',
        transactionId: paymentResult.transactionId,
        explorerUrl: paymentResult.explorerUrl
      };
    }

    throw new Error('Payment failed');

  } catch (error) {
    onStatusChange?.('failed');
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
}; 