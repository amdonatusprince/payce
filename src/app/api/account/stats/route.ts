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

    // Get all completed transactions
    const [inflows, outflows, pendingInflows, pendingOutflows] = await Promise.all([
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
      ]),
      // Pending Inflows (pending invoices where user is payee)
      invoicesCollection
        .find({ 
          status: "pending",
          payeeAddress: address 
        })
        .toArray(),
      // Pending Outflows (pending invoices where user is payer)
      invoicesCollection
        .find({ 
          status: "pending",
          payerAddress: address 
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

    const pendingInflowTotal = pendingInflows.reduce(
      (sum, invoice) => sum + (Number(invoice.expectedAmount) || 0), 
      0
    );

    const pendingOutflowTotal = pendingOutflows.reduce(
      (sum, invoice) => sum + (Number(invoice.expectedAmount) || 0), 
      0
    );

    const netChange = inflowTotal - outflowTotal;

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
        netChange: {
          amount: netChange,
          isPositive: netChange >= 0
        },
        pendingInflow: {
          total: pendingInflowTotal,
          count: pendingInflows.length
        },
        pendingOutflow: {
          total: pendingOutflowTotal,
          count: pendingOutflows.length
        }
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching account stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 