"use client";

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

    // Create invoice using our new backend API
    const response = await fetch('/api/invoices/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }

    const { transactionId } = await response.json();

    if (!transactionId) {
      throw new Error('No transaction ID returned from server');
    }

    // Return success response with transaction ID
    return {
      transactionId,
      explorerUrl: params.currency.network.toLowerCase().includes('devnet') 
        ? `https://explorer.solana.com/tx/${transactionId}?cluster=devnet`
        : `https://explorer.solana.com/tx/${transactionId}`
    };

  } catch (error) {
    console.error('Create invoice error:', error);
    throw error;
  }
};