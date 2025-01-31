import { createBatchPayment } from '@/app/requests/BatchPayment';
import { Types } from "@requestnetwork/request-client.js";
import { CurrencyTypes } from "@requestnetwork/types";
import { supportedCurrencies } from '@/lib/constants';

interface BatchPaymentHandlerProps {
  formData: {
    currency: string;
    network: string;
    dueDate: string;
  };
  address: string;
  walletClient: any;
  batchRecipients: Array<{
    address: string;
    amount: string;
    recipientEmail?: string;
    reason?: string;
  }>;
  onStatusChange: (status: string) => void;
  onEmployeeProgress: (completed: number, total: number) => void;
}

export const handleBatchPayment = async ({
  formData,
  address,
  walletClient,
  batchRecipients,
  onStatusChange,
  onEmployeeProgress
}: BatchPaymentHandlerProps) => {
  const params = {
    payerAddress: address,
    currency: {
      type: Types.RequestLogic.CURRENCY.ETH as const,
      value: 'ETH',
      network: formData.network.toLowerCase() as CurrencyTypes.ChainName,
      decimals: supportedCurrencies[formData.currency as keyof typeof supportedCurrencies].decimals,
    },
    recipients: batchRecipients,
    dueDate: formData.dueDate,
    walletClient,
    onStatusChange,
    onEmployeeProgress
  };

  return await createBatchPayment(params);
}; 