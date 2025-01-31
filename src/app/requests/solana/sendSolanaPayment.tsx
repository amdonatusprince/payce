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
import { USDC_MINT } from '@/lib/constants';

interface SendPaymentParams {
  connection: any;
  walletProvider: any;
  recipientAddress: string;
  amount: string;
  recipientName: string;
  recipientEmail?: string;
  reason: string;
  network: string;
}


export const sendSolanaPayment = async (params: SendPaymentParams) => {
  const { connection, walletProvider, recipientAddress, amount, recipientName, recipientEmail, reason, network } = params;
  
  try {

    // USDC mint on mainnet/devnet
    const usdcMint = USDC_MINT;
    
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
      
      const explorerUrl = network.toLowerCase().includes('devnet') 
        ? `https://explorer.solana.com/tx/${tx}?cluster=devnet`
        : `https://explorer.solana.com/tx/${tx}`;

      // Create payment details
      const paymentDetails = {
        recipient: recipientAddress,
        amount: amount,
        sender: walletProvider.publicKey.toString(),
        recipientName: recipientName,
        recipientEmail: recipientEmail,
        currency: 'USDC',
        network: network,
        transactionType: 'normal',
        reason: reason,
        timestamp: Date.now(),
        explorerUrl
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

      // Send email notification if recipient email is provided
      if (recipientEmail) {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientEmail,
            type: 'received',
            amount: amount,
            currency: 'USDC',
            senderAddress: walletProvider.publicKey.toString(),
            recipientAddress: recipientAddress,
            explorerUrl,
            network,
            transactionId,
            reason
          })
        });
      }

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