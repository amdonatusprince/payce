import { RequestNetwork } from "@requestnetwork/request-client.js";

export const createRequestClient = () => new RequestNetwork({
  nodeConnectionConfig: {
    baseURL: "https://sepolia.gateway.request.network/",
  }
});
