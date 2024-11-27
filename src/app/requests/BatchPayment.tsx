import { Types } from "@requestnetwork/request-client.js";
import { createRequest, CreateRequestParams } from "./CreateRequest";
import { CurrencyTypes } from "@requestnetwork/types";
import { 
  approveErc20BatchConversionIfNeeded,
  payBatchConversionProxyRequest,
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
    let completedRequests = 0;

    for (const recipient of recipients) {
      const requestParams: CreateRequestParams = {
        walletClient,
        payerAddress,
        expectedAmount: recipient.amount,
        currency,
        recipientAddress: recipient.address,
        reason: recipient.reason || "Payroll Payment",
        dueDate,
        onStatusChange: (status) => {
          onStatusChange?.(`Employee ${completedRequests + 1}/${recipients.length}: ${status}`);
        }
      };

      const { request } = await createRequest(requestParams);
      
      enrichedRequests.push({
        paymentNetworkId: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
        request: request.getData(),
        paymentSettings: { maxToSpend: '0' }
      });

      completedRequests++;
      onEmployeeProgress?.(completedRequests, recipients.length);
    }

    // 2. Approve tokens for batch payment if needed
    onStatusChange?.("Approving tokens for batch payment...");
    await approveErc20BatchConversionIfNeeded(
      enrichedRequests[0].request,
      payerAddress,
      walletClient,
      undefined, // Use default max allowance
      {
        currency,
        maxToSpend: '0',
      }
    );

    // 3. Execute batch payment
    onStatusChange?.("Executing batch payment...");
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
    const receipt = await batchTx.wait();

    onStatusChange?.("Batch payment completed!");
    return {
      transactionHash: receipt.transactionHash,
      requests: enrichedRequests,
      receipt
    };

  } catch (error) {
    onStatusChange?.("Error in batch payment");
    console.error("Batch payment error:", error);
    throw error;
  }
}
