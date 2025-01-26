import { ObjectId } from 'mongodb';

export type InvoiceStatus = 'pending' | 'paid';

export interface InvoiceData {
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

export interface InvoiceDocument extends InvoiceData {
  _id: ObjectId;
  transactionId: string;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
} 