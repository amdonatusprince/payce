import { ObjectId } from 'mongodb';

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface InvoiceData {
  payerAddress: string;
  expectedAmount: string;
  currency: {
    type: string;
    value: string;
    network: string;
    decimals: number;
  };
  payeeAddress: string;
  reason?: string;
  dueDate?: string;
  contentData: {
    transactionType: 'invoice';
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
      items: InvoiceItem[];
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

export interface InvoiceDocument extends InvoiceData {
  _id: ObjectId;
  transactionId: string;
  status: 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
  explorerUrl?: string;
} 