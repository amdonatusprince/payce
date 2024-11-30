import { Types } from "@requestnetwork/request-client.js";
import { createRequestClient } from "./utils/requestUtil";


export const retrieveRequest = async (
  identityAddress: string
) => {
  const requestClient = createRequestClient();
  const requests = await requestClient.fromIdentity({
    type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
    value: identityAddress,
  });
  const requestDatas = requests.map((request) => request.getData());
  return requestDatas;
};

export const retrieveSingleRequest = async (requestId: string) => {
  const requestClient = createRequestClient();
  const request = await requestClient.fromRequestId(requestId);
  const requestData = request.getData();
  return requestData;
};
