export type TransactionType = 'incoming' | 'outgoing';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type Currency = 'USDC' | 'ETH' | 'USDT';

export interface Transaction {
  id: number | string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  description: string;
  date: Date;
  status: TransactionStatus;
  from: string;
  to?: string;
}

export interface UserBalance {
  total: number;
  currency: Currency;
  change: number;
}

export interface SpendingLimit {
  daily: number;
  used: number;
  currency: Currency;
}

export interface CreditScore {
  score: number;
  maxScore: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
} 

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  image: string;
  rating: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
}