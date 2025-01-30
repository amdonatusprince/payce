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
            { payerAddress: address },
            { payeeAddress: address }
          ]
        })
        .toArray()
    ]);

    // Combine and format all transactions
    const allTransactions = [
      ...payments.map(tx => ({
        ...tx,
        type: 'payment',
        date: tx.createdAt,
        amount: tx.amount,
        currency: tx.currency?.value || tx.currency || 'USDC',
        status: 'completed',
        counterparty: tx.sender === address ? tx.recipient : tx.sender,
        isOutgoing: tx.sender === address
      })),
      ...invoices.map(invoice => ({
        ...invoice,
        type: 'invoice',
        date: invoice.createdAt,
        amount: invoice.expectedAmount,
        currency: invoice.currency?.value || 'USDC',
        status: invoice.status.toLowerCase(),
        counterparty: invoice.payerAddress === address 
          ? invoice.payeeAddress 
          : invoice.payerAddress,
        isOutgoing: invoice.payerAddress === address,
        dueDate: invoice.dueDate,
        reason: invoice.reason,
        businessName: invoice.contentData?.businessDetails?.name,
        clientName: invoice.contentData?.clientDetails?.name
      }))
    ]
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

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