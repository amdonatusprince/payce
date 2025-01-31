import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');
    const limit = Number(searchParams.get('limit')) || 5;

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("payce");
    const transactionsCollection = db.collection("transactions");
    const invoicesCollection = db.collection("invoices");

    // Get all inflow transactions in parallel
    const [transactions, paidInvoices] = await Promise.all([
      // Regular transactions where user is recipient
      transactionsCollection
        .find({ 
          recipient: address,
          transactionType: 'normal'
        })
        .sort({ createdAt: -1 })
        .toArray(),

      // Paid invoices where user is payee
      invoicesCollection
        .find({ 
          status: "paid",
          payeeAddress: address,
          'contentData.transactionType': 'invoice'
        })
        .sort({ createdAt: -1 })
        .toArray()
    ]);

    // Format the transactions to match the expected structure
    const formattedInflows = [
      ...transactions.map(tx => ({
        _id: tx._id,
        transactionId: tx.transactionId,
        timestamp: new Date(tx.createdAt).getTime(),
        sender: tx.sender,
        recipient: tx.recipient,
        amount: tx.amount,
        currency: tx.currency,
        network: tx.network,
        reason: tx.reason,
        recipientName: tx.recipientName,
        recipientEmail: tx.recipientEmail,
        explorerUrl: tx.explorerUrl,
        transactionType: 'normal',
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt
      })),
      ...paidInvoices.map(invoice => ({
        _id: invoice._id,
        transactionId: invoice.transactionId,
        timestamp: new Date(invoice.createdAt).getTime(),
        invoice: {
          payer: invoice.payerAddress,
          payee: invoice.payeeAddress,
          amount: invoice.expectedAmount,
          currency: invoice.currency.value,
          dueDate: invoice.dueDate,
          reason: invoice.reason
        },
        contentData: {
          transactionType: 'invoice',
          businessDetails: invoice.contentData.businessDetails,
          clientDetails: invoice.contentData.clientDetails,
          paymentDetails: {
            reason: invoice.reason,
            dueDate: invoice.dueDate
          }
        },
        status: invoice.status,
        network: invoice.currency.network,
        explorerUrl: invoice.explorerUrl,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt
      }))
    ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: formattedInflows,
      metadata: {
        payments: transactions.length,
        invoices: paidInvoices.length,
        total: formattedInflows.length
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching inflow transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 