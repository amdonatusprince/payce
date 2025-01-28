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
      // Search for address in both payer and payee fields without case sensitivity
      query.$or = [
        { 'invoice.payer': { $regex: new RegExp(address, 'i') } },
        { 'invoice.payee': { $regex: new RegExp(address, 'i') } }
      ];
    }

    // Get total count for pagination
    const total = await db.collection('invoices').countDocuments(query);

    const invoices = await db.collection('invoices')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        _id: 1,
        version: 1,
        timestamp: 1,
        network: 1,
        invoice: 1,
        metadata: 1,
        contentData: 1,
        transactionId: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: invoices,
      total,
      page,
      limit
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching invoices' 
    }, { status: 500 });
  }
} 