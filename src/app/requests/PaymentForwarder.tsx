import { Types } from "@requestnetwork/request-client.js";
import { useWalletClient } from "wagmi";
import { 
    deploySingleRequestForwarder,
    payRequestWithSingleRequestForwarder
 } from "@requestnetwork/payment-processor";
import { createRequest } from "./CreateRequest";
import { providers } from 'ethers';
import { CurrencyTypes } from "@requestnetwork/types";
import { parseUnits } from "viem";

interface PaymentParams {
  payerAddress: string;
  expectedAmount: string;
  currency: {
    type: Types.RequestLogic.CURRENCY;
    value: string;
    network: CurrencyTypes.ChainName;
    decimals: number;
  };
  recipientAddress: string;
  reason: string;
  dueDate: string;
}

interface PayWithForwarderParams {
    forwarderAddress: string;
    amount: string;
    decimals: number;
  }

export const PaymentForwarder = async ({ params }: { params: PaymentParams }) => {
  const { data: walletClient } = useWalletClient();

  if (!walletClient) {
    throw new Error("Wallet client not connected");
  }

  try {
    const { request } = await createRequest({ ...params, walletClient });
    const requestData = request.getData();
    const forwarderAddress = await deploySingleRequestForwarder(
      requestData,
      new providers.Web3Provider(walletClient.transport).getSigner()
    );

    return forwarderAddress;
  } catch (error) {
    console.error("Error deploying forwarder:", error);
    throw error;
  }
}

export const PayWithRequestForwarder = async ({ params }: { params: PayWithForwarderParams }) => {
    const { data: walletClient } = useWalletClient();
  
    if (!walletClient) {
      throw new Error("Wallet client not connected");
    }
  
    try {
      const signer = new providers.Web3Provider(walletClient.transport).getSigner();
      const paymentAmount = parseUnits(params.amount, params.decimals).toString();
      
      const result = await payRequestWithSingleRequestForwarder(
        params.forwarderAddress,
        signer,
        paymentAmount
      );
  
      return result;
    } catch (error) {
      console.error("Error paying with forwarder:", error);
      throw error;
    }
  }