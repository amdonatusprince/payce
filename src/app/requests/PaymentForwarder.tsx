import { Types } from "@requestnetwork/request-client.js";
import { type WalletClient } from 'viem';
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
    type: Types.RequestLogic.CURRENCY.ETH;
    value: string;
    network: CurrencyTypes.ChainName;
    decimals: number;
  };
  recipientAddress: string;
  reason: string;
  dueDate: string;
  walletClient: WalletClient;
  contentData?: {
    transactionType: 'single_forwarder' | 'batch_forwarder';
    paymentDetails: {
      reason?: string;
      dueDate?: string;
    };
    metadata: {
      createdAt: string;
      builderId: string;
      createdBy: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

interface PayWithForwarderParams {
    forwarderAddress: string;
    amount: string;
    decimals: number;
    walletClient: WalletClient;
}

export const createPaymentRequest = async ({ params }: { params: PaymentParams }) => {
  if (!params.walletClient) {
    throw new Error("Wallet client not connected");
  }

  try {
    const { request } = await createRequest({ ...params });
    const requestData = request.getData();
    const forwarderAddress = await deploySingleRequestForwarder(
      requestData,
      new providers.Web3Provider(params.walletClient.transport).getSigner()
    );

    return forwarderAddress;
  } catch (error) {
    console.error("Error deploying forwarder:", error);
    throw error;
  }
}

export const payWithRequestForwarder = async ({ params }: { params: PayWithForwarderParams }) => {
    if (!params.walletClient) {
      throw new Error("Wallet client not connected");
    }

    try {
      const signer = new providers.Web3Provider(params.walletClient.transport).getSigner();
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