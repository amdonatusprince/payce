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
    const collection = db.collection("invoices");

    // Get pending invoices (outstanding) where user is payer or payee
    const outstandingResult = await collection
      .find({ 
        status: "pending",
        $or: [
          { "invoice.payer": address },
          { "invoice.payee": address }
        ]
      })
      .toArray();

    // Get paid invoices where user is payer
    const paidResult = await collection
      .find({ 
        status: "paid",
        $or: [
          { "invoice.payer": address }
        ]
      })
      .toArray();

    // Get overdue invoices (pending and past due date) where user is payer or payee
    const currentDate = new Date().toISOString();
    const overdueResult = await collection
      .find({
        status: "pending",
        "invoice.dueDate": { $lt: currentDate },
        $or: [
          { "invoice.payer": address },
          { "invoice.payee": address }
        ]
      })
      .toArray();

    // Calculate totals
    const outstandingTotal = outstandingResult.reduce(
      (sum, invoice) => sum + (Number(invoice.invoice?.amount) || 0),
      0
    );

    const paidTotal = paidResult.reduce(
      (sum, invoice) => sum + (Number(invoice.invoice?.amount) || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        outstanding: {
          amount: outstandingTotal,
          count: outstandingResult.length
        },
        paid: {
          amount: paidTotal,
          count: paidResult.length
        },
        overdue: {
          count: overdueResult.length
        }
      },
    //   debug: { allInvoices } 
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching invoice stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}