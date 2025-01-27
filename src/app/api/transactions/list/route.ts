import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const address = url.searchParams.get('address');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;
    if (address) {
      query.$or = [
        { 'transaction.payer': { $regex: new RegExp(address, 'i') } },
        // { 'transaction.payee': { $regex: new RegExp(address, 'i') } }
      ];
    }

    const total = await db.collection('transactions').countDocuments(query);
    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: transactions,
      total,
      page,
      limit
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching transactions' 
    }, { status: 500 });
  }
} 