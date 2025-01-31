import { NextRequest, NextResponse } from 'next/server';
import { createTransport } from 'nodemailer';

const transporter = createTransport({
    host: process.env.NEXT_PUBLIC_SMTP_HOST,
    port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
    secure: false, 
    auth: {
      user: process.env.NEXT_PUBLIC_SMTP_USER,
      pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
    },
  });

export async function POST(req: NextRequest) {
  try {
    const { to, type, amount, currency, senderAddress, recipientAddress, explorerUrl, network, transactionId, 
      // For invoices
      businessName, clientName, items, dueDate } = await req.json();
    
    let html = '';
    let subject = '';

    // Handle invoice creation emails
    if (type === 'business' || type === 'client') {
      const isBusinessEmail = type === 'business';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice ${isBusinessEmail ? 'Created' : 'Received'} 📋</h2>
          <p>${isBusinessEmail 
            ? `You've created an invoice for ${clientName}`
            : `You've received an invoice from ${businessName}`
          }</p>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin-top: 0;">Invoice Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Amount:</strong> ${amount} ${currency}</li>
              <li><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</li>
              <li><strong>Network:</strong> ${network}</li>
            </ul>

            <h4>Items</h4>
            ${items.map((item: any) => `
              <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span>${item.description}</span>
                <span>${item.amount} ${currency}</span>
              </div>
            `).join('')}
          </div>

          <p>Transaction ID: ${transactionId}</p>
        </div>
      `;
      subject = `Invoice ${isBusinessEmail ? 'Created' : 'Received'}: ${amount} ${currency}`;
    }
    // Handle payment emails
    else if (type === 'sent' || type === 'received') {
      const isSender = type === 'sent';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment ${isSender ? 'Sent' : 'Received'} Successfully! 🎉</h2>
          <p>Your payment has been ${isSender ? 'sent' : 'received'} successfully.</p>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <ul style="list-style: none; padding: 0;">
              <li><strong>Amount:</strong> ${amount} ${currency}</li>
              <li><strong>Network:</strong> ${network}</li>
              <li><strong>${isSender ? 'To' : 'From'}:</strong> ${isSender ? recipientAddress : senderAddress}</li>
            </ul>
          </div>

          <p>
            <a href="${explorerUrl}" style="color: #4F46E5; text-decoration: none;">
              View transaction on explorer →
            </a>
          </p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Transaction ID: ${transactionId}<br>
            This is an automated notification from Payce.
          </p>
        </div>
      `;
      subject = `Payment ${isSender ? 'Sent' : 'Received'}: ${amount} ${currency}`;
    }

    console.log('Sending email with config:', {
      host: process.env.NEXT_PUBLIC_SMTP_HOST,
      port: process.env.NEXT_PUBLIC_SMTP_PORT,
      to,
      from: process.env.NEXT_PUBLIC_SMTP_FROM
    });

    await transporter.sendMail({
      from: `"Payce" <${process.env.NEXT_PUBLIC_SMTP_FROM}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 