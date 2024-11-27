import { providers } from "ethers";
import { type HttpTransport, type PublicClient } from "viem";


export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;
  
  if (!chain) throw new Error("Chain is required");
  
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback")
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    );

  return new providers.JsonRpcProvider(transport.url as string, network);
}
