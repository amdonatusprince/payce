import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

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

    // Get all transactions where user is sender or recipient
    const [payments, invoices] = await Promise.all([
      transactionsCollection
        .find({
          $or: [
            { sender: address },
            { recipient: address }
          ]
        })
        .toArray(),
      invoicesCollection
        .find({
          $or: [
            { "invoice.payer": address },
            { "invoice.payee": address }
          ]
        })
        .toArray()
    ]);

    // Combine and format all transactions
    const allTransactions = [
      ...payments.map(tx => ({
        ...tx,
        type: 'payment',
        date: tx.timestamp,
        amount: tx.amount,
        currency: tx.currency,
        status: 'completed',
        counterparty: tx.sender === address ? tx.recipient : tx.sender,
        isOutgoing: tx.sender === address
      })),
      ...invoices.map(invoice => ({
        ...invoice,
        type: 'invoice',
        date: invoice.timestamp,
        amount: invoice.invoice.amount,
        currency: invoice.invoice.currency,
        status: invoice.status.toLowerCase(),
        counterparty: invoice.invoice.payer === address 
          ? invoice.invoice.payee 
          : invoice.invoice.payer,
        isOutgoing: invoice.invoice.payer === address,
        dueDate: invoice.invoice.dueDate
      }))
    ]
    .sort((a, b) => b.date - a.date);

    // Calculate total pages
    const totalTransactions = allTransactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);

    // Paginate results
    const paginatedTransactions = allTransactions.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 