import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.NEXT_PUBLIC_SMTP_HOST,
  port: Number(process.env.NEXT_PUBLIC_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.NEXT_PUBLIC_SMTP_USER,
    pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
  },
});

interface PaymentNotificationParams {
  to: string;
  type: 'sent' | 'received';
  amount: string;
  currency: string;
  senderAddress: string;
  recipientAddress: string;
  explorerUrl: string;
  network: string;
  transactionId: string;
}

export async function sendPaymentNotification({
  to,
  type,
  amount,
  currency,
  senderAddress,
  recipientAddress,
  explorerUrl,
  network,
  transactionId
}: PaymentNotificationParams) {
  const isSender = type === 'sent';
  
  const html = `
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

  await transporter.sendMail({
    from: `"Payce" <${process.env.NEXT_PUBLIC_SMTP_FROM}>`,
    to,
    subject: `Payment ${isSender ? 'Sent' : 'Received'}: ${amount} ${currency}`,
    html,
  });
}

interface InvoiceNotificationParams {
  to: string;
  type: 'business' | 'client';
  amount: string;
  currency: string;
  dueDate: string;
  network: string;
  transactionId: string;
  businessName: string;
  clientName: string;
  items: Array<{ description: string; amount: number; }>;
}

export async function sendInvoiceNotification({
  to,
  type,
  amount,
  currency,
  dueDate,
  network,
  transactionId,
  businessName,
  clientName,
  items
}: InvoiceNotificationParams) {
  const isBusinessEmail = type === 'business';
  
  const html = `
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
        ${items.map(item => `
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>${item.description}</span>
            <span>${item.amount} ${currency}</span>
          </div>
        `).join('')}
      </div>

      <p>Transaction ID: ${transactionId}</p>
      
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from Payce.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Payce" <${process.env.NEXT_PUBLIC_SMTP_FROM}>`,
    to,
    subject: `Invoice ${isBusinessEmail ? 'Created' : 'Received'}: ${amount} ${currency}`,
    html,
  });
} 