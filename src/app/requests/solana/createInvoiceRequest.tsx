"use client";

import { InvoiceData } from '@/models/invoice';

interface CreateInvoiceParams {
  connection: any;
  walletProvider: any;
  payerAddress: string;
  payeeAddress: string;
  expectedAmount: string;
  currency: {
    type: string;
    value: string;
    network: string;
    decimals: number;
  };
  dueDate?: string;
  reason?: string;
  contentData: {
    businessDetails: {
      name: string;
      email: string;
      address: string;
    };
    clientDetails: {
      name: string;
      email: string;
      address: string;
      walletAddress: string;
    };
    invoiceDetails: {
      items: Array<{
        description: string;
        amount: number;
      }>;
      totalAmount: string;
      currency: string;
      dueDate: string;
      notes?: string;
    };
    metadata: {
      createdAt: string;
      builderId: string;
      version: string;
      createdBy: string;
    };
  };
}

export const createInvoiceRequest = async (params: CreateInvoiceParams) => {
  try {
    const invoiceData: InvoiceData = {
      payerAddress: params.payerAddress,
      payeeAddress: params.payeeAddress,
      expectedAmount: params.expectedAmount,
      currency: params.currency,
      dueDate: params.dueDate,
      reason: params.reason,
      contentData: {
        transactionType: 'invoice',
        businessDetails: params.contentData.businessDetails,
        clientDetails: params.contentData.clientDetails,
        invoiceDetails: params.contentData.invoiceDetails,
        metadata: params.contentData.metadata
      }
    };

    // Create invoice using our backend API
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

    // Send notifications for invoice creation
    const businessEmail = params.contentData.businessDetails.email;
    const clientEmail = params.contentData.clientDetails.email;

    if (businessEmail || clientEmail) {
      const notificationData = {
        amount: params.expectedAmount,
        currency: params.contentData.invoiceDetails.currency,
        dueDate: params.dueDate || '',
        network: params.currency.network,
        transactionId,
        businessName: params.contentData.businessDetails.name,
        clientName: params.contentData.clientDetails.name,
        items: params.contentData.invoiceDetails.items
      };

      // Send notifications through API
      if (businessEmail) {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: businessEmail,
            type: 'business',
            ...notificationData
          })
        });
      }

      if (clientEmail) {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientEmail,
            type: 'client',
            ...notificationData
          })
        });
      }
    }

    // Return success response with transaction ID and explorer URL
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