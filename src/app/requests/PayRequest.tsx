import { publicClientToProvider } from "./view/RequestProvider";
import { walletClientToSigner } from "./view/RequestSigner";
import { usePublicClient, useWalletClient } from 'wagmi'
import { hasSufficientFunds } from "@requestnetwork/payment-processor";
import { approveErc20, hasErc20Approval } from "@requestnetwork/payment-processor"
import { payRequest as processPayRequest } from "@requestnetwork/payment-processor";
import { createRequestClient } from "./utils/requestUtil";

export type RequestStatus = 'checking' | 'insufficient-funds' | 'needs-approval' | 'approving' | 'approved' | 'paying' | 'confirming' | 'completed' | 'error';

export interface PaymentResult {
  status: RequestStatus;
  data?: any;
  error?: string;
}

export async function handlePayRequest(
  requestId: string,
  payerAddress: string,
  onStatusChange?: (status: RequestStatus) => void
): Promise<PaymentResult> {
  const updateStatus = (status: RequestStatus) => {
    if (onStatusChange) onStatusChange(status);
  };

  try {
    updateStatus('checking');
    const publicClient = usePublicClient()
    const { data: walletClient } = useWalletClient()

    const requestClient = createRequestClient()
    const request = await requestClient.fromRequestId(requestId);
    const provider = publicClient ? publicClientToProvider(publicClient) : undefined;
    const signer = walletClient ? walletClientToSigner(walletClient) : undefined;

    // Check for sufficient funds
    const _hasSufficientFunds = await hasSufficientFunds({
      request: request.getData(),
      address: payerAddress,
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
        request.getData(),
        payerAddress,
        provider
    );

    if (!_hasErc20Approval) {
      try {
        updateStatus('approving');
        const approvalTx = await approveErc20(request.getData(), signer);
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
    const paymentTx = await processPayRequest(request.getData(), signer);
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
    return {
      status: 'error',
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
} 