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
    const db = client.db(process.env.MONGODB_DB);
    const transactionsCollection = db.collection("transactions");
    const invoicesCollection = db.collection("invoices");

    // Get all transactions
    const [inflows, outflows] = await Promise.all([
      // Inflows (received payments + paid invoices where user is payee)
      Promise.all([
        transactionsCollection
          .find({ recipient: address })
          .toArray(),
        invoicesCollection
          .find({ 
            status: "paid",
            payeeAddress: address 
          })
          .toArray()
      ]),
      // Outflows (sent payments + paid invoices where user is payer)
      Promise.all([
        transactionsCollection
          .find({ sender: address })
          .toArray(),
        invoicesCollection
          .find({ 
            status: "paid",
            payerAddress: address 
          })
          .toArray()
      ])
    ]);

    // Get pending and overdue invoices
    const currentDate = new Date().toISOString();
    const [pendingInvoices, overdueInvoices] = await Promise.all([
      // Pending invoices (user is either payer or payee)
      invoicesCollection
        .find({ 
          status: "pending",
          $or: [
            { payerAddress: address },
            { payeeAddress: address }
          ]
        })
        .toArray(),
      // Overdue invoices (pending and past due date)
      invoicesCollection
        .find({
          status: "pending",
          dueDate: { $lt: currentDate },
          $or: [
            { payerAddress: address },
            { payeeAddress: address }
          ]
        })
        .toArray()
    ]);

    // Calculate totals
    const inflowTotal = [
      ...inflows[0].map(tx => Number(tx.amount) || 0),
      ...inflows[1].map(invoice => Number(invoice.expectedAmount) || 0)
    ].reduce((sum, amount) => sum + amount, 0);

    const outflowTotal = [
      ...outflows[0].map(tx => Number(tx.amount) || 0),
      ...outflows[1].map(invoice => Number(invoice.expectedAmount) || 0)
    ].reduce((sum, amount) => sum + amount, 0);

    // Get recent inflow transactions
    const recentInflows = [...inflows[0], ...inflows[1]]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5)
      .map(tx => ({
        ...tx,
        type: 'contentData' in tx ? 'invoice' : 'payment',
        amount: tx.expectedAmount || tx.amount,
        currency: tx.currency?.value || tx.currency,
        sender: tx.payerAddress || tx.sender,
        recipient: tx.payeeAddress || tx.recipient,
        timestamp: new Date(tx.createdAt).getTime()
      }));

    return NextResponse.json({
      success: true,
      stats: {
        inflow: {
          total: inflowTotal,
          count: inflows[0].length + inflows[1].length
        },
        outflow: {
          total: outflowTotal,
          count: outflows[0].length + outflows[1].length
        },
        pendingInvoices: {
          count: pendingInvoices.length,
          amount: pendingInvoices.reduce((sum, invoice) => 
            sum + (Number(invoice.expectedAmount) || 0), 0
          )
        },
        overdueInvoices: {
          count: overdueInvoices.length,
          amount: overdueInvoices.reduce((sum, invoice) => 
            sum + (Number(invoice.expectedAmount) || 0), 0
          )
        }
      },
      recentInflows: recentInflows
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