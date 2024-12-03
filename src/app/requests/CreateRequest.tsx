import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { RequestNetwork, Types, Utils, } from "@requestnetwork/request-client.js";
import { parseUnits } from "viem";
import { CurrencyTypes } from "@requestnetwork/types";

export enum REQUEST_STATUS {
  AWAITING_INPUT = "awaiting input",
  SUBMITTING = "submitting",
  PERSISTING_TO_IPFS = "persisting to ipfs",
  PERSISTING_ON_CHAIN = "persisting on-chain",
  REQUEST_CONFIRMED = "request confirmed",
  ERROR_OCCURRED = "error occurred"
}

export interface CreateRequestParams {
  walletClient: any;
  payerAddress: string;
  expectedAmount: string;
  currency: {
    type: Types.RequestLogic.CURRENCY;
    value: string;
    network: CurrencyTypes.ChainName;
    decimals: number;
  };
  recipientAddress: string;
  reason?: string;
  dueDate?: string;
  contentData?: Record<string, any>;
  onStatusChange?: (status: REQUEST_STATUS) => void;
}

function calculateFeeAmount(amount: string, decimals: number): string {
  const baseAmount = parseFloat(amount);
  const feePercentage = 0.005; // 0.5%
  const maxFeeUSD = 5;
  
  // Calculate fee
  let fee = baseAmount * feePercentage;
  // This is a simplified example assuming 1:1 token:USD ratio
  
  if (fee > maxFeeUSD) {
    fee = maxFeeUSD;
  }
  // Convert to token units with proper decimals
  return parseUnits(fee.toFixed(decimals), decimals).toString();
}

export async function createRequest({
  walletClient,
  payerAddress,
  expectedAmount,
  currency,
  recipientAddress,
  reason,
  dueDate,
  contentData,
  onStatusChange
}: CreateRequestParams) {
  try {
    onStatusChange?.(REQUEST_STATUS.SUBMITTING);
    
    const signatureProvider = new Web3SignatureProvider(walletClient);
    const requestClient = new RequestNetwork({
      nodeConnectionConfig: { 
        baseURL: "https://sepolia.gateway.request.network/",
      },
      signatureProvider,
    });

    const requestCreateParameters: Types.ICreateRequestParameters = {
      requestInfo: {
        currency: {
          type: currency.type,
          value: currency.value,
          network: currency.network,
        },
        expectedAmount: parseUnits(
          expectedAmount,
          currency.decimals
        ).toString(),
        payee: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: recipientAddress,
        },
        timestamp: Utils.getCurrentTimestampInSecond(),
      },
      paymentNetwork: {
        id: Types.Extension.PAYMENT_NETWORK_ID.ETH_FEE_PROXY_CONTRACT,
        parameters: {
          paymentNetworkName: currency.network,
          paymentAddress: recipientAddress,
          feeAddress: '0x546A5cB5c0AdD53efbC60000644AA70204B20576',
          feeAmount: calculateFeeAmount(expectedAmount, currency.decimals),
        },
      },
      contentData: {
        reason: reason || "",
        dueDate: dueDate || "",
        builderId: "payce-finance",
        ...contentData,
      },
      signer: {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: await walletClient.getAddresses().then((addresses: string[]) => addresses[0]),
      },
    };

    // Add payer if specified
    if (payerAddress) {
      requestCreateParameters.requestInfo.payer = {
        type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: payerAddress,
      };
    }

    onStatusChange?.(REQUEST_STATUS.PERSISTING_TO_IPFS);
    const request = await requestClient.createRequest(requestCreateParameters);

    onStatusChange?.(REQUEST_STATUS.PERSISTING_ON_CHAIN);
    const confirmedRequestData = await request.waitForConfirmation();

    onStatusChange?.(REQUEST_STATUS.REQUEST_CONFIRMED);
    return {
        request,
        data: confirmedRequestData
      }

  } catch (error) {
    onStatusChange?.(REQUEST_STATUS.ERROR_OCCURRED);
    throw error;
  }
}