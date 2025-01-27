import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("payce");
    const invoicesCollection = db.collection("invoices");
    const transactionsCollection = db.collection("transactions");

    // Get pending invoices
    const pendingInvoices = await invoicesCollection
      .find({ 
        status: "pending",
        $or: [
          { "invoice.payer": address },
          { "invoice.payee": address }
        ]
      })
      .toArray();

    // Get overdue invoices
    const currentDate = new Date().toISOString();
    const overdueInvoices = await invoicesCollection
      .find({
        status: "pending",
        "invoice.dueDate": { $lt: currentDate },
        $or: [
          { "invoice.payer": address },
          { "invoice.payee": address }
        ]
      })
      .toArray();

    // Get inflow transactions (where user is recipient)
    const inflowTransactions = await transactionsCollection
      .find({ recipient: address })
      .toArray();

    // Get outflow transactions (where user is sender)
    const outflowTransactions = await transactionsCollection
      .find({ sender: address })
      .toArray();

    // Calculate totals
    const inflowTotal = inflowTransactions.reduce(
      (sum, tx) => sum + (Number(tx.amount) || 0),
      0
    );

    const outflowTotal = outflowTransactions.reduce(
      (sum, tx) => sum + (Number(tx.amount) || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        pendingInvoices: {
          count: pendingInvoices.length
        },
        overdueInvoices: {
          count: overdueInvoices.length
        },
        inflow: {
          total: inflowTotal,
          count: inflowTransactions.length
        },
        outflow: {
          total: outflowTotal,
          count: outflowTransactions.length
        }
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 