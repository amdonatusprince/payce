"use client";

import { PublicKey, SystemProgram } from '@solana/web3.js';
import { PAYMENT_PROXY_PROGRAM_ID } from '@/lib/constants';
import { Program, AnchorProvider, setProvider } from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
import {IDL} from '@/utils/payment_proxy';


interface InvoiceData {
  version: string;
  timestamp: number;
  network: string;
  invoice: {
    payer: string;
    payee: string;
    amount: string;
    currency: string;
    dueDate?: string;
    reason?: string;
  };
  metadata: {
    createdAt: string;
    builderId: string;
    createdBy: string;
    [key: string]: any;
  };
  contentData: {
    transactionType: 'invoice';
    clientDetails: {
      name: string;
      address: string;
    };
    paymentDetails: {
      reason?: string;
      dueDate?: string;
    };
  };
}

export const createInvoiceRequest = async (params: any) => {
  try {
    const invoiceData: InvoiceData = {
      version: '1.0',
      timestamp: Date.now(),
      network: params.currency.network,
      invoice: {
        payer: params.payerAddress,
        payee: params.payeeAddress,
        amount: params.expectedAmount,
        currency: params.currency.value,
        dueDate: params.dueDate,
        reason: params.reason,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        builderId: "payce-finance",
        createdBy: params.payeeAddress,
        ...params.contentData?.metadata,
      },
      contentData: {
        transactionType: 'invoice',
        clientDetails: {
          name: params.contentData.clientDetails.name,
          address: params.contentData.clientDetails.address,
        },
        paymentDetails: {
          reason: params.reason,
          dueDate: params.dueDate,
        }
      }
    };

    // Create a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `invoice-${params.payeeAddress.slice(0, 6)}-${timestamp}.json`;

    // Upload to IPFS via API route
    const formData = new FormData();
    formData.append(
      'file', 
      new Blob([JSON.stringify(invoiceData)], { type: 'application/json' }),
      fileName 
    );

    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload invoice data to IPFS');
    }

    const { cid, url } = await response.json();

    // Register the request on Solana
    const { connection } = params;
    const { walletProvider } = params;

    // Convert amount to USDC decimals (6)
    const amountUsdc = Math.floor(Number(params.expectedAmount) * 1_000_000);

    // Create the provider
    const provider = new AnchorProvider(
      connection,
      walletProvider,
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      }
    );
    setProvider(provider);

    // Initialize the program with the provider
    const program = new Program(IDL, PAYMENT_PROXY_PROGRAM_ID, provider);

    const [requestTracker] = PublicKey.findProgramAddressSync(
      [Buffer.from("request"), Buffer.from(cid.slice(0, 32), 'utf-8')],
      program.programId
    );

    try {
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      
      let tx = await program.methods
        .registerRequest(
          cid.slice(0, 32),
          new BN(amountUsdc),
          new PublicKey(params.payeeAddress)
        )
        .accounts({
          creator: walletProvider.publicKey,
          requestTracker,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Get the transaction signature from recent signatures
      const signatures = await connection.getSignaturesForAddress(requestTracker);
      const signature = signatures[0]?.signature || tx;

      // Return success response even if we get "already processed" error
      return {
        ipfsUrl: url,
        explorerUrl: params.currency.network.toLowerCase().includes('devnet') 
          ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
          : `https://explorer.solana.com/tx/${signature}`
      };
    } catch (error) {
      // If transaction was actually successful but threw "already processed"
      if (error instanceof Error && error.message.includes('already been processed')) {
        const signatures = await connection.getSignaturesForAddress(requestTracker);
        const signature = signatures[0]?.signature;
        
        if (signature) {
          return {
            ipfsUrl: url,
            explorerUrl: params.currency.network.toLowerCase().includes('devnet') 
              ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
              : `https://explorer.solana.com/tx/${signature}`
          };
        }
      }
      
      throw error;
    }  
  } catch (error) {
      throw error;
    }
  };