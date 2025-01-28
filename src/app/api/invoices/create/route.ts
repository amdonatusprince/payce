import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { nanoid } from 'nanoid';
import { InvoiceData, InvoiceDocument } from '@/models/invoice';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const invoiceData: InvoiceData = await req.json();
    
    // Generate a unique ID and format it
    const rawId = nanoid(24).replace(/_|-/g, '');
    const transactionId = `payce${rawId}`;

    const invoice: Omit<InvoiceDocument, '_id'> = {
      ...invoiceData,
      transactionId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('invoices').insertOne(invoice);

    return NextResponse.json({
      success: true,
      transactionId,
      invoiceId: result.insertedId,
    }, { status: 201 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error creating invoice' 
    }, { status: 500 });
  }
} 