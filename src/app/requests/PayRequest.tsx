import { publicClientToProvider } from "./view/RequestProvider";
import { walletClientToSigner } from "./view/RequestSigner";
import { createRequestClient } from "./utils/requestUtil";
import { hasSufficientFunds } from "@requestnetwork/payment-processor";
import { approveErc20, hasErc20Approval } from "@requestnetwork/payment-processor"
import { payRequest as processPayRequest } from "@requestnetwork/payment-processor";
import { 
  payEthFeeProxyRequest, 
  prepareEthFeeProxyPaymentTransaction,
  validateEthFeeProxyRequest 
} from "@requestnetwork/payment-processor";

export type RequestStatus = 'checking' | 'insufficient-funds' | 'needs-approval' | 'approving' | 'approved' | 'paying' | 'confirming' | 'completed' | 'error';

export interface PaymentResult {
  status: RequestStatus;
  data?: any;
  error?: string;
}

export async function handleERC20PayRequest(
  requestId: string,
  payerAddress: string,
  publicClient: any,
  walletClient: any,
  onStatusChange?: (status: RequestStatus) => void
): Promise<PaymentResult> {
  const updateStatus = (status: RequestStatus) => {
    if (onStatusChange) onStatusChange(status);
  };

  try {
    updateStatus('checking');
    
    const requestClient = createRequestClient()
    const request = await requestClient.fromRequestId(requestId);
    const requestData = request.getData();
    const provider = publicClient ? publicClientToProvider(publicClient) : undefined;
    const signer = walletClient ? walletClientToSigner(walletClient) : undefined;
    
    // Check for sufficient funds
    const _hasSufficientFunds = await hasSufficientFunds({
      request: requestData,
      address: payerAddress as string,
      providerOptions: {
        provider: provider,
      }
    });

    if (!_hasSufficientFunds) {
      updateStatus('insufficient-funds');
      return {
        status: 'insufficient-funds',
        error: "Insufficient funds to complete this payment"
      };
    }

    // Check ERC20 approval
    updateStatus('needs-approval');
    const _hasErc20Approval = await hasErc20Approval(
        requestData,
        payerAddress,
        provider
    );


    if (!_hasErc20Approval) {
      try {
        updateStatus('approving');
        const approvalTx = await approveErc20(requestData, signer);
        await approvalTx.wait(2);
        updateStatus('approved');
      } catch (error) {
        updateStatus('error');
        return {
          status: 'error',
          error: "Failed to approve ERC20 token transfer"
        };
      }
    }

    // Process payment
    updateStatus('paying');
    const paymentTx = await processPayRequest(requestData, signer);
    await paymentTx.wait(2);

    // Wait for confirmation
    updateStatus('confirming');
    const confirmedRequestData = await request.waitForConfirmation();

    // Verify the payment was successful
    let updatedRequestData = confirmedRequestData;
    while (updatedRequestData.balance?.balance != null && 
           updatedRequestData.balance.balance < updatedRequestData.expectedAmount) {
      updatedRequestData = await request.refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    updateStatus('completed');
    return {
      status: 'completed',
      data: updatedRequestData
    };

  } catch (error) {
    updateStatus('error');
    console.log(error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

export async function handlePayRequest(
  requestId: string,
  payerAddress: string,
  publicClient: any,
  walletClient: any,
  onStatusChange?: (status: RequestStatus) => void
): Promise<PaymentResult> {
  const updateStatus = (status: RequestStatus) => {
    if (onStatusChange) onStatusChange(status);
  };

  try {
    updateStatus('checking');
    
    const requestClient = createRequestClient();
    const request = await requestClient.fromRequestId(requestId);
    const requestData = request.getData();
    const provider = publicClient ? publicClientToProvider(publicClient) : undefined;
    const signer = walletClient ? walletClientToSigner(walletClient) : undefined;

    // Validate the request and check for sufficient funds
    validateEthFeeProxyRequest(requestData);
    const _hasSufficientFunds = await hasSufficientFunds({
      request: requestData,
      address: payerAddress as string,
      providerOptions: { provider }
    });

    if (!_hasSufficientFunds) {
      updateStatus('insufficient-funds');
      return {
        status: 'insufficient-funds',
        error: "Insufficient funds to complete this payment"
      };
    }

    // Prepare the transaction
    updateStatus('paying');
    const tx = await payEthFeeProxyRequest(
      requestData,
      signer,
      // undefined, // amount (undefined = pay full amount)
      // undefined, // feeAmount (undefined = use default fee)
      // { 
      //   gasLimit: 500000 // Optional: Adjust gas limit if needed
      // }
    );

    // Wait for confirmation
    updateStatus('confirming');
    await tx.wait(2);

    // Verify the payment was successful
    let updatedRequestData = await request.refresh();
    while (updatedRequestData.balance?.balance != null && 
           updatedRequestData.balance.balance < updatedRequestData.expectedAmount) {
      updatedRequestData = await request.refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    updateStatus('completed');
    return {
      status: 'completed',
      data: updatedRequestData
    };

  } catch (error) {
    updateStatus('error');
    console.error(error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
} 