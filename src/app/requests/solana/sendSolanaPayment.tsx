import { 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  createTransferInstruction,
  getAccount,
  getMint
} from '@solana/spl-token';

interface SendPaymentParams {
  connection: any;
  walletProvider: any;
  recipientAddress: string;
  amount: string;
  recipientName: string;
  reason: string;
  network: string;
}


export const sendSolanaPayment = async (params: SendPaymentParams) => {
  const { connection, walletProvider, recipientAddress, amount, recipientName, reason, network } = params;
  
  try {
    console.log("Initiating payment:", {
      recipient: recipientAddress,
      amount: amount,
      recipientName: recipientName,
      reason: reason
    });

    // USDC mint on mainnet/devnet
    const usdcMint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
    
    // Get mint decimals
    const mintInfo = await getMint(connection, usdcMint);
    const decimals = mintInfo.decimals;
    console.log("USDC decimals:", decimals);

    // Calculate amount with decimals
    const transferAmount = Math.floor(Number(amount) * Math.pow(10, decimals));
    
    console.log("Getting source (payer) token account...");
    const sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      walletProvider,
      usdcMint,
      walletProvider.publicKey
    );
    console.log("Source Account:", sourceAccount.address.toString());

    // Check balance
    const balance = await getAccount(connection, sourceAccount.address);
    if (Number(balance.amount) < transferAmount) {
      throw new Error(`Insufficient USDC balance. Required: ${amount} USDC`);
    }

    console.log("Getting destination (recipient) token account...");
    const destinationAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      walletProvider,
      usdcMint,
      new PublicKey(recipientAddress)
    );
    console.log("Destination Account:", destinationAccount.address.toString());

    console.log("Creating transfer transaction...");
    const transaction = new Transaction();
    
    // Set fee payer before adding instructions
    transaction.feePayer = walletProvider.publicKey;
    
    transaction.add(createTransferInstruction(
      sourceAccount.address,
      destinationAccount.address,
      walletProvider.publicKey,
      transferAmount
    ));

    // Get latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = latestBlockhash.blockhash;

    // Sign and send transaction with better error handling
    try {
    
    const tx = await walletProvider.signAndSendTransaction(transaction);
      console.log("Transaction successful! 🎉");
      
      // Create initial payment details without status
      const paymentDetails = {
        recipient: recipientAddress,
        amount: amount,
        recipientName: recipientName,
        reason: reason,
        timestamp: Date.now(),
        explorerUrl: network.toLowerCase().includes('devnet') 
        ? `https://explorer.solana.com/tx/${tx}?cluster=devnet`
        : `https://explorer.solana.com/tx/${tx}`,
      };

      console.log("Payment completed:", paymentDetails);

      return {
        explorerUrl: network.toLowerCase().includes('devnet') 
          ? `https://explorer.solana.com/tx/${tx}?cluster=devnet`
          : `https://explorer.solana.com/tx/${tx}`,
        paymentDetails: {
          ...paymentDetails,
          status: 'paid' as const
        }
      };
    } catch (sendError: any) {
      if (sendError.logs) {
        console.error("Transaction logs:", sendError.logs);
      }
      throw new Error(`Transaction failed: ${sendError.message}`);
    }

  } catch (error: any) {
    console.error("Payment error:", error);
    throw error;
  }
};