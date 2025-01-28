import { PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { USDC_MINT } from '@/lib/constants';

interface SendInvoicePaymentParams {
  connection: any;
  walletProvider: any;
  amount: number;
  recipient: string;
  payer: string;
  network: string;
  transactionId: string;
}

export const sendInvoicePayment = async ({
  connection,
  walletProvider,
  amount,
  recipient,
  payer,
  network,
  transactionId
}: SendInvoicePaymentParams) => {
  try {
    const sender = walletProvider.publicKey;
    if (!sender) throw new Error('Please connect your wallet');
    if (sender.toString() !== payer) throw new Error('Connected wallet is not the invoice payer');

    const recipientPubkey = new PublicKey(recipient);
    const mint = new PublicKey(USDC_MINT);

    // Get token accounts
    const senderATA = await getAssociatedTokenAddress(mint, sender);
    const recipientATA = await getAssociatedTokenAddress(mint, recipientPubkey);

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      senderATA,
      recipientATA,
      sender,
      BigInt(amount * (10 ** 6))
    );

    const transaction = new Transaction().add(transferInstruction);
    transaction.feePayer = sender;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const tx = await walletProvider.signAndSendTransaction(transaction);
    const explorerUrl = network.toLowerCase().includes('devnet') 
    ? `https://explorer.solana.com/tx/${tx}?cluster=devnet`
    : `https://explorer.solana.com/tx/${tx}`;

    console.log("transaction successful", explorerUrl)
    // Update invoice status with explorer URL
    const updateResponse = await fetch('/api/invoices/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        status: 'paid',
        explorerUrl
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update invoice status');
    }

    return {
      success: true,
      transactionId: tx,
      explorerUrl
    };

  } catch (error) {
    console.error('Payment Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
}; 