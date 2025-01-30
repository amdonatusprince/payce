import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const address = searchParams.get('address');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("payce");
    const collection = db.collection("invoices");

    // Get total count for both sent and received invoices
    const total = await collection.countDocuments({
      $or: [
        { payerAddress: address },
        { payeeAddress: address }
      ],
      'contentData.transactionType': 'invoice'
    });

    // Get invoices where user is either payer or payee
    const invoices = await collection
      .find({ 
        $or: [
          { payerAddress: address },
          { payeeAddress: address }
        ],
        'contentData.transactionType': 'invoice'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedInvoices = invoices.map(invoice => ({
      _id: invoice._id,
      timestamp: new Date(invoice.createdAt).getTime(),
      transactionId: invoice.transactionId,
      network: invoice.currency.network,
      invoice: {
        payer: invoice.payerAddress,
        payee: invoice.payeeAddress,
        amount: invoice.expectedAmount,
        currency: invoice.currency.value,
        dueDate: invoice.dueDate,
        reason: invoice.reason
      },
      contentData: invoice.contentData,
      status: invoice.status,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      type: address === invoice.payerAddress ? 'sent' : 'received'  // Add type to indicate if sent or received
    }));

    return NextResponse.json({
      success: true,
      data: formattedInvoices,
      total,
      metadata: {
        sent: formattedInvoices.filter(inv => inv.type === 'sent').length,
        received: formattedInvoices.filter(inv => inv.type === 'received').length
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching created invoices',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 