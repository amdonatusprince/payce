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
    const collection = db.collection("transactions");

    // Get latest inflow transactions
    const transactions = await collection
      .find({ recipient: address })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: transactions
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