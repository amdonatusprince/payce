export interface Transaction {
  id: string;
  date: Date;
  description: string;
  type: 'inflow' | 'outflow';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface StatementSummary {
  totalInflow: number;
  totalOutflow: number;
  netChange: number;
  pendingInflow: number;
  pendingOutflow: number;
}

export interface DateRange {
  from: Date;
  to: Date;
} 