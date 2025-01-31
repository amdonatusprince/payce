import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, status, explorerUrl } = body;

    if (!transactionId || !status) {
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction ID and status are required' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("invoices");

    const result = await collection.updateOne(
      { transactionId: transactionId },
      { 
        $set: { 
          status: status,
          paidAt: new Date(),
          explorerUrl: explorerUrl
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invoice not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice status updated successfully' 
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error updating invoice status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 