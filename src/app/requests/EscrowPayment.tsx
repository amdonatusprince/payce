import { Escrow } from '@requestnetwork/payment-processor';
import { providers } from 'ethers';
import { createRequest, CreateRequestParams } from './CreateRequest';

interface EscrowParams extends CreateRequestParams {
  onEscrowStatus?: (status: string) => void;
}

export const EscrowOperations = {
  /**
   * Creates request and pays into escrow
   */
  async createAndPayEscrow(params: EscrowParams) {
    try {
      params.onEscrowStatus?.('Creating request...');
      
      // 1. Create the request
      const { request, data: requestData } = await createRequest(params);

      params.onEscrowStatus?.('Approving tokens...');
      const signer = new providers.Web3Provider(params.walletClient.transport).getSigner();
      
      // 2. Approve ERC20 tokens for escrow
      const approveTx = await Escrow.approveErc20ForEscrow(
        requestData,
        requestData.currencyInfo.value,
        signer
      );
      await approveTx.wait(1);

      params.onEscrowStatus?.('Paying to escrow...');
      
      // 3. Pay into escrow
      const paymentTx = await Escrow.payEscrow(requestData, signer);
      await paymentTx.wait(1);
      params.onEscrowStatus?.('Escrow payment complete');

      return {
        request,
        requestData,
        approveTx,
        paymentTx
      };
    } catch (error) {
      params.onEscrowStatus?.('Error in escrow process');
      console.error('Error in createAndPayEscrow:', error);
      throw error;
    }
  },

  /**
   * Releases payment from escrow to payee
   */
  async releasePayment(request: any, walletClient: any) {
    try {
      const signer = new providers.Web3Provider(walletClient.transport).getSigner();
      const requestData = request.getData();

      const releaseTx = await Escrow.payRequestFromEscrow(requestData, signer);
      return await releaseTx.wait(1);
    } catch (error) {
      console.error('Error in releasePayment:', error);
      throw error;
    }
  },

  /**
   * Emergency functions
   */
  async initiateEmergencyClaim(request: any, walletClient: any) {
    try {
      const signer = new providers.Web3Provider(walletClient.transport).getSigner();
      const requestData = request.getData();

      const emergencyTx = await Escrow.initiateEmergencyClaim(requestData, signer);
      return await emergencyTx.wait(1);
    } catch (error) {
      console.error('Error in initiateEmergencyClaim:', error);
      throw error;
    }
  },

  async freezeRequest(request: any, walletClient: any) {
    try {
      const signer = new providers.Web3Provider(walletClient.transport).getSigner();
      const requestData = request.getData();

      const freezeTx = await Escrow.freezeRequest(requestData, signer);
      return await freezeTx.wait(1);
    } catch (error) {
      console.error('Error in freezeRequest:', error);
      throw error;
    }
  }
};
