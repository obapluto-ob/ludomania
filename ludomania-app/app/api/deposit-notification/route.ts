import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { username, userId, amount, mpesaNumber, mpesaName, proofUrl } = await request.json();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: '💰 NEW DEPOSIT REQUEST - Ludomania',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #16a34a; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">💰 New Deposit Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">M-Pesa Deposit Pending Approval</p>
          </div>

          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #16a34a; margin-top: 0;">User Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">Username:</td>
                <td style="padding: 12px 0; color: #1f2937;">${username}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">User ID:</td>
                <td style="padding: 12px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${userId}</td>
              </tr>
            </table>

            <h2 style="color: #16a34a; margin-top: 30px;">Deposit Information</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">Amount:</td>
                <td style="padding: 12px 0; color: #16a34a; font-size: 24px; font-weight: bold;">KSh ${amount}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">M-Pesa Number:</td>
                <td style="padding: 12px 0; color: #1f2937; font-family: monospace;">${mpesaNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">M-Pesa Name:</td>
                <td style="padding: 12px 0; color: #1f2937;">${mpesaName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">Proof/Code:</td>
                <td style="padding: 12px 0; color: #1f2937; word-break: break-all;">
                  ${proofUrl.startsWith('http') ? `<a href="${proofUrl}" style="color: #2563eb;">View Screenshot</a>` : proofUrl}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #374151;">Submitted:</td>
                <td style="padding: 12px 0; color: #1f2937;">${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })} (EAT)</td>
              </tr>
            </table>

            <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Action Required:</strong> Please verify the M-Pesa transaction and approve/reject this deposit request.
              </p>
            </div>

            <h2 style="color: #16a34a; margin-top: 30px;">How to Approve:</h2>
            <ol style="color: #374151; line-height: 1.8;">
              <li>Verify the M-Pesa transaction on your phone</li>
              <li>Go to Supabase Dashboard → Table Editor → transactions</li>
              <li>Find this transaction (User: ${username}, Amount: KSh ${amount})</li>
              <li>Change status from "pending" to "approved"</li>
              <li>Go to profiles table</li>
              <li>Update ${username}'s wallet_balance by adding KSh ${amount}</li>
            </ol>

            <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>📊 Quick Links:</strong><br>
                Supabase: <a href="https://supabase.com/dashboard/project/lywtrjlmyojvklqpfmvf/editor" style="color: #2563eb;">Open Dashboard</a>
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>Ludomania Admin System | ${new Date().getFullYear()}</p>
            <p>This is an automated notification</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending deposit notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}

