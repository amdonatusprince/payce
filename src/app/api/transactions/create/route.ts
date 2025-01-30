import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { nanoid } from 'nanoid';
import { sendPaymentNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const paymentData = await req.json();
    
    // Generate a unique ID and format it
    const rawId = nanoid(24).replace(/_|-/g, '');
    const transactionId = `payce${rawId}`;

    const transaction = {
      ...paymentData,
      recipientEmail: paymentData.recipientEmail || null,
      transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('transactions').insertOne(transaction);

    return NextResponse.json({
      success: true,
      transactionId,
      _id: result.insertedId,
    }, { status: 201 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error creating transaction record' 
    }, { status: 500 });
  }
} 