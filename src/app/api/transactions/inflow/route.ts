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
          recipient: address 
        })
        .sort({ timestamp: -1 })
        .toArray(),

      // Paid invoices where user is payee
      invoicesCollection
        .find({ 
          status: "paid",
          "invoice.payee": address 
        })
        .sort({ timestamp: -1 })
        .toArray()
    ]);

    // Combine and format all inflow transactions
    const allInflows = [
      ...transactions.map(tx => ({
        ...tx,
        type: 'payment',
        amount: tx.amount,
        currency: tx.currency,
        timestamp: tx.timestamp,
        sender: tx.sender,
        recipient: tx.recipient,
        reason: tx.reason || 'Payment received'
      })),
      ...paidInvoices.map(invoice => ({
        ...invoice,
        type: 'invoice',
        amount: invoice.invoice.amount,
        currency: invoice.invoice.currency,
        timestamp: invoice.timestamp,
        sender: invoice.invoice.payer,
        recipient: invoice.invoice.payee,
        reason: invoice.contentData?.reason || 'Invoice payment received'
      }))
    ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: allInflows
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