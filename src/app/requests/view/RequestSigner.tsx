import { providers } from "ethers";
import { type WalletClient } from "viem";

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  
  if (!chain) throw new Error("Chain is required");
  if (!account) throw new Error("Account is required");
  
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  // Create provider with the current chain's network
  const provider = new providers.Web3Provider(transport, network);
  
  // Get signer for the current account
  const signer = provider.getSigner(account.address);
  
  // Verify the signer is connected to the correct chain
  signer.provider.getNetwork().then(signerNetwork => {
    if (signerNetwork.chainId !== chain.id) {
      throw new Error(`Signer chain (${signerNetwork.chainId}) doesn't match current chain (${chain.id})`);
    }
  });

  return signer;
}

