import { createPaymentRequest } from '@/app/requests/PaymentForwarder';
import { sendSolanaPayment } from '@/app/requests/solana/sendSolanaPayment';
import { Types } from "@requestnetwork/request-client.js";
import { CurrencyTypes } from "@requestnetwork/types";
import { supportedCurrencies } from '@/lib/constants';

interface SinglePaymentHandlerProps {
  formData: {
    recipientAddress: string;
    recipientName: string;
    amount: string;
    currency: string;
    network: string;
    reason: string;
    dueDate: string;
    recipientEmail: string;
  };
  address: string;
  walletClient: any;
  connection: any;
  walletProvider: any;
  isSolanaNetwork: boolean;
}

export const handleSinglePayment = async ({
  formData,
  address,
  walletClient,
  connection,
  walletProvider,
  isSolanaNetwork
}: SinglePaymentHandlerProps) => {
  if (isSolanaNetwork) {
    return await sendSolanaPayment({
      connection,
      walletProvider,
      recipientAddress: formData.recipientAddress,
      amount: formData.amount,
      recipientName: formData.recipientName,
      reason: formData.reason,
      network: formData.network
    });
  } else {
    if (!walletClient) throw new Error('Wallet client not initialized');
    
    const params = {
      payerAddress: formData.recipientAddress,
      expectedAmount: formData.amount,
      currency: {
        type: Types.RequestLogic.CURRENCY.ETH as const,
        value: 'ETH',
        network: formData.network.toLowerCase() as CurrencyTypes.ChainName,
        decimals: supportedCurrencies[formData.currency as keyof typeof supportedCurrencies].decimals,
      },
      recipientAddress: address,
      reason: formData.reason,
      dueDate: formData.dueDate,
      contentData: {
        transactionType: 'single_forwarder' as const,
        paymentDetails: {
          payerName: formData.recipientName,
          reason: formData.reason,
          dueDate: formData.dueDate,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          builderId: "payce-finance",
          createdBy: address,
        }
      },
    };

    return await createPaymentRequest({ 
      params: {
        ...params,
        walletClient
      }
    });
  }
}; 