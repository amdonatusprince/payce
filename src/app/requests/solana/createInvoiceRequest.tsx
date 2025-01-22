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

    return {
      requestId: cid,
      currency: params.currency.value,
      expectedAmount: params.expectedAmount,
      payee: {
        type: 'solana',
        value: params.payeeAddress
      },
      payer: {
        type: 'solana',
        value: params.payerAddress
      },
      timestamp: Date.now(),
      ipfsUrl: url,
      network: params.currency.network,
      contentData: params.contentData
    };
  } catch (error) {
    console.error('Error creating Solana invoice request:', error);
    throw error;
  }
};
