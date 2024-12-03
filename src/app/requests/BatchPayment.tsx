import { Types } from "@requestnetwork/request-client.js";
import { createRequest, CreateRequestParams } from "./CreateRequest";
import { CurrencyTypes } from "@requestnetwork/types";
import { 
  approveErc20BatchConversionIfNeeded,
  payBatchConversionProxyRequest,
  payBatchProxyRequest,
} from "@requestnetwork/payment-processor";
import { EnrichedRequest } from "@requestnetwork/payment-processor/dist/types";

interface RecipientParams {
  address: string;
  amount: string;
  reason?: string;
}

interface BatchPaymentParams {
  walletClient: any;
  payerAddress: string;
  currency: {
    type: Types.RequestLogic.CURRENCY;
    value: string;
    network: CurrencyTypes.ChainName;
    decimals: number;
  };
  recipients: RecipientParams[];
  dueDate?: string;
  onStatusChange?: (status: string) => void;
  onEmployeeProgress?: (completed: number, total: number) => void;
}

export async function createBatchPayment({
  walletClient,
  payerAddress,
  currency,
  recipients,
  dueDate,
  onStatusChange,
  onEmployeeProgress
}: BatchPaymentParams) {
  try {
    onStatusChange?.("Creating batch payment requests...");
    
    // 1. Create individual requests for each employee
    const enrichedRequests: EnrichedRequest[] = [];
    const requests: Types.IRequestData[] = [];
    let completedRequests = 0;

    for (const recipient of recipients) {
      const requestParams: CreateRequestParams = {
        walletClient,
        payerAddress,
        expectedAmount: recipient.amount,
        currency,
        recipientAddress: recipient.address,
        reason: recipient.reason,
        dueDate,
        contentData: {
          transactionType: 'batch_payment',
          builderId: "payce-finance"
        },
        onStatusChange: (status) => {
          onStatusChange?.(`Recipient ${completedRequests + 1}/${recipients.length}: ${status}`);
        }
      };

      const { request } = await createRequest(requestParams);
      const requestData = request.getData();
      requests.push(requestData);
      
      if (currency.type === Types.RequestLogic.CURRENCY.ETH) {
        enrichedRequests.push({
          paymentNetworkId: Types.Extension.PAYMENT_NETWORK_ID.ETH_FEE_PROXY_CONTRACT,
          request: requestData,
          paymentSettings: { maxToSpend: '0' }
        });
      }

      completedRequests++;
      onEmployeeProgress?.(completedRequests, recipients.length);
    }

    if (currency.type === Types.RequestLogic.CURRENCY.ETH) {
      // Handle ETH batch payment
      onStatusChange?.("Executing ETH batch payment...");
      const batchTx = await payBatchProxyRequest(
        requests,
        '0.2.0', // version
        walletClient,
        10, // batchFee (0.1%)
        {
          gasLimit: 500000
        }
      );

      onStatusChange?.("Waiting for ETH batch payment confirmation...");
      const receipt = await batchTx.wait(2);

      onStatusChange?.("ETH batch payment completed!");
      return {
        transactionHash: receipt.transactionHash,
        requests,
        receipt
      };

    } else {
      // Handle ERC20 batch payment
      onStatusChange?.("Approving tokens for batch payment...");
      await approveErc20BatchConversionIfNeeded(
        enrichedRequests[0].request,
        payerAddress,
        walletClient,
        undefined,
        {
          currency,
          maxToSpend: '0',
        }
      );

      onStatusChange?.("Executing ERC20 batch payment...");
      const batchTx = await payBatchConversionProxyRequest(
        enrichedRequests,
        walletClient,
        {
          skipFeeUSDLimit: true,
          conversion: {
            currencyManager: undefined,
            currency,
          }
        }
      );

      onStatusChange?.("Waiting for batch payment confirmation...");
      const receipt = await batchTx.wait(2);

      onStatusChange?.("Batch payment completed!");
      return {
        transactionHash: receipt.transactionHash,
        requests: enrichedRequests,
        receipt
      };
    }

  } catch (error) {
    onStatusChange?.("Error in batch payment");
    console.error("Batch payment error:", error);
    throw error;
  }
}
