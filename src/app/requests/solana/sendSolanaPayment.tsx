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

    // USDC mint on mainnet/devnet
    const usdcMint = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
    
    // Get mint decimals
    const mintInfo = await getMint(connection, usdcMint);
    const decimals = mintInfo.decimals;

    // Calculate amount with decimals
    const transferAmount = Math.floor(Number(amount) * Math.pow(10, decimals));
    const sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      walletProvider,
      usdcMint,
      walletProvider.publicKey
    );

    // Check balance
    const balance = await getAccount(connection, sourceAccount.address);
    if (Number(balance.amount) < transferAmount) {
      throw new Error(`Insufficient USDC balance. Required: ${amount} USDC`);
    }

    const destinationAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      walletProvider,
      usdcMint,
      new PublicKey(recipientAddress)
    );
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
        sender: walletProvider.publicKey.toString(),
        recipientName: recipientName,
        currency: 'USDC',
        network: network,
        transactionType: 'normal',
        reason: reason,
        timestamp: Date.now(),
        explorerUrl: network.toLowerCase().includes('devnet') 
          ? `https://explorer.solana.com/tx/${tx}?cluster=devnet`
          : `https://explorer.solana.com/tx/${tx}`,
      };

      // Store transaction in database
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentDetails)
      });

      if (!response.ok) {
        throw new Error('Failed to store transaction');
      }

      const { transactionId } = await response.json();

      return {
        paymentDetails: {
          ...paymentDetails,
          transactionId,
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