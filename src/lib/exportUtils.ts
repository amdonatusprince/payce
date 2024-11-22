import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Transaction } from '@/types';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportTransactions = (
  transactions: Transaction[],
  exportFormat: 'csv' | 'pdf'
) => {
  if (exportFormat === 'csv') {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Currency', 'Description', 'Status'],
      ...transactions.map(tx => [
        format(tx.date, 'yyyy-MM-dd'),
        tx.type,
        tx.amount,
        tx.currency,
        tx.description,
        tx.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payce-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  } else {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Transaction Statement', 14, 22);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Generated on ${format(new Date(), 'MMMM d, yyyy')}`,
      14,
      32
    );

    // Add table
    doc.autoTable({
      head: [['Date', 'Type', 'Amount', 'Currency', 'Description', 'Status']],
      body: transactions.map(tx => [
        format(tx.date, 'yyyy-MM-dd'),
        tx.type,
        tx.amount,
        tx.currency,
        tx.description,
        tx.status
      ]),
      startY: 40,
    });

    doc.save(`payce-transactions-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  }
}; 