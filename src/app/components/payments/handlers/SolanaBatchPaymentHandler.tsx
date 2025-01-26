import { Connection } from '@solana/web3.js';
import { Provider } from '@reown/appkit-adapter-solana/react';
import { sendSolanaPayment } from '@/app/requests/solana/sendSolanaPayment';

const shortenAddress = (address: string) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

interface BatchRecipient {
  address: string;
  amount: string;
  recipientName?: string;
  email?: string;
  reason?: string;
}

interface SolanaBatchPaymentProps {
  recipients: BatchRecipient[];
  connection: Connection;
  walletProvider: Provider;
  onStatusUpdate: (message: string) => void;
  network: 'mainnet' | 'devnet';
}

export const handleSolanaBatchPayment = async ({
  recipients,
  connection,
  walletProvider,
  onStatusUpdate,
  network,
}: SolanaBatchPaymentProps) => {
  const results = [];
  const totalRecipients = recipients.length;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const recipientIndex = i + 1;
    const displayAddress = recipient.recipientName || shortenAddress(recipient.address);
    
    try {
      onStatusUpdate(
        `${recipientIndex}/${totalRecipients}: Sending ${recipient.amount} USDC → ${displayAddress}`
      );

      const signature = await sendSolanaPayment({
        connection,
        walletProvider,
        recipientAddress: recipient.address,
        amount: recipient.amount,
        recipientName: recipient.recipientName || '',
        reason: recipient.reason || '',
        network
      });

      results.push({
        status: 'success',
        signature,
      });

      onStatusUpdate(
        `${recipientIndex}/${totalRecipients}: ✓ ${recipient.amount} USDC → ${displayAddress}`
      );
    } catch (error) {
      console.error(`Error sending to recipient ${recipientIndex}:`, error);
      results.push({
        recipient: recipient.address,
        amount: recipient.amount,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });

      onStatusUpdate(
        `${recipientIndex}/${totalRecipients}: ✗ ${recipient.amount} USDC → ${displayAddress}`
      );
    }
  }

  return results;
}; 