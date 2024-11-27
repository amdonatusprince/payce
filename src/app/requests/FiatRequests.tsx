// import { RequestNetwork, Types, Utils } from "@requestnetwork/request-client.js";
// import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
// import { parseUnits } from "viem";
// import { waitForConfirmation } from './utils/requestConfirmation';

// interface CreateFiatRequestParams {
//   walletClient: any;
//   payerAddress: string;
//   expectedAmount: string;
//   currency: string;  // e.g., 'USD', 'EUR'
//   recipientAddress: string;
//   reason?: string;
//   dueDate?: string;
// }

// export async function createFiatRequest(params: CreateFiatRequestParams) {
//   const signatureProvider = new Web3SignatureProvider(params.walletClient);
//   const requestClient = new RequestNetwork({
//     nodeConnectionConfig: { 
//       baseURL: "https://sepolia.gateway.request.network/",
//     },
//     signatureProvider,
//   });

//   const requestCreateParameters = {
//     requestInfo: {
//       currency: {
//         type: Types.RequestLogic.CURRENCY.ISO4217,
//         value: params.currency,  // e.g., 'USD'
//       },
//       expectedAmount: parseUnits(params.expectedAmount, 2).toString(), // Most fiat has 2 decimals
//       payee: {
//         type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
//         value: params.recipientAddress,
//       },
//       payer: {
//         type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
//         value: params.payerAddress,
//       },
//       timestamp: Utils.getCurrentTimestampInSecond(),
//     },
//     paymentNetwork: {
//       id: Types.Extension.PAYMENT_NETWORK_ID.ANY_DECLARATIVE,
//       parameters: {
//         paymentInfo: {
//           bankDetails: "Your bank details",
//           swiftCode: "SWIFT code if needed"
//         }
//       }
//     },
//     contentData: {
//       reason: params.reason || "",
//       dueDate: params.dueDate || "",
//       builderId: "your-app-name",
//     },
//     signer: {
//       type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
//       value: params.recipientAddress,
//     },
//   };

//   const request = await requestClient.createRequest(requestCreateParameters);
//   const confirmedRequest = await waitForConfirmation(request);
//   return confirmedRequest;
// }

// // Function to declare payment sent (for payer)
// export async function declareFiatPaymentSent(requestId: string, amount: string, walletClient: any) {
//   const signatureProvider = new Web3SignatureProvider(walletClient);
//   const requestClient = new RequestNetwork({
//     nodeConnectionConfig: { 
//       baseURL: "https://sepolia.gateway.request.network/",
//     },
//     signatureProvider,
//   });

//   const request = await requestClient.fromRequestId(requestId);
//   return await request.declareSentPayment(
//     amount,
//     "Payment sent via bank transfer",
//     {
//       type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
//       value: walletClient.account.address,
//     }
//   );
// }

// // Function to declare payment received (for payee)
// export async function declareFiatPaymentReceived(requestId: string, amount: string, walletClient: any) {
//   const signatureProvider = new Web3SignatureProvider(walletClient);
//   const requestClient = new RequestNetwork({
//     nodeConnectionConfig: { 
//       baseURL: "https://sepolia.gateway.request.network/",
//     },
//     signatureProvider,
//   });

//   const request = await requestClient.fromRequestId(requestId);
//   return await request.declareReceivedPayment(
//     amount,
//     "Payment received via bank transfer",
//     {
//       type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
//       value: walletClient.account.address,
//     }
//   );
// }
